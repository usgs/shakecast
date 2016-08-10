#!/usr/local/bin/perl

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use Text::CSV_XS;
use Data::Dumper;
use Shake::Distance;
use Shake::Regressions;
use Shake::Source;

SC->initialize();
my $config = SC->config;

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $const_yr = $ARGV[2];
my $gnuplot  = $config->{'gnuplot'};
my $event = "$evid-$version";

# some data to layout
#my $facility_data = parse_facility_exposure($evid, $version);
my $earthquake = parse_event("$sc_dir/$event/event.xml");
my $info = parse_event("$sc_dir/$event/info.xml");
my $stations = parse_station("$sc_dir/$event/stationlist.xml");
my $facility = "$db_dir/exposure.csv";
my $facility_data = parse_facility($evid, $version);

my $gmpe = ($info->{tag}->{regression}->{value}) ? $info->{tag}->{regression}->{value}
	: 'Regression::BJF97';

my $output_png;

my $x = 0.6;
my $y = 0.6;
my $color = 1; 
my $count;
my ($max_x, $max_y, $max_label);
my $max=0;
my $data;
my ($min_yr, $max_yr, $label_yr) = (1973, 2008, 2000);
$const_yr = (defined $const_yr) ? $const_yr : $min_yr;
my $event_timestamp;
if ($earthquake) {
  my ($year, $month, $day, $hour, $min, $sec) = $earthquake->{'event_timestamp'} =~ /(\d+)/g;
  $event_timestamp = join '/', ($month, $day, $year);
  $max_yr = $year++;
    if ($row->[13] > $max) {
      $max_y = $max = $row->[13];
      $max_x = $datetime;
      $max_label = $row->[1].' M'.$row->[3];
    }
}


my @fac_exp;
my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or die "Cannot use CSV: ".Text::CSV->error_diag ();

open my $fh, "<:encoding(utf8)", $facility or die "$facility: $!";
while ( my $row = $csv->getline( $fh ) ) {
  push @fac_exp, $row;
}
$csv->eof or $csv->error_diag();
close $fh;

my ($faultcoords);
my $class = $gmpe;
my $regress = $class->new($earthquake->{lat}, $earthquake->{lon}, $earthquake->{magnitude}, $earthquake, $faultcoords);

my $sd_pga = $regress->sd('pga');
#my $sd_pga = log($sd{pga});
my %pgm;
my $reg_mod;
my @mod_dist = ( 1 .. 1000);
foreach my $dist (@mod_dist) {
	%pgm = $regress->maximum($earthquake->{lat}, $earthquake->{lon}, $dist);
    $reg_mod .= $dist.' '.$pgm{pga}.' '.$pgm{pga}/$sd_pga.' '.$pgm{pga}*$sd_pga."\n";
}
	
my $input_sta = "$sc_dir/$event/sta.dat";
open(FH, "> $sc_dir/$event/sta.dat") or die "couldn't open station file";
foreach my $sta_name (keys %{$stations->{station}}) {
  #$data = $npp = $max_x = $max_y = $max_label = '';
  $output_png = "$sc_dir/$event/station.png";
  $max = $max_x = $max_y = $max_label = 0;
  
  my $sta_data = $stations->{station}->{$sta_name}->{comp};
  my $peak;
	foreach my $comp (keys %{$sta_data}) {
	  next if ($comp =~ /N|Z/i);
	  if ($sta_data->{$comp}->{acc}->{value}) {
		  $peak = $sta_data->{$comp}->{acc}->{value} if ($sta_data->{$comp}->{acc}->{value} > $mean);
		}
	}
	my $dist = dist($earthquake->{lat}, $earthquake->{lon}, $stations->{station}->{$sta_name}->{lat}, $stations->{station}->{$sta_name}->{lon});
	#print FH $stations->{station}->{$sta_name}->{dist},' ', $peak,"\n" if ($peak);
	print FH $dist,' ', $peak,"\n" if ($peak);
  }
close(FH);

foreach my $facility (@{$facility_data}) {
    next unless (defined $facility->[0]);
    $data .= $facility->[3].' '.$facility->[8]."\n";
}
&send_sta_data_to_gnuplot();
exit;

sub send_sta_data_to_gnuplot
{
    open (GNUPLOT, "| $gnuplot");
    print GNUPLOT <<gnuplot_Commands_Done;
	set terminal png transparent nocrop enhanced size 800,400
	set output "$output_png"

set log xy
set xrange [ 10 : 1000 ]
set yrange [  : 300 ]
set xlabel "Distance [KM]"
set ylabel "PGA (%g)"
set style fill solid 0.40 

set key Left center bottom reverse
label1 = "Model - Std. Dev."
label2 = "Model + Std. Dev."
label3 = "Station Data"
label4 = "Facility Data"

set title "$gmpe - PGA (%g)" font \"Times,15\"
plot '-' using 1:2:3 with filledcurve title label1, '-' using 1:2:4 with filledcurve title label2 , "$input_sta" with points pointtype 8 title label3, '-' using 1:2 with points pointtype 5 ps 2 title label4
$reg_mod
e
$reg_mod
e
$data
e

unset label
gnuplot_Commands_Done
close (GNUPLOT);

}

sub send_data_to_gnuplot
{
    open (GNUPLOT, "| $gnuplot");
    print GNUPLOT <<gnuplot_Commands_Done;
	set terminal png transparent nocrop enhanced font arial 12 size 800,400
	set output "$output_png"

#set style data histogram
set border lw 3
set grid noxtics nomxtics ytics nomytics noztics nomztics \\
 nox2tics nomx2tics noy2tics nomy2tics nocbtics nomcbtics
set xdata time
set style fill   pattern 2 border 1
#set style fill solid border -1
set xtics rotate by -45 scale 0 
set timefmt "%m/%d/%Y"
set xrange ["01/01/$min_yr":"12/31/$max_yr"]
set format x "%Y"
$max_label

#set key title "Estimated PGA"
#set key top left Left reverse samplen 1 
set key off
set xlabel "Year"
set ylabel "PGA (%g)"

set object 1 rect from graph 0, 0, 0 to graph 1, 1, 0 behind lw 1.0 fc  rgb "gray"  fillstyle   solid 0.15 border -1
set object 2 rect from "01/01/$min_yr", 1 to  "12/31/$max_yr", 10 behind fc rgb 'light-green' fillstyle solid 0.3 noborder
set object 3 rect from "01/01/$min_yr", 10 to  "12/31/$max_yr", 20 behind fc rgb 'gold' fillstyle solid 0.3 noborder
set object 4 rect from "01/01/$min_yr", 20 to  "12/31/$max_yr", 30 behind fc rgb 'tan1' fillstyle solid 0.3 noborder
set object 5 rect from "01/01/$min_yr", 30 to  "12/31/$max_yr", 999 behind fc rgb 'dark-red' fillstyle solid 0.3 noborder
set object 6 rect from "01/01/$min_yr", 0 to  "1/1/$const_yr", 999 behind lw 0 fc rgb 'gray' fillstyle  pattern 4 


set title "Shaking History for Nuclear Power Plant $npp" font \"Times,15\"
plot '-' using 1:2 with impulses lw 2 
$data
e

unset label
gnuplot_Commands_Done
close (GNUPLOT);

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

