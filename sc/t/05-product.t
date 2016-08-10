#!perl 

use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Test;
use Data::Dumper;

BEGIN { plan tests => 40 }

use SC::Product;
use SC::Server;

# create an ID for testing purposes
my $id = time % 100000000;

my $product_1_xml = 
qq(<product
	shakemap_id="$id"
	shakemap_version="1"
	product_type="GRID"
	product_status="RELEASED"
	generating_server="1"
	max_value="" min_value=""
	generation_timestamp="1994-05-07 14:34:23"
	lat_min="34.2" lon_min="-118.1"
	lat_max="34.4" lon_max="-118.3"/>);

my $product_2_xml = 
qq(<product
	shakemap_id="$id"
	shakemap_version="2"
	product_type="GRID"
	product_status="RELEASED"
	generating_server="1"
	generation_timestamp="1994-05-07 22:34:23"
	lat_min="34.2" lon_min="-118.1"
	lat_max="34.4" lon_max="-118.3"/>);



{
    my $product;
    my $product_reread;
    my $rc;
    my $ts;
    my $abs_path;

    print "Product tests...\n";
    print "ID = $id\n";
    SC->initialize('sc_test.conf');
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";

    # create new product from xml string
    $product = SC::Product->from_xml($product_1_xml);
    ok defined $product;
    ok $SC::errstr, undef, $SC::errstr;

    # test accessors
    ok $product->shakemap_id, $id;
    ok $product->shakemap_version, 1;
    ok $product->product_type, 'GRID';
    ok $product->product_id, undef;	# not defined until write_db
    ok defined $product->as_string;
    ok $product->file_name, 'grid.xyz.zip';
    $abs_path = SC->config->{DataRoot} . "/${id}-1/grid.xyz.zip";
    ok $product->abs_file_path, $abs_path;

    # insert into database
    $rc = $product->write_to_db;
    ok $rc, 1, $SC::errstr;
    ok defined $product->product_id;
    ok $SC::errstr, undef, $SC::errstr;

    # read back the product just added
    $product_reread = SC::Product->from_keys(
	$product->shakemap_id, $product->shakemap_version,
	$product->product_type);
    ok $SC::errstr, undef, $SC::errstr;
    ok $product_reread->product_id, $product->product_id;

    # read back the product just added
    $product_reread = SC::Product->from_id(
	$product->product_id);
    ok $SC::errstr, undef, $SC::errstr;
    ok $product_reread->product_id, $product->product_id;

    # try inserting same product again -- should be no-op
    $product = SC::Product->from_xml($product_1_xml);
    ok defined $product;
    ok $SC::errstr, undef, $SC::errstr;
    # insert into database
    $rc = $product->write_to_db;
    ok $rc, 2, "rc=$rc, should be 2";
    ok $SC::errstr, undef, $SC::errstr;

    # verify that the original product record is not marked superceded
    eval {
	$ts = SC->dbh->selectrow_array(qq/
	    select superceded_timestamp from product
	     where product_id=?/, {}, $product_reread->product_id);
    };
    ok $@, '', "selectrow_array failed: $@";
    ok $ts, undef, "superceded should be null, but is not";
    
    # create new product from xml string
    $product = SC::Product->from_xml($product_2_xml);
    ok defined $product;
    ok $SC::errstr, undef;

    # test accessors
    ok $product->shakemap_id, $id;
    ok $product->shakemap_version, 2;

    # convert to xml and back again
    my $xml = $product->to_xml;
    ok $SC::errstr, undef;
    $product = SC::Product->from_xml($xml);
    ok $SC::errstr, undef;

    # insert into database
    $rc = $product->write_to_db;
    ok $rc, 1, "rc=$rc, should be 1";
    ok $SC::errstr, undef, $SC::errstr;

    # verify that the original product record is marked superceded
    # NOTE: this test will probably fail because we've made up a bogus
    # shakemap_id (there is no matching shakemap record in the database).
    # The superceding logic requires shakemap records in order to find
    # predecessors.
    eval {
	$ts = SC->dbh->selectrow_array(qq/
	    select superceded_timestamp from product
	     where shakemap_id=$id and shakemap_version=1 and product_type='GRID'/);
    };
    ok $@, '', "selectrow_array failed: $@";
    # test for presence of shakemap record, skip test if missing
    my $has_sm;
    eval {
	$has_sm = SC->dbh->selectrow_array(qq/
	    select count(*) from shakemap
	     where shakemap_id=$id/);
    };
    skip +($has_sm == 0), defined $ts;

    # read back the product just added
    $product_reread = SC::Product->from_keys(
	$product->shakemap_id, $product->shakemap_version,
	$product->product_type);
    ok $SC::errstr, undef, $SC::errstr;
    #ok $product_reread->initial_version, 0;

    # select non-existent product
    $product = SC::Product->from_keys(1,1,'FUBAR');
    # not an error
    ok $SC::errstr, undef, $SC::errstr;
    # but product is undefined
    ok $product, undef, $SC::errstr;

    # test error return -- invalid data type for lookup
    $product = SC::Product->from_keys('FUBAR', 'nuts', 123);
    #ok $SC::errstr, '/ORA-/', $SC::errstr;

}
{
    print "Test grid processing...\n";
    my $server;

    #($server) = SC::Server->upstream_servers;
    $server = SC::Server->from_id(5);
    ok defined $server;
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";

    # Create product if it does not exist already
    my $product = SC::Product->from_keys(13935988, 1, 'GRID');
    if (not defined $product) {
	$product = SC::Product->from_xml(qq(
<product
	shakemap_id="13935988"
	shakemap_version="1"
	product_type="GRID"
	product_status="RELEASED"
	generating_server="1"
	generation_timestamp="1994-05-07 14:34:23"
	lat_min="34.2" lon_min="-118.1"
	lat_max="34.4" lon_max="-118.3"/>));
	 $product->write_to_db;
    }
    my $rc = $product->get_remote_file($server);
    ok $rc, 1, $SC::errstr;
    $product->process_grid_file;
    ok $SC::errstr, undef, $product->abs_file_path;
}

# vim:syntax=perl
