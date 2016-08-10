#!/usr/local/bin/perl

# $Id: logstats.pl 156 2007-10-10 16:27:10Z klin $

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
#use warnings;

use Data::Dumper;
use IO::File;
use Config::General;
use Time::Local;

use GD::Graph::bars3d;
use GD::Graph::pie;

use Getopt::Long;
use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;

sub epr;
sub vpr;
sub vvpr;

my %options;
GetOptions(\%options,
    'conf=s',	# specifies alternate config file (sc.conf is default)
);

my $config_file = (exists $options{'conf'} ? 
	$options{'conf'} : '/ShakeCast/sc/conf/sc.conf');

my $conf = new Config::General($config_file);
my %chash = $conf->getall;

my @processes =  ('notify', 'notifyqueue', 'polld', 
	'rssd', 'dispw', 'dispd', 'error', 'system');
#SC->initialize($config_file)
#    or die "could not initialize SC: $@";

#my $config = SC->config->{'Logrotate'};

my $stats = new Config::General();

# locations
my @logfiles = @{$chash{'Logrotate'}{'logfile'}};
my $logdir = $chash{'LogDir'};
my $rootdir = $chash{'RootDir'};
my $logstatdir = $chash{'Logrotate'}{'LOGSTATDIR'};

# now that we know what we are expected to do, we'll start

for my $logfile (@logfiles) {
my %log_stats;
    # first we try to read the entire log file into memory. then we 
    # instantly truncate it, 'move' all the existing logfiles +1 forward
    # and create possibly compressed .0.bz2 file.
    # simple eh? 
    # first we check the status file, maybe it doesn't need rotating as of yet
	print "logfile: $logfile\n";
	
	open LOG,'<'.$logfile or next;
	while(my $line = <LOG>) {
		my ($year, $month, $day, $hour, $minute, $second);
		next unless ($year, $month, $day, $hour, $minute, $second) = $line =~ 
			/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/;
		#print $line;
		chomp $line;
		my ($date, $time, $process, $log) = split / /, $line, 4;
		my $event_ts = int(timelocal($second, $minute,
			$hour, $day, $month - 1, $year - 1900)/3600);

		my ($proc_name, $proc_id);
		($proc_name, $proc_id) = $process =~ /(.+)\[(\d+)\]:/;
		#print "$second, $minute,$hour, $day, $month, $year, $event_ts\n";
		$proc_name = 'system' if (! defined $proc_name);
		$log_stats{$event_ts}{$proc_name} += 1;
		if ($log =~ /fail|error/i) {
			$log_stats{$event_ts}{error}{$proc_name} += 1 ;
			#print "$proc_name: $log\n";
		}
	
	}
	close LOG;
	
	#foreach my $key (keys %log_stats) {
		#print "$key: ",join ',', keys %{$log_stats{$key}},"\n";
		#print "error: ", $log_stats{$key}{error},"\n";
	#}
	#$stats->{$logfile} = \%log_stats;
	$stats->save_file($logfile.'.stats', \%log_stats);
	if ($logfile =~ /sc\.log/i) {
		pie_chart(\%log_stats, $logfile);
		bar_chart(\%log_stats, $logfile);
		bar_chart(\%log_stats, $logfile, 'weekly');
		bar_chart(\%log_stats, $logfile, 'monthly');
		bar_chart(\%log_stats, $logfile, 'all');
	}
}
exit();


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

sub pie_chart {
	my ($log_stats, $logfile) = @_;
	($logfile) = $logfile =~ /.+\/(.+)\.log$/;
	
  
	my (@data, %count, @count);

	foreach my $key (keys %$log_stats) {
		my $count;
		foreach my $process (keys %{$log_stats->{$key}}) {
			if ($process eq 'error') {
				$count{'error'} += error_count($log_stats->{$key}->{$process});
			} else {
				$count{$process} += $log_stats->{$key}->{$process};
			}
		}
	}
	
	foreach my $process (@processes) {
		push @count, $count{$process};
	}
	@data = (\@processes, \@count);
		
	my $graph = new GD::Graph::pie(300, 300);
	
	$graph->set(
		title           => 'ShakeCast Activities',
		label           => 'SC Logs',
		axislabelclr    => 'black',
		#'3d'            => 1,
		#start_angle     => 90,
		suppress_angle => 5,
	)
	or warn $graph->error;
	
	$graph->set_title_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF", 18);
	$graph->set_value_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",12);
	$graph->set_label_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",14);
	
	$graph->plot(\@data) or return($graph->error);
	
	open(GRAPH,"> $rootdir/html/images/$logfile"."_pie.png") || return "Cannot open $logfile.png: $!\n";
#	open(GRAPH,"> $logdir/$logfile"."_pie.png") || return "Cannot open $logfile.png: $!\n";
		binmode GRAPH;
		print GRAPH $graph->gd->png();	
	close (GRAPH);

	return();
}

sub error_count {
	my $error = shift;
	my $count;
	
	foreach my $process (keys %{$error}) {
		$count += $error->{$process};
	}
	
	return ($count);
}	

sub trim_hour {
	my ($log_stats) = @_;
	
	my %trim_log_stats;
	my @ts =  sort keys %$log_stats;
	foreach my $ts (@ts) {
		my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =
			localtime($ts*3600);
		
		my $trim_ts = int(timelocal($sec, $min,
			0, $mday, $mon, $year)/3600);
			
		foreach my $process (keys %{$log_stats->{$ts}}) {
			if ($process eq 'error') {
				$trim_log_stats{$trim_ts}{error}{$process} += 
					error_count($log_stats->{$ts}->{$process});
			} else {
				$trim_log_stats{$trim_ts}{$process} += $log_stats->{$ts}->{$process};
			}
		}
	}
	return (\%trim_log_stats);
}

sub bar_chart {
	my ($log_stats, $logfile, $type) = @_;
	($logfile) = $logfile =~ /.+\/(.+)\.log$/;
	$type = 'daily' unless (defined $type);
	my $log_cnt = 24;
	my $skip = 5;
	my @mon_abbr = qw( Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec );
	my @week_abbr = qw( Sun Mon Tue Wed Thu Fri Sat );
	if ($type =~ /weekly/i) {
		$log_cnt = 7;
		$skip = 2;
		$log_stats = trim_hour($log_stats);
	} elsif ($type =~ /monthly/i) {
		$log_cnt = 30;
		$skip = 6;
		$log_stats = trim_hour($log_stats);
	} elsif ($type =~ /all/i) {
		$log_stats = trim_hour($log_stats);
		$skip = 10;
		$log_cnt = scalar keys %$log_stats;
	}
	
	# Both the arrays should same number of entries.
	my (@data, @index, @count);
	my @ts =  sort keys %$log_stats;
	my %count;
	my $offset = ( scalar @ts > $log_cnt)? (scalar @ts - $log_cnt) : 0;
	for (my $ind = $offset; $ind <= $#ts; $ind++) {
		my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =
			localtime($ts[$ind]*3600);

		foreach my $process (@processes) {
			if ($process eq 'error') {
				push @{$count{$process}}, error_count($log_stats->{$ts[$ind]}->{$process});
			} else {
				push @{$count{$process}}, $log_stats->{$ts[$ind]}->{$process};
			}
		}
		if ($type eq 'daily') {
			push @index, sprintf("%02d/%02d %02dh", $mon+1, $mday, $hour);
		} elsif ($type eq 'weekly') {
			push @index, sprintf("%s-%02d %s",$mon_abbr[$mon], $mday, $week_abbr[$wday]);
		} else {
			push @index, sprintf("%s-%02d",$mon_abbr[$mon], $mday);
		}
	}
	
		#push @count, $count;
	push @data, \@index;
	foreach my $process (@processes) {
		push @data, $count{$process};
	}
		
	my $graph = GD::Graph::bars->new(500, 200);
	$graph->set(
		#x_label     => 'Semester',
		x_label_skip	=> $skip,
		y_label     => 'Count',
		title       => ucfirst($type).' ShakeCast Activities',
		# Draw bars with width 3 pixels
		bar_width   => 10,
		# Sepearte the bars with 4 pixels
		bar_spacing => 2,
		# Show the grid
		long_ticks  => 1,
		# Show values on top of each bar
		#show_values => 1,
		cumulate	=> 1,
	) or warn $graph->error;
	
	$graph->set_title_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF", 18);
	$graph->set_legend_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",12);
	$graph->set_x_label_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",12);
	$graph->set_y_label_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",12);
	$graph->set_values_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",8);
	$graph->set_x_axis_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",8);
	$graph->set_y_axis_font("C:\\WINDOWS\\FONTS\\ARIAL.TTF",8);
	$graph->set_legend(@processes);
	my $myimage = $graph->plot(\@data) or die $graph->error;
	
	open(GRAPH,"> $logstatdir/$logfile".'_'."$type"."_bar.png") || die "Cannot write $logfile.png: $!\n";
		binmode GRAPH;
		print GRAPH $graph->gd->png();	
	close (GRAPH);

	return();
	
} 
