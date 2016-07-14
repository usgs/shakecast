#!/usr/local/bin/perl

# $Id: station.pl 64 2007-06-05 14:58:38Z klin $

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
#use XML::Simple;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use Shake::Source;
use Shake::Station;
use Shake::DataArray;


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
	'event'		=> 0,
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

my $sub_ins_upd;



GetOptions(
    \%options,

    'resend',           # error for existing facilities
    'skip',             # skip existing facilities
    'replace',          # replace existing facilities
    'update',           # update existing facilities
    'delete',           # delete existing facilities	#kwl 20061024
    
    'verbose+',         # repeat for more verbosity
    'help',             # print help and exit

    'limit=n',          # max bad records allowed (0 for no limit)
    
    'quote=s',          # specify alternate quote char (default is ")
    'separator=s',       # specify alternate field separator (default is ,)
	'event'

) or usage(1);
usage(1) unless scalar @ARGV;
usage(1) if length $options{'separator'} != 1;
usage(1) if length $options{'quote'} != 1;

usage(1) if $options{'insert'} + $options{'replace'} +
            $options{'update'} + $options{'skip'} > 1;

my $mode;
use constant M_RESEND  => 1;
use constant M_INSERT  => 1;
use constant M_REPLACE => 2;
use constant M_UPDATE  => 3;
use constant M_SKIP    => 4;
use constant M_DELETE    => 5;	

$mode = M_RESEND   if $options{'resend'};
$mode = M_UPDATE   if $options{'update'};
$mode = M_SKIP     if $options{'skip'};
$mode = M_DELETE     if $options{'delete'};	

SC->initialize;

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

foreach my $event_id (@ARGV) { 
  my ($data, $pha_grd, $inputdir);
  $inputdir = "/ShakeCast/sc/data/$event_id";
  -e "$inputdir/stationlist.xml" or die "Can't find $inputdir/stationlist.xml";
  $data = DataArray->new("$inputdir/stationlist.xml") 
		or die "Couldn't parse $inputdir/stationlist.xml";

  my $src = $data->source;
  my $shakemap_id = $src->id();
  my $shakemap_version = 7;
  #print "$shakemap_id $shakemap_version\n";
	my ($grid_id) = SC->dbh->selectrow_array(qq/
	    select grid_id
	      from grid
	     where shakemap_id=?
	       and shakemap_version=?/,
	    undef,
	    $shakemap_id,
	    $shakemap_version);
	if ($grid_id <= 0) {
            SC->log(3, 'station list already loaded');
            return 1;
        }
    
  #-----------------------------------------------------------------------
  # Write an open triangle for every station in the list; then for
  # each parameter, fill the list of stations to be plotted as filled
  # triangles; also write the coordinates to the mapproject pipe
  #-----------------------------------------------------------------------
  my $sta_arr = $data->stations();
  my ($sta, $lon, $lat, $netid, $code, $agency, $name, $comm_type);
  my %params = ("acc" => 1, "vel"=>2, "psa03"=>4, "psa10"=>5, "psa30"=>6);
  for (my $i = 0; $i < @$sta_arr; $i++) {
    #print "Plotting station $i. ";
    $sta = $sta_arr->[$i];
    $lon = $sta->lon();
    $lat = $sta->lat();
	$netid = $sta->netid();
	$code = $sta->code();
	$agency = $sta->agency();
	$name = $sta->name();
	$comm_type = $sta->comm_type();
	
	next if ($netid =~ /CIIM/i);
    die "No \$lat or \$lon data in stationlist" unless ($lon and $lat);
	
	my $count = SC->dbh->selectrow_array(qq/
	    select count(*)
	      from station
	     where station_network=?
	       and external_station_id=?/,
	    undef,
	    $netid,
	    $code);
	if ($count == 0) {
	my $result = SC->dbh->do(qq{
	    insert into station (
		station_network, external_station_id,station_name, source, 
		commtype, latitude, longitude, update_timestamp)
	      values (
		?,?,?,?,?,?,?,?)}, {},
		$netid, $code, $name, $agency, $comm_type, $lat, $lon, SC->time_to_ts);
        SC->log(3, "load station information for $netid-$code");
    }
	
    my ($station_id) = SC->dbh->selectrow_array(qq/
            select station_id
              from station
             where station_network = ?
               and external_station_id = ?/, {},
		$netid, $code);
	next unless ($station_id);

    #-----------------------------------------------------------------------
    # The output of mapproject must correspond one-for-one with
    # the station array, so rather than do a tricky two-index thing
    # when we write them out below, we just project all of the stations 
    # here, before the lat/lon test a couple of lines below...
    #-----------------------------------------------------------------------
	# construct SQL to insert FACILITY_SHAKING records
	my (@sta_params, @fields);
    foreach my $param ( keys %params ) {
      if (defined $sta->mean($param)) {
	    push @sta_params, sprintf("%12.5f",$sta->mean($param));
	    push @fields, "value_".$params{$param};
      }
    }
	print join ',', @sta_params,"\n";
	print join ',', @fields,"\n";
	if (scalar @fields > 0) {
	my $sql =  "insert into station_shaking (station_id, grid_id," .
		join(',', @fields) . ") values (?,?," .
		join(',', ('?') x scalar @fields) . ")";
	my $sth_i = SC->dbh->prepare($sql);
    $sth_i->execute($station_id, $grid_id, @sta_params);
	}

	#print "\n";
  }
  print "Done plotting stations.\n";
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
				}

                $sth_del_event->execute($event_id);
                $sth_del_shakemap->execute($event_id);
                $sth_del_shakemap_metric->execute($event_id);
                $sth_del_grid->execute($event_id);
                $sth_del_product->execute($event_id);
				$ndel++;
			};
		}
		
		if ($@) {
			epr $@;
			$err_cnt++;
			next;
		}
	}
    vpr "$nrec records processed ($nins inserted, $nupd updated, $ndel deleted, $err_cnt rejected)";
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

