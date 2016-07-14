#!c:/perl/bin/perl

#
### control_sc_services: Install, Remove, Start, Stop SC Services
#

###########################################################################
#
# service_install.pl
#
###########################################################################

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
# U.S. Geological Survey (USGS) and Gatekeeper Systems have no
# obligations to provide maintenance, support, updates, enhancements or
# modifications. In no event shall USGS or Gatekeeper Systems be liable
# to any party for direct, indirect, special, incidental or consequential
# damages, including lost profits, arising out of the use of this
# software, its documentation, or data obtained though the use of this
# software, even if USGS or Gatekeeper Systems have been advised of the
# possibility of such damage. By downloading, installing or using this
# program, the user acknowledges and understands the purpose and
# limitations of this software.
# 
# Additional Software
# ===================
# 
# This software includes software developed by the Apache Software
# Foundation (http://www.apache.org/) which is Copyright © 2000-2002 by
# the Apache Software Foundation. All rights reserved. You agree to
# abide by the terms and conditions of the Apache license. See
# http://www.apache.org/ for more information. This product also
# includes the MySQL Database Server. You agree to abide by the terms
# and conditions of the MySQL license. See http://www.mysql.com/ for
# more information.
# 
# Contact Information
# ===================
# 
# Coordination of this effort is under the auspices of the USGS Advanced
# National Seismic System (ANSS) coordinated in Golden, Colorado, which
# functions as the clearing house for development, distribution,
# documentation, and support. For questions, comments, or reports of
# potential bugs regarding this software please contact wald@usgs.gov or
# cbworden@usgs.gov.  
#
#############################################################################


$^W = 1;

use strict;

my $VERSION = 'control_sc_services 0.0.7';
my $RCSID = '@(#) $Id: control_sc_services.pl 64 2007-06-05 14:58:38Z klin $ ';

use Getopt::Long;

#
##### Primary Configuration #####
#

my $VERBOSE = 1;

my $SCROOT = "c:/shakecast";

my $PAUSING = 0;

my @ORDER = qw(sc_dispd sc_polld
	       sc_notifyqueue sc_notify);

my %DELAYS = ();

my %SERVICES = (
		sc_polld    => ["--spath=%SC%/sc/bin/polld",
				"--sparms=--service"],
		sc_dispd    => ["--spath=%SC%/sc/bin/dispd",
				"--sparms=--service"],
		sc_notifyqueue  => ["--spath=%SC%/sc/bin/notifyqueue",
				"--sparms=--service"],
		sc_notify   => ["--spath=%SC%/sc/bin/notify",
				"--sparms=--service"],
		sc_rssd   => ["--spath=%SC%/sc/bin/rssd",
				"--sparms=--service"],
		);

my $LOCALS = "sc_notify,sc_notifyqueue,sc_polld,sc_dispd";

##### Local Variables #####

my ($opt_help, $opt_version, $verbose);

my ($installing, $removing, $starting, $stopping, $services, $local);

my @services;


##### Sub Declarations #####

sub epr;
sub error;
sub quit;
sub vpr; 
sub vvpr;
sub vvvpr;

##### Main Code #####

my $pname = $0;
$pname =~ s=\\=/=g;
$pname =~ s=\.\w+?$==;
$pname =~ s=^.*/==;

my $scroot = $SCROOT;

my $pausing = $PAUSING;

GetOptions(
	   "help",            \$opt_help,
	   "local!",          \$local,
	   "install!",        \$installing,
	   "msglevel=i",      \$verbose,
	   "pause!",          \$pausing,
	   "remove!",         \$removing,
	   "scroot",          \$scroot,
	   "services=s",      \$services,
	   "start!",          \$starting,
	   "stop!",           \$stopping,
	   "verbose!",        \$verbose,
	   "version",         \$opt_version,
	   ) or
    die "Terminated: Bad Option(s)\n";

help() if $opt_help;

if ($opt_version) {
    printversion();
    finish(0);
}

$verbose = $VERBOSE unless defined $verbose;

vvpr "Start $pname.  Version: $VERSION";

quit "exactly one of --start, --stop, --install, --remove required" if
    (nz($installing) + nz($removing) + nz($starting) + nz($stopping)) != 1;

undef $services if $services and $services eq 'all';

$services = $LOCALS if $local;

if ($services) { 
    @services = split /,/, $services;
    my $n = 0;
    foreach my $s (@services) {
	unless (exists $SERVICES{$s}) {
	    error "no such SC service: $s";
	    $n++;
	}
    }
    quit "unable to continue" if $n;
}
else { @services = @ORDER }

my ($path, $myname) = execpath($0);
my $service_installer = "$path/service_install";
my $use_perl;
if ($myname =~ /\.pl/) { 
    $use_perl = 1;
    $service_installer .= '.pl';
}
else { $service_installer .= '.exe' }

$service_installer =~ s=/=\\=g;

if ($installing) { install() }
elsif ($removing) { remove() }
elsif ($starting) { start() }
elsif ($stopping) { stop() }

finish(0);


##### Processing Routines #####

sub install {
    foreach my $srv (@services) {
	epr "installing $srv:";
	my $p = $SERVICES{$srv};
	if (ref $p eq 'CODE') {
	    &$p("install", $srv);
	}
	else {
	    my @pp;
	    foreach my $s (@$p) {
		push @pp, fixup($s);
	    }
	    service_install("--install", "--sname=$srv", @pp);
	}
    }
}

sub remove {
    foreach my $srv (@services) {
	epr "stopping $srv in case it is running:";
	system "net", "stop", $srv;	
	epr "removing $srv:";
	service_install("--remove", "--sname=$srv");
    }
}

sub service_install {
    my @args = @_;
    my $path;

    if ($use_perl) {
	$path = $^X;
	unshift @args, $service_installer;
    }
    else { $path = $service_installer }
#    epr "<<$path>  <@args>>";
    system $path, @args;
}


sub start {
    foreach my $srv (@services) {
	epr "starting $srv:";
	system "net", "start", $srv;
	my $sleep = $DELAYS{$srv};
	if ($sleep) {
	    epr "  sleeping for $sleep...";
	    sleep $sleep;
	}
    }
}


sub stop {
    foreach my $srv (@services) {
	epr "stopping $srv:";
	system "net", "stop", $srv;
    }
}


##### Installation Support Routines #####

##### Support Routines #####

sub epr {
    print STDERR @_, "\n";
}


sub error {
    epr "error: ", @_;
}


sub execpath {
    my $path = shift;
    my $name;

    $path =~ s=\\=/=g;
    if ($path =~ m=^(.*)/(.+)=) {
	$path = $1;
	$name = $2;
    }
    else {
	$name = $path;
	$path = '.';
    }
    return ($path, $name);
}


sub finish {
    my $rc = shift;
    if ($pausing) {
	print STDERR "\nPress ENTER to continue...";
	my $dummy = <>;
    }
    exit $rc;
}


sub fixup {
    my $s = shift;

    $s =~ s/%SC%/$SCROOT/g;
    return $s;
}

    
sub help {
    printversion();
    print <<__EOF__;

ShakeCast Services Control

Usage: $pname [options...]
    --help              print this help text and exit.
    --version           print version information and exit.
    --local             use only the local (not apache or mysql) daemons
    --msglevel=n        logging level.
    --pause             pause when finished.
    --verbose           use msglevel=1 (see --msglevel).
    --install           install this daemon as a service.
    --remove            remove this daemon as a service.
    --scroot            shakecast root (default = $SCROOT)
    --services=name[,name...] service[s] to control (default = 'all')
    --start             start services.
    --stop              stop services

    Option names may be uniquely abbreviated and are case insensitive.
    You may use either --option or -option. If -option, then use
    "-option n" in place of "--option=n".
__EOF__
    finish(0);
}


sub ns {
    $_[0] ? $_[0] : '';
}


sub nz {
    $_[0] ? $_[0] : 0;
}


sub printversion {
    print "Program: $pname\nVersion: $VERSION\n";
    print "RCS ID : " . substr($RCSID, 5) . "\n";
}


sub vpr {
    epr @_ if $verbose >= 1;
}


sub vvpr {
    epr @_ if $verbose >= 2;
}


sub vvvpr {
    epr @_ if $verbose >= 3;
}


sub quit {
    epr "quit: ", @_;
    finish(1);
}


#####
