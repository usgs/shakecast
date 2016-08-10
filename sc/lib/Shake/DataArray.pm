package DataArray;

#	@(#)DataArray.pm	1.12	12/20/05	TriNet
# $Id: DataArray.pm 64 2007-06-05 14:58:38Z klin $

use strict;
use Carp;
use XML::Parser;
use XML::Writer;
use IO::File;

use Shake::Source;
use Shake::Station;

use enum qw( EVENT SARRAY SHASH PARSE WRITER );

########################################################################
#  Internal Data Structure:
#    $obj = [ Source object,
#             array of Station objects,
#             hash of Station objects,
#             temporary space in the object used to parse XML input
#           ];
########################################################################

sub new {
  my $class = shift;
  my @args  = @_;
  my($file);

  my $self = [];
  bless $self, $class;

  # handle input parameters
  $self->[EVENT]  = undef;
  $self->[SARRAY] = [];
  $self->[SHASH]  = {};
  $self->[PARSE]  = {};
  foreach $file (@args) {
    $self->parse($file);
  }

  return($self);
}

#####################################
# Accessors
#####################################

sub source {
  my $self = shift;

  if (@_) {
    croak "Argument must be of type Source" if ref $_[0] ne "Source";

    $self->[EVENT] = shift;
  }

  return $self->[EVENT];
}

#
# Note: stations are loaded by reference to an array of Station objects
#
sub stations {
    my $self = shift;

    if (@_) {
	my($val,$ref);
	
	$val = shift;
	croak "Argument must be an array reference" if ref $val ne "ARRAY";
	
	foreach $ref (@$val) {
	    croak "Array elements must be Station refs" 
		if ref $ref ne "Station";
	}
	$self->[SARRAY] = $val;
	$self->[SHASH]  = {};
	foreach $ref (@$val) {
	  $self->[SHASH]->{$ref->code()} = $ref;
        }
    }
    return $self->[SARRAY];
}

#
# Note: stations are loaded by reference to a hash of Station objects
#
sub station_hash {
  my $self = shift;

  if (@_) {
    my ($val, $key);
	
    $val = shift;
    croak "Argument must be a hash reference" if ref $val ne "HASH";
	
    foreach $key ( keys %$val ) {
      croak "Hash elements must be Station refs" 
      		if ref $val->{$key} ne "Station";
    }
    $self->[SHASH]  = $val;
    $self->[SARRAY] = [];
    foreach $key ( keys %$val ) {
      push @{$self->[SARRAY]}, $val->{$key};
    }
  }
  return $self->[SHASH];
}

############################################################################
# output XML file of stations in the array
############################################################################

sub writeXML {

  my $self   = shift;
  my $fh     = shift;
  my $pac    = shift;
  my $stadtd = shift;
  my $eqdtd  = shift;
  my $src    = $self->source;
  my ($stafh, $eqfh);
  my (@chans, $first_pass, $val, $flag);

  if (not defined $fh or not defined $pac) {
    carp "DataArray::writeXML: requires arg <filehandle> <number format>";
    return undef;
  }
  if (defined $stadtd) {
    $stafh = new IO::File($stadtd);
    if (not defined $stafh) {
      carp "DataArray::writeXML: Couldn't open $stadtd\n";
      return undef;
    }
  }
  if (defined $src and defined $eqdtd) {
    $eqfh = new IO::File($eqdtd);
    if (not defined $eqfh) {
      carp "DataArray::writeXML: Couldn't open $eqdtd\n";
      $stafh->close;
      return undef;
    }
  }
  my $wr = $self->[WRITER] = new XML::Writer(OUTPUT => $fh, NEWLINES => 0);

  #----------------------------------------------------------------------
  # Start the document with the XML declaration, and add the
  # document type declaration just in case anyone cares; also
  # print the root element
  #----------------------------------------------------------------------
  print $fh '<?xml version="1.0" encoding="US-ASCII" standalone="yes"?>', "\n";
  if (defined $stafh and defined $src) {
    print $fh '<!DOCTYPE shakemap-data [', "\n";
    print $fh "<!ELEMENT shakemap-data (earthquake,stationlist)>\n";
    print {$fh} <$stafh>;
    print {$fh} <$eqfh> if defined $eqfh;
    $eqfh->close;
    $stafh->close;
    print $fh ']>', "\n";
    $wr->startTag("shakemap-data", "code_version", $main::shakemap_version, 
                                   "map_version", $main::map_version);
    $wr->characters("\n");
    if (defined $src->peak('pga')
     || defined $src->peak('pgv')
     || defined $src->peak('psa03')
     || defined $src->peak('psa10')
     || defined $src->peak('psa30')) {
      my $a;
      my @rec = ( "id"        => $src->id,
                  "lat"       => $src->lat,
                  "lon"       => $src->lon,
                  "mag"       => $src->mag,
                  "year"      => $src->year,
                  "month"     => $src->month,
                  "day"       => $src->day,
                  "hour"      => $src->hour,
                  "minute"    => $src->minute,
                  "second"    => $src->second,
                  "timezone"  => $src->timezone,
                  "depth"     => $src->depth,
                  "locstring" => $src->locstring,
                  "created"   => time
                );
      push @rec, "pga",  fmt($pac, defined ($a = $src->peak('pga'))   ? $a : 0);
      push @rec, "pgv",  fmt($pac, defined ($a = $src->peak('pgv'))   ? $a : 0);
      push @rec, "sp03", fmt($pac, defined ($a = $src->peak('psa03')) ? $a : 0);
      push @rec, "sp10", fmt($pac, defined ($a = $src->peak('psa10')) ? $a : 0);
      push @rec, "sp30", fmt($pac, defined ($a = $src->peak('psa30')) ? $a : 0);
      $wr->emptyTag("earthquake", @rec);
    } else {
      $wr->emptyTag("earthquake", "id"        => $src->id,
                                  "lat"       => $src->lat,
                                  "lon"       => $src->lon,
                                  "mag"       => $src->mag,
                                  "year"      => $src->year,
                                  "month"     => $src->month,
                                  "day"       => $src->day,
                                  "hour"      => $src->hour,
                                  "minute"    => $src->minute,
                                  "second"    => $src->second,
                                  "timezone"  => $src->timezone,
                                  "depth"     => $src->depth,
                                  "locstring" => $src->locstring,
                                  "created"   => time
                                  );
    }
    $wr->characters("\n");
  } elsif (defined $stafh) {
    print $fh '<!DOCTYPE stationlist [', "\n";
    print {$fh} <$stafh>;
    $stafh->close;
    print $fh ']>', "\n";
  }
  $wr->startTag("stationlist", "created" => time);
  $wr->characters("\n");

  foreach my $sta ( @{$self->[SARRAY]} ) {
    @chans = $sta->channels();
    $first_pass = 1;
    foreach my $chan ( @chans ) {
      if ($first_pass) {
        $self->new_station($sta);
        $first_pass = 0;
      }
      $self->new_comp($chan, $sta->orig_comp_name($chan));
      foreach my $param ( qw{ acc vel psa03 psa10 psa30 } ) {
	$flag = 0 if not defined ($flag = $sta->get_flag($param, $chan));
        $self->write_amp($param, fmt($pac, $val), $flag)
                                if defined ($val = $sta->amp($param, $chan));
      }
      $self->end_comp();
    }
    $self->end_sta();
  }
  $wr->characters("\n");
  $wr->endTag("stationlist");
  if (defined $stafh and defined $eqfh) {
    $wr->characters("\n");
    $wr->endTag("shakemap-data");
  }
  $wr->end();

  return 1;
}

sub new_station {

  my $self = shift;
  my $sta  = shift;

  if (not defined $sta) {
    carp "DataArray::new_station: Station object required as argument";
    return 1;
  }
  my $lat    = $sta->lat();
  my $lon    = $sta->lon();
  my $loc    = $sta->loc();
  my $code   = $sta->code();
  my $name   = $sta->name();
  my $inst   = $sta->inst_type();
  my $agency = $sta->agency();
  my $netid  = $sta->netid();
  my $tele   = $sta->comm_type();
  my $dist   = $sta->dist();

  my @aarg = ( "code"     => $code,
               "name"     => $name,
               "insttype" => $inst,
               "lat"      => $lat,
               "lon"      => $lon,
               "dist"     => $dist,
               "source"   => $agency,
               "netid"    => $netid,
               "commtype" => $tele 
	     );
  push(@aarg, "loc", $loc) if defined $loc;
  $self->[WRITER]->startTag("station", @aarg);
  $self->[WRITER]->characters("\n");
  return 0;
}

sub end_sta {
 
  my $self = shift;

  $self->[WRITER]->endTag("station");
  $self->[WRITER]->characters("\n");
  return 0;
}

sub new_comp {

  my $self = shift;
  my $comp = shift;
  my $origcomp = shift;

  my @args = ("name" => $comp);

  if (defined $origcomp) {
    push(@args,"originalname" => $origcomp);
  }

  $self->[WRITER]->startTag("comp", @args);
  $self->[WRITER]->characters("\n");
  return 0;
}

sub end_comp {

  my $self = shift;

  $self->[WRITER]->endTag("comp");
  $self->[WRITER]->characters("\n");
  return 0;
}

sub write_amp {

  my $self = shift;
  my $type = shift;
  my ($amp, $flag) = @_;

  if (not defined $type) {
    carp "DataArray::write_amp: type must be specified";
    return 1;
  }
  if (not defined $amp) {
    carp "DataArray::write_amp: amp must be specified";
    return 1;
  }

  my @args = ("$type", "value", "$amp");

  push(@args, "flag", "$flag") if defined $flag;

  $self->[WRITER]->emptyTag(@args);
  $self->[WRITER]->characters("\n");
  return 0;
}

########################################################################
# sub fmt( <value> )
# Output a string equal to the argument formatted with the $pac format
########################################################################
sub fmt {
  my $pac = shift;

  return sprintf "$pac", shift;
}

##############################################
# Fetch sorted versions of the station arrays
# - 
##############################################

# sorted by string comparison
sub stations_by {
  my $self = shift;
  my $key  = shift;
  my @args = @_;
  my($stations,@sorted_stations);

  $stations = $self->[SARRAY];

  @sorted_stations = sort { $a->$key(@args) cmp $b->$key(@args) } (@$stations);

  return(\@sorted_stations);
}

# sorted by numerical comparison
sub stations_numerically_by {
  my $self = shift;
  my $key  = shift;
  my @args = @_;
  my($stations,@sorted_stations);

  $stations = $self->[SARRAY];

  @sorted_stations = sort { $a->$key(@args) <=> $b->$key(@args) } (@$stations);

  return(\@sorted_stations);
}



############################################################################
# Parse an XML stationlist file as input to the object
# - parsing handled by the XML::Parser package
# - the existing Source object, if any, will be overwritten during parsing
# - existing Station objects in the DataArray container will be kept during
#   parsing.  New objects will be appended to the Station array
############################################################################

my @HANDLED_TAGS = ('earthquake','stationlist','station');

sub parse {
  my $self = shift;
  my $file = shift;
  
  $self->[PARSE]{'curr_sta'}  = undef;
  $self->[PARSE]{'curr_comp'} = undef;
  
  my $p1 = new XML::Parser(Handlers => $self->handlers());
  
  $p1->parsefile($file);
}

sub handlers {
  my $self = shift;

  my $handlers = {Start => sub {
		    my $expat = shift;
		    my $etype = shift;
		    my %attrib = @_;
		    
		    if (grep($etype eq $_ ,@HANDLED_TAGS)) {
		      my $func = $etype . "_start";
		      no strict;
		      $self->$func($expat,$etype,%attrib);
		    }
		    
		    return();
		  },
		  End   => sub {
		    my $expat = shift;
		    my $etype = shift;
		    
		    if (grep($etype eq $_ ,@HANDLED_TAGS)) {
		      my $func = $etype . "_end";
		      no strict;
		      $self->$func($expat,$etype);
		    }
		    
		    return();
		  }
		 };
  
  return $handlers;
}



sub earthquake_start {
  my $self  = shift;
  my $expat = shift;
  my $etype = shift;
  my %att   = @_;

  $self->[EVENT] = new Source($expat, \%att, $self);

  return;
}

sub earthquake_end {
  my $self = shift;
  my $expat  = shift;
  my $etype  = shift;  # element type
  
  $expat->setHandlers( %{$self->handlers()} );
}

sub stationlist_start {
    # nothing to do, unless stationlist 'created' attribute
    return;
}

sub stationlist_end {
  # list should be complete
  return;
}

sub  station_start {
  my $self   = shift;
  my $expat  = shift;
  my $etype  = shift;  # element type
  my %att    = @_;
  
  $self->[PARSE]{'curr_sta'} = Station->new($expat, \%att, $self);

  return;
}

sub station_end {
  my $self = shift;
  my $expat  = shift;
  my $etype  = shift;  # element type
  my $sta;
  
  $expat->setHandlers( %{$self->handlers()} );

  push(@{$self->[SARRAY]},$sta = $self->[PARSE]{'curr_sta'});
  $self->[SHASH]->{$sta->code()} = $sta;
  return;
}

1;
