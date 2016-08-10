#!/usr/local/bin/perl

use strict;
use warnings;
use Storable;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;

SC->initialize;

my $sth_s = SC->dbh->prepare(qq/
	select *
	  from dispatch_task
	 where status = 'PLAN' /);
$sth_s->execute();
while (my $sm_param = $sth_s->fetchrow_hashref('NAME_lc')) {
	my $hash = Storable::thaw $sm_param->{'request'};
	print $hash->{'ACTION'}, '::', (join ',', @{$hash->{'ARGS'}}),"\n";
}
$sth_s->finish;

exit;