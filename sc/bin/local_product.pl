#!/usr/local/bin/perl

# $Id: local_product.pl 156 2007-10-10 16:27:10Z klin $

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
#use warnings;

use Data::Dumper;
use IO::File;
use Config::General;
use Time::Local;
use XML::LibXML::Simple;
use XML::Writer;
use XML::Parser;
use Template;
use HTML::Entities;


use Getopt::Long;
use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;

sub epr;
sub vpr;
sub vvpr;

my %options;
GetOptions(\%options,
    'conf=s',	# specifies alternate config file (sc.conf is default)
    'verbose'   => 0,
);

SC->initialize();
my $config = SC->config;
my $dbh;

my $perl = $config->{perlbin};

#my $config = SC->config->{'Logrotate'};

# locations
my ($shakemap_xml, $event_xml, $grid_metric, $grid_spec);

##### Scan Definitions #####

my %SQL = 
    ( GET_TIMESTAMP => { SQL => <<__SQL__ },
    select receive_timestamp
      from shakemap
     where event_id = ? and shakemap_version = ?
__SQL__
);
		
my $evid = $ARGV[0];
my $version = $ARGV[1];
initialize_sql();
local_product($evid, $version);
vpr($evid);
print "process product STATUS=SUCCESS\n";

exit();


sub vpr {
    if ($options{'verbose'} >= 1) {
        print @_, "\n";
    }
}

sub vvpr {
    if ($options{'verbose'} >= 2) {
        print @_, "\n";
    }
}

sub epr {
    print STDERR @_, "\n";
}

sub local_product {
    my ($shakemap_id, $shakemap_version) = @_;

	my $sth_lookup_shakemap_metric = SC->dbh->prepare(qq{
    select metric, value_column_number
      from shakemap_metric
     where shakemap_id = ? and shakemap_version = ?
	  and value_column_number IS NOT NULL});

	my $temp_dir = $config->{'TemplateDir'} . '/xml';
    return -1 unless (-d $temp_dir);

	my $timestamp = get_timestamp($shakemap_id, $shakemap_version);
	$timestamp =~ s/\s+/T/;
	$timestamp =~ s/\s*$/Z/;
	my ($data_dir, $grid_file, $shakemap_file, $event_file);
	
	if ($shakemap_id =~ /_scte$/) {
		my $test_data_dir = $config->{'RootDir'}."/test_data/$shakemap_id";
		$data_dir = $config->{'DataRoot'}."/$shakemap_id-$shakemap_version";
		$grid_file = $data_dir."/grid.xml";
		$shakemap_file = $test_data_dir."/shakemap_template.xml";
		$event_file = $test_data_dir."/event_template.xml";
	} else {
		$data_dir = $config->{'DataRoot'}."/$shakemap_id-$shakemap_version";
		$grid_file = $data_dir."/grid.xml";
		$shakemap_file = $data_dir."/shakemap.xml";
		$event_file = $data_dir."/event.xml";
	}	

	if (! -e $shakemap_file) {
		vvpr "ShakeCast not processed for event $shakemap_id";
		return -1;
	}
	
	my $xsl = XML::LibXML::Simple->new();
	$shakemap_xml = $xsl->XMLin($shakemap_file);
	$event_xml = $xsl->XMLin($event_file);
	if (-e $grid_file) {
		my $parser = new XML::Parser;
		$parser->setHandlers(      Start => \&startElement,
												 End => \&endElement,
												 Char => \&characterData,
												 Default => \&default);
		$parser->parsefile($grid_file);
		#$grid_xml = $xsl->XMLin($grid_file);
		#$shakemap_xml->{'shakemap_originator'} = 'sc' if ($shakemap_xml->{'shakemap_originator'} eq 'ci');
		#$shakemap_xml->{'shakemap_originator'} = 'global' if ($shakemap_xml->{'shakemap_originator'} eq 'us');
	}

	$shakemap_xml =	lookup_shakemap($shakemap_id, $shakemap_version);
	if (-e "$data_dir/gs_url.txt") {
		open(FH, "< $data_dir/gs_url.txt") or die "Couldn't open file";
		$shakemap_xml->{'gs_url'} = <FH>;
		close(FH);	
	} else {
		$shakemap_xml->{'gs_url'} = parse_gs_url($shakemap_id);
	}
	my $tt = Template->new(INCLUDE_PATH => $config->{'TemplateDir'}."/xml/", OUTPUT_PATH => $data_dir);
	my $shakecast = {};
	$shakecast->{'code_version'} = "ShakeCast 1.0";
	$shakecast->{'process_timestamp'} = $timestamp;

	my (@exposure, @items, %exposure, %metrics);
	$sth_lookup_shakemap_metric->execute($shakemap_id, $shakemap_version);
	my $sql_metric;
	while (my @row = $sth_lookup_shakemap_metric->fetchrow_array) {
		$sql_metric .= ', fs.value_'.$row[1].' as '.uc($row[0]);
		$metrics{uc($row[0])} = $row[1];
		
	}

    foreach my $metric_unit (keys %metrics) {
	my $sql = "select ff.damage_level, f.facility_id, f.facility_type, 
		f.external_facility_id, f.facility_name, f.short_name,
		f.description, f.lat_min, f.lon_min,
		ffea.geom_type, ffea.geom, ffea.description as html_desc,
		fs.value_".$metrics{$metric_unit}." as grid_value,
		ff.metric,
       dl.damage_level,
       dl.name AS damage_level_name,
       dl.is_max_severity,
       dl.severity_rank,
		ff.low_limit, ff.high_limit, fs.dist
		$sql_metric
      from (((((((facility f 
		left join facility_feature ffea on f.facility_id = ffea.facility_id)
	  inner join facility_shaking fs on f.facility_id = fs.facility_id)
	  inner join grid g on g.grid_id = fs.grid_id)
	  inner join shakemap s on g.shakemap_id = s.shakemap_id
		and g.shakemap_version = s.shakemap_version)
	  inner join event e on e.event_id = s.event_id)
	  inner join facility_fragility ff on fs.facility_id = ff.facility_id and 
			ff.metric = '".$metric_unit."' and
			fs.value_".$metrics{$metric_unit}." between ff.low_limit and ff.high_limit)
		inner join damage_level dl on dl.damage_level = ff.damage_level)
     where s.event_id = '$shakemap_id' and g.shakemap_version = $shakemap_version";
	my $sth = SC->dbh->prepare($sql);
	 
    $sth->execute() || vvpr "couldn't execute sql $metric_unit\n";
	while (my $item =  $sth->fetchrow_hashref('NAME_lc')) {
		lookup_facility_attributes($item, $item->{'facility_id'});
		push @{$exposure{$item->{'facility_type'}}}, $item;
	}
	}
	foreach my $type (keys %exposure) {
		my %exposures;
		$exposures{'type'} = $type;
		$exposures{'item'} = $exposure{$type};
		push @{$shakecast->{'exposure'}},  \%exposures;
	}
	

    opendir TEMPDIR, $temp_dir or return (-1);
    # exclude .* files
    my @files = grep !/^\./, readdir TEMPDIR;
    # exclude non-directories
	#my $prog = $config->{'RootDir'} . '/bin/template.pl -event '. $shakemap_id;
	my $n = 0;
	my $rc;
    foreach my $file (@files) {
        if ($file =~ m#([^/\\]+)\.tt$#) {     # last component only
			my $temp_file = $1.".tt";
			my $output_file = $1;
			$output_file =~ s/_/\./;
			$rc = $tt->process($temp_file, { shakemap => $shakemap_xml, grid_metric => $grid_metric, 
				shakecast => $shakecast, grid_spec => $grid_spec, event => $event_xml }, $output_file);
			if ($rc == 1) {
				# success
				$rc = 1;
				$n++;
				sm_inject($shakemap_id, $shakemap_version, $output_file, $n);
			} elsif ($rc & 0xff) {
				# permanent failure if script signalled
				$rc = -1;
			} else {
				# temporary failure if script returned non-zero
				$rc = 0;
			}
		}
    }
	
	vvpr "total $n local product generated.";

    return $rc;
}

# returns a list of all products that should be polled for new events, etc.
sub sm_inject {
	my ($evid, $version, $product, $n) = @_;
	
    undef $SC::errstr;
	my $sc_dir = $config->{'RootDir'};
    eval {
		use IO::File;
		use XML::Writer;
		my $sth = SC->dbh->prepare(qq/
			select product_type, filename
			  from product_type
			  where filename = ?/);
		$sth->execute($product);
		if (my @p = $sth->fetchrow_array()) {
		
			my $ofile = "$sc_dir/data/$evid-$version/lp$n.xml";
			print "$ofile\n";
			my $fh;
			unless ($fh = new IO::File "> $ofile") {
				SC->log(0, "Can't write <$product>: $!");
				exit -1;
			}

			my $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

			$writer->emptyTag("product",
					  "shakemap_id"          => $evid, 
					  "shakemap_version"     => $version, 
					  "product_type"         => $p[0],
					  "product_status"       => $shakemap_xml->{'map_status'},
					  "generating_server"    => "1",
					  "generation_timestamp" => _ts($shakemap_xml->{'process_timestamp'}),
					  "lat_min"              => $grid_spec->{'lat_min'},
					  "lat_max"              => $grid_spec->{'lat_max'},
					  "lon_min"              => $grid_spec->{'lon_min'},
					  "lon_max"              => $grid_spec->{'lon_max'});
			$writer->end();
			$fh->close;

			my $command = "$perl $sc_dir/bin/sm_inject.pl "
			   . "--verbose --conf $sc_dir/conf/sc.conf "
				 . "$ofile";
				 print "$command\n";
			my $result = `$command`;
			SC->log(0,  "Error in sm_new_product ($product): '$result'") 
					if ($result !~ /STATUS=SUCCESS/);

		}
		
   };
    return 1;

}

#
# Return grid_id given event_id and version
#
sub lookup_facility_attributes {
    my ($facility_item, $facility_id) = @_;
	
    my $sql = "select attribute_name, attribute_value
      from facility_attribute
     where facility_id = $facility_id";
	my $sth = SC->dbh->prepare($sql);
	 
    $sth->execute() || return 0;
	while (my $href = $sth->fetchrow_hashref) {
		$facility_item->{"$href->{attribute_name}"} = "$href->{attribute_value}";
    }
}

#
# Return grid_id given event_id and version
#
sub lookup_shakemap {
    my ($shakemap_id, $shakemap_version) = @_;
	
    my $sql = "select 
		s.shakemap_id, s.shakemap_version, s.shakemap_region, s.generation_timestamp,
		s.lat_min, s.lat_max, s.lon_min, s.lon_max,
       e.event_id,
       e.event_version,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon
	  from shakemap s 
	  inner join event e on e.event_id = s.event_id
     where s.event_id = ? and s.shakemap_version = ?";
	my $sth = SC->dbh->prepare($sql);
	 
    if ($sth->execute($shakemap_id, $shakemap_version)) {
		$shakemap_xml = $sth->fetchrow_hashref;
    }

	return $shakemap_xml;
}

sub parse_gs_url {
    my ($shakemap_id) = @_;
	
	my $gs_url;

	use JSON -support_by_pp;
	my $evt_mirror = $config->{'DataRoot'}."/eq_product/$shakemap_id/event.json";
	open (FH, "< $evt_mirror") or return 0;
	my @contents = <FH>;
	close (FH);
	my $content = join '', @contents;

	eval{
    my $json = new JSON;
 
    # these are some nice json options to relax restrictions a bit:
    my $json_text = $json->allow_nonref->utf8->relaxed->escape_slash->loose->allow_singlequote->allow_barekey->decode($content);
 
	my $product = $json_text->{properties}->{products}->{shakemap}->[0];

	if ($product) {
		my ($mirror, $shakemap) = each( %{$product->{'contents'}});
			$gs_url = $shakemap->{'url'};
			$gs_url =~ s/$mirror$//;
    }
	};

	return $gs_url;
}

sub initialize_sql {
    $dbh = SC->dbh;
    # dwb 2003-07-29 took this out because the DBI version we've been
    # using doesn't support it.
    #$dbh->{FetchHashKeyName} = 'NAME_uc';
    foreach my $k (keys %SQL) {
	$SQL{$k}->{STH} = $dbh->prepare($SQL{$k}->{SQL});
    }
	#$dbh->trace(1,'trace.log');
}


sub get_timestamp {
    my ($shakemap_id, $shakemap_version) = @_;
    my $sth = $SQL{GET_TIMESTAMP}->{STH};
    $sth->execute($shakemap_id, $shakemap_version);
    my $p = $sth->fetchrow_arrayref;
    $sth->finish;
    return $p ? $p->[0] : undef;
}

my ($count, $tag);
sub startElement {

      my( $parseinst, $element, %attrs ) = @_;
        SWITCH: {
                if ($element eq "shakemap_grid") {
                        $count++;
                        $tag = "shakemap_grid";
                        #print "shakemap_grid $count:\n";
						foreach my $key (keys %attrs) {
							$shakemap_xml->{$key} = $attrs{$key};
							#print $key,": ", $shakemap_xml->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "event") {
                        $count++;
                        $tag = "event";
                        #print "event $count:\n";
						foreach my $key (keys %attrs) {
							$event_xml->{$key} = $attrs{$key};
							#print $key,": ", $event_xml->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_specification") {
                        $count++;
                        $tag = "grid_specification";
                        #print "grid_specification $count:\n";
						foreach my $key (keys %attrs) {
							$grid_spec->{$key} = $attrs{$key};
							#print $key,": ", $grid_spec->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_field") {
                        #print "grid_field: $count:\n";
                        $tag = "grid_field";
						$grid_metric->{$attrs{'name'}} = $attrs{'index'};
						#print $attrs{'index'},": ", $attrs{'name'}, "\n";
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
	
	#print "$time_str\n";
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
