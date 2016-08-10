#!perl 

use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Test;
use Data::Dumper;

BEGIN { plan tests => 8 }


use SC;
use SC::Server;

{
    my $server;

    print "Server tests as SC1...\n";
    SC->initialize('sc1.conf');
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";

    # create for self
    $server = SC::Server->this_server;
    ok defined $server;
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";
    ok $server->server_id eq 2;
    ok $server->dns_address eq 'sc1.gatekeeper.com';
    
    # create downstream servers
    my @servers = SC::Server->downstream_servers;
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";
    ok scalar @servers == 1;
    ok $servers[0]->server_id == 3;
}

# vim:syntax=perl
