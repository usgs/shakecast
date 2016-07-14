#!/usr/local/bin/perl

#
# $Id: heartbeat.pl 475 2008-09-05 17:14:37Z klin $
#
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

#use strict;

use FindBin;
use lib "$FindBin::Bin/../lib";

use Data::Dumper;

use Getopt::Long;
use Sys::Hostname;

use Carp;

use SC;

SC->initialize() or die "Can't initialize: ", SC->errstr;

my $config = SC->config;

my $xml = SC->xml_in("info.xml");

$config->{'LogLevel'} = 4;

#print Dumper($xml);
#print ref($xml->{'info'}->{'tag'});

    eval {
	use Shake::Distance;
	use Shake::Regressions;
    };
    if ($@) {
	$SC::errstr = $@;
	return 0;
    }

    undef $SC::errstr;

		my $sth_s = SC->dbh->prepare(qq/
			select *
			  from shakemap_parameter
			 where shakemap_id = ?
			 order by shakemap_version desc
			 limit 1/);
		$sth_s->execute('usb0008e4z');
		my $sm_param = $sth_s->fetchrow_hashref('NAME_lc');
		$sth_s->finish;
		my ($bias, $gmpe);
        if ($sm_param) {
			my (@fields) = split /\s/, $sm_param->{'bias'};
			$bias = { pga   => $fields[0],
					  pgv   => $fields[1],
					  psa03 => $fields[2],
					  psa10 => $fields[3],
					  psa30 => $fields[4] };
			$gmpe = !($sm_param->{'gmpe'}) ? $sm_param->{'gmpe'} : "Regression::BJF97";
			#$gmpe .= '::';
			#SC->log(2, "using bias $bias and gmpe $gmpe");
			eval "$gmpe->new" or ($gmpe = "test::BJF97");
			print( "using bias $bias and gmpe $gmpe\n");
			print Dumper($bias),"\n";
		}


exit 0;