package Vector;

#       @(#)Vector.pm       1.0     01/09/01        TriNet

use strict;
use Carp;
use Exporter ();

use vars qw(@ISA @EXPORT);
require Exporter;

@Shake::Vector::ISA = qw( Exporter );

########################################################################
#=head1
#
# Vector
#
# Purpose:
# Vector math for computing regressions. 
#
# External Interface:
#   Constructors:
#     $vec = Vector->new( [array of x,y,z components] or $vec2 );
#
#   Member Functions:
#     $vec = $vec->neg();          Same as $vec = -$vec    
#     $vec->norm();                Changes $vec, returns $vec
#     $vec = $v1 + $v2;
#     $vec = $v1 - $v2;
#     $vec = $v1 . $v2;           Dot product if both Vectors, else treat as string
#     $vec = $v1 x $v2;           Cross product if both Vectors, else treat as string
#     $length2 = $vec->len();     Stores this value internally, since sqrts are expensive
#     $length2 = $vec->len2();    Squared length (cheaper than len())
#     $string = $vec->string();
#     @array = $vec->array();
#
# =cut
########################################################################

sub new {
  my $class = shift;
  my $data = shift;
  
  my $self = [];
  my @data;
  
  if (ref $data eq '') {
    @data = (0,0,0,0);
  }
  elsif (ref $data eq 'ARRAY') {
    @data = @$data;
    croak "Malformed array for Vector (must be ref to 3-element array)" 
      if ($#data!=2);
  }
  elsif (ref $data eq 'Vector') {
    @data = (@$data);
  }
  else { croak "Vector->new() parameter must be array, Vector, or null"; }

  $self = \@data;
  bless $self,ref $class || $class;
  return $self;
}

use overload
     'neg' => \&neg,
      '""' => \&string,
       '+' => \&add,
       '-' => \&subtr,
       '*' => \&mult,
       'x' => \&cross, # Redefines of the string function
       '.' => \&dot,   # Includes regular string concatenation
  'fallback' => 1;

# Negative of vector
sub neg {
  my $self = shift;
  my $vec = Vector->new();


  $vec->[0] = -($self->[0]);
  $vec->[1] = -($self->[1]);
  $vec->[2] = -($self->[2]);

  return $vec;
}

# Normalize vector
sub norm {
  my $self = shift;
  my $len;

  if (($len=$self->len2) == 0) {
    $self = [0,0,0,0];
    return $self;
  }

  $len = sqrt($len);
  $self->[0] = ($self->[0])/$len;
  $self->[1] = ($self->[1])/$len;
  $self->[2] = ($self->[2])/$len;
  $self->[3] = 1;

  return $self;
}

# Length of vector
sub len {
  my $self = shift;
  
  return sqrt($self->len);
}

# Squared length of vector
sub len2 {
  my $self = shift;
  # Length is stored in index 3. Saves on recomputing.
  
  if (!defined $self->[3]) {
    $self->[3] = ($self->[0])**2 + ($self->[1])**2 + ($self->[2])**2;
  }
  
  return $self->[3];
}

# Add two vectors together
sub add {
  my ($a,$b,$flip) = @_;

  croak "$a + $b: both arguments must be vectors" unless (ref $a eq 'Vector' and ref $b eq 'Vector');
  my $vec = Vector->new($a);
  
  $vec->[0] += $b->[0];
  $vec->[1] += $b->[1];
  $vec->[2] += $b->[2];
  $vec->[3] = undef;

  return $vec;
}

# Scalar multiply a vector
sub mult {
  my ($a,$b,$flip) = @_;

  croak "$a * $b: one argument must be a scalar" 
    unless (ref $a eq '' or ref $b eq '');
  
  ($a,$b) = ($b,$a) if (ref $b eq 'Vector');

  my $vec = Vector->new($a);

  $vec->[0] *= $b;
  $vec->[1] *= $b;
  $vec->[2] *= $b;
  $vec->[3] *= $b;
  
  return $vec;
}

# Vector subtraction
sub subtr {
  my ($a,$b,$flip) = @_;

  croak "Must subtract Vectors only" unless (ref $a eq 'Vector' and ref $b eq 'Vector');
  my $vec = Vector->new($a);
  
  $vec->[0] -= $b->[0];
  $vec->[1] -= $b->[1];
  $vec->[2] -= $b->[2];
  $vec->[3] = undef;

  return $vec;
}

# Dot product (or string concatenation)
sub dot {
  my ($a,$b,$flip) = @_;

  if (ref $a ne 'Vector' or ref $b ne 'Vector') {
    $a = $a->string if (ref $a eq 'Vector');
    $b = $b->string if (ref $b eq 'Vector');
    return $flip ? ($b . $a) : ($a . $b);
  }

  return  ($a->[0])*($b->[0]) + ($a->[1])*($b->[1]) + ($a->[2])*($b->[2]); 
}

# Cross product (or string repeat)
sub cross {
  my ($a,$b,$flip) = @_;

  if (ref $a ne 'Vector' or ref $b ne 'Vector') {
    $a = $a->string if (ref $a eq 'Vector');
    $b = $b->string if (ref $b eq 'Vector');
    return $flip ? ($b x $a) : ($a x $b);
  }

  my $vec = Vector->new();

  $vec->[0] = ($a->[1]*$b->[2] - $a->[2]*$b->[1]);
  $vec->[1] = -($a->[0]*$b->[2] - $a->[2]*$b->[0]);
  $vec->[2] = ($a->[0]*$b->[1] - $a->[1]*$b->[0]);
  $vec->[3] = undef;
  
  return $vec;
}

# Stringify a vector into "(a b c)"
sub string {
  my $v = shift;

  return "($v->[0] $v->[1] $v->[2])";
}

# Returns an array (a,b,c)
sub array {
  my $v = shift;

  return ($v->[0],$v->[1],$v->[2]);
}

1;
