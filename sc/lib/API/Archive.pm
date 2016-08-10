
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

package API::Damage;

use SC;
use API::Event;
use API::Shakemap;
use API::Facility;
use API::Station;
use API::APIUtil;

my $options = API::APIUtil::config_options();
my $count = ($options->{'topics_per_page'}) ? $options->{'topics_per_page'} : 200;


sub BEGIN {
    no strict 'refs';
    for my $method (qw(
			event_id event_version generating_server
			shakemap_id shakemap_version
			lat_min lon_min lat_max lon_max
			origin_lat origin_lon
			latitude_cell_count longitude_cell_count
			grid_id
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

sub from_id {
    my ($class, $options) = @_;

	use Storable;
	
    undef $SC::errstr;
    my $damage;
    my $sth;
	my $shakemap_id = $options->{'shakemap_id'};
	my $shakemap_version = $options->{'shakemap_version'};
	my $evt_dir = SC->config->{'DataRoot'}."/$shakemap_id-$shakemap_version";
	my $hash_file = "$evt_dir/damage.hash";
	
	if (-e $hash_file) {
		$damage = retrieve($hash_file);
	} else {
		$damage = $class->from_id_damage($options);
	}

	if ($options->{'type'} && $options->{'type'} ne 'ALL') {
		foreach my $facility_id (keys %{$damage->{'facility_damage'}}) {
			next if ($damage->{'facility_damage'}->{$facility_id}->{'facility_type'} eq $options->{'type'});
			delete $damage->{'facility_damage'}->{$facility_id};
			delete $damage->{'facility_probability'}->{$facility_id};
		}
	}
	
	if ($damage->{'count'} > $count) {
		foreach my $facility_id (keys %{$damage->{'facility_damage'}}) {
			next unless ($damage->{'facility_damage'}->{$facility_id}->{'damage_level'} eq 'GREEN');
			delete $damage->{'facility_damage'}->{$facility_id};
			delete $damage->{'facility_probability'}->{$facility_id};
		}
		$damage->{'skip_damage'} = 'GREEN';
	}
	
    return $damage;
}

sub from_id_damage {
    my ($class, $options) = @_;

	use Storable;
	
    undef $SC::errstr;
    my $damage;
    my $sth;
	my $shakemap_id = $options->{'shakemap_id'};
	my $shakemap_version = $options->{'shakemap_version'};
	my $evt_dir = SC->config->{'DataRoot'}."/$shakemap_id-$shakemap_version";
	my $start = $options->{'start'};
	#my $shakemap = new API::Shakemap->from_id($shakemap_id, $shakemap_version);
	my $metric = $class->metric_list($shakemap_id, $shakemap_version);
	my $fac_metric = $class->fragility_metric_list($shakemap_id, $shakemap_version);
	my $metric_str = join ',', map {'fs.value_'.$metric->{$_}.' as '.$_ } keys %$metric;
	my @facilities;

    #eval {
	$sth = SC->dbh->prepare(qq/
	    select *
		FROM 
			grid 
	     where shakemap_id = ?
	       and shakemap_version = ?/);
	$sth->execute($shakemap_id, $shakemap_version);
	my $p = $sth->fetchrow_hashref('NAME_lc');
	my $data = new API::Damage(%$p);
	my %grid = %$data;
	$damage->{'grid'} = \%grid;
	$sth->finish;
	my %fac_damage;
	my $sql = qq/
	    select fs.facility_id, f.facility_name, f.facility_type, 
			f.lat_min, f.lat_max, f.lon_min, f.lon_max, fs.grid_id, fs.dist, ff.*,
			$metric_str
	      from facility_shaking fs inner join facility_fragility ff
		  ON fs.facility_id = ff.facility_id
		  INNER JOIN facility f on fs.facility_id = f.facility_id
		  INNER JOIN damage_level dl on ff.damage_level = dl.damage_level
	     where grid_id = ?
			AND fs.value_%VALNO% > ff.low_limit 
			AND fs.value_%VALNO% <= ff.high_limit
			AND ff.metric = ?
		 ORDER BY dl.severity_rank DESC, dist
		 /;
	my %damage_level;
	my $damage_count;
	foreach my $metric_key (@$fac_metric) {
		next unless $metric->{$metric_key};
		my $exe_sql = $class->dosubs($sql, $metric->{$metric_key});
		$sth = SC->dbh->prepare($exe_sql);
		$sth->execute($grid{grid_id}, $metric_key);
		while ($p = $sth->fetchrow_hashref('NAME_lc')) {
			my %h = %$p;
			$fac_damage{($p->{facility_id})} = \%h;
			push @facilities, $p->{facility_id};
			$damage_level{$p->{damage_level}}++;
			$damage_count++;
		}
	}
	$damage->{'facility_damage'} = \%fac_damage;
	$damage->{'damage_summary'} = \%damage_level;
	$damage->{'count'} = $damage_count;
	
	my %fac_probability;
	my $hash_file = "$evt_dir/frag_prob.hash";
	my $hashref = retrieve($hash_file) if (-e $hash_file);
	foreach my $fac_id (@facilities) {
		#my %h = %{$hashref->{$fac_id}};
		$fac_probability{$fac_id} = $hashref->{$fac_id} if ($hashref->{$fac_id});
		#push @{$fac_probability{$fac_id}}, $hashref->{$fac_id} if ($hashref->{$fac_id});
	    #push @metric, \%h;
	}
	$damage->{'facility_probability'} = \%fac_probability;
	#$damage->{'facility_probability'} = $hashref;
	$damage->{'facility_attribute'} = facility_evaluate_attr($evt_dir);

	$hash_file = "$evt_dir/damage.hash";
	store $damage, $hash_file;
    #};
	
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $damage) {
	$SC::errstr = "No damage for id $shakemap_id";
    }
    return $damage;
}

sub dosubs {
    my ($class, $str, $valno) = @_;
    
    $str =~ s/%VALNO%/$valno/g if defined $valno;
    return $str;
}

# Given an event ID, return the matching event that is not marked as
# being superceded.
sub archive_list {
    my ($class, $type) = @_;

    undef $SC::errstr;
    my @damages;
	my $sql = qq/
		SELECT e.event_id, s.shakemap_id, s.shakemap_version,
			e.event_timestamp
		FROM 
			event e left join shakemap s
			on e.event_id = s.shakemap_id
		WHERE e.event_type = 'ACTUAL'
		GROUP BY e.event_id
		ORDER BY e.seq DESC, s.shakemap_version DESC
		LIMIT $type, $count
		/;
    eval {
	my $sth = SC->dbh->prepare($sql);
	#$sth->execute(@args);
	$sth->execute();
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @damages, new API::Damage(%$p);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return \@damages;
}

sub fragility_metric_list {
    my ($class, $shakemap_id, $shakemap_version) = @_;

   undef $SC::errstr;
    my @metrics;
	my $sql = qq/
		SELECT ff.metric
		FROM facility_fragility ff
			INNER JOIN facility_shaking fs ON ff.facility_id = fs.facility_id
			INNER JOIN grid g ON g.grid_id = fs.grid_id
		WHERE g.shakemap_id = ?
			AND g.shakemap_version = ?
		GROUP BY ff.metric
		/;
    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute($shakemap_id, $shakemap_version);
	while (my $p = $sth->fetchrow_arrayref()) {
	    push @metrics, lc($p->[0]);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return \@metrics;
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
		next unless ($p->{'value_column_number'} > 0);
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

sub facility_evaluate_attr {
    my ($evt_dir) = @_;

	use Storable;
    undef $SC::errstr;
    my $attrhash;
	my $sql = qq/
		SELECT attribute_name
		FROM 
			facility_attribute
		GROUP BY
			attribute_name
		/;
    eval {
	my $sth = SC->dbh->prepare($sql);
	$sth->execute();
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
		my $hash_file = "$evt_dir/facility_".lc($p->{'attribute_name'}).".hash";
		next unless (-f $hash_file);
	    $attrhash->{lc($p->{'attribute_name'})} = retrieve($hash_file);
	}
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    }
    return $attrhash;
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
			#if ($self->process_damage_model) {
			#	SC->log(2, "damage model processed");
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

