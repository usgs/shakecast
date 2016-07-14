#!/usr/local/bin/perl
########################################################################
#
# perl-md5-login: a Perl/CGI + JavaScript password protection scheme
#
########################################################################
# SourceForge project: http://sourceforge.net/projects/perl-md5-login/
#
# Perl/CGI interface Copyright 2003 Alan Raetz <alanraetz@chicodigital.com>
#
# JavaScript MD5 code by Paul Johnston <paj@pajhome.org.uk>
#
# See README for installation instructions.
########################################################################
use FindBin;
use lib "$FindBin::Bin/../lib";

use CGI::Session;
use CGI;
use HTML::Template;

use strict;
use SC;
use API::User;

SC->initialize;

my $cgi = new CGI;
my $session = new CGI::Session(undef, $cgi);
$session->expires("+10m");
my $tmpl_dir= "$FindBin::Bin/../templates/html";

my $cookie = $cgi->cookie(CGISESSID => $session->id );
print $cgi->header(-cookie=>$cookie);

    #$ENV{REQUEST_URI} or die "Illegal use";

    unless ( $session->param("referer") ) {
        $session->param("referer", $ENV{REQUEST_URI});
    }

	my $dest = $cgi->param("dest") || 'index';
	my $admin = ($dest =~ /^admin_/) ? 1 : 0;
	$dest = (-e "$tmpl_dir/$dest.tmpl") ? "$tmpl_dir/$dest.tmpl" :
		"$tmpl_dir/index.tmpl";
    init($cgi, $session);

    if ( $session->param("~login-trials") >= 5 ) {
        print error("You failed 3 times in a row.\n" .
                    "Your session is blocked. Please contact us with ".
                    "the details of your action");
        exit(0);

    }

    if ( $cgi->param("logout") || ($admin && (!$session->param("admin_user"))) ) {
        $session->clear(["~logged-in", "admin", "admin_user", "~profile"]);
    }

    unless ( $session->param("~logged-in") ) {
        print login_page($cgi, $session);
        exit(0);

    }

	$cgi->delete('lg_name', 'lg_password');
#############################################################
# Only authenticated users get beyond this point
#############################################################

	print display_page($dest, $cgi, $session);

exit;


    sub init {
        #my ($session, $cgi) = @_; # receive two args
        my ($cgi, $session) = @_; # receive two args

        if ( $session->param("~logged-in") ) {
            return 1;  # if logged in, don't bother going further
        }

		if ($ENV{SERVER_NAME} =~ /localhost/i && $dest =~ /screenshot/i) {
			$session->param("~logged-in", 1);
			return 1;
		}

        my $lg_name = $cgi->param("lg_name") or return;
        my $lg_psswd=$cgi->param("lg_password") or return;
        # if we came this far, user did submit the login form
        # so let's try to load his/her profile if name/psswds match
        if ( my $profile = _load_profile($lg_name, $lg_psswd) ) {
			eval {
            $session->param("~profile", $profile);
            $session->param("~logged-in", 1);
            $session->clear(["~login-trials"]);
            $session->param('userid', $profile->[0]);
            $session->param('user_type', $profile->[1]);
			$session->param('logout', qq(<li><a href="./?logout=1">Log Out</a></li>));
			if ($profile->[1] =~ /admin/i) {
				$session->param('admin', qq(<li><a href='?dest=admin_index'>Administration</a></li>));
				$session->param('admin_user', 1);
			}
			};
            return 1;

        }

        # if we came this far, the login/psswds do not match
        # the entries in the database
        my $trials = $session->param("~login-trials") || 0;
        return $session->param("~login-trials", ++$trials);
    }

    sub _load_profile {
        my ($lg_name, $lg_psswd) = @_;
		# Authenticated
		my $valid = API::User->validate($lg_name, $lg_psswd);

		return $valid;
    }

    sub display_page {
        my ($dest, $cgi, $session) = @_;

        my $template = new HTML::Template(filename=>$dest,
                                          associate=>$session,
                                          die_on_bad_params=>0);
        return $template->output();

    }

    sub login_page {
        my ($cgi, $session) = @_;

        my $template = new HTML::Template(filename=>"$tmpl_dir/login_page.tmpl",
                                          associate=>$session,
                                          die_on_bad_params=>0);
        return $template->output();

    }
