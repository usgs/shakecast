#!/usr/local/bin/perl

###########################################################################
#
# $Id: sm_inject.pl 428 2008-08-14 16:40:40Z klin $
#
#
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
use Getopt::Long;
use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use SC::Server;
use SC::Event;
use SC::Shakemap;
use SC::Product;
use MIME::Base64;

use Data::Dumper;

my %options;

GetOptions(\%options,
    'conf=s',	# specifies alternate config file (sc.conf is default)
    'verbose!'
) or die "unrecognized option(s)";

my $config_file = (exists $options{'conf'} ? $options{'conf'} : 'sc.conf');

SC->initialize($config_file, 'inject')
    or die "could not initialize SC: $SC::errstr";

unless (exists SC->config->{LocalServerId}) {
    quit("No LocalServerId found in config file $config_file");
}
unless (exists SC->config->{Destination}) {
    quit("No Destination found in config file $config_file");
}


my ($xml_text, $xml);
# check for valid XML
{
    local $/ = undef;
    $xml_text = <>;
}
$xml = SC->xml_in($xml_text) or
    quit($SC::errstr);

# determine remote action based on the XML to be sent

my $action;
my $rc = 0;
my ($event, $shakemap, $sender, $product);
my (%metrics, $threshold, $exceed_threshold);
if (exists SC->config->{'Threshold'}) {
	$threshold = SC->config->{'Threshold'};
	$exceed_threshold = 0;
} else {
	$exceed_threshold = 1;
}
if (exists $xml->{'event'}) {
    $action = 'new_event';
    # Deserialize the SC::Event
    $event = SC::Event->new(%{ $xml->{'event'} }) or die "error processing XML for Event";
    # store and pass along to downstream servers
    $event->process_new_event or die $SC::errstr;
    print "process Event STATUS=SUCCESS\n";
	$rc = 1;
} elsif (exists $xml->{'shakemap'}) {
    $action = 'new_shakemap';
	$shakemap = SC::Shakemap->current_version($xml->{'shakemap'}->{'event_id'});
	foreach my $metric (@{$shakemap->{'metric'}}) {
		$metrics{$metric->{'metric_name'}} = $metric->{'max_value'};
	}
	if (defined $threshold) {
		foreach my $metric (@{$xml->{'shakemap'}->{'metric'}}) {
			my $diff = (abs($metric->{'max_value'} - $metrics{$metric->{'metric_name'}}) > 
				$metrics{$metric->{'metric_name'}} * $threshold / 100);
			print $metrics{$metric->{'metric_name'}}," ",$metric->{'max_value'},"$diff\n";
			if (abs($metric->{'max_value'} - $metrics{$metric->{'metric_name'}}) > 
				$metrics{$metric->{'metric_name'}} * $threshold / 100)
			{$exceed_threshold = 1;}
		}
		quit("Grid values within threshold") unless ($exceed_threshold > 0);
	}
    # Deserialize the SC::Shakemap
    $shakemap = SC::Shakemap->new(%{ $xml->{'shakemap'} })
	or die "error processing XML for Shakemap";
    # store and pass along to downstream servers
    $shakemap->process_new_shakemap or die $SC::errstr;
    print "process Shakemap STATUS=SUCCESS\n";
	$rc = 1;
} elsif (exists $xml->{'product'}) {
    $action = 'new_product';
    # make sure the sender is authorized to give us new products
    $sender = SC::Server->local_server_id(SC->config->{LocalServerId}) or die $SC::errstr;
    # Deserialize the SC::Product
    $product = SC::Product->new(%{ $xml->{'product'} })
	or die "error processing XML for Product";
    # store and request product file
    $product->process_new_product($sender) or die $SC::errstr;
    print "process product STATUS=SUCCESS\n";
	$rc = 1;
} else {
    quit("Could not determine action based on XML input");
}


#SC::Server->local_server_id(SC->config->{LocalServerId});

my @dp; # array of hashrefs to destination descriptions
#if (ref SC->config->{Destination} eq 'ARRAY') {
#    @dp = @{ SC->config->{Destination} };
#} else {
#    push @dp, SC->config->{Destination};
#}

foreach my $dp (@dp) {
    my $ds = new SC::Server(
        'dns_address' => $dp->{Hostname},
        'password' => MIME::Base64::encode_base64($dp->{Password}));
    my ($status, $msg) = $ds->send($action, $xml_text);
    $msg = '' unless defined $msg;
    print "send to ", $ds->dns_address, ", STATUS=$status, MSG=$msg\n"
	if $options{'verbose'};
    if ($status ne 'SUCCESS') {
	quit(sprintf("[%s] %s: %s\n", $ds->dns_address, $status, $msg));
	$rc = 1;
    }
}

exit $rc;

sub quit {
    my $msg = join ' ', @_;
    chomp $msg;
    print STDERR "Fatal Error: $msg\n";
    exit 1;
}

__END__

=head1 NAME

sm_inject - inject new event, shakemap, or product into ShakeCast

=head1 SYNOPSIS

sm_inject [B<--verbose>] [B<--conf=>I<config-file>] [I<event-xml-file>]

=head1 DESCRIPTION

This program is used to inject a new event, shakemap, or product
into the ShakeCast system.
It is primarily intended for use by the Shakemap server after an event
has been generated, but can also be used to inject test events locally.

The event, shakemap, or product is specified in an XML format file whose
name is passed as a
command line argument to C<sm_inject>, or the XML can be fed to
the program via C<stdin>.


=head2 Invocation Options

=over 4

=item B<--verbose>

This option causes B<sm_inject> to write progress messages to C<stdout>.

=item --conf=config-file

B<--conf> can be used to specifiy an alternate configuration file.
If an absolute path is not given then it is searched for in
I<Shakecast-root>B</conf/>.

=back

=head1 CONFIGURATION

The configuration file specifies where the data is to be delivered.
By default the configuration fiie I<Shakecast-root>B</conf/sc.conf>
is used.
You can override this setting using the C<--conf> command line option.

B<NOTE:> The configuration file contains unencrypted passwords.
It is important to secure this file from malicious users by making
it readable only by the account that executes B<sm_inject>.

=head2 Configuration File directives

=over 4

=item LogDir I<directory>

This directive specifies the absolute path of the directory where the log
file will be written.

=item LogFile I<filename>

This directive specifies the name of the log file relative to C<LogDir>.
The file name can include patterns that represent the current year,
month, and day:

    %Y      four-digit year
    %y      last two digits of year
    %m      month (00 - 12)
    %d      day   (00 - 31)
    %%      a single %

=item LogLevel I<n>

This directive controls how much logging information is produced.
Level 0 is the least (errors only).  Larger numbers (up to 9) produce
more information.

=item LocalServerId I<n>

Specify the Server ID for the source system.  This Server must be known
to the destination ShakeCast servers and must be configured in each of
them as an Upstream server. 

=item Destination

Each <Destination> block defines one recipient of Shakecast data.  The
directive can be repeated if you want to distribute Shakecast data to more
than one server.
The destination block contains two required directives, C<Hostname> and
C<Password>.
C<Hostname> is either a FQDN or the IP address of the downstream server.
C<Password> is the cleartext password that will be used to
authenticate the connection.
The destination server must have been configured to accept connections
from this server with the given password (the "Incoming Password").

=back

=head2 Sample configuration file

    LogDir             /usr/local/sc/logs
    LogFile            sc%y%m.log
    LogLevel           1
    
    LocalServerId       98
    
    <Destination>
        Hostname    test.shakecast.org
        Password    secret
    </Destination>


=head2 Local testing

You can use B<sm_inject> to test your local Shakecast setup.
Pick a number to use as the ServerId of the data injector and set
the LocalServerId value in your configuration file.
Define a new Server with this Id in the Shakecast Administration application.
Set the server to be "Upstream" and enter an Incoming Password.
Then add a <Destination> block that has the hostname or IP address
of the server you want to test; the Destination Password is set to the
value of the Incoming password.

=head1 EXAMPLES

To load the new event specified by the file B<evt13935988.xml> using
the default configuration:

 $ sm_inject.pl evt13935988.xml

To use the configuration file B<sms.conf> and supply the
XML event definition as a shell I<here document>:

 $ sm_inject.pl --conf sms.conf <<EOF
 <event
     event_id="13935988"
     event_version="2"
     event_status="NORMAL"
     event_type="ACTUAL"
     event_name="13935988"
     event_location_description="3.1 mi N of Big Bear City, CA"
     event_timestamp="2003-02-25 17:11:12"
     external_event_id="ci3935988"
     magnitude="5.4"
     lat="34.31"
     lon="-116.85"
 />
 EOF

=head1 DIAGNOSTICS

The script exits with 0 (success) if the event was delivered successfully
to all downstream servers, otherwise with a non-zero value.  Each failed
event delivery is recorded to C<stderr> as:

[I<downstream-hostname>] I<failure-code> I<error-message>

where I<failure-code> is typically B<HTTP_FAIL> for some error in the
transport layer (ex: server not reachable) or B<FAILED> for an error
processing the event message at the remote server (ex: badly formed XML).
Keep in mind that often these messages reflect a failure at the remote
server.

=head2 Examples

This error was produced when the C<event_id> attribute was omitted from
the event XML:

C<< [sc1.shakecast.com] FAILED: DBD::Oracle::db do failed: ORA-01400: cannot insert NULL into ("SC1"."EVENT"."EVENT_ID") (DBD: oexec error) at d:/sc/lib/SC/Event.pm line 160,<STDIN> line 1. >>


=head1 XML FORMAT

=head2 Event XML

 <event
    event_id="123456"
    event_version="1"
    event_status="NORMAL"
    event_type="ACTUAL"
    event_name="Northridge"
    event_location_description="1.2mi SSW of Northridge, CA"
    event_timestamp="1994-05-07 14:34:23"
    external_event_id="ci123456"
    magnitude="6.7"
    lat="34.2233"
    lon="-118.1212"
 />

=head2 Shakemap XML

 <shakemap
	    shakemap_id="12345"
	    shakemap_version="1"
	    shakemap_id="6789"
	    shakemap_version="1"
	    shakemap_status="NORMAL"
	    generating_server="1"
	    shakemap_region="ci"
	    generation_timestamp="1994-05-07 14:34:23"
	    begin_timestamp="1994-05-07 14:29:05"
	    end_timestamp="1994-05-07 14:30:01"
	    lat_min="34.2345678" lon_min="-118.1234567"
	    lat_max="34.2345678" lon_max="-118.1234567">
	<metric metric_name="PSA03" min_value="0.0" max_value="70.1"/>
	<metric metric_name="PSA10" min_value="0.0" max_value="70.1"/>
	<metric metric_name="PSA30" min_value="0.0" max_value="70.1"/>
	<metric metric_name="PGV"   min_value="0.0" max_value="70.1"/>
	<metric metric_name="PGA"   min_value="0.0" max_value="70.1"/>
 </shakemap>

=head2 Product XML

 <product
	shakemap_id="13935988"
	shakemap_version="2"
	product_type="GRID"
	product_status="RELEASED"
	generating_server="1"
	generation_timestamp="2003-02-25 17:11:12"
	lat_min="33.2334" lon_min="-118.35"
	lat_max="34.9001" lon_max="-115.85"/>
 </product>

=cut

# vim:syntax=perl
