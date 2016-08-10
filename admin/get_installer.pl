#! /usr/bin/perl

####################################
# get_installer.pl
# version 0.1  kl 12/15/2006
#
# Kuo-wan Lin, klin@usgs.gov
# 
# The script receives a list of urls from command line arguments, 
# retrieves files and saves them into the Installer directory for
# ShakeCast post-installation processing
#
####################################


####################################
#to install LWP::Simple (simple HTTP get requests)
# as root or sudo
#	perl -MCPAN -e 'install LWP::Simple'
#
#the alternative without LWP::Simple  kl 12/08/2005
# just put the script "SimpleGet.pl" in the same
#   directory as the RSS reader
####################################
	

use strict;
#use warnings;
use FindBin;
use lib $FindBin::Bin;
use LWP;
#use LWP::UserAgent;
#use LWP::DebugFile qw (+);
#require "SimpleGet.pl";
use File::Basename;
use File::Path;
use IO::File;
use Getopt::Long;
use Carp;
use Time::Local;

############################################################################
# Prototypes for the logging routines
############################################################################
sub logmsg;
sub logver;
sub logerr;
sub logscr;
sub mydate;

#######################################################################
# Stuff to handle command line options and program documentation:
#######################################################################

my $desc = "Receives a list of urls from command line arguments, "
	 . "retrieves files and saves them into the Installer directory "
	 . "for ShakeCast post-installation processing";

my $flgs = [{ FLAG => 'filename',
              ARG  => 'filename',
              DESC => 'Specifies the id of the event to process'},
            { FLAG => 'config_check',
			  DESC => 'Check the configuration file, then quit.'},
            { FLAG => 'help',
              DESC => 'Print program documentation and quit.'},
            { FLAG => 'verbose',
              DESC => 'Print detailed processing information.'}
           ];

my $options = setOptions($flgs) or die "Error in setOptions";

if (defined $options->{'help'}) {
  printDoc($desc);
  exit 0;
}

my $verbose = defined $options->{'verbose'} ? 1 : 0;
my $filename = $options->{'filename'} 
	if defined $options->{'filename'};


#######################################################################
# User config 
#######################################################################
	
my $logfile;			# Where we dump all of our messages
my $log;			# Filehandle of the log file
my $download_dir = $FindBin::Bin.'/../Installer';
my $cfile      = "shake_rssreader.conf";
my @postcmds;				# list of commands from the 'postcmd' config statement
my $rss_url;
my $proxy;
my @data_files;
my @events;
my @regions;
my $all_regions;
my $time_window = 0;
my $mag_cutoff = 0;

my @urls = @ARGV if (defined @ARGV);
my $ua = new LWP::UserAgent;
$ua->agent("shakecast");
my $final_data;
my $total_size;  # total size of the URL.

#######################################################################
# End of command line option stuff
#######################################################################

#######################################################################
# Run the program
#######################################################################


main();

#######################################################################
# Subroutines
#######################################################################

sub main {


#get current rss
	foreach my $url (@urls) {
		$final_data = undef;
		my $result = $ua->head($url);
		my $remote_headers = $result->headers;
		$total_size = $remote_headers->content_length;
		
		logscr "Downloading URL ->",$url if ($verbose);
		my $resp = $ua->get($url, ':content_cb' => \&callback, );
		print "\n";
		logscr "Return ->",$resp->status_line if ($verbose);
		next unless $resp->is_success;
		#my $data = $resp->content;
		
	    if (not -e "$download_dir") {
	      my $result = mkpath("$download_dir", 0, 0755);
		  die "Couldn't create download dir $download_dir" 
			unless ($result);
	    }

	    #save grid file
		if (defined $filename) {
			$url = $filename;
		} else {
			$url =~ s/(.+)\///;
		}
        logscr "Saving Download ->",$url;
		my $saved_file = $download_dir."/$url";
	    open(GRD, ">$saved_file")  or logscr "Couldn't save file: $saved_file";
	    binmode GRD;
	    print GRD $final_data;
	    close(GRD);	
	}

return 0;
}

# per chunk.
sub callback {
   my ($data, $response, $protocol) = @_;
   $final_data .= $data;
   print progress_bar( length($final_data), $total_size, 25, '=' );
}

# wget-style. routine by tachyon
# at http://tachyon.perlmonk.org/
sub progress_bar {
    my ( $got, $total, $width, $char ) = @_;
    $width ||= 25; $char ||= '=';
    my $num_width = length $total;
    sprintf "|%-${width}s| Got %${num_width}s bytes of %s (%.2f%%)\r", 
        $char x (($width-1)*$got/$total). '>', 
        $got, $total, 100*$got/+$total;
}

my $fref;
my ($bn, $flag, $type, $flag_desc, $pdoc);
sub setOptions {
  $fref     = shift;
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
    GetOptions($options, @names) or die "Error in GetOptions";
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


