#!/usr/local/bin/perl

#
### notify: Scan the Notification Queue and Deliver Messages
#
# $Id: notify.pl 459 2008-08-25 14:45:09Z klin $
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

my $VERSION = 'notify 0.2.21 2004-09-13 23:00Z';
my $RCSID = '@(#) $Id: notify.pl 459 2008-08-25 14:45:09Z klin $ ';

use FindBin;
use lib "$FindBin::Bin/../lib";

use Data::Dumper;

use Getopt::Long;

use Time::Local;

use POSIX;

use Digest::MD5 qw(md5_hex);

BEGIN {
    require GKS::Service if $^O eq 'MSWin32';
}

use Carp;

use File::Spec;
use File::Temp "tempfile";

use SC;

#use Net::SMTP;

#
##### Primary Configuration #####
#

my $CONFNAME = undef;

my $CONFSECTION = 'Notify';

#
##### Last Resort Defintions if Not in Config File #####
#

my $SERVICE_NAME = 'notify';

my $SERVICE_TITLE = 'Send Notifications';

my $LOG_LEVEL = undef;        # undef to use global config unless in local
                # config or parameter

my $SPOLL = 10;

my $SCAN_PERIOD = 60;

my @RETRY_FALLBACK = (60, 60, 120, 120, 300, 600);

##### (End of Configuration Sections) #####


##### SQL #####

my %SQL =
    ( EVENTS => { SQL => <<__SQL__ },
SELECT e.event_id,
       e.event_version,
       e.event_status,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       e.external_event_id,
	   s.shakemap_id,
	   s.shakemap_version,
       n.notification_id,
       n.tries,
       n.delivery_status,
       n.shakecast_user,
       d.delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
	   r.product_type,
	   pt.filename,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,     
        f.lon_min AS facility_lon,  
       r.aggregate
  FROM (((((((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
        r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
       t.notification_type)
    INNER JOIN event e ON n.event_id = e.event_id AND n.event_version =
      e.event_version)
    INNER JOIN user_delivery_method d ON r.shakecast_user =
     d.shakecast_user AND r.delivery_method = d.delivery_method)
    LEFT JOIN facility f ON n.facility_id = f.facility_id)
    LEFT JOIN product_type pt ON r.product_type = pt.product_type)
	LEFT JOIN shakemap s ON s.event_id = e.event_id)
 WHERE n.shakecast_user = ? AND t.notification_class = 'EVENT'
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND (d.actkey IS NULL OR d.actkey = '')
 ORDER BY n.shakecast_user, r. delivery_method, d.delivery_address,
      r.aggregation_group, r.aggregate, n.notification_id
__SQL__
      PRODUCTS => { SQL => <<__SQL__ },
SELECT p.product_id,
       p.product_type,
       pt.name,
       pt.description,
       pt.filename,
       p.generation_timestamp,
       p.product_status,
       e.event_id,
       e.event_version,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       s.shakemap_id,
       s.shakemap_version,
       n.notification_id,
       n.tries,
       n.shakecast_user,
       n.delivery_status,
       d.delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,     
        f.lon_min AS facility_lon,  
       r.aggregate
  FROM ((((((((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
           r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
          t.notification_type)
    INNER JOIN product p ON n.product_id = p.product_id)
    INNER JOIN shakemap s ON p.shakemap_id = s.shakemap_id AND
        p.shakemap_version = s.shakemap_version)
    INNER JOIN event e ON s.event_id = e.event_id)
    INNER JOIN product_type pt ON p.product_type = pt.product_type)
    INNER JOIN user_delivery_method d ON r.shakecast_user =
     d.shakecast_user AND r.delivery_method = d.delivery_method)
    LEFT JOIN facility f ON n.facility_id = f.facility_id)
 WHERE n.shakecast_user = ? AND t.notification_class = 'PRODUCT'
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND (d.actkey IS NULL OR d.actkey = '')
   AND e.superceded_timestamp IS NULL
 ORDER BY n.shakecast_user, r. delivery_method, d.delivery_address,
      r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      GRIDS => { SQL => <<__SQL__ },
SELECT s.shakemap_id,
       s.shakemap_version,
       s.shakemap_region,
       s.generation_timestamp,
       e.event_id,
       e.event_version,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       n.notification_id,
       n.tries,
       n.shakecast_user,
       n.delivery_status,
       n.metric,
       n.grid_value,
       d.delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
	   r.product_type,
	   pt.filename,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,     
        f.lon_min AS facility_lon,  
        g.lat_min AS bound_south,   
        g.lat_max AS bound_north,   
        g.lon_min AS bound_west,    
        g.lon_max AS bound_east,    
       r.aggregate
  FROM ((((((((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
           r.notification_request_id and n.metric = r.metric)
    INNER JOIN notification_type t ON r.notification_type =
          t.notification_type)
    INNER JOIN grid g ON n.grid_id = g.grid_id)
    INNER JOIN shakemap s ON g.shakemap_id = s.shakemap_id AND
        g.shakemap_version = s.shakemap_version)
    INNER JOIN event e ON s.event_id = e.event_id)
    INNER JOIN user_delivery_method d ON r.shakecast_user =
      d.shakecast_user AND r.delivery_method = d.delivery_method)
    LEFT JOIN facility f ON n.facility_id = f.facility_id)
    LEFT JOIN product_type pt ON r.product_type = pt.product_type)
   WHERE n.shakecast_user = ? AND t.notification_class = 'GRID'
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND (d.actkey IS NULL OR d.actkey = '')
   AND e.superceded_timestamp IS NULL
 ORDER BY n.shakecast_user, r. delivery_method, d.delivery_address,
      r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      DAMAGE => { SQL => <<__SQL__ },
SELECT s.shakemap_id,
       s.shakemap_version,
       s.shakemap_region,
       s.generation_timestamp,
       e.event_id,
       e.event_version,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       n.notification_id,
       n.tries,
       n.shakecast_user,
       n.delivery_status,
       n.metric,
       n.grid_value,
       dl.damage_level,
       dl.name AS damage_level_name,
       dl.is_max_severity,
       dl.severity_rank,
       ff.low_limit,
       ff.high_limit,
       d.delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
	   r.product_type,
	   pt.filename,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,     
        f.lon_min AS facility_lon,  
        g.lat_min AS bound_south,   
        g.lat_max AS bound_north,   
        g.lon_min AS bound_west,    
        g.lon_max AS bound_east,    
       r.aggregate
  FROM ((((((((((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
           r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
          t.notification_type)
    INNER JOIN grid g ON n.grid_id = g.grid_id)
    INNER JOIN shakemap s ON g.shakemap_id = s.shakemap_id AND
        g.shakemap_version = s.shakemap_version)
    INNER JOIN event e ON s.event_id = e.event_id)
    INNER JOIN user_delivery_method d ON r.shakecast_user =
      d.shakecast_user AND r.delivery_method = d.delivery_method)
    INNER JOIN damage_level dl ON r.damage_level = dl.damage_level)
    INNER JOIN facility f ON n.facility_id = f.facility_id)
    INNER JOIN facility_fragility ff ON n.facility_id = ff.facility_id AND
    dl.damage_level = ff.damage_level)
    LEFT JOIN product_type pt ON r.product_type = pt.product_type)
   WHERE n.shakecast_user = ? AND t.notification_class = 'GRID'
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND (d.actkey IS NULL OR d.actkey = '')
   AND e.superceded_timestamp IS NULL
 ORDER BY n.shakecast_user, r. delivery_method, d.delivery_address,
      r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      SYSTEM => { SQL => <<__SQL__ },
SELECT l.log_message_id,
        l.log_message_type,
        l.server_id,
        l.description,
        l.receive_timestamp,
       n.notification_id,
       n.tries,
       n.delivery_status,
       n.shakecast_user,
       d.delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
       r.aggregate,
       r.aggregation_group,
       t.notification_attempts AS max_tries
  FROM ((((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
        r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
       t.notification_type)
    INNER JOIN log_message l ON l.log_message_id =
       n.event_version)
    INNER JOIN user_delivery_method d ON r.shakecast_user =
     d.shakecast_user AND r.delivery_method = d.delivery_method)
 WHERE n.shakecast_user = ? AND t.notification_class = 'SYSTEM'
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND (d.actkey IS NULL OR d.actkey = '')
 ORDER BY n.shakecast_user, r.delivery_method, d.delivery_address,
      r.aggregation_group, r.aggregate, n.notification_id
__SQL__

        EVENTS_PROFILE => { SQL => <<__SQL__ },
SELECT e.event_id,
       e.event_version,
       e.event_status,
       e.event_type,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       e.external_event_id,
	   s.shakemap_id,
	   s.shakemap_version,
       n.notification_id,
       n.tries,
       n.delivery_status,
       n.shakecast_user,
       ? as delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
	   r.product_type,
	   pt.filename,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,    
        f.lon_min AS facility_lon, 
       r.aggregate
  FROM ((((((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
        r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
       t.notification_type)
    INNER JOIN event e ON n.event_id = e.event_id AND n.event_version =
      e.event_version)
    LEFT JOIN facility f ON n.facility_id = f.facility_id)
    LEFT JOIN product_type pt ON r.product_type = pt.product_type)
	LEFT JOIN shakemap s ON s.event_id = e.event_id)
 WHERE n.shakecast_user = ? AND t.notification_class = 'EVENT'
   AND r.notification_type = ?
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
 ORDER BY n.shakecast_user, r.delivery_method, r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      PRODUCTS_PROFILE => { SQL => <<__SQL__ },
SELECT p.product_id,
       p.product_type,
       pt.name,
       pt.description,
       pt.filename,
       p.generation_timestamp,
       p.product_status,
       e.event_id,
       e.event_version,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       s.shakemap_id,
       s.shakemap_version,
       n.notification_id,
       n.tries,
       n.shakecast_user,
       n.delivery_status,
       ? as delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,    
        f.lon_min AS facility_lon, 
       r.aggregate
  FROM (((((((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
           r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
          t.notification_type)
    INNER JOIN product p ON n.product_id = p.product_id)
    INNER JOIN shakemap s ON p.shakemap_id = s.shakemap_id AND
        p.shakemap_version = s.shakemap_version)
    INNER JOIN event e ON s.event_id = e.event_id)
    INNER JOIN product_type pt ON p.product_type = pt.product_type)
    LEFT JOIN facility f ON n.facility_id = f.facility_id)
 WHERE n.shakecast_user = ? AND t.notification_class = 'PRODUCT'
   AND r.notification_type = ?
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND e.superceded_timestamp IS NULL
 ORDER BY n.shakecast_user, r.delivery_method, r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      GRIDS_PROFILE => { SQL => <<__SQL__ },
SELECT s.shakemap_id,
       s.shakemap_version,
       s.shakemap_region,
       s.generation_timestamp,
       e.event_id,
       e.event_version,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       n.notification_id,
       n.tries,
       n.shakecast_user,
       n.delivery_status,
       n.metric,
       n.grid_value,
       ? as delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
	   r.product_type,
	   pt.filename,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,    
        f.lon_min AS facility_lon, 
        g.lat_min AS bound_south,  
        g.lat_max AS bound_north,  
        g.lon_min AS bound_west,   
        g.lon_max AS bound_east,   
       r.aggregate
  FROM (((((((notification n
    INNER JOIN notification_request r ON
         n.notification_request_id = r.notification_request_id AND n.metric = r.metric)
    INNER JOIN notification_type t ON r.notification_type =
          t.notification_type)
    INNER JOIN grid g ON n.grid_id = g.grid_id)
    INNER JOIN shakemap s ON g.shakemap_id = s.shakemap_id AND
        g.shakemap_version = s.shakemap_version)
    INNER JOIN event e ON s.event_id = e.event_id)
    LEFT JOIN facility f ON n.facility_id = f.facility_id)
    LEFT JOIN product_type pt ON r.product_type = pt.product_type)
   WHERE n.shakecast_user = ? AND t.notification_class = 'GRID'
   AND r.notification_type = ?
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND e.superceded_timestamp IS NULL
 ORDER BY n.shakecast_user, r.delivery_method, r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      DAMAGE_PROFILE => { SQL => <<__SQL__ },
SELECT s.shakemap_id,
       s.shakemap_version,
       s.shakemap_region,
       s.generation_timestamp,
       e.event_id,
       e.event_version,
       e.event_name,
       e.magnitude,
       e.event_location_description,
       e.event_timestamp,
       e.lat,
       e.lon,
       n.notification_id,
       n.tries,
       n.shakecast_user,
       n.delivery_status,
       n.metric,
       n.grid_value,
       dl.damage_level,
       dl.name AS damage_level_name,
       dl.is_max_severity,
       dl.severity_rank,
       ff.low_limit,
       ff.high_limit,
       ? as delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
	   r.product_type,
	   pt.filename,
       r.aggregation_group,
       t.notification_attempts AS max_tries,
       n.facility_id,
       f.facility_type,
       f.external_facility_id,
       f.facility_name,
       f.short_name,
       f.description,
        f.lat_min AS facility_lat,    
        f.lon_min AS facility_lon, 
        g.lat_min AS bound_south,  
        g.lat_max AS bound_north, 
        g.lon_min AS bound_west,   
        g.lon_max AS bound_east,   
       r.aggregate
  FROM (((((((((notification n
    INNER JOIN notification_request r ON n.notification_request_id = r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
          t.notification_type)
    INNER JOIN grid g ON n.grid_id = g.grid_id)
    INNER JOIN shakemap s ON g.shakemap_id = s.shakemap_id AND
        g.shakemap_version = s.shakemap_version)
    INNER JOIN event e ON s.event_id = e.event_id)
    INNER JOIN damage_level dl ON r.damage_level = dl.damage_level)
    INNER JOIN facility f ON n.facility_id = f.facility_id)
    INNER JOIN facility_fragility ff ON n.facility_id = ff.facility_id AND
    dl.damage_level = ff.damage_level)
    LEFT JOIN product_type pt ON r.product_type = pt.product_type)
   WHERE n.shakecast_user = ? AND t.notification_class = 'GRID'
   AND r.notification_type = ?
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
   AND e.superceded_timestamp IS NULL
 ORDER BY n.shakecast_user, r.delivery_method, r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      SYSTEM_PROFILE => { SQL => <<__SQL__ },
SELECT l.log_message_id,
        l.log_message_type,
        l.server_id,
        l.description,
        l.receive_timestamp,
       n.notification_id,
       n.tries,
       n.delivery_status,
       n.shakecast_user,
       ? as delivery_address,
       r.delivery_method,
       r.notification_type,
       r.message_format,
       r.limit_value,
       r.aggregate,
       r.aggregation_group,
       t.notification_attempts AS max_tries
  FROM (((notification n
    INNER JOIN notification_request r ON n.notification_request_id =
        r.notification_request_id)
    INNER JOIN notification_type t ON r.notification_type =
       t.notification_type)
    INNER JOIN log_message l ON l.log_message_id =
       n.event_version)
 WHERE n.shakecast_user = ? AND t.notification_class = 'SYSTEM'
   AND r.notification_type = ?
   AND n.delivery_status IN ('PENDING', 'ERRORS')
   AND (n.next_delivery_timestamp IS NULL OR n.next_delivery_timestamp >= ?)
 ORDER BY n.shakecast_user, r.delivery_method, r.aggregation_group, r.aggregate, n.notification_id
__SQL__

      UPD_NOTIFY_SUCCESS => { SQL => <<__SQL__ },
UPDATE notification SET delivery_status = ?, delivery_timestamp = ?, tries = ?,
      delivery_comment = ?
      WHERE notification_id = ?
__SQL__
      UPD_NOTIFY_FAIL => { SQL => <<__SQL__ },
UPDATE notification set delivery_status = ?, delivery_attempt_timestamp = ?,
      next_delivery_timestamp = ?, tries = ?, delivery_comment = ?
      WHERE notification_id = ?
__SQL__
      SELECT_SERVER_INFO => { SQL => <<__SQL__ },
SELECT server_id, dns_address FROM server WHERE self_flag = 1
__SQL__
      SELECT_FACILITY_ATTRIBUTE => { SQL => <<__SQL__ },
SELECT attribute_name, attribute_value FROM facility_attribute WHERE facility_id = ?
__SQL__
      SELECT_FACILITY_FEATURE => { SQL => <<__SQL__ },
SELECT geom_type, geom FROM facility_feature WHERE facility_id = ?
__SQL__
      SELECT_TEMPLATE => { SQL => <<__SQL__ },
SELECT file_name FROM message_format WHERE message_format = ?
__SQL__
      SELECT_NOTIFICATION_USER => { SQL => <<__SQL__ },
SELECT distinct su.shakecast_user 
FROM notification_request nr 
	inner join shakecast_user su on
	nr.shakecast_user = su.shakecast_user
    where nr.notification_type = ?
	and su.user_type <> "GROUP"
__SQL__
      SELECT_NOTIFICATION_PROFILE_USER => { SQL => <<__SQL__ },
SELECT nr.shakecast_user as profile_id,
	group_concat(distinct udm.delivery_address) as delivery_address
FROM notification_request nr 
  inner join geometry_user_profile gur on
  nr.shakecast_user = gur.profile_id 
  inner join user_delivery_method udm on
  gur.shakecast_user = udm.shakecast_user
 and nr.delivery_method  = udm.delivery_method
    where nr.notification_type = ?
	group by nr.shakecast_user
__SQL__
      );

my @notify_scans = qw(EVENTS PRODUCTS GRIDS DAMAGE SYSTEM);
my %notification_type =
    (EVENTS => ['CAN_EVENT', 'NEW_EVENT', 'UPD_EVENT'],
    PRODUCTS => ['NEW_PROD'],
    GRIDS => ['SHAKING'],
    DAMAGE => ['DAMAGE'],
    SYSTEM => ['SYSTEM']
    );
#my @notify_scans_profile = qw(EVENTS_PROFILE PRODUCTS_PROFILE GRIDS_PROFILE DAMAGE_PROFILE SYSTEM_PROFILE);

my (@counts, @measures, @groupbys);

##### Local Variables #####

my ($opt_help, $opt_version);

my $start_time;

my ($confname, $confsection, $facility);

my ($service_name, $service_title, $spoll, $verbose, $onceonly, $scan_period);

my ($installing, $removing, $run_as_service, $run_as_daemon);

my $pid_file;

my %server_info;        # from SERVER table

my $delivery_comment;

my $sending = 1;

my $ dbh;

my $iswin32 = $^O eq 'MSWin32';

my (@sortby, %sort_fields, $row_cap);


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
       "sendmail!",       \$sending,
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

$service_title ||= option 'ServiceTitle', $SERVICE_TITLE;
   
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


##### Notification Processing Routines #####

sub initialize {
    initialize_sql();
    @counts = fetch_array('aggregation_counted');
    @measures = fetch_array('aggregation_measured');
    @groupbys = fetch_array('aggregation_grouped');
}


sub initialize_sql {
    $dbh = SC->dbh;
    # dwb 2003-07-29 took this out because the DBI version we've been
    # using doesn't support it.
    #$dbh->{FetchHashKeyName} = 'NAME_uc';
    foreach my $k (keys %SQL) {
    $SQL{$k}->{STH} = $dbh->prepare($SQL{$k}->{SQL});
    }
    #$dbh->trace(2,'trace.log');
}


sub notify {
    my $ip = shift;
    my ($f, $file, $rc, @lines);
    my (@hlines, @blines, @flines);
    my (%stats, $condok);
	my (%attachment);

    my $r = $ip->[0];        # first (or only) record
	if (-e "$config->{DataRoot}/$r->{SHAKEMAP_ID}-$r->{SHAKEMAP_VERSION}/gs_url.txt") {
		open(FH, "< $config->{DataRoot}/$r->{SHAKEMAP_ID}-$r->{SHAKEMAP_VERSION}/gs_url.txt") or die "Couldn't open file";
		$r->{'GS_URL'} = <FH>;
		close(FH);	
	} else {
		$r->{'GS_URL'} = parse_gs_url($r->{EVENT_ID});
	}

    my $xr = {HEADER_FROM => $config->{Notification}->{From},
          HEADER_TO => $r->{DELIVERY_ADDRESS}};
    $xr->{_MIME_BOUNDARY} = md5_hex(scalar localtime);
    if ($r->{MESSAGE_FORMAT}) {
    my $sth = $SQL{SELECT_TEMPLATE}->{STH};
    $sth->execute($r->{MESSAGE_FORMAT});
    my $ap = $sth->fetchrow_arrayref;
    $file = $ap->[0];
    }
    unless ($file) {
    $file = $r->{DELIVERY_METHOD} eq "SCRIPT" ?
        $config->{Notification}->{DefaultScriptTemplate} :
        $config->{Notification}->{DefaultEmailTemplate};
    }
    vvpr "file <$file>";
    $file = lc("$r->{NOTIFICATION_TYPE}/$r->{DELIVERY_METHOD}") . '/' . $file;
    vvpr "file <$file>";
    $file = "$config->{TemplateDir}/$file";
    vvpr "file <$file>";
    my ($base, $suffix) = $file =~ m=^(.*/.*)\.(.*)$=;
    vvpr "base <$base>, sfx <$suffix>";
    $condok = $r->{DELIVERY_METHOD} eq "SCRIPT" ? 0 : 1;
    process_configuration($base);
    if ($r->{AGGREGATE}) {
    my @list = sort_aggregate($ip);
    my $itemno = 0;
    foreach my $rr (@list) {
        $itemno++;
        $xr->{_ITEMNO} = $itemno;
        foreach my $name (@counts) {
        my $val = $rr->{$name};
        if (defined $val) {
            $stats{"_NUM_$name"}++;
        }
        }
        foreach my $name (@measures) {
        my $val = $rr->{$name};
        if (defined $val) {
            my $n = $stats{"_MIN_$name"};
            if (!defined $n or $val < $n) {
            $stats{"_MIN_$name"} = $val;
            }
            $n = $stats{"_MAX_$name"};
            if (!defined $n or $val > $n) {
            $stats{"_MAX_$name"} = $val;
            }
            $stats{"_MEAN_$name"} += $val;
            $stats{"_NUM_$name"}++;
        }
        }
        foreach my $s (@groupbys) {
        my ($name, $valname) = split(/\//, $s);
        my $val = $rr->{$name};
        if (defined $val) {
            $val =~ s/ /_/g;
            my $sfx = "${name}_$val";
            $stats{"_NUM_$sfx"}++;
            if ($valname) {
            $val = $rr->{$valname};
            if (defined $val) {
                my $n = $stats{"_MIN_$sfx"};
                if (!defined $n or $val < $n) {
                $stats{"_MIN_$sfx"} = $val;
                }
                $n = $stats{"_MAX_$sfx"};
                if (!defined $n or $val > $n) {
                $stats{"_MAX_$sfx"} = $val;
                }
                $stats{"_MEAN_$sfx"} += $val;
            }
            }
        }
        }
        if (-r "${base}_body.$suffix") {
        my $a = expand($condok, "${base}_body.$suffix", $rr, $xr,
                  \%stats);
        return -1 unless defined $a;
        push @blines, @$a unless ($row_cap && ($itemno > $row_cap));
        }
		
		$attachment{$rr->{'PRODUCT_TYPE'}} = 
			"$config->{DataRoot}/$r->{SHAKEMAP_ID}-$r->{SHAKEMAP_VERSION}/$rr->{FILENAME}"
			if $rr->{'PRODUCT_TYPE'};
    }
    foreach my $key (keys %stats) {
        my ($type, $field) = ($key =~ /(_MEAN_)(.*)/);
        if ($type) {
        my $n = $stats{"_NUM_$field"};
        if ($n) { $stats{$key} /= $n }
        else { undef $stats{$key} }
        }
    }
    if (-r "${base}_header.$suffix") {
        my $a = expand($condok, "${base}_header.$suffix", $r, $xr,
                  \%stats);
        return -1 unless defined $a;
        @hlines = @$a;
    }
    if (-r "${base}_footer.$suffix") {
        my $a = expand($condok, "${base}_footer.$suffix", $r,
               $xr, \%stats);
        return -1 unless defined $a;
        @flines = @$a;
    }
    @lines = (@hlines, @blines, @flines);
	if (-d "$config->{DataRoot}/$r->{SHAKEMAP_ID}-$r->{SHAKEMAP_VERSION}") {
		open (N_MES, "> $config->{DataRoot}/$r->{SHAKEMAP_ID}-$r->{SHAKEMAP_VERSION}/$r->{SHAKECAST_USER}_$r->{NOTIFICATION_TYPE}_$r->{AGGREGATION_GROUP}.txt") or last;
		print N_MES @lines;
		close(N_MES); 
	}
    }
    else {
    my $a = expand($condok, $file, $r, $xr);
    return -1 unless defined $a;
    @lines = @$a;
	$attachment{$r->{'PRODUCT_TYPE'}} = 
		"$config->{DataRoot}/$r->{SHAKEMAP_ID}-$r->{SHAKEMAP_VERSION}/$r->{FILENAME}"
		if $r->{'PRODUCT_TYPE'};
    }
    vvvpr @lines;
    if ($r->{DELIVERY_METHOD} eq "SCRIPT") {
    if ($sending) {
        $rc = executescript($suffix, \@lines);
    }
    else {
        epr "would execute script.  suffix = '$suffix'";
        $rc = 1;
    }
    }
    else {
		# Here we specify new event type to include summery pdf attachment and is only for HTML emails
		#print keys %attachment, "\n";
		if ($sending) {
			$rc = sendnotification($config->{Notification}->{EnvelopeFrom},
					   $r->{DELIVERY_ADDRESS}, $r->{DELIVERY_METHOD}, \@lines,
					   \%attachment);
		}
		else {
			epr "would send to <$r->{DELIVERY_ADDRESS}";
			$rc = 1;
		}
    }
    return $rc;
}


sub scan_for_work {
    my $n = 0;
    my $sth = $SQL{SELECT_SERVER_INFO}->{STH};
    $sth->execute;
    my $r = $sth->fetchrow_hashref('NAME_uc');
    if ($r) {
		%server_info = %$r;
		$sth->finish;
		my $user_sth = $SQL{SELECT_NOTIFICATION_USER}->{STH};
		foreach my $k (@notify_scans) {
			my $nt = 0;
			my $accepted = 0;
			foreach my $notify_type (@{$notification_type{$k}}) {
			$user_sth->execute($notify_type);
			while (my $user = $user_sth->fetchrow()) {
				next unless ($user > 0);
				my ($nt_count, $accepted_count) = scan_one_type($k, $user);
				$nt += $nt_count;
				$accepted += $accepted_count;
			}
			}
		vpr "$nt <$k> notification(s) attempted; $accepted accepted";
		$n += $nt;
		}

		my $profile_sth = $SQL{SELECT_NOTIFICATION_PROFILE_USER}->{STH};
		foreach my $k (@notify_scans) {
			my $nt = 0;
			my $accepted = 0;
			foreach my $notify_type (@{$notification_type{$k}}) {
				$profile_sth->execute($notify_type);
				while (my $profile = $profile_sth->fetchrow_hashref('NAME_uc')) {
					#next unless ($profile->{'PROFILE_ID'} < 0);
					my ($nt_count, $accepted_count) = scan_one_profile($k.'_PROFILE', $profile, $notify_type);
					$nt += $nt_count;
					$accepted += $accepted_count;
				}
			}
			vpr "$nt <$k> profile notification(s) attempted; $accepted accepted";
			$n += $nt;
		}
    }
    vpr "$n notification(s) processed";
}


sub scan_one_profile {
    my ($type, $profile, $notify_type) = @_;
    my $n = 0;
    my $accepted = 0;
    my ($status, $next, $tries);
    my @notes;

    my $seq = 2; # aggregation_flag + 1
    my $items = [];
    my $sth = $SQL{$type}->{STH};

    $sth->execute($profile->{'DELIVERY_ADDRESS'}, $profile->{'PROFILE_ID'}, $notify_type, SC->time_to_ts);
    my $code = '';
    while (my $r = $sth->fetchrow_hashref('NAME_uc')) {
    add_derived_values($r);
    my $g = ns($r->{AGGREGATION_GROUP});
    my $a = nz($r->{AGGREGATE});
        $a = $seq++ unless $a == 1;     # differentiate all unaggregated records
    my $c = "$r->{SHAKECAST_USER}~$r->{DELIVERY_METHOD}~$r->{NOTIFICATION_TYPE}~$g~$a";
    if ($c ne $code) {
        unless ($code eq '') {
        push @notes, $items if @$items;
        $items = [];
        }
        $code = $c;
    }
    my $rr = {};
    %$rr = %$r;
    push @$items, $rr;
    }
    push @notes, $items if @$items;
    $sth->finish;
	
    while (my $ip = shift @notes) {
    $n++;

    my $rc = notify($ip);
    foreach my $r (@$ip) {
        $tries = nz($r->{TRIES}) + 1;
        my $str_len = length($delivery_comment);
        $delivery_comment = substr($delivery_comment, $str_len - 256, 255) if ($str_len > 255);
        if ($rc > 0) {        # success
        $SQL{UPD_NOTIFY_SUCCESS}->
        {STH}->execute('COMPLETED',
                   SC->time_to_ts, $tries, $delivery_comment,
                   $r->{NOTIFICATION_ID});
        $accepted++;
        }
        else {
        if ($rc == 0) {    # temporary failure
            if ($tries <= $r->{MAX_TRIES}) {
            $status = 'ERRORS';
            my $n = ($tries >= $#RETRY_FALLBACK) ?
                $#RETRY_FALLBACK :
                $tries;
            my $next = time + $RETRY_FALLBACK[$n];
            }
            else {
            $status = 'FAILED';
            $next = undef;
            }
        }
        else {        # permanent failure
            $status = 'FAILED';
            $next = undef;
        }
        $SQL{UPD_NOTIFY_FAIL}->{STH}->
            execute($status, SC->time_to_ts, $next, $tries,
                $delivery_comment,
                $r->{NOTIFICATION_ID});
        }
        $dbh->commit;
    }
    }
    vpr "$n <$type> profile notification(s) attempted; $accepted accepted";
    return $n;
}


sub scan_one_type {
    my ($type, $user) = @_;
    my $n = 0;
    my $accepted = 0;
    my ($status, $next, $tries);
    my @notes;

    my $seq = 2; # aggregation_flag + 1
    my $items = [];
    my $sth = $SQL{$type}->{STH};
    $sth->execute($user,SC->time_to_ts);
    my $code = '';
    while (my $r = $sth->fetchrow_hashref('NAME_uc')) {
    add_derived_values($r);
    my $g = ns($r->{AGGREGATION_GROUP});
    my $a = nz($r->{AGGREGATE});
        $a = $seq++ unless $a == 1;     # differentiate all unaggregated records
    my $c = "$r->{SHAKECAST_USER}~$r->{DELIVERY_METHOD}~$r->{NOTIFICATION_TYPE}~$r->{DELIVERY_ADDRESS}~$g~$a";
    if ($c ne $code) {
        unless ($code eq '') {
        push @notes, $items if @$items;
        $items = [];
        }
        $code = $c;
    }
    my $rr = {};
    %$rr = %$r;
    push @$items, $rr;
    }
    push @notes, $items if @$items;
    $sth->finish;

    while (my $ip = shift @notes) {
    $n++;
    my $rc = notify($ip);
    foreach my $r (@$ip) {
        $tries = nz($r->{TRIES}) + 1;
        if ($rc > 0) {        # success
        $SQL{UPD_NOTIFY_SUCCESS}->
        {STH}->execute('COMPLETED',
                   SC->time_to_ts, $tries, $delivery_comment,
                   $r->{NOTIFICATION_ID});
        $accepted++;
        }
        else {
        if ($rc == 0) {    # temporary failure
            if ($tries <= $r->{MAX_TRIES}) {
            $status = 'ERRORS';
            my $n = ($tries >= $#RETRY_FALLBACK) ?
                $#RETRY_FALLBACK :
                $tries;
            my $next = time + $RETRY_FALLBACK[$n];
            }
            else {
            $status = 'FAILED';
            $next = undef;
            }
        }
        else {        # permanent failure
            $status = 'FAILED';
            $next = undef;
        }
        $SQL{UPD_NOTIFY_FAIL}->{STH}->
            execute($status, SC->time_to_ts, $next, $tries,
                $delivery_comment,
                $r->{NOTIFICATION_ID});
        }
        #$dbh->commit;
    }
    }
    return ($n, $accepted);
}


##### Support Routines #####


sub add_derived_values {
    my $r = shift;

    add_exceedance_ratio($r);
	add_facility_attribute($r);
	add_facility_feature($r);
    # put others here...
}


sub add_exceedance_ratio {
    my $r = shift;
    my $v = 0;

    if ($r->{DAMAGE_LEVEL}) {
    my $val = $r->{GRID_VALUE};
    my $lv = $r->{LOW_LIMIT};
    my $hv = $r->{HIGH_LIMIT};
    if ($r->{IS_MAX_SEVERITY}) { $v = $val / $lv }
    else { $v = ($val - $lv) / ($hv - $lv) }
    $r->{EXCEEDANCE_RATIO} = sprintf "%.3f", $v;
    }
}


sub add_facility_attribute {
    my $r = shift;

    if ($r->{FACILITY_ID}) {
	my $sth = $SQL{SELECT_FACILITY_ATTRIBUTE}->{STH};
	$sth->execute($r->{FACILITY_ID});
	while (my $fa = $sth->fetchrow_hashref('NAME_uc')) {
	    $r->{'ATTR_'.uc($fa->{ATTRIBUTE_NAME})} = $fa->{ATTRIBUTE_VALUE}; 
	}
	$sth->finish;
    }
}


sub add_facility_feature {
    my $r = shift;

    if ($r->{FACILITY_ID}) {
		my $sth = $SQL{SELECT_FACILITY_FEATURE}->{STH};
		$sth->execute($r->{FACILITY_ID});
		my $ff = $sth->fetchrow_hashref('NAME_uc');
		if ($ff) {
			$r->{GEOM_TYPE} = $ff->{GEOM_TYPE}; 
			$r->{GEOM} = $ff->{GEOM}; 
		}
		$sth->finish;
    }
}


sub epr {
    SC->log(0, @_);
}


sub eprmail {
    my ($smtp, @msg) = @_;
    my $msg = "mail (smtp): " . join(' ', @msg) . ":";
    my @cmdmsg = split("\n", $smtp->message);
    my $cmdmsg = $cmdmsg[$#cmdmsg];
    my $code = $smtp->code;
    my $s = "$msg $code: $cmdmsg";
    $delivery_comment = $s;
    if ($smtp->ok) { epr $s }
    else { error $s }
}


sub error {
    SC->error(@_);
}


sub executescript {
    my ($suffix, $lines) = @_;

    $suffix ||= 'tmp';
    $suffix = ".$suffix";
    my ($outfh, $outname) = tempfile('scscrXXXXXX',
            DIR => File::Spec->tmpdir(), SUFFIX => $suffix);
    foreach my $line (@$lines) { print $outfh $line }
    close $outfh;
    chmod 0700, $outname;
    my $rc = system "$perl $outname";
    $delivery_comment = "script '$outname'; rc = $rc";
    unlink $outname;
    if ($rc < 0) {
        # permanent failure if script cannot be executed
        $rc = -1;
    } elsif ($rc == 0) {
        # success
        $rc = 1;
    } elsif ($rc & 0xff) {
        # permanent failure if script signalled
        $rc = -1;
    } else {
        # temporary failure if script returned non-zero
        $rc = 0;
    }
    return $rc;
}


sub expand {
    my ($allow_conditionals, $fname, @rr) = @_;
    my ($skipping, @lines);
   
    unless (open TMPLT, $fname) {
    error "Can't open template <$fname>: $!";
    return undef;
    }
    while (my $line = <TMPLT>) {
    if ($allow_conditionals) {
        next if $line =~ /^;/;
        if ($line =~ /^\#ifdef\s+(\w+)/) {
        if (isdefined($1, @rr)) { $skipping = 0 }
        else { $skipping = 1 }
        }
        elsif ($line =~ /^\#ifndef\s+(\w+)/) {
        if (isdefined($1, @rr)) { $skipping = 1 }
        else { $skipping = 0 }
        }
        elsif ($line =~ /^\#else\s*$/) {
        $skipping = ! $skipping;
        }
        elsif ($line =~ /^\#endif\s*$/) {
        $skipping = 0;
        }
        else {
        next if $skipping;
        push @lines, substitute($line, @rr);
        }
    }
    else {
        push @lines, substitute($line, @rr);
    }
    }
    close TMPLT;
    return \@lines;
}


sub fetch_array {
    my $table = shift;
    my $r = $dbh->selectcol_arrayref("select name from $table");
    return @$r;
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
    --nosendmail        don't actually do the notify
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


sub isdefined {
    my ($key, @rr) = @_;

    foreach my $r (@rr) {
    return 1 if defined $r->{$key};
    }
    return 0;
}


sub ns {
    $_[0] ? $_[0] : '';
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


sub process_configuration {
    my ($base, $suffix) = @_;

    undef @sortby;
    undef %sort_fields;
    undef $row_cap;
    my $fname = "${base}.conf";
    return unless -r $fname;
    unless (open CNF, $fname) {
    error "Can't open template config file <$fname>: $!";
    return;
    }
    while (my $line = <CNF>) {
    next if $line =~ /^;/;
    chomp $line;
    $line =~ s/^\s+//;
    $line =~ s/\s+$//;
    $line =~ s/\s+/ /g;
    next unless $line;
    my ($cmd, @fields) = split / /, $line;
    if ($cmd) {
        $cmd = lc $cmd;
        if ($cmd eq 'sort') {
        foreach my $f (@fields) {
            my ($name, $codes) = split /\//, $f;
            $name = uc $name;
            push @sortby, $name;
            my ($dir, $type);
            if ($codes) {
            foreach my $code (split //, $codes) {
                if ($code eq 'a' or $code eq 'd') { $dir = $code }
                elsif ($code eq 'n' or $code eq 't')
                {
                $type = $code;
                }
                else {
                error "Unknown sort code <$code>";
                }
            }
            }
            $type ||= 'n';
            $dir ||= 'a';
            $sort_fields{$name}->{DIR} = $dir;
            $sort_fields{$name}->{TYPE} = $type;
        }
        } elsif ($cmd eq 'row_cap') {
			$row_cap = shift @fields;
		}
        else { error "Unknown command <$cmd>" }
    }
#    epr Dumper \@sortby;
#    epr Dumper \%sort_fields;
    }
    close CNF;
}


sub sendnotification {
    my ($from, $to, $delivery_method, $lines, $files) = @_;
    my ($subject, $skipping);
	
	for (my $ind = 0; $ind < scalar @$lines; $ind++) {
		my $temp_header = $lines->[$ind];
		last unless ($temp_header =~ /:/);
		chomp($temp_header);
		my ($field, $content) = split /:/, $temp_header, 2;
		$content =~ s/^\s*//;
		$content =~ s/\s*$//;
		if ($field =~ /^From|To|Subject/i) {
			eval '$'.lc($field)."='".$content."'";
		} elsif ($field =~ /^Attach/i) {
			$files->{'ATTACH'.$ind} = $content;
		}
		$lines->[$ind] = '';
	}
    my $data = join '', @$lines;
    my @to = split(/,/, $to);
	my $msg_type = ($delivery_method eq 'EMAIL_HTML') ? 'text/html' : 'text/plain';

    undef $delivery_comment;
    #return (0) unless (-e $files);
    use MIME::Lite;
   
    ### Create the multipart container
    my $msg = MIME::Lite->new (
        From => $from,
        To => $from,
        BCC => $to,
        Subject => $subject,
        Type => $msg_type,
		Data => $data
    ) or warn( "Error creating multipart container: $!\n", return -1);

	#$msg->attach(Type=>'image/png', Id=>"GREEN.png", Encoding=>"base64", Path=>"C:/ShakeCast/sc/images/GREEN.png");
		### Add the pdf file
		foreach my $file_type (keys %{$files}) {
		if ($file_type =~ /^ATTACH/i) {
			next unless (-e $files->{$file_type});
		} else {
			return 0 unless (-e $files->{$file_type});
		}
			my @fields = split /[\/|\\]/, $files->{$file_type};
			my $filename = $fields[$#fields];
			$filename =~ s/\./\-$fields[$#fields-1]\./ unless ($file_type =~ /ATTACH/);
			$msg->attach (
			   Type => 'AUTO',
			   Path => $files->{$file_type},
			   Id => $filename,
			   Filename => $filename,
			   Disposition => 'inline'
			) or warn ( "Error adding ".$files->{$file_type}.": $!\n", return -1);
		}
	
	unless ($config->{Notification}->{SmtpServer}) {
		$delivery_comment = $msg->send();
		return 1;
	}
	
	my $smtp;
	if ($config->{Notification}->{Security} eq 'TLS') {
		eval {
			use Net::SMTPS;  
			my $port = ($config->{Notification}->{Port}) ? $config->{Notification}->{Port} : 587;
			$smtp = Net::SMTPS->new(
				$config->{Notification}->{SmtpServer},
				Hello => $from, Debug=>1, Port => $port, doSSL => 'starttls') or
			($delivery_comment = "Can't create SMTP object: $!/$^E",
			 error($delivery_comment),
			 return -1);
		};
	} elsif ($config->{Notification}->{Security} eq 'SSL') {
		eval {
			use Net::SMTPS;  
			my $port = ($config->{Notification}->{Port}) ? $config->{Notification}->{Port} : 465;
			$smtp = Net::SMTPS->new(
				$config->{Notification}->{SmtpServer},
				Hello => $from, Debug=>1, Port => $port, doSSL => 'ssl') or
			($delivery_comment = "Can't create SMTP object: $!/$^E",
			 error($delivery_comment),
			 return -1);
		};
	} else {
			eval {
				use Net::SMTP;
				$smtp = Net::SMTP->new($config->{Notification}->{SmtpServer}) or
				($delivery_comment = "Can't create SMTP object: $!/$^E",
				 error($delivery_comment),
				 return -1);
			};
	}
	if ($config->{Notification}->{Username} ne '') {
		my $username = $config->{Notification}->{Username};
		my $password = $config->{Notification}->{Password};
		$smtp->auth($username, $password);
		unless ($smtp->ok) {
		eprmail($smtp, "authentication");
		return $smtp->status == 4 ? 0 : -1;
		}
	}
	
	eval {
		$smtp->mail($from);
		unless ($smtp->ok) {
		eprmail($smtp, "cmd=<mail>, to=<@to>");
		return $smtp->status == 4 ? 0 : -1;
		}
		$smtp->to(@to, { SkipBad => 1 });
		unless ($smtp->ok) {
		eprmail($smtp, "cmd=<rcpt>, to=<@to>");
		return $smtp->status == 4 ? 0 : -1;
		}
		$smtp->data;
		unless ($smtp->ok) {
		eprmail($smtp, "cmd=<data>, to=<@to>");
		return $smtp->status == 4 ? 0 : -1;
		}
		$smtp->datasend($msg->as_string)     or
			($delivery_comment = "Can't use smtp->datasend()",
			 error($delivery_comment),
			 return -1);
		$smtp->dataend;
	};
	
	unless ($smtp->ok) {
	eprmail($smtp, "cmd=<dataend>, to=<$to>");
	return $smtp->status == 4 ? 0 : -1;
	}
	eprmail($smtp, "sent: to=<$to>");

    return 1;
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


sub sort_aggregate {
    my $ip = shift;

    if (@sortby) { return sort _sort_aggregate @$ip }
    else { return @$ip }
}


sub _sort_aggregate {
    foreach my $name (@sortby) {
    next unless (defined $a->{$name} && defined $b->{$name});
    if ($sort_fields{$name}->{TYPE} eq 'n') {
        if ($sort_fields{$name}->{DIR} eq 'a') {
        return 1 if $a->{$name} > $b->{$name};
        return -1 if $a->{$name} < $b->{$name};
        }
        else {
        return -1 if $a->{$name} > $b->{$name};
        return 1 if $a->{$name} < $b->{$name};
        }
    }
    else {
        if ($sort_fields{$name}->{DIR} eq 'a') {
        return 1 if $a->{$name} gt $b->{$name};
        return -1 if $a->{$name} lt $b->{$name};
        }
        else {
        return -1 if $a->{$name} gt $b->{$name};
        return 1 if $a->{$name} lt $b->{$name};
        }
    }
    }
    return 0;
}


sub spoll {
    GKS::Service::poll_service() if $run_as_service;
}


sub substitute {
    my ($s, @rr) = @_;
    my ($txt, $default);
    my %map;

    push @rr, \%server_info;
    while ($s =~ /%(.*?)%/) {
    my $subs = $1;
    my ($name, $map) = split /:/, $subs;
    $name = uc $name;
    if ($map) {
        my @x = split /;/, $map;
        if (@x % 2) { $default = pop @x }
        else { undef $default }
        undef %map;
        while (my $i = shift @x) {
        $map{uc $i} = shift @x;
        }
    }
    foreach my $r (@rr) {
        $txt = $r->{$name};
        last if $txt;
    }
    $txt = '|NULL|' unless $txt;
    $txt = 'sc' if ($txt eq 'ci' && $name eq 'SHAKEMAP_REGION');
    if ($map) {
        my $t = $map{uc $txt};
        if (defined $t) { $txt = $t }
        elsif (defined $default) { $txt = $default }
    }
    $s =~ s/%.*?%/$txt/;
    }
    return $s;
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

sub parse_gs_url {
    my ($shakemap_id) = @_;
	
	my $gs_url;

	use JSON -support_by_pp;
	my $evt_mirror = $config->{'DataRoot'}."/eq_product/$shakemap_id/event.json";
	open (FH, "< $evt_mirror") or return 0;
	my @contents = <FH>;
	close (FH);
	my $content = join '', @contents;

	eval{
    my $json = new JSON;
 
    # these are some nice json options to relax restrictions a bit:
    my $json_text = $json->allow_nonref->utf8->relaxed->escape_slash->loose->allow_singlequote->allow_barekey->decode($content);
 
	my $product = $json_text->{properties}->{products}->{shakemap}->[0];

	if ($product) {
		my ($mirror, $shakemap) = each( %{$product->{'contents'}});
			$gs_url = $shakemap->{'url'};
			$gs_url =~ s/$mirror$//;
    }
	};

	return $gs_url;
}


#####
