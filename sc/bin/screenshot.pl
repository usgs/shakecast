#!/usr/local/bin/perl


# $Id: manage_facility.pl 519 2008-10-22 13:58:44Z klin $

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

use GD;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
SC->initialize;

my ($event_id, $event_version) = @ARGV;
my $DataRoot = SC->config->{DataRoot};
my $tmpfile = "$DataRoot/$event_id-$event_version/tmp.jpg";
my $outfile = "$DataRoot/$event_id-$event_version/screenshot.jpg";

#."/$shakemap_id-$shakemap_version";
screen_capture($event_id, $event_version);

exit unless (-e $tmpfile);
my $rv = check_grey($tmpfile);

if ($rv < 120) {
    rename($tmpfile, $outfile);
    print "process product STATUS=SUCCESS\n";
} elsif ($rv> 160) {
    unlink $tmpfile;
}
exit;

sub screen_capture {
    my ($event_id, $event_version) = @_;
	
    my $wkhtmltopdf = SC->config->{wkhtmltopdf};
    #my $url = 'http://guest:guest@localhost/html/screenshot.html?event='."$event_id-$event_version";
    my $url = 'https://localhost/index.cgi?dest=screenshot1&event='."$event_id-$event_version";
    my $filesize = 20*1024;	#20k
    my $proxy = (SC->config->{ProxyServer}) ? ' -p '.SC->config->{ProxyServer} : '';
    
    my $rv = `/bin/touch $tmpfile`;
    $rv = `$wkhtmltopdf --javascript-delay 8000 $proxy --width 1024 --height 534 '$url' $tmpfile`;
    
    SC->log(0, "Screen Capture: $event_id-$event_version ".$rv);

    return 0;
}		

sub check_grey {
    my ($file) = @_;
    my $im = new GD::Image($file);
    
    my ($width, $height) = $im->getBounds();
    my $grey = 114;
    my $cell_size = 64;
    my $grey_cell = 0;
    for (my $x = 0; $x<int($width/$cell_size); $x++) {
        for (my $y = 0; $y<int($height/$cell_size); $y++) {
            my $grey_cnt = 0;
            for (my $xind = 1; $xind < $cell_size; $xind = $xind+2) {
                last if ($x*$cell_size + $xind > $width);
                for (my $yind=1; $yind < $cell_size; $yind=$yind+2) {
                    last if ($y*$cell_size + $yind > $height);
                   my $index = $im->getPixel($x*$cell_size+$xind,$y*$cell_size+$yind);
                    my ($red, $green, $blue) = $im->rgb($index);
                    ($red, $green, $blue) = (int($red/2), int($green/2), int($blue/2));
                    $grey_cnt++
                        if (abs($red-$grey) <=4 and abs($blue-$grey) <=4 and abs($green-$grey) <=4);
                    
                }
            }
            $grey_cell++ if ($grey_cnt > 250);
        }
    }
    return $grey_cell;
}
