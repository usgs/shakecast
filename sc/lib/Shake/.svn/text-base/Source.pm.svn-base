package Source;

#       @(#)Source.pm	1.11     01/22/02
# $Id: Source.pm 64 2007-06-05 14:58:38Z klin $

use strict;
use Carp;

use XML::Parser;
use enum qw( EID STRING YEAR MON DAY HOUR MINUTE SEC TIMEZONE
	     LAT LON DEPTH TYPE MAG PGA PGV PSA03 PSA10 PSA30 );

###########################################################################
#=head1
#
# Source
#
# Purpose:
#   Maintain a seismic source data structure
#
# External Interface:
#   Constructors:
#   Default constructor, all object elements set to 'undef':
#     $obj = Source->new();         
#   Here we build the Source object by parsing an XML file:
#     $obj = Source->new($xmlfile); 
#   This version of the constructor is used when the Source object is part 
#   of another object that is parsing XML that has 'earthquake' tags:
#     $obj = Source->new($expat, $attr, $parent); 
#
#   Accessors:
#     The following functions return a scalar value, and take an optional
#     argument that is assigned as the value of the object element.
#
#     Source descriptors:
#       <string> = $obj->id( <string> );
#       <string> = $obj->locstring( <string> );
#       <float>  = $obj->lat( <float> );
#       <float>  = $obj->lon( <float> );
#       <float>  = $obj->mag( <float> );
#       <int>    = $obj->year( <int> );
#       <int>    = $obj->month( <int> );
#       <int>    = $obj->day( <int> );
#       <int>    = $obj->hour( <int> );
#       <int>    = $obj->minute( <int> );
#       <int>    = $obj->second( <int> );
#       <float>  = $obj->depth( <float> );
#       <string> = $obj->type( <string> );      # NEW, See below
#       <string> = $obj->timezone( <string> );
#     Peak amplitudes at the source, if known:
#       <float>  = $obj->pga( [<float>] );
#       <float>  = $obj->pgv( [<float>] );
#       <float>  = $obj->psa03( [<float>] );
#       <float>  = $obj->psa10( [<float>] );
#       <float>  = $obj->psa30( [<float>] );
#       <float>  = $obj->amp( $type, [<float>] );
#       <float>  = $obj->peak( $type, [<float>] );
#
#     The following function returns a scalar value, but the value
#     cannot be set through it
#       <string> = $obj->datetime();
#
# Internal Data Structure:
#   $obj = [ eventid, location_string, datetime, 
#            lat, lon, depth, type, mag, 
#            PGA at source, 
#	     PGV at source, 
#	     PSA03 at source, 
#	     PSA10 at source, 
#	     PSA30 at source
#          ];
#
# Note: The 'type' parameter is currently used by the Youngs97 regression only.
# Other regressions ignore this. Valid values are 'interface' and 'interslab'. 
#
###########################################################################

sub new {
  my $class  = shift;
  my $expat  = shift;
  my $attr   = shift;
  my $parent = shift;
  my $file;

  if (defined $expat && !defined $attr && !defined $parent) {
    $file = $expat;
  } elsif (defined $expat && (!defined $attr || !defined $parent)) {
    carp "Source::new: Non-default constructor expects 3 args: expat, "
       . "attr, parent";
    return undef;
  }
  
  my $self = [];

  bless $self, $class;

  $self->[EID]      = undef;
  $self->[STRING]   = undef;
  $self->[YEAR]     = undef;
  $self->[MON]      = undef;
  $self->[DAY]      = undef;
  $self->[HOUR]     = undef;
  $self->[MINUTE]   = undef;
  $self->[SEC]      = undef;
  $self->[LAT]      = undef;
  $self->[LON]      = undef;
  $self->[DEPTH]    = undef;
  $self->[TYPE]    = undef;
  $self->[MAG]      = undef;
  $self->[PGA]      = undef;
  $self->[PGV]      = undef;
  $self->[PSA03]    = undef;
  $self->[PSA10]    = undef;
  $self->[PSA30]    = undef;

  return $self if (!defined $expat);

  if (defined $file) {
    if (!-e $file) {
      carp "Source::new: can't find xml file '$file'";
      return undef;
    }
    $self->parse($file);
    return $self;
  }

  #----------------------------------------------------------------------
  # At this point we know that we are part of another object that
  # is parsing XML that has 'earthquake' tags...
  #----------------------------------------------------------------------
  $self->setAttrs($attr);

  #----------------------------------------------------------------------
  # Here we would set handlers if there were any tags to parse...
  # (see Station.pm new() for example)
  #----------------------------------------------------------------------

  return($self);
}

sub copy {
  my $self  = shift;
  
  my $src = [];

  bless $src, ref($self) || $self;

  for(my $idx = 0; $idx < @$self; $idx++) {
    $src->[$idx] = $self->[$idx];
  }

  return $src;
}

sub setAttrs {

  my $this = shift;
  my $attr = shift;

  $this->id($attr->{'id'}) 			if defined $attr->{'id'};
  $this->mag($attr->{'mag'}) 			if defined $attr->{'mag'};
  $this->locstring($attr->{'locstring'}) 	if defined $attr->{'locstring'};
  $this->year($attr->{'year'}) 			if defined $attr->{'year'};
  $this->month($attr->{'month'}) 		if defined $attr->{'month'};
  $this->day($attr->{'day'}) 			if defined $attr->{'day'};
  $this->hour($attr->{'hour'}) 			if defined $attr->{'hour'};
  $this->minute($attr->{'minute'}) 		if defined $attr->{'minute'};
  $this->second($attr->{'second'}) 		if defined $attr->{'second'};
  $this->timezone($attr->{'timezone'})          if defined $attr->{'timezone'};
  $this->lat($attr->{'lat'}) 			if defined $attr->{'lat'};
  $this->lon($attr->{'lon'}) 			if defined $attr->{'lon'};
  $this->depth($attr->{'depth'})                if defined $attr->{'depth'};
  $this->type($attr->{'type'}) 			if defined $attr->{'type'};
  $this->amp('pga', $attr->{'pga'})		if defined $attr->{'pga'};
  $this->amp('pgv', $attr->{'pgv'}) 		if defined $attr->{'pgv'};
  $this->amp('psa03', $attr->{'psa03'})		if defined $attr->{'psa03'};
  $this->amp('psa10', $attr->{'psa10'})		if defined $attr->{'psa10'};
  $this->amp('psa30', $attr->{'psa30'})		if defined $attr->{'psa30'};
  return;
}

#####################################
# Accessors
#####################################

sub id {
  my $this = shift;

  $this->[EID] = shift if @_;

  return $this->[EID];
}

sub locstring {
    my $this = shift;

    @_ ? $this->[STRING] = shift : $this->[STRING];
}

sub year {
    my $this = shift;
    
    # handle years as 4-digit integers
    # Bug? non-numerical values, like $year = 'Rat' will produce 2000

    if (@_) {
	my $val = shift;

	$val = int($val + 0.5);

	# Y2K check and fix
	if ($val < 1000) {
	    if ($val < 70) {
		$val += 100;
	    }
	    $val += 1900;
	}
	
	$this->[YEAR] = $val;
    }

    return $this->[YEAR];
}

sub month {
    my $this = shift;

    # handle months as integers in range 1..12

    if (@_) {
	my $val = shift;

	if ($val < 1 or $val > 12) {
	    croak "invalid month value $val. Expect integer from 1 to 12";
	}

	$this->[MON] = $val;
    }

    return $this->[MON];
}

sub day {
    my $this = shift;

    # handle days as integers starting at 1

    if (@_) {
	my $val = shift;

	if ($val < 1 or $val > 31)  {
	    croak "invalid day value $val. Expect integer 1 to 31";
	}
	
	$this->[DAY] = $val;
    }

    return $this->[DAY];
}

sub hour {
    my $this = shift;

    if (@_) {
	my $val = shift;

	if ($val < 0 or $val > 23) {
	    croak "invalid hour value $val. Expect integer from 0 to 23";
	}
	$this->[HOUR] = $val;
    }

    return $this->[HOUR];
}

sub minute {
    my $this = shift;
    
    if (@_) {
	my $val = shift;

	if ($val < 0 or $val > 59) {
	    croak "invalid minute value $val. Expect integer from 0 to 59";
	}
	$this->[MINUTE] = $val;
    }

    return $this->[MINUTE];
}

sub second {
    my $this = shift;

    if (@_) {
	my $val = shift;

	# have to worry about leap seconds or anything weird like that?

	if ($val < 0 or $val > 59) {
	    croak "invalid second value $val. Expect integer from 0 to 59";
	}
	$this->[SEC] = $val;
    }

    return $this->[SEC];
}
    
sub timezone {
    my $this = shift;

    if (@_) {
	my $val = shift;

	$this->[TIMEZONE] = $val;
    }

    return $this->[TIMEZONE];
}
    
sub datetime {
    my $this = shift;

    if (@_) {
	croak "can't set date and time via this function.\nUse the year(),month(),...,second() functions instead";
    }

    my $format = "%02d/%02d/%4d, %02d:%02d:%02d";
    my $datetime = sprintf($format,$this->month(),$this->day(),$this->year(),
			   $this->hour(),$this->minute(),$this->second());

    return $datetime;
}

sub lat {
  my $this = shift;

  $this->[LAT] = shift if @_;

  return $this->[LAT];
}

sub lon {
  my $this = shift;

  $this->[LON] = shift if @_;

  return $this->[LON];
}

sub depth {
  my $this = shift;

  $this->[DEPTH] = shift if @_;

  return $this->[DEPTH];
}
sub type {
  my $this = shift;

  $this->[TYPE] = shift if @_;

  return $this->[TYPE];
}

sub mag {
  my $this = shift;

  $this->[MAG] = shift if @_;

  return $this->[MAG];
}

sub pga {
  my $this  = shift;
  my $value = shift;

  if (defined $value) {
    $this->[PGA] = $value;
    $this->[PGA] = undef if $value < 0;
  }

  return $this->[PGA];
}

sub pgv {
  my $this  = shift;
  my $value = shift;

  if (defined $value) {
    $this->[PGV] = $value;
    $this->[PGV] = undef if $value < 0;
  }

  return $this->[PGV];
}

sub psa03 {
  my $this  = shift;
  my $value = shift;

  if (defined $value) {
    $this->[PSA03] = $value;
    $this->[PSA03] = undef if $value < 0;
  }

  return $this->[PSA03];
}

sub psa10 {
  my $this  = shift;
  my $value = shift;

  if (defined $value) {
    $this->[PSA10] = $value;
    $this->[PSA10] = undef if $value < 0;
  }

  return $this->[PSA10];
}

sub psa30 {
  my $this  = shift;
  my $value = shift;

  if (defined $value) {
    $this->[PSA30] = $value;
    $this->[PSA30] = undef if $value < 0;
  }

  return $this->[PSA30];
}

sub peak {

  my $this = shift;
  my $type = shift;

  if ($type eq 'acc' or $type eq 'pga') {
    return $this->pga(@_);
  } elsif ($type eq 'vel' or $type eq 'pgv') {
    return $this->pgv(@_);
  } elsif ($type eq 'psa03') {
    return $this->psa03(@_);
  } elsif ($type eq 'psa10') {
    return $this->psa10(@_);
  } elsif ($type eq 'psa30') {
    return $this->psa30(@_);
  } else {
    return undef;
  }
}

sub amp {

  my $this = shift;

  return $this->peak(@_);
}

############################################################################
# Parse an XML earthquake file as input to the object
# - parsing handled by the XML::Parser package
# - the existing Source object, if any, will be overwritten during parsing
############################################################################

my @HANDLED_TAGS = ('earthquake');

sub parse {
  my $this = shift;
  my $file = shift;
  
  my $p1 = new XML::Parser(Handlers => $this->handlers());
  
  $p1->parsefile($file);
}

sub handlers {
  my $this = shift;

  my $handlers = {Start => sub {
		    my $expat = shift;
		    my $etype = shift;
		    my %attrib = @_;
		    
		    if (grep($etype eq $_ ,@HANDLED_TAGS)) {
		      my $func = $etype . "_start";
		      no strict;
		      $this->$func($expat,$etype,%attrib);
		    }
		    
		    return();
		  },
		  End   => sub {
		    my $expat = shift;
		    my $etype = shift;
		    
		    if (grep($etype eq $_ ,@HANDLED_TAGS)) {
		      my $func = $etype . "_end";
		      no strict;
		      $this->$func($expat,$etype);
		    }
		    
		    return();
		  }
		 };
  
  return $handlers;
}



sub earthquake_start {
  my $this  = shift;
  my $expat = shift;
  my $etype = shift;
  my %att   = @_;

  $this->setAttrs(\%att);
  return;
}

sub earthquake_end {
}


1;
