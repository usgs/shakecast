
#
### GKS::Service.pm -- Provide NT Service Services ###
#
# 
# $Id: Service.pm 64 2007-06-05 14:58:38Z klin $


package GKS::Service;

use strict;

use Win32;
use Win32::Daemon;

use vars qw($VERSION $VDATE @ISA @EXPORT @EXPORT_OK %EXPORT_TAGS);

require Exporter;

@ISA = qw(Exporter);

@EXPORT = qw(
	     );

@EXPORT_OK = qw(install_service remove_service poll_service
		start_service stop_service register_service_callbacks);

%EXPORT_TAGS = (
		);

$VERSION = '0.04';

$VDATE = '2004-03-10 21:38Z';

use vars qw($RCSID);

$RCSID = '@(#) $Id: Service.pm 64 2007-06-05 14:58:38Z klin $ ';

#
### Global Data ###
#

my $SLEEP_PERIOD = 4;

#
### Local Data ###
#

my ($pause_callback, $stop_callback, $continue_callback, $trace_callback);

#
### Global Routines ###
#

sub install_service {
    my ($name, $display, @parms) = @_;
    my $exec;

    my $me = Win32::GetFullPathName($0);
    if ($me =~ /\.exe$/) {
	$exec = $me;
    }
    else {
	$exec = $^X;		# perl
	unshift @parms, $me;
    }
    my %config = (
		  machine => '',
		  name => $name,
		  display => $display,
		  path => $exec,
		  user => '',
		  pwd => '',
		  parameters => join(' ', @parms),
		  );
    if (Win32::Daemon::CreateService(\%config)) {
	return undef;
    }
    return _get_error();
}


sub poll_service {
    my $state;

    my $my_state = SERVICE_RUNNING;
    while (($state = Win32::Daemon::State()) != SERVICE_STOPPED) {
	if ($state == SERVICE_STOP_PENDING) {
	    &$stop_callback() if $stop_callback;
	    &Win32::Daemon::State($my_state = SERVICE_STOPPED);
	    next;
	}
	if ($state == SERVICE_PAUSE_PENDING) {
	    &$pause_callback() if $pause_callback;
	    &Win32::Daemon::State($my_state = SERVICE_PAUSED);
	    next;
	}
	if ($state == SERVICE_CONTINUE_PENDING) {
	    &$continue_callback() if $continue_callback;
	    &Win32::Daemon::State($my_state = SERVICE_RUNNING);
	    next;
	}
	elsif ($state == 0x80) {    # SERVICE_INTERROGATE -- missing from daemon
	    &Win32::Daemon::State($my_state);
	    next;
	}
	elsif ($state == SERVICE_PAUSED) {    
	    sleep($SLEEP_PERIOD);
	    next;
	}
	elsif ($state == SERVICE_RUNNING) {    
	    return;
	}
	else {
	    # What to do in this case?  We got a service control request that
	    # we are not currently handling.  If we ignore it and loop
	    # we risk looping forever.  The same could happen if we just
	    # return, since we'd get the same response from Daemon::State()
	    # next time we poll.  There probably isn't a "right" answer; I
	    # choose to answer back with what I think the current state is
	    # and return if SERVICE_RUNNING, otherwise sleep (to keep from
	    # doing a busy wait) and loop.
	    &Win32::Daemon::State($my_state);
	    return if $my_state == SERVICE_RUNNING;
	    sleep($SLEEP_PERIOD);
	    next;
	}
    }
    &Win32::Daemon::StopService();
    exit;
}


sub register_service_callbacks {
    my ($scb, $pcb, $ccb, $tcb) = @_;
    $pause_callback = $pcb if $pcb;
    $stop_callback = $scb if $scb;
    $continue_callback = $ccb if $ccb;
    $trace_callback = $tcb if $tcb;
}


sub remove_service {
    my $name = shift;
    if (Win32::Daemon::DeleteService($name)) {
	return undef;
    }
    return _get_error();
}


sub start_service {
    if (my $rc = Win32::Daemon::StartService()) {
	while (SERVICE_START_PENDING != Win32::Daemon::State()) { sleep 1 }
	Win32::Daemon::State(SERVICE_RUNNING);     
    	return undef; 
    }
    return _get_error();
}


sub stop_service {
    Win32::Daemon::StopService();
}


#
### Local Routines ###
#

sub _get_error {
    my $msg = Win32::FormatMessage(Win32::Daemon::GetLastError());
    chomp($msg);
    return $msg;
}

sub _trc {
    &$trace_callback(@_) if $trace_callback;
}


### The End ###

1;

#####

