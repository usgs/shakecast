
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

package API::Shaking;

use SC;
use API::Event;
use API::Shakemap;
use API::Facility;
use API::Station;
use API::APIUtil;

my $options = API::APIUtil::config_options();
my $count = ($options->{'topics_per_page'}) ? $options->{'topics_per_page'} : 50;

sub BEGIN {
    no strict 'refs';
    for my $method (qw(
			event_id event_version generating_server
			shakemap_id shakemap_version
			lat_min lon_min lat_max lon_max
			origin_lat origin_lon
			latitude_cell_count longitude_cell_count
			grid_id facility_type
			event_timestamp
			receive_timestamp count 
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

sub shaking_summary {
    my ($class, $options) = @_;

    undef $SC::errstr;
    my @shakings;
    my $sth;
	my $shakemap_id = $options->{'shakemap_id'};
	my $shakemap_version = $options->{'shakemap_version'};
	#my $shakemap = new API::Shakemap->from_id($shakemap_id, $shakemap_version);
	my @facilities;

    eval {
	$sth = SC->dbh->prepare(qq/
	    select count(fs.facility_id) as count, s.*, f.facility_type
		FROM 
			grid g INNER JOIN shakemap s ON
			g.shakemap_id = s.shakemap_id AND g.shakemap_version = s.shakemap_version
			INNER JOIN facility_shaking fs ON
			g.grid_id = fs.grid_id
			INNER JOIN facility f ON
			fs.facility_id = f.facility_id
	     where s.shakemap_id = ?
	       and s.shakemap_version = ?
		GROUP BY
			f.facility_type/);
	$sth->execute($shakemap_id, $shakemap_version);
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @shakings, new API::Shaking(%$p);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not  @shakings) {
	$SC::errstr = "No shaking for id $shakemap_id";
    }
    return \@shakings;
}

sub marker {
    my ($class, $options) = @_;

    undef $SC::errstr;
    my %shakings;
    my $sth;
	my $shakemap_id = $options->{'shakemap_id'};
	my $shakemap_version = $options->{'shakemap_version'};
	#my $shakemap = new API::Shakemap->from_id($shakemap_id, $shakemap_version);
	my @facilities;

    eval {
	$sth = SC->dbh->prepare(qq/
	    select fs.facility_id, f.facility_type, f.lat_min as latitude,
		f.lon_min as longitude
		FROM 
			grid g INNER JOIN shakemap s ON
			g.shakemap_id = s.shakemap_id AND g.shakemap_version = s.shakemap_version
			INNER JOIN facility_shaking fs ON
			g.grid_id = fs.grid_id
			INNER JOIN facility f ON
			fs.facility_id = f.facility_id
	     where s.shakemap_id = ?
	       and s.shakemap_version = ?
		/);
	$sth->execute($shakemap_id, $shakemap_version);
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    $shakings{$p->{facility_id}} = $p;
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not  %shakings) {
	$SC::errstr = "No shaking for id $shakemap_id";
    }
    return \%shakings;
}

sub shaking_point {
    my ($class, $options) = @_;

    undef $SC::errstr;
    my $shaking;
    my $sth;
	my $shakemap_id = $options->{'shakemap_id'};
	my $shakemap_version = $options->{'shakemap_version'};
	#my $shakemap = new API::Shakemap->from_id($shakemap_id, $shakemap_version);
	my @facilities;

    eval {
	$sth = SC->dbh->prepare(qq/
	    select count(fs.facility_id) as count, s.*
		FROM 
			grid g INNER JOIN shakemap s ON
			g.shakemap_id = s.shakemap_id AND g.shakemap_version = s.shakemap_version
			INNER JOIN facility_shaking fs ON
			g.grid_id = fs.grid_id
	     where s.shakemap_id = ?
	       and s.shakemap_version = ?/);
	$sth->execute($shakemap_id, $shakemap_version);
	my $p = $sth->fetchrow_hashref('NAME_lc');
	my $data = new API::Shaking(%$p);
	my %grid = %$data;
	$shaking = \%grid;
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $shaking) {
	$SC::errstr = "No shaking for id $shakemap_id";
    }
	
	my $grid_file = SC->config->{'DataRoot'}."/$shakemap_id-$shakemap_version/grid.xml";
	my $point_shaking = process_grid($grid_file, $options->{'latitude'}, $options->{'longitude'});
	$shaking->{'longitude'} = $options->{'longitude'};
	$shaking->{'latitude'} = $options->{'latitude'};
	$shaking->{'point_shaking'} = $point_shaking;
	
    return $shaking;
}

sub from_id {
    my ($class, $options) = @_;

    undef $SC::errstr;
    my $shaking;
    my $sth;
	my $shakemap_id = $options->{'shakemap_id'};
	my $shakemap_version = $options->{'shakemap_version'};
	my $start = $options->{'start'};
	#my $shakemap = new API::Shakemap->from_id($shakemap_id, $shakemap_version);
	my $metric = $class->metric_list($shakemap_id, $shakemap_version);
	my $metric_str = join ',', map {'value_'.$metric->{$_}.' as '.$_ } keys %$metric;
	my @facilities;
	push @facilities, @{$options->{'facility'}} 
		if ($options->{'facility'});

    eval {
	$sth = SC->dbh->prepare(qq/
	    select *
		FROM 
			grid
	     where shakemap_id = ?
	       and shakemap_version = ?/);
	$sth->execute($shakemap_id, $shakemap_version);
	my $p = $sth->fetchrow_hashref('NAME_lc');
	my $data = new API::Shaking(%$p);
	my %grid = %$data;
	$shaking->{'grid'} = \%grid;
	$sth->finish;
	my %fac_shaking;
	my $fac_str = (scalar @facilities) ? 'and facility_id in ('.(join ',', @facilities).')' : undef;
	my $sql = qq/
	    select facility_id, grid_id, dist, $metric_str
	      from facility_shaking
	     where grid_id = ?
			$fac_str
		 ORDER BY dist
		 /;
	$sql .=  "LIMIT $start, $count" unless ($fac_str);
	$sth = SC->dbh->prepare($sql);
	$sth->execute($grid{grid_id});
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
		$fac_shaking{($p->{facility_id})} = \%h;
		push @facilities, $p->{facility_id}
			unless $options->{'facility'};
	    #push @metric, \%h;
	}
	$shaking->{'facility_shaking'} = \%fac_shaking;
	print 'facility', scalar @facilities;
	
	my %fac_probability;
	$fac_str = (scalar @facilities) ? 'and ffp.facility_id in ('.(join ',', @facilities).')' : undef;
	$sql = qq/
	    select ffp.facility_id, ffp.grid_id, 
			group_concat(ffp.facility_fragility_model_id) as facility_fragility_model_id, 
			group_concat(ffp.damage_level) as damage_level, 
			group_concat(ffp.probability) as probability, group_concat(ffm.component) as component, ffp.metric
	      from facility_fragility_probability ffp inner join facility_fragility_model ffm
			on ffp.facility_fragility_model_id = ffm.facility_fragility_model_id
	     where ffp.grid_id = ? 
			$fac_str
		 GROUP BY ffp.facility_id
		 /;
	$sql .=  "LIMIT $start, $count" unless ($fac_str);
	$sth = SC->dbh->prepare($sql);
	$sth->execute($grid{grid_id});
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
		$fac_probability{($p->{facility_id})} = \%h;
		#push @{$fac_probability{($p->{facility_id})}}, \%h;
	    #push @metric, \%h;
	}
	$shaking->{'facility_probability'} = \%fac_probability;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $shaking) {
	$SC::errstr = "No shaking for id $shakemap_id";
    }
    return $shaking;
}

# Given an event ID, return the matching event that is not marked as
# being superceded.
sub shaking_list {
    my ($class, $start) = @_;

    undef $SC::errstr;
    my @shakings;
	my $sql = qq/
		SELECT e.event_id, s.shakemap_id, s.shakemap_version,
			e.event_timestamp
		FROM 
			event e left join shakemap s
			on e.event_id = s.shakemap_id
		WHERE e.event_type = 'ACTUAL'
		GROUP BY e.event_id
		ORDER BY e.seq DESC, s.shakemap_version DESC
		LIMIT $start, $count
		/;
    eval {
	my $sth = SC->dbh->prepare($sql);
	#$sth->execute(@args);
	$sth->execute();
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @shakings, new API::Shaking(%$p);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return \@shakings;
}

sub metric_list {
    my ($class, $shakemap_id, $shakemap_version) = @_;

    undef $SC::errstr;
    my %metrics;
	my $sql = qq/
		SELECT metric, value_column_number
		FROM 
			shakemap_metric
		WHERE shakemap_id = ?
			AND shakemap_version = ?
		/;
    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute($shakemap_id, $shakemap_version);
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    $metrics{lc($p->{'metric'})} = $p->{'value_column_number'};
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return \%metrics;
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
                     on (g.shakemap_id = s.shakemap_id and
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
	    magnitude lat lon depth  event_region event_source_type
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
        } elsif ($self->event_status eq 'CANCELLED') {
			SC->dbh->do(qq/
				update event
				   set event_status="CANCELLED"
				 where event_id = ?/, undef, $self->event_id);
			SC->dbh->commit;
			$rc = 1;
			return; # returns from the eval, not the sub!
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
            # check for existing record
            #my $sth_getkey = SC->dbh->prepare_cached(qq/
            #    select event_id
            #      from event
            #     where event_id=?
			#	   and abs(lat - ?) < 0.01
            #       and abs(lon - ?) < 0.01 
            #       and abs(magnitude - ?) < 0.01 
            #       and abs(depth - ?) < 0.01 
			#	   and event_status <> "cancelled" /);
            #if (SC->dbh->selectrow_array($sth_getkey, undef,
            #        $self->{'event_id'},
            #        $self->{'lat'},
            #        $self->{'lon'},
            #        $self->{'magnitude'},
            #        $self->{'depth'}
			#		)) {
            #    $rc = 2;
            #    return; # returns from the eval, not the sub!
            #}
            # check for possible redundant record with different ID
            #my $sth_getkey = SC->dbh->prepare(qq/
            #    select event_id
            #      from event
            #     where event_id != ?
			#	   and event_type not in ('SCENARIO', 'TEST')
			#	   and abs(lat - ?) < 0.1
            #       and abs(lon - ?) < 0.1 
			#	   and abs( timestampdiff(SECOND , EVENT_TIMESTAMP, ? )) < 10 /);
            #if (my $red_evt = SC->dbh->selectrow_array($sth_getkey, undef,
            #        $self->{'event_id'},
            #        $self->{'lat'},
            #        $self->{'lon'},
            #        $self->{'event_timestamp'})) {
			#	$sth_getkey = SC->dbh->prepare(qq/
			#		select event_id
			#		  from event
			#		 where event_id = ?
			#		   and event_status = "cancelled" /);
			#	if (!SC->dbh->selectrow_array($sth_getkey, undef, $red_evt)) {
			#		$rc = 3;
			#		return $rc if (SC->config->{'REDUNDANT_CHECK'}); # returns from the eval, not the sub!
			#		SC->log(3, $self->as_string, "may already exists with different ids");
			#	}
        #   }
        }

	# Determine whether this is the first version of this event we
	# have received or not, $rc=3 if REDUNDANT_CHECK flag is set
	my $num_recs = SC->dbh->selectrow_array(qq/
	    select count(*)
	      from event
	     where event_id = ?/, undef, $self->event_id);
	#my $num_recs = ($rc == 3) ? 1 :
	#	SC->dbh->selectrow_array(qq/
	#    select count(*)
	#      from event
	#     where event_id = ?/, undef, $self->event_id);
	#if ($num_recs) {
	#	SC->dbh->do(qq/
	#		delete from event
	#		 where event_id = ?/, undef,
	#		$self->event_id);
	#}
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

	my $mag_cutoff = (defined SC->config->{'MAG_CUTOFF'}) ? SC->config->{'MAG_CUTOFF'} : 4.0;
	return 0 unless ( $self->magnitude >= $mag_cutoff || $self->event_status eq 'CANCELLED');
    # Add it to the database.
    my $write_status = $self->write_to_db;

    if ($write_status == 0) {
        # write failed, it should have been logged
	return 0;
    } elsif ($write_status == 3) {
	# possible event already exists with different id, do nothing
        SC->log(3, $self->as_string, "may already exists with different ids");
	return 1;
    } elsif ($write_status == 2) {
	# event already exists, do nothing
        SC->log(3, $self->as_string, "already exists");
	return 1;
    } elsif ($write_status == 1) {
		if ($self->event_status ne 'CANCELLED') {
			eval {
				# If the dispatcher is not running this will fail.  However,
				# from the upstream server's perspective this is not an error,
				# so catch any problems, log them, and return success.
				SC::Server->this_server->queue_request(
					'comp_gmpe', $self->event_id, $self->event_version);
			};
			if ($@) {
				chomp $@;
				SC->error("$@ [Maybe the dispatcher service is not running?]");
				return 1;
			}
			#if ($self->process_shaking_model) {
			#	SC->log(2, "shaking model processed");
			#} else {
			#	SC->error($SC::errstr);
				# XXX might not be correct.  Even though we got an error while
				# processing the grid we might want to push the file downstream.
				# Probably we should NOT inform the notifier, though, since the
				# grid hasn't been loaded into the database.
			#	return 0;
			#}
		}
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

sub process_grid {

    my ($file_path, $latitude, $longitude) = @_;
    my ($lon, $lat, @v);
    my (@min, @max);
    my ($lat_cell_count, $lon_cell_count);
    my ($lat_spacing, $lon_spacing);
    my (@cells, $cell_no);
    my ($lon_min, $lat_min, $lon_max, $lat_max);
    my ($rows_per_degree, $cols_per_degree);
    my $sth;
    my %shaking_point;
	my ($hashref, $grid_spec, $grid_field, $grid_data, $event_spec, $cells);
	
	return 0 unless (-f $file_path);
	
	use Data::Dumper;
	my $hash_file = $file_path;
	$hash_file =~ s/.xml$/.hash/;
	if (-e $hash_file) {
		use Storable;
		$hashref = retrieve($hash_file);
		$grid_spec = $hashref->{'grid_specification'};
		$grid_data = $hashref->{'grid_data'};
		$grid_field = $hashref->{'grid_field'};
		$event_spec = $hashref->{'event'};
		$cells = $hashref->{'cells'};
	} else {
		use XML::LibXML::Simple;
		my $parser = SC->sm_twig($file_path);
		$grid_spec = $parser->{'grid_specification'};
		$grid_data = $parser->{'grid_data'};
		$grid_field = $parser->{'grid_field'};
		$event_spec = $parser->{'event'};
		$hashref = $parser;

		foreach my $line (split /\n/,$grid_data) {
			my @v;
			$line =~ s/\n|\t//g;
			#($lon, $lat, @v) = split ' ', $line;
			@v = split ' ', $line;
			#print "($lon, $lat, @v)\n";
			$cells->[$cell_no++] = \@v;
		}
		$hashref->{'cells'} = $cells;
		store $hashref, $hash_file;
	}
	
	$lon_spacing = $grid_spec->{'nominal_lon_spacing'};
	$lat_spacing = $grid_spec->{'nominal_lat_spacing'};
	$lon_cell_count = $grid_spec->{'nlon'};
	$lat_cell_count = $grid_spec->{'nlat'};
	$lat_min = $grid_spec->{'lat_min'};
	$lat_max = $grid_spec->{'lat_max'};
	$lon_min = $grid_spec->{'lon_min'};
	$lon_max = $grid_spec->{'lon_max'};
	
        # read grid file records and build in-memory list of shaking data
		
	$cols_per_degree = sprintf "%d", 1/$lon_spacing + 0.5;
	$rows_per_degree = sprintf "%d", 1/$lat_spacing + 0.5;
	
	
	my %metric_column_map = (map { $_ => $grid_field->{$_}->{'index'} } keys %$grid_field);
	
	# offset the grid origin by 1/2 cell to map from grid point to grid
	# cell centered on point
	$lat_max += 0.5 * $lat_spacing;
	$lon_min -= 0.5 * $lon_spacing;
		
	# for each facility compute max value of each metric and write a
	# FACILITY_SHAKING record
	my $dist;
	# some pt features have only min
	# lon_min, lat_min, lon_max, lat_max

	my @summary;
	#$dist = dist($event_spec{'lat'}, $event_spec{'lon'}, ($p->[2]+$p->[4])/2, ($p->[1]+$p->[3])/2);
	my $n = 0;
	for (my $row = _max(0, _round(($lat_max-$latitude-$lat_spacing/2) * $rows_per_degree));
			$row < $lat_cell_count; $row++) {
		last if _round (($lat_max+$lat_spacing/2 - $latitude) * $rows_per_degree) < $row;
		for (my $col = _max(0,_round(($longitude-$lon_min-$lon_spacing/2) * $cols_per_degree));
				$col < $lon_cell_count; $col++) {
			last if _round (($longitude+$lon_spacing/2 - $lon_min) * $cols_per_degree) < $col;
			$cell_no = $row * $lon_cell_count + $col;
                    if (@summary) {
                        for (my $i = 0; $i <= $#summary; $i++) {
                            $summary[$i] += $cells->[$cell_no][$i];
                        }
                    } else {
                        @summary = @{$cells->[$cell_no]};
                    }
			$n++;
		}
	}
	
	return 0 unless ($n > 0);
	foreach my $key (keys %metric_column_map) {
		$shaking_point{$key} = $summary[$metric_column_map{$key}-1] / $n;
	}
	
	return \%shaking_point;
}

sub _min {
    (defined $_[0] && (!defined $_[1] || $_[0] <= $_[1])) ? $_[0] : $_[1];
}

sub _max {
    (defined $_[0] && (!defined $_[1] || $_[0] >= $_[1])) ? $_[0] : $_[1];
}

sub _round {
  $_[0] > 0 ? int($_[0] + .5) : -int(-$_[0] + .5)
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

