package Shake::Regression::Common_reg;

use strict;

use Exporter ();
@Shake::Regression::Common_reg::ISA = qw( Exporter );
@Shake::Regression::Common_reg::EXPORT = qw( _log_base $PI ); 

sub _log_base {
  my ($base, $arg) = @_;
  return (log($arg)/log($base));
}

1;
