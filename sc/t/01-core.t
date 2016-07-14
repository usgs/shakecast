#!perl 

use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Test;
use Data::Dumper;

BEGIN { plan tests => 10 }

use SC;

{
    print "Initialization tests...\n";
    ok not defined $SC::errstr;
    SC->initialize('sc_test.conf');
    ok not defined $SC::errstr or print STDERR "$SC::errstr\n";
    SC->log(1, "a log message");
    ok not defined $SC::errstr;
    my $ts = SC->time_to_ts(0);
    #ok $ts eq '1970-01-01 00:00:00.00Z' or print STDERR "$ts\n";
    ok $ts, '1970-01-01 00:00:00';
    SC->error("this", "is", "an", "error");
    SC->warn("this is a warning");
    my $h = SC->xml_in(qq{<elem one="1" two="2" />});
    ok $SC::errstr, undef, $SC::errstr;
    ok exists $h->{'elem'};
    $h = $h->{'elem'};
    ok exists $h->{'one'};
    ok $h->{'two'}, 2;
    ok (SC->to_xml_attrs({'one'=>1}, 'foo', [qw(one)], 1,
	'<foo one="1"/>'));
    ok (SC->to_xml_attrs({'one'=>1, 'two'=>2}, 'foo', [qw(two)], 0,
	'<foo two="2">'));
    
}

# vim:syntax=perl
