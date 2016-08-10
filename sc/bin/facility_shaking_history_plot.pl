#!/usr/local/bin/perl

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use Text::CSV_XS;

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
my $facility_data = parse_facility_exposure($evid, $version);
my $earthquake = parse_event("$sc_dir/$event/event.xml");
my $facility = "$db_dir/exposure.csv";
my $output_png;

my $x = 0.6;
my $y = 0.6;
my $color = 1; 
my $count;
my ($max_x, $max_y, $max_label);
my $max=0;
my $data;
my ($min_yr, $max_yr, $label_yr) = (1973, 2012, 2000);
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

foreach my $facility (@{$facility_data}) {
  my $fac_type = $facility->[0];
  my $fac_name = $facility->[1];
  $data = $npp = $max_x = $max_y = $max_label = '';
  $output_png = "$sc_dir/$event/shaking_".(lc($fac_type))."_$fac_name.png";
  $max = $max_x = $max_y = $max_label = 0;
  
  foreach my $fac_exp (@fac_exp) {
    next unless ($fac_exp->[7] eq $fac_name);
    my ($year, $month, $day, $hour, $min, $sec) = $fac_exp->[2] =~ /(\d+)/g;
    my $datetime = join '/', ($month, $day, $year);
    $fac_exp->[1] = '-' if ($fac_exp->[1] eq '');
    $npp = $fac_exp->[8].' ('.$fac_exp->[7].')';
    $data .= ''.$datetime.' '.$fac_exp->[13].' "'.$fac_exp->[1]."\"\n";
    if ($fac_exp->[13] > $max) {
      $max_y = $max = $fac_exp->[13];
      $max_x = $datetime;
      $max_label = $fac_exp->[1].' M'.$fac_exp->[3];
    }
  }
  $data .= ''.$event_timestamp.' '.$facility->[7].' "'."\"\n";

#print $data;
($month, $day, $year) = split '/', $max_x;
$align = ($year < $label_yr) ? "left" : "right";
$max_label = "set label \"$max_label\" at \"$max_x\",$max_y $align font \"Arial,10\" offset 0, -0.5 textcolor rgb \"blue\"";

&send_data_to_gnuplot();
} 

exit(0);

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


