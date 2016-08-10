#!/usr/local/bin/perl

# $Id: update_password.pl 153 2007-09-25 16:29:01Z klin $

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
use Getopt::Long;

use SC;

use MIME::Base64 ();

############################################################################
# Prototypes for the logging routines
############################################################################
sub logmsg;
sub logver;
sub logerr;
sub logscr;
sub mydate;

#######################################################################
# Global variables
#######################################################################

my $arglist = "@ARGV";		# save the arguments for entry
                                # into the database

#----------------------------------------------------------------------
# Name of the configuration files
#----------------------------------------------------------------------
#my $cfile = "addon.conf";
SC->initialize;
my $config = SC->config;

my $perl = $config->{perlbin};
my $HTPASSWD = $config->{Admin}->{HtPasswordPath};
my $SERVER_PWDFILE = $config->{Admin}->{ServerPwdFile};
my $USER_PWDFILE = $config->{Admin}->{UserPwdFile};

logscr "Config Error: HtPasswordPath not defined" unless $HTPASSWD;
logscr "Config Error: ServerPwdFile not defined" unless $SERVER_PWDFILE;
logscr "Config Error: UserPwdFile not defined" unless $USER_PWDFILE;

my $dbh = SC->dbh;

#######################################################################
# End global variables
#######################################################################

#######################################################################
# Stuff to handle command line options and program documentation:
#######################################################################

my $desc = 'Update ShakeCast Server/User Passwords for Apache Basic Authentication.';

my $flgs = [{ FLAG => 'target',
			ARG  => 'server_id',
            TYPE => 's',
			REQ  => 'y',
			DESC => 'Specifies the id of the event to process'},
			{ FLAG => 'incoming',
			ARG  => 'incoming_password',
            TYPE => 's',
			REQ  => 'n',
			DESC => 'Specifies the server incoming password'},
			{ FLAG => 'outgoing',
			ARG  => 'outgoing_password',
            TYPE => 's',
			REQ  => 'n',
			DESC => 'Specifies the server outgoing password'},
			{ FLAG => 'username',
			ARG  => 'username',
            TYPE => 's',
			REQ  => 'n',
			DESC => 'Specifies the username'},
			{ FLAG => 'password',
			ARG  => 'password',
            TYPE => 's',
			REQ  => 'n',
			DESC => 'Specifies the user password'},
            { FLAG => 'verbose',
              DESC => 'Prints informational messages to stderr.'},
            { FLAG => 'help',
              DESC => 'Prints program documentation and quit.'}
           ];

my $options = setOptions($flgs) or logscr("Error in setOptions");

if (defined $options->{'help'}) {
  printDoc($desc);
  exit 0;
}

defined $options->{'target'}
        or logscr "Must specify an server with -server flag";

my $target     = $options->{'target'};
my $incoming     = $options->{'incoming'};
my $outgoing     = $options->{'outgoing'};
my $username     = $options->{'username'};
my $password     = $options->{'password'};
my $verbose  = defined $options->{'verbose'}  ? 1 : 0;
my ($scenario, $forcerun, $cancel, $test);

logscr "Unknown argument(s): @ARGV" if (@ARGV);

#######################################################################
# End of command line option stuff
#######################################################################

#######################################################################
# User config 
#######################################################################
	
my $logfile;			# Where we dump all of our messages
my $log;			# Filehandle of the log file


exit main();
0;

sub main {

	if ($target eq 'user' || $target eq 'USER' ) {
			update_user_password($username, $password);
	} else {
		if ($incoming) {
			update_incoming_password($target, $incoming);
		} elsif ($outgoing) {
			update_outgoing_password($target, $outgoing);
		}
	}
	
return 0;

}

sub _ts {
	my ($ts) = @_;
	if ($ts =~ /[\:\-]/) {
		$ts =~ s/[a-zA-Z]/ /g;
		$ts =~ s/\s+$//g;
	} else {
		$ts = SC->time_to_ts($ts);
	}
	return ($ts);
}


#######################################################################
# End configuration subroutines
#######################################################################

my $fref;
my ($bn, $flag, $type, $flag_desc, $pdoc);
sub setOptions {
  my $fref     = shift;
  my $dbug  = shift;
  my @names = ();

  foreach my $ff ( @$fref ) {
    (defined $ff->{FLAG} and $ff->{FLAG} !~ /^$/) or next;
    my $str = $ff->{FLAG};
    #----------------------------------------------------------------------
    # Is there an argument?
    #----------------------------------------------------------------------
    if ((defined $ff->{ARG}  and $ff->{ARG}  !~ /^$/)
     or (defined $ff->{TYPE} and $ff->{TYPE} !~ /^$/)
     or (defined $ff->{REQ}  and $ff->{REQ}  !~ /^$/)) {
      #----------------------------------------------------------------------
      # Yes, there's an argument of some kind; is it 
      # manditory or optional?
      #----------------------------------------------------------------------
      $str .= (defined $ff->{REQ} and $ff->{REQ} =~ /y/) ? '=' : ':';
      #----------------------------------------------------------------------
      # What is the expected type of the argument; default to 's'
      #----------------------------------------------------------------------
      my $type = (defined $ff->{TYPE} and $ff->{TYPE} !~ /^$/) 
               ? $ff->{TYPE} : 's';
      $str .= $type;
      #----------------------------------------------------------------------
      # If the type of argument is '!', then set $str directly
      #----------------------------------------------------------------------
      if ($type eq '!') {
	$str = $ff->{FLAG} . $type;
      }
      #----------------------------------------------------------------------
      # If ARG is undefined or empty, fix it up for the documentation
      #----------------------------------------------------------------------
      if (!defined $ff->{ARG} or $ff->{ARG} =~ /^$/) {
	$ff->{ARG} = $type =~ /s/ ? 'string'
		   : $type =~ /i/ ? 'integer'
		   : $type =~ /f/ ? 'float'
		   : $type =~ /!/ ? ''
		   : '???';
	if (defined $ff->{REQ}  and $ff->{REQ}  !~ /y/) {
	  $ff->{ARG} = '[' . $ff->{ARG} . ']';
	}
      }
    }
    print "OPTION LINE: $str\n" if (defined $dbug and $dbug != 0);
    push @names, $str;
  }

  my $options = {};

  if (@names) {
    GetOptions($options, @names) or logscr "Error in GetOptions";
  }

  if (defined $dbug and $dbug != 0) {
    foreach my $key ( keys %$options ) {
      print "option: $key value: $options->{$key}\n";
    }
  }
  return $options;
}

sub printDoc {

  $pdoc = shift;
  $bn   = basename($0);

  $~ = "PROGINFO";
  write;

  if (@$fref) {
    $~ = "OPTINFO";
  } else {
    $~ = "NOOPTINFO";
  }
  write;

  $~ = "FLAGINFO";
  foreach my $ff ( @$fref ) {
    (defined $ff->{FLAG} and $ff->{FLAG} !~ /^$/) or next;
    $flag      = $ff->{FLAG};
    $type      = defined $ff->{ARG}  ? $ff->{ARG}  : '';
    $flag_desc = defined $ff->{DESC} ? $ff->{DESC} : '';
    write;
  }
  $~ = "ENDINFO";
  write;
  0;
}

#######################################################################
# Self-documentation formats; we use the '#' character as the first 
# character (which is a royal pain to do) so that the documentation 
# can be included in a shell file
#######################################################################

format PROGINFO =
@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
'################################################################################'
@ Program     : @<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
'#',	 $bn
^ Description : ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($pdoc),	      $pdoc
^ ~~            ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($pdoc),	      $pdoc
@ Options     :
'#'
.

format OPTINFO =
@     Flag       Arg       Description
'#'
.

format NOOPTINFO =
@     NONE
'#'
.

format FLAGINFO =
@     ---------- --------- -----------------------------------------------------
'#'
^    -@<<<<<<<<< @<<<<<<<< ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($flag_desc), $flag, $type, $flag_desc
^ ~~                       ^<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
rhsh($flag_desc),	   $flag_desc
.

format ENDINFO =
@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
'################################################################################'
.

sub rhsh {

  my $more = shift;
  return '#' if ($more ne '');
  return '';
}


############################################################################
# Logs a message to the logfile with time/date stamp
############################################################################
sub logmsg { 

  print $log "$$: @_ on ", mydate(), "\n";
  print "@_ on ", mydate(), "\n";
  return;
}

############################################################################
# Logs a message to the logfile without time/date stamp
############################################################################
sub logver { 

  print $log "$$: @_\n";
  return;
}

############################################################################
# Logs a message with time/date stamp to the logfile, then quits
############################################################################
sub logerr { 

  logmsg shift; 
  exit 1; 
}

############################################################################
# Logs a message with to the screen
############################################################################
sub logscr { 

  print STDOUT "$0 $$: @_ on ", mydate(), "\n";
  return;
}

sub mydate {

  my ($sec, $min, $hr, $day, $mon, $yr) = localtime();
  return sprintf('%02d/%02d/%4d %02d:%02d:%02d', 
		  $mon + 1, $day, $yr + 1900, $hr, $min, $sec);
}


#######################################################################
# Configuration subroutines
#######################################################################


sub update_user_password {
    my ($username, $password) = @_;

    my @args = qq("$HTPASSWD" -b $USER_PWDFILE $username $password);
    my $rc = system(@args);
    logscr "htpasswd failed: $rc" if $rc;
}

sub update_incoming_password {
    my ($remote_server, $new_password) = @_;

    my @args = qq("$HTPASSWD" -b $SERVER_PWDFILE $remote_server $new_password);
    my $rc = system(@args);
    logscr "htpasswd failed: $rc" if $rc;
}


sub update_outgoing_password {
    my ($remote_server, $new_password) = @_;
    my $encoded_password;

    if ($new_password eq '') {
        $encoded_password = undef;
    } else {
        $encoded_password = MIME::Base64::encode_base64($new_password);
    }

    $dbh->do(qq{
        UPDATE server
           SET password=?
         WHERE server_id=?}, undef, $encoded_password, $remote_server)
             or logscr 'update remote server outgoing password failed';
}



