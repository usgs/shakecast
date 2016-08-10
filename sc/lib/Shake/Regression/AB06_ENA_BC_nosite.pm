package Regression::AB06_ENA_BC_nosite;

# Module to generate PGA/PGV/SA for a given a distance and magnitude.
# Regression from Atkinson and Boore, BSSA, Vol. 96, No. 6 (Dec, 2006)
# "Earthquake Ground-Motion Predicition Equations for Eastern North
# America"
#
# as module 05-13-07 cbw

# NOTE that the routines in this module scale the values to return %g instead
# of g, and scale up the values by 15% to estimate a maximum value rather than
# a random component (Boore, Campbell, personal communication)
#
# New format for amplitudes functions: 
#  <hash> = $obj->maximum($lat,$lon[,$dist][,$type]);
#  <hash> = $obj->random($lat,$lon[,$dist][,$type]);
#
#  If $dist is specified, then it will not be recomputed.

use strict;
use Shake::Regression::Common_reg;
use Shake::Source;
use Shake::Distance;
use vars qw( $SCALE_PEAK %CONSTANTS %SITE_CONSTANTS %MECHANISM $VS30_DEFAULT );
#use Carp; vq 09102007: error in Carp.pm?

# multiply by 1.15 to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
$SCALE_PEAK = 1.15;

$VS30_DEFAULT = 760;


# Atkinson and Boore (2006) Attenuation Coefficients for ENA BC crustal 
# conditions using Moment Magnitude
# created by Trevor Allen, 1 August 2006, modified by CBW 5-14-07

use enum qw ( c1 c2 c3 c4 c5 c6 c7 c8 c9 c10 );

%CONSTANTS = (
  'pgv'     => [ -1.66E+00,1.05E+00,-6.04E-02,-2.50E+00,1.84E-01,-2.30E+00,
                  2.50E-01, 1.27E-01,-8.70E-02,-4.27E-04 ],
  'pga'     => [  5.23E-01,9.69E-01,-6.20E-02,-2.44E+00,1.47E-01,-2.34E+00,
                  1.91E-01,-8.70E-02,-8.29E-02,-6.30E-04 ],
# 'psa0025' => [  1.05E+00,9.03E-01,-5.77E-02,-2.57E+00,1.48E-01,-2.65E+00,
#                 2.07E-01,-4.08E-01,-5.77E-02,-5.12E-04 ],
# 'psa003'  => [  1.19E+00,8.88E-01,-5.64E-02,-2.58E+00,1.45E-01,-2.84E+00,
#                 2.12E-01,-4.37E-01,-5.87E-02,-4.33E-04 ],
# 'psa004'  => [  1.26E+00,8.79E-01,-5.52E-02,-2.54E+00,1.39E-01,-2.99E+00,
#                 2.16E-01,-3.91E-01,-6.75E-02,-3.88E-04 ],
# 'psa005'  => [  1.21E+00,8.83E-01,-5.44E-02,-2.44E+00,1.30E-01,-3.04E+00,
#                 2.13E-01,-2.10E-01,-9.00E-02,-4.15E-04 ],
# 'psa0063' => [  1.11E+00,8.88E-01,-5.39E-02,-2.33E+00,1.23E-01,-2.88E+00,
#                 2.01E-01,-3.19E-02,-1.07E-01,-5.48E-04 ],
# 'psa0079' => [  9.67E-01,9.03E-01,-5.48E-02,-2.25E+00,1.22E-01,-2.53E+00,
#                 1.78E-01, 1.00E-01,-1.15E-01,-7.72E-04 ],
# 'psa01'   => [  7.82E-01,9.24E-01,-5.56E-02,-2.17E+00,1.19E-01,-2.10E+00,
#                 1.48E-01, 2.85E-01,-1.32E-01,-9.90E-04 ],
# 'psa0125' => [  5.36E-01,9.65E-01,-5.84E-02,-2.11E+00,1.21E-01,-1.67E+00,
#                 1.16E-01, 3.43E-01,-1.32E-01,-1.13E-03 ],
# 'psa0158' => [  1.19E-01,1.06E+00,-6.47E-02,-2.05E+00,1.19E-01,-1.36E+00,
#                 9.16E-02, 5.16E-01,-1.50E-01,-1.18E-03 ],
# 'psa02'   => [ -3.06E-01,1.16E+00,-7.21E-02,-2.04E+00,1.22E-01,-1.15E+00,
#                 7.38E-02, 5.08E-01,-1.43E-01,-1.14E-03 ],
# 'psa0251' => [ -8.76E-01,1.29E+00,-8.19E-02,-2.01E+00,1.23E-01,-1.03E+00,
#                 6.34E-02, 5.81E-01,-1.49E-01,-1.05E-03 ],
  'psa03'   => [ -1.56E+00,1.46E+00,-9.31E-02,-1.98E+00,1.21E-01,-9.47E-01,
                  5.58E-02, 6.50E-01,-1.56E-01,-9.55E-04 ],
# 'psa04'   => [ -2.28E+00,1.63E+00,-1.05E-01,-1.97E+00,1.23E-01,-8.88E-01,
#                 5.03E-02, 6.84E-01,-1.58E-01,-8.59E-04 ],
# 'psa05'   => [ -3.01E+00,1.80E+00,-1.18E-01,-1.98E+00,1.27E-01,-8.47E-01,
#                 4.70E-02, 6.67E-01,-1.55E-01,-7.68E-04 ],
# 'psa0629' => [ -3.75E+00,1.97E+00,-1.29E-01,-2.00E+00,1.31E-01,-8.42E-01,
#                 4.82E-02, 6.77E-01,-1.56E-01,-6.76E-04 ],
# 'psa0794' => [ -4.45E+00,2.12E+00,-1.39E-01,-2.01E+00,1.36E-01,-8.58E-01,
#                 4.98E-02, 7.08E-01,-1.59E-01,-5.75E-04 ],
  'psa10'   => [ -5.06E+00,2.23E+00,-1.45E-01,-2.03E+00,1.41E-01,-8.74E-01,
                  5.41E-02, 7.92E-01,-1.70E-01,-4.89E-04 ],
# 'psa125'  => [ -5.49E+00,2.29E+00,-1.48E-01,-2.08E+00,1.50E-01,-9.00E-01,
#                 5.79E-02, 8.21E-01,-1.72E-01,-4.07E-04 ],
# 'psa1587' => [ -5.75E+00,2.29E+00,-1.45E-01,-2.13E+00,1.58E-01,-9.57E-01,
#                 6.76E-02, 8.67E-01,-1.79E-01,-3.43E-04 ],
# 'psa20'   => [ -5.85E+00,2.23E+00,-1.39E-01,-2.20E+00,1.69E-01,-1.04E+00,
#                 8.00E-02, 8.67E-01,-1.79E-01,-2.86E-04 ],
# 'psa25'   => [ -5.80E+00,2.13E+00,-1.28E-01,-2.26E+00,1.79E-01,-1.12E+00,
#                 9.54E-02, 8.91E-01,-1.80E-01,-2.60E-04 ],
  'psa30'   => [ -5.59E+00,1.97E+00,-1.14E-01,-2.33E+00,1.91E-01,-1.20E+00,
                  1.10E-01, 8.45E-01,-1.72E-01,-2.45E-04 ],
# 'psa3125' => [ -5.59E+00,1.97E+00,-1.14E-01,-2.33E+00,1.91E-01,-1.20E+00,
#                 1.10E-01, 8.45E-01,-1.72E-01,-2.45E-04 ],
# 'psa40'   => [ -5.26E+00,1.79E+00,-9.79E-02,-2.44E+00,2.07E-01,-1.31E+00,
#                 1.21E-01, 7.34E-01,-1.56E-01,-1.96E-04 ],
# 'psa50'   => [ -4.85E+00,1.58E+00,-8.07E-02,-2.53E+00,2.22E-01,-1.43E+00,
#                 1.36E-01, 6.34E-01,-1.41E-01,-1.61E-04 ]
);

#
# Below are the constants from Boore and Atkinson's NGA (Oct, 2006) relation
# that are used for site response.  This is a slight modification of the
# AB06 paper, in which the authors used their May (or June), 2006 NGA
# site response terms.  Here we presume they would have used the October
# terms if they had had them available.
#
use enum qw( e01 e02 e03 e04 e05 e06 e07 e08 mh c01 c02 c03 c04 mref rref h blin vref b1 b2 v1 v2 a1 pga_low a2 sig1 sig2u sigtu sig2m sigtm );

%SITE_CONSTANTS = (
  'pga4nl' => [ -0.96402,-0.96402,-0.96402,-0.96402,0.29795,-0.20341,0,0,7,
                -0.55,0,-0.01151,0,6,5,3,,,,,,,,,,,,,, ],
  'pgv'    => [ 4.4532,4.51767,4.09423,4.48834,0.45085,-0.10979,0,0,8.5,
                -0.8477,0.1154,-0.00622,0,4.5,5,4.4,-0.6,760,-0.5,-0.06,180,
                300,0.03,0.06,0.09,0.518,0.288,0.592,0.26,0.58 ],
  'pga'    => [ -0.99856,-0.96172,-1.21661,-0.97336,0.39558,-0.11161,0,0,7,
                -0.7256,0.1291,-0.01151,0,4.5,5,3.2,-0.36,760,-0.64,-0.14,180,
                300,0.03,0.06,0.09,0.504,0.265,0.571,0.262,0.569 ],
# 'psa005' => [ -0.84198,-0.766,-1.04116,-0.92322,0.35068,-0.10555,0,0,7,
#               -0.587,0.1732,-0.01873,0,4.5,5,3.5,-0.29,760,-0.64,-0.11,180,
#               300,0.03,0.06,0.09,0.583,0.371,0.691,0.371,0.688 ],
# 'psa01'  => [ -0.37686,-0.33311,-0.54806,-0.39319,0.2132,-0.13788,0,0,7,
#               -0.723,0.1302,-0.01367,0,4.5,5,3.8,-0.25,760,-0.6,-0.13,180,
#               300,0.03,0.06,0.09,0.532,0.332,0.626,0.334,0.629 ],
# 'psa02'  => [ -0.01766,0.00306,-0.17626,0.01864,0.4596,-0.15441,0,0,7,
#               -0.642,0.04296,-0.00952,0,4.5,5,4.1,-0.31,760,-0.52,-0.19,180,
#               300,0.03,0.06,0.09,0.525,0.283,0.596,0.288,0.599 ],
  'psa03'  => [ -0.15351,-0.1443,-0.33422,-0.07757,0.55653,-0.17437,0.04545,
                0,7,-0.6005,0.0148,-0.0075,0,4.5,5,4.2,-0.44,760,-0.52,-0.14,
                180,300,0.03,0.06,0.09,0.546,0.267,0.608,0.267,0.608 ],
# 'psa05'  => [ -0.45975,-0.45054,-0.63514,-0.38992,0.69699,-0.13017,0,0,7,
#               -0.753,0.06208,-0.0054,0,4.5,5,4.4,-0.6,760,-0.5,-0.06,180,
#               300,0.03,0.06,0.09,0.555,0.256,0.612,0.258,0.612 ],
  'psa10'  => [ -1.1275,-1.09297,-1.44365,-1.05893,0.71173,-0.19102,0,0,7,
                -0.886,0.1094,-0.00334,0,4.5,5,4.6,-0.7,760,-0.44,0,180,
                300,0.03,0.06,0.09,0.578,0.306,0.654,0.29,0.647 ],
# 'psa20'  => [ -1.90808,-1.8344,-2.26613,-1.96378,0.74397,-0.30693,0.32789,
#               0,7,-0.8917,0.09897,-0.00217,0,4.5,5,4.7,-0.73,760,-0.38,0,
#               180,300,0.03,0.06,0.09,0.585,0.398,0.707,0.389,0.702 ],
  'psa30'  => [ -2.463,-2.37551,-2.85836,-2.55766,0.77873,-0.41884,0.72739,
                0,7,-0.823,0.06829,-0.00191,0,4.5,5,4.8,-0.74,760,-0.34,0,
                180,300,0.03,0.06,0.09,0.571,0.412,0.705,0.403,0.698 ],
# 'psa40'  => [ -2.78767,-2.69556,-3.12615,-2.93089,1.1559,-0.35391,0.7267,
#               0,7,-0.7213,0.03086,-0.00191,0,4.5,5,4.9,-0.75,760,-0.31,0,
#               180,300,0.03,0.06,0.09,0.585,0.391,0.705,0.382,0.698 ],
# 'psa50'  => [ -2.04854,-1.97025,-2.28547,-2.17668,0.16196,-0.38407,0,
#               0,8.5,-0.5429,-0.02974,-0.00202,0,4.5,5,4.9,-0.75,760,-0.3,0,
#               180,300,0.03,0.06,0.09,0.603,0.408,0.728,0.428,0.739 ]
);

sub new {
  my $class = shift;
  my $lat   = shift;
  my $lon   = shift;
  my $mag   = shift;
  my $source_type;
  my $key;

  # ignore the magnitude min, max range if passed as arguments
  
  my $self = { lat=>$lat, lon=>$lon, mag =>$mag };

  # If there is a fault model specified, extract it.
  foreach (@_) { 
    $self->{fault} = $_ if (ref $_ eq 'ARRAY');
    if (ref $_ eq 'Source') {
      $self->{depth} = $_->depth;
      $source_type = $_->type;
    }
  }
  if (defined $source_type) {
    print "Regression: AB06 does not support a source type; ignoring.\n";
  }
  if (not defined $self->{depth} and not defined $self->{fault}) {
    die "Must define either event depth (in event.xml) or fault geometry";
  }

  foreach $key ( keys %CONSTANTS ) {
    $self->{ bias }->{$key} = 1;
  }
  
  $self->{dist} = \&Shake::Distance::dist_rrup;
#  $self->{sitecorr} = \&site_correct_ba_oct06_nga;

  bless $self, $class;
}


#
# Complete suite of "maximum component" amplitude values at the given 
# lat, lon location (magnitude and source coordinates were loaded when the 
# regression object was created). Values returned as a hash with the keys
# found in %CONSTANTS 
# Multiply by $SCALE_PEAK to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
#
sub maximum {
  my $this = shift;
  my %hash = $this->random(@_);
  my $key;

  for $key (keys %hash) {
    $hash{$key} *= $SCALE_PEAK;
  }
  return (%hash);
}

#
# Complete suite of "random component" amplitude values at the given lat, 
# lon location (magnitude and source coordinates were loaded when the 
# regression object was created). Values returned as a hash with keys 
# found in %CONSTANTS 
# These are values for some random component rather than the maximum,
# therefore they do *not* have the $SCALE_PEAK multiplicative factor
# (Boore, Campbell, personal communication)
#
sub random {
  my ($this,$lat,$lon,$dist,$type) = @_;
  my $key;

  if (defined $dist and $dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rcd = (defined $dist) ? $dist : dist_rrup($lat,$lon,$this);
  my $f0  = _max(_log_base(10,10/$Rcd), 0);
  my $f1  = _min(_log_base(10, $Rcd), _log_base(10,70));
  my $f2  = _max(_log_base(10, $Rcd/140), 0);

  my(%hash);
  
  #-----------------------------------------------------------------------
  # For accelerations, scale "cm/s^2" to %g by dividing by 9.8
  #-----------------------------------------------------------------------
  if (not defined $type) {
    foreach $key (keys %CONSTANTS) {
      $hash{$key} = _psa_formula($this,$Rcd,$key,$f0,$f1,$f2) / 9.8;
    }
    $hash{pgv} = $hash{pgv} * 9.8;
  } else {
    $hash{$type} = _psa_formula($this,$Rcd,$type,$f0,$f1,$f2) / 9.8;
    $hash{pgv} = $hash{pgv} * 9.8 if $type eq 'pgv';
  }
  return(%hash);
}

# Complete suite of standard deviation for the parameters given by random().
# Values returned as a hash with the same keys as returned by random().
# For AB06, this is a (weirdly) constant value for all frequencies
#
sub sd {
  my $this  = shift;
  my(%hash,$key);
  my $val = 10**0.30;

  %hash = ();
  foreach $key (keys %CONSTANTS) {
    $hash{$key} = $val;
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
  my $this = shift;
  my $Rcd  = shift;
  my $type = shift;
  my $f0   = shift;
  my $f1   = shift;
  my $f2   = shift;
  my $c    = $CONSTANTS{$type};
  my $M    = $this->{'mag'};
  my $m    = $MECHANISM{$this->{type}};  # The source type, not to be confused
                                         # with $type, the GM type

  my $logY = $c->[c1] + $c->[c2]*$M + $c->[c3]*($M**2)
           + ($c->[c4] + $c->[c5] * $M) * $f1
           + ($c->[c6] + $c->[c7] * $M) * $f2
           + ($c->[c8] + $c->[c9] * $M) * $f0
           + $c->[c10] * $Rcd;

  return 10**$logY;
}

sub Flin {
  my $V30  = shift;
  my $type = shift;
  my %Flin;
  my $c;
  my $key;

  return 0 if (defined $type and $type eq 'pga4nl');

  #
  # These are from BA06, so they're natural logs, not common logs
  #
  if (defined $type) {
    $c = $SITE_CONSTANTS{$type};
    $Flin{$type} = $c->[blin] * log($V30 / $c->[vref]);
  } else {
    foreach $key (keys %SITE_CONSTANTS) {
      next if $key eq 'pga4nl';
      $c = $SITE_CONSTANTS{$key};
      $Flin{$key} = $c->[blin] * log($V30 / $c->[vref]);
    }
  }
  return %Flin;
}

sub Fnl {
  my $this = shift;
  my $V30  = shift;
  my $sta  = shift;
  my $type = shift;

  my $pgarx;
  my ($lat,$lon);
  my ($c, $bnl, %Fnl);
  my ($dx, $dy, $cc, $dd);
  my ($key, @types);

  return 0 if (defined $type and $type eq 'pga4nl');

  if (ref $sta eq 'Station') {
    $lat = $sta->lat();
    $lon = $sta->lon();
    $pgarx = $sta->peak('pga');
#carp sprintf("undefined pga for station %s",$sta->code()) if not defined $pgarx;
  } else {
    ($lat,$lon,$pgarx) = @{$sta}{'lat','lon','pga'};
#carp "undefined pga for grid loc $lat $lon" if not defined $pgarx;
  }

  unless (defined $pgarx) {
    my %dummy = $this->random($lat,$lon,'pga');
    $pgarx = $dummy{pga};
#print "WARNING: ";
#(ref $sta eq 'Station') ? print $sta->code() : print "$lat,$lon";
#printf " undefined pgarx, recalculating: %.6f\n", $pgarx;
  }

  # The formula wants g, not %g

  $pgarx = $pgarx / 100.0;

  #
  # These are from BA06, so they're natural logs, not common logs
  #

  if (defined $type) {
    @types = ( $type );
  } else {
    @types = ( keys %SITE_CONSTANTS );
  }
  foreach $key ( @types ) {
    next if $key eq 'pga4nl';
    $c = $SITE_CONSTANTS{$key};
    if ($V30 <= $c->[v1]) {
      $bnl = $c->[b1];
    } elsif ($V30 <= $c->[v2]) {
      $bnl = ($c->[b1]-$c->[b2]) * log($V30/$c->[v2]) / log($c->[v1]/$c->[v2]) 
           + $c->[b2];
    } elsif ($V30 <= $c->[vref]) {
      $bnl = $c->[b2] * log($V30/$c->[vref]) / log($c->[v2]/$c->[vref]);
    } else {
      $bnl = 0;
    }
    $dx = log($c->[a2]/$c->[a1]);
    $dy = $bnl * log($c->[a2]/$c->[pga_low]);
    $cc = (3 * $dy - $bnl * $dx) / $dx**2;
    $dd = -(2 * $dy - $bnl * $dx) / $dx**3;
    if ($pgarx <= $c->[a1]) {
      $Fnl{$key} = $bnl * log($c->[pga_low]/0.1);
    } elsif ($pgarx <= $c->[a2]) {
      $Fnl{$key} = $bnl * log($c->[pga_low]/0.1) 
                 + $cc * (log($pgarx/$c->[a1]))**2
                 + $dd * (log($pgarx/$c->[a1]))**3;
    } else {
      $Fnl{$key} = $bnl * log($pgarx/0.1);
    }
  }
  return %Fnl;
}

#
# The BA06 site corrections are in natural log units, so we exp() them 
# rather than 10** them.
#
sub site_correct_ba_oct06_nga {
  my $this = shift;
  my $V30  = shift;
  my $sta  = shift;

  $V30 = $VS30_DEFAULT unless ($V30 and $V30 > 0);
  #die ("Bad V30") if not defined $V30 or $V30 == 0;

  my %Flin = Flin($V30);
  my %Fnl  = Fnl($this,$V30,$sta);
  my %Fs;
  my $key;

  foreach $key (keys %Flin) {
    $Fs{$key} = exp($Flin{$key} + $Fnl{$key});
#printf "Sta %s Vs30: $V30 site: $key -> $Fs{$key}\n", 
#(ref $sta eq 'Station') ? (sprintf "Sta: %s", $sta->code()) : (sprintf "%f %f", @{$sta}{'lat','lon'});
  }

  return %Fs;
}

sub _max {
  my ($a,$b) = @_;
  
  return $a if $a >= $b;
  return $b;
}

sub _min {
  my ($a,$b) = @_;
  
  return $a if $a <= $b;
  return $b;
}

1;
