#!/usr/local/bin/perl

#
### notifyqueue: Scan for Notifications and Queue Them
#
# $Id: notifyqueue.pl 499 2008-10-08 19:25:44Z klin $
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



$^W = 1;

use strict;

my $VERSION = 'notifyqueue 0.2.10 2004-03-11 20:51Z';
my $RCSID = '@(#) $Id: notifyqueue.pl 499 2008-10-08 19:25:44Z klin $ ';

use FindBin;
use lib "$FindBin::Bin/../lib";

use Data::Dumper;

use Getopt::Long;

use Time::Local;

use POSIX;

BEGIN {
    require GKS::Service if $^O eq 'MSWin32';
}

use Carp;

use SC;
use SC::Server;

use XML::Simple;
use XML::Parser;
use Template;
use HTML::Entities;
my ($shakemap_xml, $event_xml, $grid_spec, $grid_metric);

#
##### Primary Configuration #####
#

my $CONFNAME = undef;

my $CONFSECTION = 'NotifyQueue';

#
##### Last Resort Defintions if Not in Config File #####
#

my $SERVICE_NAME = 'notifyqueue';

my $SERVICE_TITLE = 'Queue Notify Requests';

my $LOG_LEVEL = undef;		# undef to use global config unless in local
				# config or parameter

my $SPOLL = 10;

my $SCAN_PERIOD = 60;

#
### Local Configuration defs
#

##### (End of Configuration Sections) #####


##### DB Tables #####

my $FACILITY_FRAGILITY_TABLE = 'facility_fragility';

my $NOTIFICATION_PARM_TABLE = 'notification_request_status';

my $NOTIFICATION_REQUEST_TABLE = 'notification_request';

my $PROFILE_NOTIFICATION_REQUEST_TABLE = 'profile_notification_request';

my $NOTIFICATION_TABLE = 'notification';

my $EVENT_TABLE = 'event';

my $PRODUCT_TABLE = 'product';

my $GRID_TABLE = 'grid';

my $SYSTEM_TABLE = 'log_message';

my $STATION_TABLE = 'station_shaking';

my $GEOMETRY_USER_PROFILE_TABLE = 'geometry_user_profile';


##### Scan Definitions #####

my %SQL = 
    (GET_PARM => { SQL => <<__SQL__ },
select parmvalue from $NOTIFICATION_PARM_TABLE where
     parmname = ?
__SQL__
     UPDATE_PARM => { SQL => <<__SQL__ },
update $NOTIFICATION_PARM_TABLE set parmvalue = ? where 
     parmname = ?
__SQL__
     INSERT_PARM => { SQL => <<__SQL__ },
insert into $NOTIFICATION_PARM_TABLE (parmname, parmvalue) values (?, ?)
__SQL__
     GET_MAX_EVT_SEQ => { SQL => <<__SQL__ },
select max(seq) from $EVENT_TABLE
__SQL__
     GET_MAX_PROD_SEQ => { SQL => <<__SQL__ },
select max(product_id) from $PRODUCT_TABLE
__SQL__
     GET_MAX_GRID_SEQ => { SQL => <<__SQL__ },
select max(grid_id) from $GRID_TABLE
  where latitude_cell_count > 0
__SQL__
     GET_MAX_SYSTEM_SEQ => { SQL => <<__SQL__ },
select max(log_message_id) from $SYSTEM_TABLE
__SQL__
     GET_GRID_ID => { SQL => <<__SQL__ },
select shakemap_id, shakemap_version from $GRID_TABLE
  where grid_id = ?
__SQL__
     GET_TIMESTAMP => { SQL => <<__SQL__ },
    select receive_timestamp
      from shakemap
     where event_id = ? and shakemap_version = ?
__SQL__
     GET_NEW_GRIDS => { SQL => <<__SQL__ },
select s.shakemap_id, s.shakemap_version, g.grid_id, 
     m.metric, m.value_column_number
  from shakemap s, grid g, shakemap_metric m
  where s.shakemap_id = g.shakemap_id and
     s.shakemap_version = g.shakemap_version and
     s.shakemap_id = m.shakemap_id and 
     s.shakemap_version = m.shakemap_version and
     m.value_column_number is not null and
     s.superceded_timestamp is null and
     g.latitude_cell_count > 0 and
     g.grid_id > ?
__SQL__
     GET_NOTIFICATION_REQUEST_PRODUCT => { SQL => <<__SQL__ },
select count(nr.product_type) from $PRODUCT_TABLE p, $NOTIFICATION_REQUEST_TABLE nr 
	where p.product_id = ?
		and nr.product_type = p.product_type
__SQL__
     GET_NOTIFICATION_REQUEST_PRODUCT_PROFILE => { SQL => <<__SQL__ },
select count(nr.product_type) from $PRODUCT_TABLE p, $PROFILE_NOTIFICATION_REQUEST_TABLE nr 
	where p.product_id = ?
		and nr.product_type = p.product_type
__SQL__
     GET_NOTIFICATION_REQUEST_METRIC => { SQL => <<__SQL__ },
select notification_request_id from $NOTIFICATION_REQUEST_TABLE
	where metric = ?
	limit 1
__SQL__
     GET_FACILITY_FRAGILITY_METRIC => { SQL => <<__SQL__ },
select facility_id from $FACILITY_FRAGILITY_TABLE
	where metric = ?
	limit 1
__SQL__
     GET_MAX_STATION_SEQ => { SQL => <<__SQL__ },
select max(record_id) from $STATION_TABLE
__SQL__
     GET_USER_PROFILE => { SQL => <<__SQL__ },
select distinct profile_id from $GEOMETRY_USER_PROFILE_TABLE
__SQL__
     GET_NEW_STATIONS => { SQL => <<__SQL__ },
select s.shakemap_id, s.shakemap_version, g.grid_id, 
     m.metric, m.value_column_number, ss.record_id, n.notification_id
  from shakemap s, shakemap_metric m, 
	 (((grid g
	 INNER JOIN notification n on g.grid_id =
		n.grid_id)
     INNER JOIN station_facility sf on n.facility_id =
		sf.facility_id)
	 INNER JOIN station_shaking ss on sf.station_id = 
		ss.station_id)
  where s.shakemap_id = g.shakemap_id and
     s.shakemap_version = g.shakemap_version and
     s.shakemap_id = m.shakemap_id and 
     s.shakemap_version = m.shakemap_version and
     m.value_column_number is not null and
     s.superceded_timestamp is null and
	 m.metric = n.metric and
	 ss.grid_id = n.grid_id and
	 ss.grid_id = g.grid_id and
     ss.record_id > ?
__SQL__
     );
     
=for nobody
my $SQL_BASIC_EVENTS = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       e.event_id,
       e.event_version,
       %SYSDATE%
  from (notification_request n left join facility_notification_request fn
            on n.notification_request_id = fn.notification_request_id),
       event e,
       notification_type t
 where (n.disabled = 0 or n.disabled is null)
   and e.seq > ?
   and e.event_type = n.event_type
   and t.notification_type = n.notification_type
   and t.notification_class = 'event'
   and (n.limit_value is null or e.magnitude >= n.limit_value)
   and fn.facility_id is null
   and ((e.event_status = 'normal' and e.initial_version = 1)
        or (e.superceded_timestamp is null and e.event_status = 'normal' and e.initial_version = 0)
        or (e.superceded_timestamp is null and e.event_status = 'cancelled' and e.initial_version = 0))
__SQL__
    ;
=cut
my $SQL_SYSTEM_EVENTS = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_version,
		delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
		l.log_message_id,
		udm.delivery_address,
       %SYSDATE%
  from log_message l,
       notification_request n,
       user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and (n.disabled = 0 or n.disabled is null)
   and l.log_message_id > ?
   and n.notification_type = 'SYSTEM' 
   and NOW() < TIMESTAMPADD(MINUTE,30,l.receive_timestamp)
__SQL__
    ;

my $SQL_SYSTEM_EVENTS_PROFILE = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_version,
		delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
		l.log_message_id,
		group_concat(u.delivery_address),
       %SYSDATE%
  from ((geometry_user_profile g 
	inner join profile_notification_request n on g.profile_id = n.profile_id )
	inner join user_delivery_method u on u.delivery_method = n.delivery_method 
	and g.shakecast_user = u.shakecast_user),
		log_message l
 where n.profile_id in (select profile_id from geometry_user_profile)
   and (n.disabled = 0 or n.disabled is null)
   and l.log_message_id > ?
   and n.notification_type = 'SYSTEM' 
   and NOW() < TIMESTAMPADD(MINUTE,30,l.receive_timestamp)
 group by g.profile_id
__SQL__
    ;

my $SQL_BASIC_EVENTS = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
	    delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       e.event_id,
       e.event_version,
 	   udm.delivery_address,
       %SYSDATE%
  from notification_request n,
       event e,
       user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and (n.disabled = 0 or n.disabled is null)
   and e.seq > ?
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and (n.limit_value is null or e.magnitude >= n.limit_value)
   and (   (n.notification_type = 'NEW_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 1)
        or (n.notification_type = 'UPD_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 0 and e.superceded_timestamp is null)
        or (n.notification_type = 'CAN_EVENT' and e.event_status = 'cancelled'
            and e.initial_version = 0 and e.superceded_timestamp is null))
__SQL__
    ;

my $SQL_FACILITY_EVENTS = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
       facility_id,
	    delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       e.event_id,
       e.event_version,
       fn.facility_id,
 	   udm.delivery_address,
       %SYSDATE%
  from event e,
       notification_request n,
       facility_notification_request fn,
       facility f,
       user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and (n.disabled = 0 or n.disabled is null)
   and e.seq > ?
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and (n.limit_value is null or e.magnitude >= n.limit_value)
   and n.notification_request_id = fn.notification_request_id
   and fn.facility_id = f.facility_id
   and e.lat between f.lat_min and f.lat_max
   and e.lon between f.lon_min and f.lon_max
   and (   (n.notification_type = 'NEW_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 1)
        or (n.notification_type = 'UPD_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 0 and e.superceded_timestamp is null)
        or (n.notification_type = 'CAN_EVENT' and e.event_status = 'cancelled'
            and e.initial_version = 0 and e.superceded_timestamp is null))
__SQL__
    ;

my $SQL_BASIC_PRODUCTS = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
       product_id,
	    delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       e.event_id,
       e.event_version,
       p.product_id,
 	   udm.delivery_address,
      %SYSDATE%
  from (notification_request n left join facility_notification_request fn
            on n.notification_request_id = fn.notification_request_id),
       product p,
       event e,
       shakemap s,
       notification_type t,
       user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and n.notification_type = 'NEW_PROD'
   and (n.disabled = 0 or n.disabled is null)
   and p.product_id = ?
   and p.shakemap_id = s.shakemap_id and p.shakemap_version = s.shakemap_version
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and t.notification_type = n.notification_type
   and t.notification_class = 'product'
   and (n.product_type = 'ALL' or n.product_type = p.product_type)
   and (n.limit_value is null or n.limit_value = 0 or e.magnitude >= n.limit_value)
   and fn.facility_id is null
   and p.superceded_timestamp is null
   and e.superceded_timestamp is null
__SQL__
    ;

my $SQL_FACILITY_PRODUCTS = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
       product_id,
       facility_id,
		delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       e.event_id,
       e.event_version,
       p.product_id,
       fn.facility_id,
		udm.delivery_address,
       %SYSDATE%
  from notification_request n,
       facility_notification_request fn,
       product p,
       event e,
       shakemap s,
       facility f,
       notification_type t,
       user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and n.notification_type = 'NEW_PROD'
   and (n.disabled = 0 or n.disabled is null)
   and p.product_id = ?
   and p.shakemap_id = s.shakemap_id and p.shakemap_version = s.shakemap_version
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and t.notification_type = n.notification_type
   and t.notification_class = 'product'
   and (n.product_type = 'ALL' or n.product_type = p.product_type)
   and (n.limit_value is null or n.limit_value = 0 or e.magnitude >= n.limit_value)
   and n.notification_request_id = fn.notification_request_id
   and fn.facility_id = f.facility_id
   and (f.lat_max >= p.lat_min and
        f.lat_min <= p.lat_max and
        f.lon_max >= p.lon_min and
        f.lon_min <= p.lon_max)
   and p.superceded_timestamp is null
   and e.superceded_timestamp is null
__SQL__
    ;

my $SQL_BASIC_EVENTS_PROFILE = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       e.event_id,
       e.event_version,
       %SYSDATE%
  from ((geometry_profile g left join geometry_facility_profile gfp
            on g.profile_id = gfp.profile_id)
	inner join profile_notification_request n on g.profile_id = n.profile_id ),
       event e
 where n.profile_id in (select profile_id from geometry_user_profile)
   and (n.disabled = 0 or n.disabled is null)
   and e.seq > ?
   and g.profile_id = ?
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and (n.limit_value is null or e.magnitude >= n.limit_value)
   and (   (n.notification_type = 'NEW_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 1)
        or (n.notification_type = 'UPD_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 0 and e.superceded_timestamp is null)
        or (n.notification_type = 'CAN_EVENT' and e.event_status = 'cancelled'
            and e.initial_version = 0 and e.superceded_timestamp is null))
    and gfp.facility_id is null
__SQL__
    ;

my $SQL_FACILITY_EVENTS_PROFILE = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
	   facility_id,
       queue_timestamp)
select distinct 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       e.event_id,
       e.event_version,
		fn.facility_id,
       %SYSDATE%
  from (geometry_profile g 
	inner join profile_notification_request n on g.profile_id = n.profile_id ),
       geometry_facility_profile fn,
       facility f,
       event e
 where (n.disabled = 0 or n.disabled is null)
   and e.seq > ?
   and g.profile_id = ?
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and (n.limit_value is null or e.magnitude >= n.limit_value)
   and (   (n.notification_type = 'NEW_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 1)
        or (n.notification_type = 'UPD_EVENT' and e.event_status in ('normal', 'released')
            and e.initial_version = 0 and e.superceded_timestamp is null)
        or (n.notification_type = 'CAN_EVENT' and e.event_status = 'cancelled'
            and e.initial_version = 0 and e.superceded_timestamp is null))
   and n.profile_id = fn.profile_id
   and fn.facility_id = f.facility_id
   and e.lat between f.lat_min and f.lat_max
   and e.lon between f.lon_min and f.lon_max
__SQL__
    ;

my $SQL_BASIC_PRODUCTS_PROFILE = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
       product_id,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       e.event_id,
       e.event_version,
       p.product_id,
      %SYSDATE%
  from ((geometry_profile g left join geometry_facility_profile gfp
            on g.profile_id = gfp.profile_id)
	inner join profile_notification_request n on g.profile_id = n.profile_id ),
       product p,
       event e,
       shakemap s,
       notification_type t
 where n.profile_id in (select profile_id from geometry_user_profile)
   and n.notification_type = 'NEW_PROD'
   and (n.disabled = 0 or n.disabled is null)
   and p.product_id = ?
   and g.profile_id = ?
   and p.shakemap_id = s.shakemap_id and p.shakemap_version = s.shakemap_version
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and t.notification_type = n.notification_type
   and t.notification_class = 'product'
   and (n.product_type = 'ALL' or n.product_type = p.product_type)
   and (n.limit_value is null or n.limit_value = 0 or p.max_value >= n.limit_value)
   and gfp.facility_id is null
   and p.superceded_timestamp is null
   and e.superceded_timestamp is null
__SQL__
    ;

my $SQL_FACILITY_PRODUCTS_PROFILE = <<__SQL__;
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       event_id,
       event_version,
       product_id,
       facility_id,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       e.event_id,
       e.event_version,
       p.product_id,
       fn.facility_id,
       %SYSDATE%
  from (geometry_profile g 
	inner join profile_notification_request n on g.profile_id = n.profile_id ),
       geometry_facility_profile fn,
       product p,
       event e,
       shakemap s,
       facility f,
       notification_type t
 where n.profile_id in (select profile_id from geometry_user_profile)
   and n.notification_type = 'NEW_PROD'
   and (n.disabled = 0 or n.disabled is null)
   and p.product_id = ?
   and g.profile_id = ?
   and p.shakemap_id = s.shakemap_id and p.shakemap_version = s.shakemap_version
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and t.notification_type = n.notification_type
   and t.notification_class = 'product'
   and (n.product_type = 'ALL' or n.product_type = p.product_type)
   and (n.limit_value is null or n.limit_value = 0 or p.max_value >= n.limit_value)
   and n.profile_id = fn.profile_id
   and fn.facility_id = f.facility_id
   and (f.lat_max >= p.lat_min and
        f.lat_min <= p.lat_max and
        f.lon_max >= p.lon_min and
        f.lon_min <= p.lon_max)
   and p.superceded_timestamp is null
   and e.superceded_timestamp is null
__SQL__
    ;

#my @event_scans = (\$SQL_BASIC_EVENTS, \$SQL_FACILITY_EVENTS);
my @event_scans = (\$SQL_BASIC_EVENTS);
my @product_scans = (\$SQL_BASIC_PRODUCTS, \$SQL_FACILITY_PRODUCTS);
my @system_scans = (\$SQL_SYSTEM_EVENTS);

#my @event_scans_profile = (\$SQL_BASIC_EVENTS_PROFILE, \$SQL_FACILITY_EVENTS_PROFILE);
my @event_scans_profile = (\$SQL_BASIC_EVENTS_PROFILE);
my @product_scans_profile = (\$SQL_BASIC_PRODUCTS_PROFILE, \$SQL_FACILITY_PRODUCTS_PROFILE);
my @system_scans_profile = (\$SQL_SYSTEM_EVENTS_PROFILE);

my $SHAKE_BASE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
	    delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       fn.facility_id,
       g.grid_id,
       n.metric,
       sh.value_%VALNO%,
	   udm.delivery_address,
       %SYSDATE%
  from grid g
       straight_join shakemap s
       straight_join event e
       straight_join facility_shaking sh
       straight_join facility_notification_request fn
       straight_join notification_request n
       straight_join user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'shaking'
   and n.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and e.superceded_timestamp is null
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.notification_request_id = n.notification_request_id
   and (n.limit_value is null or sh.value_%VALNO% >= n.limit_value)
__SQL__
;

my $SHAKE_BASE_PROFILE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       fn.facility_id,
       g.grid_id,
       n.metric,
       sh.value_%VALNO%,
       %SYSDATE%
  from grid g
       straight_join shakemap s
       straight_join event e
       straight_join facility_shaking sh
       straight_join geometry_facility_profile fn
       straight_join (geometry_profile gp 
	inner join profile_notification_request n on gp.profile_id = n.profile_id )
 where n.profile_id = ?
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'shaking'
   and n.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and e.superceded_timestamp is null
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is null)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.profile_id = n.profile_id
   and (n.limit_value is null or sh.value_%VALNO% >= n.limit_value)
__SQL__
;

my $DAMAGE_BASE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
	   delivery_address,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       n.shakecast_user,
       fn.facility_id,
       g.grid_id,
       ff.metric,
       sh.value_%VALNO%,
	   udm.delivery_address,
       %SYSDATE%
  from facility_fragility ff
       straight_join facility_shaking sh
		straight_join grid g
       straight_join shakemap s
       straight_join event e
       straight_join facility_notification_request fn
       straight_join notification_request n
       straight_join user_delivery_method udm
 where (n.shakecast_user not in (select shakecast_user from geometry_user_profile)
   and n.shakecast_user = udm.shakecast_user and n.delivery_method = udm.delivery_method)
   and sh.value_%VALNO% between ff.low_limit and ff.high_limit
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'damage'
   and ff.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and e.superceded_timestamp is null
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is NULL)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.notification_request_id = n.notification_request_id
   and sh.facility_id = ff.facility_id
   and n.damage_level = ff.damage_level
   and (n.limit_value is null or sh.value_%VALNO% >= n.limit_value)
__SQL__
    ;

my $DAMAGE_BASE_PROFILE = <<__SQL__
insert into notification (
       delivery_status,
       notification_request_id,
       shakecast_user,
       facility_id,
       grid_id,
       metric,
       grid_value,
       queue_timestamp)
select 'PENDING',
       n.notification_request_id,
       -(n.profile_id),
       fn.facility_id,
       g.grid_id,
       ff.metric,
       sh.value_%VALNO%,
       %SYSDATE%
  from facility_fragility ff
       straight_join facility_shaking sh
		straight_join grid g
       straight_join shakemap s
       straight_join event e
       straight_join geometry_facility_profile fn
       straight_join (geometry_profile gp 
	inner join profile_notification_request n on gp.profile_id = n.profile_id )
 where n.profile_id = ?
   and sh.value_%VALNO% between ff.low_limit and ff.high_limit
   and (n.disabled = 0 or n.disabled is null)
   and n.notification_type = 'damage'
   and ff.metric = ?
   and s.shakemap_id = ?
   and s.shakemap_version = ?
   and g.grid_id = ?
   and s.superceded_timestamp is null
   and e.superceded_timestamp is null
   and s.event_id = e.event_id
   and (n.event_type = 'ALL' or n.event_type = e.event_type or n.event_type is NULL)
   and g.grid_id = sh.grid_id
   and (s.shakemap_id = g.shakemap_id and
        s.shakemap_version = g.shakemap_version)
   and sh.facility_id = fn.facility_id
   and fn.profile_id = n.profile_id
   and sh.facility_id = ff.facility_id
   and n.damage_level = ff.damage_level
   and (n.limit_value is null or sh.value_%VALNO% >= n.limit_value)
__SQL__
    ;

my $STATION_BASE = <<__SQL__
update notification n, station_shaking ss
	set n.grid_value = ss.value_%VALNO%
 where n.notification_id = ?
   and ss.record_id = ?
   and ss.value_%VALNO%  is not null
__SQL__
;

##### Local Variable #####

my ($opt_help, $opt_version);

my $start_time;

my ($confname, $confsection, $facility);

my ($service_name, $service_title, $spoll, $verbose, $onceonly, $scan_period);

my ($installing, $removing, $run_as_service, $run_as_daemon);

my $pid_file;

my $dbh;

my $iswin32 = $^O eq 'MSWin32';


##### Sub Declarations #####

sub epr;
sub error;
sub finish;
sub option;
sub quit;
sub spoll;
sub vpr; 
sub vvpr;
sub vvvpr;

##### Main Code #####

my $pname = $0;
$pname =~ s=\\=/=g;
$pname =~ s=\.\w+?$==;
$pname =~ s=^.*/==;

GetOptions(
	   "confname=s",      \$confname,
	   "confsection=s",   \$confsection,
	   "daemon!",         \$run_as_daemon,
	   "facility=s",      \$facility,
	   "help",            \$opt_help,
	   "install!",        \$installing,
	   "msglevel=i",      \$verbose,
	   "onceonly!",       \$onceonly,
	   "pid-file=s",      \$pid_file,
	   "remove!",         \$removing,
	   "scanperiod=i",    \$scan_period,
	   "service!",        \$run_as_service,
	   "sname=s",         \$service_name,
	   "spoll=i",         \$spoll,
	   "stitle=s",        \$service_title,
	   "verbose!",        \$verbose,
	   "version",         \$opt_version,
	   ) or
    die "Terminated: Bad Option(s)\n";

if ($iswin32) { $run_as_daemon = 0 }
else { $run_as_service = 0 }

if ($run_as_daemon) {
    chdir '/'                         or die "can't chdir to /: $!";
    open STDIN, '/dev/null'           or die "can't open STDIN: $!";
    open STDOUT, '>/dev/null'         or die "can't open STDOUT: $!";
    open STDERR, '>/dev/null'         or die "can't open STDERR: $!";
    defined (my $pid = fork)          or die "can't fork: $!";
    exit if $pid;
    setsid                            or die "can't setsid: $!";
    umask 0;
}

$confname ||= $CONFNAME;

$confsection ||= $CONFSECTION;

$facility ||= $pname;

help() if $opt_help;

unless (SC->initialize($confname, $facility)) {
    die "Can't initialize: ", SC->errstr;
}

my $config = SC->config;
my $perl = $config->{perlbin};


$verbose ||= option 'LogLevel', $LOG_LEVEL;
SC->log_level($verbose) if defined $verbose;

SC->log_fh2(*stderr) unless $run_as_service;

epr "Start $pname.  Version: $VERSION";

if ($pid_file) {
    open PID, ">$pid_file" or quit "Can't create pid file <$pid_file>: $!";
    print PID "$$\n";
    close PID;
}

SC->setids();

quit "Section <$confsection> not present in config file" unless 
    defined $config->{$confsection};

$service_name ||= option 'ServiceName', $SERVICE_NAME;

$service_title ||= option 'ServiceTitle', $SERVICE_TITLE;;
    
$spoll ||= option 'Spoll', $SPOLL;

$scan_period ||= option 'ScanPeriod', $SCAN_PERIOD;

if ($opt_version) {
    printversion();
    finish;
}

if ($iswin32) {
    if ($installing) {
	my $rc;
	if ($confname) {
	    $rc = GKS::Service::install_service($service_name,
					     $service_title,
					     qq[--service],
					     qq[--confname=$confname],
					     qq[--confsection=$confsection]);
	}
	else {
	    $rc = GKS::Service::install_service($service_name,
					     $service_title,
					     qq[--service],
					     qq[--confsection=$confsection]);
	}
	if ($rc) {
 	    quit("Error installing service <$service_name> ($service_title): ",
		 $rc);
         }
	else {
	    epr "Service <$service_name> ($service_title) installed";
	}
	finish;
    }

    if ($removing) {
	if (my $rc = GKS::Service::remove_service($service_name)) {
	    quit ("Error removing service <$service_name>: ",
		  $rc);
	}
	else {
	    epr "Service <$service_name> removed";
	}
	finish;
    }

    if ($run_as_service) {
	if (my $rc = GKS::Service::start_service()) {
	    quit "Can't start as service: $rc";
	}
	GKS::Service::register_service_callbacks(\&service_stopping,
						 \&service_pausing,
						 \&service_continuing);
    }
}

my $sysdate = $SC::db_now;

eval { daemon_body() };

if ($@) {
    quit $@;
}

finish;


END {
    GKS::Service::stop_service() if $run_as_service;
}


##### Daemon Body #####

sub daemon_body {
    $start_time = time;
    if ($run_as_service) {
	epr "Starting as a service";
    }
    elsif ($run_as_daemon) {
	epr "Starting as a daemon";
    }
    initialize();
    vvpr "Beginning main loop";
    for (;;) {
	scan_for_work();
	last if $onceonly;
	vvvpr "waiting for $scan_period seconds...";
	for (my $n = $scan_period; $n > 0; $n -= $spoll) {
	    spoll;
	    vvvpr "   waiting for spoll <$spoll>";
	    sleep $spoll;
	}
	vvvpr "Wait fell through";
	spoll;
    }
}


##### Notify Queueing Routines #####

sub dosubs {
    my ($str, $valno) = @_;
    
    my $sysdate = "'" . SC->time_to_ts . "'";
    $str =~ s/%SYSDATE%/$sysdate/g;
    $str =~ s/%VALNO%/$valno/g if defined $valno;
    return $str;
}


sub get_parm {
    my $name = shift;
    my $sth = $SQL{GET_PARM}->{STH};
    $sth->execute($name);
    my $p = $sth->fetchrow_arrayref;
    $sth->finish;
    return $p ? $p->[0] : undef;
}


sub get_timestamp {
    my ($shakemap_id, $shakemap_version) = @_;
    my $sth = $SQL{GET_TIMESTAMP}->{STH};
    $sth->execute($shakemap_id, $shakemap_version);
    my $p = $sth->fetchrow_arrayref;
    $sth->finish;
    return $p ? $p->[0] : undef;
}


sub get_grid_id {
    my $id = shift;
    my $sth = $SQL{GET_GRID_ID}->{STH};
    $sth->execute($id);
    my $p = $sth->fetchrow_arrayref;
    $sth->finish;
    return $p ? $p : undef;
}


sub initialize {
    initialize_sql();
}


sub initialize_sql {
    $dbh = SC->dbh;
    # dwb 2003-07-29 took this out because the DBI version we've been
    # using doesn't support it.
    #$dbh->{FetchHashKeyName} = 'NAME_uc';
    foreach my $k (keys %SQL) {
	$SQL{$k}->{STH} = $dbh->prepare($SQL{$k}->{SQL});
    }
	#$dbh->trace(1,'trace.log');
}


sub scan_for_events {
    my $n = 0;
    vvpr "scan for events";
    my $last_event_seq = nz(get_parm("LAST_EVENT_SEQ"));
    my $max_event_seq = $dbh->selectrow_array($SQL{GET_MAX_EVT_SEQ}->{STH});
    $max_event_seq = nz($max_event_seq);
    vvpr "last seq = $last_event_seq; max seq = $max_event_seq";
    if ($max_event_seq > $last_event_seq) {
	foreach my $k (@event_scans) {
	    vvpr "Scanning for user events...";
	    my $sth = $dbh->prepare(dosubs($$k));
	    my $nr = $sth->execute($last_event_seq);
	    $nr += 0;
	    vvpr "$nr row(s)";
	    $n += $nr;
	}
	
	my $user_profile = get_user_profile();
	foreach my $profile (@$user_profile) {
		vvpr "Scanning for profile $profile events...";
		foreach my $k (@event_scans_profile) {
			my $sth = $dbh->prepare(dosubs($$k));
			my $nr = $sth->execute($last_event_seq, $profile);
			$nr += 0;
			vvpr "$nr row(s)";
			$n += $nr;
		}
	}
	vvpr "total $n event notification(s) queued";
	set_parm('LAST_EVENT_SEQ', $max_event_seq); # also commits
    }
    else { vvpr "no new events" }
    return $n;
}


sub scan_for_grids {
    my $n = 0;
    vvpr "scan for grids (shaking and damage)";
    my $last_seq = nz(get_parm("LAST_GRID_SEQ"));
    my $max_seq = nz(scalar $dbh->
		     selectrow_array($SQL{GET_MAX_GRID_SEQ}->{STH}));
    vvpr "last grid seq = $last_seq; max seq = $max_seq";

	my $user_profile = get_user_profile();
    if ($max_seq > $last_seq) {
		my $sth = $SQL{GET_NEW_GRIDS}->{STH};
		$sth->execute($last_seq);
		while (my $r = $sth->fetchrow_hashref('NAME_uc')) {
			my $seq = $r->{GRID_ID};
			my $col = $r->{VALUE_COLUMN_NUMBER};
			my $metric = $r->{METRIC};
			my ($sql, $sth2, $nr);
			my $metric_sth = $SQL{GET_NOTIFICATION_REQUEST_METRIC}->{STH};
			$metric_sth->execute($metric);
			if ($metric_sth->fetchrow_array())
			{
				$sql = dosubs($SHAKE_BASE, $col);
		#	    epr "<<$sql>>";
				$sth2 = $dbh->prepare($sql);
				$nr = $sth2->execute($metric,
						   $r->{SHAKEMAP_ID},
						   $r->{SHAKEMAP_VERSION},
						   $seq);
				$nr += 0;
				vvpr "shake user: grid seq = $seq, metric = $metric, valno = $col: $nr row(s)";
				$n += $nr;

				foreach my $profile (@$user_profile) {
					$sql = dosubs($SHAKE_BASE_PROFILE, $col);
			#	    epr "<<$sql>>";
					$sth2 = $dbh->prepare($sql);
					$nr = $sth2->execute($profile, $metric,
							   $r->{SHAKEMAP_ID},
							   $r->{SHAKEMAP_VERSION},
							   $seq);
					$nr += 0;
					vvpr "shake profile $profile: grid seq = $seq, metric = $metric, valno = $col: $nr row(s)";
					$n += $nr;
				}
			}
			my $fragility_sth = $SQL{GET_FACILITY_FRAGILITY_METRIC}->{STH};
			$fragility_sth->execute($metric);
			if ($fragility_sth->fetchrow_array())
			{
				$sth2 = $dbh->prepare(dosubs($DAMAGE_BASE, $col));
				$nr = $sth2->execute($metric,
						$r->{SHAKEMAP_ID},
						$r->{SHAKEMAP_VERSION},
						$seq);
				$nr += 0;
				vvpr "damage user: grid seq = $seq, metric = $metric, valno = $col: $nr row(s)";
				$n += $nr;

				foreach my $profile (@$user_profile) {
					$sth2 = $dbh->prepare(dosubs($DAMAGE_BASE_PROFILE, $col));
					$nr = $sth2->execute($profile, $metric,
							$r->{SHAKEMAP_ID},
							$r->{SHAKEMAP_VERSION},
							$seq);
					$nr += 0;
					vvpr "damage profile $profile: grid seq = $seq, metric = $metric, valno = $col: $nr row(s)";
					$n += $nr;
				}
			}
		}
		vvpr "total $n grid notification(s) queued";
		set_parm('LAST_GRID_SEQ', $max_seq); # also commits
		for my $grd_seq ($last_seq+1 .. $max_seq) {
			my $event_p = get_grid_id($grd_seq);
			if ($event_p) {
				#my $rc = local_product($event_p->[0], $event_p->[1]);
				#vvpr "$event_p queued for local product" if ($rc == 0);
				#SC::Server->this_server->queue_request(
				#	'sc_pdf', $event_p->[0], $event_p->[1]);
				#SC->log(0,"SC PDF ".$event_p->[0]." - ".$event_p->[1]);
	
				#my $pdf_path = $config->{'RootDir'} . '/bin/sc_pdf.pl';
				#my $epi_path = $config->{'RootDir'} . '/bin/seis_plot_gm.pl';
				#my $fsh_path = $config->{'RootDir'} . '/bin/facility_shaking_history_plot.pl';
				#$rc = system "$perl $epi_path ". $event_p->[0]. ' '. $event_p->[1];
				#$rc = system "$perl $fsh_path ". $event_p->[0]. ' '. $event_p->[1];
				#$rc = system "$perl $pdf_path ". $event_p->[0]. ' '. $event_p->[1];
				#vvpr "$event_p queued for summary pdf" if ($rc == 0);
			}
			else {
				vvpr "no $event_p queued for local product";
			}
		}
    }
    else { vvpr "no new grids" }
    return $n;
}


sub scan_for_stations {
    my $n = 0;
    vvpr "scan for stations (substitute shaking and damage)";
    my $last_seq = nz(get_parm("LAST_STATION_SEQ"));
    my $max_seq = nz(scalar $dbh->
		     selectrow_array($SQL{GET_MAX_STATION_SEQ}->{STH}));
    vvpr "last station seq = $last_seq; max seq = $max_seq";
    if ($max_seq > $last_seq) {
	my $sth = $SQL{GET_NEW_STATIONS}->{STH};
	$sth->execute($last_seq);
#select s.shakemap_id, s.shakemap_version, g.grid_id, 
#     m.metric, m.value_column_number, ss.record_id, n.notification_id
	while (my $r = $sth->fetchrow_hashref('NAME_uc')) {
	    my $seq = $r->{RECORD_ID};
	    my $col = $r->{VALUE_COLUMN_NUMBER};
	    my $metric = $r->{METRIC};
	    my $sql = dosubs($STATION_BASE, $col);
#	    epr "<<$sql>>";
	    my $sth2 = $dbh->prepare($sql);
	    my $nr = $sth2->execute($r->{NOTIFICATION_ID}, $seq);
	    $nr += 0;
	    vvpr "station: seq = $seq, nid = ".$r->{NOTIFICATION_ID}." metric = $metric, valno = $col: $nr row(s)";
	    $n += $nr;
	}
	vvpr "total $n station notification(s) queued";
	set_parm('LAST_STATION_SEQ', $max_seq); # also commits
    } else { vvpr "no new stations" }
    return $n;
}


sub scan_for_systems {
    my $n = 0;
    vvpr "scan for systems";
    my $last_seq = nz(get_parm("LAST_SYSTEM_SEQ"));
    my $max_seq = $dbh->selectrow_array($SQL{GET_MAX_SYSTEM_SEQ}->{STH});
    $max_seq = nz($max_seq);
    vvpr "last station seq = $last_seq; max seq = $max_seq";
    if ($max_seq > $last_seq) {
	foreach my $k (@system_scans) {
	    vvpr "Scanning for user system notifications...";
	    my $sth = $dbh->prepare(dosubs($$k));
	    my $nr = $sth->execute($last_seq);
	    $nr += 0;
	    vvpr "$nr row(s)";
	    $n += $nr;
		
		foreach my $k (@system_scans_profile) {
			vvpr "Scanning for system profile notifications...";
			my $sth = $dbh->prepare(dosubs($$k));
			my $nr = $sth->execute($last_seq);
			$nr += 0;
			vvpr "$nr row(s)";
			$n += $nr;
		}
	}
	
	vvpr "total $n system notification(s) queued";
	set_parm('LAST_SYSTEM_SEQ', $max_seq); # also commits
    }
    else { vvpr "no new system notification" }
    return $n;
}


sub scan_for_products {
    my $n = 0;
    vvpr "scan for products";
    my $last_product_seq = nz(get_parm("LAST_PRODUCT_SEQ"));
#    epr "<<$SQL{GET_MAX_PROD_SEQ}->{SQL}>>";
    my $max_product_seq = $dbh->selectrow_array($SQL{GET_MAX_PROD_SEQ}->{STH});
    $max_product_seq = nz($max_product_seq);
    vvpr "last seq = $last_product_seq; max seq = $max_product_seq";
    if ($max_product_seq > $last_product_seq) {
	my $upd_profile = $SQL{UPD_PROFILE_PRODUCT_EMAIL}->{STH};
	my $user_profile = get_user_profile();
	for (my $product_id = $last_product_seq + 1; $product_id <= $max_product_seq; $product_id++) {
		my $product_sth = $SQL{GET_NOTIFICATION_REQUEST_PRODUCT}->{STH};
		$product_sth->execute($product_id);
		if ($product_sth->fetchrow_array()) {
			foreach my $k (@product_scans) {
				vvpr "Scanning for user products...";
				my $sth = $dbh->prepare(dosubs($$k));
				my $nr = $sth->execute($product_id);
				$nr += 0;
				vvpr "$nr row(s)";
				$n += $nr;
			}
		}
		
		$product_sth = $SQL{GET_NOTIFICATION_REQUEST_PRODUCT_PROFILE}->{STH};
		$product_sth->execute($product_id);
		next unless ($product_sth->fetchrow_array());
		foreach my $profile (@$user_profile) {
			vvpr "Scanning for profile $profile products $product_id ...";
			foreach my $k (@product_scans_profile) {
				my $sth = $dbh->prepare(dosubs($$k));
				my $nr = $sth->execute($product_id, $profile);
				$nr += 0;
				vvpr "$nr row(s)";
				$n += $nr;
			}
		}
	}
	vvpr "total $n product notification(s) queued";
    }
    else { vvpr "no new products" }
	set_parm('LAST_PRODUCT_SEQ', $max_product_seq); # also commits
    return $n;
}


sub scan_for_work {
    my $n = 0;

    $n += scan_for_events();
    $n += scan_for_products();
    $n += scan_for_grids();
    #$n += scan_for_stations();
    $n += scan_for_systems();
    vvpr "$n total request(s) queued";
}


sub set_parm {
    my ($name, $value, $nocommit) = @_;
    my $sth = $SQL{UPDATE_PARM}->{STH};
    $sth->execute($value, $name);
    unless ($sth->rows) {
	$SQL{INSERT_PARM}->{STH}->execute($name, $value);
    }
    $dbh->commit unless $nocommit;
}

sub get_user_profile {
	my @user_profile;
    my $sth_user_profile = $SQL{GET_USER_PROFILE}->{STH};
	$sth_user_profile->execute();
	while (my $profile = scalar $sth_user_profile->fetchrow_array()) {
		push @user_profile, $profile;
	}
	return \@user_profile;
}

sub local_product {
    my ($shakemap_id, $shakemap_version) = @_;

	my $sth_lookup_shakemap_metric = SC->dbh->prepare(qq{
    select metric, value_column_number
      from shakemap_metric
     where shakemap_id = ? and shakemap_version = ?
	  and value_column_number IS NOT NULL});

	my $temp_dir = $config->{'TemplateDir'} . '/xml';
    return -1 unless (-d $temp_dir);

	my $timestamp = get_timestamp($shakemap_id, $shakemap_version);
	$timestamp =~ s/\s+/T/;
	$timestamp =~ s/\s*$/Z/;
	my ($data_dir, $grid_file, $shakemap_file, $event_file);
	
	if ($shakemap_id =~ /_scte$/) {
		my $test_data_dir = $config->{'RootDir'}."/test_data/$shakemap_id";
		$data_dir = $config->{'DataRoot'}."/$shakemap_id-$shakemap_version";
		$grid_file = $data_dir."/grid.xml";
		$shakemap_file = $test_data_dir."/shakemap_template.xml";
		$event_file = $test_data_dir."/event_template.xml";
	} else {
		$data_dir = $config->{'DataRoot'}."/$shakemap_id-$shakemap_version";
		$grid_file = $data_dir."/grid.xml";
		$shakemap_file = $data_dir."/shakemap.xml";
		$event_file = $data_dir."/event.xml";
	}	

	if (! -e $shakemap_file) {
		vvpr "ShakeCast not processed for event $shakemap_id";
		return -1;
	}
	
	my $xsl = XML::Simple->new();
	$shakemap_xml = $xsl->XMLin($shakemap_file);
	$event_xml = $xsl->XMLin($event_file);
	if (-e $grid_file) {
		my $parser = new XML::Parser;
		$parser->setHandlers(      Start => \&startElement,
												 End => \&endElement,
												 Char => \&characterData,
												 Default => \&default);
		$parser->parsefile($grid_file);
		#$grid_xml = $xsl->XMLin($grid_file);
		$shakemap_xml->{'shakemap_originator'} = 'sc' if ($shakemap_xml->{'shakemap_originator'} eq 'ci');
		$shakemap_xml->{'shakemap_originator'} = 'global' if ($shakemap_xml->{'shakemap_originator'} eq 'us');
	}

	my $tt = Template->new(INCLUDE_PATH => $config->{'TemplateDir'}."/xml/", OUTPUT_PATH => $data_dir);
	my $shakecast = {};
	$shakecast->{'code_version'} = "ShakeCast 1.0";
	$shakecast->{'process_timestamp'} = $timestamp;

	my (@exposure, @items, %exposure, %metrics);
	$sth_lookup_shakemap_metric->execute($shakemap_id, $shakemap_version);
	my $sql_metric;
	while (my @row = $sth_lookup_shakemap_metric->fetchrow_array) {
		$sql_metric .= ', fs.value_'.$row[1].' as '.uc($row[0]);
		$metrics{uc($row[0])} = $row[1];
		
	}

    foreach my $metric_unit (keys %metrics) {
	my $sql = "select ff.damage_level, f.facility_id, f.facility_type, 
		f.external_facility_id, f.facility_name, f.short_name,
		f.description, f.lat_min, f.lon_min,
		ff.low_limit, ff.high_limit, fs.dist
		$sql_metric
      from ((((facility f 
	  inner join facility_shaking fs on f.facility_id = fs.facility_id)
	  inner join grid g on g.grid_id = fs.grid_id)
	  inner join shakemap s on g.shakemap_id = s.shakemap_id
		and g.shakemap_version = s.shakemap_version)
	  inner join facility_fragility ff on fs.facility_id = ff.facility_id and 
			ff.metric = '".$metric_unit."' and
			fs.value_".$metrics{$metric_unit}." between ff.low_limit and ff.high_limit)
     where s.event_id = '$shakemap_id' and g.shakemap_version = $shakemap_version";
	my $sth = SC->dbh->prepare($sql);
	 
    $sth->execute() || vvpr "couldn't execute sql $metric_unit\n";
	while (my $hash_ref =  $sth->fetchrow_hashref) {
		my $item;
		my $facility_type = $hash_ref->{'facility_type'};
		my $facility_name = encode_entities($hash_ref->{'facility_name'});
		my $lat_min = $hash_ref->{'lat_min'};
		my $lon_min = $hash_ref->{'lon_min'};
		my $damage_level = $hash_ref->{'damage_level'};
		my $dist = $hash_ref->{'dist'};
		my $mmi = $hash_ref->{'MMI'};
		my $pga = $hash_ref->{'PGA'};
		my $pgv = $hash_ref->{'PGV'};
		my $psa03 = (defined $hash_ref->{'PSA03'}) ? $hash_ref->{'PSA03'} : 'NA';
		my $psa10 = (defined $hash_ref->{'PSA10'}) ? $hash_ref->{'PSA10'} : 'NA';
		my $psa30 = (defined $hash_ref->{'PSA30'}) ? $hash_ref->{'PSA30'} : 'NA';
		my $sdpga = (defined $hash_ref->{'SDPGA'}) ? $hash_ref->{'SDPGA'} : 'NA';
		my $svel = (defined $hash_ref->{'SVEL'}) ? $hash_ref->{'SVEL'} : 'NA';

		my $capital = 'no';
		if ($facility_type =~ /CAPITAL/) {
			$capital = 'yes';
			$facility_type = 'CITY';
		}
		
		my ($city, $pop, $unit);
		if ($facility_name =~ /pop\./) {
			($city, $pop, $unit) = $facility_name
			   =~ /^(.*)\s+\(pop\. [\<\s]*([\d\.]+)([KM])\)/;
			   
			if (defined $unit) {
				$pop = ($unit eq 'M') ? $pop * 1000000 : $pop;
				$pop = ($unit eq 'K') ? $pop * 1000 : $pop;
			}
		} else {
			$city = $facility_name;
		}
		$item = { "name"	=>	$city,
				"population"	=>	$pop,
				"facility_id"	=>	$hash_ref->{'facility_id'},
				"facility_name"	=>	$hash_ref->{'facility_name'},
				"external_facility_id"	=>	$hash_ref->{'external_facility_id'},
				"short_name"	=>	$hash_ref->{'short_name'},
				"description"	=>	$hash_ref->{'description'},
				"metric"	=>	$metric_unit,
				"low_limit"	=>	$hash_ref->{'low_limit'},
				"high_limit"	=>	$hash_ref->{'high_limit'},
				"latitude"	=>	$lat_min,
				"longitude"	=>	$lon_min,
				"capital"	=>	$capital,
				"damage_level"		=>	$damage_level,
				"DIST"		=>	$dist,
				"MMI"		=>	$mmi,
				"PGA"		=>	$pga,
				"PGV"		=>	$pgv,
				"PSA03"		=>	$psa03,
				"PSA10"		=>	$psa10,
				"PSA30"		=>	$psa30,
				"SDPGA"		=>	$sdpga,
				"SVEL"		=>	$svel
				};
		push @{$exposure{$facility_type}}, $item;
	}
	}
	foreach my $type (keys %exposure) {
		my %exposures;
		$exposures{'type'} = $type;
		$exposures{'item'} = $exposure{$type};
		push @{$shakecast->{'exposure'}},  \%exposures;
	}
	

    opendir TEMPDIR, $temp_dir or return (-1);
    # exclude .* files
    my @files = grep !/^\./, readdir TEMPDIR;
    # exclude non-directories
	my $prog = $config->{'RootDir'} . '/bin/template.pl -event '. $shakemap_id;
	my $n = 0;
	my $rc;
    foreach my $file (@files) {
        if ($file =~ m#([^/\\]+)\.tt$#) {     # last component only
			my $temp_file = $1.".tt";
			my $output_file = $1;
			$output_file =~ s/_/\./;
			$rc = $tt->process($temp_file, { shakemap => $shakemap_xml, grid_metric => $grid_metric, 
				shakecast => $shakecast, grid_spec => $grid_spec, event => $event_xml }, $output_file);
			if ($rc == 1) {
				# success
				$rc = 1;
				$n++;
				sm_inject($shakemap_id, $shakemap_version, $output_file);
			} elsif ($rc & 0xff) {
				# permanent failure if script signalled
				$rc = -1;
			} else {
				# temporary failure if script returned non-zero
				$rc = 0;
			}
		}
    }
	
	vvpr "total $n local product generated.";

    return $rc;
}

# returns a list of all products that should be polled for new events, etc.
sub sm_inject {
	my ($evid, $version, $product) = @_;
	
    undef $SC::errstr;
	my $sc_dir = $config->{'RootDir'};
    eval {
		use IO::File;
		use XML::Writer;
		my $sth = SC->dbh->prepare(qq/
			select product_type, filename
			  from product_type
			  where filename = ?/);
		$sth->execute($product);
		if (my @p = $sth->fetchrow_array()) {
		
			my $ofile = "$sc_dir/data/$evid-$version/local_product.xml";
			print "$ofile\n";
			my $fh;
			unless ($fh = new IO::File "> $ofile") {
				SC->log(0, "Can't write <$product>: $!");
				exit -1;
			}
		
			my $writer = new XML::Writer(OUTPUT => \*$fh, NEWLINES => 0);

			$writer->emptyTag("product",
					  "shakemap_id"          => $evid, 
					  "shakemap_version"     => $version, 
					  "product_type"         => $p[0],
					  "product_status"       => $shakemap_xml->{'map_status'},
					  "generating_server"    => "1",
					  "generation_timestamp" => _ts($shakemap_xml->{'process_timestamp'}),
					  "lat_min"              => $grid_spec->{'lat_min'},
					  "lat_max"              => $grid_spec->{'lat_max'},
					  "lon_min"              => $grid_spec->{'lon_min'},
					  "lon_max"              => $grid_spec->{'lon_max'});
			$writer->end();
			$fh->close;

			my $command = "$perl $sc_dir/bin/sm_inject.pl "
			   . "--verbose --conf $sc_dir/conf/sc.conf "
				 . "$ofile";
				 print "$command\n";
			my $result = `$command`;
			SC->log(0,  "Error in sm_new_product ($product): '$result'") 
					if ($result !~ /STATUS=SUCCESS/);

		}
		
   };
    return 1;

}

sub _ts {
	my ($ts) = @_;
	if ($ts =~ /[\:\-]/) {
		$ts =~ s/[a-zA-Z]/ /g;
		$ts =~ s/\s+$//g;
		$ts = time_to_ts(ts_to_time($ts));
	} else {
		$ts = time_to_ts($ts);
	}
	return ($ts);
}

sub time_to_ts {
    my $time = (@_ ? shift : time);
    my ($sec, $min, $hr, $mday, $mon, $yr);
    if (SC->config->{board_timezone} > 0) {
		($sec, $min, $hr, $mday, $mon, $yr) = localtime $time;
	} else {
		($sec, $min, $hr, $mday, $mon, $yr) = gmtime $time;
	}
    sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
	     $yr+1900, $mon+1, $mday,
	     $hr, $min, $sec);
}

sub ts_to_time {
    my ($time_str) = @_;
	
	use Time::Local;
	my %months = ('jan' => 0, 'feb' =>1, 'mar' => 2, 'apr' => 3, 'may' => 4, 'jun' => 5,
		'jul' => 6, 'aug' => 7, 'sep' => 8, 'oct' => 9, 'nov' => 10, 'dec' => 11);
	my ($mday, $mon, $yr, $hr, $min, $sec);
	my $timegm;
	
	print "$time_str\n";
	if ($time_str =~ /[a-zA-Z]+/) {
		# <pubDate>Tue, 04 Mar 2008 20:57:43 +0000</pubDate>
		($mday, $mon, $yr, $hr, $min, $sec) = $time_str 
			=~ /(\d+)\s+(\w+)\s+(\d+)\s+(\d+)\:(\d+)\:(\d+)\s+/;
		$timegm = timegm($sec, $min, $hr, $mday, $months{lc($mon)}, $yr-1900);
	} else {
		#2008-10-04 20:57:43
		($yr, $mon, $mday, $hr, $min, $sec) = $time_str 
			=~ /(\d+)\-(\d+)\-(\d+)\s+(\d+)\:(\d+)\:(\d+)/;
	   
		$timegm = timegm($sec, $min, $hr, $mday, $mon-1, $yr-1900);
	}
    
	return ($timegm);
}

my ($count, $tag);
sub startElement {

      my( $parseinst, $element, %attrs ) = @_;
        SWITCH: {
                if ($element eq "shakemap_grid") {
                        $count++;
                        $tag = "shakemap_grid";
                        #print "shakemap_grid $count:\n";
						foreach my $key (keys %attrs) {
							$shakemap_xml->{$key} = $attrs{$key};
							#print $key,": ", $shakemap_xml->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "event") {
                        $count++;
                        $tag = "event";
                        #print "event $count:\n";
						foreach my $key (keys %attrs) {
							$event_xml->{$key} = $attrs{$key};
							#print $key,": ", $event_xml->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_specification") {
                        $count++;
                        $tag = "grid_specification";
                        #print "grid_specification $count:\n";
						foreach my $key (keys %attrs) {
							$grid_spec->{$key} = $attrs{$key};
							#print $key,": ", $grid_spec->{$key}, "\n";
						}
						last SWITCH;
                }
                if ($element eq "grid_field") {
                        #print "grid_field: $count:\n";
                        $tag = "grid_field";
						$grid_metric->{$attrs{'name'}} = $attrs{'index'};
						#print $attrs{'index'},": ", $attrs{'name'}, "\n";
						last SWITCH;
                }
                if ($element eq "grid_data") {
                        #print "grid_data: ";
                        $tag = "grid_data";
                        last SWITCH;
                }
        }

 }

sub endElement {

      my( $parseinst, $element ) = @_;

 }

sub characterData {

      my( $parseinst, $data ) = @_;

 }

sub default {

      my( $parseinst, $data ) = @_;
        # do nothing, but stay quiet

 }
 

##### Support Routines #####

sub epr {
    SC->log(0, @_);
}


sub error {
    SC->error(@_);
}


sub finish {
    my $rc = shift;

    $rc ||= 0;
    epr "End $pname.  RC = $rc";
    if ($rc > 0) {
	kill 9, $$;
    } else {
	exit $rc;
    }
}


sub help {
    printversion();
    print <<__EOF__;

Notify Queueing Daemon

Usage: $pname [options...]
    --help              print this help text and exit.
    --version           print version information and exit.
    --msglevel=n        logging level.
    --[no]onceonly      do one process loop and exit.
    --confname=s        name of config file if not default.
    --confsection=s     name of config section if not default.
    --facility=s        facility name for logging if not prog name.
    --verbose           use msglevel=1 (see --msglevel).
    --install           install this daemon as a service.
    --remove            remove this daemon as a service.
    --scanperiod=n      scan for work after this many sec unless poked
    --service           run as a service (usually supplied automatically).
    --spoll=n           seconds for service poll.
    --sname=name        service name.
    --stitle=title      service title for display.

    Option names may be uniquely abbreviated and are case insensitive.
    You may use either --option or -option. If -option, then use
    "-option n" in place of "--option=n".
__EOF__
    exit;
}


sub nz {
    $_[0] ? $_[0] : 0;
}


sub option {
    my $v = $config->{$confsection}->{$_[0]};
    return defined($v) ? $v : $_[1];
}


sub printversion {
    print "Program: $pname\nVersion: $VERSION\n";
    print "RCS ID : " . substr($RCSID, 5) . "\n";
}


sub service_continuing {
    epr "service continuing";
}


sub service_pausing {
    epr "service pausing";
}


sub service_stopping {
    epr "service stopping";
}


sub spoll {
    GKS::Service::poll_service() if $run_as_service;
}


sub vpr {
    SC->log(1,  @_);
}


sub vvpr {
    SC->log(2,  @_);
}


sub vvvpr {
    SC->log(3,  @_);
}


sub quit {
    epr "QUIT:", @_;
    finish(1);
}


#####











