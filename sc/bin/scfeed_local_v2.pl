#!PERL_EXE


# $Id: scfeed_local.pl 526 2008-11-14 17:05:27Z guest $

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

my $perl = 'PERL.EXE';

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
my ($scenario, $forcerun, $cancel, $test);
my $scenario = defined $options->{'scenario'} ? 1 : 0;

$scenario = 1 if $evid =~ /_se$/i;

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

  #-----------------------------------------------------------------------
  # Send the event message
  #-----------------------------------------------------------------------
  $command = "$perl C:/ShakeCast/sc/bin/sm_inject.pl "
	   . "--verbose --conf C:/ShakeCast/sc/conf/sc.conf "
	   . "$sc_data/event.xml";
  print "Running: '$command'\n" if $verbose;
  $result = `$command`;
  logscr "Error in sm_new_event: '$result'" if ($result !~ /STATUS=SUCCESS/);
  print "Result: '$result'\n" if $verbose;

  #-----------------------------------------------------------------------
  # Send the shakemap message
  #-----------------------------------------------------------------------
  $command = "$perl C:/ShakeCast/sc/bin/sm_inject.pl "
	   . "--verbose --conf C:/ShakeCast/sc/conf/sc.conf "
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
		$command = "$perl C:/ShakeCast/sc/bin/sm_inject.pl "
		   . "--verbose --conf C:/ShakeCast/sc/conf/sc.conf "
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

    my $file = "$download_dir/$evid/grid.xyz";
	#require Archive::Zip;
	#require Archive::Zip::MemberRead;
    #my $zip = new Archive::Zip($file);
    #my $fh  = new Archive::Zip::MemberRead($zip, "grid.xyz");
    my $fh  = new IO::File($file);
    #my $header = $fh->getline();
    my $header = <$fh>;

	while (defined(my $line = <$fh>)) {
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
	$fh->close;
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
	$sc_data = "$download_dir/$evid-$version";
	my $earthquake = $xml->{'earthquake'};
    $earthquake->{'created'} = _ts($earthquake->{'created'});
   
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
		    "event_id"          => $earthquake->{'id'},
		    "event_version"     => $version,
		    "event_status"      => 'NORMAL',
		    "event_type"        => $scenario ? 'SCENARIO' : 'ACTUAL',
		    "event_name"        => $earthquake->{'id'},
		    "event_location_description" => $earthquake->{'locstring'},
		    "event_timestamp"   => $ts,
		    "external_event_id" => $earthquake->{'id'},
		    "magnitude"         => $earthquake->{'mag'},
		    "lat"               => $earthquake->{'lat'},
		    "lon"               => $earthquake->{'lon'});
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
		    "shakemap_id"          => $earthquake->{'id'}, 
		    "shakemap_version"     => $version, 
		    "event_id"             => $earthquake->{'id'}, 
		    "event_version"        => $version, 
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
	$filename =~ s/%EVENT_ID%/$earthquake->{'id'}/;
    next if(not -e "$sc_data/$filename");
    $file = sprintf "p%02d.xml", $pid++;
    $ofile = "$sc_data/$file";
    $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";
  
    $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

    $writer->emptyTag("product",
		      "shakemap_id"          => $earthquake->{'id'}, 
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

my $count = 0;
my $tag = "";
my %grid_spec;
my @grid_metric;
my %shakemap_spec;
my %event_spec;

sub sc_xml {

my $evid = shift;
  my ($sv, $dbh, $sth, $ofile, $fh, $ev_status, $sm_status, $etype);
  my (%grdinfo, $file, $base, $lines, $val);
  my ($owd, $writer, $key, $product);
  my ($command, $result);

	my $file = "$download_dir/$evid/grid.xml";
	
	my $parser = new XML::Parser;
	$parser->setHandlers(      Start => \&startElement,
											 End => \&endElement,
											 Char => \&characterData,
											 Default => \&default);
	$parser->parsefile($file);

	my $version = int($shakemap_spec{'shakemap_version'}) || 1;
	return (0) if (-d "$download_dir/$evid-$version");
	rename("$download_dir/$evid", "$download_dir/$evid-$version");
	$sc_data = "$download_dir/$evid-$version";
	
	my $lon_spacing = $grid_spec{'nominal_lon_spacing'};
	my $lat_spacing = $grid_spec{'nominal_lat_spacing'};
	my $lon_cell_count = $grid_spec{'nlon'};
	my $lat_cell_count = $grid_spec{'nlat'};
	my $lat_min = $grid_spec{'lat_min'};
	my $lat_max = $grid_spec{'lat_max'};
	my $lon_min = $grid_spec{'lon_min'};
	my $lon_max = $grid_spec{'lon_max'};
	
	my (@max, @min);
	open (FH, "< $sc_data/grid.xml") || die "couldn't parse grid data $!";
	my $line;
	do {
		$line = <FH>;
	} until ($line =~ /^<grid_data>/);
	while ($line = <FH>) {
		$line =~ s/\n|\t//g;
        my ($lon, $lat, @gv) = split ' ', $line;
		for (my $i = 0; $i < scalar @gv; $i++) {
			$min[$i] = _min($min[$i], $gv[$i]);
			$max[$i] = _max($max[$i], $gv[$i]);
		}
	}
	close(FH);

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
	$remote_event = $shakemap_spec{'shakemap_originator'}.$remote_event;
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
		    "event_id"          => $shakemap_spec{'event_id'},
		    "event_version"     => $version,
		    "event_status"      => $shakemap_spec{'map_status'},
		    "event_type"        => $scenario ? 'SCENARIO' : $shakemap_spec{'shakemap_event_type'},
		    "event_name"        => $shakemap_spec{'event_name'},
		    "event_location_description" => $event_spec{'event_description'},
		    "event_timestamp"   => "$event_spec{'event_timestamp'}",
		    "external_event_id" => "$shakemap_spec{'event_id'}",
		    "magnitude"         => $event_spec{'magnitude'},
		    "lat"               => $event_spec{'lat'},
		    "lon"               => $event_spec{'lon'});
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
		"shakemap_id"          => $shakemap_spec{'shakemap_id'}, 
		"shakemap_version"     => $version, 
		"event_id"             => $shakemap_spec{'event_id'}, 
		"event_version"        => $shakemap_spec{'shakemap_version'}, 
		"shakemap_status"      => $shakemap_spec{'map_status'},
		"generating_server"    => "1",
		"shakemap_region"      => $shakemap_spec{'shakemap_originator'},
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
	$filename =~ s/%EVENT_ID%/$shakemap_spec{'shakemap_id'}/;
    next if(not -e "$sc_data/$filename");
    $file = sprintf "p%02d.xml", $pid++;
    $ofile = "$sc_data/$file";
    $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";
  
    $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

    $writer->emptyTag("product",
		      "shakemap_id"          => $shakemap_spec{'shakemap_id'}, 
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

sub startElement {

      my( $parseinst, $element, %attrs ) = @_;
        SWITCH: {
                if ($element eq "shakemap_grid") {
                        $count++;
                        $tag = "shakemap_grid";
                        print "shakemap_grid $count:\n";
						foreach my $key (keys %attrs) {
							$shakemap_spec{$key} = $attrs{$key};
							print $key,": ", $shakemap_spec{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "event") {
                        $count++;
                        $tag = "event";
                        print "event $count:\n";
						foreach my $key (keys %attrs) {
							$event_spec{$key} = $attrs{$key};
							print $key,": ", $event_spec{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_specification") {
                        $count++;
                        $tag = "grid_specification";
                        print "grid_specification $count:\n";
						foreach my $key (keys %attrs) {
							$grid_spec{$key} = $attrs{$key};
							print $key,": ", $grid_spec{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_field") {
                        print "grid_field: $count:\n";
                        $tag = "grid_field";
						$grid_metric[$attrs{'index'}-1] = $attrs{'name'};
						print $attrs{'index'},": ", $attrs{'name'}, "\n";
						last SWITCH;
                }
                if ($element eq "grid_data") {
                        #print "grid_data: ";
                        $tag = "grid_data";
                        last SWITCH;
                }
        }

 }

sub endElement {

      my( $parseinst, $element ) = @_;

 }

sub characterData {

      my( $parseinst, $data ) = @_;

 }

sub default {

      my( $parseinst, $data ) = @_;
        # do nothing, but stay quiet

 }
 
sub _ts {
	my ($ts) = @_;
	if ($ts =~ /[\:\-]/) {
		$ts =~ s/[a-zA-Z]/ /g;
		$ts =~ s/\s+$//g;
		$ts = time_to_ts(ts_to_time($ts));
	} else {
		$ts = time_to_ts($ts);
	}
	return ($ts);
}

sub time_to_ts {
    my $time = (@_ ? shift : time);
    my ($sec, $min, $hr, $mday, $mon, $yr);
    if (SC->config->{board_timezone} > 0) {
		($sec, $min, $hr, $mday, $mon, $yr) = localtime $time;
	} else {
		($sec, $min, $hr, $mday, $mon, $yr) = gmtime $time;
	}
    sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
	     $yr+1900, $mon+1, $mday,
	     $hr, $min, $sec);
}

sub ts_to_time {
    my ($time_str) = @_;
	
	use Time::Local;
	my %months = ('jan' => 0, 'feb' =>1, 'mar' => 2, 'apr' => 3, 'may' => 4, 'jun' => 5,
		'jul' => 6, 'aug' => 7, 'sep' => 8, 'oct' => 9, 'nov' => 10, 'dec' => 11);
	my ($mday, $mon, $yr, $hr, $min, $sec);
	my $timegm;
	
	print "$time_str\n";
	if ($time_str =~ /[a-zA-Z]+/) {
		# <pubDate>Tue, 04 Mar 2008 20:57:43 +0000</pubDate>
		($mday, $mon, $yr, $hr, $min, $sec) = $time_str 
			=~ /(\d+)\s+(\w+)\s+(\d+)\s+(\d+)\:(\d+)\:(\d+)\s+/;
		$timegm = timegm($sec, $min, $hr, $mday, $months{lc($mon)}, $yr-1900);
	} else {
		#2008-10-04 20:57:43
		($yr, $mon, $mday, $hr, $min, $sec) = $time_str 
			=~ /(\d+)\-(\d+)\-(\d+)\s+(\d+)\:(\d+)\:(\d+)/;
	   
		$timegm = timegm($sec, $min, $hr, $mday, $mon-1, $yr-1900);
	}
    
	return ($timegm);
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



