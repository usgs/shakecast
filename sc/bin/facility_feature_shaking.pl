#!/usr/local/bin/perl

my $start = time;

use FindBin;
use lib "$FindBin::Bin/../lib";
use File::Path;
use SC;
use Data::Dumper;
use XML::LibXML;

SC->initialize();
my $config = SC->config;

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $event = "$evid-$version";
my $dir_path = "$sc_dir/$event";
mkdir($dir_path) unless (-d $dir_path);

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
		ff.geom_type, ff.geom, ff.description
	FROM facility_shaking fs inner join grid g on
		fs.grid_id = g.grid_id 
	INNER JOIN facility f on f.facility_id = fs.facility_id
	INNER JOIN facility_feature ff on
		fs.facility_id = ff.facility_id
	WHERE g.shakemap_id = ? and g.shakemap_version = ?
	GROUP BY fs.facility_id
	}, undef, $evid, $version);

my $nrec=0;
#my $xs = XML::LibXML::Document->new("$dir_path/fac_att.txt");
use XML::LibXML::Simple;
my $xml = SC->sm_twig("$dir_path/grid.xml");
my $grid_spec = $xml->{'grid_specification'};
my $grid_data = $xml->{'grid_data'};
my $event_spec = $xml->{'event'};
my $grid_metric = $xml->{'grid_field'};
my (@cells, $cell_no);
$cell_no = 0;
my ($lon, $lat); # referenced outside the loop so declare outside, too
foreach my $line (split /\n/, $grid_data) {
	my @v;
	$line =~ s/\n|\t//g;
	($lon, $lat, @v) = split ' ', $line;
	#$#v = 5;
	for (my $i = 0; $i < scalar @v; $i++) {
		$min[$i] = _min($min[$i], $v[$i]);
		$max[$i] = _max($max[$i], $v[$i]);
	}
	$cells[$cell_no++] = \@v;
}
		
my $xs = XML::LibXML::Document->new('1.0', 'utf-8');
my $root = $xs->createElement("kml");

# construct SQL to insert FACILITY_SHAKING records
my (@data_fields, @data_keys);
my $field_index = 3;
my $metric_tag = $xs->createElement("grid_field");
$metric_tag->setAttribute('index'=> 1);
$metric_tag->setAttribute('name'=> 'LON');
$root->appendChild($metric_tag);
my $metric_tag = $xs->createElement("grid_field");
$metric_tag->setAttribute('index'=> 2);
$metric_tag->setAttribute('name'=> 'LAT');
$root->appendChild($metric_tag);
foreach my $key (keys %$grid_metric) {
	
	if ($metric_column_map{$key}) {
		push @data_fields, $grid_metric->{$key}->{'index'}-3;
		push @data_keys, $key;
		
		my $metric_tag = $xs->createElement("grid_field");
		$metric_tag->setAttribute('index'=> $field_index++);
		$metric_tag->setAttribute('name'=> $key);
		$root->appendChild($metric_tag);
	} 
}
	

#open (FH, "> $dir_path/fac_att.txt") or next;
foreach my $facility (@$fac_list) {
	my $output_png;
	my $gnuplot_data;
	my $cmd;
	my $max_value;
	my ($fac_id, $ext_fac_id, $geom_type, $geom, $description) = @$facility;
	print "$fac_id, $ext_fac_id, $geom_type\n";
	#next unless ($geom_type =~ /REG_LEVEL/);
	my ($rc, $geom_shaking) = process_grid_xml_file($geom_type, $geom);
	
	my %feature_sk;
	$feature_sk{geom_type} = $geom_type;
	$feature_sk{geom_shaking} = join '', @$geom_shaking;
	#$feature_sk{coordinates} = $geom;
	#$feature_sk{mag_dist} = mag_dist($fac_id);
	#$feature_sk{rg1166} = ($feature_sk{felt} || $feature_sk{felt_site} || $feature_sk{mag_dist})
	#	? 'Exceeded' : 'Not Exceeded';
	
	my %attr;
	if ($geom_type) {
		my @geom_type = split ',', $geom_type;
		my @geom = split ',', $geom;
		#%attr = map { $geom_type->[$_] => $geom->[$_] } (0 .. $#geom_type);
		@attr{@geom_type} = @geom;
		# perform the requested action
		foreach my $attr_name (keys %attr) {
		my ($rv);
		eval {
		#$feature_sk{lc($attr_name)} = (&{ lc($attr_name) }( $fac_id, $attr{$attr_name} ) > 0) 
		#	? 'Exceeded' : 'Not Exceeded';
		};
		}
	}
	#print FH Dumper(\%feature_sk);
	my @keys = keys %feature_sk;
	#print join ',', @keys;
	#print "\n";
	#print join ',', @feature_sk{@keys};
	#print "\n";
	my $fac_tag = $xs->createElement("facility");
	$fac_tag->setAttribute('id'=> $ext_fac_id);
	for my $name (keys %feature_sk) {
		my $tag = $xs->createElement($name);
		my $value = $feature_sk{$name};
		$tag->appendTextNode($value);
		$fac_tag->appendChild($tag);
	}
	$root->appendChild($fac_tag);
	
}
$xs->setDocumentElement($root);
$xs->toFile("$dir_path/facility_feature_shaking.xml");

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

sub process_grid_xml_file {
	my ($geom_type, $geom) = @_;
    my ($lon, $lat, @v);
    my (@min, @max);
    my ($lat_cell_count, $lon_cell_count);
    my ($lat_spacing, $lon_spacing);
    my ($lon_min, $lat_min, $lon_max, $lat_max);
    my ($rows_per_degree, $cols_per_degree);
    my $sth;
    my $rc;
	my @geom_shaking;
	
    #SC->log(2, "Grid file header: $header");
    # save the header to process later
	$lon_spacing = $grid_spec->{'nominal_lon_spacing'};
	$lat_spacing = $grid_spec->{'nominal_lat_spacing'};
	$lon_cell_count = $grid_spec->{'nlon'};
	$lat_cell_count = $grid_spec->{'nlat'};
	$lat_min = $grid_spec->{'lat_min'};
	$lat_max = $grid_spec->{'lat_max'};
	$lon_min = $grid_spec->{'lon_min'};
	$lon_max = $grid_spec->{'lon_max'};
	
    #eval {
        # read grid file records and build in-memory list of shaking data
        $cols_per_degree = sprintf "%d", 1/$lon_spacing + 0.5;
        $rows_per_degree = sprintf "%d", 1/$lat_spacing + 0.5;

	my %metric_column_map = metric_list();
	#for (my $i = 0; $i < scalar @min; $i++) {
    #        $sth_u->execute(
    #            $metric_column_map{$grid_metric[$i+2]},
	#	(defined $min[$i] ? $min[$i] : 0),
	#	(defined $max[$i] ? $max[$i] : 0),
    #            $self->{'shakemap_id'}, $self->{'shakemap_version'},
    #            $grid_metric[$i+2]);
	#}

					#print join (',', @data_keys),"\n";
					#print join (',', @data_fields),"\n";

        # offset the grid origin by 1/2 cell to map from grid point to grid
        # cell centered on point
        $lat_max += 0.5 * $lat_spacing;
        $lon_min -= 0.5 * $lon_spacing;

        # for each facility compute max value of each metric and write a
        # FACILITY_SHAKING record
		my $dist;
        foreach my $p (split / /, $geom) {
            #SC->log(4, sprintf("FacID: %d, bbox: %f9,%f9 - %f9,%f9", $p->[0], $p->[2], $p->[1], $p->[4], $p->[3]));
			my ($fac_lon, $fac_lat, $fac_dep) = split /,/, $p;
            my @summary;
			#$dist = dist($event_spec->{'lat'}, $event_spec->{'lon'}, $fac_lat, $fac_lon);
            my $n = 0;
            for (my $row = _max(0, int(($lat_max-$fac_lat) * $rows_per_degree));
                    $row < $lat_cell_count; $row++) {
                last if int (($lat_max - $fac_lat) * $rows_per_degree) < $row;
                for (my $col = _max(0,int(($fac_lon-$lon_min) * $cols_per_degree));
                        $col < $lon_cell_count; $col++) {
                    last if int (($fac_lon - $lon_min) * $cols_per_degree) < $col;
                    $cell_no = $row * $lon_cell_count + $col;
                    #SC->log(4, sprintf("row=%d,col=%d,v0=%f",$row,$col,$cells[$cell_no][0]));
                    if (@summary) {
                        for (my $i = 0; $i <= $#summary; $i++) {
                            $summary[$i] = _max($summary[$i],
                                                $cells[$cell_no][$i]);
                        }
                    } else {
                        @summary = @{$cells[$cell_no]}[@data_fields];
                    }
					#print join (':',@summary),"\n";
                    $n++;
                }
            }
			push @geom_shaking, join (',',$fac_lon, $fac_lat, @summary),"\n";
			#print join (',',$fac_lon, $fac_lat, @summary),"\n";
        }
    #};
    if ($@) {
	$SC::errstr = $@;
	$rc = 0;
    } else {
	$rc = 1;
    }
    return ($rc, \@geom_shaking);
}

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

sub _min {
    (defined $_[0] && (!defined $_[1] || $_[0] <= $_[1])) ? $_[0] : $_[1];
}

sub _max {
    (defined $_[0] && (!defined $_[1] || $_[0] >= $_[1])) ? $_[0] : $_[1];
}



