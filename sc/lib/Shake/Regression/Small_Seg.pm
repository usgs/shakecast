package Regression::Small_Seg; 
 
 
# Module to generate PGA/PGV/SA for a given a distance and magnitude. 
# PGA & PGV regressions from Boatwright et al for northern California
# SA regression from Vince Quitoriano's small event regression
 
# V1.0 4-10-00 jb
# from module 5-31-00 cws 
# v2.0 12/17/03 pnl to support ShakeMap 3.0
# New format for amplitudes functions: 
#  <hash> = $obj->maximum($lat,$lon[,$dist][,$type]);
#  <hash> = $obj->random($lat,$lon[,$dist][,$type]);
#
#  If $dist is specified, then it will not be recomputed.
 
# 
# Regression form for PGA and PGV:  
# (from Boatwright et al., BSSA, in press)
# 
#    log_10(PGA,PGV) = A + B*(M-Ms) - log_10(gR) + k*R - Bv*log_(Vs/Va), 
# 
#    where R = sqrt(Re**2 + depth**2) 
#    and gR = R for R < Ro, = Ro*(R/Ro)**0.7 for R > Ro 
# 
# PGA is in %g, PGV in cm/s. 
# 
# Regression form for PSA:  
# (same as Boore, Joyner and Fumal, 1997, SRL, Volume 68, p. 128. 
# but using log_10( Y ) rather than ln( Y )) 
# 
#    log_10 (PGA,PSV) = B1 + B2(M-6) + B3(M-6)**2 - B5*ln(R) - Bv*ln(Vs/Va), 
# 
#    where R = sqrt(Re**2 + h**2) but h is constant
# 
# PSA, PGA are in "cm/s/s". PGV in cm/s. PSA is 5% damped pseudo-acceleration?  
# Random horizontal component on rock. 
 
# Distance is epicentral- Re
 
# NOTE that the routines in this module scale the values to return %g 
# instead of leaving acceleration in cm/s/s 
### and scale up the values by 15% to estimate a maximum value rather than 
### a random component (Boore, Campbell, personal communication) 
 
 
use strict; 
use Shake::Regression::Common_reg;
use Shake::Distance;
use vars qw( $Vs $SCALE_PEAK %CONSTANTS %SIGMA ); 
 
$Vs = 620; # Rock (Vs=310 for Soil) 
#$Vs = 724.; # BC NEHRP 
 
# multiply by 1.15 to get maximum rather than random  
# component as derived (Boore, Campbell, personal communication) 
$SCALE_PEAK = 1.15; 

%CONSTANTS = ('pga'   => { A => 2.52, B => 1.00, k => -0.0073, 
                           Ro => 27.5, g => 0.7, Ms => 5.5, 
                           e => -0.371, Va => 560 },
              'pgv'   => { A => 2.243, B => 1.06, k => -0.0063, 
                           Ro => 27.5, g => 0.7, Ms => 5.5, 
                           e => -0.371, Va => 560 },
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
%SIGMA = ('pga'   => 0.3606, 
          'pgv'   => 0.3286, 
          'psa03' => undef, 
          'psa10' => undef, 
          'psa30' => undef, 
        ); 
 
 
sub new { 
  my $class = shift; 
  my $lat   = shift; 
  my $lon   = shift; 
  my $mag   = shift; 

# extract the hypocentral depth from event.html
# if depth < 2 km, presume event is mislocated and set depth = 6

  my $src   = shift;
  my $d = $src->depth;
  $d = 6 if ($d < 2); 

  # ignore the magnitude min, max range if passed as arguments 
 
  my $self = { lat => $lat, lon => $lon, mag => $mag, depth => $d }; 
 
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

  my $Re = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);
  my $M  = $this->{'mag'}; 
  my $d  = $this->{'depth'};
 
  my(%hash); 
   
  #--------------------------------------------------------------------- 
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec scale "cm/s/s" to %g 
  #---------------------------------------------------------------------
  if (not defined $type or $type eq 'pga') { 
    $hash{pga}   = _pgm_formula($M,$Re,$d,%{$CONSTANTS{'pga'}}) *  
                   $SCALE_PEAK; 
  } 
  if (not defined $type or $type eq 'psa03') { 
    $hash{psa03} = _psa_formula($M,$Re,%{$CONSTANTS{'psa03'}}) *  
                   $SCALE_PEAK * 100.; 
  } 
  if (not defined $type or $type eq 'psa10') { 
    $hash{psa10} = _psa_formula($M,$Re,%{$CONSTANTS{'psa10'}}) *  
                   $SCALE_PEAK * 100.; 
  } 
  if (not defined $type or $type eq 'psa30') { 
    $hash{psa30} = _psa_formula($M,$Re,%{$CONSTANTS{'psa30'}}) *  
                   $SCALE_PEAK * 100.; 
  } 
  if (not defined $type or $type eq 'pgv') { 
    $hash{pgv}   = _pgm_formula($M,$Re,$d,%{$CONSTANTS{'pgv'}}) *  
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
    
    my $Re = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);
    my $M = $this->{'mag'};
    my $d = $this->{'depth'};

    my(%hash); 
   
  #--------------------------------------------------------------------- 
  # For SA 0.3 sec, SA 1.0 sec, SA 3.0 sec scale "cm/s/s" to %g 
  #--------------------------------------------------------------------- 
  if (not defined $type or $type eq 'pga') { 
    $hash{pga}   = _pgm_formula($M,$Re,$d,%{$CONSTANTS{'pga'}}); 
  } 
  if (not defined $type or $type eq 'psa03') { 
    $hash{psa03} = _psa_formula($M,$Re,%{$CONSTANTS{'psa03'}}) * 100.; 
  } 
  if (not defined $type or $type eq 'psa10') { 
    $hash{psa10} = _psa_formula($M,$Re,%{$CONSTANTS{'psa10'}}) * 100.; 
  } 
  if (not defined $type or $type eq 'psa30') { 
    $hash{psa30} = _psa_formula($M,$Re,%{$CONSTANTS{'psa30'}}) * 100.; 
  } 
  if (not defined $type or $type eq 'pgv') { 
    $hash{pgv}   = _pgm_formula($M,$Re,$d,%{$CONSTANTS{'pgv'}}); 
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
 
# Get/Store a set of values for the bias of the regression 
# relative to the data. $bias is a reference to a hash 
# with keys of  pga, pgv, psa03, psa10, psa30 
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
  my $Re = shift; 
  my %c   = @_; 
  my($R,$psa); 
 
  $R = sqrt($Re**2 + $c{h}**2); 
  $psa = 10**($c{B1} + $c{B2}*($M-6.) + $c{B3}*($M-6.)**2 +  
              $c{B5}*_log_base(10,$R) + $c{Bv}*_log_base(10,$Vs/$c{Va})); 
 
  return $psa; 
} 
 
sub _pgm_formula {
  my $M   = shift;
  my $Re  = shift;
  my $d   = shift;
  my %c   = @_;
  my($R,$gR,$pgm);

  $R = sqrt ($Re**2 + $d**2);
  $gR = $R if ($R<=$c{Ro});
  $gR = $c{Ro}*($R/$c{Ro})**$c{g} if ($R>$c{Ro});

  $pgm = 10**($c{A} + $c{B}*($M-$c{Ms}) - _log_base(10,$gR)
              + $c{k}*$R + $c{e}*_log_base(10,$Vs/$c{Va}));

  return $pgm;
}
