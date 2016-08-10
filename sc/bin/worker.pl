#!/usr/local/bin/perl

# $Id: worker.pl 64 2007-06-05 14:58:38Z klin $

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

use POSIX;
use IO::Socket;
use IO::Select;
use Storable;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use SC::Server;
use SC::Event;
use SC::Shakemap;
use SC::Product;

use Dispatch::Client;

my ($remote,$port,$server,$name,$select,$timeout);

my $DEFAULT_HOST = 'localhost';
my $DEFAULT_PORT = 8161;
my $DEFAULT_NAME = "Worker $$";

my $task_nr = 0;

# Parse command line
use Getopt::Long;

my %options;

my @getopt_args = (
    'h=s', # address (hostname or IP address) of dispatcher
    'p=i', # port of dispatcher
    'n=s', # name by which this worker is known
    'c=s', # specifies config file (default is sc.conf)
);

Getopt::Long::config("noignorecase");
unless (GetOptions(\%options, @getopt_args)) {
    die "invalid option(s)";
}

my $config = (exists $options{'c'} ? $options{'c'} : 'sc.conf');

SC->initialize($config, 'dispw') or die "could not initialize SC: $@";

$timeout = SC->config->{Dispatcher}->{WorkerTimeout};

$remote  = $options{'h'} || $DEFAULT_HOST;
$port    = $options{'p'} || $DEFAULT_PORT;
$name	 = $options{'n'} || $DEFAULT_NAME;
$server = IO::Socket::INET->new(
                        Proto    => "tcp",
                        PeerAddr => $remote,
                        PeerPort => $port
                    )
                  or die "$name cannot connect to port $port at $remote\n";

SC->log(1, "$name connected from port", $server->sockport);

$select = new IO::Select($server);
#binmode $server;


# Loop forever reading tasks from dispatcher.  When one is received, execute
# it and then send a result back to the dispatcher.
#
# Task is a hash with
#   ACTION -- name of sub to invoke
#   ARGS -- arrayref to arg list for action sub
# 
# The task must return nonzero for success and zero for failure.  If the
# task sub fails the value of $SC::errstr will be returned to the dispatcher
# as the Rsponse status message.
#
# Rsponse is a hash with
#   STATUS -- one of OK, DIED, or FAILED
#   MSG -- optional message if DIED or FAILED
#
# In general the dispatcher will assume that the worker has already logged
# some form of error message for error cases.  
#
# TODO probably need the concept of permanent vs. temporary errors.  This
# would be relevant for TCP errors, which might be considered temporary.
# Most other errors are probably permanent (bugs, misconfigurations, ...).
#
# TODO use objects rather than hashes for Task and Response
# 
while (1) {
    SC->log(2, "$name ready...");

    # read Task
    my $taskp = read_task();
    $task_nr++;
    SC->log(4, "$name: process request $task_nr");
    my ($rv, $msg, $rh, $plan_ts, $delay, $repeat);

    # make sure it's valid, and execute it if so
    {
	no strict 'refs';
	if (not defined $taskp->{ACTION}) {
	    $msg = "$name\: no ACTION entry in task";
	} elsif (not defined *{$taskp->{ACTION}}{CODE} ) {
	    $msg = "$name\: don't know how to perform ".$taskp->{ACTION};
	} elsif (not defined $taskp->{ARGS}) {
	    $msg = "$name\: no ARGS entry in task";
	} else {
	    SC->log(3, "$name: task is $taskp->{ACTION}");

	    # perform the requested action
	    eval {
		($rv, $plan_ts, $delay, $repeat) = &{ $taskp->{ACTION} }( @{ $taskp->{ARGS} } );
	    };
	}
    }
    
    # create Response
    # Status must be one of SUCCESS, FAILED, or DIED
    if ($msg) {
	# The task itself was invalid in some way, log it
	error($msg);
	$rh = {STATUS=>'FAILED', MSG=>$msg};
    } elsif ($@) {
	# from eval {} -- assume unhandled 'die' not yet logged as an error
	error("$name\: ".$taskp->{ACTION}."\: $@");
	$rh = {STATUS=>'DIED', MSG=>$@};
    } elsif ($rv) {
        # Non-zero return means the action succeeded.
	$rh = {STATUS=>'SUCCESS', PLAN=>$plan_ts, DELAY=>$delay, REPEAT=>$repeat};
    } else {
	# The action returned zero, indicating a failure.  Someone 
        # should have already logged the error so don't do that here.
        # Return $SC::errstr as the message.
	$rh = {STATUS=>'FAILED', MSG=>$SC::errstr};
    }
    SC->log(3, "$name\: task complete ($rh->{STATUS})");

    # send response to dispatcher
    my $response = Storable::freeze($rh);
    $response = length($response).':'.$response;
    $server->send($response, 0);
}

# Reads one task from the dispatcher socket.  Loops here until a complete
# task request has been received.  The thawed task is returned.
#
# If the socket is closed this method calls exit().  That would typically only
# happen if the dispatcher dies.
# 
sub read_task {
    my ($nb, $inbuffer);
    my $this_timeout;

    if (defined $timeout) {
        # timeout is fuzzed so many workers that were started at one time
        # won't all die at once.
        $this_timeout = $timeout + int(rand(60));
    }
	  
    while ($select->can_read($this_timeout)) {
        # reset timer
        if (defined $timeout) {
            $this_timeout = $timeout + int(rand(60));
        }
        # read data
        my $data = '';
        my $rv   = $server->recv($data, POSIX::BUFSIZ, 0);

        unless (defined($rv) && length $data) {
            # This would be the end of file, so close the client
            SC->log(0, "$name quitting (EOF from dispatcher)");
            close $server;
            exit;
        }

        $inbuffer .= $data;
        $nb = $1 if not defined $nb and $inbuffer =~ s/^(\d+)\://;

        return Storable::thaw $inbuffer if length $inbuffer == $nb;
    }
    # read from dispatcher timed out.
    SC->log(0, "$name quitting (socket read timeout)");
    close $server;
    # TODO choose a message to send back to the dispatcher
    exit;
}

sub error {
    SC->error(@_);
}


# ======================================================================
# End of generic worker.  Action subs follow.
#
# Each action sub MUST return 0 if the action failed and 1 if it succeeded.
# When it fails, $SC::errstr should also be set, as this will be returned
# to the dispatcher on any failure.
#
# The action sub (or nested code) is responsible for logging the error.
# 
# ======================================================================

# send event to a remote server
sub new_event {
    my ($remote_id, $event_id, $event_version) = @_;

    my ($server, $event, @ret);

    $server = SC::Server->from_id($remote_id)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "server", $server->dns_address);
    $event = SC::Event->from_id($event_id, $event_version)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "event", $event->event_id);

    return 1 if $event->superceded_timestamp;	# assume newer version will be sent
    @ret = $server->send('new_event', $event->to_xml);
    if ($ret[0] ne SC_OK) {
	SC->error("Send event @ret");
	return 0;
    } else {
	SC->log(2, "send OK");
	return 1;
    }
}


# send shakemap to a remote server
sub new_shakemap {
    my ($remote_id, $shakemap_id, $shakemap_version) = @_;

    my ($server, $shakemap, @ret);

    $server = SC::Server->from_id($remote_id)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "server", $server->dns_address);
    $shakemap = SC::Shakemap->from_id($shakemap_id, $shakemap_version)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "shakemap", $shakemap->shakemap_id, $shakemap->shakemap_version);

    return 1 if $shakemap->superceded_timestamp; # assume newer version will be sent
    @ret = $server->send('new_shakemap', $shakemap->to_xml);
    if ($ret[0] ne SC_OK) {
	SC->error("Send shakemap @ret");
	return 0;
    } else {
	SC->log(2, "send OK");
	return 1;
    }
}


# send product to a remote server
sub new_product {
    my ($remote_id, $product_id) = @_;

    my ($server, $product, @ret);

    $server = SC::Server->from_id($remote_id)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "server", $server->dns_address);
    $product = SC::Product->from_id($product_id)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "product", $product->shakemap_id, $product->shakemap_version,
	    $product->product_type);

    return 1 if $product->superceded_timestamp; # assume newer version will be sent
    @ret = $server->send('new_product', $product->to_xml);
    if ($ret[0] ne SC_OK) {
	SC->error("Send product @ret");
	return 0;
    } else {
	SC->log(2, "send OK");
	return 1;
    }
}

# get the file corresponding to a product from the specified server
sub get_file_for_product {
    my ($remote_id, $product_id) = @_;

    my ($server, $product);

    SC->log(4, "product_id:", $product_id);
    $server = SC::Server->from_id($remote_id)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "upstream server:", $server->dns_address);
    $product = SC::Product->from_id($product_id)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "get file:", $product->file_name,
            "type:", $product->product_type);
    my @status = $server->get_file($product_id);
    if ($status[0] ne SC_OK) {
        SC->log(2, "get file: $status[0], $status[1]");
        $SC::errstr = $status[1];
        return 0;
    }
    $product->set_file_exists;
    SC->log(2, "got the file");
    if ($product->product_type eq 'GRID') {
	if ($product->process_grid_file) {
            SC->log(2, "grid file processed");
        } else {
            SC->error($SC::errstr);
            # XXX might not be correct.  Even though we got an error while
            # processing the grid we might want to push the file downstream.
            # Probably we should NOT inform the notifier, though, since the
            # grid hasn't been loaded into the database.
            return 0;
        }
    } elsif ($product->product_type eq 'STN_XML') {
	if ($product->process_station_file) {
            SC->log(2, "station file processed");
        } else {
            SC->error($SC::errstr);
            # XXX might not be correct.  Even though we got an error while
            # processing the grid we might want to push the file downstream.
            # Probably we should NOT inform the notifier, though, since the
            # grid hasn't been loaded into the database.
            return 0;
        }
	}
    
    # Now that we have the product file it is time to inform downstream
    # servers about the new product
    
    return 1 if $product->is_local_test;

    # Forward it to all downstream servers
    # this step only queues exchange requests; the exchanges are
    # completed asynchronously, so it is not known at this time whether
    # or not they succeeded
    my $rc = 1;
    foreach my $ds (SC::Server->downstream_servers) {
        eval {
            SC->log(4, "about to forward product_id $product_id to",
                $ds->server_id);
            Dispatch::Client::set_logger($SC::logger);
            Dispatch::Client::dispatch(
                SC->config->{'Dispatcher'}->{'RequestPort'},
                'new_product', $ds->server_id,
                $product_id);
            SC->log(4, "fowarded product_id $product_id to",$ds->server_id);
        };
        if ($@) {
            # ok, this is bad.  We're about to break the chain of messages
            # being sent down through the tree of servers.  Log the error
            # and at least try to send to any other servers.
            SC->error("forwarding new product to", 
                (SC::Server->from_id($ds->server_id))->dns_address,
                $@);
            $rc = 0;
        }
    }
    return $rc;
}

# send event to a remote server
sub comp_gmpe {
    my ($remote_id, $event_id, $event_version) = @_;

    my ($server, $event, @ret);

    $server = SC::Server->from_id($remote_id)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "server", $server->dns_address);
    $event = SC::Event->from_id($event_id, $event_version)
	or SC->error($SC::errstr), return 0;
    SC->log(2, "event", $event->event_id);

    return 1 if $event->superceded_timestamp;	# assume newer version will be sent

	my $rc;
	
    eval {
	use Shake::Distance;
	use Shake::Regressions;
    };
    if ($@) {
	$SC::errstr = $@;
	return 0;
    }

    undef $SC::errstr;

    eval {
        my ($hwm) = SC->dbh->selectrow_array(qq/
            select seq
              from event
	     where event_id = ?
	       and event_version = ?/, undef,
	    $event->event_id, $event->event_version);

		my $sth_s = SC->dbh->prepare(qq/
			select *
			  from shakemap_parameter
			 where shakemap_id = ?
			 order by shakemap_version desc
			 limit 1/);
		$sth_s->execute($event->event_id);
		my $sm_param = $sth_s->fetchrow_hashref('NAME_lc');
		$sth_s->finish;
		my ($bias, $gmpe, $src_mech);
        if ($sm_param) {
			my (@fields) = split /\s/, $sm_param->{'bias'};
			$bias = { pga   => $fields[0],
					  pgv   => $fields[1],
					  psa03 => $fields[2],
					  psa10 => $fields[3],
					  psa30 => $fields[4] };
			$src_mech = ($sm_param->{'src_mech'}) ? $sm_param->{'src_mech'} : "ALL";
			$gmpe = ($sm_param->{'gmpe'}) ? $sm_param->{'gmpe'} : "Regression::BJF97";
			SC->log(2, "using gmpe $gmpe src $src_mech with bias ".$sm_param->{'bias'});
		}
		$gmpe = eval "$gmpe->new" or ($gmpe = "Regression::BJF97");

        my $sql =  "insert into facility_model_shaking 
			(facility_id, SEQ, dist, value_1, value_2, value_3,
			value_4, value_5, value_6) values (?,?,?,?,?,?,?,?,?)";
        my $sth_i = SC->dbh->prepare($sql);

		my $dist_cutoff = (SC->config->{'DISTANCE_CUTOFF'}) ? SC->config->{'DISTANCE_CUTOFF'} : 200;
		my ($min_lon, $max_lon, $min_lat, $max_lat) = dist_bound($event->lon, $event->lat, $dist_cutoff);
		# read all the facilities that overlap the grid
		my $facpp = SC->dbh->selectall_arrayref(qq{
			select facility_id,
				   lon_min, lat_min, lon_max, lat_max
			  from facility
			 where ? < lon_max
			   and ? > lon_min
			   and ? < lat_max
			   and ? > lat_min}, undef,
			$min_lon, $max_lon, $min_lat, $max_lat);

        # for each facility compute max value of each metric and write a
        # FACILITY_SHAKING record
		my ($src,$faultcoords,$regress);
		#my $class = "Regression::BJF97";
		$regress = $gmpe->new($event->lat, $event->lon, $event->magnitude, $bias, $src_mech, $faultcoords);

		my %sd = $regress->sd();
		my %pgm;
		my $dist;

       foreach my $p (@$facpp) {
            # some pt features have only min
            $p->[3] = $p->[1] unless defined $p->[3];
            $p->[4] = $p->[2] unless defined $p->[4];
            #SC->log(4, sprintf("FacID: %d, bbox: %f9,%f9 - %f9,%f9", $p->[0], $p->[2], $p->[1], $p->[4], $p->[3]));
			my $fac_lat = ($p->[2]+$p->[4])/2;
			my $fac_lon = ($p->[1]+$p->[3])/2;
			$dist = dist($event->lat, $event->lon, $fac_lat, $fac_lon);
			next unless ($dist <= $dist_cutoff);
			%pgm = $regress->maximum($fac_lat, $fac_lon);
			next unless ($pgm{pga} >= SC->config->{'BASELINE_SHAKING_THRESHOLD'});
			$sth_i->execute($p->[0], $hwm, $dist, $pgm{pga}, $pgm{pgv}, undef, $pgm{psa03}, $pgm{psa10}, $pgm{psa30});
        }
        SC->log(2, "event facility processing complete");
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
	$rc = 1;
    }
    return $rc;
}

# send product to a remote server
sub logrotate {
    my ($remote_id, $product_id, $plan_ts, $interval, $repeat) = @_;
	
	return (1, $plan_ts, $interval, $repeat) 
		if ($plan_ts + $interval >= time);
	
	my $perl = SC->config->{perlbin};
	my $root = SC->config->{RootDir};
	
	my $rv = `$perl $root/bin/logrotate.pl`;
	
	return (1, $plan_ts, $interval, $repeat--);

}

# send product to a remote server
sub logstats {
    my ($remote_id, $product_id, $plan_ts, $interval, $repeat) = @_;
	
	return (1, $plan_ts, $interval, $repeat) 
		if ($plan_ts + $interval >= time);
	
	my $perl = SC->config->{perlbin};
	my $root = SC->config->{RootDir};
	
	my $rv = `$perl $root/bin/logstats.pl`;
	
	return (1, $plan_ts, $interval, $repeat--);

}

# send product to a remote server
sub heartbeat {
    my ($remote_id, $product_id, $plan_ts, $interval, $repeat) = @_;
	
	return (1, $plan_ts, $interval, $repeat) 
		if ($plan_ts + $interval >= time);
	
	my $perl = SC->config->{perlbin};
	my $root = SC->config->{RootDir};
	
	my $rv = `$perl $root/bin/heartbeat.pl`;
	
	return (1, $plan_ts, $interval, $repeat--);

}

# send product to a remote server
sub gs_json {
    my ($remote_id, $product_id, $plan_ts, $interval, $repeat) = @_;
	
	return (1, $plan_ts, $interval, $repeat) 
		if ($plan_ts + $interval >= time);
	
	my $perl = SC->config->{perlbin};
	my $root = SC->config->{RootDir};
	
	my $rv = `$perl $root/bin/gs_json.pl`;
	
	return (1, $plan_ts, $interval, $repeat--);

}

# send product to a remote server
sub maintain_event {
    my ($remote_id, $product_id, $plan_ts, $interval, $repeat) = @_;
	
	return (1, $plan_ts, $interval, $repeat) 
		if ($plan_ts + $interval >= time);
	
	my $perl = SC->config->{perlbin};
	my $root = SC->config->{RootDir};
	
	my $rv = `$perl $root/bin/manage_event.pl -maintain 1`;
	
	return (1, $plan_ts, $interval, $repeat--);

}

# generate facility damage hash and json
sub facility_damage_stat {
    my ($remote_id, $event_id, $event_version) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/facility_damage_stat.pl $event_id $event_version`;
	
    if ($rv =~ /STATUS=SUCCESS/) {
	return 1;
    } else {
	return 0;
    }
    
    return 0;

}

# send product to a remote server
sub facility_fragility_stat {
    my ($remote_id, $event_id, $event_version) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/facility_fragility_stat.pl $event_id $event_version`;
	
    if ($rv =~ /STATUS=SUCCESS/) {
	return 1;
    } else {
	return 0;
    }
    
    return 0;

}

# send product to a remote server
sub facility_regulatory_level {
    my ($remote_id, $event_id, $event_version) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/facility_reg_level.pl $event_id $event_version`;
	
    if ($rv =~ /STATUS=SUCCESS/) {
	return 1;
    } else {
	return 0;
    }
    
    return 0;

}

# send product to a remote server
sub facility_feature_shaking {
    my ($remote_id, $event_id, $event_version) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/facility_feature_shaking.pl $event_id $event_version`;
	
    if ($rv =~ /STATUS=SUCCESS/) {
	return 1;
    } else {
	return 0;
    }
    
    return 0;

}

# generate text-based local ShakeCast products
sub local_product {
    my ($remote_id, $event_id, $event_version) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/local_product.pl $event_id $event_version`;
	
    if ($rv =~ /STATUS=SUCCESS/) {
	return 1;
    } else {
	return 0;
    }
    
    return 0;

}

# send product to a remote server
sub sc_pdf {
    my ($remote_id, $event_id, $event_version) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/sc_pdf.pl $event_id $event_version`;
    
    if ($rv =~ /STATUS=SUCCESS/) {
	return 1;
    } else {
	return 0;
    }
    
    return 0;

}

# send product to a remote server
sub screen_shot {
    my ($remote_id, $event_id, $event_version) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/screenshot.pl $event_id $event_version`;
    
    if ($rv =~ /STATUS=SUCCESS/) {
	return 1;
    } else {
	return 0;
    }
    
    return 0;

}

# send product to a remote server
sub map_tile {
    my ($remote_id, $event_id, $type) = @_;
	
    my $perl = SC->config->{perlbin};
    my $root = SC->config->{RootDir};
    
    my $rv = `$perl $root/bin/map_tile.pl -id $event_id -type $type -max_zoom 18`;

    return $rv;

}

# send product to a remote server
sub test_product {
    my ($remote_id, $product_id, $plan_ts, $interval, $repeat) = @_;
	
    return (1, $plan_ts, $interval, $repeat) 
	    if ($plan_ts + $interval >= time);
    
    return (1, $plan_ts, $interval, $repeat--);

}


