package Event;

#       $Id: Event.pm 587 2012-08-03 23:29:48Z cbworden $     TriNet

use strict;
use Carp;
use Shake::DbConnect;
use Shake::EqInfo;
use DBI;

#######################################################################
# The Event object holds the following data objects:
#
# EFUNC - reference to error reporting function
# DBC   - reference to a database connect object
#
# The following methods are defined for the public interface:
#
# new Event ('config_file', [\&error_func])
#
#	returns a new object of the Event class
#
# eqInfo(event_id)
#
#	returns a reference to a EqInfo object
# 
#######################################################################

sub new {

  my $class = shift;
  my $file  = shift;
  my $aref  = shift;
  my $self  = {};
  my $configerr = 0;

  if (!defined $file) {
    carp "Event::new ERROR: must specify config file";
    return undef;
  }

  $self->{EFUNC} = shift || \&carp;

  if (!defined ($self->{DBC} = new DbConnect($file, $aref, $self->{EFUNC}))) {
    carp "Event::new ERROR: couldn't create DbConnect object";
    return undef;
  }

  return bless $self, $class;
}

############################################################################
# Look up event in database
############################################################################
sub eqInfo {

  my $self     = shift;
  my $evid     = shift;
  my $attempts = 0;
  my $erf      = $self->{EFUNC};
  my ($ei, $dbh);

  if (!defined $evid) {
    &$erf("Event::eqInfo: no event id specified");
    return undef;
  }
  my $ndb = $self->{DBC}->ndb;
  for (my $i = 0; $i < $ndb; $i++) {
    if (not defined ($dbh = $self->{DBC}->connect($i))) {
      &$erf("Event::eqInfo: unable to connect to database $i");
      next;
    }
    #----------------------------------------------------------------------
    # We're connected now, so fetch the event info
    #----------------------------------------------------------------------
    $ei = $self->fetchInfo($dbh, $evid);

    $self->{DBC}->disconnect;

    last if defined $ei;

    &$erf("Event::eqInfo: can't get info for event $evid in database $i");
  }
  &$erf("Event::eqInfo: can't get info for event $evid") 
		if (not defined $ei);
  return $ei;
}

sub fetchInfo {

  my $self = shift;
  my $dbh  = shift;
  my $evid = shift;
  my $erf  = $self->{EFUNC};
  my ($mag, $lat, $lon, $depth, $datetime, $rake1, $rake2);
  my ($distkm, $distmi, $az, $elev, $place, $dir, $network);

  my $sth = $dbh->prepare(q{
	BEGIN
	    SELECT o.lat, o.lon, n.magnitude, o.depth, 
	    TrueTime.getStringf(o.datetime),
	    m.rake1, m.rake2
	    INTO :lat, :lon, :mag, :depth, :datetime, :rake1, :rake2
	    FROM netmag n, origin o, event e
	    LEFT OUTER JOIN mec m ON e.prefmec = m.mecid
	    WHERE e.evid = :evid
	    AND e.selectflag = 1
	    AND o.orid = e.prefor
	    AND n.magid = e.prefmag;
	Wheres.Town(:lat, :lon, 0.0, :dist, :az, :elev, :place);
	:dir := Wheres.Compass_PT(:az);
	END;
  });
  unless (defined $sth) {
    &$erf("Event::fetchInfo: preparing SQL request: " . $dbh->errstr);
    return undef;
  }
  $sth->bind_param(":evid", $evid);
  $sth->bind_param_inout(":lat", \$lat, 100);
  $sth->bind_param_inout(":lon", \$lon, 100);
  $sth->bind_param_inout(":mag", \$mag, 100);
  $sth->bind_param_inout(":depth", \$depth, 100);
  $sth->bind_param_inout(":datetime", \$datetime, 100);
  $sth->bind_param_inout(":rake1", \$rake1, 100);
  $sth->bind_param_inout(":rake2", \$rake2, 100);
  $sth->bind_param_inout(":dist", \$distkm, 100);
  $sth->bind_param_inout(":az", \$az, 100);
  $sth->bind_param_inout(":elev", \$elev, 100);
  $sth->bind_param_inout(":place", \$place, 100);
  $sth->bind_param_inout(":dir", \$dir, 100);
  unless ($sth->execute) {
    &$erf("Event::fetchInfo: executing SQL request: " . $sth->errstr);
    return undef;
  }
  if (!defined $lat or !defined $lon or !defined $mag 
   or !defined $depth or !defined $datetime) {
    return undef;
  }
#print "dist='$distkm' az='$az' dir='$dir' place='$place'\n";
  $lat   = sprintf "%.4f", $lat;
  $lon   = sprintf "%.4f", $lon;
  $mag   = sprintf "%.1f", $mag;
  $depth = sprintf "%.2f", $depth;

  my ($yr, $mon, $day, $hr, $min, $sec);
  # getStringf returns time like "2007/09/07 07:07:26.8300"
  if ($datetime =~ /^(\d{4})\/(\d\d)\/(\d\d) (\d\d):(\d\d):(\d\d\.\d{4})$/) {
      ($yr, $mon, $day, $hr, $min, $sec) = ($1, $2, $3, $4, $5, $6);
  }
  else {
      &$erf("Event::fetchInfo: bad origin time string: " . $datetime);
      return undef;
  }

  $dir =~ s/\s*(\w+)\s*/$1/;

  $distmi = $distkm * 0.62137;

  $rake1 -= 360.0 if ($rake1 >  180.0);
  $rake2 -= 360.0 if ($rake2 >  180.0);
  $rake1 += 360.0 if ($rake1 < -180.0);
  $rake2 += 360.0 if ($rake2 < -180.0);

  my $type = "ALL";
  if ($rake1 >= -135 && $rake1 <=-45 && $rake2 >= -135 && $rake2 <=-45) {
      $type = "NM";        # Normal
  }
  elsif (($rake1 >= -135 && $rake1 <=-45) ||
	 ($rake2 >= -135 && $rake2 <=-45)) {
      $type = "NM";        # Oblique Normal
  }
  elsif ($rake1 >= 45 && $rake1 <=135 && $rake2 >= 45 && $rake2 <=135) {
      $type = "RS";        # Reverse == Thrust 
  }
  elsif (($rake1 >= 45 && $rake1 <=135) ||
	 ($rake2 >= 45 && $rake2 <=135)) {
      $type = "RS";        # Oblique Reverse
  }
  elsif ($rake1 >= -45 && $rake1 <= 45 &&
	 (($rake2 >= 135 && $rake2 <= 225) ||
	  ($rake2 >= -225 && $rake2 <= -135)) ) {
      $type = "SS";        # Strike-slip
  }
  elsif ($rake2 >= -45 && $rake2 <= 45 &&
	 (($rake1 >= 135 && $rake1 <= 225) ||
	  ($rake1 >= -225 && $rake1 <= -135)) ) {
      $type = "SS";        # Strike-slip */
  }

  my $loc = sprintf "%.1f km (%.1f mi) $dir of $place", $distkm, $distmi;


  # EqInfo expects a "network", although it is not clear which value is 
  # wanted. To keep EqInfo happy, we give it the unassigned $network here.
  # Hopefully that won't break something else down the line.
  my $eir = new EqInfo($lat, $lon, $mag, $depth, $yr, 
		       $mon, $day, $hr, $min, $sec, $network, $loc, $type);
  return $eir;
}

1;
