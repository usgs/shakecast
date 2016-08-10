#!c:/perl/bin/perl

use Storable;
use Data::Dumper;

use FindBin;
use lib "$FindBin::Bin/../lib";
use SC;

SC->initialize();
my $config = SC->config;


$event_id = $ARGV[0];
$version = $ARGV[1];
$data_dir = $config->{'DataRoot'};

$dir_path = "$data_dir/$event_id-$version";
print "$dir_path\n";
my $frag_prob =  retrieve "$dir_path/frag_prob.hash";

my @facs = keys %$frag_prob;
print scalar @facs,"\n";

#print Dumper($frag_prob);

exit;
