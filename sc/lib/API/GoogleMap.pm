
# $Id: Event.pm 72 2007-06-25 20:49:55Z klin $

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

package API::GoogleMap;

use SC;
use API::APIUtil;
use Math::Trig;

my $options = API::APIUtil::config_options();
my $normalised;
my $tile_size = 256;

sub BEGIN {
    no strict 'refs';
    for my $method (qw(
			event_version generating_server
			shakemap_id shakemap_version
			lat_min lon_min lat_max lon_max
			origin_lat origin_lon
			latitude_cell_count longitude_cell_count
			grid_id
			event_timestamp
			receive_timestamp count
			tile_size
			)) {
	*$method = sub {
	    my $self = shift;
	    @_ ? ($self->{$method} = shift, return $self)
	       : return $self->{$method};
	}
    }
}

sub new {
    my $class = shift;
    my $self = bless {} => $class;
    $self->receive_timestamp(SC->time_to_ts);
    Carp::carp "Odd (wrong?) number of parameters in new()" if $^W && (@_ & 1); 
    while (@_) {
	my $method = shift;
	my $value = shift;
	$self->$method($value) if $self->can($method);
    }
    return $self;
}

sub getTileRect {
	my ($x,$y,$zoom) = @_;
    
	my %tileRect;
	my $tilesAtThisZoom = 1 << $zoom;
		$x = $x % $tilesAtThisZoom;
	
    $tileRect{'width'} = 360.0 / $tilesAtThisZoom;
    $tileRect{'x'} = -180 + ($x * $tileRect{'width'});

    my $latHeightMerc = 1.0 / $tilesAtThisZoom;
    my $topLatMerc = $y * $latHeightMerc;
    my $bottomLatMerc = $topLatMerc + $latHeightMerc;

    $tileRect{'y'} = (180 / pi) * ((2 * atan(exp(pi * 
            (1 - (2 * $bottomLatMerc))))) - (pi / 2));
    my $topLat = (180 / pi) * ((2 * atan(exp(pi * 
            (1 - (2 * $topLatMerc))))) - (pi / 2));

    $tileRect{'height'} = $topLat - $tileRect{'y'};

    return \%tileRect;
}

sub getPixelOffsetInTile {
	my ($lat, $lng, $zoom) = @_;

	my $pixelCoords = toZoomedPixelCoords($lat, $lng, $zoom);
	
	$pixelCoords->{'x'} = $pixelCoords->{'x'} % $tile_size;
	$pixelCoords->{'y'} = $pixelCoords->{'y'} % $tile_size;

	return $pixelCoords;
}

sub toZoomedPixelCoords {
	my ($lat, $lng, $zoom) = @_;
	
	$normalised = toNormalisedMercatorCoords(
		toMercatorCoords($lat, $lng)
	);
	
	my $scale = (1 << ($zoom)) * $tile_size;
	
    $normalised->{'x'} = int($normalised->{'x'} * $scale);
	$normalised->{'y'} = int($normalised->{'y'} * $scale);
	
	return $normalised;
}

sub toNormalisedMercatorCoords {
	my ($point) = @_;
	
	$point->{'x'} += 0.5;
	$point->{'y'} = abs($point->{'y'}-0.5);
	
	return $point;
}

sub toMercatorCoords {
	my ($lat, $lng) = @_;
	
	if ($lng > 180) {
		$lng -= 360;
	}

	my %point;
	
	$point{'x'} = $lng/360;
	my $z_rad = tan(deg2rad($lat));
	my $asinh_z = log($z_rad+sqrt($z_rad**2 + 1));
	$point{'y'} = $asinh_z/pi/2;
	
	return \%point;
}

sub toTileCoords {
	my ($lat, $lng, $zoom) = @_;
	
	if ($lng > 180) {
		$lng -= 360;
	}

	my $scale = 1 << ($zoom);
	my %point;
	
	$point{'x'} = int(($lng+180)/360*$scale);
	my $latd = deg2rad($lat);
	my $z_rad = tan($latd);
	$point{'y'} = int((1-(log($z_rad+1/cos($latd))/pi))/2*$scale);

	return \%point;
}


1;


__END__

=head1 NAME

SC::Event - ShakeCast library

=head1 DESCRIPTION

=head2 Class Methods

=head2 Instance Methods

=over 4

=item SC::Event->from_xml('d:/work/sc/work/event.xml');

Creates a new C<SC::Event> from XML, which may be passed directly or can be
read from a file.    

=item new SC::Event(event_type => 'EARTHQUAKE', event_name => 'Northridge');

Creates a new C<SC::Event> with the given attributes.

=item $event->write_to_db

Writes the event to the database.  The event may already exist; in this case
the event is silently ignored.  The return value indicates

  0 for errors (C<$SC::errstr> will be set),
  1 for successful insert, or
  2 if the record already existed.

=cut

