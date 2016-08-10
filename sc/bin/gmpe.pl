#!/usr/local/bin/perl

#use strict;
#use warnings;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;

use LWP::Simple;
use Math::Trig;
use Text::CSV_XS;

use Shake::Regression::BJF97;

my ($src,$faultcoords);
my $class = "Regression::BJF97";
my $regress = $class->new(35.3,138.7,6.2,$src,$faultcoords);
    print "Computing spatial variability.\n";

    my %sd = $regress->sd();
    my $sd_pga = log($sd{pga});
    my %random = $regress->maximum(35.4,138.8);

	print "sd_pga: $sd_pga, ", $random{pga},"\n";

exit;

$gnuplot  = "c:/gnuplot/binary/gnuplot.exe";
$icon = "nuclear.png";
SC->initialize();
my $config = SC->config;

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';
my $sub_ins_upd;

#http://maps.google.com/maps/api/staticmap?center=40,-70&zoom=6&size=800x800&markers=icon:http://earthquake.usgs.gov/research/software/shakecast/icons/epicenter.png|40,-70&sensor=false&&path=fillcolor:0xAA000033|color:0xFFFFFF00|45,-75|45,-65|35,-65|35,-75|45,-75&&path=fillcolor:0xAA000033|color:0xFFFFFF00|42,-72|42,-68|38,-68|38,-72|42,-72

$count_limit = 20;
$len_limit = 1500;

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $event = "$evid-$version";

# some data to layout
my $facility_data = parse_facility_exposure($evid, $version);
my $earthquake_catalog = parse_event_catalog("$db_dir/earthquake.csv");
my $earthquake = parse_event("$sc_dir/$event/event.xml");
my $epicenter;
if ($earthquake) {
  my $epi_lat = sprintf("%.2f", $earthquake->{'lat'});
  my $epi_lon = sprintf("%.2f", $earthquake->{'lon'});
  $epicenter = "&markers=icon:http://shakecast.awardspace.com/images/epicenter.png|".
     "$epi_lat,$epi_lon";
}

foreach my $facility (@{$facility_data}) {
  my (%hist_evt, $counter, $output_png, $icon, $center);
  my ($cir3, $cir10, $min_lon, $max_lon, $min_lat, $max_lat, $fac_lat, $fac_lon, $fac_type, $fac_id);
  $fac_lat = $facility->{LATITUDE};
  $fac_lon = $facility->{LONGITUDE};
  $fac_type = $facility->{FACILITY_TYPE};
  $fac_id = $facility->{FACILITY_ID};
  $center = "$fac_lat,$fac_lon";
  $icon = lc($fac_type).".png";
  print "$fac_type, $fac_id, $fac_lat, $fac_lon\n";
  $output_png = "./epicenter_".(lc($fac_type))."_$fac_id.png";
  ($cir3, $min_lon, $max_lon, $min_lat, $max_lat) = circle_dist($fac_lon, $fac_lat, 300);
  ($cir10, $min_lon, $max_lon, $min_lat, $max_lat) = circle_dist($fac_lon, $fac_lat, 1000);
  foreach  my $event (@{$earthquake_catalog}) {
    $event->[0] =~ m/\w+/ or next;
    my ($locstring, $tabsol, $mag, $lat_h, $lon_h) = 
      ($event->[2], $event->[3], $event->[5], $event->[6], $event->[7]);
    next unless ($lat_h > $min_lat && $lat_h < $max_lat && 
      ($lon_h > $min_lon || $lon_h < ($min_lon+360)) &&
      ($lon_h < $max_lon || $lon_h > ($max_lon-360)) );
    next if (dist($fac_lat, $fac_lon, $lat_h, $lon_h) > 1000);
    $lat_h = sprintf("%.2f", $lat_h);
    $lon_h = sprintf("%.2f", $lon_h);
    push @{$hist_evt{int($mag)}}, "$lat_h,$lon_h";
    last if (++$counter >= $count_limit);

  }
 
  $url = "http://maps.google.com/maps/api/staticmap?center=$center&zoom=5&size=800x800$epicenter&markers=icon:http://shakecast.awardspace.com/images/$icon|$center&path=fillcolor:0xAA000033|color:0xFFFFFF00|$cir10&path=fillcolor:0xAA000033|color:0xFFFFFF00|$cir3&sensor=false";
print $url,"\n";
  for ($mag = 10; $mag >= 4; $mag--) {
    if (scalar @{$hist_evt{$mag}} > 0) {
      $evt_seg = "&markers=icon:http://shakecast.awardspace.com/images/mag$mag.png|".
        (join '|', @{$hist_evt{$mag}});
      $url .= $evt_seg if (length($url) + length($evt_seg) < $len_limit);
    }
  }

  $content = get($url);
  die "Couldn't get it!" unless defined $content;

  open (FH, "> $output_png") or die "couldn't write to file $output_png\n";
  binmode FH;
  print FH $content;
  close(FH);
  last;
}

exit;

$pi = 3.141592426;
$ratio=2700/180;
$span = 7.5;
$adj_lon = ($lon + 180) *$ratio;
$adj_lat = ($lat + 90) * $ratio;

print "$adj_lon, $adj_lat\n";


$rad10 = 5*$ratio;
$rad3 = 1.5*$ratio;
$epicenter = "$adj_lon $adj_lat $rad10\n$adj_lon $adj_lat $rad3";
$xrange = '['.($adj_lon-$span*$ratio).':'.($adj_lon+$span*$ratio).']';
$yrange = '['.($adj_lat-$span*$ratio).':'.($adj_lat+$span*$ratio).']';

&send_data_to_gnuplot();

exit(0);

sub send_data_to_gnuplot
{
    open (GNUPLOT, "| $gnuplot");
    print GNUPLOT <<gnuplot_Commands_Done;
	set terminal png transparent enhanced truecolor size 400,400
	set output "$output_ppm"

set noxtics
set noytics
set noztics
set noborder
set bmargin 0
set lmargin 0
set rmargin 0
set tmargin 0
set nokey
set xrange $xrange
set yrange $yrange

set style fill solid 1.0

#set object 10 rectangle center 0,0 size 6,6 fc rgb "cyan" fillstyle solid 1.0
#set title "Shaking History for Nuclear Power Plant" font \"Times,15\"
plot 'test.rgb' binary array=(5400,2700) flip=y format='\%uchar' using 1:2:3 with rgbimage, '-' with circles lc rgb "red" fs transparent solid 0.25 
$epicenter
e
unset label
gnuplot_Commands_Done
close (GNUPLOT);

}

sub dist {

  my ($a,$b,$x,$y) = @_;
  my($dlat,$dlon,$avlat,$f,$bb,$aa,$dist,$az);

  # Ensure right hemisphere
  $dlon = ($y-$b);
  $dlon += 360 if ($dlon<-180);
  $dlon -= 360 if ($dlon>=180);
  $dlon *= .0174533;

  $dlat  = ($a-$x)*(.0174533);
  $avlat = ($x+$a)*(.00872665);
  $f     = sqrt (1.0 - 6.76867E-3*((sin $avlat)**2));
  $bb    = ((cos $avlat)*(6378.276)*$dlon/$f);
  $aa    = ((6335.097)*$dlat/($f**3));
  $dist  = sqrt ($aa**2 + $bb**2);
  $dist  = sprintf("%.2f",$dist);

  $az = $PI-atan2($bb,$aa);
  return wantarray ? ($dist,$az) : $dist;
}

sub circle_dist {

  my ($lon, $lat, $dist) = @_;
  my $earthRadius = 6378.137;
  my $pi = 3.141592624;
  my $facet = 24;

  $lon = $lon * $pi / 180;
  $lat = $lat * $pi / 180;
  my @circle;
  my ($max_lon, $min_lon, $max_lat, $min_lat);
  $min_lon = $min_lat = 999;
  $max_lon = $max_lat = -999;
  for (my $ind = 0; $ind < $facet; $ind++) {
    my $brng = $ind * $pi / $facet * 2;
    $lat2 = asin(sin($lat) * cos($dist/$earthRadius) + cos($lat)*sin($dist/$earthRadius)*cos($brng));
    $lon2 = $lon + atan2(sin($brng)*sin($dist/$earthRadius)*cos($lat),
      cos($dist/$earthRadius) - sin($lat)*sin($lat2));
    $lat2 = sprintf("%.2f", $lat2 * 180 / $pi);
    $lon2 = sprintf("%.2f", $lon2 * 180 / $pi);
    if ($lon2 > $max_lon) {
      $max_lon = $lon2;
    } elsif ($lon2 < $min_lon) {
      $min_lon = $lon2;
    }
    if ($lat2 > $max_lat) {
      $max_lat = $lat2;
    } elsif ($lat2 < $min_lat) {
      $min_lat = $lat2;
    }
    $lon2 += 360 if ($lon2<-180);
    $lon2 -= 360 if ($lon2>=180);
    push @circle, "$lat2,$lon2";
  } 
  return ((join '|', @circle), $min_lon, $max_lon, $min_lat, $max_lat);
}

# Read and process header, building data structures
# Returns 1 if header is ok, 0 for problems
sub process_header {
	my ($fh, $csv) = @_;
    my $err_cnt = 0;
    my %columns;

    my $header = $fh->getline;
    return 1 unless $header;      # empty file not an error
    
    # parse header line
    #vvpr $header;
    unless ($csv->parse($header)) {
        #epr "CSV header parse error on field '", $csv->error_input, "'";
        return 0;
    }

    my $ix = 0;         # field index

    # uppercase and trim header field names
    my @fields = map { uc $_ } $csv->fields;
    # Field name is one of:
    #   METRIC:<metric-name>:<metric-level>
    #   GROUP:<group-name>
    #   <facility-column-name>
    foreach my $field (@fields) {
		#vvpr "$ix\: COLUMN: $field";
		# TODO check for unknown columns (either here or later on)
        $field =~ s/^\s+//;
        $field =~ s/\s+$//;
		$columns{$field} = $ix;
        $ix++;
    }

    # check for required fields
    #while (my ($req, $req_type) = each %required) {
        # relax required fields for update (only PK is mandatory)
        #next if $req_type == 2 and $mode == M_UPDATE;
        #unless (defined $columns{$req}) {
        #    epr "required field $req is missing";
        #    $err_cnt++;
        #}
    #}

    return 0 if $err_cnt;

    # build sql
    my @keys = sort keys %columns;
    
    
    # dynamically create a sub that takes the input array of fields and
    # returns a new list with just those fields that go into the facility
    # insert/update statement, in the proper order
    my $sub = "sub { return {" .
        join(',', (map { q{'}.$_.q{' => }. q{$_[0]->[} .$columns{$_}.q{]} } (@keys))) .
        '} }';
    #print "$sub\n";
    #vvpr $sub;
    $sub_ins_upd = eval $sub;

    return 1;

}


sub parse_facility_exposure {
  my ($evid, $version) = @_;
  my $file = "$sc_dir/$evid-$version/exposure.csv";
  return unless (-e $file);
  
  use Text::CSV_XS;
  use Data::Dumper;
  
  my @rows;
  my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or return "Cannot use CSV: ".Text::CSV->error_diag ();
 
  open my $fh, "<:encoding(utf8)", $file or return"$file: $!";
  process_header($fh, $csv);
  while ( my $row = $csv->getline( $fh ) ) {
	my $result = &$sub_ins_upd($row);
    $result->{LATITUDE} =~ m/\d+/ or next; # 3rd field should match
	push @rows, $result;
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
    $row->[3] =~ m/\d+/ or next; # 3rd field should match
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

