#!/usr/local/bin/perl

# $Id: shake_fetch.pl 478 2008-09-24 18:47:04Z klin $

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

use FindBin;
use lib "$FindBin::Bin/../lib";
use File::Basename;
use File::Path;
use IO::File;
use Getopt::Long;
use Carp;
use SC;
use SC::Server;
use LWP::UserAgent;

#######################################################################
# Stuff to handle command line options and program documentation:
#######################################################################

SC->initialize;
my $config = SC->config;
my $perl = $config->{perlbin};

my %options = (
    'network'   => 0,
    'event'    => 0,
    'help'      => 0,
);

GetOptions(
    \%options,

    'network=s',           
    'event=s',           
    'status',           
    'verbose',           
    'force_run',           
    'scenario',           
    'help',             # print help and exit

) or usage(1);

usage(1) if length $options{'event'} <= 1;
usage(1) if length $options{'network'} <= 1;
usage(1) if $options{'help'} == 1;

my $network    = $options{'network'} if defined $options{'network'};
$network = 'sc' if ($network =~ /ci/i);
$network = 'global' if ($network =~ /us/i);
my $evid    = $options{'event'} if defined $options{'event'};
my $status    = defined $options{'status'}  ? 1 : 0;
my $verbose  = defined $options{'verbose'}  ? 1 : 0;
my $scenario  = defined $options{'scenario'}  ? 1 : 0;
my $force_run = (defined $options{'force_run'} || $evid =~ /_se$/) ? 1 : 0;

my $sth_product_list = SC->dbh->prepare(qq{
    select filename
      from product_type
     where product_source="ShakeMap"});



#######################################################################
# Run the program
#######################################################################
my @servers = SC::Server->servers_to_rss;
SC->log(scalar @servers);
SC->log($servers[0]);
my $rc = 0;
if (@servers) {
	foreach my $server (@servers) {
		# http://earthquake.usgs.gov/eqcenter/catalogs/7day-M2.5.xml
		my $url;
		if ($status) {
			$url = "http://" . $server->dns_address . "/eqcenter/catalogs/7day-M2.5.xml";
			$evid = substr $evid, 2;
			if (status_check($url, $evid)) {
				print "SHAKEMAP=$evid, STATUS=TRUE\n" if ($verbose);
			} else {
				print "SHAKEMAP=$evid, STATUS=FALSE\n" if ($verbose);
				$rc = 1;
			}
		} else {
			#http://earthquake.usgs.gov/earthquakes/shakemap/sc/shake/11339042/#download
			$url = "http://earthquake.usgs.gov/earthquakes/shakemap/$network/shake/$evid/download/";
			main($url, $options{'network'}.$evid);
		}
	}
} elsif ($SC::errstr) {
	SC->error($SC::errstr);
}

exit $rc;

#######################################################################
# Subroutines
#######################################################################

sub main {

my	($url, $evid) = @_;

    my $ua = new LWP::UserAgent();
	$ua->proxy(['http'], $config->{'ProxyServer'})
		if (defined $config->{'ProxyServer'});

	my $data_dir = $config->{'DataRoot'}."/$evid";
	if (not -e "$data_dir") {
	  mkpath("$data_dir", 0, 0755) or SC->log("Couldn't create download dir $data_dir");
	}

#get current rss
    my $idp = SC->dbh->selectcol_arrayref($sth_product_list);
    if (scalar @$idp > 1) {
	foreach my $product (@$idp) {
		#my ($product_link, $product) = $product =~ /<a\s+href="([^\" >]*?)">(.*)<\/a>/i;	
		#next unless (defined $product && $product_link eq $product);
		my $resp = $ua->get($url.$product);
		next unless ($resp->is_success);
		print "Fetching $evid: $product\n";
		my $sm_product = $resp->content;
		next unless (defined $sm_product);
	    open(GRD, ">$data_dir/$product")  or SC->log("Couldn't save file: $product");
	    binmode GRD;
	    print GRD $sm_product;
	    close(GRD);
	}
	}
	
	my $cmd = "$perl " .$config->{'RootDir'}."/bin/scfeed_local.pl";
	$cmd .= ' -force_run ' if $force_run;
	$cmd .= ' -scenario ' if $scenario;
	$cmd .= " -event ".$evid;
	SC->log(0, $cmd);
	my $result =  system($cmd);
	return $result;

}


sub status_check {

my	($url, $evid) = @_;

    my $ua = new LWP::UserAgent();
	$ua->proxy(['http'], $config->{'ProxyServer'})
		if (defined $config->{'ProxyServer'});

#get current rss
	my $resp = $ua->get($url);
	return 0 unless ($resp->is_success);
	my $data = $resp->content;

	if (! defined $data) {
		SC->log("Couldn't get data $evid!");
		return -1;
	}
	my @items = rss_to_items($data);

	foreach my $item (@items) {
	  my $id_code = &id_code($item);

	  return 1 if ($id_code =~ /$evid$/);
	}

	return 0;

}


#split rss feed into array of items, item data is untampered, but item tags do not match (cant use with XML::Simple)
sub rss_to_items
{
	my $rss = shift;

	my ($start, @items) = split '<entry>', $rss;

	foreach(@items)
	{
		s/<\/entry>.+//;
	}

	return(@items);
}

sub id_code
{
	my $item = shift;
	
	$item =~ /<id>(.*?)<\/id>/;

	return($1);
}

#
# Return program usage information then quit
#
sub usage {
    my $rc = shift;

    print qq{
shake_fetch.pl -- ShakeMap Fetching Tool

Usage:
  shake_fetch.pl [ Options ] 
  
Options:
    --network=S		Network ID is required for fetching ShakeMap 
    --event=S		Event ID is required for fetching ShakeMap 
    --status		Check ShakeMap status only
    --verbose		Prints informational messages
    --help		Print this message
};
    exit $rc;
}

