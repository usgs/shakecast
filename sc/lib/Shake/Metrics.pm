
# $Id: Fragility.pm 441 2008-08-14 18:54:49Z klin $

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

package Shake::Metrics;

#############################################################################
# Global definitions of fragility/metric models
#############################################################################
use Shake::Metric::Arias;
#############################################################################
# End global definitions
#############################################################################

$^W = 1;

use SC;

# cache the server_id for the local server (won't change)
my $local_server_id;

my $SCRIPTLOC = '/scripts/s';
my $USER_AGENT = "ShakeCast/$SC::VERSION";

my $SHAKE_BASE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
	    delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       fn.facility_id,
       g.grid_id,
       n.metric,
       sh.value_%VALNO%,
	   udm.delivery_address,
       %SYSDATE%
  from grid g
       straight_join shakemap s
       straight_join event e
       straight_join facility_shaking sh
       straight_join facility_notification_request fn
       straight_join notification_request n
       straight_join user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'shaking'
   and n.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and s.event_id = e.event_id and s.event_version = e.event_version
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.notification_request_id = n.notification_request_id
   and sh.value_%VALNO% >= n.limit_value
__SQL__
;

my $SHAKE_BASE_PROFILE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
		delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       fn.facility_id,
       g.grid_id,
       n.metric,
       sh.value_%VALNO%,
	   group_concat(u.delivery_address),
       %SYSDATE%
  from grid g
       straight_join shakemap s
       straight_join event e
       straight_join facility_shaking sh
       straight_join geometry_facility_profile fn
       straight_join ((geometry_user_profile gup 
	inner join profile_notification_request n on gup.profile_id = n.profile_id )
	inner join user_delivery_method u on u.delivery_method = n.delivery_method 
	and gup.shakecast_user = u.shakecast_user)
 where n.profile_id = ?
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'shaking'
   and n.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and s.event_id = e.event_id and s.event_version = e.event_version
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.profile_id = n.profile_id
   and sh.value_%VALNO% >= n.limit_value
   group by fn.facility_id
__SQL__
;

my $DAMAGE_BASE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
	   delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       fn.facility_id,
       g.grid_id,
       ff.metric,
       sh.value_%VALNO%,
	   udm.delivery_address,
       %SYSDATE%
  from facility_fragility ff
       straight_join facility_shaking sh
		straight_join grid g
       straight_join shakemap s
       straight_join event e
       straight_join facility_notification_request fn
       straight_join notification_request n
       straight_join user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and sh.value_%VALNO% between ff.low_limit and ff.high_limit
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'damage'
   and fn.facility_id = ?
   and ff.damage_level = ?
   and ff.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and s.event_id = e.event_id and s.event_version = e.event_version
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is NULL)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.notification_request_id = n.notification_request_id
   and sh.facility_id = ff.facility_id
   and n.damage_level = ff.damage_level;
__SQL__
    ;

my $DAMAGE_BASE_PROFILE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
		delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       fn.facility_id,
       g.grid_id,
       ff.metric,
       sh.value_%VALNO%,
	   group_concat(u.delivery_address),
       %SYSDATE%
  from facility_fragility ff
       straight_join facility_shaking sh
		straight_join grid g
       straight_join shakemap s
       straight_join event e
       straight_join geometry_facility_profile fn
       straight_join ((geometry_user_profile gup 
	inner join profile_notification_request n on gup.profile_id = n.profile_id )
	inner join user_delivery_method u on u.delivery_method = n.delivery_method 
	and gup.shakecast_user = u.shakecast_user)
 where n.profile_id = ?
   and sh.value_%VALNO% between ff.low_limit and ff.high_limit
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'damage'
   and fn.facility_id = ?
   and ff.damage_level = ?
   and ff.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and s.event_id = e.event_id and s.event_version = e.event_version
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is NULL)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.profile_id = n.profile_id
   and sh.facility_id = ff.facility_id
   and n.damage_level = ff.damage_level
   group by fn.facility_id
__SQL__
    ;



# ======================================================================
# Class methods

sub local_server_id {
    my $class = shift;
    if (@_) {
        $local_server_id = shift;
    } elsif (not defined $local_server_id) {
	eval {
	    $local_server_id = SC->dbh->selectrow_array(qq/
		select server_id
		  from server
		 where self_flag = 1/); 
	};
	$SC::errstr = $@ if $@;
    }
    return $local_server_id;
}
 
sub this_server {
    my $class = shift;

    undef $SC::errstr;
    my $server;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select *
	      from server
	     where self_flag = 1/);
	$sth->execute;
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    if ($server) {
		$SC::errstr = "Multiple servers claiming to be self";
		return undef;
	    } else {
		$server = new SC::Server(%$p);
	    }
	}
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif ($sth->rows == 0) {
	$SC::errstr = "No server for self";
    }
    return $server;
}

sub from_id {
    my ($class, $server_id) = @_;

    undef $SC::errstr;
    my $server;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select *
	      from server
	     where server_id = ?/);
	$sth->execute($server_id);
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    if ($server) {
		$SC::errstr = "Duplicate server_id $server_id";
		return undef;
	    } else {
		$server = new SC::Server(%$p);
	    }
	}
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif ($sth->rows <= 0) {
	$SC::errstr = "No server for server_id $server_id";
    }
    return $server;
}

sub upstream_servers {
    my $class = shift;
    my @servers = ();

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
	    select *
	      from server
	     where upstream_flag = 1/);
	$sth->execute;
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @servers, new SC::Server(%$p);
	}
    };
    $SC::errstr = $@, return () if $@;
    return @servers;
}

sub downstream_servers {
    my $class = shift;
    my @servers = ();

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
	    select *
	      from server
	     where downstream_flag = 1/);
	$sth->execute;
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @servers, new SC::Server(%$p);
	}
    };
    $SC::errstr = $@, return () if $@;
    return @servers;
}

# returns a list of all custom modules that should be polled for new metrics, etc.
sub metrics_to_poll {
    my $class = shift;
    my (@metrics, @models);

    undef $SC::errstr;
    eval {
	my $model_conf = SC->config->{'Metric'}->{'MODEL'};
	chomp($model_conf);
	($model_conf) = $model_conf =~ /^\s*(.+?)\s*$/;
	push @metrics, split(' ',$model_conf);
	foreach my $metric (@metrics) {
		my %p;
		$p{'METRIC'} = $metric;
	    push @models, new Shake::Metrics(%p);
	}
    };
    $SC::errstr = $@, return () if $@;
    return @models;
}


sub BEGIN {
    no strict 'refs';
    # Not all attributes have method accessors.  I am only generating those
    # that are used within the application.
    for my $method (qw(
			server_id dns_address ip_address 
			password server_status
                        event_hwm shakemap_hwm product_hwm
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
    # what was I thinking of here...
    # $self->receive_timestamp(SC::Util::time_to_ts);
    Carp::carp "Odd (wrong?) number of parameters in new()" if $^W && (@_ & 1); 
    while (@_) {
	my $method = shift; 
	my $value = shift;
	$self->can($method) ? $self->$method($value)
			    : ($self->{$method} = $value);
    }
    return $self;
}

# ======================================================================
# Instance methods

sub as_string {
    my $self = shift;
    return sprintf "ID=%d, DNS=%s, status=%s",
	map { defined $_ ? $_ : '' } (
	    $self->server_id,
	    $self->dns_address,
	    $self->server_status) ;
}

sub permitted {
    my ($self, $access) = @_;

    undef $SC::errstr;
    return $self->{'upstream_flag'}   if $access eq 'U';
    return $self->{'query_flag'}      if $access eq 'Q';
    return $self->{'downstream_flag'} if $access eq 'D';
    return $self->{'poll_flag'}       if $access eq 'P';
}

sub send {
    my ($self, $action, $content) = @_;
    my ($status, $message, $rv);

    # avoid sucking all this in for clients that don't need to send messages
    require LWP::UserAgent;
    require HTTP::Request;
    require MIME::Base64;

    my $url = 'http://' . $self->dns_address . "$SCRIPTLOC/$action.pl";
		
    SC->log(3, "server->send($url)");
    SC->log(3, "content:", $content);
    my $ua = new LWP::UserAgent();
    $ua->agent($USER_AGENT);
	$ua->proxy(['http'], SC->config->{'ProxyServer'})
		if (defined SC->config->{'ProxyServer'});
    my $req = new HTTP::Request(POST => $url ,undef, $content);
    my $pwd = (defined $self->password ?
	MIME::Base64::decode_base64($self->password) : '');
    $req->authorization_basic(SC::Server->local_server_id(), $pwd);

    my $resp = $ua->request($req);
    SC->log(3, "response:", $resp->status_line);
    if ($resp->is_success) {
	my $p;
	SC->log(3, "content:", $resp->content);
	eval {$p = SC->xml_in($resp->content)};
	# Reply should be an XML document whose root element is either
	# <shakecast_status> or <shakecast_response>.  The former is used
	# when there is no return other than status.  The latter includes
	# <shakecast_status> as one of its sub-elements, and <response_body>
	# as the other sub-element.
	if ($SC::errstr) {
	    # XML parse failed
	    $status = SC_BAD_XML;
	    $message = $SC::errstr;
	} elsif ($@) {
	    # XML parse failed
	    $status = SC_BAD_XML;
	    $message = "error parsing shakecast_response: $@";
	} elsif (exists $p->{'shakecast_response'}) {
	    # grab status sub-element
	    my $s = $p->{'shakecast_response'}->{'shakecast_status'};
	    $status = $s->{'status'};
	    $message = $s->{'content'};
	    $rv = $p->{'shakecast_response'}->{'response_body'} if $status eq SC_OK;
	} elsif (exists $p->{'shakecast_status'}) {
	    # just a status return with no payload
	    $status = $p->{'shakecast_status'}->{'status'};
	    $message = $p->{'shakecast_status'}->{'content'};
	} else {
	    $status = SC_UNKNOWN;
	    $message = 'No status returned';
	}
	$self->update_status(1);
	# TODO log the exchange
    } else {
	# TODO handle can't connect; retry with IP address
	$status = SC_HTTP_FAIL;
	$message = $resp->status_line;
	$self->update_status(0);
	# TODO log the exchange ?
	SC->log(2, "http failure: $message");
    }
    return ($status, $message, $rv);
}

# Returns a two-element list.  First element is return status: SC_OK,
# SC_FAIL, or SC_HTTP_FAIL.  Second element is detail message text.
# THe product can be specified either as a ref to a SC::Product or as the
# id of a product.
sub get_file {
    my ($self, $product) = @_;
    my @ret;

    unless (ref $product) {
	# assume we were passed an ID; look up the product
	my $id = $product;
        $product = SC::Product->from_id($id);
        if (not defined $product) {
	    return (SC_FAIL,($SC::errstr || "no product record for id=$id"));
	}
    }
    SC->log(3, "server->get_file:", $product->as_string);
    if (-f $product->abs_file_path) {
	# already have the file so we're done
	return (SC_OK, 'file already exists');
    } elsif ($self->server_id == SC::Server->local_server_id) {
        # trying to get the file from ourselves, which should only happen
        # when doing local testing and the file is missing.  Treat as a
        # failure.
        return (SC_FAIL, 'get from self but file does not exist');
    }

    # avoid sucking all this in for clients that don't need to send messages
    eval {
	require LWP::UserAgent;
	require HTTP::Request;
	require MIME::Base64;
    };

    my $ua = new LWP::UserAgent();
    $ua->agent($USER_AGENT);
	$ua->proxy(['http'], SC->config->{'ProxyServer'})
		if (defined SC->config->{'ProxyServer'});
    my $url = 'http://' . $self->dns_address . 
	    "$SCRIPTLOC/product_file.pl" .
	    '?ID=' . $product->shakemap_id .
	    ';VER=' . $product->shakemap_version .
	    ';NAME=' . $product->file_name;
    my $req = new HTTP::Request(GET => $url);
    my $pwd = (defined $self->password ?
	MIME::Base64::decode_base64($self->password) : '');
    $req->authorization_basic(SC::Server->local_server_id(), $pwd);

    my $resp = $ua->request($req);
    SC->log(3, "response:", $resp->status_line);
    if ($resp->is_success) {
	if (length $resp->content > 0) {
	    my $fn = $product->abs_file_path;
	    $fn =~ s#/[^/]*$##;
	    unless (-d $fn) {
		mkdir $fn or return (SC_FAIL, "Local dir create failed: $!");
	    }
	    my $fh = new IO::File($product->abs_file_path, 'w');
	    if (not defined $fh) {
		return (SC_FAIL, "Local file create failed: $!");
	    }
	    binmode $fh;
	    $fh->write($resp->content, length $resp->content);
	    $fh->close;	    
	    @ret = (SC_OK, '');
	} else {
	    @ret = (SC_FAIL, 'remote file not present');
	}
	# considered a success as far as server status is concerned because
	# we successfully communicated with the remote server
	$self->update_status(1);
    } else {
	# TODO handle can't connect; retry with IP address
	@ret = (SC_HTTP_FAIL, $resp->status_line);
	$self->update_status(0);
	# TODO log the exchange ?
	SC->log(0, "http failure:", $resp->status_line);
    }
    return @ret;
}

sub update_event_hwm {
    my ($self, $hwm) = @_;

    undef $SC::errstr;
    $self->event_hwm($hwm);
    eval {
        SC->dbh->do(qq/
            update server
               set event_hwm = ?
             where server_id = ?/, undef,  $hwm, $self->server_id);
	SC->dbh->commit;
    };
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}

sub update_shakemap_hwm {
    my ($self, $hwm) = @_;

    undef $SC::errstr;
    $self->shakemap_hwm($hwm);
    eval {
        SC->dbh->do(qq/
            update server
               set shakemap_hwm = ?
             where server_id = ?/, undef,  $hwm, $self->server_id);
	SC->dbh->commit;
    };
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}

sub update_product_hwm {
    my ($self, $hwm) = @_;

    undef $SC::errstr;
    $self->product_hwm($hwm);
    eval {
        SC->dbh->do(qq/
            update server
               set product_hwm = ?
             where server_id = ?/, undef,  $hwm, $self->server_id);
	SC->dbh->commit;
    };
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}

sub update_status {
    my ($self, $ok) = @_;

    undef $SC::errstr;
    return 1 if not defined SC->dbh;
    eval {
	if ($ok) {
	    SC->dbh->do(qq/
		update server
		   set last_heard_from = $SC::to_date,
		       error_count = 0,
                       server_status = 'ALIVE'
		 where server_id = ?/, {}, SC->time_to_ts(), $self->server_id);
	} else {
	    SC->dbh->do(qq/
		update server
		   set error_count = error_count + 1,
                       server_status = 'UNKNOWN'
		 where server_id = ?/, {}, $self->server_id);
	}
	SC->dbh->commit;
    };
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}

sub update_hwms {
    my ($self, $e_hwm, $s_hwm, $p_hwm) = @_;
    my $changed = 0;

    undef $SC::errstr;
    $self->event_hwm($e_hwm),    $changed++ if $self->event_hwm != $e_hwm;
    $self->shakemap_hwm($s_hwm), $changed++ if $self->shakemap_hwm != $s_hwm;
    $self->product_hwm($p_hwm),  $changed++ if $self->product_hwm != $p_hwm;
    return 1 unless $changed;
    eval {
	SC->log(2, "event_hwm: $e_hwm, shakemap_hwm: $s_hwm, product_hwm: $p_hwm");
	SC->dbh->do(qq/
	    update server
	       set event_hwm = ?,
	           shakemap_hwm = ?,
	           product_hwm = ?
	     where server_id = ?/, {},
	    $self->event_hwm,
	    $self->shakemap_hwm,
	    $self->product_hwm,
	    $self->server_id);
	SC->dbh->commit;
    };
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}

sub poll_for_updates {
    my $self = shift;

    require SC::Event;
    require SC::Shakemap;
    require SC::Product;

    # Query for updates
    # If we have not received anything from this server then limit time
    # so that only current things are delivered (we still will get the hwm
    # for each type).
    my $oldest = '';
    if (not $self->event_hwm) {
	$oldest = SC->time_to_ts();
    }

    my $e_hwm = $self->event_hwm;
    my $s_hwm = $self->shakemap_hwm;
    my $p_hwm = $self->product_hwm;

    # Build the query
    my $q_xml = qq{
<query event_hwm='$e_hwm' shakemap_hwm='$s_hwm' product_hwm='$p_hwm' oldest='$oldest' />};

    # send the query
    my ($status, $message, $rv) = $self->send('poll', $q_xml);
    if ($status ne SC_OK) {
        $SC::errstr = $message;
        return 0;
    }
    
    eval {
	# Instantiate new items
	die 'did not find query_result element'
	    unless exists $rv->{'query_result'};
	my $response = $rv->{'query_result'};
	my @items;
	if (exists $response->{'event'}) {
	    if (ref $response->{'event'} eq 'HASH') {
		@items = ($response->{'event'});
	    } else {
		@items = @{ $response->{'event'} };
	    }
	    SC->log(2, "poll got", scalar @items, "events");
	    foreach my $xml (@items) {
		SC::Event->new(%$xml)->process_new_event;
	    }
	}
	if (exists $response->{'shakemap'}) {
	    if (ref $response->{'shakemap'} eq 'HASH') {
		@items = ($response->{'shakemap'});
	    } else {
		@items = @{ $response->{'shakemap'} };
	    }
	    SC->log(2, "poll got", scalar @items, "shakemaps");
	    foreach my $xml (@items) {
		SC::Shakemap->new(%$xml)->process_new_shakemap;
	    }
	}
	if (exists $response->{'product'}) {
	    if (ref $response->{'product'} eq 'HASH') {
		@items = ($response->{'product'});
	    } else {
		@items = @{ $response->{'product'} };
	    }
	    SC->log(2, "poll got", scalar @items, "products");
	    foreach my $xml (@items) {
		SC::Product->new(%$xml)->process_new_product($self);
	    }
	}

	# Store new HWMs
	$self->update_hwms(
	    $response->{'event_hwm'},
	    $response->{'shakemap_hwm'},
	    $response->{'product_hwm'}) or die $SC::errstr;
    };
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}

sub dosubs {
    my ($str, $valno) = @_;
    
    my $sysdate = "'" . SC->time_to_ts . "'";
    $str =~ s/%SYSDATE%/$sysdate/g;
    $str =~ s/%VALNO%/$valno/g if defined $valno;
    return $str;
}


sub nz {
    $_[0] ? $_[0] : 0;
}


sub get_metric {
    my ($class, $name) = @_;
	my $p;
	
    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select metric_id 
		from metric 
		where short_name = ?/);
	$sth->execute($name);
    $p = $sth->fetchrow_arrayref;
    $sth->finish;
    };
    $SC::errstr = $@, return undef if $@;
    return $p ? $p->[0] : undef;
}

sub get_parm {
    my ($class, $name) = @_;
	my $p;
	
    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select parmvalue 
		from notification_request_status 
		where parmname = ?/);
	$sth->execute($name);
    $p = $sth->fetchrow_arrayref;
    $sth->finish;
    };
    $SC::errstr = $@, return undef if $@;
    return $p ? $p->[0] : undef;
}

sub set_parm {
	my ($class, $name, $value, $nocommit) = @_;

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		update notification_request_status 
		set parmvalue = ? 
		where parmname = ?/);
    $sth->execute($value, $name);

    unless ($sth->rows) {
		my $sth1 = SC->dbh->prepare(qq/
			insert into notification_request_status 
				(parmname, parmvalue) values (?, ?)/);
		$sth1->execute($value, $name);
    }
    };
    SC->dbh->commit unless $nocommit;

    $SC::errstr = $@, return undef if $@;
}

sub get_max_seq {
    my $class = shift;
	my $p;
	
    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select max(grid_id) 
		from grid
		where latitude_cell_count > 0/);
	$sth->execute;
    $p = $sth->fetchrow_arrayref;
    $sth->finish;
    };
    $SC::errstr = $@, return undef if $@;
    return $p ? $p->[0] : undef;
}

sub get_new_grids {
    my ($class, $last_seq) = @_;
    my @grids = ();

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select s.shakemap_id, s.shakemap_version, g.grid_id
		from shakemap s, grid g, shakemap_metric m
		where s.shakemap_id = g.shakemap_id and
			s.shakemap_version = g.shakemap_version and
			s.shakemap_id = m.shakemap_id and 
			s.shakemap_version = m.shakemap_version and
			m.value_column_number is not null and
			s.superceded_timestamp is null and
			g.latitude_cell_count > 0 and
			g.grid_id > ?
		group by g.grid_id/);
	$sth->execute($last_seq);
	while (my $p = $sth->fetchrow_hashref('NAME_uc')) {
	    push @grids, $p;
	}
    };
    $SC::errstr = $@, return () if $@;
    return @grids;
}

sub get_facility_fragility_metric {
    my ($class, $seq, $metric, $sql) = @_;
    my @facility_shakings = ();

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select ff.facility_id, ff.damage_level, ff.low_limit, ff.high_limit $sql
		from facility_fragility ff, facility_shaking fs
		where ff.facility_id = fs.facility_id and
			fs.grid_id = ? and
			ff.metric = ?/);
	$sth->execute($seq, $metric);
	while (my $p = $sth->fetchrow_hashref('NAME_uc')) {
	    push @facility_shakings, $p;
	}
    };
    $SC::errstr = $@, return () if $@;
    return @facility_shakings;
}

sub get_facility_shaking {
    my ($class, $seq, $sql) = @_;
    my @facility_shakings = ();

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select fs.facility_id, fs.grid_id $sql
		from facility_shaking fs
		where fs.grid_id = ?/);
	$sth->execute($seq);
	while (my $p = $sth->fetchrow_hashref('NAME_uc')) {
	    push @facility_shakings, $p;
	}
    };
    $SC::errstr = $@, return () if $@;
    return @facility_shakings;
}

sub get_facility {
    my ($class, $facility_id) = @_;
    my $facility;

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select *
		from facility
		where facility_id = ?/);
	$sth->execute($facility_id);
	$facility = $sth->fetchrow_hashref('NAME_uc');
    };
    $SC::errstr = $@, return undef if $@;
    return $facility;
}

sub set_facility_metric {
	my ($class, $seq, $facility_id, $model_result, $custom_metric_id, $nocommit) = @_;

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		update facility_shaking 
		set value_$custom_metric_id = ? 
		where facility_id = ? and
			grid_id = ?/);
    $sth->execute($model_result, $facility_id, $seq);
    };
    SC->dbh->commit unless $nocommit;

    $SC::errstr = $@, return undef if $@;
}

sub set_shakemap_metric {
	my ($class, $shakemap_id, $shakemap_version, $custom_metric, 
		$custom_metric_id, $max_value, $min_value, $nocommit) = @_;

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		insert into shakemap_metric 
			(shakemap_id, shakemap_version, metric,
			value_column_number, max_value, min_value) 
		values (?, ?, ?, ?, ?, ?)/);
    $sth->execute($shakemap_id, $shakemap_version, $custom_metric, 
		$custom_metric_id, $max_value, $min_value);
    };
    SC->dbh->commit unless $nocommit;

    $SC::errstr = $@, return undef if $@;
}

sub get_user_profile {
    my ($class) = @_;
	my ($p, @user_profile);
	
    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select distinct profile_id 
		from geometry_user_profile/);
	$sth->execute();
    while (my $p = $sth->fetchrow_arrayref) {
		push @user_profile, $p->[0];
	}
    $sth->finish;
    };
    $SC::errstr = $@, return undef if $@;
	return @user_profile;
}

sub get_grid_metrics {
    my ($class, $seq) = @_;
    my @grids = ();

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
		select s.shakemap_id, s.shakemap_version, g.grid_id, 
			m.metric, m.value_column_number
		from shakemap s, grid g, shakemap_metric m
		where s.shakemap_id = g.shakemap_id and
			s.shakemap_version = g.shakemap_version and
			s.shakemap_id = m.shakemap_id and 
			s.shakemap_version = m.shakemap_version and
			m.value_column_number is not null and
			s.superceded_timestamp is null and
			g.latitude_cell_count > 0 and
			g.grid_id = ?/);
	$sth->execute($seq);
	while (my $p = $sth->fetchrow_hashref('NAME_uc')) {
	    push @grids, $p;
	}
    };
    $SC::errstr = $@, return () if $@;
    return @grids;
}

sub get_event {
    my ($class, $grid_id) = @_;

    undef $SC::errstr;
    my $event;
    my $sth;
    eval {
	$sth = SC->dbh->prepare(qq/
	    select e.*
	    from event e, shakemap s, grid g
	    where g.shakemap_id = s.shakemap_id and
			g.shakemap_version = s.shakemap_version and
			e.event_id = s.event_id and
			e.event_version = s.event_version and
			grid_id = ?/);
	$sth->execute($grid_id);
	$event = $sth->fetchrow_hashref('NAME_uc');
    };
    if ($@) {
	$SC::errstr = $@;
	return undef;
    } elsif ($sth->rows <= 0) {
	$SC::errstr = "No event for grid_id $grid_id";
    }
    return $event;
}

sub scan_for_updates {
    my $self = shift;
    my $n = 0;
    my $last_seq = nz($self->get_parm("LAST_METRIC_SEQ"));
    my $max_seq = nz($self->get_max_seq());
	
	my $custom_metric = $self->{'METRIC'};
	my $custom_metric_id = $self->get_metric($custom_metric);
	my $class = 'Shake::Metric::'.$custom_metric;
	my $model;
    eval {
		$model = $class->new();
    };
    if ($@) { 
		print $@;
		$SC::errstr = $@;
		return $SC::errstr; 
    }
	
    if ($max_seq > $last_seq) {
		#
		# Process grids one at a time
		#
		my @grids = $self->get_new_grids($last_seq);
		foreach my $grid (@grids) {
			my $seq = $grid->{GRID_ID};
			my $shakemap_id = $grid->{SHAKEMAP_ID};
			my $shakemap_version = $grid->{SHAKEMAP_VERSION};
			
			# Retrieve event information
			my $event = $self->get_event($seq);
			
			# Retrieve processed metrics in ShakeMap
			my @grid_metrics = $self->get_grid_metrics($seq);
			my ($sql, $sth, $nr);
			my %grid_metric;
			foreach my $grid_metric (@grid_metrics) {
				my $metric = $grid_metric->{METRIC};
				my $value_column_number = $grid_metric->{VALUE_COLUMN_NUMBER};
				$sql .= ", fs.value_$value_column_number as $metric";
				#SC->log(2, "new grid_metric: $event->{EVENT_LOCATION_DESCRIPTION} $metric $value_column_number");
			}
			
			# Retrieve facilities needed to be processed
			my @facility_shakings = $self->get_facility_shaking($seq, $sql);
			my ($max_value, $min_value);
			$max_value = $min_value = 0;
			foreach my $facility_shaking (@facility_shakings) {
				my $damage_level = $facility_shaking->{DAMAGE_LEVEL};
				my $facility_id = $facility_shaking->{FACILITY_ID};
				my $MMI = $facility_shaking->{MMI};
				my $PGA = $facility_shaking->{PGA};
				my $PGV = $facility_shaking->{PGV};
				my $facility = $self->get_facility($facility_id);
				my $model_result = sprintf("%7.4f", 
					$model->get_metric($event,$facility,$facility_shaking));
				#SC->log(2, "new facility_id: $facility_id $MMI $PGA $PGV $model_result ");
				$self->set_facility_metric($seq, $facility_id, $model_result, $custom_metric_id);
				$max_value = $model_result if ($model_result > $max_value);
				$min_value = $model_result if ($model_result <= $min_value);
			}
			
			$self->set_shakemap_metric($shakemap_id, $shakemap_version, $custom_metric, 
				$custom_metric_id, $max_value, $min_value);

			my $sql2 = dosubs($SHAKE_BASE, $custom_metric_id);
			$sth = SC->dbh->prepare($sql2);
			$nr = $sth->execute($custom_metric,
					   $shakemap_id,
					   $shakemap_version,
					   $seq);
			$nr += 0;
			SC->log(2, "shake user custom: grid seq = $seq, metric = $custom_metric, 
				valno = $custom_metric_id: $nr row(s)");
			$n += $nr;

			my @user_profile = $self->get_user_profile();
			foreach my $profile (@user_profile) {
				$sql2 = dosubs($SHAKE_BASE_PROFILE, $custom_metric_id);
		#	    epr "<<$sql>>";
				$sth = SC->dbh->prepare($sql2);
				$nr = $sth->execute($profile, $custom_metric,
					   $shakemap_id,
					   $shakemap_version,
					   $seq);
				$nr += 0;
				SC->log(2, "shake profile $profile custom: grid seq = $seq, metric = $custom_metric, 
					valno = $custom_metric_id: $nr row(s)");
				$n += $nr;
			}

			# Retrieve facilities needed to be processed
			$sql .= ", fs.value_$custom_metric_id as $custom_metric";
			my ($nu, $np);
			my @facility_fragilities = $self->get_facility_fragility_metric($seq, $custom_metric, $sql);
			foreach my $facility_fragility (@facility_fragilities) {
				my $damage_level = $facility_fragility->{DAMAGE_LEVEL};
				my $facility_id = $facility_fragility->{FACILITY_ID};
				my $facility = $self->get_facility($facility_id);

				my $ARIAS = $facility_fragility->{ARIAS};
				if ($model->get_damage($event,$facility,$facility_fragility)) {
					$sql2 = dosubs($DAMAGE_BASE, $custom_metric_id);
					$sth = SC->dbh->prepare($sql2);
					$nr = $sth->execute($facility_id, $damage_level, $custom_metric,
						$shakemap_id, $shakemap_version, $seq);
					$nr += 0;
					$nu += $nr;

					foreach my $profile (@user_profile) {
						$sql2 = dosubs($DAMAGE_BASE_PROFILE, $custom_metric_id);
						$sth = SC->dbh->prepare($sql2);
						$nr = $sth->execute($profile, $facility_id, $damage_level, $custom_metric,
							$shakemap_id, $shakemap_version, $seq);
						$nr += 0;
						$np += $nr;
					}
				}
			}
			$n += $nu + $np;
			SC->log(2, "damage custom: grid seq = $seq, metric = $custom_metric, 
				valno = $custom_metric_id: $nu row(s)");
			SC->log(2, "damage profile custom: grid seq = $seq, metric = $custom_metric, 
				valno = $custom_metric_id: $np row(s)");
			
		}
		
		SC->log(2, "total $n custom module notification(s) queued");
		$self->set_parm('LAST_METRIC_SEQ', $max_seq); # also commits
		#my $event_p = get_grid_id($max_seq);
		#if ($event_p) {
		#	my $rc = local_product($event_p->[0], $event_p->[1]);
		#}
		#else {
		#	vvpr "no $event_p queued for local product";
		#}
    } else { 
		SC->log(2, "no new grids");
	}
	
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}


sub queue_request {
    my ($self, $request, @args) = @_;

    require Dispatch::Client;

    Dispatch::Client::set_logger($SC::logger);

    Dispatch::Client::dispatch(
	SC->config->{'Dispatcher'}->{'RequestPort'},
	$request, $self->server_id, @args);    
}

# returns a list of all servers that should be polled for new events, etc.
sub servers_to_rss {
    my $class = shift;
    my @servers;

    undef $SC::errstr;
    eval {
	my $sth = SC->dbh->prepare(qq/
	    select *
	      from server
	     where query_flag = 1/);
	$sth->execute;
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    push @servers, new SC::Server(%$p);
	}
    };
    $SC::errstr = $@, return () if $@;
    return @servers;
}


sub rss_for_updates {
    my $self = shift;

    require SC::RSS;
    require SC::Event;

    # Query for updates
    # If we have not received anything from this server then limit time
    # so that only current things are delivered (we still will get the hwm
    # for each type).
    my $oldest = '';
    if (not $self->event_hwm) {
	$oldest = SC->time_to_ts();
    }

    my $e_hwm = $self->event_hwm;
    my $s_hwm = $self->shakemap_hwm;
    my $p_hwm = $self->product_hwm;

    # send the query
    my ($status, $message, $rv) = $self->rss_send();
    #if ($status ne SC_OK) {
        $SC::errstr = $message;
    #    return 0;
    #}

    my %archive_sm;

    eval {
	my $sth = SC->dbh->prepare(qq/
	    SELECT *
		FROM event
		WHERE adddate( event_timestamp, 7 ) > now( )
		AND event_type = "actual"
		AND event_id NOT
		IN (
			SELECT event_id
			FROM event
			WHERE event_status = "cancelled"
		)
		GROUP BY event_id/);
	$sth->execute;
	while (my $p = $sth->fetchrow_hashref('NAME_lc')) {
	    $archive_sm{$p->{event_id}} = $p;
	}
    };

    eval {
		# Instantiate new items
		die 'did not find ShakeMap RSS feed element'
			unless exists $rv->{'channel'};
		my $response = $rv->{'channel'};
		my @items;
		my $latest_eq = 0;
		if (exists $response->{'item'}) {
			if (ref $response->{'item'} eq 'HASH') {
				@items = ($response->{'item'});
			} else {
				@items = @{ $response->{'item'} };
			}
			SC->log(2, "poll got", scalar @items, "events");
			foreach my $xml (@items) {
				# Parse Event ID
				my $link = $xml->{'link'};
				$link =~ s/(index.php|intensity.html)$//i;
				$link =~ s/\/$//;
				my ($evid) = $link =~ /shake\/(.+)/;
				delete $archive_sm{$evid} if defined $archive_sm{$evid};
			
				my $pubDate = SC->ts_to_time($xml->{'pubDate'});
				next unless ($pubDate > $e_hwm);
				$latest_eq = $pubDate if ($pubDate > $latest_eq);
				SC->log(2, "new rss", $xml->{'title'});
				SC::RSS->new($xml)->process_new_rss;
				#SC::RSS->new($xml);
			}
		}

		# Build the cancellation message
	    SC->log(2, "rss determined", scalar keys %archive_sm, "missing event(s)");
		foreach my $m (keys %archive_sm) {
			my $evid = $archive_sm{$m}->{event_id};
			my $cmd = SC->config->{'RootDir'}."/bin/shake_fetch.pl -network query -event $evid -status -verbose";
			my	$result = `perl $cmd`;
	
			if ($?) {
				$archive_sm{$m}->{event_version} = $archive_sm{$m}->{event_version} + 1;
				my $xml = qq{
					<event event_id="$archive_sm{$m}->{event_id}" 
					event_version="$archive_sm{$m}->{event_version}" 
					event_status="CANCELLED" 
					event_type="$archive_sm{$m}->{event_type}" 
					event_name="$archive_sm{$m}->{event_name}" 
					event_location_description="$archive_sm{$m}->{event_location_description}" 
					event_timestamp="$archive_sm{$m}->{event_timestamp}" 
					external_event_id="$archive_sm{$m}->{external_event_id}" 
					magnitude="$archive_sm{$m}->{magnitude}" 
					lat="$archive_sm{$m}->{lat}" 
					lon="$archive_sm{$m}->{lon}" />};
				my $rv = SC->xml_in($xml)->{event};
				SC::Event->new(%$rv)->process_new_event;
				SC->log(2, "event $m cancelled");
			}
		}

		# Store new HWMs
		my $timestamp = ($e_hwm > $latest_eq) ? $e_hwm : $latest_eq;
		$self->update_hwms(
			$timestamp,
			$timestamp,
			$timestamp) or die $SC::errstr;
    };
    $SC::errstr = $@ if $@;
    return not defined $SC::errstr;
}

sub rss_send {
    my ($self) = @_;
    my ($status, $message, $rv);

    # avoid sucking all this in for clients that don't need to send messages
    require LWP::UserAgent;
    #require HTTP::Request;
    #require MIME::Base64;

	my   $url = 'http://' . $self->dns_address . '/eqcenter/shakemap/shakerss.php';
		
    SC->log(3, "server->send($url)");
    my $ua = new LWP::UserAgent();
    $ua->agent($USER_AGENT);
	$ua->proxy(['http'], SC->config->{'ProxyServer'})
		if (defined SC->config->{'ProxyServer'});
    #my $req = new HTTP::Request(POST => $url);
    #my $pwd = (defined $self->password ?
	#MIME::Base64::decode_base64($self->password) : '');
    #$req->authorization_basic(SC::Server->local_server_id(), $pwd);

    my $resp = $ua->get($url);
    SC->log(3, "response:", $resp->status_line);
    if ($resp->is_success) {
	my $p;
	SC->log(3, "content:", substr($resp->content, 0, 300));
	#SC->log(3, "content:", $resp->content);

	eval {$p = SC->xml_in($resp->content)};
	$rv = $p->{'rss'};
	
	# Reply should be an XML document whose root element is either
	# <shakecast_status> or <shakecast_response>.  The former is used
	# when there is no return other than status.  The latter includes
	# <shakecast_status> as one of its sub-elements, and <response_body>
	# as the other sub-element.
	if ($SC::errstr) {
	    # XML parse failed
	    $status = SC_BAD_XML;
	    $message = $SC::errstr;
	} elsif ($@) {
	    # XML parse failed
	    $status = SC_BAD_XML;
	    $message = "error parsing shakecast_response: $@";
	} elsif (exists $p->{'shakecast_response'}) {
	    # grab status sub-element
	    my $s = $p->{'shakecast_response'}->{'shakecast_status'};
	    $status = $s->{'status'};
	    $message = $s->{'content'};
	    $rv = $p->{'shakecast_response'}->{'response_body'} if $status eq SC_OK;
	} elsif (exists $p->{'shakecast_status'}) {
	    # just a status return with no payload
	    $status = $p->{'shakecast_status'}->{'status'};
	    $message = $p->{'shakecast_status'}->{'content'};
	} else {
	    $status = SC_UNKNOWN;
	    $message = 'No status returned';
	}
	$self->update_status(1);
	# TODO log the exchange
    } else {
	# TODO handle can't connect; retry with IP address
	$status = SC_HTTP_FAIL;
	$message = $resp->status_line;
	$self->update_status(0);
	# TODO log the exchange ?
	SC->log(2, "http failure: $message");
    }
    return ($status, $message, $rv);
}

1;



__END__

=head1 NAME

SC::Server - ShakeCast Server

=head1 DESCRIPTION

Instances of this package represent servers known to this ShakeCast
installation.  There is a C<SC::Server> for the local server as well as
for each known remote server.

The current implementation B<never> caches data about servers when creating
new instances; every request is satisfied by a database query.
However, it B<always> caches information for any existing C<SC::Server>
instance.  Once created, a server's attributes (ex: password, statistics)
are never updated from the database.  B<TODO: add a refresh method>.

=head2 Class Methods

=over 4

=item SC::Server->this_server

Returns the local server, or C<undef> for errors (either no server marked
with C<SELF_FLAG=1> or multiple servers claiming to be the local server).

=item SC::Server->local_server_id

Returns the C<server_id> of the local server, or C<undef> for errors.

=item SC::Server->from_id( $server_id )

Returns a new C<SC::Server> whose server_id matches the specfied
parameter value, or C<undef> if no such server exists.
C<undef> is also returned for database errors or if multiple server
records are found with the given server_id; C<$SC::errstr> is also set
for these errors.

=item SC::Server->upstream_servers

Returns a list containing all the upstream servers
(those whose C<UPSTREAM_FLAG> field is 1).
The list could be empty.
If there are any errors an empty list is returned.

=item SC::Server->downstream_servers

Returns a list containing all the downstream servers
(those whose C<DOWNSTREAM_FLAG> field is 1).
The list could be empty.
If there are any errors an empty list is returned.

=item SC::Server->servers_to_poll

Returns a list containing all the servers
that should be polled for new data.
Each of these servers is polled in turn by <b>polld</b>.
If there are any errors an empty list is returned.

=back

=head2 Instance Methods

=over 4

=item $server->permitted( $access )

Tests to see if C<$server> is permitted the specified access.
Access is one of:
  U   is $server upstream
  D   is $server downstream
  Q   can $server query me
  P   should I attempt to poll $server

Returns nonzero if allowed, zero if denied.

=item $server->send( $action, $content )

Sends a request to this server.
The return value is a three element list of C<status>, C<message>, and
C<return-value>.

=over 4

=item status

This is one of the standard Shakecast status values.

=item message

If the status indicates an error then the C<message> element will contain
the error message.  This message might be locally generated or could come
from the remote server, depending on where the error occurred.

=item return-value

If the remote reply includes data, not just a status, then this element
will contain a hashref that points to the interpreted response.  In all
other cases this element will be undefined.

=back

=item $server->queue_request ( $action, @args )

Queues a request for C<$action> to be performed by the remote server.
The specified arguments are passed to the remote server.
The request will be queued with the Dispatcher and executed asynchronously.
This method will only fail if the request could not be queued; a
successful return does not indicate that the action itself succeeded, or that
it has even been performed yet.

The C<$action> parameter can have one of the following values (see
C<bin/worker.pl> for implementation details):

=over 4

=item new_event ( event_id, event_version )

Send the event with the specified id and version to the remote server.

=item new_shakemap ( shakemap_id, shakemap_version )

Send the shakemap with the specified id and version to the remote server.

=item new_product ( product_id )

Send the product with the specified id to the remote server.

=item get_file_for_product ( product_id )

Retrieve the file associated with the given product_id.  If the file is a
grid file, decode it and load the grid into the database.  Then pass the
product metadata along to any downstream servers.  (We deferred this
action when we received our copy of the product metadata because we don't
want the downstream server to ask us for the product file until we have
fetched it from our upstream server.)

=back

=back

=cut
