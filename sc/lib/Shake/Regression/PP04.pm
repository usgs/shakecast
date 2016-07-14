package Regression::PP04;

# Module to generate PGA/PGV/SA for a given a distance and magnitude.
# Regression from Pankow and Pechmann, 2004, BSSA, Vol.94, p. 341-348.
# This regression includes a new PGV regression and modifies the rock
#  regression from Spudich et al., 1999, BSSA, Vol. 89

# V1.0 1-02-03 klp
# as module 1-02-03 klp

#
# Regression from Pankow and Pechmann, 2004, BSSA, Vol.94, p. 341-348. 
# with the form: 
#
#        log10 (PGA,PSV,PGV) = B1 + B2(M-6) + B3(M-6)**2 - B5*log10(R)
#               + B6(GAMMA) + B7
#
#    where R = sqrt(Rjb**2 + h**2)
#    where GAMMA = 0 (for rock) and 1 (for soil)
#    where B7 is the coversion term from pseudovelocity to pseudoacceleration
#
# PGA are in "g". PGV in cm/s. 
# PSA is 5% damped pseudo-velocity in the Spudich relation and is in units of
#  cm/s.  This is different than Boore and as such the spectral values as
#  calculated are not compatiable with ShakeMap.  
# The above problem was corrected by adding B7.  This term is (2*pi/T)*PSV.
#  For more detail see BJF94 or D.E. Hudson.  K. Pankow 04/06/01
# Random horizontal component on rock.

# Distance is JB definition (Rjb, see SRl V68, No. 1, p10.)

# NOTE that the routines in this module scale the values to return %g instead
# of g, and scale up the values by 15% to estimate a maximum value rather than# a random component (Boore, Campbell, personal communication)

# V2.0 7-15-2004 
# Applying new format as in other modules 
#  <hash> = $obj->maximum($lat,$lon[,$dist][,$type]); 
#  <hash> = $obj->random($lat,$lon[,$dist][,$type]); 
# 
#  If $dist is specified, then it will not be recomputed. 
 
use strict;
use Shake::Regression::Common_reg;
use Shake::Distance;
use vars qw( $Vs $gamma $SCALE_PEAK %CONSTANTS %SIGMA );
use Carp; 

$Vs=910.; # Ave Rock Site for Wasatch Front
$gamma=0.; # Calculating everywhere as a rock site

# multiply by 1.15 to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
$SCALE_PEAK = 1.15;

%CONSTANTS = ('pga'   => { B1 =>  0.237, B2 =>  0.229, B3 =>  0.000, 
			   B5 => -1.052, B6 =>  0.174, h  =>  7.27,
			   B7 => 0.0 },
	      'psa03' => { B1 =>  2.196, B2 =>  0.334, B3 => -0.070, 
			   B5 => -1.020, B6 =>  0.188, h  =>  7.72,
			   B7 => -1.670 },
	      'psa10' => { B1 =>  2.160, B2 =>  0.450, B3 => -0.014, 
			   B5 => -1.083, B6 =>  0.326, h  =>  6.01,
			   B7 => -2.193 },
	      # using 2.0 sec coefficients for SA 3.0 sec
	      'psa30' => { B1 =>  2.059, B2 =>  0.471, B3 => -0.037, 
			   B5 => -1.049, B6 =>  0.306, h  =>  6.71,
			   B7 => -2.494 },
	      'pgv'   => { B1 =>  2.252, B2 =>  0.490, B3  =>  0.00,
			   B5  => -1.196, B6  => 0.195, h  => 7.06, 
			   B7  =>  0.00 }
	     );

# standard deviation values
# Note, the standard deviation values are defined in log-amplitude 
# space, so when applied in liner-amplitude space they are
# multiplicative rather than additive factors.
%SIGMA = ('pga'   => 0.203, # SEA99 calculated in log-10 space not ln-space
	  'pgv'   => 0.246, # Note pgv calculated in log10-space not ln-space
	  'psa03' => 0.232, # SEA99 calculated in log-10 space not ln-space
	  'psa10' => 0.269, # SEA99 calculated in log-10 space not ln-space
	  'psa30' => 0.312, # SEA99 calculated in log-10 space not ln-space
	 );

sub new {
  my $class = shift;
  my $lat   = shift;
  my $lon   = shift;
  my $mag   = shift;
  # ignore the magnitude min, max range if passed as arguments

  my $self = { lat => $lat, lon => $lon, mag  => $mag,};

  # If there is a fault model specified, extract it.
  foreach (@_) { $self->{fault} = $_ if (ref $_ eq 'ARRAY'); }

  $self->{ bias } = { pga   => 1,
		      pgv   => 1,
		      psa03 => 1,
		      psa10 => 1,
		      psa30 => 1 };

  bless $self, $class;
}


# Complete suite of "maximum component" amplitude values at the given 
# lat, lon location (magnitude and source coordinates were loaded when the 
# regression object was created). Values returned as a hash with keys of:
#   pga, pgv, psa03, psa10, psa30
### Multiply by $SCALE_PEAK to get maximum rather than random 
### component as derived (Boore, Campbell, personal communication)
sub maximum {
  my ($this,$lat,$lon,$dist,$type) = @_;

  if ($dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rjb = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);

  my $M   = $this->{'mag'};
  my(%hash);
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients)
  # scale "g" to %g
  #-----------------------------------------------------------------------

  #PGA:
  # SCALE "g" to %g
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rjb,%{$CONSTANTS{'pga'}}) * 
                   100 * $SCALE_PEAK;
  }

  #SA 0.3 sec:
  # SCALE "g" to %g
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa03'}}) * 
                   100 * $SCALE_PEAK;
  }

  #SA 1.0 sec:
  # SCALE "g" to %g
  if (not defined $type or $type eq 'psa10') {
    $hash{psa10} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa10'}}) * 
                   100 * $SCALE_PEAK;
  }

  #SA 3.0 sec (using 2.0 sec coefficients) :
  # SCALE "g" to %g
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa30'}}) * 
                   100 * $SCALE_PEAK;
  }

  #PGV:
  if (not defined $type or $type eq 'pgv') {
    $hash{pgv}   = _psa_formula($M,$Rjb,%{$CONSTANTS{'pgv'}}) * 
                   $SCALE_PEAK;
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
 
  if ($dist =~ /^pga|pgv|acc|vel|psa/) { 
    $type = $dist; 
    $dist = undef;
  } 
 
  my $Rjb = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);
 
  my $M   = $this->{'mag'};
  my(%hash);
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients)
  # scale "g" to %g
  #-----------------------------------------------------------------------
  #PGA:
  # SCALE "g" to %g
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rjb,%{$CONSTANTS{'pga'}}) * 100;
  }

  #SA 0.3 sec:
  # SCALE "g" to %g
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa03'}}) * 100;
  }

  #SA 1.0 sec:
  # SCALE "g" to %g
  if (not defined $type or $type eq 'psa10') {
    $hash{psa10} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa10'}}) * 100;
  }

  #SA 3.0 sec (using 2.0 sec coefficients) :
  # SCALE "g" to %g
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa30'}}) * 100;
  }

  #PGV:
  if (not defined $type or $type eq 'pgv') {
    $hash{pgv}   = _psa_formula($M,$Rjb,%{$CONSTANTS{'pgv'}});
  }

  return(%hash);
}

# Complete suite of standard deviation for the parameters given by peak().
# Values returned as a hash with the same keys as returned by peak().
sub sd {
  my $this  = shift;

  my(%hash,$key);

  %hash = ();
  foreach $key (keys %SIGMA) {
    if (not defined $SIGMA{$key}) {
      $hash{$key} = undef;
      next;
    }

    if ($key eq 'pgv') {
      $hash{$key} = 10**($SIGMA{$key});
    }
    else {
      $hash{$key} = exp($SIGMA{$key});
    }
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
  my $Rjb = shift;
  my %c   = @_;
  my($R,$psa);

  $R = sqrt($Rjb**2 + $c{h}**2);
  $psa = 10**($c{B1} + $c{B2}*($M-6.) + $c{B3}*($M-6.)**2 + $c{B5}*_log_base(10,$R) +
	     $c{B6}*$gamma + $c{B7});

  return $psa;
}


1;
