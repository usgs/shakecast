#!/usr/local/bin/perl

# $Id: facility_shaking_plot.pl 261 2008-01-11 20:30:19Z klin $

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
# U.S. Geological Survey (USGS) and Gatekeeper Systems have no
# obligations to provide maintenance, support, updates, enhancements or
# modifications. In no event shall USGS or Gatekeeper Systems be liable
# to any party for direct, indirect, special, incidental or consequential
# damages, including lost profits, arising out of the use of this
# software, its documentation, or data obtained though the use of this
# software, even if USGS or Gatekeeper Systems have been advised of the
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

use Data::Dumper;
use Getopt::Long;
use IO::File;


use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;


sub epr;
sub vpr;
sub vvpr;

my $config = SC->config;

my %options = (
    'event'    => 0,
    'help'      => 0,
    'verbose'      => 0,
    'version=n'   => 50,
);

my $csv;
#my $fh;

my %columns;        # field_name -> position
my %metrics;        # metric_name -> [ green_ix, yellow_ix, red_ix ]
my %attrs;          # attribute name -> position

# specify required columns, 1=always required, 2=not required for update
my %required = (
    'EXTERNAL_FACILITY_ID'      => 1,
    'FACILITY_TYPE'             => 1,
    'FACILITY_NAME'             => 2,
    'LAT'                       => 2,
    'LON'                       => 2
);

# translate damage level to array index
my %damage_levels = (
    'GREEN'     => 0,
    'YELLOW'    => 1,
    'ORANGE'       => 2,
    'RED'       => 3
);
# map array index to damage level
my @damage_levels = (
    'GREEN',
    'YELLOW',
    'ORANGE',
    'RED'
);

# Constants for plotting; some may be adjusted by program
my    $x_dim = 8;    # Plot physical dimension in inches
my    $y_log_dim = 6;
my    $min_dist = 0.1;   # Minimum distance to plot in km
my    $max_dist = 400.0;
my    $min_y = 0.001;    # Min Y scale, acceleration %g or velocity cm/sec
my    $max_y = 100.0;
my    $max_sta_label_dist = 100.0;
my    $x_offset = 1.1;
my    $y_log_offset = 1.0;    # offset plot to make room for labels
my $gmt_bin = '/usr/local/gmt/bin';

my $sth_lookup_facility;
my $sth_facility_fragility;
my $sth_facility_attribute;
my $sth_damage_level;
my $sth_metric;
my $sth_facility_type_attribute;
my $sth_facility_shaking_count;
my $sth_facility_shakemap;
my $sth_event;
my $sth_grid;
my $sth_facility_damage_level;
my $sth_facility_metric;
my $sth_lookup_shakemap;
my $sth_lookup_shakemap_info;
my $sth_lookup_grid;
my $dbh;



GetOptions(
    \%options,

    'event=s',           # error for existing facilities
    'help',             # print help and exit
    'verbose',             # print help and exit

    'version=n',          # max bad records allowed (0 for no limit)
    
) or usage(1);
usage(1) unless ($options{'event'} and $options{'version'});

my $event = $options{'event'};
my $version = $options{'version'};
my $verbose = $options{'verbose'} if $options{'verbose'};

SC->initialize;

$dbh = SC->dbh;
#	$dbh->trace(1,'trace.log');

$sth_lookup_shakemap = SC->dbh->prepare(qq{
    select shakemap_id
      from shakemap
     where event_id = ? and shakemap_version = ?});

$sth_lookup_grid = SC->dbh->prepare(qq{
    select g.grid_id
      from (grid g
	  inner join shakemap s on g.shakemap_id = s.shakemap_id)
     where s.event_id = ? and g.shakemap_version = ?});

$sth_lookup_shakemap_info = SC->dbh->prepare(qq{
    select tag, value
      from shakemap_info si
     where shakemap_id = ? and shakemap_version = ?});

$sth_lookup_facility = $dbh->prepare(qq{
	SELECT facility_id, facility_type, external_facility_id, facility_name, short_name,
			description, lat_min, lat_max, lon_min, lon_max
      from facility
     where facility_id = ?});

$sth_facility_fragility = $dbh->prepare(qq{
    SELECT ff.facility_fragility_id, ff.damage_level, dl.name, ff.low_limit, ff.high_limit, ff.metric 
		FROM facility_fragility ff INNER JOIN damage_level dl on ff.damage_level = dl.damage_level
		WHERE ff.facility_id  = ?});

$sth_facility_attribute = $dbh->prepare(qq{
    SELECT attribute_name, attribute_value FROM facility_attribute WHERE facility_id = ?});

$sth_damage_level = $dbh->prepare(qq{
    SELECT damage_level, name FROM damage_level order by severity_rank});

$sth_metric = $dbh->prepare(qq{
    SELECT short_name, name, metric_id FROM metric});

$sth_facility_type_attribute = $dbh->prepare(qq{
    SELECT attribute_name FROM facility_type_attribute});

$sth_facility_shaking_count = $dbh->prepare(qq{
    SELECT count(grid_id) as total
	FROM facility_shaking 
	WHERE 
		grid_id = ?});

$sth_facility_shakemap = $dbh->prepare(qq{
    SELECT g.shakemap_id, g.shakemap_version, g.grid_id
	FROM 
		(((grid g INNER JOIN facility_shaking fs on
			g.grid_id = fs.grid_id) INNER JOIN shakemap s on
			g.shakemap_id = s.shakemap_id AND g.shakemap_version = s.shakemap_version) 
			INNER JOIN event e on e.event_id = s.shakemap_id AND e.event_version = s.shakemap_version)
	WHERE
		fs.facility_id = ?
	ORDER BY e.event_timestamp });

$sth_event = $dbh->prepare(qq{
    SELECT event_location_description, magnitude, lat, lon, event_type, event_timestamp
		FROM 
			event
		WHERE
			event_id = ? AND event_version = ?});

$sth_grid = $dbh->prepare(qq{
    SELECT g.grid_id, sm.metric, sm.value_column_number
		FROM 
			(grid g INNER JOIN shakemap_metric sm on
				g.shakemap_id = sm.shakemap_id AND g.shakemap_version = sm.shakemap_version)
		WHERE
			g.grid_id = ?});

$sth_facility_damage_level = $dbh->prepare(qq{
    select ff.damage_level, dl.name, ff.facility_id
		  from grid g
			   straight_join shakemap s
			   straight_join event e
			   straight_join facility_shaking sh
			   straight_join facility_fragility ff
			   inner join damage_level dl on ff.damage_level = dl.damage_level
		 where ff.metric = ?
		   and s.shakemap_id = ?
		   and s.shakemap_version = ?
		   and g.grid_id = ?
		   and s.event_id = e.event_id and s.event_version = e.event_version
		   and g.grid_id = sh.grid_id
		   and (s.shakemap_id = g.shakemap_id and
				s.shakemap_version = g.shakemap_version)
		   and sh.facility_id = ff.facility_id
		   and ? between ff.low_limit and ff.high_limit});

$sth_facility_metric = $dbh->prepare(qq{
    SELECT f.facility_id,f.external_facility_id,f.lat_min, f.lon_min, f.facility_name, f.facility_type, 
				s.shakemap_id, s.shakemap_version, s.receive_timestamp, s.shakemap_region, 
				e.event_type, e.event_location_description, e.magnitude, e.lat, e.lon, e.event_timestamp
				?
		FROM ((((shakemap s INNER JOIN event e on
			s.event_id = e.event_id AND s.event_version = e.event_version) 
			INNER JOIN grid g on	g.shakemap_id = s.shakemap_id AND g.shakemap_version = s.shakemap_version) 
			INNER JOIN facility_shaking fs on fs.grid_id = g.grid_id) 
			INNER JOIN facility f on fs.facility_id = f.facility_id)
		WHERE 
			g.grid_id = ? AND f.facility_id = ?
		ORDER BY fs.value_3 DESC });

    vpr "Processing Event $event-$version";
    process();

    exit;

    
sub process {
    #unless (process_header()) {
    #    epr "file had errors, skipping";
    #    return;
    #}
    my ($fac_id) = @_;
    my $err_cnt = 0;
    my $nrec = 0;
    my $nins = 0;
    my $nupd = 0;
    my $nrepl = 0;
    my $nskip = 0;
	my (%facility_fragility, $facility);
	my @facility_shakemap;
	my (%facility_shaking, %facility_damage, $facility_shaking_count);
	$nrec++;
	my $shakemap = lookup_shakemap($event, $version);
	my $shakemap_info = lookup_shakemap_info($event, $version);
	my $grid = lookup_grid($event, $version);

	if (defined $grid) {
		# facility exists
		# replace both the facility and all fragilities and attributes
		eval {
			$sth_facility_fragility->execute($fac_id);
			while (my $idp = $sth_facility_fragility->fetchrow_hashref('NAME_uc')) {
				$facility_fragility{$idp->{'DAMAGE_LEVEL'}} = $idp;
				print $idp->{'DAMAGE_LEVEL'}," ",$idp->{'HIGH_LIMIT'},"\n";
				$nrepl++;
			}
			$facility_shaking_count = count_facility_shaking($grid);
			next if ($facility_shaking_count <= 0);
			#print "facility_shaking_count: $facility_shaking_count\n";
			$sth_facility_shakemap->execute($grid);

			$sth_event->execute($event, $version);
			my $event = $sth_event->fetchrow_hashref('NAME_uc');

			#print "grid: $grid\n";
			$sth_grid->execute($grid);
			while (my $grid_metric = $sth_grid->fetchrow_hashref('NAME_uc')) {
				my $file = SC->config->{'DataRoot'} . "/$event-$version/" . $grid_metric->{'METRIC'} . "_regr.ps";
				next if ($grid_metric->{'METRIC'} eq 'MMI' or -e $file);
				my $metric_query = "SELECT max(fs.value_".$grid_metric->{'VALUE_COLUMN_NUMBER'} . ")*2 as metric_max" 
					. ', min(fs.value_'.$grid_metric->{'VALUE_COLUMN_NUMBER'} . ")/2 as metric_min"
					. ", max(ss.distance)*2 as distance_max, min(ss.distance)/2 as distance_min
					FROM grid g 
						INNER JOIN station_shaking ss on ss.grid_id = g.grid_id 
						INNER JOIN facility_shaking fs on fs.grid_id = g.grid_id
							AND fs.facility_id = ss.station_id
					WHERE 
						g.grid_id = $grid";
				my $station_shaking = $dbh->prepare($metric_query);
				$station_shaking->execute();
				my $station_shaking_info = $station_shaking->fetchrow_hashref('NAME_uc');
					
				$metric_query = ", " . 'fs.value_'.$grid_metric->{'VALUE_COLUMN_NUMBER'} . " as ". $grid_metric->{'METRIC'} 
					. ', ss.value_'.$grid_metric->{'VALUE_COLUMN_NUMBER'} . " as ". $grid_metric->{'METRIC'} . "_sta";
					
				my $sql = "SELECT f.facility_id,f.external_facility_id,f.lat_min, f.lon_min, f.facility_name, f.facility_type, ss.distance,
							s.shakemap_id, s.shakemap_version, s.receive_timestamp, s.shakemap_region, 
							e.event_type, e.event_location_description, e.magnitude, e.lat, e.lon, e.event_timestamp
							$metric_query
					FROM (((((shakemap s INNER JOIN event e on
						s.event_id = e.event_id AND s.event_version = e.event_version) 
						INNER JOIN grid g on	g.shakemap_id = s.shakemap_id AND g.shakemap_version = s.shakemap_version) 
						INNER JOIN facility_shaking fs on fs.grid_id = g.grid_id) 
						INNER JOIN station_shaking ss on ss.grid_id = g.grid_id and fs.facility_id = ss.station_id) 
						INNER JOIN facility f on fs.facility_id = f.facility_id)
					WHERE 
						g.grid_id = $grid";
				my $facility_shaking_query = $dbh->prepare($sql);
				$facility_shaking_query->execute();
				my @facility_shaking;
				while (my $facility_shaking = $facility_shaking_query->fetchrow_hashref('NAME_uc')) {
					push @facility_shaking, $facility_shaking;
					#print $facility_shaking->{$grid_metric->{'METRIC'}}," ",$facility_shaking->{'FACILITY_ID'},"\n";
				}
				#print "$sql\n";
    				@facility_shaking = sort { $a->{DISTANCE} <=> $b->{DISTANCE} } @facility_shaking;
				make_plot($grid_metric->{'METRIC'}, $event, \@facility_shaking, $shakemap_info, $station_shaking_info) 
					if (scalar @facility_shaking);
				$nrepl++;
			}
		};
		#print "facility_shaking_count: $facility_shaking_count, ", (join ':', keys  %facility_shaking), " ", (join ':', keys  %facility_damage), " \n";
		#bar_chart($fac_id, \@facility_shakemap, \%facility_shaking);
		if ($@) {
			epr $@;
			$err_cnt++;
		}
	}
    vpr "$nrec records processed ($nins inserted, $nupd updated, $err_cnt rejected)";
}


########################################################################
# sub make_plot()
# Generate the postscript plot of station and regression data
# for a single data type - pga, pgv, etc
########################################################################
sub make_plot {

    my $type = shift;
    my $src = shift;
    my $staref = shift;
    my $info = shift;
    my $sta_info = shift;
    
    return unless (scalar @$staref);

    my $sta_type = $type."_STA";
    my $gmt_acc_B = "-Ba1g1f3/a1g1f3:\"\% g\":WeSn";
    my $gmt_vel_B = "-Ba1g1f3/a1g1f3:\"cm/sec\":WeSn";
    my $regr_color = "255/0/0";   # red for the base regression
    my $bias_color = "0/255/0";   # green for the biased regression
    my $symbol_size = 0.12;       
    my $csymbol_size = 0.06;       
    my $main_title_size = 15;		# Point size of the map title
    my $sub_title_size  = 12;		# Point size of the map subtitle
    my @rows;
    my $outputdir = SC->config->{'DataRoot'} . "/$event-$version";
	#----------------------------------------------------------------------
	# Path to the echo command
	#----------------------------------------------------------------------
	my $echo      = "/home/klin/gsm-bruce/bin/echo";
	my $convert   = "/usr/bin/convert";

    $min_dist = ($sta_info->{DISTANCE_MIN} <=0) ? $min_dist : $sta_info->{DISTANCE_MIN};
    $max_dist = $sta_info->{DISTANCE_MAX};
    $min_y = ($sta_info->{METRIC_MIN} <=0) ? $min_y : $sta_info->{METRIC_MIN};
    $max_y = $sta_info->{METRIC_MAX};
#    `$gmt_bin/gmtset PAPER_MEDIA US`;
    `$gmt_bin/gmtset MEASURE_UNIT inch`;
    my $rlogflag = "-R$min_dist/$max_dist/$min_y/$max_y";
    my $jlogflag = "-JX" . $x_dim . "il/" . $y_log_dim . "il " .
	"-Xa" . $x_offset . " -Ya" . $y_log_offset . "";
    my $plotfile = "$outputdir/$type" . "_regr.ps";
    my $pngfile = "$outputdir/$type" . "_regr.png";
    my $command = ($type eq "pgv") ? 
	"$gmt_bin/psbasemap $gmt_vel_B $rlogflag $jlogflag -K -G230 > $plotfile" 
	:
	"$gmt_bin/psbasemap $gmt_acc_B $rlogflag $jlogflag -K -G230 > $plotfile";
    print "Running $command" if ($verbose);
    `$command`;

    # Compute the base regression and save it
    my (@dist, @yval, $x, %y, $sta);
    $x = $min_dist;

    # Plot each station and maybe its label
	$command = "| $gmt_bin/psxy $rlogflag $jlogflag " .
	    "-K -O -Wthin,- >> $plotfile";
	print "Running $command" if ($verbose);
	foreach $sta (@$staref) {
		open PLOT, $command or die "Can't run: $command";
	    	printf PLOT "%f %f\n", $sta->{DISTANCE}, $sta->{$type};
	    	printf PLOT "%f %f\n", $sta->{DISTANCE}, $sta->{$sta_type};
		close PLOT;
	}


    # Plot each station and maybe its label
    my ($color, $peak, $symbol, $flagged);
    foreach $sta (@$staref) {
	$symbol = "-Sc$csymbol_size";
	my $sym_color = ($sta->{$type} > abs($sta->{$sta_type})) ? '255/0/0' : '0/255/0';
	$command = sprintf "$echo %f %f | $gmt_bin/psxy $rlogflag $jlogflag " .
	    "-K -O -G$sym_color $symbol >> $plotfile", $sta->{DISTANCE}, $sta->{$type};
	print "Running $command" if ($verbose);
	`$command`;

	$symbol = "-St$symbol_size";
	$command = sprintf "$echo %f %f | $gmt_bin/psxy $rlogflag $jlogflag " .
	    "-K -O -G0/0/255 $symbol >> $plotfile", $sta->{DISTANCE}, $sta->{$sta_type};
	print "Running $command" if ($verbose);
	`$command`;

    }

    # Put a title on the plot
    my %title = ( 'PGA'   => 'Peak Accel. Regression (in %g)',
		  'PGV'   => 'Peak Velocity Regression (in cm/s)',
		  'PSA03' => '0.3 s Pseudo-Acceleration Spectra (%g)',
		  'PSA10' => '1.0 s Pseudo-Acceleration Spectra (%g)',
		  'PSA30' => '3.0 s Pseudo-Acceleration Spectra (%g)' );
    my $title_X    = lin2log_coord($x_dim / 2, 0, $x_dim, $min_dist, $max_dist);
    my $title_Y    = lin2log_coord($y_log_dim + 1.25, 0, $y_log_dim, $min_y, $max_y);
    my $title_subY = lin2log_coord($y_log_dim + 1.0, 0, $y_log_dim, $min_y, $max_y);
    my $title_subY2 = lin2log_coord($y_log_dim + 0.75, 0, $y_log_dim, $min_y, $max_y);
    my $title_subY3 = lin2log_coord($y_log_dim + 0.50, 0, $y_log_dim, $min_y, $max_y);
    my $label_Y    = lin2log_coord(0 - 1.0, 0, $y_log_dim, $min_y, $max_y);

    #my $loc = $src->locstring();
    my $loc = $src->{EVENT_LOCATION_DESCRIPTION};
    my $header_main;
    if (defined $event and $event ne '') {
	$header_main = "for $loc Earthquake";    
    }
    elsif (defined $loc and $loc ne '') {
	$header_main = "Epicenter: $loc";
    } else {
	$header_main = "for event: " . $event;
    }
    
    my $header_sub = $src->{EVENT_TIMESTAMP}. '  M'.$src->{MAGNITUDE}. '  Location: '. $src->{LAT}. '/'. $src->{LON};
    my $header_sub2 = join '/', ($info->{GMPE},$info->{IPE},$info->{PGM2MI},$info->{MI2PGM});
    my $header_sub3 = $type.' Bias: '.$info->{$type.'_BIAS'}.'/MI Bias: '.$info->{MI_BIAS};
    my $title1 = "$title_X $title_Y $main_title_size 0 0 CB "
	. "$title{$type} $header_main\n";
    my $title2 = "$title_X $title_subY $sub_title_size 0 0 CB $header_sub\n";
    my $title3 = "$title_X $title_subY2 $sub_title_size 0 0 CB $header_sub2\n";
    my $title4 = "$title_X $title_subY3 $sub_title_size 0 0 CB $header_sub3\n";
    my $label = "$title_X $label_Y $main_title_size 0 0 CB Distance, km\n";

    $command = "| $gmt_bin/pstext $jlogflag $rlogflag -N -O >> $plotfile";
    open TIT, $command or die "Can't run $command: $!";
    print TIT $title1;
    print TIT $title2;
    print TIT $title3;
    print TIT $title4;
    print TIT $label;
    close TIT;
    `convert -rotate 90 $plotfile $pngfile`;
    return;

}

sub _log_base {
  my ($base, $arg) = @_;
  return (log($arg)/log($base));
}

########################################################################
# lin2log_coord: convert from linear to coordinates of log10 axes
########################################################################
sub lin2log_coord {
    my ($val, $inmin, $inmax, $outmin, $outmax) = @_;

    my $outval = $outmin * 10 ** (($val - $inmin) * 
				  _log_base(10, $outmax/$outmin) / 
				  ($inmax - $inmin) );
    return $outval;
}

########################################################################
# log2lin_coord: convert from coordinates of log10 axes to linear coords
########################################################################
sub log2lin_coord {
    my ($val, $inmin, $inmax, $outmin, $outmax) = @_;

    my $outval = $outmin + _log_base(10, $val / $inmin) * ($outmax - $outmin) /
	_log_base(10, $inmax / $inmin);

    return $outval;

}    

# Return shakemap_id given event_id
sub lookup_shakemap {
    my ($event_id, $event_version) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_shakemap, undef,
        $event_id, $event_version);

    if (scalar @$idp >= 1) {
        return $idp->[0];
    } else {
        return 0;       # not found
    }
}

sub lookup_grid {
    my ($event_id, $event_version) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_grid, undef,
        $event_id, $version);

    if (scalar @$idp >= 1) {
        return $idp->[0];
    } else {
        return 0;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub lookup_facility_shakemap {
    my ($external_id) = @_;
	$sth_facility_shakemap->execute($external_id);
	my $idp = $sth_facility_shakemap->fetchrow_hashref('NAME_uc');
    #$idp = $sth->selectcol_arrayref('NAME_uc');
	#print $idp->{'FACILITY_NAME'},"\n";
    #my $idp = SC->dbh->fetchrow_hashref($sth_lookup_facility, undef,
    #    $external_id);
    #my $idp = $sth->selectcol_arrayref('NAME_uc');
    if (defined $idp) {
        return $idp;
    } else {
        return ;       # not found
    }
}

# Return info given event_id and version
sub lookup_shakemap_info {
    my ($event_id, $event_version) = @_;
    my %idp;
    $sth_lookup_shakemap_info->execute($event_id, $event_version);
    while (my $shakemap_info = $sth_lookup_shakemap_info->fetchrow_hashref('NAME_uc')) {
	if (uc($shakemap_info->{TAG}) eq 'BIAS') {
		my ($pga, $pgv, $psa03, $psa10, $psa30) = split ' ', $shakemap_info->{VALUE};
		$idp{PGA_BIAS} = $pga;
		$idp{PGV_BIAS} = $pgv;
		$idp{PSA03_BIAS} = $psa03;
		$idp{PSA10_BIAS} = $psa10;
		$idp{PSA30_BIAS} = $psa30;
	} else {
		$idp{uc($shakemap_info->{TAG})} = $shakemap_info->{VALUE};
	}
    }
    if (keys %idp) {
        return \%idp;
    } else {
        return ;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub count_facility_shaking {
    my ($grid) = @_;
	$sth_facility_shaking_count->execute($grid);
	my $idp = $dbh->selectcol_arrayref($sth_facility_shaking_count, undef, $grid);
    if (defined $idp) {
        return @$idp[0];
    } else {
        return ;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub lookup_facility {
    my ($external_id) = @_;
	$sth_lookup_facility->execute($external_id);
	my $idp = $sth_lookup_facility->fetchrow_hashref('NAME_uc');
    #$idp = $sth->selectcol_arrayref('NAME_uc');
	#print $idp->{'FACILITY_NAME'},"\n";
    #my $idp = SC->dbh->fetchrow_hashref($sth_lookup_facility, undef,
    #    $external_id);
    #my $idp = $sth->selectcol_arrayref('NAME_uc');
    if (defined $idp) {
        return $idp;
    } else {
        return ;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub lookup_facility_fragility {
    my ($external_id) = @_;
	$sth_facility_fragility->execute($external_id);
	my $idp = $sth_facility_fragility->fetchrow_hashref('NAME_uc');
    if (defined $idp) {
        return $idp;
    } else {
        return ;       # not found
    }
}


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

__END__

=head1 NAME

manage_facility - ShakeCast Facility import tool

=head1 DESCRIPTION

The B<manage_facility> utility is used to insert or update facility data in ShakeCast.
It reads data from one or more CSV format files.

=head2 Modes of operation

=over 4

=item insert

New facility records are inserted.  It is an error for the facility to
already exist; if it does the input record is skipped.

=item replace

New records are inserted.  If there is an existing facility it is first
deleted, along with any associated attributes and fragility levels.
All required facility fields must be supplied.

=item skip

New facility records are inserted.  Records for existing facilities are
skipped without generating an error.  The summary report will indicate
how many records were skipped.

=item update

Updates existing facilities.  If the facility does not already exist
an error is issued and the record is skipped.

In this mode the only required fields are C<EXTERNAL_FACILITY_ID> and
C<FACILITY_TYPE>.  Any group values are simply added to the existing
set of attributes for the facility, unless the new value matches an existing
value, in which case the group value is skipped.  For metrics, any metric
that appears in the input will be completely replaced.

=back

=head1 File Format

B<manage_facility> reads from one or more CSV-formatted files.
By default fields are separated by commas and field values that
include commas are protected by enclosing them in qootes, but
these defaults can be modified; see the B<--quote> and B<--separator>
options below.

The first record in the input file must contain column headers.
These headers tell manage_facility how to interpret the rest of the records.
Each header field must specify a facility field, a facility metric field,
or a group field.
The header fields are case-insensitive; C<facility_name> and C<FACILITY_NAME>
are equivalent.
Fields can appear in any order.

=over

=item Facility Fields

The following facility names are recognized.
These field correspond to tables and columns in the ShakeCast database.
Please refer to the  ShakeCast Database Description for a more detailed
description  of the structure of the ShakeCast Database.

=over

=item external_facility_id (Text(32), required always)

This field identifies the facility.
It must be unique for a facility type but the same external_facility_id
may be used for different types of facilities.

=item facility_type (Text(10), required always)

This field identifies the type of facility.
It must match one of the types in the C<facility_type> table.

Currently defined types are:
BRIDGE,
CAMPUS,
CITY,
COUNTY,
DAM,
DISTRICT,
ENGINEERED,
INDUSTRIAL,
MULTIFAM,
ROAD,
SINGLEFAM,
STRUCTURE,
TANK,
TUNNEL,
UNKNOWN.

=item facility_name (Text(128), required for insert/replace)

The value of this field is what the user sees.

=item short_name (Text(10), optional)

The value of this field is used by ShakeCast when a shorter version
of the name is needed due to space limitations in the output.

=item description (Text(255), optional)

You can use this field to include a short description of the facility.

=item lat (Float, required for insert/replace)

Specifies the latitude of the facility in degrees and fractional degrees.

=item lon (Float, required for insert/replace)

Specifies the longitude of the facility in degrees and fractional degrees.

=back

=item Fragility Fields

Each field beginning with C<METRIC:> is taken to be a facility fragility
specifier.  The format of a fragility specifier is:

B<METRIC:>I<metric-name>B<:>I<damage-level>

where I<metric-name> is a valid Shakemap metric
(MMI, PGV, PGA, PSA03, PSA10, or PSA30)
and I<damage-level> is a valid damage level (GREEN, YELLOW, or RED).
Examples of Facility Fragility column labels are C<METRIC:MMI:RED>
and C<metric:pga:yellow>.

The metric-name values are defined by the ShakeMap system,
and are generally not changed.
The above values are current as of summer 2004.
The damage-level values show above are the default values shipped with
ShakeCast.
These values are defined in your local ShakeCast database, and you may use
SQL or a program to change those values and the color-names that refer to them.

=item Attribute Fields

A facility can have attributes associated with it.
These attributes can be used to group and filter facilities.

Each field beginning with C<ATTR:> is taken to be a facility attribute
specifier.  The format of a facility attribute specifier is:

B<ATTR:>I<attribute-name>B<:>I<attribute-value>

where I<attribute-name> is a string not more than 20 characters in length.

Examples of Facility Attribute column labels are C<ATTR:COUNTY>
and C<ATTR:Construction>.
Attribute values can be any string up to 30 characters long.

=back

=head1 Invocation

  manage_facility [ mode ] [ option ... ] file.csv [ file2.csv ... ]

One or more files must be given on the command line.
Multiple files can have different formats.

Mode is one of C<--insert>, C<--replace>, C<--update>, or C<--skip>.
C<manage_facility> will operate in C<replace> mode if you do not specify a mode.

Options:

=over 4

=item --verbose

Display more detailed information about the progress of the import.
This option may be repeated to increase detail further.

=item --help

Print a synopsis of program usage and invocation options

=item --limit=I<n>

Terminate the import after B<I<n> > errors in input records.
Set to 0 to allow an unlimited number of errors.

This limit only applies to errors encountered when processing a data
record from the input file.
More serious errors, such as omitting a required field, will always
cause the entire input file to be skipped.

=item --quote=I<x>

Use I<x> as the quote character in the input file.
The default quote character is a quote C<(B<">)>.
This character is also used as the escape character within a quoted string.

=item --separator=I<x>

Use I<x> as the field separator character in the input file.
The default separator character is a comma C<(B<,>)>.

=back

=head1 Examples

=head2 Example 1 -- Point Facilities

Assume we have a file named F<ca_cities.csv> containing California cities
that we want to load into into ShakeCast.
The file is in CSV format and includes the name of each city
and the lat/lon of its city center or city hall.
Records in the file are of the form

  Rancho Cucamonga,34.1233,-117.5794
  Pasadena,34.1561,-118.1318

The file is missing two required fields, C<external_facility_id>
and C<facility_type>.
Since the city name is unique we can add a new column that is a copy
of the name column and use that as the external_facility_id.
Another column containing the value C<CITY> for each row
is added for the facility_type.
You can either make these changes using a spreadsheet program or
with a simple script written in a text processing language like Perl.

After making these modifications the records look like

  CITY,Rancho Cucamonga,Rancho Cucamonga,34.1233,-117.5794
  CITY,Pasadena,Pasadena,34.1561,-118.1318

The input file also needs a header record; after adding one the input file
looks like

  FACILITY_TYPE,EXTERNAL_FACILITY_ID,FACILITY_NAME,LAT,LON
  CITY,Rancho Cucamonga,Rancho Cucamonga,34.1233,-117.5794
  CITY,Pasadena,Pasadena,34.1561,-118.1318
   ...

The facilities in this file can now be loaded into ShakeCast using
the command

  manage_facility ca_cities.csv

=head2 Example 2 -- Fragility parameters

It is easy to load fragility parameters for your facilities using B<manage_facility>.
Building on the previous example, assume a simple model where Instrumental
Intensity (MMI) above 6 corresponds to likely damage (RED), MMI between 2 and 6
corresponds to possible damage (YELLOW), and MMI below 2 corresponds to
little chance of damage (GREEN).
The lower threshold of each range (1, 2, 6) is appended to every record in
the input file and the header record is changed to reflect the added fields:

  FACILITY_TYPE,EXTERNAL_FACILITY_ID,FACILITY_NAME,LAT,LON, \
        METRIC:MMI:GREEN,METRIC:MMI:YELLOW,METRIC:MMI:RED
  CITY,Rancho Cucamonga,Rancho Cucamonga,34.1233,-117.5794,1,2,6
  CITY,Pasadena,Pasadena,34.1561,-118.1318,1,2,6
   ...

Import this file as before.  New facility data will replace existing ones.

=head2 Example 3 -- Facility attibutes

If your organizaton has a large number of facilities it can be
difficult for users to configure notifications for them.
Without some way to filter out uninteresting facilities the user is
forced to select from the entire set.
By adding facility attributes you can simplify this task.
The user can then filter the list of all facilities, showing only those with
specific values of an attribute.
In our California cities example, assume that we know which county each
city lies within.
We can add the C<COUNTY> attribute and populate it with the appropriate
value for each city.

One way to add this attribute would be to again modify the F<ca_cities.csv>
input file and reload the city facilities.
However, we can also choose to update the existing facility data in ShakeCast.
In this case we only need to specify the facility_type, external_facility_id,
and any fields we want to update.
The input file to update cities to add the County attribute would look like

  FACILITY_TYPE,EXTERNAL_FACILITY_ID,ATTR:COUNTY
  CITY,Rancho Cucamonga,San Bernardino
  CITY,Pasadena,Los Angeles
   ...

This file would be loaded using the command

  manage_facility --update city_county.csv

=head2 Example 4 -- Multiple Attributes and Multiple Metrics

You can include multiple
attributes, multiple metrics, or multiple attributes and multiple
metrics for each row of an import file.
For
example, a more complicated version of the above example might be:

  FACILITY_TYPE,EXTERNAL_FACILITY_ID,ATTR:COUNTY, ATTR:SIZE,\
        METRIC:MMI:GREEN, METRIC:MMI:YELLOW, METRIC:MMI:RED
  CITY,Rancho Cucamonga,San Bernardino,Small,1,2,6
  CITY,Pasadena,os Angeles,Medium,1,2,6

This file would be loaded using the command

  manage_facility --update city_county.csv

The above example
updates the existing city locations to associate them with a county
attribute and a size attribute, and defines the green, yellow, and red
shaking thresholds.&nbsp; Users wishing to receive notifications for
those cities may use the Size or County attributes to filter the list
of requested cities when they fill in the ShakeCast notification
request form.



