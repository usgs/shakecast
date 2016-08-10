package EqInfo;

#       $Id: EqInfo.pm 148 2009-12-14 17:00:46Z klin $     TriNet

use strict;
use Carp;

#######################################################################
#
# EqInfo objects hold event information; the following public interface
# is defined:
#
# new EqInfo([lat[,lon[,mag[,depth[,yr[,mon[,day[,hr[,min[,sec]]]]]]]]]])
#
#	returns a new object of type EqInfo; fields are initialized for
#	the arguments given
#
# Accessor functions:
#       lat()  - event latitude
#       lon()  - event longitude
#       mag()  - event magnitude
#       depth()- event depth
#       yr()   - origin time, year, (four digit)
#       mon()  - origin time, month (1..12)
#       day()  - origin time, day (1..31)
#       hr()   - origin time, hour (0..23)
#       min()  - origin time, minute (0..59)
#       sec()  - origin time, second (0..59)
#	network()  - network string
#	loc()  - location string
#       type() - mechanism type (RS, SS, NM, ALL)
#
#	Without an argument these functions return the value of the
#	appropriate field (or undef if the field has not been set);
#	with an argument, the value of the field is set to that of 
#	the argument and the previous value of the field is returned
#
#######################################################################

sub new {

  my $class = shift;
  my $self  = {};

  bless $self, $class;
  $self->lat(shift);
  $self->lon(shift);
  $self->mag(shift);
  $self->depth(shift);
  $self->yr(shift);
  $self->mon(shift);
  $self->day(shift);
  $self->hr(shift);
  $self->min(shift);
  $self->sec(shift);
  $self->network(shift);
  $self->loc(shift);
  $self->type(shift);

  return $self;
}

sub AUTOLOAD {

  my $self = shift;
  my $val  = shift;
  my $func = $EqInfo::AUTOLOAD;
  my $item;

  $func =~ s/.*:://;

  return if $func eq 'DESTROY';

  #
  # Not really necessary, but makes a nice diagnostic message
  #
  if ($func ne 'lat'
   && $func ne 'lon'
   && $func ne 'mag'
   && $func ne 'depth'
   && $func ne 'yr'
   && $func ne 'mon'
   && $func ne 'day'
   && $func ne 'hr'
   && $func ne 'min'
   && $func ne 'sec'
   && $func ne 'network'
   && $func ne 'loc'
   && $func ne 'type') {
    croak "EqInfo: unknown accessor: $func\n";
  }
  if (defined $val) {
    my $ret = $self->{"\U$func"};
    $self->{"\U$func"} = $val;
    return $ret;
  }
  return $self->{"\U$func"};
}
1;
