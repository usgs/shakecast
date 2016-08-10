#!c:/perl/bin/perl

#
### service_install: Install and Remove Services
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

my $VERSION = 'install_service 0.0.3';
my $RCSID = '@(#) $Id: service_install.pl 64 2007-06-05 14:58:38Z klin $ ';

use Getopt::Long;

use Win32;
use Win32::Daemon;

use Carp;

#
##### Primary Configuration #####
#

my $VERBOSE = 1;

##### Local Variables #####

my ($opt_help, $opt_version, $verbose);

my ($service_path, $service_name);

my $service_parms = '';
my $service_user = '';
my $service_pwd = '';
my $service_title = '';

my ($installing, $removing);


##### Sub Declarations #####

sub epr;
sub error;
sub finish;
sub quit;
sub vpr; 
sub vvpr;
sub vvvpr;

##### Main Code #####

my $pname = $0;
$pname =~ s=\\=/=g;
$pname =~ s=\.\w+?$==;
$pname =~ s=^.*/==;

GetOptions(
	   "help",            \$opt_help,
	   "install!",        \$installing,
	   "msglevel=i",      \$verbose,
	   "remove!",         \$removing,
	   "sname=s",         \$service_name,
	   "sparms=s",        \$service_parms,
	   "spath=s",         \$service_path,
	   "spwd=s",          \$service_pwd,
	   "stitle=s",        \$service_title,
	   "suser=s",         \$service_user,
	   "verbose!",        \$verbose,
	   "version",         \$opt_version,
	   ) or
    die "Terminated: Bad Option(s)\n";

help() if $opt_help;

if ($opt_version) {
    printversion();
    exit;
}

$verbose = $VERBOSE unless defined $verbose;

vvpr "Start $pname.  Version: $VERSION";

my @required;

push @required, 'sname' unless $service_name;
push @required, 'spath' unless $service_path or $removing;
push @required, 'install or remove' unless $installing or $removing;

if (@required) {
    error "following required options not supplied:";
    foreach my $i (@required) {
	epr "   $i";
    }
    exit 1;
}

if ($installing) {
    my %config = (
		  machine => '',
		  name => $service_name,
		  display => $service_title,
		  path => $service_path,
		  user => $service_user,
		  pwd => $service_pwd,
		  parameters => $service_parms,
		  );
    unless (Win32::Daemon::CreateService(\%config)) {
	my $msg = Win32::FormatMessage(Win32::Daemon::GetLastError());
	chomp($msg);
	quit $msg;
    }
    vpr "service '$service_name' installed";
}
elsif ($removing) {
    unless (Win32::Daemon::DeleteService($service_name)) {
	my $msg = Win32::FormatMessage(Win32::Daemon::GetLastError());
	chomp($msg);
	quit $msg;
    }  
    vpr "service '$service_name' removed";
}

exit;


##### Support Routines #####

sub epr {
    print STDERR @_, "\n";
}


sub error {
    epr "error: ", @_;
}


sub help {
    printversion();
    print <<__EOF__;

ShakeCast Service Installer

Usage: $pname [options...]
    --help              print this help text and exit.
    --version           print version information and exit.
    --msglevel=n        logging level.
    --verbose           use msglevel=1 (see --msglevel).
    --install           install this daemon as a service.
    --remove            remove this daemon as a service.
    --sname=name        service name.
    --spath=path        path to executable.
    --sparms=string     parameters to pass to service at start.
    --suser=name        user to run as (default = LOCAL_SYSTEM)
    --spwd=password     passord to use (default = none)
    --stitle=title      service title for display.

    Option names may be uniquely abbreviated and are case insensitive.
    You may use either --option or -option. If -option, then use
    "-option n" in place of "--option=n".
__EOF__
    exit;
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
    exit 1;
}


#####











