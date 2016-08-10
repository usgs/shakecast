package Regression::AB95_table;

use strict;
use Shake::Regression::Common_reg;
use Shake::Distance;
use Shake::Source;
use vars qw( $Vs $SCALE_PEAK %TABLE %CONSTANTS %SIGMA );
use Carp;

# Regression taken from personal communication with SanLinn Isma'il Kaka
# (modified from Atkinson & Boore 1995, BSSA 85 pp 17-30)
# Requires the files table_<param>.xyz which are the values of the
# parameter (pga, pgv, or 03/10/30 => 0.3, 1.0, 2.0 sec psa) for given
# M and Rhypo. Note that M is constrainted to range 2.5 - 7.5 and Rhypo 
# between 10 km and 1000 km. 
#
# This regression has a custom site correction method site_correct_ab02().
# 'grind' now checks the $regress->{sitecorr} for a reference to this method
# and uses it instead of the default site correction.

# multiply by 1.15 to get maximum rather than random 
# component as derived (Boore, Campbell, personal communication)
$SCALE_PEAK = 1.15;

# log10(y) = c1 + c3*M + c3*h + c4*R -g log R + c5*sl*Sc + c7*sl + c7*sl*Se

# $CONSTANTS{faulttype}{paramtype}[0] is frequency of parameter
# zero frequency ===> PGA

# V 2.0 5-27-2003 vq
# New format for amplitudes functions: 
#  <hash> = $obj->maximum($lat,$lon[,$dist][,$type]);
#  <hash> = $obj->random($lat,$lon[,$dist][,$type]);
#
#  If $dist is specified, then it will not be recomputed.

sub fill_table {
  my %FILE;
  $FILE{interface} = 
    { 'pga'   => 'table_pga.xyz',
      'pgv'   => 'table_pgv.xyz',
      'psa03' => 'table_03.xyz', 
      'psa10' => 'table_10.xyz',
      'psa30' => 'table_30.xyz',
    };
  $FILE{intraslab} = $FILE{interface};
  
  print "Reading AB95 tables.\n";
  foreach my $source (keys %FILE) {
    foreach my $type (keys %{$FILE{$source}}) {
      my $file = "/home/shake/ShakeMap/perl/lib/Shake/Regression/$FILE{$source}{$type}";
      open INTABLE,$file
	or die "Could not open $file";
      while (my $line = <INTABLE>) {
	my ($m,$r,$val) = split /\s+/,$line;
	$m = int ($m*10);
	$r = int ($r);
	$TABLE{$source}{$type}[$m][$r] = $val;
      }
      close INTABLE;
    }
  }
}

#AB02 constants required for site correction
$CONSTANTS{interface} = 
  { 'pga'   => [ 0.0,2.9910,0.03525,0.00759,-0.00206,0.19,0.24,0.29 ],
    'psa03' => [ 2.5,2.5249,0.14770,0.00728,-0.00235,0.13,0.37,0.38 ],
    'psa10' => [ 1.0,2.1442,0.13450,0.00521,-0.00110,0.10,0.30,0.55 ],
    'psa30' => [ 0.333,2.3010,0.02237,0.00012, 0.00000,0.10,0.25,0.36 ],
  };
$CONSTANTS{intraslab} = 
  { 'pga'   => [ 0.0,-0.04713,0.6909,0.01130,-0.00202,0.19,0.24,0.29 ],
    'psa03' => [ 2.5,0.005445,0.7727,0.00173,-0.00178,0.13,0.37,0.38 ],
    'psa10' => [ 1.0,-1.02133,0.8789,0.00130,-0.00173,0.10,0.30,0.55 ],
    'psa30' => [ 0.333,-3.70012,1.1169,0.00615,-0.00045,0.10,0.25,0.36 ],
  };


# standard deviation values
# Note, the standard deviation values are defined in log-amplitude 
# space, so when applied in liner-amplitude space they are
# multiplicative rather than additive factors.
$SIGMA{interface} = {'pga'     => 0.23,
		     'pgv'     => 0.29,
		     'psa03'   => 0.29,
		     'psa10'   => 0.34,
		     'psa30'   => 0.36,
		    };
$SIGMA{intraslab} = {'pga'     => 0.27,
		     'pgv'     => 0.235,
		     'psa03'   => 0.28,
		     'psa10'   => 0.29,
		     'psa30'   => 0.30,
		    };


sub new {

  my $class = shift;
  my $lat   = shift;
  my $lon   = shift;
  my $mag   = shift;

  fill_table() unless (defined %TABLE);
  # ignore the magnitude min, max range if passed as arguments

  my $self = { lat=>$lat, lon=>$lon, mag =>$mag};

  # If there is a fault model or parameter hash specified, extract it.
  foreach (@_) {
    if (ref $_ eq 'ARRAY') {
      $self->{fault} = $_;
    }
    if (ref $_ eq 'Source') {
      $self->{depth} = $_->depth;
      $self->{type} = $_->type;
    }
  }
  
  die "Parameter 'depth' required in event.xml" 
    unless (defined $self->{depth});
  
  unless (defined $self->{type} and ($self->{type} =~ /^interface|intraslab$/)) {
    print "Parameter 'type' (interface or intraslab) undefined, assuming interface\n";
    $self->{type} = 'interface';
  }
  if (defined $self->{fault}) {
    print "WARNING: This regression uses hypocentral distance, finite fault is ignored\n";
  }
  
  $self->{ bias } = { pga   => 1,
		      pgv   => 1,
		      psa03 => 1,
		      psa10 => 1,
		      psa30 => 1 };

  bless $self, $class;
  
#  $self->{sitecorr} = sub { $self->site_correct_ab02(@_) };

  $self->{dist} = \&Shake::Distance::dist_hypo;
  $self->{sitecorr} = \&site_correct_ab02;

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
  
  $type = 'pga' if ($type eq 'acc');
  $type = 'pgv' if ($type eq 'vel');

  if ($dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rhyp = (defined $dist) ? $dist :
    $this->{dist}->($lat,$lon,$this);
  my $M   = $this->{mag};
  my $H = $this->{depth};
  my $source_type = $this->{type};

  if ($source_type =~ /(interface|intraslab)/) {
    $source_type = $1;
  }
  else {
    die "Unknown source type $source_type";
  }  
 
  # DEBUG
#  `echo $lat $lon $Rhyp >> absurf_dump.xy`;
  
  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients) 
  # scale "cm/s^2" to %g
  #-----------------------------------------------------------------------
  my(%hash);

  foreach my $comp (keys %{$TABLE{$source_type}}) {
    if (not defined $type or $type eq $comp) {
      $hash{$comp}   = _psa_formula($M,$Rhyp,$TABLE{$source_type}{$comp},$CONSTANTS{$source_type}{$comp})
      * $SCALE_PEAK;

      $hash{$comp} /= 9.81 unless ($comp eq 'pgv');

    }
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

  $type = 'pga' if ($type eq 'acc');
  $type = 'pgv' if ($type eq 'vel');

  if ($dist =~ /^pga|pgv|acc|vel|psa/) {
    $type = $dist;
    $dist = undef;
  }

  my $Rhyp = (defined $dist) ? $dist :
    $this->{dist}->($lat,$lon,$this);

  my $M   = $this->{mag};
  my $H = $this->{depth};
  my $source_type = $this->{type};
  
  # DEBUG
  `echo $lat $lon $Rhyp >> absurf_dump.xy`;

  #-----------------------------------------------------------------------
  # For PGA, SA 0.3 sec, SA 1.0 sec, SA 3.0 sec (using 2.0 sec coefficients)
  # scale "cm/s^2" to %g
  #-----------------------------------------------------------------------
  my(%hash);

  foreach my $comp (keys %{$TABLE{$source_type}}) {
    if (not defined $type or $type eq $comp) {
      $hash{$comp}   = _psa_formula($M,$Rhyp,$TABLE{$source_type}{$comp},$CONSTANTS{$source_type}{$comp});
      $hash{$comp} /= 9.81 unless ($comp eq 'pgv');
    }
  }
  return(%hash);
}

#-----------------------------------------------------------------------
# The site correction for this regression is of the form
#    10**(c5*sl*Sc + c6*sl*Sd + c7*sl*Se)
#  where sl is a nonlinearity factor, and Sc,Sd,Se are shear velocity bins
#-----------------------------------------------------------------------
sub site_correct_ab02 {

  my $this = shift;
  my $vel = shift;
  my $sta = shift;

  my $sc = 0;
  my $sd = 0;
  my $se = 0;
  my $sl = 0;

  my %cons = %{$CONSTANTS{$this->{type}}};
  my $pgarx;
  
  my ($lat,$lon);
  if (ref $sta eq 'Station') {
    $lat = $sta->lat();
    $lon = $sta->lon();
    
    $pgarx = $sta->peak('pga');
  }
  else {
    ($lat,$lon,$pgarx) = @{$sta}{'lat','lon','pga'};
  }

  unless (defined $pgarx) {
    my %dummy = $this->maximum($lat,$lon,'pga');
    $pgarx = $dummy{pga};
    print "WARNING: ";
    (ref $sta =~ /^Regression::/) ? print $sta->code() : print "$lat,$lon";
    printf " undefined pgarx, recalculating.\n";
  }
  
  # Determine velocity bin
  if ($vel>360) { $sc = 1; }
  elsif ($vel<180) { $se = 1; }
  else {$sd = 1; }

  my $f;
  my @c;
  my %correction;

  foreach ('pga','psa03','psa10','psa30') {
    
    unless (defined $vel) {
      $correction{$_} = 1.0;
      next;
    }

    @c = @{$cons{$_}};
    $f = $c[0];          # Frequency
    $f = 10 if ($f==0);  # Remember, c[0]==0 denotes PGA

    $correction{$_} = -$c[5]; # Assume original 'base rock' is NEHRP C
    
    # Compute sl (nonlinearity factor)

    if ($pgarx<100 or $f<1) {
      $sl = 1;
    }
    elsif ($pgarx>500) {
      $sl = 0;
      $correction{$_} = 0;
      next;
    }
    elsif ($f>1 and $f<2) {
      $sl = 1-($f-1)*($pgarx-100)/400;
    }
    else {
      $sl = 1-($pgarx-100)/400;
    }

    $correction{$_} += $sl*($c[5]*$sc + $c[6]*$sd + $c[7]*$se);
    $correction{$_} = 10**$correction{$_};
  }
  $correction{acc} = $correction{pga};
  $correction{pgv} = $correction{psa10};
  $correction{vel} = $correction{pgv};

  return %correction;
}

# Complete suite of standard deviation for the parameters given by peak().
# Values returned as a hash with the same keys as returned by peak().
sub sd {
  my $this  = shift;
  my(%hash,$key);

  my %sigma = %{$SIGMA{$this->{type}}};

  %hash = ();
  foreach $key (keys %sigma) {
    if (not defined $sigma{$key}) {
      $hash{$key} = undef;
      next;
    }
    $hash{$key} = $sigma{$key};
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
  my $M = shift;
  my $R = shift;
  my $table = shift;
  my $c = shift;
  my $psa; 
  
  $M = 2.5 if ($M < 2.5);
  $M = 7.5 if ($M > 7.5);
  $R = 10 if ($R < 10);
  $R = 1000 if ($R > 1000); 

  $M = int($M*10);
  $R = int ($R + 0.5);
  $psa = $table->[$M][$R];

  #$psa += $c->[5]; # Convert to NEHRP C

  $psa = 10**($psa);

  return $psa;
}

1;

