#!/usr/local/bin/perl

# $Id: manage_facility.pl 519 2008-10-22 13:58:44Z klin $

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

use XML::LibXML::Simple;
use Data::Dumper;

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
my %probs;          # attribute name -> position

# specify required columns, 1=always required, 2=not required for update
my %required = (
    'EXTERNAL_FACILITY_ID'      => 1,
    'FACILITY_TYPE'             => 1,
    'FACILITY_NAME'             => 2,
    #'LAT_MIN'                       => 1,
    #'LON_MIN'                       => 1,
    #'LAT_MAX'                       => 1,
    #'LON_MAX'                       => 1
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


my $sth_lookup_facility;
my $sth_lookup_facility_feature;
my $sth_lookup_facility_type;
my $sth_ins;
my $sth_repl;
my $sth_upd;
my $sth_del;
my $sth_ins_metric;
my $sth_del_metrics;
my $sth_del_one_metric;
my $sth_ins_attr;
my $sth_ins_feature;
my $sth_ins_facility;
my $sth_del_attrs;
my $sth_del_specified_attrs;
my $sth_del_notification;
my $sth_del_facility_shaking;
my $sth_del_geometry_facility_profile;
my $sth_lookup_facility_type_fragility;

my $sub_ins_upd;



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
    
    'quote=s',          # specify alternate quote char (default is ")
    'separator=s'       # specify alternate field separator (default is ,)

) or usage(1);
usage(1) unless scalar @ARGV;
usage(1) if length $options{'separator'} != 1;
usage(1) if length $options{'quote'} != 1;

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
     where external_facility_id = ?
       and facility_type = ?});

$sth_lookup_facility_feature = SC->dbh->prepare(qq{
    select facility_id
      from facility_feature
     where facility_id = ?
    });

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

$sth_del_geometry_facility_profile = SC->dbh->prepare(qq{
    delete from geometry_facility_profile
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

$sth_ins_feature = SC->dbh->prepare(qq{
    insert into facility_feature (
           facility_id, description, geom_type, geom,
		   update_username, update_timestamp)
    values (?,?,?,?,?,?)});

$sth_ins_facility = SC->dbh->prepare(qq{
    insert into facility (
           facility_type, external_facility_id, 
		   facility_name, lat_min, lat_max, lon_min, lon_max)
    values (?,?,?,?,?,?,?)});

$sth_del_attrs = SC->dbh->prepare(qq{
    delete from facility_attribute
     where facility_id = ?});

$sth_lookup_facility_type_fragility = SC->dbh->prepare(qq{
    select metric, damage_level, low_limit, high_limit
      from facility_type_fragility
      where facility_type = ?});

$sth_lookup_facility_type = SC->dbh->prepare(qq{
    select facility_type
      from facility_type
     where facility_type = ?});

$csv = Text::CSV_XS->new({
        'quote_char'  => $options{'quote'},
        'escape_char' => $options{'quote'},
        'sep_char'    => $options{'separator'}
 });

my $xml;
foreach my $file (@ARGV) { 
    #$fh = new IO::File;
    #unless ($fh->open($file, 'r')) {
    #    epr "cannot open $file\: $!";
    #    next;
    #}
    #vpr "Processing $file";
    #$fh->close;
	$xml = XMLin($file);
    process();
}
exit;

    
sub process {
    #unless (process_header()) {
    #    epr "file had errors, skipping";
    #    return;
    #}
    my $err_cnt = 0;
    my $nrec = 0;
    my $nins = 0;
    my $nupd = 0;
    my $nrepl = 0;
    my $nskip = 0;
	
    #while (!$fh->eof) {
	my $data = $xml->{Worksheet}->{Table}->{Row};
	my $header = shift @$data;
	my @field_keys = map {$_->{Data}->{content}} @{$header->{Cell}};
	foreach my $item (@$data) {
		my $cells = $item->{Cell};
		my %item_data;
		for (my $ind=0; $ind< scalar @$cells; $ind++) {
			my $key_ind = (@{$cells}[$ind]->{'ss:Index'}) ? @{$cells}[$ind]->{'ss:Index'}-1 : $ind;
			$item_data{$field_keys[$key_ind]} = 	@{$cells}[$ind]->{Data}->{content};		
		}
		my ($ext_id,$type,$facility_name,$geom_type,$geom,$description) ;
		#	= map {$_->{Data}->{content}} @$cells;
		#print join ',', keys  %{@{$cells}[3]},"\n";
		#print %{@{$cells}[3]}->{'ss:Index'},"\n";
		my ($lat_max, $lat_min, $lon_max, $lon_min);
		($lat_max, $lat_min, $lon_max, $lon_min) = minmax($item_data{'GEOM'}) if ($item_data{'GEOM'});
			#print "($lat_max, $lat_min, $lon_max, $lon_min)\n";
        if ($nrec and $nrec % 100 == 0) {
            vpr "$nrec records processed";
        }
        #my $colp = $csv->getline($fh);
        $nrec++;
        # TODO error handling
        if ($options{'limit'} && $err_cnt >= $options{'limit'}) {
            epr "error limit reached, skipping";
            return;
        }
        #$ext_id = $colp->[$columns{EXTERNAL_FACILITY_ID}];
        #$type   = $colp->[$columns{FACILITY_TYPE}];
        #my $geom_type   = $colp->[$columns{GEOM_TYPE}];
        #my $geom   = $colp->[$columns{GEOM}];
        #my $description   = $colp->[$columns{DESCRIPTION}];
        
        my $fac_type = lookup_facility_type($item_data{'FACILITY_TYPE'});
        if ($fac_type <= 0) {
            # error looking up TYPE
            $err_cnt++;
            next;
        } 
		
        my $fac_id = lookup_facility($item_data{'EXTERNAL_FACILITY_ID'}, $item_data{'FACILITY_TYPE'});
        if ($fac_id <= 0) {
            next unless ($lat_min and $lat_max and $lon_min and $lon_max);
			$fac_id = $sth_ins_facility->execute($item_data{'FACILITY_TYPE'},$item_data{'EXTERNAL_FACILITY_ID'},
			$item_data{'FACILITY_NAME'},
			$lat_min, $lat_max, $lon_min, $lon_max);

            # error looking up ID
            $err_cnt++;
        }
		
			$description =~ s/\n//g;
			#my $status = 	$sth_ins_feature->execute($fac_id, $description, $geom_type, $geom, 
        my $fac_feature_id = lookup_facility_feature($fac_id);
        if ($fac_feature_id > 0) {
            # error looking up ID
            $err_cnt++;
            next;
        }
			my $status = 	$sth_ins_feature->execute($fac_id, $item_data{'FACILITY_NAME'}, 
					$item_data{'GEOM_TYPE'}, $item_data{'GEOM'}, 
					'admin', SC::time_to_ts(time));
					
					print "$status: $fac_id, $description, $geom_type, $geom,\n";
        # at this point the facility record has been either inserted or
        # updated, and $fac_id is its PK.

		my $sql = 'delete from facility_attribute where facility_id = ? ';
		#vvpr "del some attrs: $sql";
		#$sth_del_specified_attrs = SC->dbh->prepare($sql);

        #if (%probs) {
            #if ($mode == M_UPDATE) {
                # delete any attributes mentioned in the input file
            #    $sth_del_specified_attrs->execute($fac_id);
            #}
            #while (my ($prob, $valp) = each %probs) {
				#my $metric = $valp->{'METRIC'};
                #my $alpha = $colp->[$valp->{'ALPHA'}];
                #my $beta = $colp->[$valp->{'BETA'}];
                # don't insert null attribute values
                #next unless defined $val and $val ne '';
                #$sth_ins_attr->execute($fac_id, $attr, $colp->[$ix]);
				#next unless ($alpha && $beta);
				#my $fac_prob_id = lookup_facility_feature($fac_id);
				#if ($fac_prob_id <= 0) {
					# error looking up ID
				#	$err_cnt++;
				#	next;
				#}facility_id, description, geom_type, geom,
				#print join " ", ($fac_id, $component_class, $component, $prob, 
				#	$alpha*1.15, $beta, 'admin', SC::time_to_ts(time), $metric),"\n";
				
            #}
        #}

	}
    vpr "$nrec records processed ($nins inserted, $nupd updated, $err_cnt rejected)";
}

# Return facility_id given external_facility_id and facility_type
sub minmax {
    my ($geom) = @_;
	
	my @points = split / /, $geom;
	my ($lat_max, $lat_min, $lon_max, $lon_min);
	
	my $ind = 0;
	foreach my $point (@points) {
		my ($lon, $lat, $depth) = split /,/, $point;
		if ($ind++ <= 0) {
			($lat_max, $lat_min, $lon_max, $lon_min) =
			($lat, $lat, $lon, $lon,);
			next;
		}
		
		$lat_max =  $lat if ($lat > $lat_max);
		$lat_min =  $lat if ($lat < $lat_min);
		$lon_max =  $lon if ($lon > $lon_max);
		$lon_min =  $lon if ($lon < $lon_min);
		
	}	
		
        return ($lat_max, $lat_min, $lon_max, $lon_min);       # not found
}

# Return facility_id given external_facility_id and facility_type
sub lookup_facility_feature {
    my ($external_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_facility_feature, undef,
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

# Return facility_id given external_facility_id and facility_type
sub lookup_facility_feature {
    my ($fac_id, $component_class, $component) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_facility_feature, undef,
        $fac_id);
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $fac_id, $component_class, $component";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

# Return facility_id given external_facility_id and facility_type
sub lookup_facility_type {
    my ($type) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_facility_type, undef,
        $type);
    if (scalar @$idp > 1) {
        epr "multiple matching facilities for $type";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return 1;
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
    undef %probs;
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
        if ($field =~ /^METRIC\s*:\s*(\w+)\s*:\s*(\w+)\s*:\s*(\w+)/) {
            vvpr "$ix\: METRIC: $1 LEVEL: $2";
            my $lx = $damage_levels{$3};
            if (defined $lx) {
                # TODO check for unknown metric names
                $probs{$3}->{'METRIC'} = $1;
                $probs{$3}->{$2} = $ix;
            } else {
                epr "metric level '$3' must be one of RED, YELLOW, or GREEN";
                $err_cnt++;
            }
        } elsif ($field =~ /^METRIC\s*:\s*(\w+)\s*:\s*(\w+)/) {
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
        print Dumper(%probs);
        print Dumper(%metrics);
        print Dumper(%attrs);
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
	
    # check for required fields
    while (my ($req, $req_type) = each %required) {
        # relax required fields for update (only PK is mandatory)
        next if $req_type == 2 and $mode == M_UPDATE;
        unless (defined $columns{$req}) {
            epr "required field $req is missing";
            $err_cnt++;
        }
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


