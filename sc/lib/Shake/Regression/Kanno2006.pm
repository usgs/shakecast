package Regression::Kanno2006;

use strict;
use Shake::Regression::Common_reg;
use Shake::Distance;
use Shake::Graphics_2D;
use Shake::Source;
use vars qw($Vs $SCALE_PEAK %CONSTANTS %SIGMA);
use Carp;

$Vs=724; #BC NEHRP
$SCALE_PEAK = 1.15;

# Regression taken from Kanno 2006 (BSSA vol 96, June 2006)
# coefficient definitions modeled on Youngs97.pm

%CONSTANTS = ('pga' => {a1=> 0.56, b1=> -0.0031, c1=>0.26, d1=>0.0055, a2=>0.41, b2=> -0.0039, c2=>1.56, p=>-0.55, q=>1.35},
              'pgv' => {a1=> 0.70, b1=> -0.0009, c1=>-1.93, d1=>0.0022, a2=>0.55, b2=>-0.0032, c2=>-0.57, p=>-0.71,q=>1.77},
	      'psa03' =>{a1=>0.56, b1=>-0.0026, c1=>0.51, d1=>0.0039, a2=>0.43, b2=>-0.0038, c2=>1.75, p=>-0.80, q=>1.96},
	      'psa10' =>{a1=>0.71, b1=>-0.0009, c1=>-1.04, d1=>0.0021, a2=>0.57, b2=>-0.0022, c2=>0.08,p=>-0.93,q=>2.32},
	      'psa30' =>{a1=>0.86, b1=>-0.0002, c1=>-2.72, d1=>0.0021, a2=>0.73, b2=>-0.0017, c2=>-1.72, p=>-0.68,q=>1.70},
	      );
	   
%SIGMA = ('pga' => {eps1=> 0.37, eps2=> 0.40},
    	  'pgv' => {eps1=> 0.32, eps2=> 0.36},
	  'psa03' => {eps1=>0.39, eps2=> 0.42},
	  'psa10' => {eps1=>0.41, eps2=> 0.41},
	  'psa30' => {eps1=>0.38, eps2=> 0.39},
	  );

sub new {
 my $class = shift;
 my $lat = shift;
 my $lon = shift;
 my $mag = shift;
 
 my $self = {lat=>$lat, lon=>$lon, mag=>$mag};
 
 #If there is a fault model or parameter hash specified, extract it.
 
 foreach (@_) {
  if (ref $_ eq 'ARRAY') {
  	$self->{fault} = $_;
	}
  if (ref $_ eq 'Source') {
  	$self->{depth} = $_->depth;
	$self->{type} = undef;
# Kanno 2006 does not depend on source mechanism
        }
	}

   $self->{bias} = { pga=> 1,
   		     pgv=> 1,
		     psa03=> 1,
		     psa10=> 1,
		     psa30=> 1 };
	
  die "Parameter 'depth' required in event.xml" unless (defined $self->{depth} and $self->{depth}>0);
  
  bless $self, $class;
  
  if ( defined $self->{fault}) {
  $self->{dist} = \&Shake::Distance::dist_rrup;
  } else {
  $self->{dist} = \&Shake::Distance::dist_hypo;
  }
  
  $self->{sitecorr} = \&site_correct_Kanno2006;

  return $self;
  }
  

  sub maximum {

my ($this,$lat,$lon,$dist,$type) =@_;

if ($dist =~ /^pga|pgv|acc|vel|psa/ ) {
	$type = $dist;
	$dist = undef;
}

my $R = (defined $dist) ? $dist :
$this->{dist}->($lat,$lon,$this);

my $M = $this->{mag};
my $D = $this->{depth};
  die "Parameter 'depth' required in event.xml" unless (defined $this->{depth} and $this->{depth}>0);
  die "Got zero distance-- cannot handle (did you use a finite fault without any depth terms?)\n"
    unless ($R > 0);
	  
my(%hash);
# convert pga, psa from cm/s/s to %g
if (not defined $type or $type eq 'pga'){
	$hash{pga} = (_psa_formula($M,$R,$D,%{$CONSTANTS{'pga'}})/9.81) / 1.067;
	}
if (not defined $type or $type eq 'pgv') {	
	$hash{pgv} = (_psa_formula($M,$R,$D,%{$CONSTANTS{'pgv'}})) / 1.067;
	}
if (not defined $type or $type eq 'psa03') {	
	$hash{psa03} = (_psa_formula($M,$R,$D,%{$CONSTANTS{'psa03'}})/9.81) / 1.067;
	}
if (not defined $type or $type eq 'psa10') {
	$hash{psa10} = (_psa_formula($M,$R,$D,%{$CONSTANTS{'psa03'}})/9.81) / 1.067;
  	}
  if (not defined $type or $type eq 'psa30') {
	  $hash{psa30} = (_psa_formula($M,$R,$D,%{$CONSTANTS{'psa30'}})/9.81) / 1.067;
	}
  return(%hash);
  }
  
sub random {
	  
  my $this = shift;
  my %hash = $this->maximum(@_);
  my $key;

  for $key (keys %hash) {
    $hash{$key} /= $SCALE_PEAK;
  }
	  
  return(%hash);
}
  
  
  sub site_correct_Kanno2006 {
	  
my $this = shift;
my $vel = shift;
my $sta = shift;



  my %cons = %CONSTANTS;
  my ($lat,$lon);
  my %c;
  my %correction;
  
  foreach ('pga','pgv','psa03','psa10','psa30',) {
	  unless (defined $vel and $vel>0) {
		  $correction{$_}=1.0;
		  next;
	  }
	  
	  %c = %{$CONSTANTS{$_}};
	  
	  $correction{$_}= $c{p}*log($vel)/log(10) + $c{q};
	  $correction{$_}=10**$correction{$_};
  }	  
	  $correction{acc}=$correction{pga};
	  $correction{vel}=$correction{pgv};
 	  
	  return %correction;
  }
	  
  
  sub sd {
	  my $this = shift;
	  my(%hash,$key);
	  my $D = $this->{depth};
	  %hash=();
	  
	  foreach $key (keys %SIGMA) {
		  if (not defined $SIGMA{$key}) {
			  $hash{$key}=undef;
			  next;
		  }
		  
		  if ($D <= 30) 
		  { $hash{$key}= 10**($SIGMA{$key}{eps1}); }
		  elsif ($D > 30)
		  {$hash{$key}=10**($SIGMA{$key}{eps2});}
	  }		  
		  return %hash;
  }
  
  sub bias {
	  my $this = shift;
	  
	  if (@_) {
		  my $bias = shift;
		  
		  if (ref $bias ne "HASH"){
			  return;
		  }
		  $this->{bias} = $bias;
	  }
	  $this->{bias};
  }
  
  sub _psa_formula {
	  my $M = shift;
	  my $R = shift;
	  my $D = shift;
	  my %c = @_;
	  my $psa;
	 
  print "M:$M R:$R\n";
 
  if ($D <= 30)
  {$psa = $c{a1}*$M + $c{b1}*$R - log($R + $c{d1}*10**(0.5*$M))/log(10) + $c{c1};}
  elsif ($D > 30)
  {$psa = $c{a2}*$M + $c{b2}*$R - log($R)/log(10) + $c{c2}; }
  
  $psa = 10**($psa);
  return $psa;
  }
  
  1;
