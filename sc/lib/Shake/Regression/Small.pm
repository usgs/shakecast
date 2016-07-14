package Regression::Small;

# Module to generate PGA/PGV/SA for a given a distance and magnitude.
# Regression from Vince Quitoriano's small event regression from TriNet data

# V1.0 4-20-00 djw
# as module 5-31-00 cws

#
# Regression form: 
# (same as  Boore, Joyner and Fumal, 1997, SRL, Volume 68, p. 128.
#    log_10 (PGA,PSV) = B1 + B2(M-6) + B3(M-6)**2 - B5*ln(R) - Bv*ln(Vs/Va),
#
#    where R = sqrt(Rjb**2 + h**2)
#
# PSA, PGA are in "cm/s/s". PGV in cm/s. PSA is 5% damped pseudo-acceleration? 
# Random horizontal component on rock.

# Distance is JB definition (Rjb, see SRl V68, No. 1, p10.)

# NOTE that the routines in this module scale the values to return %g instead
# of leaving acceleration in cm/s/s
### and scale up the values by 15% to estimate a maximum value rather than
### a random component (Boore, Campbell, personal communication)

# V 2.0 5-27-2003 vq
# New format for amplitudes functions: 
#  <hash> = $obj->maximum($lat,$lon[,$dist][,$type]);
#  <hash> = $obj->random($lat,$lon[,$dist][,$type]);
#
#  If $dist is specified, then it will not be recomputed.

use strict;
use Shake::Regression::Common_reg;
use Shake::Distance;
use vars qw( $Vs $SCALE_PEAK %CONSTANTS %SIGMA );
use Carp;

$Vs = 620; # Rock (Vs=310 for Soil)
#$Vs = 724.; # BC NEHRP

# multiply by 1.15 to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
$SCALE_PEAK = 1.15;

%CONSTANTS = ('pga'   => { B1 =>  4.037, B2 =>  0.572, B3 => 0.00, 
			   B5 => -1.757, Bv => -0.473, Va =>  760, 
			   h  =>  6.00 },
	      'pgv'   => { B1 =>  2.223, B2 =>  0.740, B3 => 0.00, 
			   B5 => -1.386, Bv => -0.668, Va =>  760,
			   h  =>  6.00 },
	      'psa03' => { B1 =>  3.354, B2 =>  0.746, B3 => 0.00,
			   B5 => -1.827, Bv => -0.608, Va =>  760,
			   h  =>  6.00 },
	      'psa10' => { B1 =>  2.197, B2 =>  0.959, B3 => 0.00,
			   B5 => -1.211, Bv => -0.974, Va =>  760,
			   h  =>  6.00 },
	      'psa30' => { B1 =>  0.980, B2 =>  0.909, B3 => 0.00, 
			   B5 => -0.848, Bv => -0.890, Va =>  760,
			   h  =>  6.00 },
	     );

# standard deviation values
# Note, the standard deviation values are defined in log-amplitude 
# space, so when applied in liner-amplitude space they are
# multiplicative rather than additive factors.
%SIGMA = ('pga'   => 0.3667,
	  'pgv'   => 0.3268,
	  'psa03' => undef,
	  'psa10' => undef,
	  'psa30' => undef,
	 );


sub new {
  my $class = shift;
  my $lat   = shift;
  my $lon   = shift;
  my $mag   = shift;
  # ignore the magnitude min, max range if passed as arguments

  my $self = { lat => $lat, lon => $lon, mag  => $mag};

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

  if (defined $dist and $dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rjb = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);

  my $M = $this->{'mag'};
  my(%hash);
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec scale "cm/s/s" to %g
  #-----------------------------------------------------------------------
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rjb,%{$CONSTANTS{'pga'}}) * 
                   $SCALE_PEAK / 9.81;
  }
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa03'}}) * 
                   $SCALE_PEAK / 9.81;
  }
  if (not defined $type or $type eq 'psa10') {
    $hash{psa10} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa10'}}) * 
                   $SCALE_PEAK / 9.81;
  }
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa30'}}) * 
                   $SCALE_PEAK / 9.81;
  }
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

  if (defined $dist and $dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rjb = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);

  my $M   = $this->{'mag'};
  my(%hash);
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec scale "cm/s/s" to %g
  #-----------------------------------------------------------------------
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rjb,%{$CONSTANTS{'pga'}}) / 9.81;
  }
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa03'}}) / 9.81;
  }
  if (not defined $type or $type eq 'psa10') {
    $hash{psa10} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa10'}}) / 9.81;
  }
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rjb,%{$CONSTANTS{'psa30'}}) / 9.81;
  }
  if (not defined $type or $type eq 'pgv') {
    $hash{pgv}   = _psa_formula($M,$Rjb,%{$CONSTANTS{'pgv'}});
  }
  return(%hash);
}

# Complete suite of standard deviation for the parameters given by peak()
# and random(). Values returned in a hash that has the same keys as the
# hash returned by peak() and random().
sub sd {
  my $this = shift;

  my(%hash,$key);

  %hash = ();
  foreach $key (keys %SIGMA) {
    if (not defined $SIGMA{$key}) {
      $hash{$key} = undef;
      next;
    }

    $hash{$key} = 10**($SIGMA{$key});
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
  $psa = 10**($c{B1} + $c{B2}*($M-6.) + $c{B3}*($M-6.)**2 + 
	      $c{B5}*_log_base(10,$R) + $c{Bv}*_log_base(10,$Vs/$c{Va}));

  return $psa;
}


1;
