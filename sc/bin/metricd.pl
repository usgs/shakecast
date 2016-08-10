#!/usr/local/bin/perl

# $Id: fragd.pl 426 2008-08-14 16:35:33Z klin $

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
use lib "$FindBin::Bin/../lib";

use GenericDaemon qw(&vpr);
use SC;
use SC::Server;
use Shake::Metrics;

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

my $VER = 'Metric Daemon v0.1';

Getopt::Long::Configure('pass_through'); # GenericDaemon will consume the rest
GetOptions(\%options,
    'conf=s',	# specifies alternate config file (sc.conf is default)
);

my $config_file = (exists $options{'conf'} ? $options{'conf'} : 'sc.conf');

SC->initialize($config_file, 'metricd')
    or die "could not initialize SC: $@";

my $signon = "**** $VER started ****";
SC->log(1, '*' x length $signon);
SC->log(1, $signon);

# Get configuration options
my $config = SC->config->{'Metric'};

GenericDaemon::initialize(
    'version'=>$VER,
    'conf'   =>$config);

SC->setids();                 

GenericDaemon::run(\&process);

exit 1;	# abnormal termination


# Main loop: check reads/accepts, check writes, check ready to process
sub process {
    my @metrics = Shake::Metrics->metrics_to_poll;
    if (@metrics) {
        foreach my $metric (@metrics) {
            $metric->scan_for_updates or SC->error($metric->{'METRIC'}, $SC::errstr);
            GenericDaemon::spoll;
        }
    } elsif ($SC::errstr) {
        SC->error($SC::errstr);
    }
}

