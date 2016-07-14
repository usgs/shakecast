package Regression::BA_Oct06_NGA;

# Module to generate PGA/PGV/SA for a given a distance and magnitude.
# Regression from Boore and Atkinson Provisional NGA Model v. 1.6 (Oct, 2006)
#
# Allowable source "type" arguments are:
#	ALL = the same as unspecified, an average of all types
#	SS  = strike slip
#       RS  = reverse slip (i.e., thrust)
#       NS  = normal
#
# as module 04-25-07 cbw

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
use vars qw( $SCALE_PEAK $VS_DEFAULT %CONSTANTS %MECHANISM );
use Carp;

# multiply by 1.15 to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
$SCALE_PEAK = 1.15;
$VS_DEFAULT = 760;

use enum qw( e01 e02 e03 e04 e05 e06 e07 e08 mh c01 c02 c03 c04 mref rref h blin vref b1 b2 v1 v2 a1 pga_low a2 sig1 sig2u sigtu sig2m sigtm );

%CONSTANTS = (
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

use enum qw( U S N R );

%MECHANISM = (
  'ALL' => [ 1,0,0,0 ],		# Unspecified mechanism
  'SS'  => [ 0,1,0,0 ],		# Strike-slip
  'NS'  => [ 0,0,1,0 ],		# Normal
  'RS'  => [ 0,0,0,1 ]		# Reverse (thrust fault)
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
    $source_type = $_->type if (ref $_ eq 'Source');
  }
  
  if (!defined $source_type) {
    print "Regression: No source mechanism specified. Using default.\n";
  }
  elsif ($source_type =~ /(SS|RS|NS|ALL)/i) {
    $source_type = uc $1;
    print "Regression: Source mechanism: $source_type.\n";
  }
  else {
    print "Regression: Unknown source mechanism '$source_type'. Using default.\n";
    undef $source_type;
  }
  $source_type = 'ALL' unless (defined $source_type);
  $self->{type} = $source_type;

  foreach $key ( keys %CONSTANTS ) {
    $self->{ bias }->{$key} = 1;
  }
  
# Don't set this as it will make grind think we are using a distance-to-
# rupture method and will use the wrong median distance formula.
#
#  $self->{dist} = \&Shake::Distance::dist_rjb;

  $self->{sitecorr} = \&site_correct_ba_oct06_nga;

  bless $self, $class;
}


# Complete suite of "maximum component" amplitude values at the given 
# lat, lon location (magnitude and source coordinates were loaded when the 
# regression object was created). Values returned as a hash with the keys
# found in %CONSTANTS 
# Multiply by $SCALE_PEAK to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
sub maximum {
  my $this = shift;
  my %hash = $this->random(@_);
  my $key;

  for $key (keys %hash) {
    $hash{$key} *= $SCALE_PEAK;
  }
  return (%hash);
}

# Complete suite of "random component" amplitude values at the given lat, 
# lon location (magnitude and source coordinates were loaded when the 
# regression object was created). Values returned as a hash with keys 
# found in %CONSTANTS 
# These are values for some random component rather than the maximum,
# therefore they do *not* have the $SCALE_PEAK multiplicative factor
# (Boore, Campbell, personal communication)
sub random {
  my ($this,$lat,$lon,$dist,$type) = @_;
  my $key;

  if (defined $dist and $dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rjb = (defined $dist) ? $dist : dist_rjb($lat,$lon,$this);
  my(%hash);
  
  #-----------------------------------------------------------------------
  # For accelerations, scale "g" to %g by multiplying by 100
  #-----------------------------------------------------------------------
  if (not defined $type) {
    foreach $key (keys %CONSTANTS) {
      next if $key eq 'pga4nl';
      $hash{$key} = _psa_formula($this,$Rjb,$key) * 100;
    }
    $hash{pgv} = $hash{pgv} / 100;
  } else {
    $hash{$type} = _psa_formula($this,$Rjb,$type) * 100;
    $hash{pgv} = $hash{pgv} / 100 if $type eq 'pgv';
  }
  return(%hash);
}

# Complete suite of standard deviation for the parameters given by peak().
# Values returned as a hash with the same keys as returned by peak().
sub sd {
  my $this  = shift;
  my(%hash,$key,$sidx);

  if ($this->{type} eq 'ALL') {
    $sidx = sigtu;
  } else {
    $sidx = sigtm;
  }

  %hash = ();
  foreach $key (keys %CONSTANTS) {
    next if $key eq 'pga4nl';
    $hash{$key} = exp($CONSTANTS{$key}->[$sidx]);
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
  my $Rjb  = shift;
  my $type = shift;
  my $c    = $CONSTANTS{$type};
  my $M    = $this->{'mag'};
  my $m    = $MECHANISM{$this->{type}};  # The source type, not to be confused
                                         # with $type, the GM type

  my $lnY = FM($M,$c,$m) + FD($Rjb,$M,$c);

  return exp($lnY);
}

sub FM {
  my $M = shift;
  my $c = shift;
  my $m = shift;
  my ($ea, $eb);

  if($M <= $c->[mh]) {
    $ea = $c->[e05];
    $eb = $c->[e06];
  } else {
    $ea = $c->[e07];
    $eb = $c->[e08];
  }

  my $mdiff = $M - $c->[mh];
  my $Fm = $c->[e01]*$m->[U] + $c->[e02]*$m->[S] + $c->[e03]*$m->[N] 
         + $c->[e04]*$m->[R] + $ea*$mdiff + $eb*$mdiff**2;
  return $Fm;
}

sub FD {
  my $Rjb   = shift;
  my $M     = shift;
  my $c     = shift;
  my $r     = sqrt($Rjb**2 + $c->[h]**2);
  my $mdiff = $M - $c->[mref];

  my $Fd = ($c->[c01] + $c->[c02]*$mdiff) * log($r/$c->[rref])
         + ($c->[c03] + $c->[c04]*$mdiff) * ($r - $c->[rref]);
  return $Fd;
}

sub Flin {
  my $V30  = shift;
  my $type = shift;
  my %Flin;
  my $c;
  my $key;

  return 0 if (defined $type and $type eq 'pga4nl');

  if (defined $type) {
    $c = $CONSTANTS{$type};
    $Flin{$type} = $c->[blin] * log($V30 / $c->[vref]);
  } else {
    foreach $key (keys %CONSTANTS) {
      next if $key eq 'pga4nl';
      $c = $CONSTANTS{$key};
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
    my %dummy = $this->random($lat,$lon,'pga4nl');
    $pgarx = $dummy{pga4nl};
#print "WARNING: ";
#(ref $sta eq 'Station') ? print $sta->code() : print "$lat,$lon";
#printf " undefined pgarx, recalculating: %.6f\n", $pgarx;
  }

  # The formula wants g, not %g

  $pgarx = $pgarx / 100.0;

  if (defined $type) {
    @types = ( $type );
  } else {
    @types = ( keys %CONSTANTS );
  }
  foreach $key ( @types ) {
    next if $key eq 'pga4nl';
    $c = $CONSTANTS{$key};
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

sub site_correct_ba_oct06_nga {
  my $this = shift;
  my $V30  = shift;
  my $sta  = shift;

  $V30 = $VS_DEFAULT unless (defined $V30 and $V30 > 0);

  my %Flin = Flin($V30);
  my %Fnl  = Fnl($this,$V30,$sta);
  my %Fs;
  my $key;

  foreach $key (keys %Flin) {
    $Fs{$key} = exp($Flin{$key} + $Fnl{$key});
#printf "Sta %s Vs30: $V30 site: $key -> $Fs{$key}\n",
#(ref $sta eq 'Station') ? (sprintf "Sta: %s", $sta->code()) : (sprintf "%f %f",
#@{$sta}{'lat','lon'});
  }

  return %Fs;
}
  
1;
