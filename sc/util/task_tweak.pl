#!/usr/local/bin/perl

# $Id: sync_conf.pl 445 2008-08-14 20:41:34Z klin $

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

use Data::Dumper;
use IO::File;
use Config::General;

use Getopt::Long;
use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use SC::Server;

use Time::Local;

sub epr;
sub vpr;
sub vvpr;
sub parse_time;
sub parse_size;

my $sth_clear_dispatch;

my $mode;
my $config_file ='sc.conf';
my $config_path = "$FindBin::Bin/../conf/";

my %options;
GetOptions(\%options,
    'toconf',	# export smtp from db to sc.conf
    'todb'		# export smtp from sc.conf to db
);

SC->initialize()
    or die "could not initialize SC: $@";

my $config = SC->config;
my @tasks = ('heartbeat', 'maintain_event', 'logrotate', 'logstats');

my ($prog, $ts, $repeat, $count) = @ARGV;
exit "$prog is not a valid task.\n" unless ($prog && (grep /$prog/, @tasks));
 
my ($year, $month, $day, $hour, $min, $sec) = $ts =~ /(\d+)/g;
$month=$month - 1;
my $epoch_time = timelocal($sec, $min, $hour, $day, $month, $year);

$sth_clear_dispatch = SC->dbh->do(qq{
    update dispatch_task
    set next_dispatch_ts = "$ts"
    where status = "PLAN"
        and request like "%$prog%"
	});

exit;



sub vpr {
    if ($options{'verbose'} >= 1) {
        print @_, "\n";
    }
}

sub vvpr {
    if ($options{'verbose'} >= 2) {
        print @_, "\n";
    }
}

sub epr {
    print STDERR @_, "\n";
}

sub usage {
    my $rc = shift;

    print qq{
task_tweak -- Modify task workers in SC database
Usage:
  task_tweak  

};
    exit $rc;
}



