#!/usr/local/bin/perl

my $start = time;

use FindBin;
use lib "$FindBin::Bin/../lib";
use File::Path;
use SC;

SC->initialize();
my $config = SC->config;

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $facility_id = $ARGV[2];
my $gnuplot  = $config->{'gnuplot'};
my $event = "$evid-$version";
my $dir_path = "$sc_dir/$event/fragility";
mkdir($dir_path) unless (-d $dir_path);

# map array index to damage level
my @damage_levels = (
    'GREEN',
    'YELLOW',
    'ORANGE',
    'RED'
);

# some data to layout
#my $facility_data = parse_facility_exposure($evid, $version);

my %metric_column_map = metric_list();
my $sql_fac;
$sql_fac = 'AND ffm.facility_id = '.$facility_id if ($facility_id);

my $fac_list = SC->dbh->selectall_arrayref(qq{
	SELECT DISTINCT fs.facility_id, ffm.class, ffm.component
	FROM facility_shaking fs inner join grid g on
		fs.grid_id = g.grid_id
	INNER JOIN facility_fragility_model ffm ON fs.facility_id = ffm.facility_id
	WHERE g.shakemap_id = ? and g.shakemap_version = ?
	$sql_fac
	}, undef, $evid, $version);

print scalar @$fac_list,"\n";
    open (GNUPLOT, "| $gnuplot");
foreach my $facility (@$fac_list) {
	my $output_png;
	my $gnuplot_data;
	my $cmd;
	my $max_value;
	my ($fac_id, $class, $component, $model_id) = @$facility;
	
	$output_png = "$dir_path/$fac_id".lc($class).lc($component).".png";
	my $fac_metric = SC->dbh->selectall_arrayref(qq{
		SELECT ffm.damage_level,probability,exp(low_limit*beta)*alpha, metric 
		FROM `lognorm_probability` lp, facility_fragility_model ffm 
			inner join damage_level dl on dl.damage_level = ffm.damage_level 
		WHERE facility_id=? AND class = ? AND component = ?
		order by severity_rank,probability}, undef, $fac_id,$class, $component);
		 	
	my %fac_frag; 
	my %frag_metric;
	my %damage_level;

	my $data_line;
	foreach my $m (@$fac_metric) {
		$data_line = (($m->[1])*100).' '.$m->[2]."\n";
		$fac_frag{$m->[0]} .= $data_line;
		$frag_metric{$m->[0]} = $m->[3];
	}

	#foreach my $d_state (keys %fac_frag) {
	#	my $outfile = "$sc_dir/$event/fragility/${fac_id}_${d_state}.txt";
	#	open (FH, "> $outfile") or next;
	#	print FH $fac_frag{$d_state};
	#	close (FH);
	#}
	#next;
	$max_value = (@{$fac_metric}[(scalar @$fac_metric)-1]->[2] * 0.5 > 200) ? 200 
		: @{$fac_metric}[(scalar @$fac_metric)-1]->[2] * 0.5;
	my @damage_states;
	my $metric_key;
	foreach my $key (@damage_levels) {
		next unless ($fac_frag{$key});
		$gnuplot_data .= $fac_frag{$key}.$data_line."e\n";
		push @damage_states, $key;
		$metric_key = $metric_column_map{$frag_metric{$key}};
	}
	my @gnuplot_cmd =  map { "'-' using 2:1:(0) with filledcurve title '".$_."' lc rgb '".lc($_)."'" } @damage_states;
	$cmd = 'plot '. (join ', ', @gnuplot_cmd);
	
	my $fac_frag_prob = SC->dbh->selectall_arrayref(qq{
		SELECT ffp.damage_level, ffp.probability, ffp.metric, fs.value_$metric_key  
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
		and ffp.facility_id= ?
		AND ffm.class = ? AND ffm.component = ?
		ORDER BY dl.severity_rank}, undef, $evid, $version, $fac_id,$class, $component);

	my $total_ratio = 1;
	#my $obj_cmd = "set object rect from graph 0.6, 0.05 to  graph 0.95, 0.4 front fc rgb '#FFD700' fillstyle solid 0.15\n" ;
	my $x_inc = 0.10;
	my $x_ind = 0.87 - scalar @damage_states * $x_inc;
	my $obj_cmd = "set object rect from graph ".($x_ind-0.01).", 0.05 to  graph ".($x_ind+$x_inc*(scalar @$fac_frag_prob+1)+0.01).",0.47 front fc rgb '#FFD700' fillstyle solid 0.15\n" ;
	my $label.= "set label \"Distribution of Probability\" at graph ".($x_ind+$x_inc*(scalar @$fac_frag_prob+1)/2).", 0.50 front center font \"Arial,11\"\n";
	my %color_spec = ("" => 'gray', "GREEN" => 'green', "YELLOW" => 'yellow', "ORANGE" => 'orange', "RED" => 'red');
	foreach my $ind (0 .. scalar @$fac_frag_prob - 1) {
		my $frag_prob = @$fac_frag_prob[$ind];
		my $frag_prob_nxt = @$fac_frag_prob[$ind+1];
		if ($ind == 0) {
			my $prob = $total_ratio - $frag_prob->[1];
			$obj_cmd .= "set object rect from graph $x_ind, 0.06 to  graph ".($x_ind+$x_inc).", ".($prob *0.4+0.06)." front fc rgb 'gray' fillstyle solid 0.55 noborder\n" ;
			$label .= "set label \"".(int($prob*100+0.5))."%\" at graph ".($x_ind+$x_inc/2).", 0.08 front center font \"Arial,11\"\n";
			$x_ind += $x_inc;
		}
		my $prob = $frag_prob->[1] - $frag_prob_nxt->[1];
		my $color = ($color_spec{$frag_prob->[0]}) ? $color_spec{$frag_prob->[0]} : 'gray';
		$obj_cmd .= "set object rect from graph $x_ind, 0.06 to  graph ".($x_ind+$x_inc).", ".($prob *0.4+0.06)." front fc rgb '".$color."' fillstyle solid 0.55 noborder\n" ;
		$label .= "set label \"".(int($prob*100+0.5))."%\" at graph ".($x_ind+$x_inc/2).", 0.08 front center font \"Arial,11\"\n";
		$x_ind += $x_inc;
	}
	$cmd .= ", '-' using 1:2 with lines ls 1 notitle, '-' using 1:2:1 with labels left offset 1,1 notitle";
	$gnuplot_data .= @$fac_frag_prob[0]->[3]." 0\n".@$fac_frag_prob[0]->[3]." 100\ne\n".@$fac_frag_prob[0]->[3]." 0\ne";

	send_data_to_gnuplot($event, $fac_id, $output_png, $label, $max_value, $obj_cmd, $cmd, $gnuplot_data);
}
close (GNUPLOT);
my $end = time;

print "The total time is ", $end-$start;
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

