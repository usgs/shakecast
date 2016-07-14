package Station;

#       @(#)Station.pm	1.20     12/14/05     TriNet
# $Id: Station.pm 64 2007-06-05 14:58:38Z klin $

use strict;
use Carp;
use XML::Parser;
use enum qw( STACODE STANAME AGENCY NETID INST_TYPE COMM_TYPE 
	     LAT LON DIST LOC
	     T_AMPCORR E_AMPCORR 
	     ACC      VEL      PSA03       PSA10       PSA30
	     PGA      PGV      PPSA03      PPSA10      PPSA30
	     PGA_CHAN PGV_CHAN PPSA03_CHAN PPSA10_CHAN PPSA30_CHAN
	     ORIG_CHAN FLAG PARSE);

########################################################################
#=head1
#
# Station
#
# Purpose:
#   Maintain a seismic station data structure
#
# External Interface:
#   Constructors:
#     $obj = Station->new();		# all object elements set to 'undef'
#     $obj = Station->new($xmlfile);	# object parsed from file
#
#   Accessors:
#     The following functions return a scalar value, and take an optional
#     argument that is assigned as the value of the object element.
#
#     Station descriptors:
#       <string> = $obj->code( <string> );
#       <string> = $obj->name( <string> );
#       <string> = $obj->agency( <string> );
#       <string> = $obj->netid( <string> );
#       <string> = $obj->inst_type( <string> );
#       <string> = $obj->comm_type( <string> );
#       <float>  = $obj->lat( <float> );
#       <float>  = $obj->lon( <float> );
#       <float>  = $obj->dist( <float> );
#	<string> = $obj->loc( <string> );
#       <float>  = $obj->theoretical_ampcorr( $type [, <float> ] );
#       <float>  = $obj->empirical_ampcorr( $type, $channel [, <float> ] );
#     This function returns a list of channels (named according to SEED 
#     conventions) for which amplitudes of any type have been assigned:
#       <@chans> = $obj->channels();
#     This function returns a list of channels (SEED name conventions) 
#     for which amplitudes of type '$type' have been assigned:
#       <@chans> = $obj->channels( $type );
#
#     The amp() function requires arguments 'type' and 'channel'; where
#     type is one of 'acc', 'vel', psa03', 'psa10', 'psa30' and 
#     channel is a three character code that conforms to the SEED name 
#     convention; a final, optional, aargument is a floating-point
#     assignment valuea;
#	<float>  = $obj->amp( $type, $channel, [<float>] );
#
#     The peak() function returns the peak value for the specified
#     parameter but cannot be assigned to; the values are obtained
#     from assignments to amp(), above; the single argument, 'type',
#     is one of the types specified for the amp() function, above.
#       <float>  = $obj->peak( $type );
#
#     The mean() function returns the geometric mean of the horizontal
#     peak values for the specified parameter but otherwise works like
#     peak().
#       <float>  = $obj->mean( $type );
#
#     The peak_chan() function allows you to determine which channel 
#     has the peak value for a given type, where the argument 'type'
#     is one of the types specified for the amp() function, above.
#       <string> = $obj->peak_chan( $type );
#
#   Original Agency-specific Channel Names:
#     The accessors that take channel-name arguments expect names in the SEED
#     naming convention. If the agency that owns the station does not use the 
#     SEED channel name convention, the original channel name can be stored
#     and accessed with the following function:
#        $obj->orig_comp_name($seed,$orig);     # load value
#        <char> = $obj->orig_comp_name($seed);  # access value
#     The function will return undef if no original name is associated with
#     the input SEED name.
#
#   Data Quality Assignment/Indicators:
#     These functions flag amplitude values as having a problem of some
#     sort; flagged data is not used in determination of peak amplitudes
#     and thus components with an undefined peak amplitude can be assumed
#     to have no unflagged data.  Choice of flags and their interpretation
#     are left to the application.  In the functions below, "$type" is one 
#     of 'acc', 'vel', 'psa03', 'psa10', or 'psa30'; 
#       <char> = $obj->get_flag( $type, $channel );
#       <void> = $obj->set_flag( $flag, $type, $channel );
#     This function flags all of the types for the given channel:
#       <void> = $obj->flag_channel( $flag, $channel );
#     These functions flag all of the channels for the given type:
#       <void> = $obj->flag_type( $flag, $type );
#     This function flags all of the types and channels for the station:
#       <void> = $obj->flag_station( $flag );
#     This function returns TRUE if ANY channel component is flagged:
#       <bool> = $obj->get_any_flag();
#     This function returns all flags in one channel (or all)
#       <bool> = $obj->get_all_flags( [$channel]);
#
# Internal Data Structure:
#   $obj = [ station_code, station_name, agency, netid, instrument_type,
#            communications_type, lat, lon, distance, location, 
#	     shear_velocity,
#            { component => amplitude_correction, ... },
#   ACC      { channel   => acceleration, ... },
#   VEL      { channel   => velocity, ... },
#   PSA03    { channel   => spectral_acceleration_03_sec, ... },
#   PSA10    { channel   => spectral_acceleration_10_sec, ... },
#   PSA30    { channel   => spectral_acceleration_30_sec, ... },
#            pga, pgv, ppsa03, ppsa10, ppsa30, 
#            { amp_type => { channel => glitch_value, ... }, 
#              ... }
#            { hash used for temporary storage during parsing }
#          ];
#
########################################################################

# Specify flagable parameters (i.e., track glitches and outliers)

my @FLAGABLE = ('acc','vel','psa03', 'psa10', 'psa30');  

#
# For reasons more to do with legacy than logic (and more annoying
# than desirable), for the purposes of arguments to functions, we're 
# going to treat 'acc' and 'pga' as equivalent, and 'vel' and 'pgv' 
# as equivalent, and let the 'amp' function handle channel data and 
# let 'peak()' handle the peaks...
#
my %AMP_INDICES       = ('acc'   => ACC,
		         'pga'   => ACC,
		         'vel'   => VEL,
		         'pgv'   => VEL,
		         'psa03' => PSA03,
		         'psa10' => PSA10,
		         'psa30' => PSA30);
my %PEAK_INDICES      = ('acc'   => PGA,
		         'pga'   => PGA,
		         'vel'   => PGV,
		         'pgv'   => PGV,
		         'psa03' => PPSA03,
		         'psa10' => PPSA10,
		         'psa30' => PPSA30);
my %PEAK_CHAN_INDICES = ('acc'   => PGA_CHAN,
			 'pga'   => PGA_CHAN,
			 'vel'   => PGV_CHAN,
			 'pgv'   => PGV_CHAN,
			 'psa03' => PPSA03_CHAN,
			 'psa10' => PPSA10_CHAN,
			 'psa30' => PPSA30_CHAN);

sub new {
    my $class  = shift;
    my $expat  = shift;
    my $attr   = shift;
    my $parent = shift;

    if (defined $expat && (!defined $attr || !defined $parent)) {
      carp "Station::new: Non-default constructor expects 3 args: expat, "
	 . "attr, parent";
      return undef;
    }
    my $self = [];

    bless $self, $class;

    $self->initialize();

    return $self if (!defined $expat);

    #
    # We're part of a parsing activity...
    #
    $self->code($attr->{'code'});
    $self->name($attr->{'name'});
    $self->agency($attr->{'source'});
    $self->netid($attr->{'netid'});
    $self->inst_type($attr->{'insttype'});  # i.e., 'STS2 GPS'
    $self->comm_type($attr->{'commtype'});  # i.e., 'DIG' or 'ANA'
    $self->lat($attr->{'lat'});
    $self->lon($attr->{'lon'});
    $self->dist($attr->{'dist'});
    $self->loc($attr->{'loc'});

    $expat->setHandlers( %{$self->handlers($parent)} );

    return $self;
}

sub initialize {
    my $this = shift;

    $this->[STACODE]     = undef;
    $this->[STANAME]     = undef;
    $this->[AGENCY]      = undef;
    $this->[NETID]       = undef;
    $this->[INST_TYPE]   = undef;
    $this->[COMM_TYPE]   = undef;
    $this->[LAT]         = undef;
    $this->[LON]         = undef;
    $this->[DIST]        = undef;
    $this->[LOC]         = undef;
    $this->[T_AMPCORR]   = {};
    $this->[E_AMPCORR]   = {};
    $this->[ACC]         = {};
    $this->[VEL]         = {};
    $this->[PSA03]       = {};
    $this->[PSA10]       = {};
    $this->[PSA30]       = {};
    $this->[PGA]         = undef;
    $this->[PGV]         = undef;
    $this->[PSA03]       = undef;
    $this->[PSA10]       = undef;
    $this->[PSA30]       = undef;
    $this->[PGA_CHAN]    = undef;
    $this->[PGV_CHAN]    = undef;
    $this->[PPSA03_CHAN] = undef;
    $this->[PPSA10_CHAN] = undef;
    $this->[PPSA30_CHAN] = undef;
    $this->[ORIG_CHAN]   = {};
    $this->[FLAG]        = {};
}

sub code {
    my $this = shift;

    @_ ? $this->[STACODE] = shift : $this->[STACODE];
}

sub name {
    my $this = shift;

    @_ ? $this->[STANAME] = shift : $this->[STANAME];
}

sub agency {
    my $this = shift;

    @_ ? $this->[AGENCY] = shift : $this->[AGENCY];
}

sub netid {
    my $this = shift;

    @_ ? $this->[NETID] = shift 
       : (defined $this->[NETID] ? $this->[NETID] : "");
}

sub inst_type {
  my $this = shift;
  
  @_ ? $this->[INST_TYPE] = shift : $this->[INST_TYPE];
}
sub comm_type {
    my $this = shift;

    @_ ? $this->[COMM_TYPE] = shift : $this->[COMM_TYPE];
}

sub lat {
    my $this = shift;

    @_ ? $this->[LAT] = shift : $this->[LAT];
}

sub lon {
    my $this = shift;

    @_ ? $this->[LON] = shift : $this->[LON];
}

sub dist {
    my $this = shift;

    @_ ? $this->[DIST] = shift : $this->[DIST];
}

sub loc {
    my $this = shift;

    @_ ? $this->[LOC] = shift : $this->[LOC];
}

sub theoretical_ampcorr {

    my $this = shift;
    my $type = shift;

    if (not defined($type) or not grep $type eq $_, ('pga','pgv','acc','vel','psa03','psa10','psa30')) {
      croak "correct type required to access theoretical_ampcorr ($type)";
    }

    $type = 'acc' if ($type eq 'pga');
    $type = 'vel' if ($type eq 'pgv');
    
    if (not @_ and not defined($this->[T_AMPCORR]{$type})) {
      croak "amplitude correction for type '$type' undefined";
    }

    @_ ? $this->[T_AMPCORR]{$type} = shift 
       : $this->[T_AMPCORR]{$type};
}

sub empirical_ampcorr {

    my $this = shift;
    my $type = shift;
    my $chan = shift;

    if (not defined($chan) or $chan !~ /(E|N|Z)/i) {
      croak "channel identifier (E|N|Z) required to access "
	  . "empirical_ampcorr";
    }
    if (not defined($type) or not grep $type eq $_, ('acc','vel','wa','psa03','psa10','psa30')) {
      croak "correct type required to access empirical_ampcorr";
    }
    
    my ($compcode) = $chan =~ /(E|N|Z)/i;
    $compcode = uc $compcode;

    if (not @_ and not defined($this->[E_AMPCORR]{$compcode}{$type})) {
      croak "amplitude correction for component '$compcode' type '$type' "
	  . "undefined";
    }

    @_ ? $this->[E_AMPCORR]{$compcode}{$type} = shift 
       : $this->[E_AMPCORR]{$compcode}{$type};
}

sub channels {
    my $this = shift;
    my $type = shift;

    if (not defined $type) {
      #
      # Get a list of all channels for all types
      #
      my %chash;
      my @tmpch;
      foreach my $ind ( keys %AMP_INDICES ) {
        @tmpch = keys %{ $this->[$AMP_INDICES{$ind}] };
	foreach my $ch ( @tmpch ) {
	  $chash{$ch}++;
	}
      }
      return keys %chash;
    }

    my $index = $AMP_INDICES{$type} || croak "Type $type not recognized";
    my @chans = keys %{ $this->[$index] };

    # should they be sorted here?
    
    return @chans;
}

sub amp {

  my $this = shift;
  my $type = shift;
  my $chan = shift;

  if (not defined $type or not defined $chan) {
    croak "Station::amp: type and channel name required as arguments";
  }
  if (not defined $AMP_INDICES{$type}) {
    croak "Station::amp: unknown parameter type $type";
  }
  if (@_) {
    my $val = shift;
    &_set_amp($this, $type, $chan, $val);
  }
  return $this->[$AMP_INDICES{$type}]{$chan};
}

sub peak {

  my $this = shift;
  my $type = shift;

  return undef if $this->get_any_flag();

  if (not defined $type) {
    croak "Station::peak: type required as argument";
  }
  if (not defined $PEAK_INDICES{$type}) {
    croak "Station::peak: unknown parameter type $type";
  }
  if (@_) {
    croak "Station::peak: $type cannot be set directly. It is set during "
	. "amp() calls";
  }

  return $this->[$PEAK_INDICES{$type}];
}

sub mean {
  my $this = shift;
  my $type = shift;
  
  return undef if $this->get_any_flag();

  if (not defined $type) {
    croak "Station::peak: type required as argument";
  }
  if (not defined $PEAK_INDICES{$type}) {
    croak "Station::peak: unknown parameter type $type";
  }
  if (@_) {
    croak "Station::peak: $type cannot be set directly. It is set during "
	. "amp() calls";
  }

  my $prod = 1;
  my $count = 0;
  my $this_amp;
  foreach my $this_chan ($this->channels($type)) {
    # vertical component cannot be peak component
    next if substr(uc $this_chan,-1) eq 'Z';
    
    # a flagged component cannot be peak component
    my $flag = $this->get_flag($type, $this_chan);
    next if defined $flag and $flag ne 0;
    
    $this_amp = $this->amp($type, $this_chan);
    if (defined $this_amp and abs($this_amp)) {
      $prod *= abs($this_amp);
      $count++;
    }
  }

  my $mean = undef;
  $mean = $prod if ($count==1);
  $mean = sqrt($prod) if ($count==2);

  return $mean;
}

sub peak_chan {
  
  my $this = shift;
  my $type = shift;

  if (not defined $type) {
    croak "Station::peak_chan: type required as argument";
  }
  if (not defined $PEAK_CHAN_INDICES{$type}) {
    croak "Station::peak_chan: unknown parameter type $type";
  }
  if (@_) {
    croak "Station::peak_chan: $type channel cannot be set directly.  "
        . "It is set during acc() calls";
  }
  return $this->[$PEAK_CHAN_INDICES{$type}];
}

#
# Routine to store original channel names in association with SEED names
#
sub orig_comp_name {
  
  my $this = shift;
  my $seed = shift() || 
    croak "Station::orig_comp_name - requires SEED name as argument\n";

  if (@_) {
    my $orig = shift;

    $this->[ORIG_CHAN]{uc $seed} = $orig;
  }

  return $this->[ORIG_CHAN]{uc $seed};
}

#
# Routines for flagging amplitudes
#

sub flag_station {

  my $this = shift;
  my $flag = shift;

  foreach my $type ( @FLAGABLE ) {
    $this->flag_type($flag, $type);
  }
  return;
}

sub flag_channel {

  my $this = shift;
  my $flag = shift;
  my $chan = shift;

  foreach my $type ( @FLAGABLE ) {
    $this->set_flag($flag,$type,$chan);
    $this->_reset_peak($type);
  }
  return;
}

sub flag_type {

  my $this = shift;
  my $flag = shift;
  my $type = shift;

  foreach my $chan ( $this->channels($type) ) {
    $this->set_flag($flag,$type,$chan);
  }
  $this->_reset_peak($type);
  return;
}

sub set_flag {

  my $this = shift;
  my $flag = shift;
  my $type = shift;
  my $chan = shift;

  if (not grep($type eq $_, @FLAGABLE)) {
    croak "Glitch flags not maintained for type $type";
  }

  my $old = $this->[FLAG]{$type}{$chan};

  if (!defined $old or ($old eq '0')) {
    $this->[FLAG]{$type}{$chan} = $flag;
    $this->_reset_peak($type);
    return;
  }    

  $this->[FLAG]{$type}{$chan} = "$old,$flag" unless 
    ($old =~ /^$flag/ or $old =~ /,$flag/);
  return;
} 

sub get_flag {

  my $this = shift;
  my $type = shift;
  my $chan = shift;
  my($val);

  if (not grep($type eq $_, @FLAGABLE)) {
    croak "Glitch flags not maintained for type $type";
    # might just want to carp/confess and return
  }
  # check if a known channel?

  if (@_) {
    croak "Use set_flag() to set glitch flags";
  }

  $val = $this->[FLAG]{$type}{$chan};
  return $val;
}

sub get_any_flag {

  # See if ANY channels are flagged

  my $this = shift;
  my $flag;
 
  foreach my $type (@FLAGABLE) {
    foreach my $chan ( $this->channels($type) ) {

      $flag = ($this->[FLAG]{$type}{$chan});
      return 1 if (defined $flag and $flag ne '0');
    }
  }

  return undef;
}

sub get_all_flags {

  # Return all flags

  my $this = shift;
  my $ch = shift;
  my $flag;
  my %allflags;
  my @f;
  my @channels;

  foreach my $type (@FLAGABLE) {
    @channels = (defined $ch) ? ($ch) : $this->channels($type);
     foreach my $chan ( @channels ) {

      $flag = $this->[FLAG]{$type}{$chan};
      if ($flag) {
        @f = split /,/,$flag;
        foreach (@f) { $allflags{$_} = 1; }
      }
    }
  }
  delete $allflags{'0'};
  $flag = join ',', (sort keys %allflags); 
  
  return $flag ? $flag : '0';
}

#
# internal utility routines for setting and resetting amplitudes and peak
#   amplitudes.
#
sub _set_amp {
    my $this  = shift;
    my $type  = shift;
    my $chan  = shift;
    my $val   = shift;
    my($index);

    if ($type eq 'pga') {
      $type = 'acc';
    } elsif ($type eq 'pgv') {
      $type = 'vel';
    }
    
    $index = $AMP_INDICES{$type};
    $this->[$index]{$chan} = $val;

    $this->[FLAG]{$type}{$chan} = 0;

    #
    # Peak value cannot be vertical component
    # (it makes the engineers mad)
    #
    if (substr(uc $chan,-1) ne 'Z') {
      $index = $PEAK_INDICES{$type};
      if (!defined $this->[$index] or abs($val) > $this->[$index]) {
	$this->[$index] = abs($val);
	$this->[$PEAK_CHAN_INDICES{$type}] = $chan;
      }
    }
}


sub _reset_peak {
  my $this = shift;
  my $type = shift;
  my($peak,$this_chan,$this_amp,$peak_index,$peak_chan);

  $peak = -1;
  $peak_chan = undef;

  foreach $this_chan ($this->channels($type)) {
    # vertical component cannot be peak component
    next if substr(uc $this_chan,-1) eq 'Z';

    # a flagged component cannot be peak component
    my $flag = $this->get_flag($type, $this_chan);
    next if defined $flag and $flag ne 0;

    $this_amp = $this->amp($type, $this_chan);
    if (defined $this_amp and abs($this_amp) > $peak) {
      $peak = abs($this_amp);
      $peak_chan = $this_chan;
    }
      
  }
  $peak = undef if $peak == -1;
  $peak_index = $PEAK_INDICES{$type};

  # note: the peak value has to be set directly into the data structure
  #       rather than through an accessor function because the accessor
  #       functions call _reset_peak
  $this->[$peak_index] = $peak;
  $this->[$PEAK_CHAN_INDICES{$type}] = $peak_chan;

  return;
}

#
# Other possible routines for Station
#
#sub peak_amps {
#    # return an array of the various peak values for station: pga, pgv,...
#}
#
#sub xmlize    {
#    # dump a string with XML version of station info
#}

############################################################################
# Parse an XML earthquake file as input to the object
# - parsing handled by the XML::Parser package
# - the existing Source object, if any, will be overwritten during parsing
############################################################################

my @HANDLED_TAGS = ('station','comp','acc','vel','psa03','psa10', 'psa30');

sub handlers {
  my $this   = shift;
  my $parent = shift;

  my $handlers = {Start => sub {
		    my $expat = shift;
		    my $etype = shift;
		    my %attrib = @_;
		    
		    if (grep($etype eq $_ ,@HANDLED_TAGS)) {
		      if ($etype eq 'station') {
			croak "Station module can't handle station_start tag";
		      } elsif ($etype eq 'comp') {
			$this->comp_start($expat, $etype, %attrib);
		      } else {
			$this->param_start($expat, $etype, %attrib);
		      }
		    }
		    return();
		  },
		  End   => sub {
		    my $expat = shift;
		    my $etype = shift;
		    
		    if (grep($etype eq $_ ,@HANDLED_TAGS)) {
		      #
		      # Tag 'station_end' is handled by the parent
		      # object
		      #
		      if ($etype eq 'station') {
		        $parent->station_end($expat,$etype);
		      } elsif ($etype eq 'comp') {
			$this->comp_end($expat, $etype);
		      } else {
			$this->param_end();
		      }
		    }
		    return();
		  }
		 };
  return $handlers;
}


sub comp_start {
  my $this = shift;
  my $expat = shift;
  my $etype = shift;
  my %att = @_;
  
  if (defined($this->[PARSE]{'curr_comp'})) {
    croak "Invalid XML, nested <comp> tags!";
  }
  $this->[PARSE]{'curr_comp'} = $att{'name'};

  # store original agency-specific channel name, if any
  if (exists $att{'originalname'}) {
    $this->orig_comp_name($att{'name'},$att{'originalname'});
  }

  return;
}

sub comp_end {
  my $this  = shift;
  my $expat = shift;
  my $etype = shift;
  
  $this->[PARSE]{'curr_comp'} = undef;
  return;
}

sub param_start {
  my $this  = shift;
  my $expat = shift;
  my $etype = shift;
  my %att = @_;

  my ($val) = $att{'value'} =~ /\s*(\S+)/;
  $this->amp($etype, $this->[PARSE]{'curr_comp'}, $val);

  if (defined $att{'flag'} && $att{'flag'} =~ /\S+/) {
    my ($flag) = $att{'flag'} =~ /\s*(\S+)/;
    $this->set_flag($flag, $etype, $this->[PARSE]{'curr_comp'});
  }
  return;
}

sub param_end {
}

1;
