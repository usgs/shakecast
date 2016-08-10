#!/usr/local/bin/perl

my $start = time;

use FindBin;
use Storable;
use JSON::XS;
use lib "$FindBin::Bin/../lib";
use File::Path;
use SC;
use API::APIUtil;

SC->initialize();
my $config = SC->config;

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $const_yr = $ARGV[2];
my $gnuplot  = $config->{'gnuplot'};
my $event = "$evid-$version";
my $dir_path = "$sc_dir/$event";
my %frag_prob;

mkdir($dir_path) unless (-d $dir_path);

# map array index to damage level
my %damage_levels = damage_level();
# some data to layout
#my $facility_data = parse_facility_exposure($evid, $version);

my %metric_column_map = metric_list();

#my $fac_list = SC->dbh->selectall_arrayref(qq{
#	SELECT DISTINCT fs.facility_id, ffm.class, ffm.component
#	FROM facility_shaking fs inner join grid g on
#		fs.grid_id = g.grid_id
#	INNER JOIN facility_fragility_model ffm ON fs.facility_id = ffm.facility_id
#	WHERE g.shakemap_id = ? and g.shakemap_version = ?
#	}, undef, $evid, $version);

my $nrec=0;
#foreach my $facility (@$fac_list) {
	my $output_png;
	my $gnuplot_data;
	my $cmd;
	my $max_value;
#	my ($fac_id, $class, $component, $model_id) = @$facility;
	
	#if ($nrec++ and $nrec % 100 == 0) {
	#	print "$nrec records processed\n";
	#}
#	my $fac_metric = SC->dbh->selectall_arrayref(qq{
#		SELECT ffm.damage_level, ffm.metric 
#		FROM facility_fragility_model ffm 
#			inner join damage_level dl on dl.damage_level = ffm.damage_level 
#		WHERE ffm.facility_id=? AND ffm.class = ? AND ffm.component = ?
#		order by dl.severity_rank}, undef, $fac_id,$class, $component);
		 	
#	my %fac_frag; 
#	my %frag_metric;
#	my %damage_level;

#	print FH "$fac_id, $class, $component, ";

#	my $data_line;
#	foreach my $m (@$fac_metric) {
#		$frag_metric{$m->[0]} = $m->[1];
	#print $m->[0],"\n";
#	}
#	my @damage_states;
#	my $metric_key;
#	foreach my $key (@damage_levels) {
#		next unless ($frag_metric{$key});
#		push @damage_states, $key;
#		$metric_key = $metric_column_map{$frag_metric{$key}};
#	}
	
	my $sth = SC->dbh->prepare(qq/
		SELECT group_concat(ffp.damage_level) as damage_level, 
		group_concat(ffp.probability) as cdf, ffm.class, ffm.component,ffp.metric, 
		ffp.facility_id
		FROM damage_level dl, grid g 
		inner join facility_shaking fs on 
		g.grid_id = fs.grid_id
		inner join facility_fragility_probability ffp on 
		g.grid_id = ffp.grid_id and fs.facility_id = ffp.facility_id
		inner join lognorm_probability lp on
		ffp.probability = lp.probability
		inner join facility_fragility_model ffm on
		ffm.damage_level = ffp.damage_level and ffm.facility_id = ffp.facility_id
		AND ffp.facility_fragility_model_id = ffm.facility_fragility_model_id
		where ffp.damage_level = dl.damage_level
		AND g.shakemap_id = ?
		and g.shakemap_version= ?
		GROUP BY ffm.facility_id, ffm.class, ffm.component
	/);
	$sth->execute($evid, $version);
	my %fac_prob;
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
		my %h = %$p;
		my (@cdf, @sort_data, @damage_level);
		@cdf = split ',', $h{'cdf'};
		@damage_level = split ',', $h{'damage_level'};
		my @sortedIndices = sort{ $damage_levels{$damage_level[ $a ]} <=> $damage_levels{$damage_level[ $b ]} } 0 .. $#damage_level;;
		@cdf = @sort_data = @cdf[@sortedIndices];
		$h{'cdf'} = join ',', @cdf;
		@damage_level = @damage_level[@sortedIndices];
		$h{'damage_level'} = join ',', @damage_level;
		
		unshift @cdf, 1;
		push @sort_data, 0;
		my @prob_dist = map {$cdf[$_] - $sort_data[$_]} (0 .. $#cdf);
		my @probIndices = sort{ $prob_dist[ $b ] <=> $prob_dist[ $a ] } 0 .. $#prob_dist;
		$h{'prob_damage_level'} = ($probIndices[0] > 0) ? $damage_level[$probIndices[0]-1] : 'NA';
		$h{'prob_distribution'} = join ',', @prob_dist;
		push @{$fac_prob{($p->{facility_id})}}, \%h; 
	}
	open (FH, "> $dir_path/frag_prob.json") or next;
	print FH encode_json API::APIUtil::stringfy(\%fac_prob);
	close(FH);

	store \%fac_prob, "$dir_path/frag_prob.hash";
my $end = time;
print "The total time is ", $end-$start;
print "process product STATUS=SUCCESS\n";
exit;

sub send_data_to_gnuplot
{
	my ($event, $fac_id, $output_png, $label, $max_value, $obj_cmd, $cmd, $gnuplot_data) = @_;
	$event =~ s/_/ /g;
    print GNUPLOT <<gnuplot_Commands_Done;
    set terminal png transparent nocrop enhanced size 600,400
    set output "$output_png"
	set timestamp "Generated at %m/%d/%Y %H:%M" font "Arial,08"
	
set border lw 2
set xrange [ 0 : $max_value ]
set yrange [ 0 : 100 ]
set xlabel "PSA @ 1.0 sec. (%g)"
set ylabel "Probability of Exceedance (%)"
set style fill solid 0.5 
set style line 1 lt 2 lc rgb "dark-red" lw 2

set key off

set object 1 rect from graph 0, 0, 0 to graph 1, 1, 0 behind lw 1.0 fc  rgb "gray"  fillstyle   solid 0.15 border -1
$obj_cmd
set title "Fragility Curves for Facility $fac_id\\nEvent: $event" font \"Times,15\"
$label
$cmd
$gnuplot_data

unset xrange
reset
gnuplot_Commands_Done

}

sub parse_facility_exposure {
  my ($evid, $version) = @_;
  my $file = "$sc_dir/$evid-$version/exposure.csv";
  return unless (-e $file);
 

  use Text::CSV_XS;

  my @rows;
  my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or return "Cannot use CSV: ".Text::CSV->error_diag ();
 
  open my $fh, "<:encoding(utf8)", $file or return"$file: $!";
  while ( my $row = $csv->getline( $fh ) ) {
    $row->[3] =~ m/\d+/ or next; # 3rd field should match
    push @rows, $row;
  }
  $csv->eof or $csv->error_diag();
  close $fh;

  return \@rows;
}

sub parse_event_catalog {
  my ($file) = @_;
  return unless (-e $file);
 

  use Text::CSV_XS;

  my @rows;
  my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or return "Cannot use CSV: ".Text::CSV->error_diag ();
 
  open my $fh, "<:encoding(utf8)", $file or return"$file: $!";
  while ( my $row = $csv->getline( $fh ) ) {
    $row->[5] =~ m/\d+/ or next; # 3rd field should match
    push @rows, $row;
  }
  $csv->eof or $csv->error_diag();
  close $fh;

  return \@rows;
}

sub parse_event {
  my ($file) = @_;
  return unless (-e $file);
 

  use XML::LibXML::Simple;

  my $event = XMLin($file);

  return $event;
}


sub parse_station {
  my ($file) = @_;
  return unless (-e $file);
 

  use XML::LibXML::Simple;

  my $event = XMLin($file);

  return $event->{stationlist};
}


### SAVE ROOM AT THE TOP ###
sub parse_facility {
  my ($evid, $version) = @_;
  my $file = "$sc_dir/$evid-$version/exposure.csv";
  return unless (-e $file);
 

  use Text::CSV_XS;

  my @rows;
  my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or return "Cannot use CSV: ".Text::CSV->error_diag ();
 
  open my $fh, "<:encoding(utf8)", $file or return"$file: $!";
  while ( my $row = $csv->getline( $fh ) ) {
    $row->[0] =~ m/\w+/ or next; # 3rd field should match
    $row->[0] !~ m/^facility_type/i or next; # skip header
    push @rows, $row;
  }
  $csv->eof or $csv->error_diag();
  close $fh;

  return \@rows;
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

