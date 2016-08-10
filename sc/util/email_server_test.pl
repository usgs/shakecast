#!/usr/local/bin/perl 

BEGIN{
	push(@INC,"C:\Perl\lib");
	push(@INC,"C:\Perl\site\lib");
}


use Net::SMTP;
use Net::SMTPS;

my ($from, $to, $mx, $user, $pass, $proto) = @ARGV;

if(!($from && $to && $mx)){
	print "Not enough arguments to continue. Exiting.\n\n";
	exit;
}

use MIME::Lite;

my $data =  <<__EOF__;
From: ShakeCast Test <$from>
To: $to
Subject: M%MAGNITUDE% - %EVENT_LOCATION_DESCRIPTION% (%EVENT_ID%) 

The following <font color=red></font> New Event(s) occurred 
__EOF__

### Create the multipart container
my $msg = MIME::Lite->new (
	From => $from,
	To => $to,
	Subject => 'Email Server Test for ShakeCast',
	Type => 'text/html',
	Data => $data,
);	

$msg->attach (
	Type => 'AUTO',
	Path => 'shakecast_report.pdf',
	Id => 'shakecast_report.pdf',
	Filename => 'shakecast_report.pdf',
	Disposition => 'inline'
);
	
my $smtp;
if ($proto =~ /tls/i) {
	$smtp = Net::SMTPS->new($mx, Hello => $user, Debug=>1, Port => 587, User => $user, Password => $pass, SSL_verify_mode => 0, doSSL => 'starttls');
	$smtp->auth($user, $pass) || die "Authentication failed!\n";
} elsif ($proto =~ /ssl/i) {
	$smtp = Net::SMTPS->new($mx, Hello => $user, Debug=>1, Port => 465, User => $user, Password => $pass, SSL_verify_mode => 0, doSSL => 'ssl');
	$smtp->auth($user, $pass) || die "Authentication failed!\n";
} else {
	$smtp = Net::SMTP->new($mx, Debug=>1);	
}


$smtp->mail($from);
$smtp->to($to);
$smtp->data();
$smtp->datasend($msg->as_string);
$smtp->dataend();
$smtp->quit;

