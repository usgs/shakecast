#!/usr/local/bin/perl


# $Id: scfeed_local.pl 481 2008-10-03 16:49:46Z klin $

##############################################################################
# 
# Terms and Conditions of Software Use
# ====================================
# 
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
# 
# Disclaimer of Earthquake Information
# ====================================
# 
# The data and maps provided through this system are preliminary data
# and are subject to revision. They are computer generated and may not
# have received human review or official approval. Inaccuracies in the
# data may be present because of instrument or computer
# malfunctions. Subsequent review may result in significant revisions to
# the data. All efforts have been made to provide accurate information,
# but reliance on, or interpretation of earthquake data from a single
# source is not advised. Data users are cautioned to consider carefully
# the provisional nature of the information before using it for
# decisions that concern personal or public safety or the conduct of
# business that involves substantial monetary or operational
# consequences.
# 
# Disclaimer of Software and its Capabilities
# ===========================================
# 
# This software is provided as an "as is" basis.  Attempts have been
# made to rid the program of software defects and bugs, however the
# U.S. Geological Survey (USGS) have no obligations to provide maintenance, 
# support, updates, enhancements or modifications. In no event shall USGS 
# be liable to any party for direct, indirect, special, incidental or 
# consequential damages, including lost profits, arising out of the use 
# of this software, its documentation, or data obtained though the use 
# of this software, even if USGS or have been advised of the
# possibility of such damage. By downloading, installing or using this
# program, the user acknowledges and understands the purpose and
# limitations of this software.
# 
# Contact Information
# ===================
# 
# Coordination of this effort is under the auspices of the USGS Advanced
# National Seismic System (ANSS) coordinated in Golden, Colorado, which
# functions as the clearing house for development, distribution,
# documentation, and support. For questions, comments, or reports of
# potential bugs regarding this software please contact wald@usgs.gov or
# klin@usgs.gov.  
#
#############################################################################

use strict;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use Cwd;
use File::Path;
use File::Basename qw(basename);
use IO::File;
use XML::Writer;
use XML::LibXML::Simple;
use XML::Parser;
use Getopt::Long;

############################################################################
# Prototypes for the logging routines
############################################################################
sub logscr;
sub mydate;

#######################################################################
# Global variables
#######################################################################

my $arglist = "@ARGV";		# save the arguments for entry
                                # into the database

#----------------------------------------------------------------------
# Name of the configuration files
#----------------------------------------------------------------------

#######################################################################
# End global variables
#######################################################################

#######################################################################
# Stuff to handle command line options and program documentation:
#######################################################################

my $desc = 'Create XML messages and feed them to ShakeCast.';

my $flgs = [{ FLAG => 'event',
	      ARG  => 'event_id',
              TYPE => 's',
	      REQ  => 'y',
	      DESC => 'Specifies the id of the event to process'},
          { FLAG => 'scenario',
            DESC => 'Force the system to treat this event as a scenario. '
			  . 'Note: this flag usually is not necessary (i.e., if '
			  . 'the event id ends with "_se" or tag has run with '
			  . 'the -scenario flag).'},
            { FLAG => 'sc_id',
	      ARG  => 'sc_id',
              TYPE => 's',
              DESC => 'Specifies the final ShakeCast id of the event.'},
            { FLAG => 'force_run',
              DESC => 'Force run a ShakeMap event.'},
            { FLAG => 'verbose',
              DESC => 'Prints informational messages to stderr.'},
            { FLAG => 'help',
              DESC => 'Prints program documentation and quit.'}
           ];

my $options = setOptions($flgs) or logscr("Error in setOptions");
if (defined $options->{'help'}) {
  printDoc($desc);
  exit 0;
}

defined $options->{'event'}
        or logscr "Must specify an event with -event flag";

my $evid     = $options->{'event'};
my $verbose  = defined $options->{'verbose'}  ? 1 : 0;
my $sc_id  =  $options->{'sc_id'} if (defined $options->{'sc_id'});
my ($scenario, $forcerun, $cancel, $test);
my $scenario = defined $options->{'scenario'} ? 1 : 0;
my $force_run = defined $options->{'force_run'} ? 1 : 0;

$scenario = 1 if $evid =~ /_se$/i;
$force_run = 1 if $scenario;

logscr "Unknown argument(s): @ARGV" if (@ARGV);

#######################################################################
# End of command line option stuff
#######################################################################

#######################################################################
# User config 
#######################################################################
	

my $config_file = (exists $options->{'conf'} ? $options->{'conf'} : 'sc.conf');
SC->initialize($config_file, 'local_inject')
	or die "could not initialize SC: $SC::errstr";

my $perl = SC->config->{perlbin};
my $scroot = SC->config->{RootDir};
my $download_dir;
my @grids = metric_list();
my $sc_data;

exit main();
0;

sub main {

  my ($sv, $dbh, $sth, $ofile, $fh, $ev_status, $sm_status, $etype);
  my (%grdinfo, $file, $base, $lines, $val);
  my ($owd, $writer, $key, $product);
  my ($command, $result);
  my $prog = basename($0);

	$download_dir = SC->config->{DataRoot};
	#validate directory
	my $dest = $download_dir."/$evid";
	if (not -e "$dest") {
		die "Couldn't locate event $dest";
	}
	
	if (-e "$download_dir/$evid/grid.xml") {
		print "using sc_xml\n";
		sc_xml($evid); 
	} else {
		print "using sc_grid\n";
		sc_grid($evid);
	}

	exit unless (&shakemap_filter || $force_run);
	# Determine whether this is the first version of this event we
	# have received or not
	#my $num_recs =
	#	SC->dbh->selectrow_array(qq/
	#    select count(*)
	#      from event
	#     where event_id = ?/, undef, $evid);
		 
	#if ($num_recs <= 0) {
		#-----------------------------------------------------------------------
		# Send the event message
		#-----------------------------------------------------------------------
		$command = "$perl $scroot/bin/sm_inject.pl "
		   . "--verbose --conf $scroot/conf/sc.conf "
		   . "$sc_data/event.xml";
		print "Running: '$command'\n" if $verbose;
		$result = `$command`;
		logscr "Error in sm_new_event: '$result'" if ($result !~ /STATUS=SUCCESS/);
		print "Result: '$result'\n" if $verbose;
	#}

  #-----------------------------------------------------------------------
  # Send the shakemap message
  #-----------------------------------------------------------------------
  $command = "$perl $scroot/bin/sm_inject.pl "
	   . "--verbose --conf $scroot/conf/sc.conf "
	   . "$sc_data/shakemap.xml";
  print "Running: '$command'\n" if $verbose;
  $result = `$command`;
  logscr "Error in sm_new_shakemap: '$result'" if ($result !~ /STATUS=SUCCESS/);
  print "Result: '$result'\n" if $verbose;

  #-----------------------------------------------------------------------
  # Send the product messages
  #-----------------------------------------------------------------------
  if ($result =~ /STATUS=SUCCESS/) {
	  foreach $file ( <$sc_data/p??.xml> ) {
		$command = "$perl $scroot/bin/sm_inject.pl "
		   . "--verbose --conf $scroot/conf/sc.conf "
			 . "$file";
		print "Running: '$command'\n" if $verbose;
		$result = `$command`;
		logscr "Error in sm_new_product ($file): '$result'" 
				if ($result !~ /STATUS=SUCCESS/);
		print "Result: '$result'\n" if $verbose;
	  }
  }

return 0;

}

# returns a list of all products that should be polled for new events, etc.
sub shakemap_filter {
	my $xml = XMLin("$sc_data/event.xml");

	my @regions;
	my ($all_regions, $rc);
	
	push @regions, split(' ', SC->config->{'rss'}->{'REGION'});
	$all_regions = 1 if (grep /all/i, @regions);
	my $network = $xml->{'event_region'};
	
	return (0) unless ((grep /$network/i, @regions) || $all_regions);
	$network =~ s/global/us/;
	$network =~ s/pn/uw/;
	$network =~ s/sc/ci/;
	my $time_window = (SC->config->{'rss'}->{'TIME_WINDOW'}) ? 
						SC->config->{'rss'}->{'TIME_WINDOW'} : 30;
	my $eq_time = SC->ts_to_time($xml->{'event_timestamp'});
	my $time_cutoff = $eq_time + $time_window * 86400;

	return (0) unless ($time_cutoff > time() );

	use Graphics_2D;
	my $sth_lookup_poly = SC->dbh->prepare(qq{
		select profile_name, geom
		  from geometry_profile});

    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_poly, {Columns=>[1,2]});
	return (1) unless (scalar @$idp >= 1);
	while (@$idp) {
		my $profile_name = shift @$idp;
		my $geom = shift @$idp;

		my $polygon = load_geometry($profile_name,$geom);
		#print "$facility::$lon::$lat\n";
		if ($polygon->{POLY}->crossingstest([$xml->{'lon'}, $xml->{'lat'}])) {
			$rc=1;
			last;
		}
	}

	return $rc;
}

sub load_geometry {
  #----------------------------------------------------------------------
  #	@boxes = [ { 'ZONE'    => zone,
  #	             'COORDS' => [ [ lat1, lon1 ], ..., [ latN, lonN ] ],
  #                  'POLY'   => polygon_reference },
  #                  { ... }, ... ];
  #----------------------------------------------------------------------
  my ($zone, $geom)   = @_;
  my ($nc, $poly, $lat, $lon, $north_b, $south_b, $east_b, $west_b);
  my $box    = {};
  my $coords = [];
  my @args = split /,/, $geom;

  $box->{ZONE}    = $zone;
  $box->{COORDS} = $coords;

  return 0 if (($nc = @args) % 2 != 0);
  $nc /= 2;
  return 0 if $nc < 3;
  while (@args) {
    $lat = shift @args;
	$north_b = _max($lat, $north_b);
	$south_b = _min($lat, $south_b);
	
    $lon = shift @args;
	$east_b = _max($lon, $east_b);
	$west_b = _min($lon, $west_b);
    push @$coords, [ $lon, $lat ];
  }
  $box->{POLY} = Polygon->new(@$coords);
  $box->{EAST} = $east_b;
  $box->{WEST} = $west_b;
  $box->{NORTH} = $north_b;
  $box->{SOUTH} = $south_b;

  return $box;
}

# returns a list of all products that should be polled for new events, etc.
sub product_list {
	my @products;
	
    undef $SC::errstr;
    eval {
		my $sth = SC->dbh->prepare(qq/
			select filename,
			  product_type
			  from product_type/);
		$sth->execute;
		while (my @p = $sth->fetchrow_array()) {
			push @products, @p;
		}
    };
    return @products;
}

# returns a list of all metrics that should be polled for new events, etc.
sub metric_list {
	my @metrics;
	
    undef $SC::errstr;
    eval {
		my $sth = SC->dbh->prepare(qq/
			select short_name
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

sub sc_grid {

my $evid = shift;
  my ($sv, $dbh, $sth, $ofile, $fh, $ev_status, $sm_status, $etype);
  my (%grdinfo, $file, $base, $lines, $val);
  my ($owd, $writer, $key, $product);
  my ($command, $result);
	my @grids = qw(
		PGA
		PGV
		MMI
		PSA03
		PSA10
		PSA30
	);

    my ($lon, $lat, @v);
    my (@min, @max);
    my ($lat_cell_count, $lon_cell_count);
    my ($lat_spacing, $lon_spacing);
    my (@cells, $cell_no);
    my ($lon_min, $lat_min, $lon_max, $lat_max);
    my $sth;
    my $rc;

    my $file = "$download_dir/$evid/grid.xyz.zip";
	require Archive::Zip;
	require Archive::Zip::MemberRead;
    my $zip = new Archive::Zip($file);
    my $fh  = new Archive::Zip::MemberRead($zip, "grid.xyz");
    my $header = $fh->getline();

	while (defined(my $line = $fh->getline())) {
            my @v;
            # row format: lon lat metric1 metric2 ...
            #SC->log(8, "Grid file line: $line");
	    ($lon, $lat, @v) = split ' ',$line;

            # compute min/max for each metric across the entire grid
            for (my $i = 0; $i < scalar @v; $i++) {
                $min[$i] = _min($min[$i], $v[$i]);
                $max[$i] = _max($max[$i], $v[$i]);
            }
            if ($cell_no == 0) {
                $lat_max = $lat;
                $lon_min = $lon;
            } elsif ($cell_no == 1) {
                $lon_spacing = $lon - $lon_min;
            } elsif ($lat_spacing == 0 and $lon == $lon_min) {
                # starting a new row
                $lat_spacing = $lat_max - $lat;
                $lon_cell_count = $cell_no;
            }
            $cells[$cell_no++] = \@v;
	}
	$lat_cell_count = scalar @cells / $lon_cell_count;
	$lat_min = $lat;
	$lon_max = $lon;

#        print "grid loaded, $lon_cell_count x $lat_cell_count [$lon_min/$lat_min, $lon_max/$lat_max]\n";
#        print "cols/deg: $cols_per_degree, rows/deg: $rows_per_degree\n";
#        print "x spacing: $lon_spacing, y spacing: $lat_spacing\n";
#            for (my $i = 0; $i < scalar @min; $i++) {
#			print "MinMax, $min[$i], $max[$i]\n";
#			}

	$file = "$download_dir/$evid/stationlist.xml";

	my $xml =  XMLin($file);
	my $version = int($xml->{'map_version'}) || 1;
	#print "version, $version\n";

	return (0) if (-d "$download_dir/$evid-$version");
	rename("$download_dir/$evid", "$download_dir/$evid-$version");
	#my $sc_data = "$download_dir/$evid";
	$sc_data = ($sc_id) ? "$download_dir/$sc_id-$version" : "$download_dir/$evid-$version";
	my $earthquake = $xml->{'earthquake'};
    $earthquake->{'created'} = _ts($earthquake->{'created'});
   
	$sc_id = ($sc_id) ? $sc_id : $earthquake->{'id'};
  #-----------------------------------------------------------------------
  # Generate event.xml:
  #
  # Open the event file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/event.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object; the "NEWLINES" implementation is a
  # disaster so we don't use it, and hence have to add our own all
  # over the place
  #----------------------------------------------------------------------
  $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

  my $ts = sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
			 $earthquake->{'year'}, $earthquake->{'month'}, $earthquake->{'day'},
			 $earthquake->{'hour'}, $earthquake->{'minute'}, $earthquake->{'second'},
			 $earthquake->{'timezone'});
  $writer->emptyTag("event",
		    "event_id"          => $sc_id,
		    "event_version"     => "1",
		    "event_status"      => 'NORMAL',
		    "event_type"        => $scenario ? 'SCENARIO' : 'ACTUAL',
		    "event_name"        => $earthquake->{'id'},
		    "event_location_description" => $earthquake->{'locstring'},
		    "event_timestamp"   => $ts,
		    "external_event_id" => $earthquake->{'id'},
		    "magnitude"         => $earthquake->{'mag'},
		    "lat"               => $earthquake->{'lat'},
		    "lon"               => $earthquake->{'lon'},
		    "depth"               => $earthquake->{'depth'},
		    "mag_type"         => $earthquake->{'mag_type'},
		    "event_region"               => $earthquake->{'event_region'},
		    "event_source_type"               => $earthquake->{'event_source_type'}
			);
  $writer->end();
  $fh->close;

  #-----------------------------------------------------------------------
  # Generate shakemap.xml:
  #
  # Open the shakemap file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/shakemap.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object;
  #----------------------------------------------------------------------
  $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);
  $writer->startTag("shakemap", 
		    "shakemap_id"          => $sc_id, 
		    "shakemap_version"     => $version, 
		    "event_id"             => $sc_id, 
		    "event_version"        => "1", 
		    "shakemap_status"      => 'RELEASED',
		    "generating_server"    => "1",
		    "shakemap_region"      => "",
		    "generation_timestamp" => $earthquake->{'created'},
		    "begin_timestamp"      => $earthquake->{'created'},
		    "end_timestamp"        => $earthquake->{'created'},
		    "lat_min"              => $lat_min,
		    "lat_max"              => $lat_max,
		    "lon_min"              => $lon_min,
		    "lon_max"              => $lon_max);
  $writer->characters("\n");
  for (my $i = 0; $i < scalar @min; $i++) {
    $writer->emptyTag("metric",
		      "metric_name" => $grids[$i],
		      "min_value"   => $min[$i],
		      "max_value"   => $max[$i]);
   $writer->characters("\n");
  }
  $writer->endTag("shakemap");
  $writer->end();
  $fh->close;

  #-----------------------------------------------------------------------
  # Loop over products
  #-----------------------------------------------------------------------
  my $pid = 1;
  my %products = product_list();
  foreach $product (keys %products) {
	my $filename = $product;
	$filename =~ s/%EVENT_ID%/$sc_id/;
    next if(not -e "$sc_data/$filename");
    $file = sprintf "p%02d.xml", $pid++;
    $ofile = "$sc_data/$file";
    $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";
  
    $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

    $writer->emptyTag("product",
		      "shakemap_id"          => $sc_id, 
		      "shakemap_version"     => $version, 
		      "product_type"         => $products{$product},
		      "product_status"       => 'RELEASED',
		      "generating_server"    => "1",
		      "generation_timestamp" => $earthquake->{'created'},
		      "lat_min"              => $lat_min,
		      "lat_max"              => $lat_max,
		      "lon_min"              => $lon_min,
		      "lon_max"              => $lon_max);
    $writer->end();
    $fh->close;
  }


return 0;
}


sub sc_xml {

my $evid = shift;
  my ($sv, $dbh, $sth, $ofile, $fh, $ev_status, $sm_status, $etype);
  my (%grdinfo, $file, $base, $lines, $val);
  my ($owd, $writer, $key, $product);
  my ($command, $result);
	my %grid_spec;
	my @grid_metric;
	my %shakemap_spec;
	my %event_spec;

	my $file = "$download_dir/$evid/grid.xml";
	my $info_file = "$download_dir/$evid/info.xml";
	
	use XML::LibXML::Simple;
	use Data::Dumper;
	my $info = XMLin($info_file) if (-e $info_file);
	my $parser = SC->sm_twig($file);;
	%event_spec = %{$parser->{'event'}};
	%grid_spec = %{$parser->{'grid_specification'}};
	%shakemap_spec = %{$parser->{'shakemap_grid'}};
		foreach my $metric (keys %{$parser->{grid_field}}) {
		$grid_metric[$parser->{grid_field}->{$metric}->{index}-1] = $metric;
	}
	#print join ':', keys %shakemap_spec;
	my $version = int($shakemap_spec{'shakemap_version'}) || 1;
	my $evt_network = ($event_spec{'event_network'}) ? lc($event_spec{'event_network'}) : lc($shakemap_spec{'shakemap_originator'});
	my $evt_id = ($event_spec{'event_id'}) ? lc($event_spec{'event_id'}) : lc($shakemap_spec{'shakemap_id'});
	$evt_id =~ s/^$evt_network//;
	$sc_data = ($sc_id) ? "$download_dir/$sc_id-$version" : 
			"$download_dir/$evt_network$evt_id-$version";
	return (0) if (-d $sc_data);
	rename("$download_dir/$evid", $sc_data);
	
	my $lon_spacing = $grid_spec{'nominal_lon_spacing'};
	my $lat_spacing = $grid_spec{'nominal_lat_spacing'};
	my $lon_cell_count = $grid_spec{'nlon'};
	my $lat_cell_count = $grid_spec{'nlat'};
	my $lat_min = $grid_spec{'lat_min'};
	my $lat_max = $grid_spec{'lat_max'};
	my $lon_min = $grid_spec{'lon_min'};
	my $lon_max = $grid_spec{'lon_max'};
	
	my (@max, @min);
	foreach my $line (split "\n", $parser->{grid_data}) {
        my ($lon, $lat, @gv) = split ' ', $line;
		for (my $i = 0; $i < scalar @gv; $i++) {
			$min[$i] = _min($min[$i], $gv[$i]);
			$max[$i] = _max($max[$i], $gv[$i]);
		}
	}

	my $remote_event = $evid;
	$event_spec{'event_timestamp'} = _ts($event_spec{'event_timestamp'});
	$shakemap_spec{'process_timestamp'} = _ts($shakemap_spec{'process_timestamp'});
	if ($shakemap_spec{'shakemap_originator'} eq 'us') {
	($remote_event) = $remote_event =~ /(.*)_/;
	} else {
	  while (length($remote_event) < 8) {
		$remote_event = '0' . $remote_event;
	  }
	}
	$remote_event = lc($evt_network).$remote_event;

	$sc_id = ($sc_id) ? $sc_id : $evt_network.$evt_id;
  #print "remote event, $remote_event\n";

  #-----------------------------------------------------------------------
  # Generate event.xml:
  #
  # Open the event file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/event.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object; the "NEWLINES" implementation is a
  # disaster so we don't use it, and hence have to add our own all
  # over the place
  #----------------------------------------------------------------------
  $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

  $writer->emptyTag("event",
		    "event_id"          => $sc_id,
		    "event_version"     => "1",
		    "event_status"      => $shakemap_spec{'map_status'},
		    "event_type"        => $scenario ? 'SCENARIO' : $shakemap_spec{'shakemap_event_type'},
		    "event_name"        => $shakemap_spec{'event_name'},
		    "event_location_description" => $event_spec{'event_description'},
		    "event_timestamp"   => "$event_spec{'event_timestamp'}",
		    "external_event_id" => "$shakemap_spec{'event_id'}",
		    "magnitude"         => $event_spec{'magnitude'},
		    "lat"               => $event_spec{'lat'},
		    "lon"               => $event_spec{'lon'},
		    "depth"               => $event_spec{'depth'},
		    "mag_type"         => $event_spec{'mag_type'},
		    "event_region"               => $evt_network,
		    "event_source_type"               => $event_spec{'event_source_type'}
			);
  $writer->end();
  $fh->close;

  #-----------------------------------------------------------------------
  # Generate shakemap.xml:
  #
  # Open the shakemap file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/shakemap.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object;
  #----------------------------------------------------------------------
	$writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);
	$writer->startTag("shakemap", 
		"shakemap_id"          => $sc_id, 
		"shakemap_version"     => $version, 
		"event_id"             => $sc_id, 
		"event_version"        => "1", 
		"shakemap_status"      => $shakemap_spec{'map_status'},
		"generating_server"    => "1",
		"shakemap_region"      => lc($shakemap_spec{'shakemap_originator'}),
		"generation_timestamp" => $shakemap_spec{'process_timestamp'},
		"begin_timestamp"      => $shakemap_spec{'process_timestamp'},
		"end_timestamp"        => $shakemap_spec{'process_timestamp'},
		"lat_min"              => $lat_min,
		"lat_max"              => $lat_max,
		"lon_min"              => $lon_min,
		"lon_max"              => $lon_max);
	$writer->characters("\n");
	for (my $i = 0; $i < scalar @min; $i++) {
		next unless grep { /$grid_metric[$i+2]/ } @grids;
		print $grid_metric[$i+2],"(min-max): $min[$i] - $max[$i]\n";
		$writer->emptyTag("metric",
				  "metric_name" => $grid_metric[$i+2],
				  "min_value"   => $min[$i],
				  "max_value"   => $max[$i]);
		$writer->characters("\n");
	}
	$writer->endTag("shakemap");
	$writer->end();
	$fh->close;

  #-----------------------------------------------------------------------
  # Loop over products
  #-----------------------------------------------------------------------
  my $pid = 1;
  my %products = product_list();
  foreach $product (keys %products) {
	my $filename = $product;
	$filename =~ s/%EVENT_ID%/$sc_id/;
    next if(not -e "$sc_data/$filename");
    $file = sprintf "p%02d.xml", $pid++;
    $ofile = "$sc_data/$file";
    $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";
  
    $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

    $writer->emptyTag("product",
		      "shakemap_id"          => $sc_id, 
		      "shakemap_version"     => $version, 
		      "product_type"         => $products{$product},
		      "product_status"       => $shakemap_spec{'map_status'},
		      "generating_server"    => "1",
		      "generation_timestamp" => $shakemap_spec{'process_timestamp'},
		      "lat_min"              => $lat_min,
		      "lat_max"              => $lat_max,
		      "lon_min"              => $lon_min,
		      "lon_max"              => $lon_max);
    $writer->end();
    $fh->close;
  }

return 0;
}

sub _ts {
	my ($ts) = @_;
	if ($ts =~ /[\:\-]/) {
		$ts =~ s/[a-zA-Z]/ /g;
		$ts =~ s/\s+$//g;
		$ts = SC->time_to_ts(SC->ts_to_time($ts));
	} else {
		$ts = SC->time_to_ts($ts);
	}
	return ($ts);
}


#######################################################################
# End configuration subroutines
#######################################################################

my $fref;
my ($bn, $flag, $type, $flag_desc, $pdoc);
sub setOptions {
  my $fref     = shift;
  my $dbug  = shift;
  my @names = ();

  foreach my $ff ( @$fref ) {
    (defined $ff->{FLAG} and $ff->{FLAG} !~ /^$/) or next;
    my $str = $ff->{FLAG};
    #----------------------------------------------------------------------
    # Is there an argument?
    #----------------------------------------------------------------------
    if ((defined $ff->{ARG}  and $ff->{ARG}  !~ /^$/)
     or (defined $ff->{TYPE} and $ff->{TYPE} !~ /^$/)
     or (defined $ff->{REQ}  and $ff->{REQ}  !~ /^$/)) {
      #----------------------------------------------------------------------
      # Yes, there's an argument of some kind; is it 
      # manditory or optional?
      #----------------------------------------------------------------------
      $str .= (defined $ff->{REQ} and $ff->{REQ} =~ /y/) ? '=' : ':';
      #----------------------------------------------------------------------
      # What is the expected type of the argument; default to 's'
      #----------------------------------------------------------------------
      my $type = (defined $ff->{TYPE} and $ff->{TYPE} !~ /^$/) 
               ? $ff->{TYPE} : 's';
      $str .= $type;
      #----------------------------------------------------------------------
      # If the type of argument is '!', then set $str directly
      #----------------------------------------------------------------------
      if ($type eq '!') {
	$str = $ff->{FLAG} . $type;
      }
      #----------------------------------------------------------------------
      # If ARG is undefined or empty, fix it up for the documentation
      #----------------------------------------------------------------------
      if (!defined $ff->{ARG} or $ff->{ARG} =~ /^$/) {
	$ff->{ARG} = $type =~ /s/ ? 'string'
		   : $type =~ /i/ ? 'integer'
		   : $type =~ /f/ ? 'float'
		   : $type =~ /!/ ? ''
		   : '???';
	if (defined $ff->{REQ}  and $ff->{REQ}  !~ /y/) {
	  $ff->{ARG} = '[' . $ff->{ARG} . ']';
	}
      }
    }
    print "OPTION LINE: $str\n" if (defined $dbug and $dbug != 0);
    push @names, $str;
  }

  my $options = {};

  if (@names) {
    GetOptions($options, @names) or logscr "Error in GetOptions";
  }

  if (defined $dbug and $dbug != 0) {
    foreach my $key ( keys %$options ) {
      print "option: $key value: $options->{$key}\n";
    }
  }
  return $options;
}

sub printDoc {

  $pdoc = shift;
  $bn   = basename($0);

  $~ = "PROGINFO";
  write;

  if (@$flgs) {
    $~ = "OPTINFO";
  } else {
    $~ = "NOOPTINFO";
  }
  write;

  $~ = "FLAGINFO";
  foreach my $ff ( @$flgs ) {
    (defined $ff->{FLAG} and $ff->{FLAG} !~ /^$/) or next;
    $flag      = $ff->{FLAG};
    $type      = defined $ff->{ARG}  ? $ff->{ARG}  : '';
    $flag_desc = defined $ff->{DESC} ? $ff->{DESC} : '';
    write;
  }
  $~ = "ENDINFO";
  write;
  0;
}

#######################################################################
# Self-documentation formats; we use the '#' character as the first 
# character (which is a royal pain to do) so that the documentation 
# can be included in a shell file
#######################################################################

format PROGINFO =
@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
'################################################################################'
@ Program     : @<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
'#',	 $bn
^ Description : ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($pdoc),	      $pdoc
^ ~~            ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($pdoc),	      $pdoc
@ Options     :
'#'
.

format OPTINFO =
@     Flag       Arg       Description
'#'
.

format NOOPTINFO =
@     NONE
'#'
.

format FLAGINFO =
@     ---------- --------- -----------------------------------------------------
'#'
^    -@<<<<<<<<< @<<<<<<<< ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($flag_desc), $flag, $type, $flag_desc
^ ~~                       ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($flag_desc),	   $flag_desc
.

format ENDINFO =
@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
'################################################################################'
.

sub rhsh {

  my $more = shift;
  return '#' if ($more ne '');
  return '';
}


############################################################################
# Logs a message with to the screen
############################################################################
sub logscr { 

  print STDOUT "$0 $$: @_ on ", mydate(), "\n";
  return;
}

sub mydate {

  my ($sec, $min, $hr, $day, $mon, $yr) = localtime();
  return sprintf('%02d/%02d/%4d %02d:%02d:%02d', 
		  $mon + 1, $day, $yr + 1900, $hr, $min, $sec);
}



