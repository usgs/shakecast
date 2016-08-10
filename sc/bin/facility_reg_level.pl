#!/usr/local/bin/perl

my $start = time;

use FindBin;
use lib "$FindBin::Bin/../lib";
use File::Path;
use SC;
use Data::Dumper;
use XML::LibXML;
use Storable;

SC->initialize();
my $config = SC->config;

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $event = "$evid-$version";
my $dir_path = "$sc_dir/$event";
mkdir($dir_path) unless (-d $dir_path);
my ($hashref, $hash_file);
$hash_file = "$dir_path/facility_reg_level.hash";

sub epr;
my $sth_lookup_grid;

$sth_lookup_grid = SC->dbh->prepare(qq{
    select grid_id
      from grid
     where shakemap_id = ?
       and shakemap_version = ?});

# some data to layout
#my $facility_data = parse_facility_exposure($evid, $version);

my %metric_column_map = metric_list();
my $event = event_info($evid);
my $grid_id = lookup_grid($evid, $version);
my $fac_list = SC->dbh->selectall_arrayref(qq{
	SELECT fs.facility_id, f.external_facility_id, 
		group_concat(fa.attribute_name) as attribute,
		group_concat(fa.attribute_value) as value
	FROM facility_shaking fs inner join grid g on
		fs.grid_id = g.grid_id 
	INNER JOIN facility f on f.facility_id = fs.facility_id
	LEFT JOIN facility_attribute fa on
		fs.facility_id = fa.facility_id
	WHERE g.shakemap_id = ? and g.shakemap_version = ?
	GROUP BY fs.facility_id
	}, undef, $evid, $version);

my $nrec=0;
#my $xs = XML::LibXML::Document->new("$dir_path/fac_att.txt");
my $xs = XML::LibXML::Document->new('1.0', 'utf-8');
my $root = $xs->createElement("regulatory_level");
#open (FH, "> $dir_path/fac_att.txt") or next;
foreach my $facility (@$fac_list) {
	my $output_png;
	my $gnuplot_data;
	my $cmd;
	my $max_value;
	my ($fac_id, $ext_fac_id, $class, $component) = @$facility;
	next unless ($class =~ /REG_LEVEL/);
	
	my %reg_rv;
	$reg_rv{felt} = (felt($fac_id)) ? 'Yes' : 'No';
	$reg_rv{felt_site} = (felt_site($fac_id)) ? 'Yes' : 'No';
	$reg_rv{mag_dist} = (mag_dist($fac_id)) ? 'Yes' : 'No';
	$reg_rv{rg1166} = (($reg_rv{felt} eq 'Yes') || ($reg_rv{felt_site} eq 'Yes') 
		|| ($reg_rv{mag_dist} eq 'Yes'))	? 'Exceeded' : 'Not Exceeded';
	
	my %attr;
	if ($class) {
		my @class = split ',', $class;
		my @component = split ',', $component;
		#%attr = map { $class->[$_] => $component->[$_] } (0 .. $#class);
		@attr{@class} = @component;
		# perform the requested action
		foreach my $attr_name (keys %attr) {
		my ($rv);
		eval {
		$reg_rv{lc($attr_name)} = (&{ lc($attr_name) }( $fac_id, $attr{$attr_name} ) > 0) 
			? 'Exceeded' : 'Not Exceeded';
		};
		}
	}
	#print FH Dumper(\%reg_rv);
	my @keys = keys %reg_rv;
	#print join ',', @keys;
	#print "\n";
	#print join ',', @reg_rv{@keys};
	#print "\n";
	my $fac_tag = $xs->createElement("facility");
	$fac_tag->setAttribute('id'=> $ext_fac_id);
	for my $name (keys %reg_rv) {
		my $tag = $xs->createElement($name);
		my $value = $reg_rv{$name};
		$tag->appendTextNode($value);
		$fac_tag->appendChild($tag);
	}
	$root->appendChild($fac_tag);
	$hashref->{$fac_id} = \%reg_rv;
}
$xs->setDocumentElement($root);
$xs->toFile("$dir_path/facility_reg_level.xml");

(store $hashref, $hash_file) if (ref $hashref eq 'HASH');

my $end = time;

print "The total time is ", $end-$start;
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
sub event_info {
	my ($event_id) = @_;
	my $event;
	
    undef $SC::errstr;
    eval {
		my $sth = SC->dbh->prepare(qq{
			select *
			from event
			where event_id = ?
			order by seq desc
			limit 1});
		$sth->execute($event_id);
		$event = $sth->fetchrow_hashref("NAME_lc");
    };
    return $event;
}

# Return facility_id given external_facility_id and facility_type
sub lookup_grid {
    my ($shakemap_id, $shakemap_version) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_grid, undef,
        $shakemap_id, $shakemap_version);
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $shakemap_id, $shakemap_version";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

# send product to a remote server
sub sl2_sse {
    my ($fac_id, $attr_str) = @_;
	
	my ($attr_value, $metric) = split ':', $attr_str;
	$metric = 'PGA' unless ($metric);
	my $col = 'value_'.$metric_column_map{$metric};
	
	my $idp = SC->dbh->selectcol_arrayref(qq{
		SELECT $col
		FROM facility_shaking
		WHERE facility_id = ?
		AND grid_id = ?}, undef, $fac_id, $grid_id);
		 	
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $fac_id, $grid_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
		if ($$idp[0] > $attr_value) {
			return 1;
		} else {
			return 0;
		}
    } else {
        return -1;       # not found
    }
}

# send product to a remote server
sub sl1_obe {
    my ($fac_id, $attr_str) = @_;
	
	my ($attr_value, $metric) = split ':', $attr_str;
	print "($attr_value, $metric)\n";
	$metric = 'PGA' unless ($metric);
	my $col = 'value_'.$metric_column_map{$metric};
	
	my $idp = SC->dbh->selectcol_arrayref(qq{
		SELECT $col
		FROM facility_shaking
		WHERE facility_id = ?
		AND grid_id = ?}, undef, $fac_id, $grid_id);
		 	
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $fac_id, $grid_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
		if ($$idp[0] > $attr_value) {
			return 1;
		} else {
			return 0;
		}
    } else {
        return -1;       # not found
    }
}

# send product to a remote server
sub mag_dist {
    my ($fac_id, $attr_str) = @_;
	
	return 0 unless ($event->{'magnitude'} >= 5.0);
	
	my ($attr_value, $metric) = split ',', $attr_str;
	$metric = 'PGA' unless ($metric);
	my $col = 'value_'.$metric_column_map{$metric};
	
	my $idp = SC->dbh->selectcol_arrayref(qq{
		SELECT dist
		FROM facility_shaking
		WHERE facility_id = ?
		AND grid_id = ?}, undef, $fac_id, $grid_id);
		 	
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $fac_id, $grid_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
		if ($$idp[0] <= 200) {
			return 1;
		} else {
			return 0;
		}
    } else {
        return -1;       # not found
    }
}

# send product to a remote server
sub felt {
    my ($fac_id) = @_;
	
	return 0 unless ($event->{'magnitude'} >= 6.0);
	
	my $col = 'value_'.$metric_column_map{'MMI'};
	my $idp = SC->dbh->selectcol_arrayref(qq{
		SELECT $col
		FROM facility_shaking
		WHERE facility_id = ?
		AND grid_id = ?}, undef, $fac_id, $grid_id);
		 	
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $fac_id, $grid_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
		if ($$idp[0] >= 2.0) {
			return 1;
		} else {
			return 0;
		}
    } else {
        return -1;       # not found
    }
}

# send product to a remote server
sub felt_site {
    my ($fac_id) = @_;
	
	my $col = 'value_'.$metric_column_map{'MMI'};
	my $idp = SC->dbh->selectcol_arrayref(qq{
		SELECT $col
		FROM facility_shaking
		WHERE facility_id = ?
		AND grid_id = ?}, undef, $fac_id, $grid_id);
		 	
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $fac_id, $grid_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
		if ($$idp[0] >= 4.0) {
			return 1;
		} else {
			return 0;
		}
    } else {
        return -1;       # not found
    }
}

sub epr {
    print STDERR @_, "\n";
}

