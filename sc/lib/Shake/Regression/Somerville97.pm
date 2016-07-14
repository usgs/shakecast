package Regression::Somerville97;

# BJF97/NH82 modified by Somerville et. al. 1997.
# Modified by Somerville 2000 mag-, dist-, and direc-dependent tapers.

# PSA, PGA are in "g". PGV in cm/s. PSA is 5% damped pseudo-acceleration. 
# Random horizontal component on rock.
# Distance is JB definition (Rjb, see SRl V68, No. 1, p10.)

# NOTE that the routines in this module scale the values to return %g instead
# of g, and scale up the values by 15% to estimate a maximum value rather than
# a random component (Boore, Campbell, personal communication)
#
# V 2.0 5-27-2003 vq
# New format for amplitudes functions: 
#  <hash> = $obj->maximum($lat,$lon[,$dist][,$type]);
#  <hash> = $obj->random($lat,$lon[,$dist][,$type]);
#
#  If $dist is specified, then it will not be recomputed.

use strict;
use Shake::Regression::Common_reg;
use Shake::Graphics_2D;
use Shake::Distance;
use vars qw( $Vs $SCALE_PEAK %CONSTANTS %SIGMA );
use Carp;

$Vs=724.; # BC NEHRP

# multiply by 1.15 to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
$SCALE_PEAK = 1.15;

%CONSTANTS = ('pga'   => { B1 => -0.242, B2 =>  0.527, B3 =>  0.000, 
			   B5 => -0.778, Bv => -0.371, Va =>  1396, 
			   h  =>  5.57 , C1 => 0, C2 => 0 },
	      'psa03' => { B1 =>  0.700, B2 =>  0.769, B3 => -0.161, 
			   B5 => -0.893, Bv => -0.401, Va =>  2133, 
			   h  =>  5.94 , C1 => 0, C2 => 0 },
	      'psa10' => { B1 => -1.080, B2 =>  1.036, B3 => -0.032, 
			   B5 => -0.798, Bv => -0.698, Va =>  1406, 
			   h  =>  2.90 , C1 => -0.192, C2 => 0.423 },
	      # using 2.0 sec coefficients for SA 3.0 sec
	      'psa30' => { B1 => -1.743, B2 =>  1.085, B3 => -0.085, 
			   B5 => -0.812, Bv => -0.655, Va =>  1795, 
			   h  =>  5.85 , C1 => -0.605, C2 => 1.333 },
	     );

# standard deviation values
# Note, the standard deviation values are defined in log-amplitude 
# space, so when applied in liner-amplitude space they are
# multiplicative rather than additive factors.
%SIGMA = ('pga'   => 0.520,
	  'pgv'   => 0.558, # sigma_pgv computed from sigma_psa10
	  'psa03' => 0.522,
	  'psa10' => 0.613,
	  'psa30' => 0.672,
	 );

sub new {
  my $class = shift;
  my $lat   = shift;
  my $lon   = shift;
  my $mag   = shift;
  
  # ignore the magnitude min, max range if passed as arguments

  my $self = { lat=>$lat, lon=>$lon, mag =>$mag };

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

  my $M = $this->{'mag'};
  my $direc = calc_directivity($lat,$lon,$this,$M,$Rjb);
  my(%hash);
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients) 
  # scale "g" to %g
  #-----------------------------------------------------------------------
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'pga'}}) * 
                   100 * $SCALE_PEAK;
  } 
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'psa03'}}) * 
                   100 * $SCALE_PEAK;
  } 
  if (not defined $type or $type eq 'psa10' or $type eq 'pgv') {
    $hash{psa10} = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'psa10'}}) * 
      100 * $SCALE_PEAK unless ($hash{psa10});
    $hash{pgv}   = $hash{psa10} * 37.27*2.54/100;
  }
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'psa30'}}) * 
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

  if ($dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rjb = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);

  my $M   = $this->{'mag'};
  my $direc = calc_directivity($lat,$lon,$this,$M,$Rjb);
  my(%hash);
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients) 
  # scale "g" to %g
  #-----------------------------------------------------------------------
  if (not defined $type or $type eq 'pga') {
    $hash{pga}   = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'pga'}}) * 100;
  } 
  if (not defined $type or $type eq 'psa03') {
    $hash{psa03} = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'psa03'}}) * 100;
  } 
  if (not defined $type or $type eq 'psa10' or $type eq 'pgv') {
    $hash{psa10} = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'psa10'}}) * 100
      unless ($hash{psa10});
    $hash{pgv}   = $hash{psa10} * 37.27*2.54/100;
    
  } 
  if (not defined $type or $type eq 'psa30') {
    $hash{psa30} = _psa_formula($M,$Rjb,$direc,%{$CONSTANTS{'psa30'}}) * 100;
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

sub calc_directivity {
  my ($a,$b,$ref,$M,$R) = @_;
  my ($epilat,$epilon) = ($ref->{lat},$ref->{lon});

  # Check that there is a finite fault
  unless (defined $ref->{fault}) {
    return undef; 
  }
  
  my @points = @{$ref->{fault}};
  
  my $_start = $points[0];
  my $_end = $points[-1];
  
  my $lat1 = $_start->{lat};
  my $lon1 = $_start->{lon};
  my $lat2 = $_end->{lat};
  my $lon2 = $_end->{lon};
  
  # Nonvertical faults undefined (since we don't know dips)
  return undef if ($lat1==$lat2 and $lon1==$lon2);
  
  # Compute L from Som97
  my $L = dist($lat1,$lon1,$lat2,$lon2);

  # Compute distance and azimuth from station to epicenter
  my ($C,$theta) = dist($a,$b,$epilat,$epilon);

  # Find which side of the epicenter this station is on
  my ($s1,$a1) = dist($lat1,$lon1,$epilat,$epilon);
  my ($s2,$a2) = dist($lat2,$lon2,$epilat,$epilon);

  $a1 = abs ($theta-$a1); $a1 = 2*$PI-$a1 if ($a1>$PI);
  $a2 = abs ($theta-$a2); $a2 = 2*$PI-$a2 if ($a2>$PI);

  my ($max_s,$az) = ($a1 < $a2) ? ($s1,$a1) : ($s2,$a2);

  # Station-epicenter distance projected on fault
  my $s = $C*cos($az);

  # $s cannot exceed distance from epicenter to endpoint
  $s = $max_s if ($s > $max_s);
  
#  $s<$L or die "Error in Somerville97.pm : s < L ($s vs. $L).\n";
  $s = $L if ($s>$L);
  my $direc = $s/$L*abs(cos($az));

  if ($direc <= 0.4) {
    return $direc*1.88;
  }
  else {
    return 0.75;
  }
}

sub direc_taper {
  my ($M,$R) = @_;

  # Add M-, R-, and direc-dependent modifications 
  # See Abramson, N. (Proc. Int'l Conf. on Seismic Zonation, Nov. 2000)
  
  my $T_r = 1-($R-30)/30;
  $T_r = 1 if ($R<30);
  $T_r = 0 if ($R>30);
  
  my $T_m = 1+($M-6.5)*2;
  $T_m = 1 if ($M>6.5);
  $T_m = 0 if ($M<6.0);

  return $T_r*$T_m;
}

sub _psa_formula {
  my $M   = shift;
  my $Rjb = shift;
  my $direc = shift;
  my %c   = @_;
  my($R,$psa,$psa_direc);

  $R = sqrt($Rjb**2 + $c{h}**2);
  $psa = $c{B1} + $c{B2}*($M-6.) + $c{B3}*($M-6.)**2 + $c{B5}*log($R) +
    $c{Bv}*log($Vs/$c{Va});

  $psa_direc = ($c{C1} + $c{C2}*$direc)*direc_taper($M,$Rjb) if (defined $direc);  
  $psa = exp($psa+$psa_direc); return $psa;
}

1;
