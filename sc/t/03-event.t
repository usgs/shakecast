#!perl 

use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Test;
use Data::Dumper;

BEGIN { plan tests => 29 }

use SC;
use SC::Event;

# create an event ID for testing purposes
my $event_id = time % 100000000;

my $event_1_xml = 
qq(<event
    event_id="$event_id"
    event_version="1"
    event_status="NORMAL"
    event_type="ACTUAL"
    event_name=""
    event_location_description=""
    event_timestamp="1994-05-07 14:34:23"
    external_event_id="ci$event_id"
    magnitude="6.8"
    lat="34.23"
    lon="-118.12"
/>);

my $event_2_xml = 
qq(<event
    event_id="$event_id"
    event_version="2"
    event_status="NORMAL"
    event_type="ACTUAL"
    event_name="Northridge"
    event_location_description="1.2mi SSW of Northridge, CA"
    event_timestamp="1994-05-07 14:34:23"
    external_event_id="ci$event_id"
    magnitude="6.7"
    lat="34.2345222"
    lon="-118.123222"
/>);


{
    my $event;
    my $event_reread;
    my $rc;
    my $ts;

    print "Event tests...\n";
    print "event ID = $event_id\n";
    SC->initialize('sc_test.conf');
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";

    # create new event from xml string
    $event = SC::Event->from_xml($event_1_xml);
    ok defined $event;
    ok $SC::errstr, undef, $SC::errstr;

    # test accessors
    ok $event->event_id, $event_id;
    ok $event->event_version, 1;

    # insert into database
    $rc = $event->write_to_db;
    ok $rc, 1, "rc=$rc, should be 1";
    ok $SC::errstr, undef, $SC::errstr;

    # read back the event just added
    $event_reread = SC::Event->from_id($event->event_id, $event->event_version);
    ok $SC::errstr, undef, $SC::errstr;
    ok $event_reread->initial_version, 1;

    # try inserting same event again -- should be no-op
    $event = SC::Event->from_xml($event_1_xml);
    ok defined $event;
    ok $SC::errstr, undef, $SC::errstr;
    # insert into database
    $rc = $event->write_to_db;
    ok $rc, 2, "rc=$rc, should be 2";
    ok $SC::errstr, undef, $SC::errstr;

    # verify that the original event record is not marked superceded
    eval {
	$ts = SC->dbh->selectrow_array(qq/
	    select superceded_timestamp from event
	     where event_id=$event_id and event_version=1/);
    };
    ok $@, '', "selectrow_array failed: $@";
    ok $ts, undef, "superceded_timestamp should be null, but is not";
    
    # create new event from xml string
    $event = SC::Event->from_xml($event_2_xml);
    ok defined $event;
    ok $SC::errstr, undef;

    # test accessors
    ok $event->event_id, $event_id;
    ok $event->event_version, 2;

    # convert to xml and back again
    my $xml = $event->to_xml;
    ok $SC::errstr, undef;
    $event = SC::Event->from_xml($xml);
    ok $SC::errstr, undef;
    ok $event->event_id, $event_id;
    ok $event->event_version, 2;

    # insert into database
    $rc = $event->write_to_db;
    ok $rc, 1, $xml;
    ok $SC::errstr, undef, $SC::errstr;

    # verify that the original event record is marked superceded
    eval {
	$ts = SC->dbh->selectrow_array(qq/
	    select superceded_timestamp from event
	     where event_id=$event_id and event_version=1/);
    };
    ok $@, '', "selectrow_array failed: $@";
    ok defined $ts;

    # read back the event just added
    $event_reread = SC::Event->from_id($event->event_id, $event->event_version);
    ok $SC::errstr, undef, $SC::errstr;
    ok $event_reread->initial_version, 0;


}

# vim:syntax=perl
