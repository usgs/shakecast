#!perl 

use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Test;
use Data::Dumper;

BEGIN { plan tests => 45 }


use SC;
use SC::Server;
use SC::Product;

{
    my $server;
    my @servers;

    print "Server tests as SC2 ...\n";
    SC->initialize('sc_test.conf');
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";

    # create for self
    $server = SC::Server->this_server;
    ok defined $server;
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";

    # test accessors
    ok $server->server_id eq 3;
    ok $server->dns_address eq 'sc2.gatekeeper.com';
    ok $server->as_string =~ /sc2/ or print STDERR $server->as_string, "\n";

    # create given a server ID
    $server = SC::Server->from_id(2);
    ok defined $server;
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";
    ok $server->server_id == 2;

    # create upstream server
    $server = SC::Server->upstream_server;
    ok defined $server;
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";
    ok $server->dns_address eq 'sc1.gatekeeper.com';

    # test status update
    my ($ts1, $ts2, $errs);
    $server->update_status(1);
    ok $SC::errstr, undef;
    # verify DB record
    eval {
	($ts1, $errs) = SC->dbh->selectrow_array(qq/
	    select last_heard_from, error_count from server
	     where server_id=?/, {}, $server->server_id);
    };
    ok $@, '', "selectrow_array failed: $@";
    ok $ts1, '/^20/';
    ok $errs, 0;

    sleep (2);	# to keep timestamps from matching
    $server->update_status(0);
    ok $SC::errstr, undef;
    # verify DB record
    eval {
	($ts2, $errs) = SC->dbh->selectrow_array(qq/
	    select last_heard_from, error_count from server
	     where server_id=?/, {}, $server->server_id);
    };
    ok $@, '', "selectrow_array failed: $@";
    ok $ts2, $ts1;
    ok $errs, 1;

    # test downstream servers (should be empty list)
    @servers = SC::Server->downstream_servers;
    ok scalar @servers, 0;
    
    # test servers to poll
    @servers = SC::Server->servers_to_poll;
    ok scalar @servers, 1;
    ok $servers[0]->dns_address, 'sc1.gatekeeper.com';
    
    # error case -- create based on nonexistent server ID
    $server = SC::Server->from_id(666);
    ok not defined $server;
    ok $SC::errstr =~ /No server/;

    ok(SC::Server->local_server_id(), 3);
}

{
    print "Authentication tests...\n";
    #my $upstream = SC->authenticate(2, 'U');
    my $upstream = SC::Server->from_id(2);
    ok defined $upstream;
    ok $upstream->permitted('U');
    ok not $upstream->permitted('D');
    ok $upstream->permitted('P');
    ok not $upstream->permitted('Q');
}
{
    print "Remote invocation tests...\n";
    my $server;
    my ($status, $message);
    
    # create upstream server
    $server = SC::Server->from_id(2);
    ok defined $server;
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";
    ok $server->dns_address eq 'sc1.gatekeeper.com';

    # send a simple message
    ($status, $message) = $server->send('null_client',
	qq{<xxx status="OK">a message</xxx>});
    ok $status, SC_OK;
    ok $message, 'a message';

    # remote script will die...
    ($status, $message) = $server->send('null_client',
	qq{<xxx status="DIE">a message</xxx>});
    ok $status, SC_FAIL, $message;

    # create server that does not exist as a listener
    $server = SC::Server->from_id(1);
    ($status, $message) = $server->send('null_client',
	qq{<xxx status="OK">a message</xxx>});
    ok $status, SC_HTTP_FAIL;
    ok $message, '/^500/';

}
{
    print "File download tests...\n";
    my $server;

    $server = SC::Server->upstream_server;
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
    # delete local file if it exists
    unlink $product->abs_file_path;
    my @ret = $server->get_file($product->product_id);
    ok $ret[0], SC_OK;
    ok $ret[1], '';
    @ret = $server->get_file($product->product_id);
    ok $ret[0], SC_OK;
    ok $ret[1], '/exists/';

}

# vim:syntax=perl
