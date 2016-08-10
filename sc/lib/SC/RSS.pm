
# $Id: RSS.pm 486 2008-10-03 16:57:51Z klin $

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

package SC::RSS;

use SC;

###################################
#From scfeed_web

use strict;

use FindBin;
use lib "$FindBin::Bin/../lib";
#use Constants qw( :shakecastxml );

use Cwd;
use File::Path;
use File::Basename qw(basename);
use IO::File;
use XML::Writer;
use XML::LibXML::Simple;
#use XML::Parser;
use POSIX qw(strftime);
use Getopt::Long;
use LWP::Simple;
use Time::Local;

############################################################################
# Prototypes for the logging routines
############################################################################
sub logmsg;
sub logver;
sub logerr;
sub logscr;
sub mydate;
sub grid_keys;

#######################################################################
# Global variables
#######################################################################

my $arglist = "@ARGV";		# save the arguments for entry
                                # into the database

#----------------------------------------------------------------------
# Name of the configuration files
#----------------------------------------------------------------------

my $shake_home = $FindBin::Bin;

#######################################################################
# End global variables
#######################################################################

#######################################################################
# Stuff to handle command line options and program documentation:
#######################################################################

my $desc = 'Create XML messages and feed them to ShakeCast.';

my $flgs = [{ FLAG => 'event',
	      ARG  => 'event_id',
              TYPE => 's',
	      REQ  => 'y',
	      DESC => 'Specifies the id of the event to process'},
          #  { FLAG => 'scenario',
          #    DESC => 'Force the system to treat this event as a scenario. '
		  #  . 'Note: this flag usually is not necessary (i.e., if '
		  #  . 'the event id ends with "_se" or tag has run with '
		  #  . 'the -scenario flag).'},
          #  { FLAG => 'test',
          #    DESC => 'Signal the system that this event is a test.'},
          #  { FLAG => 'forcerun',
          #    DESC => 'Override out-of-sequence and lock errors generated by '
          #          . 'Version.pm.'},
          #  { FLAG => 'cancel',
          #    DESC => 'Sends cancellation messages to ShakeCast'},
            { FLAG => 'verbose',
              DESC => 'Prints informational messages to stderr.'},
            { FLAG => 'help',
              DESC => 'Prints program documentation and quit.'}
           ];


#######################################################################
# End of command line option stuff
#######################################################################

#######################################################################
# User config 
#######################################################################
	
my $logfile;			# Where we dump all of our messages
my $log;			# Filehandle of the log file
my $rss_home = $FindBin::Bin;
my $config_dirs = [ $rss_home ];
my $download_dir;
my $rss_url;
my @data_files;
my @events;
my @regions;
my $all_regions;
my @grids = metric_list();
my $perl = SC->config->{perlbin};


#######################################

sub BEGIN {
    no strict 'refs';
    for my $method (qw(
			event_id event_version external_event_id
			event_status event_type
			event_name event_location_description
			magnitude lat lon
			event_timestamp receive_timestamp
			initial_version superceded_timestamp
			seq
			)) {
	*$method = sub {
	    my $self = shift;
	    @_ ? ($self->{$method} = shift, return $self)
	       : return $self->{$method};
	}
    }
}

sub newer_than {
    my ($class, $hwm, $oldest) = @_;
    
    undef $SC::errstr;
    my @newer;
    my @args = ($hwm);
    my $sql =  qq/
        select event_id,
               event_version
          from event
         where seq > ?
           and event_type <> 'TEST'/;
    if ($oldest) {
	$sql .= qq/ and receive_timestamp > $SC::to_date/;
	push @args, $oldest;
    }
    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute(@args);
	while (my $p = $sth->fetchrow_arrayref) {
	    push @newer, $class->from_id(@$p);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return \@newer;
}

sub from_id {
    my ($class, $event_id, $event_version) = @_;

    undef $SC::errstr;
    my $event;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select *
	      from event
	     where event_id = ?
	       and event_version = ?/);
	$sth->execute($event_id, $event_version);
	my $p = $sth->fetchrow_hashref('NAME_lc');
	$event = new SC::Event(%$p);
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $event) {
	$SC::errstr = "No event for id-ver $event_id-$event_version";
    }
    return $event;
}

# Given an event ID, return the matching event that is not marked as
# being superceded.
sub current_version {
    my ($class, $event_id) = @_;

    undef $SC::errstr;
    my $event;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select *
	      from event
	     where event_id = ?
	       and (superceded_timestamp IS NULL)/);
	$sth->execute($event_id);
	my $p = $sth->fetchrow_hashref('NAME_lc');
	$event = new SC::Event(%$p);
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $event) {
	$SC::errstr = "No current event for id $event_id";
    }
    return $event;
}

# Delete all events, shakemaps, grids, and products related to a given
# event ID.  Product files and product directories will be deleted, too.
# This method will log an error and do nothing for events
# that have an event_type other than C<TEST>.
# 
# Return true/false for success/failure
sub erase_test_event {
    my ($class, $event_id) = @_;

    my $sth;
    my $event;
    eval {
	my ($nrec) = SC->dbh->selectrow_array(qq/
	    select count(*)
	      from event
	     where event_id = ?
               and event_type <> 'TEST'/, undef, $event_id);
        if ($nrec) {
            $SC::errstr = "Can't erase events whose type is not TEST";
            return 0;
        }

        # Determine the set of grids to be deleted
        my ($gridp) = SC->dbh->selectcol_arrayref(qq/
            select grid_id
              from grid g
                  inner join shakemap s
                     on (g.shakemap_id = g.shakemap_id and
                         g.shakemap_version = s.shakemap_version)
             where s.event_id = ?/, undef, $event_id);

         # Delete grids and associated values
         my $sth_del_grid = SC->dbh->prepare(qq/
             delete from grid
              where grid_id = ?/);
         my $sth_del_value = SC->dbh->prepare(qq/
             delete from grid_value
              where grid_id = ?/);
         foreach my $grid_id (@$gridp) {
             $sth_del_value->execute($grid_id);
             $sth_del_grid->execute($grid_id);
         }

         # Determine the set of shakemaps to be deleted
         my ($smp) = SC->dbh->selectall_arrayref(qq/
             select shakemap_id,
                    shakemap_version
               from shakemap
              where event_id = ?/, undef, $event_id);

         # Delete products
         $sth = SC->dbh->prepare(qq/
             delete from product
              where shakemap_id = ?
                and shakemap_version = ?/);
         foreach my $k (@$smp) {
             $sth->execute(@$k);
             my $shakemap = SC::Shakemap->from_id(@$k);
             my $dir = $shakemap->product_dir;
             SC->log(0, "dir: $dir");
             if (-d $dir) {
                 opendir DIR, $dir;
                 my $file;
                 while (my $file = readdir DIR) {
                     SC->log(0, "file: $file");
                     next unless -f "$dir/$file";
                     unlink "$dir/$file"
                         or SC->log(0, "unlink $dir/$file failed: $!");
                 }
                 closedir DIR;
                 rmdir $dir
                     or SC->log(0, "rmdir $dir failed: $!");
             }
         }

         # Delete associated shakemap metrics
         $sth = SC->dbh->prepare(qq/
             delete from shakemap_metric
              where shakemap_id = ?
                and shakemap_version = ?/);
         foreach my $k (@$smp) {
             $sth->execute(@$k);
         }

         # Delete shakemaps
         SC->dbh->do(qq/
             delete from shakemap
              where event_id = ?/, undef, $event_id);

         # Delete events
         SC->dbh->do(qq/
             delete from event
              where event_id = ?/, undef, $event_id);
    };
    if ($@) {
	$SC::errstr = $@;
	return 0;
    }
    return 1;
}


sub from_xml {
    my ($class, $xml_source) = @_;
    undef $SC::errstr;
    my $xml = SC->xml_in($xml_source);
    return undef unless defined $xml;
    unless (exists $xml->{'event'}) {
	$SC::errstr = 'XML error: event element not found';
	return undef;
    }
    return $class->new(%{ $xml->{'event'} });
}


sub new {
    my ($class, $xml) = @_;
    my $self = bless {} => $class;
    $self->receive_timestamp(SC->time_to_ts);
    Carp::carp "Odd (wrong?) number of parameters in new()" if $^W && (@_ & 1); 
	$self->{'feed'} = $xml;
	$self->{'config'} = SC->config->{'rss'};

    return $self;
}


# ======================================================================
# Instance methods

sub to_xml {
    my $self = shift;
    return SC->to_xml_attrs(
	$self,
	'event',
	[qw(
	    event_id event_version external_event_id
	    event_status event_type
	    event_name event_location_description
	    magnitude lat lon depth event_region event_source_type
	    event_timestamp mag_type
	    )],
	1);
}

sub as_string {
    my $self = shift;
    return 'event '.  $self->{event_id} . '-' . $self->{event_version};
}

sub write_to_db {
    my $self = shift;
    my $rc = 1;

    undef $SC::errstr;
    eval {
        # see if this is a heartbeat event
        # if so, first delete all events with the same ID.  Leave other
        # heartbeat events alone.  This allows heartbeats from more than
        # one source to propagate without interfering with each other.
        if ($self->event_type eq 'HEARTBEAT') {
            SC->dbh->do(qq/
                delete from event
                 where event_type = 'HEARTBEAT'
                   and event_id = ?/, undef, $self->event_id);
        } else {
            # check for existing record
            my $sth_getkey = SC->dbh->prepare_cached(qq/
                select event_id
                  from event
                 where event_id=?
                   and event_version=?/);
            if (SC->dbh->selectrow_array($sth_getkey, undef,
                    $self->{'event_id'},
                    $self->{'event_version'})) {
                $rc = 2;
                return; # returns from the eval, not the sub!
            }
        }

	# Determine whether this is the first version of this event we
	# have received or not
	my $num_recs = SC->dbh->selectrow_array(qq/
	    select count(*)
	      from event
	     where event_id = ?/, undef, $self->event_id);
	SC->dbh->do(qq/
	    insert into event (
		event_id, event_version,  event_status, event_type,
		event_name, event_location_description, event_timestamp,
		external_event_id, receive_timestamp,
		magnitude, mag_type, lat, lon, depth, event_region, event_source_type, initial_version)
	      values (?,?,?,?,?,?,$SC::to_date,?,$SC::to_date,?,?,?,?,?,?,?,?)/,
            undef,
	    $self->event_id,
	    $self->event_version,
	    $self->event_status,
	    $self->event_type,
	    $self->event_name,
	    $self->event_location_description,
	    $self->event_timestamp,
	    $self->external_event_id,
	    $self->receive_timestamp,
	    $self->magnitude,
	    $self->mag_type,
	    $self->lat,
	    $self->lon,
	    $self->depth,
	    $self->event_region,
	    $self->event_source_type,
	    ($num_recs ? 0 : 1));
	# Supercede all other versions of this event.
	SC->dbh->do(qq/
	    update event
	       set superceded_timestamp = $SC::to_date
	     where event_id = ?
	       and event_version <> ?
	       and superceded_timestamp IS NULL/, undef,
	    SC->time_to_ts(),
	    $self->event_id, $self->event_version);
        # Update HWM
        my ($hwm) = SC->dbh->selectrow_array(qq/
            select seq
              from event
	     where event_id = ?
	       and event_version = ?/, undef,
	    $self->event_id, $self->event_version);
        SC::Server->this_server->update_event_hwm($hwm);
    };
    if ($@) {
        $SC::errstr = $@;
        $rc = 0;
	eval {
	    SC->dbh->rollback;
	};
	# Throw away any error message resulting from the rollback since
	# it would mask the original error (and mysql always complains
	# about not being able to roll back).
    } else {
	SC->dbh->commit;
    }
    return $rc;
}

sub is_local_test {
    my $self = shift;
    return ($self->event_type eq 'TEST');
}


sub process_new_event {
    my $self = shift;

    # Add it to the database.
    my $write_status = $self->write_to_db;

    if ($write_status == 0) {
        # write failed, it should have been logged
	return 0;
    } elsif ($write_status == 2) {
	# event already exists, do nothing
        SC->log(3, $self->as_string, "already exists");
	return 1;
    } elsif ($write_status == 1) {
	# A new event record (might be a new version of an existing event)
        return 1 if ($self->is_local_test);
        
	# Forward it to all downstream servers
	# this step only queues exchange requests; the exchanges are
	# completed asynchronously, so it is not known at this time whether
	# or not they succeeded
	eval {
	    # If the dispatcher is not running this will fail.  However,
	    # from the upstream server's perspective this is not an error,
	    # so catch any problems, log them, and return success.
	    foreach my $ds (SC::Server->downstream_servers) {
		$ds->queue_request(
		    'new_event', $self->event_id, $self->event_version);
	    }
	};
	if ($@) {
	    chomp $@;
	    SC->error("$@ [Maybe the dispatcher service is not running?]");
	    return 1;
	}
    } else {
	SC->error("unknown status $write_status from event->write_to_db");
	return 0;
    }
    return 1; 
}

# returns a list of all servers that should be polled for new events, etc.
sub products_to_rss {
	my @products;
	
    undef $SC::errstr;
    eval {
		my $sth = SC->dbh->prepare(qq/
			select filename,
			  product_type
			  from product_type/);
		$sth->execute;
		while (my @p = $sth->fetchrow_array()) {
			push @products, @p;
		}
    };
    return @products;
}

sub process_new_rss {
    my $self = shift;
	my $config = $self->{'config'};
	my $xml = $self->{'feed'};
	
  my ($sv, $dbh, $sth, $ofile, $fh, $ev_status, $sm_status, $etype);
  my (%grdinfo, $file, $base, $lines, $val);
  my ($owd, $writer, $key, $product);
  my ($command, $result);
  
	my $num_new = 0;

    require LWP::UserAgent;
    my $ua = new LWP::UserAgent();
	$ua->proxy(['http'], SC->config->{'ProxyServer'})
		if (defined SC->config->{'ProxyServer'});
	
	#----------------------------------------------------------------------
	# Check Event Region and Time
	#----------------------------------------------------------------------
	push @regions, split(' ', $config->{'REGION'});
	$all_regions = 1 if (grep /all/i, @regions);
	my $network = $xml->{'eq:region'};
	return (0) unless ((grep /$network/i, @regions) || $all_regions);
	$network =~ s/global/us/;
	$network =~ s/pn/uw/;
	$network =~ s/sc/ci/;
	my $time_window = ($config->{'TIME_WINDOW'}) ? $config->{'TIME_WINDOW'} : 30;
	my $eq_time = $xml->{'eq:seconds'};
	my $time_cutoff = $eq_time + $time_window * 86400;
	return (0) unless ($time_cutoff > time() );


	#----------------------------------------------------------------------
	# Parse Event URL
	#----------------------------------------------------------------------
	my $link = $xml->{'link'};
	$link =~ s/(index.php|intensity.html)$//i;
	$link =~ s/\/$//;
	my $grid = $link.'/download/';
	#SC->log(2, "rss evid:", $evid);
	   
	
	# Parse Event ID
	my ($evid) = $grid =~ /shake\/(.+)\/download/;
	$evid = $network.$evid;

	#validate directory
	my $dest = SC->config->{'DataRoot'}."/$evid";
	if (not -e "$dest") {
	  mkpath("$dest", 0, 0755) 
	    or return(SC_FAIL, "Local file create failed: $!");
	}

	#download grid file
	my %products = SC::RSS::products_to_rss();
	SC->log(2, "rss products number:", scalar (keys %products));
	foreach my $product (keys %products) {
		my $grid_url = "$grid/$product";
		$grid_url =~ s/%EVENT_ID%/$evid/g;
		
		my $resp = $ua->get($grid_url);
		next unless ($resp->is_success);
		my $grid_contents = $resp->content;
		SC->log(3, "product ok:", $product);
	
		if (length $grid_contents > 0) {
			my $fn = $dest."/$product";
			my $fh = new IO::File($fn, 'w');
			if (not defined $fh) {
			return (SC_FAIL, "Local file create failed: $!");
			}
			binmode $fh;
			$fh->write($grid_contents, length $grid_contents);
			$fh->close;	    
		}
	}

	if (-e "$dest/grid.xml") {
		sc_xml($dest, $evid, %products); 
	} elsif (-e "$dest/grid.xyz.zip") {
		sc_grid($dest, $evid, %products);
	}

return 0;

}

sub _min {
    (defined $_[0] && (!defined $_[1] || $_[0] <= $_[1])) ? $_[0] : $_[1];
}

sub _max {
    (defined $_[0] && (!defined $_[1] || $_[0] >= $_[1])) ? $_[0] : $_[1];
}

sub _ts {
	my ($ts) = @_;
	if ($ts =~ /[\:\-]/) {
		$ts =~ s/[a-zA-Z]/ /g;
		$ts =~ s/\s+$//g;
		$ts = SC->time_to_ts(SC->ts_to_time($ts));
	} else {
		$ts = SC->time_to_ts($ts);
	}
	return ($ts);
}

sub sc_grid {

my ($dest, $evid, %products) = @_;

  my ($sv, $dbh, $sth, $ofile, $ev_status, $sm_status, $etype);
  my (%grdinfo, $file, $base, $lines, $val);
  my ($owd, $writer, $key, $product);
  my ($command, $result);
  my @grids = ("MMI", "PGA", "PGV", "PSA03", "PSA10", "PSA30");
  my $scenario = ($evid =~ /_se$/i) ? 1 : 0;

    my ($lon, $lat, @v);
    my (@min, @max);
    my ($lat_cell_count, $lon_cell_count);
    my ($lat_spacing, $lon_spacing);
    my (@cells, $cell_no);
    my ($lon_min, $lat_min, $lon_max, $lat_max);
    my ($rows_per_degree, $cols_per_degree);
    my $rc;

    $file = "$dest/grid.xyz.zip";
	require Archive::Zip;
	require Archive::Zip::MemberRead;
    my $zip = new Archive::Zip($file);
    my $fh  = new Archive::Zip::MemberRead($zip, "grid.xyz");
    my $header = $fh->getline();

	while (defined(my $line = $fh->getline())) {
            my @v;
            # row format: lon lat metric1 metric2 ...
            #SC->log(8, "Grid file line: $line");
	    ($lon, $lat, @v) = split ' ',$line;

            # compute min/max for each metric across the entire grid
            for (my $i = 0; $i < scalar @v; $i++) {
                $min[$i] = _min($min[$i], $v[$i]);
                $max[$i] = _max($max[$i], $v[$i]);
            }
            if ($cell_no == 0) {
                $lat_max = $lat;
                $lon_min = $lon;
            } elsif ($cell_no == 1) {
                $lon_spacing = $lon - $lon_min;
            } elsif ($lat_spacing == 0 and $lon == $lon_min) {
                # starting a new row
                $lat_spacing = $lat_max - $lat;
                $lon_cell_count = $cell_no;
            }
            $cells[$cell_no++] = \@v;
	}
	$lat_cell_count = scalar @cells / $lon_cell_count;
	$lat_min = $lat;
	$lon_max = $lon;
	$cols_per_degree = sprintf "%d", 1/$lon_spacing;
	$rows_per_degree = sprintf "%d", 1/$lat_spacing;

	$file = "$dest/stationlist.xml";

	my $xml =  XMLin($file);
	my $version = $xml->{'map_version'} || 1;
	#print "version, $version\n";

	return (0) if (-d "$dest-$version");
	rename("$dest", "$dest-$version");
	#my $sc_data = "$download_dir/$evid";
	my $sc_data = "$dest-$version";
	my $earthquake = $xml->{'earthquake'};
    $earthquake->{'created'} = _ts($earthquake->{'created'});
  #-----------------------------------------------------------------------
  # Generate event.xml:
  #
  # Open the event file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/event.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object; the "NEWLINES" implementation is a
  # disaster so we don't use it, and hence have to add our own all
  # over the place
  #----------------------------------------------------------------------
  $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

  my $ts = sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
			 $earthquake->{'year'}, $earthquake->{'month'}, $earthquake->{'day'},
			 $earthquake->{'hour'}, $earthquake->{'minute'}, $earthquake->{'second'},
			 $earthquake->{'timezone'});
  $writer->emptyTag("event",
		    "event_id"          => $evid,
		    "event_version"     => $version,
		    "event_status"      => 'NORMAL',
		    "event_type"        => $scenario ? 'SCENARIO' : 'ACTUAL',
		    "event_name"        => $evid,
		    "event_location_description" => $earthquake->{'locstring'},
		    "event_timestamp"   => $ts,
		    "external_event_id" => $evid,
		    "magnitude"         => $earthquake->{'mag'},
		    "mag_type"         => $earthquake->{'mag_type'},
		    "lat"               => $earthquake->{'lat'},
		    "lon"               => $earthquake->{'lon'},
		    "depth"               => $earthquake->{'depth'},
		    "event_region"               => $earthquake->{'event_region'},
		    "event_source_type"               => $earthquake->{'event_source_type'});
  $writer->end();
  $fh->close;

  #-----------------------------------------------------------------------
  # Generate shakemap.xml:
  #
  # Open the shakemap file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/shakemap.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object;
  #----------------------------------------------------------------------
  $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);
  $writer->startTag("shakemap", 
		    "shakemap_id"          => $evid, 
		    "shakemap_version"     => $version, 
		    "event_id"             => $evid, 
		    "event_version"        => $version, 
		    "shakemap_status"      => 'RELEASED',
		    "generating_server"    => SC->config->{'LocalServerId'},
		    "shakemap_region"      => "",
		    "generation_timestamp" => $earthquake->{'created'},
		    "begin_timestamp"      => $earthquake->{'created'},
		    "end_timestamp"        => $earthquake->{'created'},
		    "lat_min"              => $lat_min,
		    "lat_max"              => $lat_max,
		    "lon_min"              => $lon_min,
		    "lon_max"              => $lon_max);
  $writer->characters("\n");
  for (my $i = 0; $i < scalar @min; $i++) {
    $writer->emptyTag("metric",
		      "metric_name" => $grids[$i],
		      "min_value"   => $min[$i],
		      "max_value"   => $max[$i]);
   $writer->characters("\n");
  }
  $writer->endTag("shakemap");
  $writer->end();
  $fh->close;

  #-----------------------------------------------------------------------
  # Loop over products
  #-----------------------------------------------------------------------
  my $pid = 1;

  foreach $product (keys %products) {
	
	my $filename = "$sc_data/$product";

    next if(not -e $filename 
	  and not -e "$filename.zip");
    $file = sprintf "p%02d.xml", $pid++;
    $ofile = "$sc_data/$file";
    $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";
  
    $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

    $writer->emptyTag("product",
		      "shakemap_id"          => $evid, 
		      "shakemap_version"     => $version, 
		      "product_type"         => $products{$product},
		      "product_status"       => 'RELEASED',
		      "generating_server"    => SC->config->{'LocalServerId'},
		      "generation_timestamp" => $earthquake->{'created'},
		      "lat_min"              => $lat_min,
		      "lat_max"              => $lat_max,
		      "lon_min"              => $lon_min,
		      "lon_max"              => $lon_max);
    $writer->end();
    $fh->close;
  }

  &sm_inject($sc_data, $evid);

return 0;
}

sub sc_xml {

my ($dest, $evid, %products) = @_;
  my ($sv, $dbh, $sth, $ofile, $fh, $ev_status, $sm_status, $etype);
  my (%grdinfo, $base, $lines, $val);
  my ($owd, $writer, $key, $product);
  my ($command, $result);
	my %grid_spec;
	my @grid_metric;
	my %shakemap_spec;
	my %event_spec;

	my $file = "$dest/grid.xml";
	my $info_file = "$dest/info.xml";
	
	my $info = XMLin($info_file) if (-e $info_file);
	my $parser = SC->sm_twig($file);;
	%event_spec = %{$parser->{'event'}};
	%grid_spec = %{$parser->{'grid_specification'}};
	%shakemap_spec = %{$parser->{'shakemap_grid'}};
		foreach my $metric (keys %{$parser->{grid_field}}) {
		$grid_metric[$parser->{grid_field}->{$metric}->{index}-1] = $metric;
	}

	my $version = $shakemap_spec{'shakemap_version'} || 1;
	my $shakemap_originator = lc($shakemap_spec{'shakemap_originator'});
	my $shakemap_id = lc($shakemap_spec{'shakemap_id'});
	my $evt_network = ($event_spec{'event_network'}) ? lc($event_spec{'event_network'}) : lc($shakemap_spec{'shakemap_originator'});
	my $evt_id = ($event_spec{'event_id'}) ? lc($event_spec{'event_id'}) : lc($shakemap_spec{'shakemap_id'});
	my $sc_data = SC->config->{'DataRoot'}."/$evt_network$evt_id-$version";
	return (0) if (-d $sc_data);
	rename("$dest", $sc_data);
	
	my $lon_spacing = $grid_spec{'nominal_lon_spacing'};
	my $lat_spacing = $grid_spec{'nominal_lat_spacing'};
	my $lon_cell_count = $grid_spec{'nlon'};
	my $lat_cell_count = $grid_spec{'nlat'};
	my $lat_min = $grid_spec{'lat_min'};
	my $lat_max = $grid_spec{'lat_max'};
	my $lon_min = $grid_spec{'lon_min'};
	my $lon_max = $grid_spec{'lon_max'};
	
	my (@max, @min);
	foreach my $line (split "\n", $parser->{grid_data}) {
        my ($lon, $lat, @gv) = split ' ', $line;
		for (my $i = 0; $i < scalar @gv; $i++) {
			$min[$i] = _min($min[$i], $gv[$i]);
			$max[$i] = _max($max[$i], $gv[$i]);
		}
	}

	my $remote_event = $evid;
	$event_spec{'event_timestamp'} = _ts($event_spec{'event_timestamp'});
	$shakemap_spec{'process_timestamp'} = _ts($shakemap_spec{'process_timestamp'});
	if (lc($shakemap_spec{'shakemap_originator'}) eq 'us') {
	($remote_event) = $remote_event =~ /(.*)_/;
	} else {
	  while (length($remote_event) < 8) {
		$remote_event = '0' . $remote_event;
	  }
	}
	$remote_event = lc($shakemap_spec{'shakemap_originator'}).$remote_event;

	#print "remote event, $remote_event\n";
	if ($shakemap_spec{'map_status'} =~ /RELEASED|REVIEWED/i) {
	$ev_status = 'NORMAL';
	} else {
	$ev_status = $shakemap_spec{'map_status'};
	}
  #-----------------------------------------------------------------------
  # Generate event.xml:
  #
  # Open the event file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/event.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object; the "NEWLINES" implementation is a
  # disaster so we don't use it, and hence have to add our own all
  # over the place
  #----------------------------------------------------------------------
  $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

  $writer->emptyTag("event",
		    "event_id"          => $evid,
		    "event_version"     => $version,
		    "event_status"      => $ev_status,
		    "event_type"        => $shakemap_spec{'shakemap_event_type'},
		    "event_name"        => $shakemap_spec{'event_name'},
		    "event_location_description" => $event_spec{'event_description'},
		    "event_timestamp"   => "$event_spec{'event_timestamp'}",
		    "external_event_id" => "$evid",
		    "event_region" 		=> "$evt_network",
		    "magnitude"         => $event_spec{'magnitude'},
		    "mag_type"         => $event_spec{'mag_type'},
		    "lat"               => $event_spec{'lat'},
		    "lon"               => $event_spec{'lon'},
		    "depth"               => $event_spec{'depth'},
		    "event_source_type"               => $event_spec{'event_source_type'});
  $writer->end();
  $fh->close;

  #-----------------------------------------------------------------------
  # Generate shakemap.xml:
  #
  # Open the shakemap file
  #----------------------------------------------------------------------
  $ofile = "$sc_data/shakemap.xml";
  $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";

  #----------------------------------------------------------------------
  # Creae the XML::Writer object;
  #----------------------------------------------------------------------
	$writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);
	$writer->startTag("shakemap", 
		"shakemap_id"          => $evid, 
		"shakemap_version"     => $version, 
		"event_id"             => $evid, 
		"event_version"        => $shakemap_spec{'shakemap_version'}, 
		"shakemap_status"      => $shakemap_spec{'map_status'},
		"generating_server"    => SC->config->{'LocalServerId'},
		"shakemap_region"      => lc($shakemap_spec{'shakemap_originator'}),
		"generation_timestamp" => $shakemap_spec{'process_timestamp'},
		"begin_timestamp"      => $shakemap_spec{'process_timestamp'},
		"end_timestamp"        => $shakemap_spec{'process_timestamp'},
		"lat_min"              => $lat_min,
		"lat_max"              => $lat_max,
		"lon_min"              => $lon_min,
		"lon_max"              => $lon_max);
	$writer->characters("\n");
	for (my $i = 0; $i < scalar @min; $i++) {
		next unless grep { /$grid_metric[$i+2]/ } @grids;
		$writer->emptyTag("metric",
				  "metric_name" => $grid_metric[$i+2],
				  "min_value"   => $min[$i],
				  "max_value"   => $max[$i]);
		$writer->characters("\n");
	}
	$writer->endTag("shakemap");
	$writer->end();
	$fh->close;

  #-----------------------------------------------------------------------
  # Loop over products
  #-----------------------------------------------------------------------
  my $pid = 1;

  foreach $product (keys %products) {

    next if(not -e "$sc_data/$product" 
	  and not -e "$sc_data/$product.zip");
    $file = sprintf "p%02d.xml", $pid++;
    $ofile = "$sc_data/$file";
    $fh = new IO::File "> $ofile" or logscr "Couldn't open $ofile";
  
    $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

    $writer->emptyTag("product",
		      "shakemap_id"          => $evid, 
		      "shakemap_version"     => $version, 
		      "product_type"         => $products{$product},
		      "product_status"       => $shakemap_spec{'map_status'},
		      "generating_server"    => SC->config->{'LocalServerId'},
		      "generation_timestamp" => $shakemap_spec{'process_timestamp'},
		      "lat_min"              => $lat_min,
		      "lat_max"              => $lat_max,
		      "lon_min"              => $lon_min,
		      "lon_max"              => $lon_max);
    $writer->end();
    $fh->close;
  }

  &sm_inject($sc_data, $evid);
  
return 0;
}

sub sm_inject {
  my ($sc_data, $evid) = @_;
  my $root_dir = SC->config->{'RootDir'};
  my ($file, $command, $result);
  
	# Determine whether this is the first version of this event we
	# have received or not
	my $num_recs =
		SC->dbh->selectrow_array(qq/
	    select count(*)
	      from event
	     where event_id = ?/, undef, $evid);
		 
	if ($num_recs <= 0) {
		#-----------------------------------------------------------------------
		# Send the event message
		#-----------------------------------------------------------------------
		$command = "$perl $root_dir/bin/sm_inject.pl "
		   . "--verbose --conf $root_dir/conf/sc.conf "
		   . "$sc_data/event.xml";

		$result = `$command`;
		#logscr "Error in sm_new_event: '$result'" if ($result !~ /STATUS=SUCCESS/);
	}

  #-----------------------------------------------------------------------
  # Send the shakemap message
  #-----------------------------------------------------------------------
  $command = "$perl $root_dir/bin/sm_inject.pl "
	   . "--verbose --conf $root_dir/conf/sc.conf "
	   . "$sc_data/shakemap.xml";
  $result = `$command`;
  #logscr "Error in sm_new_shakemap: '$result'" if ($result !~ /STATUS=SUCCESS/);

  #-----------------------------------------------------------------------
  # Send the product messages
  #-----------------------------------------------------------------------
  if ($result =~ /STATUS=SUCCESS/) {
	  foreach $file ( <$sc_data/p??.xml> ) {
		$command = "$perl $root_dir/bin/sm_inject.pl "
		   . "--verbose --conf $root_dir/conf/sc.conf "
			 . "$file";
	
		$result = `$command`;
		#logscr "Error in sm_new_product ($file): '$result'" 
		#		if ($result !~ /STATUS=SUCCESS/);
	  }
  }

return 0;
}

# returns a list of all metrics that should be polled for new events, etc.
sub metric_list {
	my @metrics;
	
    undef $SC::errstr;
    eval {
		my $sth = SC->dbh->prepare(qq/
			select short_name
			  from metric/);
		$sth->execute;
		while (my @p = $sth->fetchrow_array()) {
			push @metrics, @p;
		}
    };
    return @metrics;
}

sub grid_keys {
  my $xmlref     = shift;
  my $dbug  = shift;
  my @grid_keys = ();

  #my @fields = keys %{$xmlref->{'grid_field'}}, "\n";
  foreach my $ff ( keys %{$xmlref->{'grid_field'}} ) {
    #(defined $ff->{'index'}) or next;
	#print keys  %{$xmlref->{'grid_field'}->{$ff}}, "\n";
    $xmlref->{'grid_field'}->{$ff}->{'value'} = [];
    push @grid_keys, $ff;
  }

  my $grid_data = $xmlref->{'grid_data'};
  my (@grid_data) = $grid_data =~ /([+-]?\d+\.?\d*)/g;
  my $ind =0;
  while (my @line_data = splice(@grid_data, 0, scalar @grid_keys)) {
    foreach my $key (@grid_keys) { 
      push @{$xmlref->{'grid_field'}->{$key}->{'value'}}, 
		$line_data[$xmlref->{'grid_field'}->{$key}->{'index'} - 1];
	}
  }

  foreach my $key (@grid_keys) { 
    my @sort_a = sort  @{$xmlref->{'grid_field'}->{$key}->{'value'}};
    print  $sort_a[0], ",", $sort_a[$#sort_a], "\n";
    $xmlref->{'grid_field'}->{$key}->{'min'} = $sort_a[0];
	$xmlref->{'grid_field'}->{$key}->{'max'} = $sort_a[$#sort_a];
  }

  return \@grid_keys;
}

1;


__END__

=head1 NAME

SC::RSS - ShakeCast library

=head1 DESCRIPTION

=head2 Class Methods

=head2 Instance Methods

=over 4

=item SC::RSS->from_xml('d:/work/sc/work/event.xml');

Creates a new C<SC::RSS> from XML, which may be passed directly or can be
read from a file.    

=item new SC::RSS(event_type => 'EARTHQUAKE', event_name => 'Northridge');

Creates a new C<SC::RSS> with the given attributes.

=item $event->write_to_db

Writes the event to the database.  The event may already exist; in this case
the event is silently ignored.  The return value indicates

  0 for errors (C<$SC::errstr> will be set),
  1 for successful insert, or
  2 if the record already existed.

=cut

