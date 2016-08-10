#!/usr/local/bin/perl

# $Id: manage_event.pl 262 2008-01-11 20:31:33Z klin $

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
use File::Path;
use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;


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


my $sth_lookup_shakemap;
my $sth_lookup_grid;
my $sth_lookup_product;
my $sth_resend;
my $sth_del_event;
my $sth_del_facility_model_shaking;
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
my $sth_lookup_event;
my $sth_upd_archive_evt;
my $sth_lookup_archive_sm;
my $sth_lookup_maintain_sm;
my $sth_lookup_maintain_evt;
my $sth_del_maintain_eq;
my $sth_lookup_facshake;
my $sub_ins_upd;



GetOptions(
    \%options,

    'resend',           # resend notification
    'realert',           
    'delete',           # delete existing events
    'maintain',           # delete existing events
    
    'verbose+',         # repeat for more verbosity
    'help'				# print help and exit


) or usage(1);
#usage(1) unless scalar @ARGV;


my $mode;
use constant M_RESEND  => 1;
use constant M_DELETE    => 2;	

$mode = M_RESEND   if $options{'resend'};
$mode = M_RESEND   if $options{'realert'};
$mode = M_DELETE     if ($options{'delete'} || $options{'maintain'});	

exit unless (SC->initialize());
my $time_window = (SC->config->{'rss'}->{'TIME_WINDOW'}) ? 
	(SC->config->{'rss'}->{'TIME_WINDOW'}) * 2 : 7;

my $archive_mag = (SC->config->{'ARCHIVE_MAG'}) ? 
	(SC->config->{'ARCHIVE_MAG'}) : 0;

$sth_lookup_facshake = SC->dbh->prepare(qq{
    select count(fs.grid_id)
      from (grid g
	  inner join facility_shaking fs on g.grid_id = fs.grid_id)
     where g.shakemap_id = ? });

$sth_lookup_archive_sm = SC->dbh->prepare(qq{
    select distinct g.shakemap_id
      from ((grid g
	  inner join shakemap s on g.shakemap_id = s.shakemap_id)
	  inner join event e on e.event_id = s.event_id)
     where datediff(?, s.receive_timestamp) <= ? 
		and e.event_type = 'ACTUAL' 
		and e.magnitude >= ? });

$sth_upd_archive_evt = SC->dbh->prepare(qq{
    update event
	set major_event = 1
     where event_id = ? });

$sth_lookup_maintain_sm = SC->dbh->prepare(qq{
    select distinct g.shakemap_id
      from ((grid g
	  inner join shakemap s on g.shakemap_id = s.shakemap_id)
	  inner join event e on e.event_id = s.event_id)
     where datediff(?, s.receive_timestamp) > ? 
		and e.event_type = 'ACTUAL' 
		AND e.major_event is NULL });

$sth_lookup_maintain_evt = SC->dbh->prepare(qq{
    select distinct event_id
	 from event
     where datediff(?, receive_timestamp) > ?
		AND event_type = 'ACTUAL'
		AND event_id NOT
		IN (
			SELECT s.event_id
			FROM ((shakemap s inner join grid g on g.shakemap_id = s.shakemap_id and 
				g.shakemap_version = s.shakemap_version )
				inner join facility_shaking fs on g.grid_id = fs.grid_id)) });

$sth_del_maintain_eq = SC->dbh->prepare(qq{
    delete from event
     where datediff(?, receive_timestamp) > ?
		AND event_id NOT
		IN (
			SELECT s.event_id
			FROM ((shakemap s inner join grid g on g.shakemap_id = s.shakemap_id and 
				g.shakemap_version = s.shakemap_version )
				inner join facility_shaking fs on g.grid_id = fs.grid_id)) });

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

$sth_del_facility_model_shaking = SC->dbh->prepare(qq{
    delete fms from facility_model_shaking fms inner join event e
	 on fms.seq = e.seq
     where e.event_id = ?});

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

$sth_lookup_facility = SC->dbh->prepare(qq{
    select facility_id
      from facility
     where external_facility_id = ?
       and facility_type = ?});

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

my $data_root =  SC->config->{'DataRoot'};
my @shakemaps = @ARGV;

if ($options{'maintain'}) {
	my $dir = "$data_root/eq_product";
	opendir(DIR, $dir) or die $!;
	while (my $eqdir = readdir(DIR)) {
		next unless (-d "$dir/$eqdir");
		next if lookup_shakemap($eqdir);
		my $mtime = (stat("$dir/$eqdir"))[9];
		my $timestamp = (time - $mtime)/86400;
		if ($timestamp>$time_window) {
		print "Outside Timewindow No ShakeMap: $dir/$eqdir : $timestamp, $mtime\n";
		rmtree("$dir/$eqdir");
		}
	}
	closedir(DIR);
	
	opendir(DIR, $data_root) or die $!;
	while (my $eqdir = readdir(DIR)) {
		next unless (-d "$data_root/$eqdir");
		my $smdir = $eqdir;
		$eqdir =~ s/-\d+$//;
		next if (lookup_shakemap($eqdir) || $eqdir =~ /^\.|eq_product/i);
		print "ShakeMap not in database: $data_root/$eqdir $smdir\n";
		rmtree("$data_root/$smdir");
	}
	closedir(DIR);
	
	update_archive_sm();
	my $sms = lookup_maintain_sm();
	exit unless (ref $sms eq 'ARRAY');
	@shakemaps = @$sms;
}

foreach my $sm_id (@shakemaps) { 
    vpr "Processing $sm_id";
    process($sm_id);
}

if ($options{'maintain'}) {
	my $evts = lookup_maintain_evt();
	if (ref $evts eq 'ARRAY') {
		my @events = @$evts;
		foreach my $event_id (@events) {
			my $dir = "$data_root/eq_product/$event_id";
			rmtree($dir);
			vpr "Directory $dir deleted\n";
		}
		$sth_del_maintain_eq->execute(SC->time_to_ts, $time_window);
	}
}

exit;

    
sub process {
    my ($event_id) = @_;

    my $err_cnt = 0;
    my $nrec = 0;
    my $nins = 0;
    my $ndel = 0;
    my $nupd = 0;
    my $nrepl = 0;
    my $nskip = 0;
	my $sql;

	my $shakemap = lookup_shakemap($event_id);
	my $grid = lookup_grid($event_id);
	my $product = lookup_product($event_id);
	
	if ($shakemap eq "0") {
		# error looking up ID
		$err_cnt++;
	} else {
		if ($mode == M_RESEND) {
			eval {
				$sql = 'update notification set DELIVERY_STATUS = "PENDING" ' . 
					' where EVENT_ID = ? OR GRID_ID = ? ';
				if ($product ne "0")	{
					$sql .= ' OR '.join(' OR ', map { qq{PRODUCT_ID = $_} } @$product);
				}
				vvpr "update: $sql";
	
				$sth_upd = SC->dbh->prepare($sql);
				$sth_upd->execute($event_id, $$grid[0]);
				$nins++;
			};
		} elsif ($mode == M_DELETE) {
			eval {
				my ($sql_grid, $sql_prod);
				if ($grid ne "0")	{
					$sql_grid = ' OR '.join(' OR ', map { qq{GRID_ID = $_} } @$grid);
				}
				if ($product ne "0")	{
					$sql_prod = ' OR '.join(' OR ', map { qq{PRODUCT_ID = $_} } @$product);
				}
					
				$sql = 'delete from notification ' . 
					' where EVENT_ID = ? ';
				$sql .= $sql_grid if ($sql_grid);
				$sql .= $sql_prod if ($sql_prod);
				vvpr "delete: $sql";
				$sth_upd = SC->dbh->prepare($sql);
				$sth_upd->execute($event_id);
				
				if ($sql_grid) {
					$sql = 'delete from facility_shaking where '.
					  join(' OR ', map { qq{GRID_ID = $_} } @$grid);
					vvpr "delete: $sql";
					$sth_upd = SC->dbh->prepare($sql);
					$sth_upd->execute();

					$sql = 'delete from facility_fragility_probability where '.
					  join(' OR ', map { qq{GRID_ID = $_} } @$grid);
					vvpr "delete: $sql";
					$sth_upd = SC->dbh->prepare($sql);
					$sth_upd->execute();

					$sql = 'delete from station_shaking where '.
					  join(' OR ', map { qq{GRID_ID = $_} } @$grid);
					vvpr "delete: $sql";
					$sth_upd = SC->dbh->prepare($sql);
					$sth_upd->execute();
				}

                $sth_del_facility_model_shaking->execute($event_id);
                $sth_del_event->execute($event_id);
                $sth_del_shakemap->execute($event_id);
                $sth_del_shakemap_metric->execute($event_id);
                $sth_del_grid->execute($event_id);
                $sth_del_product->execute($event_id);
				$ndel++;
				my @dir_list = <$data_root/$event_id*>;
				foreach my $dir (@dir_list) {
					rmtree($dir);
					vpr "Directory $dir deleted\n";
				}
			};
		}
		
		if ($@) {
			epr $@;
			$err_cnt++;
			next;
		}
	}
    vpr "$nrec records processed ($nins inserted, $nupd updated, $ndel deleted, $err_cnt rejected)";
	print "$nrec records processed" unless ($err_cnt);
}

# Return shakemap_id given event_id
sub lookup_maintain_sm {

    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_maintain_sm, undef,
        SC->time_to_ts, $time_window);

    if (scalar @$idp >= 1) {
        return $idp;
    } else {
        return 0;       # not found
    }
}

# Return shakemap_id given event_id
sub update_archive_sm {

    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_archive_sm, undef,
        SC->time_to_ts, $time_window, $archive_mag);

    if (scalar @$idp >= 1) {
		my @events;
		foreach my $id (@$idp) {
			my $idp2 = SC->dbh->selectcol_arrayref($sth_lookup_facshake, undef, $id);
			if ($idp2->[0] >= 1) {
                $sth_upd_archive_evt->execute($id);
			}
		}
    }
	return 0;       # not found
}

# Return shakemap_id given event_id
sub lookup_maintain_evt {

    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_maintain_evt, undef,
        SC->time_to_ts, $time_window);

    if (scalar @$idp >= 1) {
        return $idp;
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
    my ($external_id, $type) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_facility, undef,
        $external_id, $type);
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $type $external_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
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
manage_event.pl -- Event Management utility
Usage:
  manage_event [ mode ] [ option ... ] event_id ...

Mode is one of:
    --resend  Retriggers ShakeCast notification of any previously processed
				ShakeCast events
    --delete   Removes event from the ShakeCast database, including event,
				ShakeMap products and notification
  

Options:
    --help     Print this message
    --verbose  Print details of program operation
};
    exit $rc;
}

