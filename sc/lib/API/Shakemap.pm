
# $Id: Shakemap.pm 64 2007-06-05 14:58:38Z klin $

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

package API::Shakemap;

use SC;
use API::Event;

sub BEGIN {
    no strict 'refs';
    for my $method (qw(
			shakemap_id shakemap_version
			shakemap_status shakemap_region
			event_id event_version event_type generating_server
			lat_min lon_min lat_max lon_max
			generation_timestamp receive_timestamp
			begin_timestamp end_timestamp
			event_location_description event_timestamp
			magnitude mag_type lat lon depth
			superceded_timestamp seq
			)) {
	*$method = sub {
	    my $self = shift;
	    @_ ? ($self->{$method} = shift, return $self)
	       : return $self->{$method};
	}
    }
}


sub from_xml {
    my ($class, $xml_source) = @_;
    undef $SC::errstr;
    my $xml = SC->xml_in($xml_source);
    return undef unless defined $xml;
    unless (exists $xml->{'shakemap'}) {
	$SC::errstr = 'XML error: shakemap element not found';
	return undef;
    }
    $class->new(%{ $xml->{'shakemap'} });
}

sub newer_than {
    my ($class, $hwm, $oldest) = @_;
    
    undef $SC::errstr;
    my @newer;
    my @args = ($hwm);
    my $sql =  qq/
        select s.shakemap_id,
               s.shakemap_version
          from shakemap s
            inner join event e on (s.event_id = e.event_id)
         where s.seq > ?
           and e.event_type <> 'TEST'
		   and (e.superceded_timestamp IS NULL)
		   and (s.superceded_timestamp IS NULL)
		   and datediff(now(), e.event_timestamp) < ?
		ORDER BY
				e.seq DESC
		/;
	$oldest = (SC->config->{rss}->{TIME_WINDOW}) unless ($oldest);
	push @args, $oldest;
	
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
    my ($class, $shakemap_id, $shakemap_version, $notification) = @_;

    undef $SC::errstr;
    my $shakemap;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select *
	      from shakemap s 
			inner join event e on (s.event_id = e.event_id)
	     where s.shakemap_id = ?
	       and s.shakemap_version = ?
		 order by e.seq DESC, s.shakemap_version DESC
		 /);
	$sth->execute($shakemap_id, $shakemap_version);
	my $p = $sth->fetchrow_hashref('NAME_lc');
	$shakemap = new API::Shakemap(%$p);
	$sth->finish;
	my @metric;
	$sth = SC->dbh->prepare(qq/
	    select shakemap_id,
	           shakemap_version,
		   metric as metric_name,
		   value_column_number,
		   min_value,
		   max_value
	      from shakemap_metric
	     where shakemap_id = ?
	       and shakemap_version = ?/);
	$sth->execute($shakemap_id, $shakemap_version);
	while ($p = $sth->fetchrow_hashref('NAME_lc')) {
	    my %h = %$p;
	    push @metric, \%h;
	}
	$shakemap->{'metric'} = \@metric;
	
	if ($notification) {
	    my @notification;
	    $sth = SC->dbh->prepare(qq/
		select n.delivery_status,
		       n.delivery_timestamp,
		       n.tries,
		       n.event_id,
		       n.shakecast_user,
		       su.username
		  from notification n inner join shakecast_user su
		    on n.shakecast_user = su.shakecast_user left join grid g
		    on g.grid_id = n.grid_id
		 where (g.shakemap_id = ? and g.shakemap_version = ?) or n.event_id = ?
		   group by n.shakecast_user/);
	    $sth->execute($shakemap_id,$shakemap_version,$shakemap_id);
	    while ($p = $sth->fetchrow_hashref('NAME_lc')) {
		my %h = %$p;
		push @notification, \%h;
	    }
	    $shakemap->{'notification'} = \@notification;
	}
	
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $shakemap) {
	$SC::errstr = "No shakemap for id-ver $shakemap_id-$shakemap_version";
    }
    return $shakemap;
}

# Given an event ID, return the matching shakemap that is not marked as
# being superceded.
sub current_version {
    my ($class, $event_id) = @_;

    undef $SC::errstr;
    my $shakemap;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select shakemap_id,
                   shakemap_version
	      from shakemap
	     where event_id = ?
	       and (superceded_timestamp IS NULL)/);
	$sth->execute($event_id);
	my $p = $sth->fetchrow_arrayref();
        $shakemap = $class->from_id(@$p);
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $shakemap) {
	$SC::errstr = "No current shakemap for id $event_id";
    }
    return $shakemap;
}

# Given an event ID, return the matching shakemap that is not marked as
# being superceded.
sub current_shakemap {
    my ($class) = @_;

    undef $SC::errstr;
    my $shakemap;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select shakemap_id,
                   shakemap_version
	      from shakemap
	     where (superceded_timestamp IS NULL)
		ORDER BY
			seq DESC
		 /);
	$sth->execute();
	my $p = $sth->fetchrow_arrayref();
        $shakemap = $class->from_id(@$p);
	$sth->finish;
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif (not defined $shakemap) {
	$SC::errstr = "No current shakemap";
    }
    return $shakemap;
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

# Instance methods

sub to_xml {
    my $self = shift;

    # generate <shakemap attr=value ...>
    my $xml = SC->to_xml_attrs(
	$self,
	'shakemap',
	[qw(
	    shakemap_id shakemap_version shakemap_status
	    event_id event_version generating_server shakemap_region
	    lat_min lon_min lat_max lon_max
	    generation_timestamp
	    begin_timestamp end_timestamp
	   )],
	0);
    # add metrics
    foreach my $mp ( @{ $self->metric() } ) {
	$xml .= SC->to_xml_attrs($mp,
	    'metric', [qw(metric_name min_value max_value)], 1);
    }
    # generate </shakemap>
    $xml .= '</shakemap>';

    return $xml;
}

sub metric {
    my $self = shift;
    @_ ? ($self->{'metric'} = shift, return $self)
	       : return $self->{'metric'};
}

sub write_to_db {
    my $self = shift;
    my $rc = 1;
    my $sth;
    
    undef $SC::errstr;
    eval {
        # check for existing record
	my $sth_getkey = SC->dbh->prepare_cached(qq/
	    select shakemap_id
	      from shakemap
	     where shakemap_id=?
	       and shakemap_version=?/, {});
        if (SC->dbh->selectrow_array($sth_getkey, {},
                $self->{'shakemap_id'},
                $self->{'shakemap_version'})) {
            $rc = 2;
	    return;	# return from eval
        }

	# TODO is INITIAL_VERSION needed for shakemap?
	#my $initial_version = ($sth->rows == 0 ? 1 : 0);
	SC->dbh->do(qq/
	    insert into shakemap (
		shakemap_id, shakemap_version, shakemap_status,
		event_id, event_version, generating_server, shakemap_region,
		lat_min, lon_min, lat_max, lon_max,
		generation_timestamp, receive_timestamp,
		begin_timestamp, end_timestamp)
	      values (?,?,?,?,?,?,?,?,?,?,?,
		$SC::to_date, $SC::to_date, $SC::to_date,$SC::to_date)/,
	    {},
	    $self->shakemap_id,
	    $self->shakemap_version,
	    $self->shakemap_status,
	    $self->event_id,
	    $self->event_version,
	    $self->generating_server,
	    $self->shakemap_region,
	    $self->lat_min,
	    $self->lon_min,
	    $self->lat_max,
	    $self->lon_max,
	    $self->generation_timestamp,
	    $self->receive_timestamp,
	    $self->begin_timestamp,
	    $self->end_timestamp);
	$sth = SC->dbh->prepare(qq/
	    insert into shakemap_metric (
		shakemap_id, shakemap_version, metric,
		min_value, max_value)
	      values (?,?,?,?,?)/);
	foreach my $mp ( @{ $self->metric() } ) {
	    SC->log(4, 'Metric', $mp->{'metric_name'}, 'between',
		    $mp->{'min_value'}, 'and', $mp->{'max_value'});
	    $sth->execute(
		$self->shakemap_id,
		$self->shakemap_version,
		$mp->{'metric_name'},
		$mp->{'min_value'},
		$mp->{'max_value'});
	}

	# Supercede all other versions of this shakemap.
	#
	# NOTE: it is correct below to use event_id rather than shakemap_id.
	# The constraint is that there be only one current shakemap per event.
	# Subsequent shakemaps for the same event need not have the same
	# shakemap_id but they will obviously have the same event_id.
	my $sth = SC->dbh->prepare(qq/
	    update shakemap
	       set superceded_timestamp = $SC::to_date
	     where event_id = ?
	       and not (shakemap_id = ? and shakemap_version = ?)
	       and superceded_timestamp IS NULL/);
	$sth->execute(SC->time_to_ts(),
		$self->event_id,
		$self->shakemap_id,
		$self->shakemap_version);
        # Update HWM
        my ($hwm) = SC->dbh->selectrow_array(qq/
            select seq
              from shakemap
	     where shakemap_id = ?
	       and shakemap_version = ?/, undef,
	    $self->shakemap_id, $self->shakemap_version);
        SC::Server->this_server->update_shakemap_hwm($hwm);
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
    my $event = API::Event->from_id($self->event_id, $self->event_version);
    return ($event and $event->is_local_test);
}

# Returns the absolute path of the directory that contains the product files
# for this shakemap.  The directory need not exist.
sub product_dir {
    my $self = shift;
    return SC->config->{'DataRoot'} . '/' .
	    $self->{'shakemap_id'} . '-' . $self->{'shakemap_version'};
}

sub process_new_shakemap {
    my $self = shift;

    # Add it to the database.
    my $write_status = $self->write_to_db;

    if ($write_status == 0) {
	return 0;
    } elsif ($write_status == 2) {
	# shakemap already exists, do nothing
	return 1;
    } elsif ($write_status == 1) {
	# A new record (might be a new version of an existing shakemap)
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
		    'new_shakemap', $self->shakemap_id, $self->shakemap_version);
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

Shakemap - Shekemap for ShakeCast

=head1 DESCRIPTION

=head1 METHODS

=head2 Class Methods

=over 4

=item C<from_xml>

  $shakemap = SC::Shakemap->from_xml( $xml_string );
  $shakemap = SC::Shakemap->from_xml( $filename );

Creates a new Shakemap from the given XML.  If the argument appears to be XML
(it contains < and > characters) then it is treated as the source.  Otherwise,
the argument is assumed to be the name of a file whose contents is the XML
specification of the product.

=item C<from_id>

  $shakemap = SC::Shakemap->from_id( $shakemap_id, $shakemap_version )

Creates a SC::Shakemap instance bu retrieving data with the given id and
version from the local database.  This method returns C<undef> if there
is no such record.

=item C<newer_than>

  @shakemaps = SC::Shakemap->newer_than( $hwm )

Returns a list of all locally stored Shakemaps that have a C<seq> value that is
greater than the specified high-water mark.  Each Shakemap record inserted
into the local database is assigned a unique sequence number that is
guaranteed to be larger than any previously stored.  The seq value is also
updated whenever any change is made to the Shakemap record.

An empty list is returned
if there are no locally stored Shakemaps newer than this.

=back

=head2 Instance Methods

=over4

=item C<to_xml>

  $xml = $shakemap->to_xml;

Returns an XML representation of the Shakemap.

=item C<metric>

  $metricp = $shakemap->metric;
  $shakemap->metric( \@metrics );

Gets or sets the metrics for this shakemap.  Each entry in the list of 
metrics is a hashref containing the following keys: C<metric_name,
max_value, min_value, value_column_number>.  Order of elements in the list
is not significant.  Setting the metrics will replace all previously stored
metrics, even if the new list does not specify a replacement for an old
metric.

=item C<write_to_db>

 $return_code = $shakemap->write_to_db

Writes the shakemap to the local database.  If the record already exists
then it is updated, otherwise a new record is inserted.  In either case the
sequence number for the record is updated.  Associated shakemap_metric records
will also be created or updated.

The method returns 1 if the record was inserted successfully, 2 if a shakemap
record with the same id and version already exists, and 0 if there was
an error.  C<$SC::errstr> will contain an error message if 0 is returned, and
will be C<undef> otherwise.

=item C<process_new_shakemap>

  $return_code = $shakemap->process_new_shakemap

This method operates on a newly-received Shakemap that has been created via
L<from_xml>.  It is first stored locally, then messages are queued up for
any downstream ShakeCast servers.  If the shakemap record already exists
locally it is not forwarded, on the assumption that it was passed along when
it was first received.

This method returns 0 for errors, otherwise 1 is retured.

=back

=cut
