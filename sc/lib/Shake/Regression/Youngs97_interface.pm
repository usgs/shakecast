package Regression::Youngs97_interface;

use strict;
use Shake::Regression::Common_reg;
use Shake::Graphics_2D;
use Shake::Source;
use Shake::Distance;
use vars qw( $Vs $SCALE_PEAK %CONSTANTS %SIGMA );
use Carp;

# V 2.0 5-27-2003 vq
# New format for amplitudes functions: 
#  <hash> = $obj->maximum($lat,$lon[,$dist][,$type]);
#  <hash> = $obj->random($lat,$lon[,$dist][,$type]);
#
#  If $dist is specified, then it will not be recomputed.
#
# Regression taken from Youngs et. al., BSSA v.68 no.1 (1997).
# PGV regression cribbed from psa10 as per HAZUS (Newmark & Hall 1982)
#
# This regression requires two Source parameters in the event.xml file.
#   'type' must be either "interface" or "intraslab"
#   'depth' in km
#
# Notes on finite fault :
# In the finite fault file *_fault.txt in the input directory should have
# three columns (lat,lon,depth).
# Each fault is defined by a set of 4-point planar segments (quadrilaterals)
# joined by common sides.
# The points should be arranged in clockwise- or counterclockwise order, e.g.
#
#      3------4
#      |\      \ 
# 1(9)-2 6------5
#   \   \|    
#    8-- 7
#
# The last point is a repeat of the first point. 
#
# Each quadrilateral segment (1278, 2367, 3465) must have 4 corner points 
# which are coplanar and non-collinear. Multiple fault segments must 
# connect in linear fashion as shown above; more degenerate configurations
# are not supported. One planar segment (4 points + the first point
# repeated) or two connected planar segments should be sufficient for 
# most cases.
#
# More than one fault file, representing separate fault segments,
# may be used as long as the first and last points of each fault file 
# are identical.
######################################################################

# 08232007 vq: Cap H at max 100km

# multiply by 1.15 to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
$SCALE_PEAK = 1.15;

%CONSTANTS = ( 'pga'   => { C1 => 0, C2 => 0, C3 => -2.552 },
	       'psa03'   => { C1 => 0.246, C2 => -0.0036, C3 => -2.454 },
	       'psa10'   => { C1 => -1.736, C2 => -0.0064, C3 => -2.234 },
	       'psa30'   => { C1 => -4.511, C2 => -0.0089, C3 => -2.033 },
	     );

# standard deviation values
# Note, the standard deviation values are defined in log-amplitude 
# space, so when applied in liner-amplitude space they are
# multiplicative rather than additive factors.
%SIGMA = ('pga'   => {C4 => 1.45, C5 => -0.1},
	  'pgv'   => {C4 => 1.51, C5 => -0.1},
	  'psa03'   => {C4 => 1.45, C5 => -0.1},
	  'psa10'   => {C4 => 1.45, C5 => -0.1},
	  'psa30'   => {C4 => 1.65, C5 => -0.1},
	 );

sub new {
  my $class = shift;
  my $lat   = shift;
  my $lon   = shift;
  my $mag   = shift;

  # ignore the magnitude min, max range if passed as arguments

  my $self = { lat=>$lat, lon=>$lon, mag =>$mag};

  # If there is a fault model or parameter hash specified, extract it.
  foreach (@_) {
    if (ref $_ eq 'ARRAY') {
      $self->{fault} = $_;
    }
    if (ref $_ eq 'HASH') {
      $self->{depth} = $_->{depth};
      $self->{type} = $_->{type};
    }
  }
  $self->{ bias } = { pga   => 1,
		      pgv   => 1,
		      psa03 => 1,
		      psa10 => 1,
		      psa30 => 1 };
  
  die "Parameter 'depth' required in event.xml" 
    unless (defined $self->{depth});

  $self->{type} = 'interface';
 
  bless $self, $class;
  
  $self->{dist} = \&Shake::Distance::dist_rrup;

  return $self;
}


# Complete suite of "maximum component" amplitude values at the given 
# lat, lon location (magnitude and source coordinates were loaded when the 
# regression object was created). Values returned as a hash with keys of:
#   pga, pgv, psa03, psa10, psa30
### Multiply by $SCALE_PEAK to get maximum rather than random 
### component as derived (Boore, Campbell, personal communication)
sub maximum {
  my ($this,$lat,$lon,$dist,$type) = @_;

  if (defined $dist and $dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rrup = (defined $dist) ? $dist :
    $this->{dist}->($lat,$lon,$this);
  
  my $M   = $this->{mag};
  my $H = $this->{depth};
  $H = 100 if ($H>100);

  my $Zt;
  
  if ($this->{type} eq 'interface') { $Zt = 0; }
  elsif ($this->{type} eq 'intraslab') { $Zt = 1; }
  else {
    die "Source rupture type must be interface or intraslab";
  }

  # DEBUG
#  `echo $lat $lon $Rrup >> y97dump.xy`;
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients) 
  # scale "g" to %g
  #-----------------------------------------------------------------------
  my(%hash);
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'pga'}}) * 
                   100 * $SCALE_PEAK;
  } 
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'psa03'}}) * 
                   100 * $SCALE_PEAK;
  } 
  if (not defined $type or $type eq 'psa10' or $type eq 'pgv') {
    $hash{psa10} = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'psa10'}}) * 
                   100 * $SCALE_PEAK unless ($hash{psa10});
    $hash{pgv}   = $hash{psa10} * 37.27 * 2.54 / 100 unless ($hash{pgv});
  } 
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'psa30'}}) * 
                   100 * $SCALE_PEAK;
  } 
  return(%hash);
}

# Complete suite of "random component" amplitude values at the given lat, 
# lon location (magnitude and source coordinates were loaded when the 
# regression object was created). Values returned as a hash with keys of:
#   pga, pgv, psa03, psa10, psa30
### These are values for some random component rather than the maximum,
### therefore they do *not* have the $SCALE_PEAK multiplicative factor
### (Boore, Campbell, personal communication)
sub random {
  my ($this,$lat,$lon,$dist,$type) = @_;
  
  if (defined $dist and $dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rrup = (defined $dist) ? $dist :
    $this->{dist}->($lat,$lon,$this);
  
  my $M   = $this->{mag};
  my $H = $this->{depth};
  $H = 100 if ($H>100);
  my $Zt;
  
  if ($this->{type} eq 'interface') { $Zt = 0; }
  elsif ($this->{type} eq 'intraslab') { $Zt = 1; }
  else {
    die "Source rupture type must be interface or intraslab";
  }

  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients) 
  # scale "g" to %g
  #-----------------------------------------------------------------------
  my %hash;
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'pga'}}) * 100;
  } 
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'psa03'}}) * 100;
  } 
  if (not defined $type or $type eq 'psa10' or $type eq 'pgv') {
    $hash{psa10} = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'psa10'}}) * 
                   100 unless ($hash{psa10});
    $hash{pgv}   = $hash{psa10} * 37.27 * 2.54 / 100 unless ($hash{pgv});
  } 
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rrup,$H,$Zt,%{$CONSTANTS{'psa30'}}) * 100;
  } 
  return(%hash);
}

# Complete suite of standard deviation for the parameters given by peak().
# Values returned as a hash with the same keys as returned by peak().
sub sd {
  my $this  = shift;
  my(%hash,$key);

  my $M = $this->{mag};
  
  %hash = ();
  foreach $key (keys %SIGMA) {
    if (not defined $SIGMA{$key}) {
      $hash{$key} = undef;
      next;
    }
    
    $hash{$key} = exp($SIGMA{$key}{C4} + $SIGMA{$key}{C5}*$M);
  }

  return %hash;
}

# Get/Store a set of values for the bias of the regression relative to
# to the data. $bias is a reference to a hash with keys of
#   pga, pgv, psa03, psa10, psa30
# and values of the bias amount for each parameter type.
sub bias {
  my $this = shift;

  if (@_) {
    my $bias = shift;
    
    if (ref $bias ne "HASH") {
      return;
    }

    $this->{bias} = $bias;
  }

  $this->{bias};
}

##################################################################
# Subroutines intended for internal use. Not part of external API
##################################################################

sub _psa_formula {
  my $M   = shift;
  my $Rrup = shift;
  my $H = shift;
  my $Zt = shift;
  my %c   = @_;
  my $psa; 

  $psa = 0.2418 + 1.414*$M + $c{C1} + $c{C2}*(10-$M)**3
    + $c{C3}*log($Rrup+1.7818*exp(0.554*$M)) + 0.00607*$H;

#  $psa = $c{C1} + $c{C2}*$M + $c{C3}*log($Rrup + exp($c{C4}-($c{C2}*$M/$c{C3})))
#    + $c{C5}*$Zss + $c{C8}*$Zt + $c{C9};

  $psa += 0.3846 if ($Zt);
  $psa = exp($psa);

#  print "R:$Rrup -> $psa\n";
  
  return $psa;
}

1;

