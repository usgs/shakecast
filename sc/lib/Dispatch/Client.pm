# $Id: Client.pm 64 2007-06-05 14:58:38Z klin $

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


# Stub function client side interface to dispatcher.

package Dispatch::Client;

use strict;
use warnings;

use Socket;
use Storable;
use FileHandle;
use Logger;

my $DEFAULT_HOST = '127.0.0.1';

my $logger;

sub set_logger {
    $logger = shift;
}

# connect errors 10061 CONNECTION REFUSED
# recv errors    10054 ???

sub dispatch {
    my ($port, $action, @args) = @_;
    my ($remote, $iaddr, $paddr, $proto);
    my ($request, $response);

    $remote  = $DEFAULT_HOST;
    $iaddr = inet_aton($remote);
    $paddr = sockaddr_in($port, $iaddr);
    $proto = getprotobyname('tcp');
    $logger->log(4, "before socket") if $logger;
    socket(SOCK, PF_INET, SOCK_STREAM, $proto) or die "socket: $!";
    $logger->log(4, "before connect") if $logger;
    connect(SOCK, $paddr)                      or die "connect: ".($!+0);
    
    if ($logger) {
        my ($lport, $laddr) = sockaddr_in(getsockname SOCK);
        $logger->log(4, "connected from $laddr\:$lport");
    }
    SOCK->autoflush(1);
    binmode SOCK;

    $logger->log(4, "before Storable::freeze") if $logger;
    $request = Storable::freeze({ACTION=>$action, ARGS=>\@args});
    $request = length($request).':'.$request;
    $logger->log(4, "before send") if $logger;
    send(SOCK, $request, 0);
    $logger->log(4, "before recv") if $logger;
    die "recv: ".($!+0) unless defined recv(SOCK, $response, 256, 0);
    $logger->log(4, "before shutdown") if $logger;
    shutdown(SOCK, 2);
    $logger->log(4, "before close") if $logger;
    close(SOCK);
    $logger->log(4, "after close") if $logger;
    return $response;
}    

1;

