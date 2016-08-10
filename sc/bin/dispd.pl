#!/usr/local/bin/perl

# $Id: dispd.pl 64 2007-06-05 14:58:38Z klin $

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

# This program is based on the non-forking daemon from The Perl Cookbook.


use strict;
use warnings;

use POSIX;
use IO::Socket;
use IO::Select;
use Tie::RefHash;
use Getopt::Long;
use FindBin;
use lib "$FindBin::Bin/../lib";

if ($^O eq 'MSWin32') {
    require Win32::Process;
}
    
use GenericDaemon qw(&vpr);
use SC;

# Arrange for 'die' and 'warn' to be logged
local $SIG{__DIE__} = sub {
    GenericDaemon::epr("DIE:", @_) if (defined $^S and not $^S);
    die @_;
};

local $SIG{__WARN__} = sub {
    GenericDaemon::epr("WARN:", @_) if (defined $^S and not $^S);
    warn @_;
};

local $SIG{CHLD} = \&REAPER;

# Full path exec
my $PERL_EXE = $^X;

# Jobs that should never be run are scheduled at this time (secs since epoch)
my $FOREVER = 2000000000;

my %options;

my $VER = 'Dispatch Daemon v0.8';

# NOTE: We handle daemonizing here rather than in GenericDaemon because
# the fork to create the daemon process needs to happen before opening the
# database handle (done in SC::initialize).  Given the current architecture
# we must call SC::initialize before GenericDaemon::initialize because
# we need to have already processed the .conf file at that point.  Hence
# the duplication of code.
Getopt::Long::Configure('pass_through'); # GenericDaemon will consume the rest
GetOptions(\%options,
    'conf=s',	# specifies alternate config file (sc.conf is default)
    'reset!',	# [no]reset task queue on startup (--noreset)
    'daemon',	# daemonize the process
);

my $config_file = (exists $options{'conf'} ? $options{'conf'} : 'sc.conf');
my $reset_queue = (exists $options{'reset'} ? $options{'reset'} : 0);

if ($options{'daemon'} and $^O ne 'MSWin32') {
    daemonize();
}

SC->initialize($config_file, 'dispd')
    or die "could not initialize SC: $@";
my $last_ping = time;

my $signon = "**** $VER started ****";
_log(1, '*' x length $signon);
_log(1, $signon);

# Get configuration options
my $config = SC->config->{'Dispatcher'};

GenericDaemon::initialize(
    'version'=>$VER,
    'conf'   =>$config);

SC->log_level($config->{'LOGGING'});

SC->setids();			##### shc 2004-03-07 #####

# Task initialization -- connects to task DB
if ($SC::dbtype ne 'mysql') {
    SC->dbh->{AutoCommit} = 1;
}
unless (Task->initialize(SC->dbh, $reset_queue)) {
    SC->error("could not initialize task queue DB");
    die $SC::errstr;
}

# This many worker processes will be prespawned when the dispatcher starts
my $min_workers = $config->{'MinWorkers'};

# More workers can be added as needed up to this maximum -- after that point
# tasks will remain queued until a worker completes
my $max_workers = $config->{'MaxWorkers'};

# Ports we listen on for communicating with requesting clients and workers
my $request_port = $config->{'RequestPort'};
my $worker_port  = $config->{'WorkerPort'};

my $rd = SC->config->{'RootDir'};
my $worker_exe;
my @worker_invok;
if (defined $PerlApp::VERSION) { # defined if this is a PerlApp executable
    $worker_exe = "$rd/bin/worker.exe";
    @worker_invok =
	($worker_exe,"-c","$config_file","-p","$worker_port");
}
else {
    $worker_exe = $PERL_EXE;
    @worker_invok =
	($worker_exe,"$rd/bin/worker.pl","-c","$config_file","-p","$worker_port");
}

# Input and output buffers of patially constructed messages from clients
# and workers, keyed by client (IO::Socket::INET).
my %inbuffer  = ();
my %outbuffer = ();

# Tracks expected number of bytes in the request body
my %nb = ();

# Input requests ready to be processed.  Key is client, value is arrayref
# of requests for that client.
my %ready     = ();

# Completed worker responses.  Value is the response (not arrayref, since there
# can only be one response at a time).
my %response  = ();

# Workers and their tasks.  Key is worker socket, value is current Task if the
# worker is active, undef if idle.
my %worker    = ();

# track number of workers we've created but not heard from yet
my $pending_workers = 0;

# Tasks are added to the queue when they are created, and are removed when
# they are completed (or when they have failed too many times).  Tasks that
# are actively being worked are included here.
my @queue = Task->db_recreate;
_log(2, scalar @queue . " tasks in the queue at dispatcher startup");
_log(2, "task queue was reset") if $reset_queue;

# Need to use Tie::RefHash for the hashes where we want to extract the key and
# use it as a ref.
tie %ready, 'Tie::RefHash';
tie %response, 'Tie::RefHash';
tie %worker, 'Tie::RefHash';


# Listen to port for client requests
my $req_server = IO::Socket::INET->new(LocalPort => $request_port,
                                Listen    => SOMAXCONN )
  or die "Can't make socket for client requests: $@\n";

# Listen to port for connections from new workers
my $work_server = IO::Socket::INET->new(LocalPort => $worker_port,
                                Listen    => SOMAXCONN )
  or die "Can't make socket for workers: $@\n";

# Prespawn worker processes
for (my $i = 0; $i < $min_workers; $i++) { add_worker() }

nonblock($work_server);
nonblock($req_server);
my $select = IO::Select->new($work_server);
$select->add($req_server);

GenericDaemon::run(\&process);

exit 1;	# abnormal termination

sub daemonize {
    chdir '/'			or die "can't chdir to /: $!";
    open STDIN,  '/dev/null' 	or die "can't close SDTIN: $!";
    open STDOUT, '>>/dev/null' 	or die "can't close STDOUT: $!";
    open STDERR, '>>/dev/null' 	or die "can't close STDERR: $!";
    #open STDERR, '>/usr/local/sc/disp.log' 	or die "can't close STDERR: $!";
    defined (my $pid = fork)	or die "can't fork: $!";
    exit if $pid;
    setsid			or die "can't setsid: $!";
    umask 0;
}

# Main loop: check reads/accepts, check writes, check ready to process
sub process {

    if (SC->log_level >= 4) {
        _log(4, "select loop,", $select->count, "handles");
        foreach my $h ($select->handles) {
            if ($h == $req_server) {
                _log(6, "... request listener");
            } elsif ($h == $work_server) {
                _log(6, "... worker listener");
            } elsif (exists $worker{$h}) {
                _log(6, "... worker", $h->peerhost.':'.$h->peerport);
            } else {
                _log(6, "... client", $h->peerhost.':'.$h->peerport);
            }
        }
    }

    # First process incoming requests, both new connects and request data on
    # existing request sockets.  Loop until no more data or connects.
    # If there are no complete requests or worker responses then we can
    # block for a while here, but if there is something for us to do then
    # only do a minimal check (this allows us to handle multiple accept()
    # calls on either the request or worker sockets in a single process
    # iteration).
    my $work_to_do = 0;
    
    while (my @rdy = $select->can_read($work_to_do ? 0.001 : 1)) {
        _log(4, "can_read from", scalar @rdy, "handles");
        foreach my $client (@rdy) {

            if ($client == $work_server) {
                # register a new worker connection
                $client = $work_server->accept();
                $worker{$client} = undef; 
                _log(2, "new worker from",
                    $client->peerhost.':'.$client->peerport);
                $pending_workers-- if $pending_workers > 0;
                _log(1, (scalar keys %worker) . "+$pending_workers workers");
                $select->add($client);
                nonblock($client);
            } elsif ($client == $req_server) {
                # accept a new request connection
                $client = $req_server->accept();
                _log(2, "new request from",
                    $client->peerhost.':'.$client->peerport);
                $select->add($client);
                nonblock($client);
            } elsif (exists $worker{$client}) {
                # response data from worker
                _log(3, "response data from",
                    $client->peerhost.':'.$client->peerport);
                $work_to_do += read_response_data($client);
            } else {
                # Data for an incoming request 
                _log(3, "request data from",
                    $client->peerhost.':'.$client->peerport);
                $work_to_do += read_request_data($client);
            }
        }
    }

    # Any complete client requests to process?
    foreach my $client (keys %ready) {
        process_request($client);
    }

    # Any complete worker responses to process?
    foreach my $client (keys %response) {
        process_response($client);
    }

    # Prune deleted tasks from the queue
    if (scalar @queue) { 
	my @q = @queue;
	@queue = ();
	foreach my $t (@q) {
	    push @queue, $t unless $t->status eq 'DELETED';
	}
    } 

    # Any tasks to be executed at this time?
    if (scalar @queue) { 
	my $needed_workers = 0;
	_log(4, scalar @queue, "queued tasks");
	@queue = sort {$a->next_dispatch_ts <=> $b->next_dispatch_ts} @queue;
	foreach my $task (@queue) {
	    last if $task->next_dispatch_ts > time;	# not yet...
	    next if $task->worker;			# already being done...
	    next if $task->status eq 'DELETED';
	    _log(3, "task", $task->as_string, "ready");
	    my $worker;
	    foreach my $w (keys %worker) {
		_log(5, "worker ".$w->peerhost.':'.$w->peerport." idle:", (defined $worker{$w}) ? "no":"yes");
		$worker = $w, last if not $worker{$w};
	    }
	    if (not $worker) {
		# did not find an idle worker
		$needed_workers++; 
		next;
	    }
	    _log(3, "assign worker ".$worker->peerhost.':'.$worker->peerport." to task", $task->as_string);
	    $worker{$worker} = $task;
	    $task->worker($worker);
	    $outbuffer{$worker} .= length($task->request) .':'. $task->request;
	}
	# Create new workers if needed and not already at max_workers
	while ($needed_workers > $pending_workers and 
		$pending_workers + scalar keys %worker < $max_workers) {
	    # Create new worker process here.  After it starts and
	    # connects back to the dispatcher it will be available
	    # to be scheduled.
	    add_worker();
	    $needed_workers--;
	}
    }

    # Buffers to flush?
    my @rdy = $select->can_write(0.001);

    foreach my $w (keys %worker) {
        if (not $select->exists($w)) {
            SC->error("worker  ".$w->peerhost.':'.$w->peerport." not in select list");
        } else {
            _log(5, "worker ".$w->peerhost.':'.$w->peerport." in select list");
        }
    }
    _log(4, "can_write to", scalar @rdy, "handles");
    foreach my $client (@rdy) {
        # Skip this client if we have nothing to say
        next unless exists $outbuffer{$client};

        my $rv = $client->send($outbuffer{$client}, 0);
        unless (defined $rv) {
            # Whine, but move on.
            SC->error("Socket send failed: returned undef");
            next;
        }
        if ($rv == length $outbuffer{$client} ||
            $! == POSIX::EWOULDBLOCK) {
            substr($outbuffer{$client}, 0, $rv) = '';
            delete $outbuffer{$client} unless length $outbuffer{$client};
        } else {
            # Couldn't write all the data, and it wasn't because
            # it would have blocked.  Shutdown and move on.
            SC->error("Socket send failed: $!");
            delete $inbuffer{$client};
            delete $outbuffer{$client};
            delete $ready{$client};

            $select->remove($client);
            close($client);
            next;
        }
    }

    # Out of band data?
    foreach my $client ($select->has_exception(0)) {  # arg is timeout
        # Deal with out-of-band data here, if you want to.
        _log(0, "exception signalled from",
            $client->peerhost.':'.$client->peerport);
    }

    # Periodically exercise the DB connection so it does not go away
    if (time - $last_ping > 3600) {
        SC->dbh->selectrow_array(qq{select * from dispatch_task where 1=0});
        $last_ping = time;
    }

    # If number of workers has dropped below minimum target start a new one
    add_worker() if $pending_workers + scalar keys %worker < $min_workers;
}

# Creates a new worker and returns.  Does not wait for the worker to be
# ready to work -- that happens when the worker process connects to the
# dispatcher.  A count of "pending" worker processes is maintained to keep
# from allocating extraneous workers during the period between when a
# worker is created and when it is available to do work.
sub add_worker {
    if ($^O eq 'MSWin32') {
	my $worker_invok = join ' ', @worker_invok;
	$worker_invok =~ s#/#\\#g;
	my $p;
	Win32::Process::Create(
	    $p,
	    $worker_exe,
	    $worker_invok,
	    0,
	    0x00000020,         #NORMAL_PRIORITY_CLASS
	    '.') or warn Win32::FormatMessage(Win32::GetLastError());
	$p->Resume();	
    } else {
	unless (fork) {
	    exec @worker_invok or _log(0, "new worker create FAILED: $!");
	    exit 0;
	}
    }
    _log(1, "new worker created");
    $pending_workers++;
}

# Read something from a client request socket.  If the request is complete
# then queue it up; return 1 if complete, 0 otherwise.
sub read_request_data {
    my $client = shift;
    my $data = '';
    my $rv   = $client->recv($data, POSIX::BUFSIZ, 0);

    unless (defined($rv) && length $data) {
	# This would be the end of file, so close the client
	_log(3, "EOF for request at",
	    $client->peerhost.':'.$client->peerport);
	delete $nb{$client};
	delete $inbuffer{$client};
	delete $ready{$client};

	$select->remove($client);
        $client->shutdown(2);
        $client->close;
	return 0;
    }

    $inbuffer{$client} .= $data;
    $nb{$client} = $1 if not exists $nb{$client}
	and $inbuffer{$client} =~ s/^(\d+)\://;

    # test whether the data in the buffer or the data we
    # just read means there is a complete request waiting
    # to be fulfilled.  If there is, set $ready{$client}
    # to the requests waiting to be fulfilled.
    if (length $inbuffer{$client} >= $nb{$client}) {
	_log(5, "got complete request from",
	    $client->peerhost.':'.$client->peerport);
	# request complete
	my $request;
	if (length $inbuffer{$client} == $nb{$client}) {
	    $request = $inbuffer{$client};
	    delete $inbuffer{$client};
	} else {
	    $request = substr($inbuffer{$client}, 0, $nb{$client});
	    substr($inbuffer{$client}, 0, $nb{$client}) = '';
	}
	delete $nb{$client};
	push( @{$ready{$client}}, $request);
        return 1;
    } else {
	_log(1, "got INCOMPLETE request from",
	    $client->peerhost.':'.$client->peerport,
            "want:",$nb{$client},"got:",length $inbuffer{$client});
        return 0;
    }
}

# The specified socket (a worker process) has data to be read.
sub read_response_data {
    my $client = shift;
    my $data = '';
    my $rv   = $client->recv($data, POSIX::BUFSIZ, 0);

    unless (defined($rv) && length $data) {
	# This would be the end of file, so close the client
	_log(1, "worker at",
	    $client->peerhost.':'.$client->peerport,"died");

	# TODO should we make an attempt to process any messages
	# that might be pending?  For example, what if the worker
	# sent a response and then died/exited before we got around
	# to processing the response.
	delete $nb{$client};
	delete $inbuffer{$client};

	my $task = $worker{$client};
	if (defined $task) {
	    # Worker was doing something when it died
	    $task->worker(undef);
	    $task->reschedule('DIED');
	}
	delete $worker{$client}; 

	$select->remove($client);
	_log(3, "closing client at ",
	    $client->peerhost,':',$client->peerport);
	close $client;
	return 0;
    }

    $inbuffer{$client} .= $data;
    $nb{$client} = $1 if not exists $nb{$client}
	and $inbuffer{$client} =~ s/^(\d+)\://;

    # test whether the data in the buffer or the data we
    # just read means there is a complete request waiting
    # to be fulfilled.  If there is, set $ready{$client}
    # to the requests waiting to be fulfilled.
    if (length $inbuffer{$client} >= $nb{$client}) {
	_log(3, "worker response complete");
	my $request = substr($inbuffer{$client}, 0, $nb{$client});
	if (length $inbuffer{$client} > $nb{$client}) {
	    # XXX for workers there should NEVER be more than one
	    # response in the socket.  Extra characters probably mean
	    # an encoding error by the worker.
	    _log(0, "excess data from worker");
	}
	delete $inbuffer{$client};
	delete $nb{$client};
	# check to see that we are not overwriting an
	# existing response (should never happen, but...)
        if (exists $response{$client}) {
            SC->error("Overwrote existing response record from worker",
                $client->peerhost,':',$client->peerport);
        }
	$response{$client} = $request;
        return 1;
    } else {
        return 0;
    }
}


# process_request($socket) deals with pending requests on behalf of $client
sub process_request {
    # requests are in $ready{$client}
    # send output to $outbuffer{$client}
    my $client = shift;
    my $request;

    foreach $request (@{$ready{$client}}) {
	my $task = new Task(
	    request => $request,
	    next_dispatch_ts => time);
	push @queue, $task;
	$outbuffer{$client} .= "OK\n";
    }
    delete $ready{$client};
}

# process_response($socket) deals with responses from worker $client
sub process_response {
    # response is in $response{$client}
    # no reply to worker needed
    my $client = shift;
    my $response = Storable::thaw($response{$client});
    my $task = $worker{$client};
    _log(3, 'task', $task->as_string,
	' status:', $response->{STATUS}, 'msg:', $response->{MSG},
	'plan:', , $response->{PLAN}, 'delay:', $response->{DELAY}, 'repeat:', $response->{REPEAT});
    $task->reschedule($response->{STATUS}, $response->{PLAN}, $response->{DELAY}, $response->{REPEAT});
    $task->worker(undef);
    $worker{$client} = undef;
    delete $response{$client};
}

# nonblock($socket) puts socket into nonblocking mode
sub nonblock {
    my $socket = shift;
    my $flags;
    
=pod
# The original version from The Perl Cookbook used fcntl which is not
# available with Win32 as of 5.6.1, at least.  I got the ioctl call from
# http://dbforums.com/archives/t314915.html

=cut
#    my $set_it = "1";
#    my $ioctl_val = 0x80000000 | (4 << 16) | (ord('f') << 8) | 126;
#    ioctl($socket, $ioctl_val, $set_it) or die "couldn't set nonblocking: $!";
    $flags = fcntl($socket, F_GETFL, 0)
            or die "Can't get flags for socket: $!\n";
    fcntl($socket, F_SETFL, $flags | O_NONBLOCK)
            or die "Can't make socket nonblocking: $!\n";

}

sub _log {
    SC->log(@_);
}

sub REAPER {
    my $child;
    while (($child = waitpid(-1, WNOHANG)) > 0) {
	SC->log(2, "reaped $child" . ($? ? " with exit $?" : ''));
    }
    $SIG{CHLD} = \&REAPER; # re-enable
}


# ======================================================================

package Task;

# Possible status values:
#   'NEW'    - newly created
#   'FAILED' - task completed but with a non-success return
#   'FAILED_2' - task completed but with a non-success return more than once
#   'DIED'   - died once
#   'DIED_2' - died multiple times
#   'DELETED' - died too many times so gave up

use strict;
use warnings;

my ($task_seq, $dbh, $logger);
my ($sth_ins, $sth_del, $sth_sel, $sth_sel_id, $sth_upd);

use DBI;
use Storable qw(freeze thaw);

sub BEGIN {
    no strict 'refs';
    $task_seq = 1;
    for my $method (qw(
			request worker status task_id
			create_ts dispatch_ts update_ts next_dispatch_ts
			)) {
	my $field = '_' . $method;
	*$method = sub {
	    my $self = shift;
	    @_ ? $self->{$field} = shift
	       : $self->{$field};
	}
    }
}

sub initialize {
    my ($class, $task_dbh, $reset, $task_logger) = @_;
    
    $logger = $task_logger;
    $dbh = $task_dbh;
    $sth_ins = $dbh->prepare(qq{
        insert into dispatch_task (
               task_id,
               request,
               status,
               create_ts,
               dispatch_ts,
               update_ts,
               next_dispatch_ts)
           values (?,?,?,$SC::to_date,$SC::to_date,$SC::to_date,$SC::to_date)});
    $sth_sel = $dbh->prepare(qq{
        select task_id,
               request,
               status,
               create_ts,
               dispatch_ts,
               update_ts,
               next_dispatch_ts
          from dispatch_task
         where status <> 'DELETED'});
    $sth_sel_id = $dbh->prepare(qq{
        select MAX(task_id)
          from dispatch_task});
    $sth_upd = $dbh->prepare(qq{
        update dispatch_task
           set status=?,
               create_ts=$SC::to_date,
               update_ts=$SC::to_date,
               next_dispatch_ts=$SC::to_date
         where task_id=?});
    if ($reset) {
	$task_seq = 1;
    }
    return 1;
}

sub new {
    my $class = shift;
    my $self = bless {} => $class;
    $self->create_ts(time);
    $self->status('NEW');
    $self->task_id($task_seq++);
    while (@_) {
	my $method = shift; $self->$method(shift) if $self->can($method);
    }
    $self->db_insert;
    return $self;
}

# class method to recreate an array of Task instances 
sub db_recreate {
    my $class = shift;
    my @q = ();
    $sth_sel->execute;
    while (my $p = $sth_sel->fetchrow_arrayref) {
        # Do not use new() to recreate Tasks or a duplicate entry will be
        # created in the database.
        my $t = bless {} => $class;
        $t->task_id($p->[0]);
        $t->request($p->[1]);
        $t->status($p->[2]);
        $t->create_ts(dbts2tm($p->[3]));
        $t->dispatch_ts(dbts2tm($p->[4]));
        $t->update_ts(dbts2tm($p->[5]));
        $t->next_dispatch_ts(dbts2tm($p->[6]));
	push @q, $t;
    }
    _log(4, "recreated", scalar @q, "tasks");
    ($task_seq) = $dbh->selectrow_array($sth_sel_id);
    $task_seq = defined $task_seq ? ($task_seq + 1) : 1;
    _log(4, "task_id hwm=", $task_seq);
    return @q;
}

# Handles rescheduling a task after it has executed.  The status of the
# most recent execution is supplied.  Returns nonzero if
# the task should be kept in the queue, zero if the task should be deleted
# from the queue.
sub reschedule {
    my $self = shift;
    my $status = shift;
    my $plan_ts = shift;
    my $delay = shift;
    my $repeat = shift;
    
    my $requeue = 1;
    my $prev_status = $self->status;
    my $now = time;
    $self->update_ts($now);

    if ($status eq 'SUCCESS') {
	# will be removed from queue during next dispatch cycle
		if ($repeat <= 0 || $self->next_dispatch_ts > $delay * $repeat + $plan_ts)
		{
			$self->status('DELETED');
			$self->next_dispatch_ts($FOREVER);
			$requeue = 0;
		} else {
			$self->status('PLAN');
			$self->next_dispatch_ts($now + $delay);
		}
    } elsif ($status eq 'FAILED') {
	if ($prev_status eq 'FAILED') {
	    # failed once before; try again in 1min
	    $self->status('FAILED_2');
	    $self->next_dispatch_ts($now + 60);
	} elsif ($prev_status eq 'FAILED_2') {
	    # failed multiple times before; try every 5min for
	    # 4hr then give up
	    if ($now - $self->create_ts > 4*60*60) {
		# will be removed from queue during next dispatch cycle
		$self->status('DELETED');
		$self->next_dispatch_ts($FOREVER);
	    } else {
		$self->next_dispatch_ts($now + 5*60);
	    }
	} else {
	    # try again in 60sec
	    $self->status('FAILED');
	    $self->next_dispatch_ts($now + 60);
	}
    } elsif ($status eq 'DIED') {
	if ($prev_status eq 'DIED') {
	    # died once before; try again in 1min
	    $self->status('DIED_2');
	    $self->next_dispatch_ts($now + 60);
	} elsif ($prev_status eq 'DIED_2') {
	    # died multiple times before; try every 5min for
	    # 4hr then give up
	    if ($now - $self->create_ts > 4*60*60) {
		# will be removed from queue during next dispatch cycle
		$self->status('DELETED');
		$self->next_dispatch_ts($FOREVER);
	    } else {
		$self->next_dispatch_ts($now + 5*60);
	    }
	} else {
	    # try again in 60sec
	    $self->status('DIED');
	    $self->next_dispatch_ts($now + 60);
	}
    } else {
	_log(0, "unknown task result status '$status'");
	$self->status('DELETED');
	$self->next_dispatch_ts($FOREVER);
    }
    _log(4, "rescheduled task", $self->task_id, "status=", $self->status,
        "next dispatch time=", tm2dbts($self->next_dispatch_ts));
    $requeue ? $self->db_update : $self->db_delete;
    return $requeue;
}

# just cancel the job
sub cancel {
    my $self = shift;
    $self->db_delete;
}

# inserts this Task into persistent store
sub db_insert {
    my $self = shift;
    _log(6, "db_insert:", $self->as_string);
    $sth_ins->execute(
        $self->task_id,
        $self->request,
        $self->status,
        tm2dbts($self->create_ts),
        tm2dbts($self->dispatch_ts),
        tm2dbts($self->update_ts),
        tm2dbts($self->next_dispatch_ts)
    );
#    $dbh->commit;
}

# updates this Task to persistent store 
sub db_update {
    my $self = shift;
    _log(6, "db_update", $self->as_string);
    $sth_upd->execute(
        $self->status,
        tm2dbts($self->create_ts),
        tm2dbts($self->update_ts),
        tm2dbts($self->next_dispatch_ts),
        $self->task_id);
#    $dbh->commit;
}

# deletes this Task from persistent store
sub db_delete {
    my $self = shift;
    _log(6, "db_delete", $self->as_string);
    #delete $task_db{$self->task_id};
    $self->db_update;
}

sub as_string {
    my $self = shift;
    return "Task #" . $self->task_id;
}

# Class utility methods
# Convert between "time" (Unix epoch) and "date" (as yyyy-mm-dd hh24:mi:ss)
sub tm2dbts {
    my $tm = shift;
    my ($sec, $min, $hr, $mday, $mon, $yr);

    return undef unless defined $tm;
    return undef if $tm == 0;
    ($sec, $min, $hr, $mday, $mon, $yr) = localtime $tm;
    return sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
	     $yr+1900, $mon+1, $mday,
	     $hr, $min, $sec);
}

sub dbts2tm {
    my($dbts) = @_;
    my($yr, $mo, $day, $hr, $min, $sec);
    my($t);

    if (not defined $dbts or $dbts eq '' or $dbts eq '0000-00-00 00:00:00') {
        return undef;
    } elsif (length($dbts) != 19) {
        die "Bad date length: <$dbts>";
        return undef;
    }
    
    $yr = substr($dbts, 0, 4) - 1900;
    $mo = substr($dbts, 5, 2) - 1;
    $day = substr($dbts, 8, 2);
    $hr = substr($dbts, 11, 2);
    $min = substr($dbts, 14, 2);
    $sec = substr($dbts, 17, 2);

    $yr = 70 if $yr <= 69;	# truly awful hack // shc 1998-11-08
    if ($yr < 0 or $mo < 0 or $mo > 11 or $day < 1
            or $day > 31 or $hr < 0 or $hr > 23 or $min < 0 or $min > 59
            or $sec < 0 or $sec > 59) {
        die "Bad date: <$dbts>";
        return undef;
    }

    $t = Time::Local::timelocal($sec, $min, $hr, $day, $mo, $yr) + 0;
    $t = 86400 if $t < 0;	# awful hack!
    return $t;
}


sub _log {
    SC->log(@_);
}

# ========================== End Task package ============================

1;

__END__

=head1 NAME

dispd - ShakeCast Dispatch Daemon

=head1 DESCRIPTION

The Dispatch Daemon (dispd) queues and dispatches requests to either
get files from remote servers or send new events, shakemaps, or products
to remote servers.
This processing is done in asynchronously (it does not block the requesting
process) in order to decouple upstream processes from possible network
delays.

=head1 Invocation

=head2 Options

=over 4

=item --conf=I<config-file>

Read configuration from I<config-file> rather than the default configuration
file C<sc.conf>.

=item --daemon

Runs the process as a daemon (close stdin, stdout and stderr, dissocates from
the tty) B<[UNIX only]>

=item --[no]reset

Deletes any tasks that have been queued but not completed.
The default is --noreset (keep previously queued tasks).

=back

=head2 Starting and Stopping the daemon -- Windows

On Windows the Dispatch daemon runs as a Windows service
named I<Shakecast Dispatch Daemon>.
You can start, pause, and stop it using the Service Control Panel.
You can also start and stop the daemon with the Windows B<net start> 
and B<net stop> commans:

    $ net start dispd
    The ShakeCast Dispatcher service is starting.
    The ShakeCast Dispatcher service was started successfully.

=head2 Starting and Stopping the daemon -- Unix

=head1 Remote Command Interface

The Dispatch Daemon has a telnet-based command interface that allows
you to interact with the daemon while it is running.
Using this interface you can start, stop, pause, and resume the daemon.
You can also control how frequently the scheduling loop runs.

=head2 Commands

=over 4

=item comment

Insert a message into the log file at log level 0.

=item cycle

Run the scheduler now.
If the daemon is paused the C<cycle> command is ignored.

=item exit

Exit the command processor.
This does not stop the daemon itself.

=item help

Display command-line help

=item logrotate

Rotate log file.

Because the daemon always writes to the same fixed log file,
over time this file can become quite large.
To reset the log file without needing to stop the daemon,
use the C<logrotate> command.
The daemon log file is closed, then renamed using a name based on the
current date and time, finally a new log file is opened.
The backed up log file can be retained, archived, or deleted.

=item pause

Pause processing (does not terminate the daemon).
Processing can be resumed with the C<resume> command.

=item poll

=item poll I<secs>

Show or set the polling interval in seconds.
With no arguments this command displays the number of seconds remaining
until the next replication cycle.
If an argument is given, it is taken as the new polling interval.

The polling interval determines how frequently the scheduling loop is run.
Increasing the interval can lessen the workload on the server, but may
also cause requesting programs to block and can delay delivery of
new events, etc. to downstream servers.

=item quit

Exit the command processor.
This does not stop the daemon itself.

=item resume

Start or resume processing.

=item set

Set parameter=value (or set parameter value)

=item shutdown daemon

Terminate the daemon.
You must specify the C<daemon> command argument.

=item start

Start or resume processing

=item stop

Pause replication (does not terminate the daemon).
Processing can be resumed with the C<resume> command.

=item terminate daemon

Terminate the daemon.
You must specify the C<daemon> command argument.

=back

=head1 Security

Using the remote command interface it would be possible for a
malicions user to disrupt the ShakeCast system.
For example, the daemon could be stopped, preventing delivery of events,
shakemaps, and products to downstream servers.
It is therefore critical to secure telnet access to the server
running the dispatch daemon such that unauthorized users cannot
connect to the daemon.

If the machine hosting the dispatch daemon is isolated behind a
firewall it may be sufficient to block access to the daemon
at the firewall.
By default the daemon listens on port 53456; this can be altered
in the daemon configuration file.

=head1 Configuration

Some of the default settings for B<dispd> can be
changed by modifying values in the configuration file C<sc.conf>,
found in the C<conf> subdirectory of the ShakeCast root directory.
Note that changes will not take effect
until the daemon is stopped and restarted -- pausing the daemon
is not sufficient.

The dispatcher configuration section in the standard config file
looks something like this:

    <Dispatcher>
        MinWorkers	2
        MaxWorkers	20
        WorkerPort	58163
        RequestPort	58164
        
        AUTOSTART	1
        LOG		/usr/local/sc/logs/sc.log
        LOGGING	3
        POLL	1
        PORT	53456
        PROMPT	dispd>
        SERVICE_NAME  dispd
        SERVICE_TITLE ShakeCast Dispatcher
        SPOLL	1
    </Dispatcher>

=cut
