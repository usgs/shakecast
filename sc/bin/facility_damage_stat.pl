#!/usr/local/bin/perl

my $start = time;

use FindBin;
use Storable;
use JSON::XS;
use lib "$FindBin::Bin/../lib";
use File::Path;
use SC;
use API::APIUtil;
use API::Damage;
use API::Shaking;

SC->initialize();
my $config = SC->config;

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $event = "$evid-$version";
my $dir_path = "$sc_dir/$event";
my %frag_prob;

mkdir($dir_path) unless (-d $dir_path);

# map array index to damage level
my %damage_levels = damage_level();
my %metric_column_map = metric_list();

my $nrec=0;
	my $output_png;
	my $gnuplot_data;
	my $cmd;
	my $max_value;
	
	my $options = { 'shakemap_id' => $evid,
			'shakemap_version' => $version,
			'type' => 'all',
	};
	my $damage = new API::Damage->from_id($options);
	$damage->{'type'} = $type;
	my $summary = {'count' => $damage->{'count'},
				'damage_summary' => $damage->{'damage_summary'}
				};


	open (FH, "> $dir_path/fac_damage.json") or next;
	print FH encode_json API::APIUtil::stringfy($damage);
	close(FH);

	store $damage, "$dir_path/fac_damage.hash";
	store $summary, "$dir_path/fac_damage_summary.hash";

	my %fac_marker;
	foreach my $fac (@{$damage->{severity_index}}) {
	    $fac_marker{$fac} = {
		'latitude' => $damage->{'facility_damage'}->{$fac}->{lat_min},
		'longitude' => $damage->{'facility_damage'}->{$fac}->{lon_min},
		'facility_type' => $damage->{'facility_damage'}->{$fac}->{facility_type},
		'damage_level' => $damage->{'facility_damage'}->{$fac}->{damage_level},
		'severity_rank' => $damage->{'facility_damage'}->{$fac}->{severity_rank},
		'facility_name' => $damage->{'facility_damage'}->{$fac}->{facility_name},
	    }
	}
	store \%fac_marker, "$dir_path/fac_damage_marker.hash";

	my $shaking = new API::Shaking->marker($options);
	#store $shaking, "$dir_path/fac_shaking_marker.hash";
	foreach my $fac (keys %$shaking) {
	    if ($fac_marker{$fac}) {
		delete $shaking->{$fac};
	    } else {
		$shaking->{$fac}->{'damage_level'} = 'GREY';
	    }
	}
	store $shaking, "$dir_path/fac_grey_marker.hash";

my $end = time;
print "The total time is ", $end-$start, "\n";
print "process product STATUS=SUCCESS\n";
exit;

# returns a list of all metrics that should be polled for new events, etc.
sub metric_list {
	my @metrics;
	
    undef $SC::errstr;
    eval {
		my $sth = SC->dbh->prepare(qq/
			select short_name, metric_id
			  from metric/);
		$sth->execute;
		while (my @p = $sth->fetchrow_array()) {
			push @metrics, @p;
		}
    };
    return @metrics;
}

# returns a list of all metrics that should be polled for new events, etc.
sub damage_level {
	my @damage_level;
	
    undef $SC::errstr;
    eval {
		my $sth = SC->dbh->prepare(qq/
			select damage_level, severity_rank
			  from damage_level
			  where damage_level not in ('grey')/);
		$sth->execute;
		while (my @p = $sth->fetchrow_array()) {
			push @damage_level, @p;
		}
    };
    return @damage_level;
}

