#!perl 

use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Test;
use Data::Dumper;

BEGIN { plan tests => 32 }

use SC::Shakemap;

# create an event ID for testing purposes
my $event_id = time % 100000000;

my $shakemap_1_xml = 
qq(<shakemap
	    shakemap_id="$event_id"
	    shakemap_version="1"
	    event_id="$event_id"
	    event_version="1"
	    shakemap_status="NORMAL"
	    generating_server="1"
	    shakemap_region="ci"
	    generation_timestamp="1994-05-07 14:34:23"
	    begin_timestamp="1994-05-07 14:29:05"
	    end_timestamp="1994-05-07 14:30:01"
	    lat_min="34.2" lon_min="-118.1"
	    lat_max="34.4" lon_max="-118.3">
	<metric metric_name="PSA03" min_value="0.0" max_value="70.1"/>
	<metric metric_name="PSA10" min_value="0.0" max_value="70.1"/>
	<metric metric_name="PSA30" min_value="0.0" max_value="70.1"/>
	<metric metric_name="PGV"   min_value="0.0" max_value="70.1"/>
	<metric metric_name="PGA"   min_value="0.0" max_value="70.1"/>
</shakemap>);

my $shakemap_2_xml = 
qq(<shakemap
	    shakemap_id="$event_id"
	    shakemap_version="2"
	    event_id="$event_id"
	    event_version="1"
	    shakemap_status="NORMAL"
	    generating_server="1"
	    shakemap_region="ci"
	    generation_timestamp="1994-05-07 14:39:53"
	    begin_timestamp="1994-05-07 14:29:05"
	    end_timestamp="1994-05-07 14:30:01"
	    lat_min="34.2345678" lon_min="-118.1234567"
	    lat_max="34.2345678" lon_max="-118.1234567">
	<metric metric_name="PSA03" min_value="0.0" max_value="0.24"/>
	<metric metric_name="PSA10" min_value="0.0" max_value="0.47"/>
	<metric metric_name="PSA30" min_value="0.0" max_value="0.39"/>
	<metric metric_name="PGV"   min_value="0.0" max_value="69.3"/>
	<metric metric_name="PGA"   min_value="0.0" max_value="9.8"/>
</shakemap>);



{
    my $shakemap;
    my $shakemap_reread;
    my $rc;
    my $ts;

    print "Shakemap tests...\n";
    print "event ID = $event_id\n";
    SC->initialize('sc_test.conf');
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";

    # create new shakemap from xml string
    $shakemap = SC::Shakemap->from_xml($shakemap_1_xml);
    ok defined $shakemap;
    ok $SC::errstr, undef, $SC::errstr;
    ok +(scalar @{ $shakemap->metric }), 5;

    # test accessors
    ok $shakemap->shakemap_id, $event_id;
    ok $shakemap->shakemap_version, 1;

    # check a metric
    my @metrics = grep { $_->{metric_name} eq 'PGA' } @{ $shakemap->metric };
    ok scalar @metrics, 1;
    ok $metrics[0]->{max_value} - 9.8 < 0.0001 or print STDERR $metrics[0]->{max_value};

    # insert into database
    $rc = $shakemap->write_to_db;
    ok $rc, 1, $SC::errstr;
    ok $SC::errstr, undef, $SC::errstr;

    # read back the shakemap just added
    $shakemap_reread = SC::Shakemap->from_id($shakemap->shakemap_id, $shakemap->shakemap_version);
    ok $SC::errstr, undef, $SC::errstr;
    ok +(scalar @{ $shakemap_reread->metric }), 5;
    #ok $shakemap_reread->initial_version, 1;

    # check a metric
    @metrics = grep { $_->{metric_name} eq 'PGA' } @{ $shakemap->metric };
    ok scalar @metrics, 1;
    ok $metrics[0]->{max_value} - 9.8 < 0.0001;

    # try inserting same shakemap again -- should be no-op
    $shakemap = SC::Shakemap->from_xml($shakemap_1_xml);
    ok defined $shakemap;
    ok $SC::errstr, undef, $SC::errstr;
    # insert into database
    $rc = $shakemap->write_to_db;
    ok $rc, 2, "rc=$rc, should be 2";
    ok $SC::errstr, undef, $SC::errstr;

    # verify that the original shakemap record is not marked superceded
    eval {
	$ts = SC->dbh->selectrow_array(qq/
	    select superceded_timestamp from shakemap
	     where shakemap_id=$event_id and shakemap_version=1/);
    };
    ok $@, '', "selectrow_array failed: $@";
    ok $ts, undef, "superceded should be null, but is not";
    
    # create new shakemap from xml string
    $shakemap = SC::Shakemap->from_xml($shakemap_2_xml);
    ok defined $shakemap;
    ok $SC::errstr, undef;
    ok +(scalar @{ $shakemap->metric }), 5;

    # test accessors
    ok $shakemap->shakemap_id, $event_id;
    ok $shakemap->shakemap_version, 2;

    # convert to xml and back again
    my $xml = $shakemap->to_xml;
    ok $SC::errstr, undef;
    $shakemap = SC::Shakemap->from_xml($xml);
    ok $SC::errstr, undef;

    # insert into database
    $rc = $shakemap->write_to_db;
    ok $rc, 1, "rc=$rc, should be 1";
    ok $SC::errstr, undef, $SC::errstr;

    # verify that the original shakemap record is marked superceded
    eval {
	$ts = SC->dbh->selectrow_array(qq/
	    select superceded_timestamp from shakemap
	     where shakemap_id=$event_id and shakemap_version=1/);
    };
    ok $@, '', "selectrow_array failed: $@";
    ok defined $ts;

    # read back the shakemap just added
    $shakemap_reread = SC::Shakemap->from_id($shakemap->shakemap_id, $shakemap->shakemap_version);
    ok $SC::errstr, undef, $SC::errstr;
    #ok $shakemap_reread->initial_version, 0;


}

# vim:syntax=perl
