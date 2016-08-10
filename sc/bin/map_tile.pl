#!/usr/local/bin/perl

# $Id: worker.pl 64 2007-06-05 14:58:38Z klin $

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

use File::Path qw(make_path remove_tree);
use Getopt::Long;
use IO::File;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use API::GoogleMap;

use GD;
use GD::Polygon;
use Data::Dumper;

my %options = (
    'type'    => 0,
    'replace'   => 0,
    'skip'      => 0,
    'update'    => 0,
    'delete'    => 0,	
    'verbose'   => 0,
    'help'      => 0,
    'quote'     => '"',
    'separator' => ',',
    'limit=n'   => 50,
);

my %tile_dir = (
    'facility_tile'    => 'facility',
    'event_tile'    => 'event',
    'station_tile'    => 'station',
);

GetOptions(
    \%options,

    'type=s',           # error for existing facilities
    'id=s',          # replace existing facilities
    'min_zoom=n',          # replace existing facilities
    'max_zoom=n',          # replace existing facilities
    'rebuild',           # update existing facilities
    'skip',           # update existing facilities
    
    'verbose+',         # repeat for more verbosity
    'help'

) or usage(1);

usage(1) unless ($options{'type'} =~ /[facility_tile|event_tile|station_tile]/);
usage(1) if ($options{'rebuild'} && $options{'id'});
no strict 'refs';
my $tile_type = $options{'type'};

SC->initialize() or quit $SC::errstr;

my $icon_dir = SC->config->{'RootDir'}."/images";
my $tile_size = 256;
my $min_zoom = ($options{'min_zoom'}) ? $options{'min_zoom'} : 1;
my $max_zoom = ($options{'max_zoom'}) ? $options{'max_zoom'} : 10;
$max_zoom = ($options{'id'} || $options{'rebuild'}) ? 
	(($options{'max_zoom'}) ? $options{'max_zoom'} : 10) : 18;
my $skip = ($options{'skip'}) ? 1 : 0;
my $fac_bound = facility_bound($tile_type, $options{'id'});
my $fac_icons;
$fac_icons = facility_icon() if ($tile_type eq 'facility_tile');

if ($options{'rebuild'}) {
	if ($tile_type =~ /[facility_tile|event_tile|station_tile]/ && !$skip) {
		my $data_dir = SC->config->{'RootDir'}."/html/tiles/".$tile_dir{$tile_type};
		remove_tree $data_dir;
	}
	my $list = facility_list($tile_type);
	foreach my $item (@$list) {
		for (my $zoom = $min_zoom; $zoom <= $max_zoom; $zoom++) {
			my $point = API::GoogleMap::toTileCoords($item->{'lat'}, 
				$item->{'lon'}, $zoom);
			&{$tile_type}($point->{'x'}, $point->{'y'}, $zoom, 1);
		}
	}
} elsif ($options{'id'}) {
	for (my $zoom = $min_zoom; $zoom <= $max_zoom; $zoom++) {
		my $point = API::GoogleMap::toTileCoords($fac_bound->{'lat_min'}, 
			$fac_bound->{'lon_min'}, $zoom);
		&{$tile_type}($point->{'x'}, $point->{'y'}, $zoom);
	}
} else {
	for (my $zoom = $min_zoom; $zoom <= $max_zoom; $zoom++) {
		my $tilesAtThisZoom = 1 << $zoom;
		for (my $x=0; $x < $tilesAtThisZoom; $x++) {
			for (my $y=0; $y < $tilesAtThisZoom; $y++) {
				my $rect = API::GoogleMap::getTileRect($x, $y, $zoom);
				$rect->{'lat_min'} = $rect->{'y'};
				$rect->{'lat_max'} = $rect->{'y'}+$rect->{'height'};
				$rect->{'lon_min'} = $rect->{'x'};
				$rect->{'lon_max'} = $rect->{'x'}+$rect->{'width'};

				next unless (in_bound($rect, $fac_bound) || in_bound($fac_bound, $rect));
				
				&{$tile_type}($x, $y, $zoom, $skip);
			}
		}
	}
}
print time - $^T, "\n";
exit ;

sub in_bound {
	my ($rect1, $rect2) = @_;
	
	return (
		(($rect1->{'lon_min'} >= $rect2->{'lon_min'} && $rect1->{'lon_min'} <= $rect2->{'lon_max'}) ||
			($rect1->{'lon_max'} >= $rect2->{'lon_min'} && $rect1->{'lon_max'} <= $rect2->{'lon_max'})) 
		&& 
		(($rect1->{'lat_min'} >= $rect2->{'lat_min'} && $rect1->{'lat_min'} <= $rect2->{'lat_max'}) ||
			($rect1->{'lat_max'} >= $rect2->{'lat_min'} && $rect1->{'lat_max'} <= $rect2->{'lat_max'})))
		? 1 : 0 ;
}

sub facility_icon {
    my ($type, $id) = @_;
	
	my $sql = qq/
			SELECT
					facility_type
			FROM
					facility
			GROUP BY
					facility_type
		/;

	my $p;
	my (@icons, %gd_icons);
    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute();
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
		push @icons, $p;
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
	
	foreach my $icon (@icons) {
		my $icon_file = (-e "$icon_dir/".$icon->{'facility_type'}.".png") ? 
			"$icon_dir/".$icon->{'facility_type'}.".png" :
			"$icon_dir/city.png";
		my $gd_icon = new GD::Image->newFromPng($icon_file, 1);
		#$icon->transparent($white);
		#$gd_icon->interlaced('true');
		$gd_icons{$icon->{'facility_type'}} = $gd_icon;
	}
	return \%gd_icons;
}

sub facility_list {
    my ($type) = @_;
	
	my $sql;

	if ($type eq 'facility_tile') {
		$sql = qq/
			SELECT
					facility_id, lat_min as lat, lon_min as lon
			FROM
					facility
		/;
	} elsif ($type eq 'station_tile') {
		$sql = '
		SELECT
				station_id, latitude as lat, longitude as lon
        FROM
                station
        WHERE
			station_network != "DYFI"
		';
	} elsif ($type eq 'event_tile') {
		my $time_window = (SC->config->{'rss'}->{'TIME_WINDOW'}) ? 
			SC->config->{'rss'}->{'TIME_WINDOW'} : 30;
		$sql =  qq/
			SELECT
					event_id, lat, lon
			FROM
					event
			WHERE
					event_type = "ACTUAL"
			AND datediff(now(),event_timestamp) < $time_window	
		/;
	}

	my ($p, @facilities);
    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute();
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
		push @facilities, $p;
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
	
	return \@facilities;
}

sub facility_bound {
    my ($type, $id) = @_;
	
	my $sql;

	if ($type eq 'facility_tile') {
		$sql = qq/
			SELECT
					min(lat_min) as lat_min, max(lat_max) as lat_max, 
					min(lon_min) as lon_min, max(lon_max) as lon_max
			FROM
					facility
		/;
		$sql .= " WHERE facility_id = '$id'" if ($id);
	} elsif ($type eq 'station_tile') {
		$sql = '
		SELECT
				min(latitude) as lat_min, max(latitude) as lat_max, 
				min(longitude) as lon_min, max(longitude) as lon_max
        FROM
                station
        WHERE
			station_network != "DYFI"
		';
		$sql .= " AND station_id = '$id'" if ($id);
	} elsif ($type eq 'event_tile') {
		$sql = '
		SELECT
				min(lat) as lat_min, max(lat) as lat_max, 
				min(lon) as lon_min, max(lon) as lon_max
        FROM
                event
		';
		$sql .= " WHERE event_id = '$id'" if ($id);
	}

	my $p;
    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute();
	$p = $sth->fetchrow_hashref('NAME_lc');
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
	
	return $p;
}

sub event_tile {
    my ($x, $y, $zoom, $skip) = @_;
	
	#my $events = new API::Event->event_list($start);
	
	my $data_dir = SC->config->{'RootDir'}."/html/tiles/event/$zoom/$x/";
	make_path($data_dir) unless (-d $data_dir);
	
	my $tile_path = $data_dir."${y}.png";
	if (-e $tile_path) {
		return if ($skip);
		unlink $tile_path;
	}

	my $im = new GD::Image(256,256);
	$im->trueColor(1);
	# allocate some colors
	my $white = $im->colorAllocate(255,255,255);
	my $purple = $im->colorAllocate(88,20,130);
	my $lightgrey = $im->colorAllocate(192,192,192);
	my $grey = $im->colorAllocate(127,127,127);
	my $darkgrey = $im->colorAllocate(96,96,96);
	my $black = $im->colorAllocate(0,0,0);       
	my $red = $im->colorAllocate(255,0,0);      
	my $blue = $im->colorAllocate(0,0,255);
	my $lightblue = $im->colorAllocate(127,127,255);
	my $lightpink = $im->colorAllocate(255,153,244);
	my $pink = $im->colorAllocate(255,93,232);
	my $green = $im->colorAllocate(0,255,0);
	my $lightgreen = $im->colorAllocate(127,255,127);

	# make the background transparent and interlaced
	$im->fill(0,0,$purple);
	$im->transparent($purple);
	$im->interlaced('true');

	my $rect = API::GoogleMap::getTileRect($x, $y, $zoom);
	
    undef $SC::errstr;
    my @list;
	
	my $tilesAtThisZoom = 1 << $zoom;
	$x = $x % $tilesAtThisZoom;
	
	#my $icon = new GD::Image("c:/shakecast/sc/docs/images/va_hosp.png", 1);
	#$icon->transparent($white);
	#$icon->interlaced('true');
	#my ($iconwidth, $iconheight) = $icon->getBounds();
	
	my $extend = 360.0 / $tilesAtThisZoom / 256 ; 
	#$extend = 0; 
	my $swlat=$rect->{'y'} - $extend;
	my $swlng=$rect->{'x'} - $extend;
	my $nelat=$swlat+$rect->{'height'} + 2*$extend;
	my $nelng=$swlng+$rect->{'width'} + 2*$extend;
	
	my $time_window = (SC->config->{'rss'}->{'TIME_WINDOW'}) ? 
		SC->config->{'rss'}->{'TIME_WINDOW'} : 30;

   my $sql =  qq/
		SELECT
                lat,lon,magnitude,datediff(now(),event_timestamp) as opacity
        FROM
                event
        WHERE
                (lon > $swlng AND lon <= $nelng)
        AND (lat <= $nelat AND lat > $swlat)
        AND datediff(now(),event_timestamp) < $time_window	
	/;

    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute();
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
		my $point = API::GoogleMap::getPixelOffsetInTile($p->{'lat'}, $p->{'lon'}, $zoom);
	    #push @list, $p;
	    push @list, $point;
		if (($p->{'lon'}+$extend) > $nelng) {
			$point->{'x'} += 256;
		} elsif (($p->{'lon'}-$extend) <= $swlng) {
			$point->{'x'} -= 256;
		}
		if (($p->{'lat'}+$extend) > $nelat) {
			$point->{'y'} += 256;
		} elsif (($p->{'lat'}-$extend) <= $swlat) {
			$point->{'y'} -= 256;
		}
		$im->filledEllipse($point->{'x'}, $point->{'y'}, 8, 8, $lightpink );
		$im->ellipse($point->{'x'}, $point->{'y'}, 8, 8, $pink );
		#$im->copyResized($icon,$point->{'x'}-$iconwidth/3, $point->{'y'}-$iconheight/3,0,0,
		#	$iconwidth/1.5,$iconheight/1.5,$iconwidth,$iconheight);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    #return \@list;

    # Convert the image to PNG and print it on standard output
	open (FH, "> $tile_path");
	binmode FH;
    print FH $im->png;
	close(FH);
  }

sub station_tile {
    my ($x, $y, $zoom, $skip) = @_;
	
	#my $events = new API::Event->event_list($start);
	
	my $data_dir = SC->config->{'RootDir'}."/html/tiles/station/$zoom/$x/";
	make_path($data_dir) unless (-d $data_dir);
	
	my $tile_path = $data_dir."${y}.png";
	if (-e $tile_path) {
		return if ($skip);
		unlink $tile_path;
	}

	my $im = new GD::Image(256,256);
	$im->trueColor(1);
	# allocate some colors
	my $white = $im->colorAllocate(255,255,255);
	my $purple = $im->colorAllocate(88,20,130);
	my $lightgrey = $im->colorAllocate(192,192,192);
	my $grey = $im->colorAllocate(127,127,127);
	my $darkgrey = $im->colorAllocate(96,96,96);
	my $black = $im->colorAllocate(0,0,0);       
	my $red = $im->colorAllocate(255,0,0);      
	my $blue = $im->colorAllocate(0,0,255);
	my $lightblue = $im->colorAllocate(127,127,255);
	my $lightpink = $im->colorAllocate(255,153,244);
	my $pink = $im->colorAllocate(255,93,232);
	my $green = $im->colorAllocate(0,255,0);
	my $lightgreen = $im->colorAllocate(127,255,127);

	# make the background transparent and interlaced
	$im->fill(0,0,$purple);
	$im->transparent($purple);
	$im->interlaced('true');

	my $rect = API::GoogleMap::getTileRect($x, $y, $zoom);
	
    undef $SC::errstr;
    my @list;
	my $size = 8;
	
	my $tilesAtThisZoom = 1 << $zoom;
	#$x = $x % $tilesAtThisZoom;
	
	my $extend = 360.0 / $tilesAtThisZoom / 256; 
	$extend = 0; 
	my $swlat=$rect->{'y'} - $extend;
	my $swlng=$rect->{'x'} - $extend;
	my $nelat=$swlat+$rect->{'height'} + 2*$extend;
	my $nelng=$swlng+$rect->{'width'} + 2*$extend;
	
	#my %rect = ('x' => $self->param('x'), 'off' => $self->param('x') % $tilesAtThisZoom, 'zoom' => $tilesAtThisZoom, 'swlat' => $swlat, 'swlng' => $swlng, 'nelat' => $nelat, 'nelng' => $nelng);
	#push @list, \%rect;

   my $sql =  qq/
		SELECT
                latitude,longitude
        FROM
                station
        WHERE
            (longitude > $swlng AND longitude <= $nelng)
        AND (latitude <= $nelat AND latitude > $swlat)
        AND station_network != 'DYFI'
	/;

    #eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute();
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
		my $lon = $p->{'longitude'};
		my $lat = $p->{'latitude'};
		my $point = API::GoogleMap::getPixelOffsetInTile($lat, $lon, $zoom);
	    #push @list, $p;
	    push @list, $point;
		if (($lon+$extend) > $nelng) {
			$point->{'x'} += 256;
		} elsif (($lon-$extend) <= $swlng) {
			$point->{'x'} -= 256;
		}
		if (($lat+$extend) > $nelat) {
			$point->{'y'} += 256;
		} elsif (($lat-$extend) <= $swlat) {
			$point->{'y'} -= 256;
		}

		my $poly = new GD::Polygon;
		$poly->addPt($point->{'x'}, $point->{'y'} - $size * 0.5);
		$poly->addPt($point->{'x'} - $size * 0.5, $point->{'y'} + $size * 0.2);
		$poly->addPt($point->{'x'} + $size * 0.5, $point->{'y'} + $size * 0.2);
		$im->filledPolygon($poly, $lightgreen );
		$im->openPolygon($poly, $green );
	
		#my $icon = new GD::Image("c:/shakecast/sc/docs/images/".$p->{'facility_type'}.".png");
		#$icon->transparent($white);
		#$icon->interlaced('true');
		#my ($iconwidth, $iconheight) = $icon->getBounds();
		#$im->copyResized($icon,$point->{'x'}-$iconwidth/3, $point->{'y'}-$iconheight/3,0,0,
		#	$iconwidth/1.5,$iconheight/1.5,$iconwidth,$iconheight);
	}
	$sth->finish;
    #};
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    #return \@list;

    # Convert the image to PNG and print it on standard output
	open (FH, "> $tile_path");
	binmode FH;
    print FH $im->png;
	close(FH);
  }


sub facility_tile {
    my ($x, $y, $zoom, $skip) = @_;
	
	#my $events = new API::Event->event_list($start);
	
	my $data_dir = SC->config->{'RootDir'}."/html/tiles/facility/$zoom/$x/";
	make_path($data_dir) unless (-d $data_dir);
	
	my $tile_path = $data_dir."${y}.png";
	if (-e $tile_path) {
		return if ($skip);
		unlink $tile_path;
	}

	my $im = GD::Image->newTrueColor(256,256);
	#$im->trueColor(1);
	# allocate some colors
	my $white = $im->colorAllocate(255,255,255);
	my $purple = $im->colorAllocate(88,20,130);
	my $lightgrey = $im->colorAllocate(192,192,192);
	my $grey = $im->colorAllocate(127,127,127);
	my $darkgrey = $im->colorAllocate(96,96,96);
	my $black = $im->colorAllocate(0,0,0);       
	my $darkred = $im->colorAllocate(32,0,0);      
	my $red = $im->colorAllocate(255,0,0);      
	my $blue = $im->colorAllocate(0,0,255);
	my $lightblue = $im->colorAllocate(127,127,255);
	my $lightpink = $im->colorAllocate(255,153,244);
	my $pink = $im->colorAllocate(255,93,232);
	my $green = $im->colorAllocate(0,255,0);
	my $lightgreen = $im->colorAllocate(127,255,127);

	# make the background transparent and interlaced
	$im->fill(0,0,$purple);
	$im->transparent($purple);
	$im->interlaced('true');
	
	my $rect = API::GoogleMap::getTileRect($x, $y, $zoom);
	
    undef $SC::errstr;
    my @list;
	
	my $tilesAtThisZoom = 1 << $zoom;
	#$x = $x % $tilesAtThisZoom;
	
	my $extend = 360.0 / $tilesAtThisZoom / 256; 
	$extend = 0; 
	my $swlat=$rect->{'y'} - $extend;
	my $swlng=$rect->{'x'} - $extend;
	my $nelat=$swlat+$rect->{'height'} + 2*$extend;
	my $nelng=$swlng+$rect->{'width'} + 2*$extend;
	
	my $sql =  qq/
		SELECT
                lat_min, lat_max,lon_min, lon_max, facility_type
        FROM
                facility
        WHERE
                (lon_max > $swlng AND lon_min <= $nelng)
        AND (lat_min <= $nelat AND lat_max > $swlat)
	/;

    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute();
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @list, $p;
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }

	return 0 unless (@list);
	foreach my $p (@list) { 
		my $lon = ($p->{'lon_min'} + $p->{'lon_max'}) / 2;
		my $lat = ($p->{'lat_min'} + $p->{'lat_max'}) / 2;
		my $point = API::GoogleMap::getPixelOffsetInTile($lat, $lon, $zoom);
	    #push @list, $p;
		if (($lon+$extend) > $nelng) {
			$point->{'x'} += 256;
		} elsif (($lon-$extend) <= $swlng) {
			$point->{'x'} -= 256;
		}
		if (($lat+$extend) > $nelat) {
			$point->{'y'} += 256;
		} elsif (($lat-$extend) <= $swlat) {
			$point->{'y'} -= 256;
		}
		
		#$im->filledEllipse($point->{'x'}, $point->{'y'}, 8, 8, $lightblue );
		#$im->ellipse($point->{'x'}, $point->{'y'}, 8, 8, $blue );
	
		#my $icon_file = (-e "$icon_dir/".$p->{'facility_type'}.".png") ? 
		#	"$icon_dir/".$p->{'facility_type'}.".png" :
		#	"$icon_dir/city.png";
		#my $icon = new GD::Image($icon_file);
		#$icon->transparent($white);
		#$icon->interlaced('true');
		my ($iconwidth, $iconheight) = $fac_icons->{$p->{'facility_type'}}->getBounds();
		$im->copyResized($fac_icons->{$p->{'facility_type'}},$point->{'x'}-$iconwidth/4, 
			$point->{'y'}-$iconheight/4,0,0,
			$iconwidth/2,$iconheight/2,$iconwidth,$iconheight);
	}

    # Convert the image to PNG and print it on standard output
	open (FH, "> $tile_path");
	binmode FH;
    print FH $im->png;
	close(FH);
	
	return 0;
}

sub usage {
    my $rc = shift;

    print qq{
manage_facility -- Facility Import utility
Usage:
  manage_facility [ mode ] [ option ... ] input-file

Mode is one of:
    --replace  Inserts new facilities and replaces existing ones, along with
               any existing fragilities and attributes
    --insert   Inserts new facilities.  Existing facilities are not
               modified; each one generates an error.
    --delete   Delete facilities. Each non-exist one generates an error.
    --update   Updates existing facilities.  Only those fields present in the
               input file are modified; other fields not mentioned are left
               alone.  An error is generated for each facility that does not
               exist.
    --skip     Inserts facilities not in the database.  Skips existing
               facilities.
  
  The default mode is --replace.

Options:
    --help     Print this message
    --verbose  Print details of program operation
    --limit=N  Quit after N bad input records, or 0 for no limit
    --quote=C  Use C as the quote character in place of double quote (")
    --separator=S
               Use S as the field separator in place of comma (,)
};
    exit $rc;
}

