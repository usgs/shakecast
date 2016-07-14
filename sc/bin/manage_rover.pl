#!/usr/local/bin/perl

# $Id: manage_facility.pl 149 2007-09-18 20:38:21Z klin $

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

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use XML::LibXML::Simple;


sub epr;
sub vpr;
sub vvpr;


my %options = (
    'insert'    => 0,
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

# map ROVER building type
my @building_types = (
    'W1',
    'W2',
    'S1',
    'S2',
    'S3',
    'S4',
    'S5',
    'C1',
    'C2',
    'C3',
   'PC1',
   'PC2',
   'RM1',
   'RM2',
   'URM'
);

# map ROVER building height
my $building_heights = {
    'W1'	=> {'L'=>'', 'M'=>'', 'H'=>''},
    'W2'	=> {'L'=>'', 'M'=>'', 'H'=>''},
    'S1'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
    'S2'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
    'S3'	=> {'L'=>'', 'M'=>'', 'H'=>''},
    'S4'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
    'S5'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
    'C1'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
    'C2'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
    'C3'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
   'PC1'	=> {'L'=>'', 'M'=>'', 'H'=>''},
   'PC2'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
   'RM1'	=> {'L'=>'L', 'M'=>'M', 'H'=>'M'},
   'RM2'	=> {'L'=>'L', 'M'=>'M', 'H'=>'H'},
   'URM'	=> {'L'=>'L', 'M'=>'M', 'H'=>'M'}
};

# map ROVER code era
my %building_year = (
    '1975'	=> 'H',
    '1941'	=> 'M',
	'0'		=> 'P',
);

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
my $sth_del_facility_shaking;
my $sth_lookup_facility_type_fragility;
my $sub_ins_upd;
my $sth_rover_facility_type_fragility;

my $sth_lookup_user;


GetOptions(
    \%options,

    'insert',           # error for existing facilities
    'skip',             # skip existing facilities
    'replace',          # replace existing facilities
    'update',           # update existing facilities
    'delete',           # delete existing facilities	
    
    'verbose+',         # repeat for more verbosity
    'help',             # print help and exit

    'limit=n',          # max bad records allowed (0 for no limit)
    
    'rover=s',          # specify path to ROVER database

) or usage(1);
#usage(1) if (! -f $options{'rover'});
usage(1) if ($options{'help'});

usage(1) if $options{'insert'} + $options{'replace'} +
            $options{'update'} + $options{'skip'} > 1;

my $mode;
use constant M_INSERT  => 1;
use constant M_REPLACE => 2;
use constant M_UPDATE  => 3;
use constant M_SKIP    => 4;
use constant M_DELETE    => 5;	

$mode = M_REPLACE;      # default mode
$mode = M_INSERT   if $options{'insert'};
$mode = M_UPDATE   if $options{'update'};
$mode = M_SKIP     if $options{'skip'};
$mode = M_DELETE     if $options{'delete'};	

SC->initialize;

$sth_lookup_facility = SC->dbh->prepare(qq{
    select facility_id
      from facility
     where facility_name = ?});

$sth_del = SC->dbh->prepare(qq{
    delete from facility
     where facility_id = ?});

$sth_del_metrics = SC->dbh->prepare(qq{
    delete from facility_fragility
     where facility_id = ?});

$sth_del_notification = SC->dbh->prepare(qq{
    delete from facility_notification_request
     where facility_id = ?});

$sth_del_facility_shaking = SC->dbh->prepare(qq{
    delete from facility_shaking
     where facility_id = ?});

$sth_del_one_metric = SC->dbh->prepare(qq{
    delete from facility_fragility
     where facility_id = ?
       and metric = ?});

$sth_ins = SC->dbh->prepare(qq{
    insert into facility (
           facility_type, external_facility_id, facility_name,
           lat_min, lat_max, lon_min, lon_max, description)
    values (?,?,?,?,?,?,?,?)});

$sth_repl = SC->dbh->prepare(qq{
    insert into facility (
           facility_type, external_facility_id, facility_name,
           lat_min, lat_max, lon_min, lon_max, facility_id, description)
    values (?,?,?,?,?,?,?,?,?)});

$sth_upd = SC->dbh->prepare(qq{
	update facility set 
		facility_type = ?,
		external_facility_id = ?,
		facility_name = ?,
		lat_min = ?,
		lat_max = ?,
		lon_min = ?,
		lon_max = ?
		description = ?
	where FACILITY_ID = ?});

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


$sth_lookup_facility_type_fragility = SC->dbh->prepare(qq{
    select metric, damage_level, low_limit, high_limit
      from facility_type_fragility
      where facility_type = ?});
	  
$sth_rover_facility_type_fragility = SC->dbh->prepare(qq{
    select facility_type
      from facility_type_fragility
	  where damage_level = 'red'
	  order by low_limit});

$sth_lookup_user = SC->dbh->prepare(qq{
    select shakecast_user
      from shakecast_user
     where username = ?});

my $sth_lookup_not_request;
$sth_lookup_not_request = SC->dbh->prepare(qq{
    select NOTIFICATION_REQUEST_ID
      from notification_request
     where SHAKECAST_USER = ? 
		and AGGREGATION_GROUP = 'ROVER'});

my $sth_ins_not_request;
$sth_ins_not_request = SC->dbh->prepare(qq{
    insert into notification_request (
           DAMAGE_LEVEL, SHAKECAST_USER, NOTIFICATION_TYPE,
           EVENT_TYPE, DELIVERY_METHOD, AGGREGATION_GROUP)
    values (?,?,?,?,?,?)});

my $sth_ins_fac_not_request;
$sth_ins_fac_not_request = SC->dbh->prepare(qq{
    insert into facility_notification_request (
           FACILITY_ID, NOTIFICATION_REQUEST_ID)
    values (?,?)});

my $sth_lookup_user_delivery_method;
$sth_lookup_user_delivery_method = SC->dbh->prepare(qq{
    select USER_DELIVERY_METHOD_ID
      from user_delivery_method
     where SHAKECAST_USER = ? 
		and DELIVERY_ADDRESS = 'ROVER'
		and DELIVERY_METHOD = 'SCRIPT'});

my $sth_ins_user_delivery_method;
$sth_ins_user_delivery_method = SC->dbh->prepare(qq{
    insert into user_delivery_method (
           SHAKECAST_USER, DELIVERY_METHOD, DELIVERY_ADDRESS)
    values (?,?,?)});



exit    process();
;

    
sub process {
    my $err_cnt = 0;
    my $nrec = 0;
    my $nins = 0;
    my $nupd = 0;
    my $nrepl = 0;
    my $ndel = 0;
    my $nskip = 0;

	my $rover_data = rover_api();

	unless ($rover_data) {
        epr "file had errors, skipping";
        return;
    }
	
	my $scadmin = 'scadmin';
	my $shakecast_user = lookup_user($scadmin);
	print "shakecast_user: $shakecast_user\n";
	my $not_request = update_not_request($shakecast_user);
	print "not_request: ", join ':', @$not_request,"\n";
	
    while (my $colp = shift @$rover_data) {
        if ($nrec and $nrec % 100 == 0) {
            vpr "$nrec records processed";
        }
        $nrec++;
        # TODO error handling
        if ($options{'limit'} && $err_cnt >= $options{'limit'}) {
            epr "error limit reached, skipping";
            return;
        }
		
        my ($rover_id, $rover_name, $rover_num_stories, $rover_year_built, $rover_lat, 
			$rover_lon, $rover_btype_mods, $rover_sm_midrise, $rover_sm_highrise, $rover_sm_precode,
			$rover_sm_postbenchmark, $desc) = @$colp;
			
		# check for required fields
		unless (defined $rover_lat and defined $rover_lon and defined $rover_name) {
			epr "required field is missing (name: $rover_name)";
			$err_cnt++;
			next;
		}

        my $fac_id = lookup_facility($rover_name);
        my $fac_type;
		
		#print "$rover_id, $rover_name, $rover_btype_mods\n";
		if ($rover_btype_mods) {
			my (@types) = $rover_btype_mods =~ /(\d+)/g;
			my @fac_types;
			foreach my $type (@types) {
				$fac_type = $building_types[$type];
				if ($rover_sm_midrise) {
					$fac_type .= $building_heights->{$building_types[$type]}->{'M'};
				} elsif ($rover_sm_highrise) {
					$fac_type .= $building_heights->{$building_types[$type]}->{'H'};
				} else {
					$fac_type .= $building_heights->{$building_types[$type]}->{'L'};
				}
				foreach my $year (reverse sort keys %building_year) {
					if ($rover_year_built && ($rover_year_built >= $year) ) {
						$fac_type .= $building_year{$year};
						last;
					}
				}
				push @fac_types, $fac_type;
			}
			$fac_type = choose_facility_type(\@fac_types);
		}
		
		#print "facility $rover_id, $rover_name, $fac_type, $rover_lat, $rover_lon\n";
		
        if ($fac_id < 0) {
            # error looking up ID
            $err_cnt++;
            next;
        } elsif ($fac_id == 0) {
            # new record
            if ($mode == M_UPDATE or $mode == M_DELETE) {
                # update requires the record to already exist
                epr "$rover_btype_mods $rover_id does not exist";
                $err_cnt++;
                next;
            }
            eval {
				#  facility_type, external_facility_id, facility_name,
				#  lat_min, lat_max, lon_min, lon_max)
                $sth_ins->execute($fac_type, $rover_id, $rover_name,
					$rover_lat, $rover_lat, $rover_lon, $rover_lon, $desc);
                $nins++;
                $fac_id = lookup_facility($rover_name);
                if ($fac_id < 0) {
                    $err_cnt++;
                    next;
                } elsif ($fac_id == 0) {
                    epr "lookup failed after insert of $rover_btype_mods $rover_id";
                    $err_cnt++;
                    next;
                }
				insert_fac_not_request($fac_id, $not_request);
            };
            if ($@) {
                epr $@;
                $err_cnt++;
                next;
            }
        } else {
            # facility exists
            if ($mode == M_SKIP) {
                # silently skip existing records
                $nskip++;
                next;
            } elsif ($mode == M_INSERT) {
                # insert requres that the record NOT exist
                epr "$rover_btype_mods $rover_id already exists";
                $err_cnt++;
                next;
            } elsif ($mode == M_REPLACE) {
                # replace both the facility and all fragilities and attributes
                $sth_del_metrics->execute($fac_id);
                $sth_del_attrs->execute($fac_id);
                $sth_del_notification->execute($fac_id);
                $sth_del_facility_shaking->execute($fac_id);
                eval {
                    $sth_del->execute($fac_id);
					$sth_repl->execute($fac_type, $rover_id, $rover_name,
						$rover_lat, $rover_lat, $rover_lon, $rover_lon, $fac_id, $desc);
                    $nrepl++;
                };
                if ($@) {
                    epr $@;
                    $err_cnt++;
                    next;
                }
				insert_fac_not_request($fac_id, $not_request);
				
            } elsif ($mode == M_DELETE) {
                # replace both the facility and all fragilities and attributes
                $sth_del_metrics->execute($fac_id);
                $sth_del_attrs->execute($fac_id);
                $sth_del_notification->execute($fac_id);
                $sth_del_facility_shaking->execute($fac_id);
				eval {
                    $sth_del->execute($fac_id);
                    $ndel++;
                };
                if ($@) {
                    epr $@;
                    $err_cnt++;
                }
				next;
            } else {
                # update just updates the existing record
                eval {
 					$sth_upd->execute($fac_type, $rover_id, $rover_name,
						$rover_lat, $rover_lat, $rover_lon, $rover_lon, $fac_id, $desc);
                    $nupd++;
                };
                if ($@) {
                    epr $@;
                    $err_cnt++;
                    next;
                }
            }
        }
        # at this point the facility record has been either inserted or
        # updated, and $fac_id is its PK.

		$sth_del_metrics->execute($fac_id);
        unless ($mode == M_DELETE) {
			# insert default facility fragility if not defined
			my $facility_type_fragility = SC->dbh->selectcol_arrayref(
				$sth_lookup_facility_type_fragility, {Columns=>[1,2,3,4]}, $fac_type);
			while (@$facility_type_fragility) {
				my $metric = shift @$facility_type_fragility;
				my $damage_level = shift @$facility_type_fragility;
				my $low_limit = shift @$facility_type_fragility;
				my $high_limit = shift @$facility_type_fragility;
				$sth_ins_metric->execute($fac_id, $damage_level,
					$low_limit, $high_limit, $metric);
			}
        }

        #if (%attrs) {
        #    if ($mode == M_UPDATE) {
                # delete any attributes mentioned in the input file
        #        $sth_del_specified_attrs->execute($fac_id);
        #    }
        #    while (my ($attr, $ix) = each %attrs) {
        #        my $val = $colp->[$ix];
                # don't insert null attribute values
        #        next unless defined $val and $val ne '';
        #        $sth_ins_attr->execute($fac_id, $attr, $colp->[$ix]);
        #    }
        #}
    }
    vpr "$nrec records processed ($nins inserted, $nrepl replaced, $nupd updated, $ndel deleted, $err_cnt rejected)";
}

# Return facility_id given external_facility_id
sub lookup_facility {
    my ($external_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_facility, undef,
        $external_id);
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $external_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

# Return facility_type given a list of facility_type options
sub choose_facility_type {
    my ($facility_types) = @_;
    my $sth = SC->dbh->prepare("
		select facility_type
		  from facility_type_fragility
		  where damage_level = 'red'
		  and facility_type in ('".join("','",@$facility_types)."')
		  order by low_limit");

    $sth->execute();
	
	my $idp = $sth->fetchall_arrayref();
    if (scalar @$idp >= 1) {
        return $$idp[0]->[0];
    } else {
        return 'STRUCTURE';       # not found with generic type
    }
}

# Read and process header, building data structures
# Returns 1 if header is ok, 0 for problems
sub process_rover {
	my ($rover) = @_;
	print "ROVER $rover\n";
    my $dbargs = {AutoCommit => 0,
                  PrintError => 0};

    my $dbh = DBI->connect("dbi:SQLite:dbname=$rover","","",$dbargs);

    my $sth = $dbh->prepare("
		select b.id, b.name, b.num_stories, b.year_built, w.lat, w.lon,
			w.btype_mods, w.sm_midrise, w.sm_highrise, 
			w.sm_precode, w.sm_postbenchmark
		from building b, worksheet w
		where b.id = w.id");

    $sth->execute();
	
	print "Retrieving ROVER facility list\n";
	my $rows = $sth->fetchall_arrayref;
	#if ($dbh->err()) { die "$DBI::errstr\n"; }

    $dbh->disconnect();
	
	return $rows;

}


sub rover_api {
    my ($self) = @_;
    my ($status, $message, $rv);
    my ($USER_AGENT, %buildings);
    my $data = [];
    # avoid sucking all this in for clients that don't need to send messages
    require LWP::UserAgent;
    my $server = 'http://' . SC->config->{'ROVER'}->{'Server'};
    my $screener = SC->config->{'ROVER'}->{'Screener'};
    my $pw = SC->config->{'ROVER'}->{'PW'};
    my $url = "$server/Rover/api/get_building_ids?screener=$screener&pw=$pw";
    #SC->log(3, "server->send($url)");
    my $ua = new LWP::UserAgent();
    $ua->agent($USER_AGENT);
	$ua->proxy(['http'], SC->config->{'ProxyServer'})
		if (defined SC->config->{'ProxyServer'});

    my $resp = $ua->get($url);
    #SC->log(3, "response:", $resp->status_line);
    return unless ($resp->is_success);
    my @lines = split "\n", $resp->content;
    #print @lines;
    foreach my $line (@lines) {
      next unless ($line =~ /<li>/i);
      my ($building_id, $building_name) = $line =~ /<li>(\d+)\.\s+(.*?)<\/li>/;
      #print "$building_id, $building_name\n";
      $buildings{$building_id} = $building_name;
    }
    foreach my $building_id (sort keys %buildings) {
      $url = "$server/Rover/api/get_building?screener=admin&pw=rover&id=$building_id&info=identity,location,design";
      $resp = $ua->get($url);
      next unless ($resp->is_success);
      #print "$building_id -> $buildings{$building_id}\n";
      #print "$url\n";

      my $building = XMLin($resp->content);
	  #print Dumper($building);
      my ($building_type);
      my $year_built = (ref $building->{Design}->{year_built} eq 'HASH') ? 
	0 : $building->{Design}->{year_built};
      my $num_stories = (ref $building->{Design}->{num_stories} eq 'HASH') ? 
	 0 : $building->{Design}->{num_stories};
      my $latitude = (ref $building->{Location}->{latitude} eq 'HASH') ? 
	 0 : $building->{Design}->{latitude};
      my $longitude = (ref $building->{Location}->{longitude} eq 'HASH') ? 
	 0 : $building->{Design}->{longitude};
      my $desc = $building->{Location}->{address}.', '.$building->{Location}->{city}
	.', '.$building->{Location}->{state}.' '.$building->{Location}->{zipcode};
      foreach my $type (keys %{$building->{Design}->{buildingtype}}) {
	next unless ($building->{Design}->{buildingtype}->{$type} =~ /false/i);
	$building_type = $type;
      }

      my $building_name = $building_type.'_'.$building_id
	.'_'.$building->{Identity}->{name};
      $building_name =~ s/\s+/_/g;
      $building_name =~ s/_+/_/g;
      my ($sm_midrise, $sm_highrise, $sm_precode, $sm_postbenchmark);
      if ($num_stories > 7) {
	$sm_highrise = 'true';
      } elsif ($num_stories > 4) {
	$sm_midrise = 'true';
      }
      my $building_data = [ $building_id, 
	 $building_name, 
	 $num_stories, 
	 $year_built, 
	 $latitude, 
	 $longitude,
	 $building_type, 
	 $sm_midrise, 
	 $sm_highrise, 
	 undef, 
	 undef,
	 $desc
      ];
      next unless (defined $building_id and defined $building_name
      	and ($latitude != 0 and $longitude != 0));
      push @$data, $building_data;


      #print "Building Type: $building_type\n";
      #print "Year Built: $year_built\n";
      #print "Num Stories: $num_stories\n";
      #print "Latitude: $latitude\n";
      #print "Longitude: $longitude\n";
      #print "Building Name: $building_name\n";
      #print "Desc: $desc\n";
    }

    return $data;
}


# Return shakecast_user given external_shakecast_user name
sub lookup_user {
    my ($external_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_user, undef,
        $external_id);
    if (scalar @$idp > 1) {
        epr "multiple matching shakecast users for $external_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

# Return shakecast_user given external_shakecast_user name
sub update_not_request {
    my ($shakecast_user) = @_;
	
	my $not_delivery_method = lookup_user_delivery_method($shakecast_user);
	
	if (!$not_delivery_method) {
		$sth_ins_user_delivery_method->execute($shakecast_user, 'SCRIPT',
			'ROVER');
	}

	my $not_request = lookup_not_request($shakecast_user);
	
	if (!$not_request) {
		$sth_ins_not_request->execute('RED', $shakecast_user, 'DAMAGE',
			'ALL', 'SCRIPT', 'ROVER');
		$sth_ins_not_request->execute('YELLOW', $shakecast_user, 'DAMAGE',
			'ALL', 'SCRIPT', 'ROVER');
		$sth_ins_not_request->execute('GREEN', $shakecast_user, 'DAMAGE',
			'ALL', 'SCRIPT', 'ROVER');

		$not_request = lookup_not_request($shakecast_user);
	}

	return $not_request;
}

# Return shakecast_user given external_shakecast_user name
sub lookup_user_delivery_method {
    my ($shakecast_user) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_user_delivery_method, undef,
        $shakecast_user);
    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return shakecast_user given external_shakecast_user name
sub lookup_not_request {
    my ($shakecast_user) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_not_request, undef,
        $shakecast_user);
    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return shakecast_user given external_shakecast_user name
sub insert_fac_not_request {
    my ($facility_id, $not_request) = @_;
	
	foreach my $request (@$not_request) {
		$sth_ins_fac_not_request->execute($facility_id, $request);
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
manage_rover -- ROVER Facility Import utility
Usage:
  manage_rover --rover rover_db [ mode ] [ option ... ]

Required:
	--rover=s	Specify the ROVER DB file to retrieve facility information
	
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
};
    exit $rc;
}

