#!/usr/local/bin/perl

# $Id: manage_group.pl 423 2008-08-14 16:25:23Z klin $

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

use Data::Dumper;
use Getopt::Long;
use IO::File;
use Text::CSV_XS;
use Config::General;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use Graphics_2D;


sub epr;
sub vpr;
sub vvpr;

my %options = (
    'insert'    => 0,
    'update'    => 0,
    'delete'    => 0,	
    'verbose'   => 0,
    'help'      => 0,
);

my $csv;
my $fh;

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
    'RED'       => 2
);
# map array index to damage level
my @damage_levels = (
    'GREEN',
    'YELLOW',
    'RED'
);

my $sth_list_facility;
my $sth_ins_geom_facility;
my $sth_ins_geom_profile;
my $sth_lookup_profile;
my $sth_lookup_profile_id;
my $sth_lookup_group_id;
my $sth_ins_geom_fac_profile;
my $sth_del_notification_request;
my $sth_del_profile_notification_request;
my $sth_del_geometry_facility_profile;
my $sth_del_geometry_profile;
my $sth_lookup_poly;

my $sth_lookup_shakemap;
my $sth_lookup_grid;
my $sth_lookup_product;
my $sth_resend;
my $sth_del_event;
my $sth_del_shakemap;
my $sth_del_shakemap_metric;
my $sth_del_grid;
my $sth_del_product;
my $sth_del_facility_shaking;

my $sth_lookup_facility;
my $sth_ins;
my $sth_repl;
my $sth_upd;
my $sth_del;
my $sth_ins_metric;
my $sth_del_metrics;
my $sth_del_one_metric;
my $sth_ins_attr;
my $sth_del_attrs;
my $sth_del_specified_attrs;
my $sth_del_notification;
my $sth_ins_shakecast_user;
my $sth_del_shakecast_user;
my $sth_ins_user_delivery_method;
my $sth_ins_facility_notification_request;
my $sth_del_facility_notification_request;

my $sub_ins_upd;


GetOptions(
    \%options,

    'insert',           # error for existing facilities
    'replace',          # replace existing facilities
    'update',           # update existing facilities
    'delete',           # delete existing facilities	#kwl 20061024
    'poly=s',           # delete existing facilities	#kwl 20061024
    
    'verbose+',         # repeat for more verbosity
    'help',             # print help and exit
    
    'conf=s'			# specify alternate quote char (default is ")

) or usage(1);
#usage(1) unless scalar @ARGV;

my $config_file = (exists $options{'conf'} ? 
	$options{'conf'} : "$FindBin::Bin/../conf/profile.conf");

my $conf = new Config::General($config_file);
my %config = $conf->getall 
	or die "could not initialize Config: $@";
	
use constant M_INSERT  => 1;
use constant M_REPLACE => 2;
use constant M_UPDATE  => 3;
use constant M_DELETE    => 4;	
use constant M_POLY    => 5;	
my $mode = 0;

$mode = M_INSERT   if $options{'insert'};
$mode = M_UPDATE   if $options{'update'};
$mode = M_DELETE     if $options{'delete'};	
$mode = M_POLY     if $options{'poly'};	

SC->initialize;

$sth_list_facility = SC->dbh->prepare(qq{
    select facility_id, lon_min, lat_min
      from facility});

$sth_ins_shakecast_user = SC->dbh->prepare(qq{
    insert into shakecast_user (username, user_type) 
	  values (?, 'GROUP')});

$sth_ins_user_delivery_method = SC->dbh->prepare(qq{
    insert into user_delivery_method (shakecast_user, delivery_method, delivery_address) 
	  select ?,delivery_method,'localhost' from delivery_method});

$sth_ins_facility_notification_request = SC->dbh->prepare(qq{
    insert into facility_notification_request (facility_id, notification_request_id) 
	  (select gfp.facility_id, nr.notification_request_id 
	  from geometry_facility_profile gfp inner join geometry_profile gp 
	  on gfp.profile_id = gp.profile_id inner join shakecast_user su 
	  on gp.profile_name = su.username inner join notification_request nr 
	  on nr.shakecast_user = su.shakecast_user where su.shakecast_user = ?)});

$sth_del_facility_notification_request = SC->dbh->prepare(qq{
    delete fnr from facility_notification_request fnr inner join notification_request nr 
	  on fnr.notification_request_id = nr.notification_request_id inner join
	  shakecast_user su on nr.shakecast_user = su.shakecast_user 
	  where su.shakecast_user = ?});

$sth_ins_geom_facility = SC->dbh->prepare(qq{
    insert into geometry_facility (facility_id, geom) 
	  values (?, GeomFromText(?))});

$sth_ins_geom_profile = SC->dbh->prepare(qq{
    insert into geometry_profile (profile_name, description, geom) 
	  values (?, ?, ?)});

$sth_ins_geom_fac_profile = SC->dbh->prepare(qq{
    insert into geometry_facility_profile 
	  (FACILITY_ID, PROFILE_ID) select ?, PROFILE_ID
	  from geometry_profile where PROFILE_NAME = ?});

$sth_lookup_profile = SC->dbh->prepare(qq{
    select f.facility_id, f.lon_min, f.lat_min, f.facility_type
      from facility f, geometry_profile p
     where f.lon_max < ? and f.lon_min > ?
	 and f.lat_max < ? and f.lat_min > ?
	 and p.profile_name = ? });

$sth_lookup_poly = SC->dbh->prepare(qq{
    select f.facility_id, f.lon_min, f.lat_min, f.facility_name, f.facility_type
      from facility f
     where f.lon_max < ? and f.lon_min > ?
	 and f.lat_max < ? and f.lat_min > ?});

$sth_lookup_profile_id = SC->dbh->prepare(qq{
    select profile_id
      from geometry_profile
     where profile_name = ?});

$sth_lookup_group_id = SC->dbh->prepare(qq{
    select shakecast_user
      from shakecast_user
     where username = ?});

$sth_del_profile_notification_request = SC->dbh->prepare(qq{
    delete from profile_notification_request
     where profile_id = ?});

$sth_del_notification_request = SC->dbh->prepare(qq{
    delete from notification_request
     where shakecast_user = ?});

$sth_del_geometry_profile = SC->dbh->prepare(qq{
    delete from geometry_profile
     where profile_id = ?});

$sth_del_geometry_facility_profile = SC->dbh->prepare(qq{
    delete from geometry_facility_profile
     where profile_id = ?});

$sth_del_shakecast_user = SC->dbh->prepare(qq{
    delete from shakecast_user
     where shakecast_user = ?});

#$sth_lookup_profile = SC->dbh->prepare(qq{
#    select f.facility_id
#      from geometry_facility f, geometry_profile p
#     where MBRContains(p.geom, f.geom) 
#	 and p.profile_name = ? });

$sth_lookup_facility = SC->dbh->prepare(qq{
    select f.facility_id
      from geometry_facility f, geometry_profile p
     where MBRContains(p.geom, f.geom) 
	 and p.profile_name = ? });

$sth_lookup_shakemap = SC->dbh->prepare(qq{
    select shakemap_id
      from shakemap
     where event_id = ? order by shakemap_version desc});

$sth_lookup_grid = SC->dbh->prepare(qq{
    select g.grid_id
      from (grid g
	  inner join shakemap s on g.shakemap_id = s.shakemap_id)
     where s.event_id = ? order by g.shakemap_version desc});

$sth_lookup_product = SC->dbh->prepare(qq{
    select p.product_id
      from (product p
	  inner join shakemap s on p.shakemap_id = s.shakemap_id)
     where s.event_id = ?});

$sth_resend = SC->dbh->prepare(qq{
    update notification
	 set delivery_status = 'PENDING'
     where grid_id = ?});

$sth_del_event = SC->dbh->prepare(qq{
    delete from event
     where event_id = ?});

$sth_del_shakemap = SC->dbh->prepare(qq{
    delete from shakemap
     where shakemap_id = ?});

$sth_del_shakemap_metric = SC->dbh->prepare(qq{
    delete from shakemap_metric
     where shakemap_id = ?});

$sth_del_grid = SC->dbh->prepare(qq{
    delete from grid
     where shakemap_id = ?});

$sth_del_product = SC->dbh->prepare(qq{
    delete from product
     where shakemap_id = ?});

$sth_del = SC->dbh->prepare(qq{
    delete from facility
     where facility_id = ?});

$sth_del_metrics = SC->dbh->prepare(qq{
    delete from facility_fragility
     where facility_id = ?});

$sth_del_notification = SC->dbh->prepare(qq{
    delete from facility_notification_request
     where facility_id = ?});

$sth_del_one_metric = SC->dbh->prepare(qq{
    delete from facility_fragility
     where facility_id = ?
       and metric = ?});

$sth_ins_metric = SC->dbh->prepare(qq{
    insert into facility_fragility (
           facility_id, damage_level,
           low_limit, high_limit, metric)
    values (?,?,?,?,?)});

$sth_ins_attr = SC->dbh->prepare(qq{
    insert into facility_attribute (
           facility_id, attribute_name, attribute_value)
    values (?,?,?)});

$sth_del_attrs = SC->dbh->prepare(qq{
    delete from facility_attribute
     where facility_id = ?});

$csv = Text::CSV_XS->new({
        'quote_char'  => $options{'quote'},
        'escape_char' => $options{'quote'},
        'sep_char'    => $options{'separator'}
 });

if ($mode == M_POLY) {
	process_poly($options{'poly'});
} else {
	foreach my $profile (keys %config) { 
    vpr "Processing $profile";
    process($profile);
}
}
exit;

    
sub process {
	my ($profile_name) = @_;
	#my @polygon = split /\s+/, $config{$profile_name}{'POLY'};
    my $event_id;

    my $err_cnt = 0;
    my $nrec = 0;
    my $nins = 0;
    my $fnins = 0;
    my $ndel = 0;
    my $nupd = 0;
    my $nrepl = 0;
    my $nskip = 0;
	my $sql;
	my $group_id = lookup_group_id($profile_name);
	$group_id = insert_group_id($profile_name) if ($group_id <= 0);
	my $profile_id = lookup_profile_id($profile_name);
	my @fac_types;
	my $profile_description;
	$profile_description =  $config{$profile_name}{'DESCRIPTION'} 
		if (defined $config{$profile_name}{'DESCRIPTION'});
	
	if (defined $config{$profile_name}{'FACILITY_TYPE'}) {
		@fac_types =  split /[\s\t\n]+/, $config{$profile_name}{'FACILITY_TYPE'};
	}
	
	if ($group_id < 0) {
		# error looking up ID
		$err_cnt++;
    } elsif ($group_id == 0) {
		# new profile
		if ($mode == M_UPDATE or $mode == M_DELETE) {
			# update requires the record to already exist
			epr "$profile_name does not exist";
			$err_cnt++;
			return 0;
		} 
		eval {
			my $polygon = load_geometry($profile_name);
			my $result = $sth_ins_geom_profile->execute($profile_name, $profile_description,
				join (',', split /[\s\t\n]+/, $config{$profile_name}{'POLY'}));
			my $profile = lookup_profile($profile_name, $polygon);
			return 0 unless $profile;
			
			vpr "$profile_name :";
			$nins += creae_notification_profile($profile_name);
			$profile_id = lookup_profile_id($profile_name);
			if ($profile_id < 0) {
				$err_cnt++;
				next;
			} elsif ($profile_id == 0) {
				epr "lookup failed after insert of $profile_name";
				$err_cnt++;
				next;
			}

			while (@$profile) {
				my $facility = shift @$profile;
				my $lon = shift @$profile;
				my $lat = shift @$profile;
				my $fac_type = shift @$profile;
				next unless ($polygon->{POLY}->crossingstest([$lon, $lat]));
				if (scalar @fac_types) {
					next unless grep { /$fac_type/i } @fac_types;
					#vpr "$facility, $lon, $lat, $fac_type\n";
				}
				$sth_ins_geom_fac_profile->execute($facility, $profile_name);
				$fnins++;
			}
				$group_id = lookup_group_id($profile_name);
				my $rc = $sth_ins_facility_notification_request->execute($group_id)
					if (scalar @fac_types);
		};
	} else {
		if ($mode == M_INSERT) {
			# insert requres that the record NOT exist
			epr "$profile_name already exists";
			$err_cnt++;
			next;
		} elsif ($mode == M_DELETE) {
			eval {
				$sth_del_facility_notification_request->execute($group_id);
				$sth_del_notification_request->execute($group_id);
				$sth_del_profile_notification_request->execute($profile_id);
				$sth_del_geometry_facility_profile->execute($profile_id);
				$sth_del_geometry_profile->execute($profile_id);
				$sth_del_shakecast_user->execute($group_id);
				$ndel++;
			};
		} else {
			eval {
				$sth_del_facility_notification_request->execute($group_id);
				$sth_del_notification_request->execute($group_id);
				$sth_del_profile_notification_request->execute($profile_id);
				$sth_del_geometry_facility_profile->execute($profile_id);
				$sth_del_geometry_profile->execute($profile_id);

				vpr "$profile_name :";
				#vpr @{$config{$profile_name}{'NOTIFICATION'}},"\n";
				$nins += creae_notification_profile($profile_name);

				my $polygon = load_geometry($profile_name);
				my $result = $sth_ins_geom_profile->execute($profile_name, $profile_description,
					join (',', split /[\s\t\n]+/, $config{$profile_name}{'POLY'}));
				my $profile = lookup_profile($profile_name, $polygon);
				return unless $profile;
				
				$profile_id = lookup_profile_id($profile_name);
				if ($profile_id < 0) {
					$err_cnt++;
					next;
				} elsif ($profile_id == 0) {
					epr "lookup failed after insert of $profile_name";
					$err_cnt++;
					next;
				}
	
				while (@$profile) {
					my $facility = shift @$profile;
					my $lon = shift @$profile;
					my $lat = shift @$profile;
					my $fac_type = shift @$profile;
					next unless ($polygon->{POLY}->crossingstest([$lon, $lat]));
					if (scalar @fac_types) {
						next unless grep { /$fac_type/i } @fac_types;
						#vpr "$facility, $lon, $lat, $fac_type\n";
					}
					$sth_ins_geom_fac_profile->execute($facility, $profile_name);
					$fnins++;
				}
				$group_id = lookup_group_id($profile_name);
				my $rc = $sth_ins_facility_notification_request->execute($group_id)
					if (scalar @fac_types);

				if ($@) {
					epr $@;
					$err_cnt++;
				}
			};
		}
		
	}
    vpr "$nrec records processed ($nins inserted, $nupd updated, $ndel deleted, $err_cnt rejected). $fnins facilities affected.";
}

sub process_poly {
	my ($profile_name) = @_;
	#my @polygon = split /\s+/, $config{$profile_name}{'POLY'};
    my $event_id;

    my $err_cnt = 0;
    my $nrec = 0;
    my $nins = 0;
    my $ndel = 0;
    my $nupd = 0;
    my $nrepl = 0;
    my $nskip = 0;
	my $sql;

	my $shakemap;
	my $grid;
	my $product;

		my $polygon = load_geometry($profile_name, 'cmd');
		my $profile = lookup_poly($polygon);
		exit unless $profile;
		
		print "Facility_ID::Latitude::Longitude::Facility Name::Facility Type\n";
		while (@$profile) {
			my $facility = shift @$profile;
			my $lon = shift @$profile;
			my $lat = shift @$profile;
			my $name = shift @$profile;
			my $type = shift @$profile;
			next unless ($polygon->{POLY}->crossingstest([$lon, $lat]));
			my $outline = join '::', ($facility,$lat,$lon,$name,$type);
			print "$outline\n";
			#print "$facility::$lon::$lat\n";
		}
}

sub creae_notification_profile {
	my ($profile_name) = @_;
	my $profile_id = lookup_group_id($profile_name);
	my $cnt = 0;
	my @notifications;
	if (ref($config{$profile_name}{'NOTIFICATION'}) eq "HASH") {
		push @notifications, $config{$profile_name}{'NOTIFICATION'};
	} else {
		@notifications = @{$config{$profile_name}{'NOTIFICATION'}};
	}
	
	foreach my $notification (@notifications) {
    # build sql
    my @keys = sort keys %{$notification};
	
    my @values;
	for (0 .. $#keys) {
		push @values, $notification->{$keys[$_]};
	}
	push @keys, 'shakecast_user';
	push @values, $profile_id;
	
    my $sql = 'insert into notification_request (' . join(',', @keys) . ') ' .
        'values (' . join(',', ('?') x scalar @keys) . ') '; 
    $sth_ins = SC->dbh->prepare($sql);
    $sth_ins->execute(@values);
	$cnt++;
	}
	return $cnt;
}


############################################################################
# Handle box lines in the config file
############################################################################
sub load_geometry {
  #----------------------------------------------------------------------
  #	@boxes = [ { 'ZONE'    => zone,
  #	             'COORDS' => [ [ lat1, lon1 ], ..., [ latN, lonN ] ],
  #                  'POLY'   => polygon_reference },
  #                  { ... }, ... ];
  #----------------------------------------------------------------------
  my ($zone, $type)   = @_;
  my ($nc, $poly, $lat, $lon, $north_b, $south_b, $east_b, $west_b);
  my $box    = {};
  my $coords = [];
  my @args;
	if (defined $type) {
		@args = split /,/, $zone;
	} else {
		@args = split /[\s\t\n]+/, $config{$zone}{'POLY'};
	}

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

sub _min {
    (defined $_[0] && (!defined $_[1] || $_[0] <= $_[1])) ? $_[0] : $_[1];
}

sub _max {
    (defined $_[0] && (!defined $_[1] || $_[0] >= $_[1])) ? $_[0] : $_[1];
}

# Return shakemap_id given event_id
sub list_facility {
    my $idp = SC->dbh->fetchall_arrayref($sth_list_facility);

    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub lookup_profile {
    my ($external_id, $box) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_profile, {Columns=>[1,2,3,4]},
        $box->{EAST}, $box->{WEST}, $box->{NORTH}, $box->{SOUTH}, $external_id);
    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub lookup_poly {
    my ($box) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_poly, {Columns=>[1,2,3,4,5]},
        $box->{EAST}, $box->{WEST}, $box->{NORTH}, $box->{SOUTH});
    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return group_id given group_name
sub lookup_group_id {
    my ($profile_name) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_group_id, undef,
        $profile_name);

    if (scalar @$idp > 1) {
        epr "multiple matching profiles for $profile_name";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

# Return group_id given group_name
sub insert_group_id {
    my ($profile_name) = @_;
    my $idp = $sth_ins_shakecast_user->execute($profile_name);

    return -1 unless ($idp);
	my $group_id = lookup_group_id($profile_name);

    my $rc = $sth_ins_user_delivery_method->execute($group_id);

	return $rc;       # not found
}

# Return profile_id given profile_name
sub lookup_profile_id {
    my ($profile_name) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_profile_id, undef,
        $profile_name);

    if (scalar @$idp > 1) {
        epr "multiple matching profiles for $profile_name";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

# Return shakemap_id given event_id
sub lookup_shakemap {
    my ($event_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_shakemap, undef,
        $event_id);

    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

sub lookup_grid {
    my ($event_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_grid, undef,
        $event_id);

    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return shakemap_id given event_id
sub lookup_product {
    my ($event_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_product, undef,
        $event_id);
    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub lookup_facility {
    my ($external_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_facility, undef,
        $external_id);
    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Read and process header, building data structures
# Returns 1 if header is ok, 0 for problems
sub process_header {
    my $err_cnt = 0;
    undef %columns;
    undef %metrics;
    undef %attrs;

    my $header = $fh->getline;
    return 1 unless $header;      # empty file not an error
    
    # parse header line
    vvpr $header;
    unless ($csv->parse($header)) {
        epr "CSV header parse error on field '", $csv->error_input, "'";
        return 0;
    }

    my $ix = 0;         # field index

    # uppercase and trim header field names
    my @fields = map { uc $_ } $csv->fields;
    foreach (@fields) {
        s/^\s+//;
        s/\s+$//;
    }
    # Field name is one of:
    #   METRIC:<metric-name>:<metric-level>
    #   GROUP:<group-name>
    #   <facility-column-name>
    foreach my $field (@fields) {
        if ($field =~ /^METRIC\s*:\s*(\w+)\s*:\s*(\w+)/) {
            vvpr "$ix\: METRIC: $1 LEVEL: $2";
            my $lx = $damage_levels{$2};
            if (defined $lx) {
                # TODO check for unknown metric names
                $metrics{$1}->[$lx] = $ix;
            } else {
                epr "metric level '$2' must be one of RED, YELLOW, or GREEN";
                $err_cnt++;
            }
        } elsif ($field =~ /^ATTR(?:IBUTE)?\s*:\s*(.*)/) {
            vvpr "$ix\: ATTR: $1";
            $attrs{$1} = $ix;
        } else {
            vvpr "$ix\: COLUMN: $field";
            # TODO check for unknown columns (either here or later on)
            $columns{$field} = $ix;
        }
        $ix++;
    }
    if ($options{'verbose'} >= 2) {
        print Dumper(%columns);
        print Dumper(%metrics);
        print Dumper(%attrs);
    }

    # check for required fields
    while (my ($req, $req_type) = each %required) {
        # relax required fields for update (only PK is mandatory)
        next if $req_type == 2 and $mode == M_UPDATE;
        unless (defined $columns{$req}) {
            epr "required field $req is missing";
            $err_cnt++;
        }
    }

    # map lat/lon to min/max
    if (exists $columns{'LAT'}) {
        $columns{'LAT_MIN'} = $columns{'LAT'};
        $columns{'LAT_MAX'} = $columns{'LAT'};
        delete $columns{'LAT'};
    }
    if (exists $columns{'LON'}) {
        $columns{'LON_MIN'} = $columns{'LON'};
        $columns{'LON_MAX'} = $columns{'LON'};
        delete $columns{'LON'};
    }
    return 0 if $err_cnt;

    # build sql
    my @keys = sort keys %columns;
    
    my $sql = 'insert into facility (' . join(',', @keys) . ') ' .
        'values (' . join(',', ('?') x scalar @keys) . ') '; 
    vvpr "insert: $sql";
    $sth_ins = SC->dbh->prepare($sql);
    
    $sql = 'update facility set '. join(',', map { qq{$_ = ?} } @keys) . 
        ' where FACILITY_ID = ?';
    vvpr "update: $sql";
    $sth_upd = SC->dbh->prepare($sql);

    $sql = 'insert into facility (' . join(',', @keys) . ',facility_id) ' .
        'values (' . join(',', ('?') x scalar @keys) . ',?) '; 
    vvpr "replace: $sql";
    $sth_repl = SC->dbh->prepare($sql);
    
    $sql = 'delete from facility_attribute where facility_id = ? ' . 
        ' and attribute_name in (' .
        join(',', map {qq{'$_'}} keys %attrs) .
        ')';
    vvpr "del some attrs: $sql";
    $sth_del_specified_attrs = SC->dbh->prepare($sql);
    
    # dynamically create a sub that takes the input array of fields and
    # returns a new list with just those fields that go into the facility
    # insert/update statement, in the proper order
    my $sub = "sub { (" .
        join(',', (map { q{$_[0]->[} . $columns{$_} . q{]} } (@keys))) .
        ') }';
    
    vvpr $sub;
    $sub_ins_upd = eval $sub;

    return 1;

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
mangae_profile -- Profile Management utility
Usage:
  mangae_profile 

};
    exit $rc;
}

