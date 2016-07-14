#!/usr/local/bin/perl

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

use warnings;

use strict;

use vars qw ($VERSION $RCSID $COPYRIGHT $RCSID);

$VERSION = 'admin 0.0.17 2004-08-15 16:23Z';

$RCSID = '@(#) $Id: admin.pl,v 1.5 2004/02/16 19:19:17 shc Exp shc $ ';

use Carp;
use Getopt::Long;

use DBI;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;

use MIME::Base64 ();

my $TABLE_ATTRS = "border=1 cellpadding=1 cellspacing=0 noshade";

my $script;

my $shakecast_user_layout = 
    ['ID' => 'SHAKECAST_USER',
     'User Name' => 'USERNAME','Full Name' => 'FULL_NAME',
     'Phone Number' => 'PHONE_NUMBER',
     'Email Address' => 'EMAIL_ADDRESS',
     'Type' => 'USER_TYPE/USER_TYPE,USER_TYPE,NAME'];

my $shakecast_user_form =
    ['User Name' => '+USERNAME','Full Name' => '+FULL_NAME',
     'Phone Number' => '+PHONE_NUMBER',
     'Email Address' => '+EMAIL_ADDRESS',
     'Type' => '+USER_TYPE/USER_TYPE,USER_TYPE,NAME,NAME,USER'];

my $user_delivery_method_layout =
    ['ID' => 'USER_DELIVERY_METHOD_ID',
     'Method' => 'DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME',
     'Address' => 'DELIVERY_ADDRESS'];

my $user_delivery_method_form =
    ['Method' => '+DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME,DELIVERY_METHOD,EMAIL_TEXT',
     'Address' => '+DELIVERY_ADDRESS'];

my $template_layout =
    [ID => 'MESSAGE_FORMAT',
     Name => 'NAME',
     Description => 'DESCRIPTION',
     'File Name' => 'FILE_NAME'];

my $template_form =
    [Name => '+NAME',
     Description => 'DESCRIPTION',
     'File Name' => '+FILE_NAME'];


my $facility_notification_layout = 
    [ID => 'f.FACILITY_ID', Name => 'FACILITY_NAME',
     'Short Name' => 'SHORT_NAME',
     Type => 'FACILITY_TYPE/FACILITY_TYPE,FACILITY_TYPE,NAME',
     Description => 'DESCRIPTION',
     'Lat Min' => 'LAT_MIN',
     'Lat Max' => 'LAT_MAX',
     'Lon Min' => 'LON_MIN',
     'Lon Max' => 'LON_MAX'];

my $facility_layout = 
    [ID => 'FACILITY_ID', Name => 'FACILITY_NAME',
     'Short Name' => 'SHORT_NAME',
     Type => 'FACILITY_TYPE/FACILITY_TYPE,FACILITY_TYPE,NAME',
     Description => 'DESCRIPTION',
     'Lat Min' => 'LAT_MIN',
     'Lat Max' => 'LAT_MAX',
     'Lon Min' => 'LON_MIN',
     'Lon Max' => 'LON_MAX'];

my $facility_form = 
    [Name => '+FACILITY_NAME',
     'Short Name' => 'SHORT_NAME',
     Type => '+FACILITY_TYPE/FACILITY_TYPE,FACILITY_TYPE,NAME,NAME,STRUCTURE',
     Description => 'DESCRIPTION',
     'Lat Min' => '+LAT_MIN',
     'Lat Max' => 'LAT_MAX',
     'Lon Min' => '+LON_MIN',
     'Lon Max' => 'LON_MAX'];

my $notification_request_layout =
    [ID => 'NOTIFICATION_REQUEST_ID',
     Type => 'NOTIFICATION_TYPE/NOTIFICATION_TYPE,NOTIFICATION_TYPE,NAME',
     'Event Type' => 'EVENT_TYPE/EVENT_TYPE,EVENT_TYPE,NAME',
     Delivery => 'DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME',
     Template => 'MESSAGE_FORMAT/MESSAGE_FORMAT,MESSAGE_FORMAT,NAME,NAME',
     'Limit Value' => 'LIMIT_VALUE',
     'Damage Level' => 'DAMAGE_LEVEL/DAMAGE_LEVEL,DAMAGE_LEVEL,NAME',
     Product => 'PRODUCT_TYPE/PRODUCT_TYPE,PRODUCT_TYPE,NAME',
     Metric => 'METRIC/METRIC,SHORT_NAME,NAME',
     Disable => 'DISABLED/*BOOL,,Yes',
     Aggregate => 'AGGREGATE/*BOOL,,Yes',
     'Aggregation Group' => 'AGGREGATION_GROUP'];

my $notification_request_form =
    [Type => '+NOTIFICATION_TYPE/NOTIFICATION_TYPE,NOTIFICATION_TYPE,NAME,NAME',
     'Event Type' => 'EVENT_TYPE/EVENT_TYPE,EVENT_TYPE,NAME,NAME',
     Delivery => '+DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME,DELIVERY_METHOD,EMAIL_TEXT',
     Template => 'MESSAGE_FORMAT/MESSAGE_FORMAT,MESSAGE_FORMAT,NAME,NAME',
     'Limit Value' => 'LIMIT_VALUE',
     'Damage Level' => 'DAMAGE_LEVEL/DAMAGE_LEVEL,DAMAGE_LEVEL,NAME,NAME',
     Product => 'PRODUCT_TYPE/PRODUCT_TYPE,PRODUCT_TYPE,NAME,NAME',
     Metric => 'METRIC/METRIC,SHORT_NAME,NAME,NAME',
     Disable => 'DISABLED/*BOOL',
     Aggregate => 'AGGREGATE/*BOOL',
     'Aggregation Group' => 'AGGREGATION_GROUP'];

my $notification_request_form_e =
    [Type => '+NOTIFICATION_TYPE/NOTIFICATION_TYPE,NOTIFICATION_TYPE,NAME,NAME,NEW_EVENT,NOTIFICATION_CLASS=\'EVENT\'',
     'Event Type' => 'EVENT_TYPE/EVENT_TYPE,EVENT_TYPE,NAME,NAME',
     Delivery => '+DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME,DELIVERY_METHOD,EMAIL_TEXT',
     Template => 'MESSAGE_FORMAT/MESSAGE_FORMAT,MESSAGE_FORMAT,NAME,NAME',
     'Limit Value' => 'LIMIT_VALUE',
     Disable => 'DISABLED/*BOOL',
     Aggregate => 'AGGREGATE/*BOOL',
     'Aggregation Group' => 'AGGREGATION_GROUP'];

my $notification_request_form_p =
    [Type => '+NOTIFICATION_TYPE/NOTIFICATION_TYPE,NOTIFICATION_TYPE,NAME,NAME,NEW_PROD,NOTIFICATION_CLASS=\'PRODUCT\'',
     'Event Type' => 'EVENT_TYPE/EVENT_TYPE,EVENT_TYPE,NAME,NAME',
     Delivery => '+DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME,DELIVERY_METHOD,EMAIL_TEXT',
      Template=> 'MESSAGE_FORMAT/MESSAGE_FORMAT,MESSAGE_FORMAT,NAME,NAME',
     'Limit Value' => 'LIMIT_VALUE',
     'Product Type' => 'PRODUCT_TYPE/PRODUCT_TYPE,PRODUCT_TYPE,NAME,NAME',
     Disable => 'DISABLED/*BOOL',
     Aggregate => 'AGGREGATE/*BOOL',
     'Aggregation Group' => 'AGGREGATION_GROUP'];

my $notification_request_form_s =
    [Type => '+NOTIFICATION_TYPE/NOTIFICATION_TYPE,NOTIFICATION_TYPE,NAME,NAME,SHAKING,NOTIFICATION_TYPE=\'SHAKING\'',
     'Event Type' => 'EVENT_TYPE/EVENT_TYPE,EVENT_TYPE,NAME,NAME',
     Delivery => '+DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME,DELIVERY_METHOD,EMAIL_TEXT',
     Template => 'MESSAGE_FORMAT/MESSAGE_FORMAT,MESSAGE_FORMAT,NAME,NAME',
     'Limit Value' => 'LIMIT_VALUE',
     Metric => 'METRIC/METRIC,SHORT_NAME,NAME,NAME',
     Disable => 'DISABLED/*BOOL',
     Aggregate => 'AGGREGATE/*BOOL',
     'Aggregation Group' => 'AGGREGATION_GROUP'];

my $notification_request_form_d =
    [Type => '+NOTIFICATION_TYPE/NOTIFICATION_TYPE,NOTIFICATION_TYPE,NAME,NAME,DAMAGE,NOTIFICATION_TYPE=\'DAMAGE\'',
     'Event Type' => 'EVENT_TYPE/EVENT_TYPE,EVENT_TYPE,NAME,NAME',
     Delivery => '+DELIVERY_METHOD/DELIVERY_METHOD,DELIVERY_METHOD,NAME,DELIVERY_METHOD,EMAIL_TEXT',
     Template => 'MESSAGE_FORMAT/MESSAGE_FORMAT,MESSAGE_FORMAT,NAME,NAME',
     'Damage Level' => '+DAMAGE_LEVEL/DAMAGE_LEVEL,DAMAGE_LEVEL,NAME,NAME',
     Disable => 'DISABLED/*BOOL',
     Aggregate => 'AGGREGATE/*BOOL',
     'Aggregation Group' => 'AGGREGATION_GROUP'];

my $facility_fragility_layout = 
    [ID => 'FACILITY_FRAGILITY_ID',
     'Damage Level' => 'DAMAGE_LEVEL/DAMAGE_LEVEL,DAMAGE_LEVEL,NAME',
     'Low Limit' => 'LOW_LIMIT', 'High Limit' => 'HIGH_LIMIT',
     'Metric' => 'METRIC/METRIC,SHORT_NAME,NAME,NAME'];

my $facility_fragility_form = 
    ['Damage_Level' => '+DAMAGE_LEVEL/DAMAGE_LEVEL,DAMAGE_LEVEL,NAME,NAME,RED',
     'Low Limit' => '+LOW_LIMIT', 'High Limit' => '+HIGH_LIMIT',
     'Metric' => '+METRIC/METRIC,SHORT_NAME,NAME,NAME'];

my $server_layout = 
    [ID => 'SERVER_ID', 'DNS Address' => 'DNS_ADDRESS',
     'Last Heard From' => 'LAST_HEARD_FROM',
     'Organization' => 'OWNER_ORGANIZATION',
     'Status' => 'SERVER_STATUS',
     'Error Count' => 'ERROR_COUNT',
     'Upstream' => 'UPSTREAM_FLAG',
     'Downstream' => 'DOWNSTREAM_FLAG',
     'Poll' => 'POLL_FLAG',
     'Query' => 'QUERY_FLAG',
     ];

my $server_form = 
    [ID => '+SERVER_ID',
     'DNS Address' => '+DNS_ADDRESS',
     'Organization' => 'OWNER_ORGANIZATION',
     'Upstream' => 'UPSTREAM_FLAG/*BOOL',
     'Downstream' => 'DOWNSTREAM_FLAG/*BOOL',
     'Poll' => 'POLL_FLAG/*BOOL',
     'Query' => 'QUERY_FLAG/*BOOL',
     ];

my $this_server_form = 
    [ID => '+SERVER_ID',
     'DNS Address' => '+DNS_ADDRESS',
     'Organization' => 'OWNER_ORGANIZATION ',
     'Lat' => 'LAT', 'Lon' => 'LON',
     ];


my $dbh;

my ($type, $limit, $offset);

my ($page_started, $page_ended);

sub dbquit;
sub pr;
sub quit;


my $admin_user = "web_admin";

exit unless (SC->initialize());

my $config = SC->config;

my %options = (
);

GetOptions(
    \%options,

    'type=s',           # error for existing facilities
    'key=s',            
    'limit=i',            
    'offset=i',            
    'order=s',            

    'facility_name=s',	#facilities
    'facility_type=s',             
    'lat_min=f',             
    'lon_min=f',             
    'shortname=s',           
    'desc=s',            
	
    'key2=i',			# fragility
	'damage_level=s',
	'low_limit=f',
	'high_limit=f',
	'metric=s',

	'ukey=i',
	'source_user=i',

    'username=s',           # error for existing facilities
    'full_name=s',           # error for existing facilities
    'user_type=s',           # error for existing facilities
    'phone_number=s',           # error for existing facilities
    'email_address=s',           # error for existing facilities
) or exit(0);

my $HTPASSWD = $config->{Admin}->{HtPasswordPath};
my $SERVER_PWDFILE = $config->{Admin}->{ServerPwdFile};
my $USER_PWDFILE = $config->{Admin}->{UserPwdFile};

$dbh = SC->dbh;
$dbh->{RaiseError} = 0;

$type = $options{'type'};
$limit = $options{'limit'};
$offset = $options{'offset'};

process_by_type();

exit;


#
### Main Processing Functions
#

sub process_by_type {
    if ($type eq 'users') { process_users() }
    elsif ($type eq 'edituser') { process_edit_user() }
    elsif ($type eq 'deluser2') { process_delete_user_2() }
    elsif ($type eq 'userdeliv') { process_user_delivery() }
    elsif ($type eq 'editumethod') { process_edit_user_method() }
    elsif ($type eq 'submitumethod') { process_submit_user_method() }
    elsif ($type eq 'delumethod') { process_delete_user_method() }
    elsif ($type eq 'delumethod2') { process_delete_user_method_2() }
    elsif ($type eq 'templates') { process_templates() }
    elsif ($type eq 'findtemplates') { process_find_templates() }
    elsif ($type eq 'edittemplate') { process_edit_template() }
    elsif ($type eq 'submittemplate') { process_submit_template() }
    elsif ($type eq 'deltemplate') { process_delete_template() }
    elsif ($type eq 'deltemplate2') { process_delete_template_2() } 
    elsif ($type eq 'facilities') { process_facilities() }
    elsif ($type eq 'editfac') { process_edit_facility() }
    elsif ($type eq 'notify') { process_notify() }
    elsif ($type eq 'facnotify') { process_notify_facility() }
    elsif ($type eq 'newnotify') { process_new_notify() }
    elsif ($type eq 'editnotify_e') { process_edit_notify_e() }
    elsif ($type eq 'submitnotify_e') { process_submit_notify_e() }
    elsif ($type eq 'editnotify_p') { process_edit_notify_p() }
    elsif ($type eq 'submitnotify_p') { process_submit_notify_p() }
    elsif ($type eq 'editnotify_s') { process_edit_notify_s() }
    elsif ($type eq 'submitnotify_s') { process_submit_notify_s() }
    elsif ($type eq 'editnotify_d') { process_edit_notify_d() }
    elsif ($type eq 'submitnotify_d') { process_submit_notify_d() }
    elsif ($type eq 'submitnotify_c') { process_submit_notify_c() }
    elsif ($type eq 'delnotify2') { process_delete_notify_2() }
    elsif ($type eq 'editfacfrag') { process_edit_facility_fragility() }
    elsif ($type eq 'delfacfrag2') { process_delete_facility_fragility_2() }
    elsif ($type eq 'servers') { process_servers() }
    elsif ($type eq 'findservers') { process_find_servers() }
    elsif ($type eq 'editserver') { process_edit_server() }
    elsif ($type eq 'delserver') { process_delete_server() }
    elsif ($type eq 'delserver2') { process_delete_server_2() }
    elsif ($type eq 'editserverpwd') { process_edit_server_pwd() }
    elsif ($type eq 'editserverpwd2') { process_edit_server_pwd_2() }
    elsif ($type eq 'submitserver') { process_submit_server() }
    elsif ($type eq 'thisserver') { process_this_server() }
    elsif ($type eq 'submitthisserver') { process_submit_this_server() }
    elsif ($type eq 'edituserpwd') { process_edit_user_pwd() }
    elsif ($type eq 'edituserpwd2') { process_edit_user_pwd_2() }
    elsif ($type eq 'selfacrequest') { process_sel_fac_req() }
    elsif ($type eq 'addfacrequest') { process_add_fac_req() }
    elsif ($type eq 'delfacrequest') { process_del_fac_req() }
    elsif ($type eq 'notifyaction') { process_notify_facility_action() }

    elsif ($type eq 'submituser') { process_submit_user() }
    elsif ($type eq 'findusers') { process_find_users() }
    elsif ($type eq 'deluser') { process_delete_user() }
    elsif ($type eq 'clonenotifyaction') { process_clone_notification_action() }
    elsif ($type eq 'delnotify') { process_delete_notify() }
    elsif ($type eq 'submitfacfrag') { process_submit_facility_fragility() }
    elsif ($type eq 'facfrag') { process_facility_fragility() }
    elsif ($type eq 'delfacfrag') { process_delete_facility_fragility() }
    elsif ($type eq 'submitfac') { process_submit_facility() }
    elsif ($type eq 'delfac') { process_delete_facility() }
    elsif ($type eq 'findfacs') { process_find_facilities() }
}


#
### Users
#

sub process_submit_user {
    my @missing;
    my $kind;

    my $key = $options{'key'};
    if ($key) { 
	$kind = 'Update was successful!';
	@missing = update_table_entry('SHAKECAST_USER',
				      'SHAKECAST_USER', $key,
				      undef, undef,
				      $shakecast_user_form);
    }
    else {
	$kind = 'Insert was successful!';
	@missing = insert_table_entry('SHAKECAST_USER',
				      $shakecast_user_form);
    }
    if (@missing) {
    }
    else {
	process_find_users($kind);
    }
}


sub process_find_users {
    my ($caption, $where);
	my $skip = $options{'skip'} || 0;  #kwl
	my $order = $options{'order'} || 'USERNAME';  #kwl

	my $fname = $options{'full_name'};
	my $uname = $options{'username'};
	if ($fname) {
	    $caption = "Users with Full Name starting with '$fname'";
	    $where = qq[WHERE FULL_NAME LIKE '$fname%'];
	}
	elsif ($uname) {
	    $caption = "Users with User Name starting with '$uname'";
	    $where = qq[WHERE USERNAME LIKE '$uname%'];
	}
	show_table('SHAKECAST_USER',
		   $where, $order,
		   $shakecast_user_layout);
}


sub process_delete_user {
    start_page("Delete User");
    my $key = $options{'key'};
    exit unless $key;
	if ($dbh->do("DELETE FROM user_delivery_method WHERE SHAKECAST_USER = ?",
		 undef, $key)) {
		pr "The user was successfully deleted from user_delivery_method.";}
	if ($dbh->do("DELETE FROM notification_request WHERE SHAKECAST_USER = ?",
		 undef, $key)) {
		pr "The user was successfully deleted from notification_request.";}
	if ($dbh->do("DELETE FROM shakecast_user WHERE SHAKECAST_USER = ?",
		 undef, $key)) {
		pr "The user was successfully deleted from shakecast_user.";}
}


#
### Notification Requests
#

sub process_clone_notification_action {
    my $user_key = $options{'ukey'};
    my $source_user = $options{'source_user'};
    exit unless $user_key && $source_user;
    my $sth_n = $dbh->prepare(qq/
        select notification_request_id,
               damage_level,
               notification_type,
               event_type,
               delivery_method,
               message_format,
               limit_value,
               user_message,
               notification_priority,
               auxiliary_script,
               disabled,
               product_type,
               metric,
               aggregate,
               aggregation_group
          from notification_request
         where shakecast_user = ?/);
    my $sth_i = $dbh->prepare(qq/
        insert into notification_request (
               damage_level,
               notification_type,
               event_type,
               delivery_method,
               message_format,
               limit_value,
               user_message,
               notification_priority,
               auxiliary_script,
               disabled,
               product_type,
               metric,
               aggregate,
               aggregation_group,
               shakecast_user,
               update_username,
               update_timestamp)
        values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)/);
    $sth_n->execute($source_user);

    my %needed_methods; # remember needed delivery methods here
    while (my @v = $sth_n->fetchrow_array) {
        my $old_id = shift @v;
        $needed_methods{$v[3]} = $v[3];
        $sth_i->execute(@v, $user_key, $admin_user, ts()) or exit;
        # get the notification_request_id for the record just inserted
        my $new_id = $dbh->{mysql_insertid};
        exit unless $new_id;
        # copy all the facilities for one notification request
        $dbh->do(qq/
            insert into facility_notification_request (
                   notification_request_id, facility_id)
                   select $new_id, fnr.facility_id
                     from facility_notification_request fnr
                    where fnr.notification_request_id = ?/, undef, $old_id)
            or exit;
    }
    # create any missing delivery methods for the new user
    # find out what methods already exist for the new user
    my $existing_methods = $dbh->selectcol_arrayref(qq/
        select distinct delivery_method
          from user_delivery_method
         where shakecast_user = ?/, undef, $user_key)
            or exit;
    foreach my $m (@$existing_methods) {
        delete $needed_methods{$m};
    }
    # now %needed_methods only contains delivery_methods we must still create
    foreach my $m (keys %needed_methods) {
        $dbh->do(qq/
            insert into user_delivery_method (
                   delivery_method,
                   shakecast_user,
                   update_username,
                   update_timestamp)
            values (?, ?, ?, ?)/, undef, $m, $user_key, $admin_user, ts())
                or exit;
    }
	pr 'Notifications were copied successfully';
}


sub process_delete_notify {
    my $key = $options{'key'};
    exit unless $key;
	if ($dbh->do("DELETE FROM facility_notification_request WHERE NOTIFICATION_REQUEST_ID = ?",
		 undef, $key)) {
		pr "The notification was successfully deleted from facility_notification_request.";}
	if ($dbh->do("DELETE FROM notification_request WHERE NOTIFICATION_REQUEST_ID = ?",
		 undef, $key)) {
		pr "The notification was successfully deleted from notification_request.";}
}


#
### Facilities
#

sub process_delete_facility {
    my $key = $options{'key'};
    exit unless $key;
    my ($name, $shortname, $factype) = get_facility_info($key);
	if ($dbh->do("DELETE FROM facility WHERE FACILITY_ID = ?",
		 undef, $key)) {
		pr "The facility was successfully deleted from facility.";}
	if ($dbh->do("DELETE FROM notification_request WHERE FACILITY_ID = ?",
		 undef, $key)) {
		pr "The facility was successfully deleted from notification_request.";}
	if ($dbh->do("DELETE FROM facility_fragility WHERE FACILITY_ID = ?",
		 undef, $key)) {
		pr "The facility was successfully deleted from facility_fragility.";}
}


sub get_facility_info {
    my $key = shift;

    my $sth = $dbh->prepare(<<__SQL__);
SELECT FACILITY_NAME, SHORT_NAME, FACILITY_TYPE FROM facility
   WHERE FACILITY_ID = ?
__SQL__
    ;
    exit unless $sth;
    $sth->execute($key) or exit;
    my $r = $sth->fetchrow_arrayref or exit;
    return @$r;
}


sub process_find_facilities {
    my ($caption, $where);

	my $skip = $options{'skip'} || 0;  #kwl
	my $order = $options{'order'} || 'facility_name';  #kwl

	if (my $facname = $options{'facility_name'}) {
	    $caption = "Facilities with Name Starting with '$facname'";
	    $where = qq[WHERE FACILITY_NAME LIKE '$facname%'];
	}
	elsif (my $shortname = $options{'shortname'}) {
	    $caption = "Facilities with Short Name Starting with '$shortname'";
	    $where = qq[WHERE SHORT_NAME LIKE '$shortname%'];
	}
	elsif (my $descr = $options{'descr'}) {
	    $caption = "Facilities with Description Starting with '$descr'";
	    $where = qq[WHERE SHORT_NAME LIKE '$descr%'];
	}
	show_table('FACILITY', $where, $order, $facility_layout);
}


sub process_submit_facility {
    my @missing;

    my $key = $options{'key'};
    $options{'lat_max'} = $options{'lat_min'} unless
	$options{'lat_max'};
    $options{'lon_max'} = $options{'lon_min'} unless
	$options{'lon_max'};
    if ($key) { 
	@missing = update_table_entry('FACILITY',
				      'FACILITY_ID', $key,
				      undef, undef,
				      $facility_form);
    }
    else {
	@missing = insert_table_entry('FACILITY',
				      $facility_form);
    }
    if (@missing) {
    }
    else {
	pr "facility insert/update successful.";
    }
}


#
### Facility Fragility
#

sub process_delete_facility_fragility {
    my $key = $options{'key'};
    exit unless $key;
	$dbh->do("DELETE FROM facility_fragility WHERE FACILITY_FRAGILITY_ID = ?",
		 undef, $key) or exit;
	pr "The facility fragility was successfully deleted.";
}


sub process_facility_fragility {
    my $key = $options{'key'};
    exit unless $key;
	my $order = $options{'order'} || ''; 
    my ($name, $short_name, $factype) = get_facility_info($key);
    show_table("FACILITY_FRAGILITY", "WHERE FACILITY_ID = $key",
	       $order, $facility_fragility_layout);
}


sub process_submit_facility_fragility {
    my @missing;

    my $key = $options{'key'};
    my $key2 = $options{'key2'};
    if ($key) { 
		@missing = update_table_entry('FACILITY_FRAGILITY',
						  'FACILITY_FRAGILITY_ID', $key,
						  undef, undef,
						  $facility_fragility_form);
	}
    elsif ($key2) {
		@missing = insert_table_entry('FACILITY_FRAGILITY',
						  $facility_fragility_form,
						  'FACILITY_ID', $key2);
    }
	pr "Facility fragility successfully completed." unless (@missing);
}


sub update_table_entry {
    my ($table, $key_name, $key_value, $key2_name, $key2_value, $layout) = @_;
    my (@fields, @values, @missing);

    $table = lc $table;
    my @list = @$layout;
    while (my $title = shift @list) {
	my $f = shift @list;
	my ($name, $rest) = split /\//, $f;
	my $req = $name =~ s/^\+//;
	push @fields, $name;
	my $v = $options{lc($name)};
	if ($req and !$v) { push @missing, $name }
	else { push @values, (defined($v) and $v eq '') ? undef : $v }
    }
    unless (@missing) {
	push @fields, 'UPDATE_USERNAME';
	push @values, $admin_user;
	push @fields, 'UPDATE_TIMESTAMP';
	push @values, ts();
	my $sql = "UPDATE $table SET " . join(',', map {"$_=?"} @fields);
	$sql .= " WHERE $key_name = ?";
	push @values, $key_value;
	if ($key2_value) {
	    $sql .= " AND $key2_name = ?";
	    push @values, $key2_value;
	}
	$dbh->do($sql, undef, @values) or exit;
    }
    return @missing;
}


sub insert_table_entry {
    my ($table, $layout, @extras) = @_;
    my (@fields, @values, @missing);

    $table = lc $table;
    my @list = @$layout;
    while (my $title = shift @list) {
	my $f = shift @list;
	my ($name, $rest) = split /\//, $f;
	my $req = $name =~ s/^\+//;
	push @fields, $name;
	my $v = $options{lc($name)};
	if ($req and !$v) { push @missing, $name }
	else { push @values, (defined($v) and $v eq '') ? undef : $v }
    }
    unless (@missing) {
	while (my $name = shift @extras) {
	    push @fields, $name;
	    push @values, shift(@extras);
	}
	push @fields, 'UPDATE_USERNAME';
	push @values, $admin_user;
	push @fields, 'UPDATE_TIMESTAMP';
	push @values, ts();
	my $sql = "INSERT INTO $table (" . join(',', @fields) . ") ";
	$sql .= ' VALUES (' . join(',', ('?') x @fields) . ')';
	$dbh->do($sql, undef, @values) or exit;
    }
    return @missing;
}


sub show_table {
    my ($table, $where, $order, $fp, @links) = @_;
    my (@names, @fields, %fmap);

	$table = lc $table;
    my $nrows = 0;
    my @list = @$fp;
    while (my $p = shift @list) {
	push @names, $p;
	my $f = shift(@list);
	my ($fname, $rest) = split /\//, $f;
	push @fields, $fname;
	$fmap{$fname} = $rest if $rest;
    }
    my $sql = "SELECT " . join(',', @fields) . " FROM $table";
    $sql .= " $where" if $where;
    $sql .= " ORDER BY $order" if $order;
	$sql .= " Limit $limit" if $limit;
	$sql .= " OFFSET $offset" if $offset;

    my $sth = $dbh->prepare($sql) or exit;
    $sth->execute or exit;
	my $rows = $sth->rows;

    while (my $r = $sth->fetchrow_hashref) {
		unless ($nrows++) {
			pr  join('::', @fields);
		}
	
		my @vals;
		foreach my $name (@fields) {
			push @vals, (($r->{$name}) ? $r->{$name} : '');
		}
		pr join '::', @vals;
    }
}


sub pr {
    print @_, "\n";
}


sub ts {
    my $time = shift;
    my($sec, $min, $hr, $mday, $mon, $yr);

    $time = time unless defined $time;
    ($sec, $min, $hr, $mday, $mon, $yr) = localtime $time;
    sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
	     $yr+1900, $mon+1, $mday,
	     $hr, $min, $sec);
}


