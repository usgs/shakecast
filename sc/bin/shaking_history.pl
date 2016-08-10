#!/usr/local/bin/perl

# $Id: template.pl 476 2008-09-05 20:42:47Z klin $

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
use warnings;

use FindBin;
use lib "$FindBin::Bin/../lib";

use XML::Simple;
use Getopt::Long;
use Data::Dumper;
use XML::Writer;
use XML::Parser;
use Template;
use HTML::Entities;

use SC;

SC->initialize;
my $config = SC->config;

my %options = (
    'event'    => 0,
    'version'   => 0,
    'help'      => 0,
);

GetOptions(
    \%options,

    'event=s',           
    'version=n',        
    
    'template=s',           
    'output=s',           
    'help',             # print help and exit

) or usage(1);

#usage(1) if length $options{'event'} <= 1;
#usage(1) if length $options{'template'} <= 1;
usage(1) if $options{'help'} == 1;
my $event = $options{'event'};
my $template_name = $options{'template'};
my $version = $options{'version'} || 0;
my $output_file;
if ($template_name =~ m#([^/\\]+)\.tt$#) {     # last component only
	my $temp_file = $1.".tt";
	$output_file = $1;
	$output_file =~ s/_/\./;
} else {
	$output_file = 'exposure.xml';
}
$output_file = $options{'output'} if $options{'output'};

my $sth_lookup_shakemap;
my $sth_lookup_shakemap_metric;
my $sth_lookup_shakemap_version;
my $sth_lookup_shakemap_timestamp;
my $sth_lookup_grid;
my $sth_lookup_facility_shaking;

$sth_lookup_shakemap = SC->dbh->prepare(qq{
    SELECT distinct s.shakemap_id, s.shakemap_version 
	  FROM shakemap s, event e 
	  WHERE s.event_id=e.event_id and s.event_version = e.event_version 
	    and e.event_type = "actual" order by s.shakemap_version desc});

$sth_lookup_shakemap_version = SC->dbh->prepare(qq{
    select shakemap_version
      from shakemap
     where event_id = ? order by shakemap_version desc});

$sth_lookup_shakemap_timestamp = SC->dbh->prepare(qq{
    select receive_timestamp
      from shakemap
     where event_id = ? and shakemap_version = ?});

$sth_lookup_grid = SC->dbh->prepare(qq{
    select g.grid_id
      from (grid g
	  inner join shakemap s on g.shakemap_id = s.shakemap_id
		and g.shakemap_version = s.shakemap_version)
     where s.event_id = ? and g.shakemap_version = ?});

$sth_lookup_shakemap_metric = SC->dbh->prepare(qq{
    select metric, value_column_number
      from shakemap_metric
     where shakemap_id = ? and shakemap_version = ?});


$sth_lookup_facility_shaking = SC->dbh->prepare(qq{
    select f.facility_type, 
		f.facility_name, 
		f.lat_min, 
		f.lon_min
		?
      from (((facility f 
	  inner join facility_shaking fs on f.facility_id = fs.facility_id)
	  inner join grid g on g.grid_id = fs.grid_id)
	  inner join shakemap s on g.shakemap_id = s.shakemap_id
		and g.shakemap_version = s.shakemap_version)
     where s.event_id = ? and g.shakemap_version = ?});

my $shakemap;
my $shakemap_list = lookup_shakemap();
my $db_dir = $config->{'RootDir'}."/db";
open (FH, "> $db_dir/$output_file") or die "couldn't open file $output_file";

my ($grid_spec, $grid_metric, $shakemap_xml, $event_xml);

exit unless ($shakemap_list);

print scalar @$shakemap_list;

foreach my $shakemap_id (@$shakemap_list) {
  print $shakemap_id->{shakemap_id}, '-', $shakemap_id->{shakemap_version}, "\n";
  $event = $shakemap_id->{shakemap_id};
  $version = $shakemap_id->{shakemap_version};

#$shakemap = lookup_facility_shaking($event, $version);
my $timestamp = lookup_shakemap_timestamp($event, $version);
$timestamp =~ s/\s+/T/;
$timestamp =~ s/\s*$/Z/;

#
# Check if any valid ShakeCast outputs
#
my ($data_dir, $grid_file, $shakemap_file, $event_file);

$data_dir = $config->{'DataRoot'}."/$event-$version";
$grid_file = $data_dir."/grid.xml";
$shakemap_file = $data_dir."/shakemap.xml";
$event_file = $data_dir."/event.xml";

#die "ShakeCast not processed for event $event"
#	unless (-e $shakemap_file);
#die "ShakeCast not processed for event $event"
next unless ( -e $shakemap_file);
	
my $xsl = XML::Simple->new();
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
	$shakemap_xml->{'shakemap_originator'} = 'sc' if ($shakemap_xml->{'shakemap_originator'} eq 'ci');
	$shakemap_xml->{'shakemap_originator'} = 'global' if ($shakemap_xml->{'shakemap_originator'} eq 'us');
}

my $tt = Template->new(INCLUDE_PATH => $db_dir, OUTPUT_PATH => $db_dir);
my $shakecast = {};
$shakecast->{'code_version'} = "ShakeCast 1.0";
$shakecast->{'process_timestamp'} = $timestamp;
#my $lookup_shakemap = 'lookup_shakemap1';
#print "sub exists\n" if defined (&$lookup_shakemap);

#----------------------------------------------------------------------
# Creae the XML::Writer object;
#----------------------------------------------------------------------
my (@exposure, @items, %exposure, %metrics);
#eval {
	$sth_lookup_shakemap_metric->execute($event, $version);
	my $sql_metric;
	while (my @row = $sth_lookup_shakemap_metric->fetchrow_array) {
		$sql_metric .= ', fs.value_'.$row[1].' as '.uc($row[0]);
		$metrics{uc($row[0])} = $row[1];
		
	}

    foreach my $metric_unit (keys %metrics) {
	my $sql = "select ff.damage_level, f.facility_id, f.facility_type, 
		f.external_facility_id, f.facility_name, f.short_name,
		f.description, f.lat_min, f.lon_min,
		ff.low_limit, ff.high_limit
		$sql_metric
      from ((((facility f 
	  inner join facility_shaking fs on f.facility_id = fs.facility_id)
	  inner join grid g on g.grid_id = fs.grid_id)
	  inner join shakemap s on g.shakemap_id = s.shakemap_id
		and g.shakemap_version = s.shakemap_version)
	  inner join facility_fragility ff on fs.facility_id = ff.facility_id and 
			ff.metric = '".$metric_unit."' and
			fs.value_".$metrics{$metric_unit}." between ff.low_limit and ff.high_limit)
     where s.event_id = '$event' and g.shakemap_version = $version";
	my $sth = SC->dbh->prepare($sql);
	 
    $sth->execute() || die "couldn't execute sql $metric_unit\n";
	while (my $hash_ref =  $sth->fetchrow_hashref) {
		my $item;
		my $facility_type = $hash_ref->{'facility_type'};
		my $facility_name = encode_entities($hash_ref->{'facility_name'});
		my $lat_min = $hash_ref->{'lat_min'};
		my $lon_min = $hash_ref->{'lon_min'};
		my $damage_level = $hash_ref->{'damage_level'};
		my $dist = $hash_ref->{'dist'};
		print "$dist\n";
		my $mmi = $hash_ref->{'MMI'};
		my $pga = $hash_ref->{'PGA'};
		my $pgv = $hash_ref->{'PGV'};
		my $psa03 = (defined $hash_ref->{'PSA03'}) ? $hash_ref->{'PSA03'} : 'UNKNOWN';
		my $psa10 = (defined $hash_ref->{'PSA10'}) ? $hash_ref->{'PSA10'} : 'UNKNOWN';
		my $psa30 = (defined $hash_ref->{'PSA30'}) ? $hash_ref->{'PSA30'} : 'UNKNOWN';

		my $capital = 'no';
		if ($facility_type =~ /CAPITAL/) {
			$capital = 'yes';
			$facility_type = 'CITY';
		}
		
		my ($city, $pop, $unit);
		if ($facility_name =~ /pop\./) {
			($city, $pop, $unit) = $facility_name
			   =~ /^(.*)\s+\(pop\. [\<\s]*([\d\.]+)([KM])\)/;
			   
			if (defined $unit) {
				$pop = ($unit eq 'M') ? $pop * 1000000 : $pop;
				$pop = ($unit eq 'K') ? $pop * 1000 : $pop;
			}
		} else {
			$city = $facility_name;
		}
		$item = { "name"	=>	$city,
				"population"	=>	$pop,
				"facility_id"	=>	$hash_ref->{'facility_id'},
				"facility_name"	=>	$hash_ref->{'facility_name'},
				"external_facility_id"	=>	$hash_ref->{'external_facility_id'},
				"short_name"	=>	$hash_ref->{'short_name'},
				"description"	=>	$hash_ref->{'description'},
				"metric"	=>	$metric_unit,
				"low_limit"	=>	$hash_ref->{'low_limit'},
				"high_limit"	=>	$hash_ref->{'high_limit'},
				"latitude"	=>	$lat_min,
				"longitude"	=>	$lon_min,
				"capital"	=>	$capital,
				"damage_level"		=>	$damage_level,
				"DIST"		=>	$dist,
				"MMI"		=>	$mmi,
				"PGA"		=>	$pga,
				"PGV"		=>	$pgv,
				"PSA03"		=>	$psa03,
				"PSA10"		=>	$psa10,
				"PSA30"		=>	$psa30
				};
		lookup_facility_attributes($item, $hash_ref->{'facility_id'});
		push @{$exposure{$facility_type}}, $item;
	}
	}
	foreach my $type (keys %exposure) {
		my %exposures;
		$exposures{'type'} = $type;
		$exposures{'item'} = $exposure{$type};
		push @{$shakecast->{'exposure'}},  \%exposures;
	}
#};

my $output;
  if ($shakecast->{'exposure'}) {
    $tt->process($template_name, { shakemap => $shakemap_xml, grid_metric => $grid_metric, 
	  shakecast => $shakecast, grid_spec => $grid_spec, event => $event_xml }, \$output)
	  || die $tt->error;
    print FH "$output\n";
    undef $shakemap_xml; undef $grid_metric; undef $shakecast; undef $grid_spec, undef $event_xml;
  }
}
close FH;

exit;

my ($count, $tag);
sub startElement {

      my( $parseinst, $element, %attrs ) = @_;
        SWITCH: {
                if ($element eq "shakemap_grid") {
                        $count++;
                        $tag = "shakemap_grid";
                        print "shakemap_grid $count:\n";
						foreach my $key (keys %attrs) {
							$shakemap_xml->{$key} = $attrs{$key};
							print $key,": ", $shakemap_xml->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "event") {
                        $count++;
                        $tag = "event";
                        print "event $count:\n";
						foreach my $key (keys %attrs) {
							$event_xml->{$key} = $attrs{$key};
							print $key,": ", $event_xml->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_specification") {
                        $count++;
                        $tag = "grid_specification";
                        print "grid_specification $count:\n";
						foreach my $key (keys %attrs) {
							$grid_spec->{$key} = $attrs{$key};
							print $key,": ", $grid_spec->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_field") {
                        print "grid_field: $count:\n";
                        $tag = "grid_field";
						$grid_metric->{$attrs{'name'}} = $attrs{'index'};
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
 
#
# Return GMT timestamp string
#
sub utc {
	my ($epoc) = @_;
	
	return ($epoc) if ($epoc =~ /[\-\:]/);
	
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =
		gmtime($epoc);

	return(sprintf("%04d-%02d-%02dT%02d:%02d%02dZ", $year+1900,
		$mon+1, $mday, $hour, $min, $sec));
}

#
# Return latest shakemap_id given event_id
#
sub lookup_shakemap {
	
	my @idp;
	
	$sth_lookup_shakemap->execute();
	while (my $href = $sth_lookup_shakemap->fetchrow_hashref) {
		push @idp, $href;
    }

    if (scalar @idp >= 1) {
        return \@idp;
    } else {
        return 0;       # not found
    }
}

#
# Return shakemap_version given event_id
#
sub lookup_shakemap_version {
    my ($event_id, $version) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_shakemap_version, undef,
        $event_id);

    if (scalar @$idp >= 1) {
        return $idp->[0];
    } else {
        return 0;       # not found
    }
}


#
# Return grid_id given event_id and version
#
sub lookup_shakemap_timestamp {
    my ($event_id, $version) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_shakemap_timestamp, undef,
        $event_id, $version);

    if (scalar @$idp >= 1) {
        return $idp->[0];
    } else {
        return 0;       # not found
    }
}

#
# Return grid_id given event_id and version
#
sub lookup_grid {
    my ($event_id, $version) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_grid, undef,
        $event_id, $version);

    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

#
# Return grid_id given event_id and version
#
sub lookup_facility_shaking {
    my ($event_id, $version) = @_;
	
	$sth_lookup_shakemap_metric->execute($event_id, $version);
	my $sql_metric;
	while (my @row = $sth_lookup_shakemap_metric->fetchrow_array) {
		$sql_metric .= ', fs.value_'.$row[1].' as '.uc($row[0]);
		
	}

    my $sql = "select f.facility_type, 
		f.facility_name, 
		f.lat_min, 
		f.lon_min
		$sql_metric
      from (((facility f 
	  inner join facility_shaking fs on f.facility_id = fs.facility_id)
	  inner join grid g on g.grid_id = fs.grid_id)
	  inner join shakemap s on g.shakemap_id = s.shakemap_id
		and g.shakemap_version = s.shakemap_version)
     where s.event_id = $event_id and g.shakemap_version = $version";
	my $sth = SC->dbh->prepare($sql);
	 
    $sth->execute() || return 0;
	#my $idp = $sth->fetchrow_hashref;
	#print scalar @$idp,"$sql_metric\n";

    #if (scalar @$idp >= 1) {
        return $sth;
    #} else {
        return 0;       # not found
    #}
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
# Return program usage information then quit
#
sub usage {
    my $rc = shift;

    print qq{
template.pl -- Shakecast General Templating Tool

Usage:
  template.pl [ Options ] 
  
Options:
    --event=S		Event ID is required for generating ShakeCast XML 
    --version=N		Version No. of the ShakeMap to be processed.
			If not specified, the latest version number will be used.
    --template=S	File name of template for generating ShakeCast XML 
    --output=S		Output file is optional for generating ShakeCast XML, 
			default file name is 'exposure.xml' 
    --help		Print this message
};
    exit $rc;
}
