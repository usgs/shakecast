
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

package API::Facility;

use SC;

sub BEGIN {
    no strict 'refs';
    for my $method (qw(
			facility_id facility_type external_facility_id
			facility_name short_name
			description lat_min
			lat_max lon_min lon_max
			update_username update_timestamp
			receive_timestamp count
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
		FROM 
			(grid g INNER JOIN event e on
			g.shakemap_id = e.event_id)
         where seq > ?
           and event_type <> 'TEST'
		/;
    if ($oldest) {
	$sql .= qq/ and event_timestamp > $SC::to_date/;
	push @args, $oldest;
    }
	$sql .= qq/
	GROUP BY
			e.event_id
		ORDER BY
			g.grid_id DESC, e.seq DESC
	/;
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
    my ($class, $facility_id) = @_;

    undef $SC::errstr;
    my $facility;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select *
		FROM 
			facility
		where facility_id = ?
	    /);
	$sth->execute($facility_id);
	my $p = $sth->fetchrow_hashref('NAME_lc');
	$facility = new API::Facility(%$p);
	$sth->finish;
	
	my @fragility;
	$sth = SC->dbh->prepare(qq/
	    select *
	      from facility_fragility
	     where facility_id = ?
		 /);
	$sth->execute($facility_id);
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
	    push @fragility, \%h;
	}
	$facility->{'fragility'} = \@fragility;
	
	my @attribute;
	$sth = SC->dbh->prepare(qq/
	    select *
	      from facility_attribute
	     where facility_id = ?
		 /);
	$sth->execute($facility_id);
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
	    push @attribute, \%h;
	}
	$facility->{'attribute'} = \@attribute;
	
	my @feature;
	$sth = SC->dbh->prepare(qq/
	    select *
	      from facility_feature
	     where facility_id = ?
		 /);
	$sth->execute($facility_id);
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
	    push @feature, \%h;
	}
	$facility->{'feature'} = \@feature;
	
	my @fragility_model;
	$sth = SC->dbh->prepare(qq/
	    select *
	      from facility_fragility_model
	     where facility_id = ?
		 /);
	$sth->execute($facility_id);
	my %component;
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
		if ($p->{component} ne '') {
			push @{$component{lc($p->{component})}}, \%h;
		} else {
			push @fragility_model, \%h;
		}
	}
	#foreach (keys %component) {
		push @fragility_model, \%component;
	#}
	$facility->{'fragility_model'} = \@fragility_model;
	
	my @model;
	$sth = SC->dbh->prepare(qq/
	    select *
	      from facility_model
	     where facility_id = ?
		 /);
	$sth->execute($facility_id);

	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
		push @model, \%h;
	}
	foreach (keys %component) {
		push @model, $component{$_};
	}
	$facility->{'model'} = \@model;
	
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $facility) {
	$SC::errstr = "No facility for id $facility_id";
    }
    return $facility;
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
	$event = new API::Facility(%$p);
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

# Given an event ID, return the matching event that is not marked as
# being superceded.
sub facility_list {
    my ($class) = @_;

    undef $SC::errstr;
    my @facilities;
	my $sql = qq/
		SELECT facility_type, count(facility_id) as count
		FROM 
			facility
		GROUP BY facility_type
		/;
    eval {
	my $sth = SC->dbh->prepare($sql);
	#$sth->execute(@args);
	$sth->execute();
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @facilities, new API::Facility(%$p);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return \@facilities;
}

# Given an event ID, return the matching event that is not marked as
# being superceded.
sub facility_type_list {
    my ($class, $type) = @_;

    undef $SC::errstr;
    my @facilities;
	my $sql = qq/
		SELECT *
		FROM 
			facility
		/;
	$sql .= " where facility_type =?" unless ($type=~ /all/i);

    eval {
	my $sth = SC->dbh->prepare($sql);
	#$sth->execute(@args);
	$sth->execute(($type =~ /all/i)? undef:$type);
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @facilities, new API::Facility(%$p);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return \@facilities;
}

# Delete all events, shakemaps, grids, and products related to a given
# event ID.  Product files and product directories will be deleted, too.
# This method will log an error and do nothing for events
# that have an event_type other than C<TEST>.
# 
# Return true/false for success/failure
sub erase_type {
    my ($class, $type) = @_;

    my $sth;
    my $fac_type;
    my $rc;

    eval {
	my ($nrec) = SC->dbh->selectrow_array(qq/
	    select count(*)
	      from facility
	     where facility_type = ?
			/, undef, $type);
        if ($nrec <= 0) {
            $SC::errstr = "Can't find facility $type in the database";
            return 0;
        }
	$rc = $nrec;

        # Determine the set of grids to be deleted
        my ($facility_id) = SC->dbh->selectcol_arrayref(qq/
            select facility_id
              from facility
             where facility_type = ?/, undef, $type);

         foreach my $fac_id (@$facility_id) {
             $class->erase_facility($fac_id);
         }

    };
    if ($@) {
	$SC::errstr = $@;
	return 0;
    }
    return $rc;
}


# Delete all events, shakemaps, grids, and products related to a given
# event ID.  Product files and product directories will be deleted, too.
# This method will log an error and do nothing for events
# that have an event_type other than C<TEST>.
# 
# Return true/false for success/failure
sub erase_facility {
    my ($class, $facility_id) = @_;

    my $sth;
    my $fac_type;
    my $rc;

    eval {
	my ($nrec) = SC->dbh->selectrow_array(qq/
	    select count(*)
	      from facility
	     where facility_id = ?
			/, undef, $facility_id);
        if ($nrec <= 0) {
            $SC::errstr = "Can't find facility $facility_id in the database";
            return 0;
        }
	$rc = $nrec;

         # Delete grids and associated values
         my $sth_del_facility_attribute = SC->dbh->prepare(qq/
             delete from facility_attribute
              where facility_id = ?/);
         my $sth_del_facility_feature = SC->dbh->prepare(qq/
             delete from facility_feature
              where facility_id = ?/);
         my $sth_del_facility_fragility = SC->dbh->prepare(qq/
             delete from facility_fragility
              where facility_id = ?/);
         my $sth_del_facility_fragility_model = SC->dbh->prepare(qq/
             delete from facility_fragility_model
              where facility_id = ?/);
         my $sth_del_facility_fragility_probability = SC->dbh->prepare(qq/
             delete from facility_fragility_probability
              where facility_id = ?/);
         my $sth_del_facility_model = SC->dbh->prepare(qq/
             delete from facility_model
              where facility_id = ?/);
         my $sth_del_facility_model_shaking = SC->dbh->prepare(qq/
             delete from facility_model_shaking
              where facility_id = ?/);
         my $sth_del_facility_notification_request = SC->dbh->prepare(qq/
             delete from facility_notification_request
              where facility_id = ?/);
         my $sth_del_facility_process = SC->dbh->prepare(qq/
             delete from facility_process
              where facility_id = ?/);
         my $sth_del_facility_shaking = SC->dbh->prepare(qq/
             delete from facility_shaking
              where facility_id = ?/);
         my $sth_del_geometry_facility_profile = SC->dbh->prepare(qq/
             delete from geometry_facility_profile
              where facility_id = ?/);
         my $sth_del_station_facility = SC->dbh->prepare(qq/
             delete from station_facility
              where facility_id = ?/);
         my $sth_del_facility = SC->dbh->prepare(qq/
             delete from facility
              where facility_id = ?/);

	$sth_del_facility_attribute->execute($facility_id);
	$sth_del_facility_feature->execute($facility_id);
	$sth_del_facility_fragility->execute($facility_id);
	$sth_del_facility_fragility_model->execute($facility_id);
	$sth_del_facility_fragility_probability->execute($facility_id);
	$sth_del_facility_model->execute($facility_id);
	$sth_del_facility_model_shaking->execute($facility_id);
	$sth_del_facility_notification_request->execute($facility_id);
	$sth_del_facility_process->execute($facility_id);
	$sth_del_facility_shaking->execute($facility_id);
	$sth_del_geometry_facility_profile->execute($facility_id);
	$sth_del_station_facility->execute($facility_id);
	$sth_del_facility->execute($facility_id);
    };
    if ($@) {
	$SC::errstr = $@;
	return 0;
    }
    return $rc;
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
			#if ($self->process_facility_model) {
			#	SC->log(2, "facility model processed");
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

