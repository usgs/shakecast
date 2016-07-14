#!/usr/local/bin/perl

# $Id: watcherd.pl 426 2008-08-14 16:35:33Z klin $

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

use Getopt::Long;
use FindBin;
use Win32::Service;
use Config::General;

use lib "$FindBin::Bin/../lib";

use GenericDaemon qw(&vpr);
use SC;
use Logger;

# Arrange for 'die' and 'warn' to be logged
local $SIG{__DIE__} = sub {
    GenericDaemon::epr("DIE:", @_) if (defined $^S and not $^S);
    die @_;
};

local $SIG{__WARN__} = sub {
    GenericDaemon::epr("WARN:", @_) if (defined $^S and not $^S);
    warn @_;
};

my %options;
my ($config, $logger, $errstr, $conf_file);
my $W32_CONF_FILE = '/shakecast/sc/conf/sc.conf';
my $UNIX_CONF_FILE = '/usr/local/sc/conf/sc.conf';

my $VER = 'Watcher Daemon v0.1';

Getopt::Long::Configure('pass_through'); # GenericDaemon will consume the rest
GetOptions(\%options,
    'conf=s',	# specifies alternate config file (sc.conf is default)
);

my $config_file = (exists $options{'conf'} ? $options{'conf'} : 'sc.conf');

&initialize($config_file, 'watcherd')
    or die "could not initialize SC: $@";

my $signon = "**** $VER started ****";
&log(1, '*' x length $signon);
&log(1, $signon);

GenericDaemon::initialize(
    'version'=>$VER,
    'conf'   =>$config->{'Watcher'});

#SC->setids();                 ##### shc 2004-03-07 #####

 #set up a hash of known service states
my %statcodeHash = (
     '1' => 'stopped.',
     '2' => 'start pending.',
     '3' => 'stop pending.',
     '4' => 'running.',
     '5' => 'continue pending.',
     '6' => 'pause pending.',
     '7' => 'paused.'
);
        

GenericDaemon::run(\&process);

exit 1;	# abnormal termination


# Main loop: check reads/accepts, check writes, check ready to process
sub process {
	my %serviceHash;
	my @sc_services = ('mysql', 'sc_dispd', 'sc_polld', 'sc_rssd', 'sc_notify', 'sc_notifyqueue');
	foreach my $key(@sc_services){
		 my %statusHash;
		 #Win32::Service::GetStatus("", "$key", \%statusHash);
			Win32::Service::GetStatus("", $key, \%statusHash);
		  &log(1, "Watcher $key" . " is currently " . 
			$statcodeHash{$statusHash{"CurrentState"}}) if ($statusHash{"CurrentState"} =~ /[1-7]/);
		 if ($statusHash{"CurrentState"} =~ /1/){
			  &log(1, "Watcher is attempting to start $key.");
				Win32::Service::StartService("", $key);
		 }
	}    
	GenericDaemon::spoll;
}

# don't need any DB connectivity.
sub initialize {
    my ($cf, $facility) = @_;

    # Determine name and location of config file.  If user specifies a
    # file that exists (either relative or absolute), use that.
    # Otherwise, look for it in ../conf, first using the name the user
    # supplied (if it is relative), then using the default 'sc.conf'.
    # Note that this attempt to find the file won't work in the case
    # of PerlApp unless full paths are given so we depend on the
    # defaults in that case.
    my $parent;
    ($parent = __FILE__) =~ s#[\\/]lib[\\/].*##;
    $conf_file = $cf ? $cf : 'sc.conf';
    $conf_file = "$parent/conf/$conf_file" unless -r $conf_file;
    unless (-r $conf_file) {
	if ($^O eq 'MSWin32') { $conf_file = $W32_CONF_FILE }
	else { $conf_file = $W32_CONF_FILE }
    }

    undef $errstr;
    return if $config;	# prevent multiple initialization
    my $conf = new Config::General($conf_file);
    my %chash = $conf->getall;
    $config = \%chash;
    $logger = new Logger(
        $config->{'LogDir'}.'/'.$config->{'LogFile'}, 
        $config->{'LogLevel'},
        $facility);
    unless ($logger) {
	$errstr = Logger->errmsg;
	return 0;
    }
    return 1;
}

sub log {
    $logger->log(@_) if $logger;
}



