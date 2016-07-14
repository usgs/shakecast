#!/usr/local/bin/perl

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

use Carp;
use Getopt::Long;

use CGI;

use DBI;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use SC::Event;
use SC::Product;
use SC::Server;
use SC::Shakemap;

use File::Basename;
use File::Copy;
use File::Path;

sub dbquit;
sub pr;
sub quit;

my @product_types = qw(
    GRID_XML GRID HAZUS SHAPE STN_TXT STN_XML IIOVER_PNG KML
    INTEN_JPG INTEN_PS
    PGA_JPG PGA_PS PGV_JPG PGV_PS
    PSA03_JPG PSA03_PS PSA10_JPG PSA10_PS PSA30_JPG PSA30_PS
    CONT_PGA CONT_PGV CONT_PSA03 CONT_PSA10 CONT_PSA30
    EVT_TXT TV_TXT TV_PS TV_JPG TVBARE_PS TVBARE_JPG 
	IIOVER_PNG IIOVER_JPG);

my $VERSION = '0.1.0';

SC->initialize() or quit $SC::errstr;

my $config = SC->config;

my $dbh = SC->dbh;

my $script = $ENV{SCRIPT_NAME};

my $type;



my $event_layout =
    ['ID'       => 'e.EVENT_ID',
     'Version'     => 's.SHAKEMAP_VERSION',
     'Date'     => 'e.EVENT_TIMESTAMP',
     'Mag'      => 'e.MAGNITUDE',
     'Lat'      => 'e.LAT',
     'Lon'      => 'e.LON',
     'Location' => 'e.EVENT_LOCATION_DESCRIPTION'];


my $test_dir = SC->config->{'RootDir'} . '/test_data';
my $temp_dir = $config->{'TemplateDir'} . '/xml';
my @local_products;
if (-d $temp_dir) {
    if (opendir TEMPDIR, $temp_dir) {
		# exclude .* files
		my @files = grep !/^\./, readdir TEMPDIR;
		# exclude non-directories
		closedir(TEMPDIR);
	
		foreach my $file (@files) {
			if ($file =~ m#([^/\\]+)\.tt$#) {     # last component only
				my $temp_file = $1.".tt";
				my $output_file = $1;
				$output_file =~ s/_/\./;
				push @local_products, $output_file;
			}
		}
	}
}

my %options = (
);

GetOptions(
    \%options,

    'type=s',           # error for existing facilities
    'key=s',             # skip existing facilities
    'offset:i',             # skip existing facilities
    'limit:i',             # skip existing facilities
    'order:s',             # skip existing facilities
) or return(0);

$type = $options{'type'};

if ($type) {process_by_type();}

exit;


#
### Main Processing Functions
#

sub process_by_type {
    if ($type eq 'event_menu') { event_menu() }
    elsif ($type eq 'new_test') { new_test() }
    elsif ($type eq 'create_test') { create_test() }
    elsif ($type eq 'inject_next') { inject_next() }
    elsif ($type eq 'inject_first') { inject_first() }
}

sub event_menu {
	pr join '::', ('EVENT_ID','MAGNITUDE', 'LAT', 'LON', 'EVENT_LOCATION_DESCRIPTION');
    foreach my $event (get_test_events()) {
        pr join('::', 
            ($event->event_id, $event->magnitude, $event->lat,
                $event->lon, $event->event_location_description));
    }
}

sub inject_first {
    my $event_id = $options{'key'};
    exit unless $event_id;
    my $event = inject_test($event_id, 1);
    pr $event->as_string . ' has been created';
}

sub inject_next {
    my $event_id = $options{'key'};
    exit unless $event_id;
    my $event = inject_test($event_id, 0);
    pr $event->as_string . ' has been created';
}

sub new_test {
	my $offset = $options{'offset'} || 0;  #kwl
	my $limit = $options{'limit'} || 1000;  #kwl
	my $order = $options{'order'} || 'e.EVENT_TIMESTAMP';  #kwl

    show_table('EVENT e INNER JOIN SHAKEMAP s on e.event_id=s.event_id', qq/WHERE e.SUPERCEDED_TIMESTAMP IS NULL AND s.SUPERCEDED_TIMESTAMP IS NULL AND e.EVENT_TYPE <> 'TEST'/, $order,
               $event_layout, $offset, $limit, # kwl
               ['add', 'create_test', 'e.EVENT_ID']);
}

sub create_test {
    check_test_dir();
    my $event_id = $options{'key'};
    my $template_dir = "$test_dir/${event_id}_scte";
    exit if (-d $template_dir);
    mkdir $template_dir or exit;
    my $event = SC::Event->current_version($event_id);
    exit unless $event;
    my $xml = make_test_xml($event->to_xml);
    open OUT, "> $template_dir/event_template.xml" or exit;
    print OUT "$xml\n";
    close OUT;
    my $shakemap = SC::Shakemap->current_version($event_id);
    quit "No shakemap with ID $event_id" unless $shakemap;
    $xml = make_test_xml($shakemap->to_xml);
    open OUT, "> $template_dir/shakemap_template.xml" or exit;
    print OUT "$xml\n";
    close OUT;
    my @products = SC::Product->current_version($event_id);
    exit if $SC::errstr;
    exit unless @products > 0;
    $xml = make_test_xml($products[0]->to_xml);
    open OUT, "> $template_dir/product_template.xml" or exit;
    print OUT "$xml\n";
    close OUT;
    foreach my $product (@products) {
        copy $product->abs_file_path, $template_dir;
    }
    foreach my $local_product (@local_products) {
        copy $shakemap->product_dir .'/' . $local_product, $template_dir;
    }
	pr $event_id."_scte created.";
}



sub make_test_xml {
    my ($xml) = @_;
    $xml =~ s/event_id="([^"]+)"/event_id="$1_scte"/gm;
    $xml =~ s/shakemap_id="([^"]+)"/shakemap_id="$1_scte"/gm;
    $xml =~ s/event_version="([^"]+)"/event_version="?event_version"/gm;
    $xml =~ s/shakemap_version="([^"]+)"/shakemap_version="?event_version"/gm;
    $xml =~ s/event_type="[^"]+"/event_type="TEST"/gm;
    $xml =~ s/product_type="[^"]+"/product_type="?product_type"/gm;
    return $xml;
}

sub check_test_dir {
    unless (-d $test_dir) {
        mkdir $test_dir or exit;
    }
}

sub get_test_events {
    my @test_events;
    my $xml;

    check_test_dir();
    opendir TESTDIR, $test_dir or quit("Can't open $test_dir\: $!");
    # exclude .* files
    my @files = grep !/^\./, readdir TESTDIR;
    # exclude non-directories
    my @dirs = grep -d, map "$test_dir/$_", @files;
    foreach my $dir (@dirs) {
        $dir =~ m#([^/\\]+$)#;     # last component only
        $xml = read_xml($1, 'event');
        SC->log(4, "event XML: $xml");
        $xml =~ s/\?event_version/1/g;
        SC->log(4, "event XML: $xml");
        eval {
            my $event = SC::Event->from_xml($xml)
                or exit;
            push @test_events, $event;
        };
        exit if $@;
    }
    return @test_events;
}
    
sub read_xml {
    my ($event_id, $type) = @_;

    my $fname = "$test_dir/$event_id/${type}_template.xml";
    open XML, "< $fname" or exit;
    my @lines = <XML>;
    close XML;
    chomp @lines;
    return join(' ', @lines);
}



#
### Support Functions
#

sub dbquit {
    exit;
}


sub make_lookup_value {
    my ($val, $lookup) = @_;
    my $v;

    my ($table, $fval, $fshow) = split /,/, $lookup;
    if ($table eq '*BOOL') {
	if (nz($val)) { $v = $fshow }
	else { $v = $fval }
    }
    elsif ($val) {
        $table = lc $table;
	$fval ||= $table;
	$fshow ||= $fval;
	my $sql = qq[SELECT $fshow FROM $table WHERE $fval = ?];
	my $sth = $dbh->prepare($sql) or exit;
	$sth->execute($val) or exit;
	my $r = $sth->fetchrow_arrayref;
	$sth->finish;
	if ($r) { $v = $r->[0] }
    }
    return $v;
}


sub nbs_null {
    $_[0] ? $_[0] : '&nbsp;';
}


sub ns {
    $_[0] ? $_[0] : '';
}


sub nz {
    $_[0] ? $_[0] : 0;
}


sub pr {
    print @_, "\n";
}


sub quit {
    print @_;
    exit;
}


sub show_table {
    my ($table, $where, $order, $fp, $row_offset, $row_page, @links) = @_;
    my (@names, @fields, %fmap);

    $table = lc $table;
    my $nrows = 0;
    my @list = @$fp;
    while (my $p = shift @list) {
	push @names, $p;
	my $f = shift(@list);
	my ($fname, $rest) = split /\//, $f;
	push @fields, $fname;
	$fmap{$fname} = $rest if $rest;
    }
	pr join '::', @fields;
    my $sql = "SELECT " . join(',', @fields) . " FROM $table";
    $sql .= " $where" if $where;
    $sql .= " ORDER BY $order " if $order;
    $sql .= " LIMIT $row_page" if $row_page;
    $sql .= " OFFSET $row_offset" if $row_offset;

    my $sth = $dbh->prepare($sql) or exit;
    $sth->execute or exit;
	my $rows = $sth->rows;

    while (my $r = $sth->fetchrow_hashref) {
		#$nrows++;
		#next unless ($nrows > $row_skip);
		#last if ($nrows > $row_page+$row_skip);
		my @vals;
		foreach my $fname (@fields) {
			$fname =~ s/[e|s]\.//;
			push @vals, $r->{$fname};
		}
		my $line = join '::', @vals;
		pr $line;
    }
}



sub ts {
    my $time = shift;
    my($sec, $min, $hr, $mday, $mon, $yr);

    $time = time unless defined $time;
    ($sec, $min, $hr, $mday, $mon, $yr) = localtime $time;
    sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
	     $yr+1900, $mon+1, $mday,
	     $hr, $min, $sec);
}



sub inject_test {
    my ($event_id, $initial_version) = @_;
    my $xml;
    my $event_version;
    my $event;
    my $product_dir;

    # see if this event already exists in the database
    $event = SC::Event->current_version($event_id);
    if ($event) {
        if ($initial_version) {
            # must delete any existing events and related data
            SC::Event->erase_test_event($event_id) or quit $SC::errstr;
            $event_version = 1;
        } else {
            # create next version
            $event_version = $event->event_version + 1;
        }
    } else {
        $event_version = 1;
    }
	
    $xml = read_xml($event_id, 'event') or exit;
    $xml =~ s/\?event_version/$event_version/g;
    $event = SC::Event->from_xml($xml) or exit;
    $event->event_type("TEST"); # make sure it is a TEST!
    $event->process_new_event or exit;
    $xml = read_xml($event_id, 'shakemap') or exit;
    $xml =~ s/\?event_version/$event_version/g;
    SC::Shakemap->from_xml($xml)->process_new_shakemap or exit;
    $xml = read_xml($event_id, 'product') or exit;
    foreach my $product_type (@product_types) {
        #next;   # temporarily skip products
        my $xml2 = $xml;
        my $product;
        $xml2 =~ s/\?event_version/$event_version/g;
        $xml2 =~ s/\?product_type/$product_type/g;
        SC->log(4, $xml2);
        $product = SC::Product->from_xml($xml2) or exit;
        unless ($product_dir) {
            $product_dir = $product->dir_name;
            SC->log(4, "product dir: $product_dir");
            unless (-d $product_dir) {
                eval { mkpath($product_dir) };
                SC->log(4, "mkpath product dir: $product_dir");
                exit if $@;
            }
        }
        SC->log(4, 'product',$product->file_name,
                   'exists:',$product->product_file_exists);
        unless ($product->product_file_exists) {
            my $src = $test_dir.'/'.$product->shakemap_id.'/'.$product->file_name;
            SC->log(4, "copy from $src");
            if (-r $src) {
                copy($src, $product_dir) or SC->log(0,"Copy $src failed: $!");
            } else {
                SC->log(0, "missing product file $src");
            }
        }
        $product->process_new_product(SC::Server->this_server)
            or exit;
    }
    foreach my $local_product (@local_products) {
        copy $test_dir .'/' . $event_id . '/' . $local_product, $product_dir;
    }
    return $event;
}

#####
