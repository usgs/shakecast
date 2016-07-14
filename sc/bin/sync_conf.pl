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

sub epr;
sub vpr;
sub vvpr;
sub parse_time;
sub parse_size;

my @BASECONF = qw(UserID GroupID RootDir DataRoot LogDir LogFile LogLevel LocalServerId Threshold
		TemplateDir board_timezone
	);
my %CONF = (
	'Destination' 	=>	[ qw(Hostname Password) ],
	'Dispatcher'	=>	[ qw(MinWorkers MaxWorkers WorkerPort RequestPort WorkerTimeout
		AUTOSTART LOG LOGGING PORT PROMPT POLL SPOLL SERVICE_NAME SERVICE_TITLE) ],
	'Poller'		=>	[ qw(AUTOSTART LOG LOGGING MSGLEVEL POLL PORT PROMPT SERVICE_NAME 
		SERVICE_TITLE SPOLL) ],
	'rss'			=>	[ qw(AUTOSTART LOG LOGGING MSGLEVEL POLL PORT PROMPT SERVICE_NAME
		SERVICE_TITLE SPOLL REGION TIME_WINDOW) ],
	'Notification'	=>	[ qw(From EnvelopeFrom SmtpServer DefaultEmailTemplate DefaultScriptTemplate
		Username Password) ],
	'NotifyQueue'	=>	[ qw(LogLevel ServiceTitle Spoll ScanPeriod) ],
	'Notify'		=>	[ qw(LogLevel ServiceTitle Spoll ScanPeriod) ],
	'Admin'			=>	[ qw(HtPasswordPath ServerPwdFile UserPwdFile) ],
	'Logrotate'		=>	[ qw(LOGSTATDIR logfile rotate-time max_size keep-files compress status-file) ]
	);

my $sth_lookup_config;
my $sth_lookup_smtphost;
my $sth_lookup_smtpuser;
my $sth_lookup_smtppass;
my $sth_lookup_smtpfrom;
my $sth_lookup_destination;

my $sth_update_smtphost;
my $sth_update_smtpuser;
my $sth_update_smtppass;
my $sth_update_smtpfrom;
my $sth_update_destination;

my %options;
GetOptions(\%options,
    'toconf',	# export smtp from db to sc.conf
    'todb'		# export smtp from sc.conf to db
);
usage(1) if ((not defined $options{'toconf'}) && (not defined $options{'todb'}));

my $mode;
use constant M_TOCONF  => 1;
use constant M_TODB  => 2;

$mode = M_TOCONF   if $options{'toconf'};
$mode = M_TODB   if $options{'todb'};

my $config_file = (exists $options{'conf'} ? $options{'conf'} : 'sc.conf');
my $config_path = "$FindBin::Bin/../conf/";

SC->initialize($config_file, 'polld')
    or die "could not initialize SC: $@";

my $config = SC->config;

$sth_lookup_smtphost = SC->dbh->prepare(qq{
    select config_value
      from phpbb_config
     where config_name = 'smtp_host' });

$sth_lookup_smtpuser = SC->dbh->prepare(qq{
    select config_value
      from phpbb_config
     where config_name = 'smtp_username' });

$sth_lookup_smtppass = SC->dbh->prepare(qq{
    select config_value
      from phpbb_config
     where config_name = 'smtp_password' });

$sth_lookup_smtpfrom = SC->dbh->prepare(qq{
    select config_value
      from phpbb_config
     where config_name = 'board_email' });

$sth_lookup_config = SC->dbh->prepare(qq{
    select config_value
      from phpbb_config
     where config_name = ? });

$sth_update_smtphost = SC->dbh->prepare(qq{
    update phpbb_config 
		set config_value = ?
    where config_name = 'smtp_host' });

$sth_update_smtpuser = SC->dbh->prepare(qq{
    update phpbb_config 
		set config_value = ?
    where config_name = 'smtp_username' });

$sth_update_smtppass = SC->dbh->prepare(qq{
    update phpbb_config 
		set config_value = ?
    where config_name = 'smtp_password' });

$sth_update_smtpfrom = SC->dbh->prepare(qq{
    update phpbb_config 
		set config_value = ?
    where config_name = 'board_email' });

if (-e $config_path.$config_file.'~') {
	unlink $config_path.$config_file.'~';
}

my %smtp = (
    'Username'     => '',
    'Password'    => '',
    'SmtpServer'    => '',
    'From'       => ''
);

if ($mode == M_TOCONF) {
	rename $config_path.$config_file,$config_path.$config_file.'~';
	sth_lookup_smtp(\%smtp);
	
	foreach my $key (keys %smtp) {
		if ($smtp{$key} ne '') {
			$config->{Notification}->{$key} = $smtp{$key};
		}
	}
	
	my %db_conf;
	foreach my $element (@BASECONF) {
		my $idp = SC->dbh->selectcol_arrayref($sth_lookup_config, undef, $element);
		if (scalar @$idp >= 1 && @$idp[0] ne '') {
			$config->{$element} = @$idp[0];
			#print "db conf: $element -> ", $db_conf{$element}, "\n";
		} else {
			delete $config->{$element};
		}
	}

	foreach my $category (keys %CONF) {
		foreach my $element (@{$CONF{$category}}) {
			my $idp = SC->dbh->selectcol_arrayref($sth_lookup_config, undef, "$category\_$element");
			my ($config_value, $sql);
			if (scalar @$idp >= 1 && @$idp[0] ne '') {
				if ($element =~ /logfile/i) {
					my @logs = split /\s+/, @$idp[0];
					$config->{$category}->{$element} = \@logs;
				} else {
					$config->{$category}->{$element} = @$idp[0];
				}
				#print "db conf: $category -> $element -> ", $db_conf{$category}{$element}, "\n";
			} else {
				delete $config->{$category}->{$element};
			}
		}
	}

	#print Dumper($config);
	SC->save_to_file($config);
} elsif ($mode == M_TODB) {
	foreach my $element (@BASECONF) {
		my $idp = SC->dbh->selectcol_arrayref($sth_lookup_config, undef, $element);
		my $sql;
		if (scalar @$idp >= 1) {
			if (defined $config->{$element}) {
				$sql = 'update phpbb_config 
					set config_value = "' . $config->{$element} . '"
					where config_name = "' . $element .'"' ;
			} else {
				$sql = 'update phpbb_config 
					set config_value = ""
					where config_name = "' . $element .'"' ;
			}
			SC->dbh->do($sql);
		} else {
			if (defined $config->{$element}) {
				$sql = 'insert phpbb_config (config_value, config_name)
					values ("' . $config->{$element} . '",
					"' . $element .'")' ;
				SC->dbh->do($sql);
			}
		}
	}
	foreach my $category (keys %CONF) {
		foreach my $element (@{$CONF{$category}}) {
			my $idp = SC->dbh->selectcol_arrayref($sth_lookup_config, undef, "$category\_$element");
			my ($config_value, $sql);
			if (scalar @$idp >= 1) {
				if (defined $config->{$category}->{$element}) {
					$config_value = ($element =~ /logfile/i) ? 
						join ' ', @{$config->{$category}->{$element}} : $config->{$category}->{$element};
					$sql = 'update phpbb_config 
						set config_value = "' . $config_value .'"
						where config_name = "' . "$category\_$element" . '"';
				} else {
					$sql = 'update phpbb_config 
						set config_value = ""
						where config_name = "' . "$category\_$element" . '"';
				}
				SC->dbh->do($sql);
			} else {
				if (defined $config->{$category}->{$element}) {
					$config_value = ($element =~ /logfile/i) ? 
						join ' ', @{$config->{$category}->{$element}} : $config->{$category}->{$element};
					$sql = 'insert phpbb_config (config_value, config_name)
						values ("' . $config_value . '",
						"' . "$category\_$element" .'")' ;
					SC->dbh->do($sql);
				}
			}
		}
	}
	if (defined $config->{Notification}->{SmtpServer}) {
		$sth_update_smtphost->execute($config->{Notification}->{SmtpServer});
	}
	if (defined $config->{Notification}->{Username}) {
		$sth_update_smtpuser->execute($config->{Notification}->{Username});
	} else {
		$sth_update_smtpuser->execute('');
	}
	if (defined $config->{Notification}->{Password}) {
		$sth_update_smtppass->execute($config->{Notification}->{Password});
	} else {
		$sth_update_smtppass->execute('');
	}
	if (defined $config->{Notification}->{From}) {
		$sth_update_smtpfrom->execute($config->{Notification}->{From});
	}
} 

exit;



# Return shakemap_id given event_id
sub sth_lookup_smtp {
    my ($smtp) = @_;
	my $retrieved;
	
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_smtphost, undef);
    if (scalar @$idp >= 1) {
		$smtp->{SmtpServer} = @$idp[0];
		$retrieved++;
    }

    $idp = SC->dbh->selectcol_arrayref($sth_lookup_smtpuser, undef);
    if (scalar @$idp >= 1) {
		$smtp->{Username} = @$idp[0];
		$retrieved++;
    }

    $idp = SC->dbh->selectcol_arrayref($sth_lookup_smtppass, undef);
    if (scalar @$idp >= 1) {
		$smtp->{Password} = @$idp[0];
		$retrieved++;
    }

    $idp = SC->dbh->selectcol_arrayref($sth_lookup_smtpfrom, undef);
    if (scalar @$idp >= 1) {
		$smtp->{From} = @$idp[0];
		$smtp->{EnvelopeFrom} = @$idp[0];
		$retrieved++;
    }

	return $retrieved;
}

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

sub usage {
    my $rc = shift;

    print qq{
sync_conf -- Configuration Synchronization between sc.conf and database
Usage:
  sync_conf [ mode ]  

Mode is one of:
    --toconf  Export configuration from ShakeCast database to sc.conf
    --todb    Export configuration from ShakeCast sc.conf to database
};
    exit $rc;
}

