#!/usr/local/bin/perl

# $Id: logrotate.pl 285 2008-01-22 16:10:14Z klin $

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

sub epr;
sub vpr;
sub vvpr;
sub parse_time;
sub parse_size;

my %options;
GetOptions(\%options,
    'conf=s',	# specifies alternate config file (sc.conf is default)
);

my $config_file = (exists $options{'conf'} ? $options{'conf'} : 'sc.conf');

SC->initialize($config_file, 'polld')
    or die "could not initialize SC: $@";

my $config = SC->config->{'Logrotate'};

# The following segment of code was an updated version of perl-logrotate.pl
# to use Archive::Zip module
#####
## perl-logrotate.pl by Aki Tossavainen <cmouse@youzen.ext.b2.fi> (c) 2004 
##
# Does a log file rotation as defined by config file.
# Does not break open logfiles, just truncates them. 
#
# If you find bugs or have suggestions, please email.
#
### Config file format
# Following keywords are supported by the config file
# 
## logfile <filename> 
# Defines a filename to rotate
#
## rotate-time <number> <hour(s)/day(s)/week(s)>
# Defines the time to wait before next rotation. If no unit is specified
# seconds is assumed!
#
## keep-files <number>
# Defines how many log files are kept. 5 means that you'll have files 0->4.
#
## compress <yes,1,no,0>
# Should the files be compressed. You need Compress::Zlib if you enable this
#
## status-file <filename>
# Where the rotation status will be written. 
#
# Config file can have empty lines and comments beginning with #
# Do not add comments after config lines homever, that will break things.
####


# no compression by default
my $compress;
$compress = 1 if ($config->{'compress'} =~ /yes/i 
	|| $config->{'compress'} eq '1');

# 5 files
my $rotate_files = $config->{'keep-files'} || 5;

# 1 week.
my $rotate_time;
$rotate_time = parse_time($config->{'rotate-time'}) || 604800;

# 10 M maximum size.
my $max_size;
$max_size = parse_size($config->{'max_size'}) || 1024*1024*10;



# locations
my @logfiles = @{$config->{'logfile'}};
my $status_file = $config->{'status-file'} ||
	'logrotate.status';

# to avoid complaints
my (%status, $str);

if ($compress) {
    use Archive::Zip qw( :ERROR_CODES :CONSTANTS );
}

# read status file
if (!-e $status_file) {
    open STATUS,'>'.$status_file or die("Unable to create status file\n");
    close STATUS;
}

open STATUS,'<'.$status_file or die("Unable to open status file\n");
while(<STATUS>) {
    chomp;
    my @line = split / /;
    if (@line == 2) {
	$status{$line[0]} = $line[1];
    }
}
close STATUS;

# now that we know what we are expected to do, we'll start
for my $logfile (@logfiles) {
    # first we try to read the entire log file into memory. then we 
    # instantly truncate it, 'move' all the existing logfiles +1 forward
    # and create possibly compressed .0.bz2 file.
    # simple eh? 
    # first we check the status file, maybe it doesn't need rotating as of yet
	my $filesize = -s $logfile;
    next if (defined($status{$logfile}) && 
		(time - $status{$logfile} < $rotate_time) && ($filesize < $max_size));
    # open file.
    if (open LOGFILE,'<'.$logfile) {
		# good... reel it in.
		my @data = <LOGFILE>;
		close LOGFILE;

	    # truncate worked. proceed.
	    for my $i (0..($rotate_files-2)) {
			# to avoid making keep-files + 1 files...
			my $n = $rotate_files - $i - 1;
			# if we use compressed files, we check this.
			if ($compress) {
				if (-e $logfile.'.'.$n.'.zip') {
					unlink $logfile.'.'.$n.'.zip';
				}
				rename $logfile.'.'.($n-1).'.zip',$logfile.'.'.$n.'.zip';
			} else {
				# and if not, this.
				if (-e $logfile.'.'.$n) {
					unlink $logfile.'.'.$n;
				}
				rename $logfile.'.'.($n-1),$logfile.'.'.$n;
			}	   
	    }
	    # create the .0 file
		my $str;
		if ($compress) {
			my $zip = Archive::Zip->new();
			my $member = $zip->addFile($logfile);
			if ( $zip->writeToFileNamed( "$logfile.0.zip" ) == AZ_OK) {
				$str = "";
			} else {
				print "Unable to open $logfile.0.zip - placing it back to your logfile\n";
				$str = join "",@data;
			}
		} else {
		    if ((open LOGFILE,'>'.$logfile.'.0')) {
				print LOGFILE join "",@data;
				close LOGFILE;
				$str = "";
		    } else {
				print "Unable to open $logfile.0 - placing it back to your logfile\n";
				$str = join "",@data;
			}
		}
		if ((open LOGFILE,">$logfile")) {
			print LOGFILE $str;
			close LOGFILE;
		}
	    # marking it rotated if it's really rotated.
	    $status{$logfile} = time;
		print "status time: ",$status{$logfile},"\n";
	    # and that's it.
	}
	

}

open STATUS,'>'.$status_file or die("Unable to write status information to $status_file\n");

for my $logfile (@logfiles) {
print STATUS $logfile.' '.$status{$logfile}."\n";
}
close STATUS;

exit();


sub parse_time() {
    my ($t) = @_;
    my @time = split / /,$t;
    return 0 if (@time == 0);
    return 0 if ($time[0] =~ /\D/);
    my $number = $time[0];
    if (@time > 1) {
	$number = $time[0];
	# we have some definition after the number
	# hours
	$number *= 3600 if ($time[1] eq 'hour');
        $number *= 3600 if ($time[1] eq 'hours');
	# days
	$number *= 86400 if ($time[1] eq 'day');
	$number *= 86400 if ($time[1] eq 'days');
	# weeks
	$number *= 604800 if ($time[1] eq 'week');
	$number *= 604800 if ($time[1] eq 'weeks');
    }
    return $number;
}
	    
sub parse_size() {
    my ($t) = @_;
    my @size = split / /,$t;
    return 0 if (@size == 0);
    return 0 if ($size[0] =~ /\D/);
    my $number = $size[0];
    if (@size > 1) {
		$number = $size[0];
		# we have some definition after the number
		# K bytes
		$number *= 1024 if ($size[1] eq 'k' || $size[1] eq 'K');
		# M bytes
		$number *= (1024*1024) if ($size[1] eq 'm' || $size[1] eq 'M');
		# Giga bytes
		$number *= (1024*1024*1024) if ($size[1] eq 'g' || $size[1] eq 'G');
	}
    return $number;
}
	    
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

