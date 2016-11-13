---
title: Template Keywords
tags: [troubleshooting, shakecast_v3]
summary: "ShakeCast Notification Template Keywords"
keywords: appendix, template, notification, keyword
last_updated: July 3, 2016
sidebar: v3_sidebar
permalink: v3_operator_appendf.html
folder: v3
---

## EVENT Notification Keywords

 **Table 1.** EVENT Notification Keywords

| Constant | Description |
| --- | --- |
| EVENT_ID | Earthquake identifier e.g., nn00423851 |
| EVENT_VERSION | Integer indicating event version |
| EVENT_STATUS | ShakeMap statusNORMAL:  RELEASEDREVIEWEDCANCELLED: |
| EVENT_NAME | String name describing event; defined by local network |
| MAGNITUDE | Event magnitude |
| EVENT_LOCATION_DESCRIPTION | String name describing event location with geographic reference; defined by local networke.g., "32km WNW of Alamo, Nevada" |
| EVENT_TIMESTAMP | Event timestamp e.g., yyyy-mm-ddThh:mm:ssZ |
| LAT | Event latitude (decimal degrees, north) |
| LON | Event longitude (decimal degrees, east) |
| EXTERNAL_EVENT_ID | Same as EVENT_ID in V3 |
| NOTIFICATION_ID | Sequence ID in ShakeCast notification table |
| TRIES | Number of notification attempts. |
| DELIVERY_STATUS | Result of notification attempt. |
| SHAKECAST_USER | ShakeCast User ID |
| DELIVERY_ADDRESS | Email address for delivery |
| DELIVERY_METHOD | Product delivery type for the given notificationEMAIL_HTML:  email with html formattingEMAIL_TEXT:  plain text emailPAGER:  simple text message for SMS delivery |
| EVENT_TYPE | Types of events that will trigger notifications to be sent:ALL: includes all event types (inclusive)ACTUAL:  real earthquakeSCENARIO:  a scenario or converted actual eventTEST:  system testHEARTBEAT:  a heartbeat system test message |
| NOTIFICATION_TYPE | Types of events that will trigger a notification to be sent Valid notification types:NEW_EVENT:  an earthquake exceeding a user-set threshold value. Requires EVENT_TYPE and DELIVERY_METHOD tags.DAMAGE: Triggered when the ground shaking parameter at a facility (or facilities) is between the high and low values of the user-set facility parameters. Requires EVENT_TYPE, DELIVERY_METHOD, and DAMAGE_LEVEL tags.SHAKING: Triggered when the ground shaking parameter at the facility location of the facility exceeds the preset value. Requires EVENT_TYPE, DELIVERY_METHOD, METRIC, and LIMIT_VALUE tags.CAN_EVENT:  cancelled event. Requires EVENT_TYPE and DELIVERY_METHOD tags.UPD_EVENT: updated event. Requires EVENT_TYPE and DELIVERY_METHOD tags.NEW_PROD:  triggered when a specific ShakeMap product becomes available. Require EVENT_TYPE, DELIVERY_METHOD, and PRODUCT tags. |
| MESSAGE_FORMAT | Name of notification template (default) |
| LIMIT_VALUE | Minimum magnitude for a notification to be sent |
| PRODUCT_TYPE | Type of product to be delivered. If omitted, product is plain text.PDF:  PDF from templates |
| FILENAME | External files to be attached to message |
| AGGREGATION_GROUP | Notification to be sent based on GROUP type defined by membership in a GROUP. ShakeCast has a predefined CITY group of global cities. |
| MAX_TRIES | Maximum number of notification attempts. |
| FACILITY_ID | Unique facility identifier. Text(32) |
| FACILITY_TYPE | Type of facility. Current defined types are: BRIDGE, CAMPUS, CITY, COUNTY, DAM, DISTRICT, ENGINEERED, INDUSTRIAL, MULTIFAM, ROAD, SINGLEFAM, STRUCTURE, TANK, TUNNEL, UNKNOWN, and HAZUS building types. |
| EXTERNAL_FACILITY_ID | Organization's unique facility identifier. Text (32)This field must be unique for a facility type but the same external_facility_id may be used for different types of facilities. |
| FACILITY_NAME | Facility name. Text(128). The value of this field is displayed to the user. |
| SHORT_NAME | Shortened version of facility name. Text(128).ShakeCast uses the value in this field when a shorter version of the name is needed due to output space limitations. |
| DESCRIPTION | Facility description. Text(255). |
| FACILITY_LAT | Facility latitude (decimal degrees, north) |
| FACILITY_LON | Facility longitude (decimal degrees, east) |
| GEOM_TYPE | The value of this field is used by ShakeCast to handle the geometry coordinates from the geom field. Text(32)Currently defined types are: POINT, POLYLINE, POLYGON, RECTANGLE, and CIRCLE. |
| GEOM | Geometry of a facility. The value of this field is used specify the coordinates of the facility. Text(32)Format of this field is in (longitude latitude) pairs separated by a white space. The size limit of data is ~16MB. |
| AGGREGATE | Flag to indicate whether notifications should be combined into a single messageInteger value e.g., 1 |
| SERVER_ID | Identifier of this ShakeCast server |
| DNS_ADDRESS | Domain name of this ShakeCast server |

## PRODUCT Notification Keywords

 **Table 2.** PRODUCT Notification Keywords

| Constant | Description |
| --- | --- |
| PRODUCT_ID | Product sequence ID in ShakeCast database |
| PRODUCT_TYPE | Type of product to be delivered. If omitted, product is plain text.PDF:  PDF from templates |
| NAME | Short product type description |
| DESCRIPTION | Long product type description |
| FILENAME | Filename for the product on local system |
| GENERATION_TIMESTAMP | Timestamp showing when the product was created on remote or local server |
| PRODUCT_STATUS | Status of product as RELEASED, REVIEWED, or CANCELLED |
| EVENT_ID | Earthquake identifier e.g., nn00423851 |
| EVENT_VERSION | Integer indicating event version |
| EVENT_NAME | String name describing event; defined by local network |
| MAGNITUDE | Event magnitude |
| EVENT_LOCATION_DESCRIPTION | String name describing event location with geographic reference; defined by local networke.g., "32km WNW of Alamo, Nevada" |
| EVENT_TIMESTAMP | Event timestamp e.g., yyyy-mm-ddThh:mm:ssZ |
| LAT | Event latitude (decimal degrees, north) |
| LON | Event longitude (decimal degrees, east) |
| SHAKEMAP_ID | Same as the event id |
| SHAKEMAP_VERSION | Integer indicating map revision |
| NOTIFICATION_ID | Sequence ID in ShakeCast notification table |
| TRIES | Number of notification attempts. |
| DELIVERY_STATUS | Result of notification attempt. |
| SHAKECAST_USER | ShakeCast User ID |
| DELIVERY_ADDRESS | Email address for delivery |
| DELIVERY_METHOD | Product delivery type for the given notificationEMAIL_HTML:  email with html formattingEMAIL_TEXT:  plain text emailPAGER:  simple text message for SMS delivery |
| NOTIFICATION_TYPE | Types of events that will trigger a notification to be sent Valid notification types:NEW_EVENT:  an earthquake exceeding a user-set threshold value. Requires EVENT_TYPE and DELIVERY_METHOD tags.DAMAGE: Triggered when the ground shaking parameter at a facility (or facilities) is between the high and low values of the user-set facility parameters. Requires EVENT_TYPE, DELIVERY_METHOD, and DAMAGE_LEVEL tags.SHAKING: Triggered when the ground shaking parameter at the facility location of the facility exceeds the preset value. Requires EVENT_TYPE, DELIVERY_METHOD, METRIC, and LIMIT_VALUE tags.CAN_EVENT:  cancelled event. Requires EVENT_TYPE and DELIVERY_METHOD tags.UPD_EVENT: updated event. Requires EVENT_TYPE and DELIVERY_METHOD tags.NEW_PROD:  triggered when a specific ShakeMap product becomes available. Require EVENT_TYPE, DELIVERY_METHOD, and PRODUCT tags. |
| MESSAGE_FORMAT | Name of notification template (default) |
| LIMIT_VALUE | Minimum magnitude for a notification to be sent |
| AGGREGATION_GROUP | Notification to be sent based on GROUP type defined by membership in a GROUP. ShakeCast has a predefined CITY group of global cities. |
| MAX_TRIES | Maximum number of notification attempts. |
| FACILITY_ID | Unique facility identifier. Text(32) |
| FACILITY_TYPE | Type of facility. Current defined types are: BRIDGE, CAMPUS, CITY, COUNTY, DAM, DISTRICT, ENGINEERED, INDUSTRIAL, MULTIFAM, ROAD, SINGLEFAM, STRUCTURE, TANK, TUNNEL, UNKNOWN, and HAZUS building types. |
| EXTERNAL_FACILITY_ID | Organization's unique facility identifier. Text (32)This field must be unique for a facility type but the same external_facility_id may be used for different types of facilities. |
| FACILITY_NAME | Facility name. Text(128). The value of this field is displayed to the user. |
| SHORT_NAME | Shortened version of facility name. Text(128).ShakeCast uses the value in this field when a shorter version of the name is needed due to output space limitations. |
| DESCRIPTION | Facility description. Text(255). |
| FACILITY_LAT | Facility latitude (decimal degrees, north) |
| FACILITY_LON | Facility longitude (decimal degrees, east) |
| GEOM_TYPE | The value of this field is used by ShakeCast to handle the geometry coordinates from the geom field. Text(32)Currently defined types are: POINT, POLYLINE, POLYGON, RECTANGLE, and CIRCLE. |
| GEOM | Geometry of a facility. The value of this field is used specify the coordinates of the facility. Text(32)Format of this field is in (longitude latitude) pairs separated by a white space. The size limit of data is ~16MB. |
| AGGREGATE | Flag to indicate whether notifications should be combined into a single messageInteger value e.g., 1 |
| SERVER_ID | Identifier of this ShakeCast server |
| DNS_ADDRESS | Domain name of this ShakeCast server |



## SHAKING Notification Keywords

 **Table 3.** SHAKING Notification Keywords

| Constant | Description |
| --- | --- |
| SHAKEMAP_ID | Same as the event id |
| SHAKEMAP_VERSION | Integer indicating map revision |
| SHAKEMAP_REGION | ShakeMap Network Code |
| GENERATION_TIMESTAMP | ShakeCast processing timestamp e.g., yyyy-mm-ddThh:mm:ssZ |
| EVENT_ID | Earthquake identifier e.g., nn00423851 |
| EVENT_VERSION | Integer indicating event version Integer indicating event version |
| EVENT_NAME | String name describing event; defined by local network |
| MAGNITUDE | Event magnitude |
| EVENT_LOCATION_DESCRIPTION | String name describing event location with geographic reference; defined by local networke.g., "32km WNW of Alamo, Nevada" |
| EVENT_TIMESTAMP | Event timestamp e.g., yyyy-mm-ddThh:mm:ssZ |
| LAT | Event latitude (decimal degrees, north) |
| LON | Event longitude (decimal degrees, east) |
| NOTIFICATION_ID | Sequence ID in ShakeCast notification table |
| TRIES | Number of notification attempts. |
| DELIVERY_STATUS | Result of notification attempt. |
| DELIVERY_ADDRESS | Email address for delivery |
| METRIC | ShakeMap metric for the shaking value |
| GRID_VALUE | ShakeMap shaking value |
| DELIVERY_METHOD | Product delivery type for the given notificationEMAIL_HTML:  email with html formattingEMAIL_TEXT:  plain text emailPAGER:  simple text message for SMS delivery |
| NOTIFICATION_TYPE | Types of events that will trigger a notification to be sent Valid notification types:NEW_EVENT:  an earthquake exceeding a user-set threshold value. Requires EVENT_TYPE and DELIVERY_METHOD tags.DAMAGE: Triggered when the ground shaking parameter at a facility (or facilities) is between the high and low values of the user-set facility parameters. Requires EVENT_TYPE, DELIVERY_METHOD, and DAMAGE_LEVEL tags.SHAKING: Triggered when the ground shaking parameter at the facility location of the facility exceeds the preset value. Requires EVENT_TYPE, DELIVERY_METHOD, METRIC, and LIMIT_VALUE tags.CAN_EVENT:  cancelled event. Requires EVENT_TYPE and DELIVERY_METHOD tags.UPD_EVENT: updated event. Requires EVENT_TYPE and DELIVERY_METHOD tags.NEW_PROD:  triggered when a specific ShakeMap product becomes available. Require EVENT_TYPE, DELIVERY_METHOD, and PRODUCT tags. |
| MESSAGE_FORMAT | Name of notification template (default) |
| LIMIT_VALUE | Minimum magnitude for a notification to be sent |
| PRODUCT_TYPE | Type of product to be delivered by the specified DELIVERY_METHOD. Products includePDF: GRID_XMLPGA_JPGINTEN_JPG |
| FILENAME | External file to be attached to message |
| AGGREGATION_GROUP | Notification to be sent based on GROUP type defined by membership in a GROUP. ShakeCast has a predefined CITY group of global cities. |
| MAX_TRIES | Maximum number of notification attempts. |
| FACILITY_ID | Unique facility identifier. Text(32) |
| FACILITY_TYPE | Type of facility. Current defined types are: BRIDGE, CAMPUS, CITY, COUNTY, DAM, DISTRICT, ENGINEERED, INDUSTRIAL, MULTIFAM, ROAD, SINGLEFAM, STRUCTURE, TANK, TUNNEL, UNKNOWN, and HAZUS building types. |
| EXTERNAL_FACILITY_ID | Organization's unique facility identifier. Text (32)This field must be unique for a facility type but the same external_facility_id may be used for different types of facilities. |
| FACILITY_NAME | Facility name. Text(128). The value of this field is displayed to the user. |
| SHORT_NAME | Shortened version of facility name. Text(128).ShakeCast uses the value in this field when a shorter version of the name is needed due to output space limitations. |
| DESCRIPTION | Facility description. Text(255). |
| FACILITY_LAT | Facility latitude (decimal degrees, north) |
| FACILITY_LON | Facility longitude (decimal degrees, east) |
| GEOM_TYPE | The value of this field is used by ShakeCast to handle the geometry coordinates from the geom field. Text(32)Currently defined types are: POINT, POLYLINE, POLYGON, RECTANGLE, and CIRCLE. |
| GEOM | Geometry of a facility. The value of this field is used specify the coordinates of the facility. Text(32)Format of this field is in (longitude latitude) pairs separated by a white space. The size limit of data is ~16MB. |
| BOUND_SOUTH | ShakeMap boundary to south |
| BOUND_NORTH | ShakeMap boundary to north |
| BOUND_WEST | ShakeMap boundary to west |
| BOUND_EAST | ShakeMap boundary to east |
| AGGREGATE | Flag to indicate whether notifications should be combined into a single messageInteger value e.g., 1 |
| SERVER_ID | Identifier of this ShakeCast server |
| DNS_ADDRESS | Domain name of this ShakeCast server |

## DAMAGE Notification Keywords

 **Table 4.** DAMAGE Notification Keywords

| Constant | Description |
| --- | --- |
| SHAKEMAP_ID | Same as the event id |
| SHAKEMAP_VERSION | Integer indicating map revision |
| SHAKEMAP_REGION | ShakeMap network code |
| GENERATION_TIMESTAMP | ShakeCast processing timestamp e.g., yyyy-mm-ddThh:mm:ssZ |
| EVENT_ID | Earthquake identifier e.g., nn00423851 |
| EVENT_VERSION | Integer indicating event version |
| EVENT_NAME | String name describing event; defined by local network |
| MAGNITUDE | Event magnitude |
| EVENT_LOCATION_DESCRIPTION | String name describing event location with geographic reference; defined by local networke.g., "32km WNW of Alamo, Nevada" |
| EVENT_TIMESTAMP | Event timestamp e.g., yyyy-mm-ddThh:mm:ssZ |
| LAT | Event latitude (decimal degrees, north) |
| LON | Event longitude (decimal degrees, north) |
| NOTIFICATION_ID | Sequence ID in ShakeCast notification table |
| TRIES | Number of notification attempts. |
| DELIVERY_STATUS | Result of notification attempt. |
| SHAKECAST_USER | ShakeCast User ID |
| DELIVERY_ADDRESS | Email address for delivery |
| METRIC | ShakeMap metric used for damage assessment |
| GRID_VALUE | ShakeMap value used for damage assessment |
| DAMAGE_LEVEL | String parameter for notification to be sent within the damage threshold e.g., GREEN, ORANGE, YELLOW, RED |
| DAMAGE_LEVEL_NAME | Damage level description |
| IS_MAX_SEVERITY | Flag showing whether this is the most severe damage state |
| SEVERITY_RANK | Rank of damage state |
| LOW_LIMIT | Minimum shaking value of the damage state |
| HIGH_LIMIT | Maximum shaking value of the damage state |
| DELIVERY_METHOD | Product delivery type for the given notificationEMAIL_HTML:  email with html formattingEMAIL_TEXT:  plain text emailPAGER:  simple text message for SMS delivery |
| NOTIFICATION_TYPE | Types of events that will trigger a notification to be sent Valid notification types:NEW_EVENT:  an earthquake exceeding a user-set threshold value. Requires EVENT_TYPE and DELIVERY_METHOD tags.DAMAGE: Triggered when the ground shaking parameter at a facility (or facilities) is between the high and low values of the user-set facility parameters. Requires EVENT_TYPE, DELIVERY_METHOD, and DAMAGE_LEVEL tags.SHAKING: Triggered when the ground shaking parameter at the facility location of the facility exceeds the preset value. Requires EVENT_TYPE, DELIVERY_METHOD, METRIC, and LIMIT_VALUE tags.CAN_EVENT:  cancelled event. Requires EVENT_TYPE and DELIVERY_METHOD tags.UPD_EVENT: updated event. Requires EVENT_TYPE and DELIVERY_METHOD tags.NEW_PROD:  triggered when a specific ShakeMap product becomes available. Require EVENT_TYPE, DELIVERY_METHOD, and PRODUCT tags. |
| MESSAGE_FORMAT | Name of notification template (default) |
| LIMIT_VALUE | Minimum magnitude for a notification to be sent |
| PRODUCT_TYPE | Type of product to be delivered. If omitted, product is plain text.PDF:  PDF from templates |
| FILENAME | External file to be attached to message |
| AGGREGATION_GROUP | Notification to be sent based on GROUP type defined by membership in a GROUP. ShakeCast has a predefined CITY group of global cities. |
| MAX_TRIES | Maximum number of notification attempts. |
| FACILITY_ID | Unique facility identifier. Text(32) |
| FACILITY_TYPE | Type of facility. Current defined types are: BRIDGE, CAMPUS, CITY, COUNTY, DAM, DISTRICT, ENGINEERED, INDUSTRIAL, MULTIFAM, ROAD, SINGLEFAM, STRUCTURE, TANK, TUNNEL, UNKNOWN, and HAZUS building types. |
| EXTERNAL_FACILITY_ID | Organization's unique facility identifier. Text (32)This field must be unique for a facility type but the same external_facility_id may be used for different types of facilities. |
| FACILITY_NAME | Facility name. Text(128). The value of this field is displayed to the user. |
| SHORT_NAME | Shortened version of facility name. Text(128).ShakeCast uses the value in this field when a shorter version of the name is needed due to output space limitations. |
| DESCRIPTION | Facility description. Text(255). |
| FACILITY_LAT | Facility latitude (decimal degrees, north) |
| FACILITY_LON | Facility longitude (decimal degrees, east) |
| GEOM_TYPE | The value of this field is used by ShakeCast to handle the geometry coordinates from the geom field. Text(32)Currently defined types are: POINT, POLYLINE, POLYGON, RECTANGLE, and CIRCLE. |
| GEOM | Geometry of a facility. The value of this field is used specify the coordinates of the facility. Text(32)Format of this field is in (longitude latitude) pairs separated by a white space. The size limit of data is ~16MB. |
| BOUND_SOUTH | ShakeMap boundary to south |
| BOUND_NORTH | ShakeMap boundary to north |
| BOUND_WEST | ShakeMap boundary to west |
| BOUND_EAST | ShakeMap boundary to east |
| AGGREGATE | Flag to indicate whether notifications should be combined into a single messageInteger value e.g., 1 |
| SERVER_ID | Identifier of this ShakeCast server |
| DNS_ADDRESS | Domain name of this ShakeCast server |

## SYSTEM Notification Keywords

 **Table 5.** SYSTEM Notification Keywords

| Constant | Description |
| --- | --- |
| LOG_MESSAGE_ID | Log sequence ID in ShakeCast database |
| LOG_MESSAGE_TYPE | Message type in WARNING or ERROR |
| SERVER_ID | Local ID for this ShakeCast server |
| DESCRIPTION | Server description |
| RECEIVE_TIMESTAMP | Timestamp when this notification was requested e.g., yyyy-mm-ddThh:mm:ssZ |
| NOTIFICATION_ID | Sequence ID in ShakeCast notification table |
| TRIES | Number of notification attempts. |
| DELIVERY_STATUS | Result of notification attempt. |
| SHAKECAST_USER | ShakeCast User ID |
| DELIVERY_ADDRESS | Email address for delivery |
| DELIVERY_METHOD | Product delivery type for the given notificationEMAIL_HTML:  email with html formattingEMAIL_TEXT:  plain text emailPAGER:  simple text message for SMS delivery |
| NOTIFICATION_TYPE | Types of events that will trigger a notification to be sent Valid notification types:NEW_EVENT:  an earthquake exceeding a user-set threshold value. Requires EVENT_TYPE and DELIVERY_METHOD tags.DAMAGE: Triggered when the ground shaking parameter at a facility (or facilities) is between the high and low values of the user-set facility parameters. Requires EVENT_TYPE, DELIVERY_METHOD, and DAMAGE_LEVEL tags.SHAKING: Triggered when the ground shaking parameter at the facility location of the facility exceeds the preset value. Requires EVENT_TYPE, DELIVERY_METHOD, METRIC, and LIMIT_VALUE tags.CAN_EVENT:  cancelled event. Requires EVENT_TYPE and DELIVERY_METHOD tags.UPD_EVENT: updated event. Requires EVENT_TYPE and DELIVERY_METHOD tags.NEW_PROD:  triggered when a specific ShakeMap product becomes available. Require EVENT_TYPE, DELIVERY_METHOD, and PRODUCT tags. |
| MESSAGE_FORMAT | Filename of notification template (default) |
| LIMIT_VALUE | Minimum magnitude for a notification to be sent |
| AGGREGATE | Flag to indicate whether notifications should be combined into a single messageInteger value e.g., 1 |
| AGGREGATION_GROUP | Notification to be sent based on GROUP type defined by membership in a GROUP. ShakeCast has a predefined CITY group of global cities. |
| MAX_TRIES | Maximum number of notification attempts. |
| SERVER_ID | Identifier of this ShakeCast server |
| DNS_ADDRESS | Domain name of this ShakeCast server |

## Derived Value Keywords

 **Table 6.** Derived Value Keywords

| Facility Attributes As ATTR_[ATTRIBUTE_NAME] | Description |
| --- | --- |
| _ITEMNO | Total number of entries in this notification |
| _NUM_[METRIC] (SHAKING/DAMAGE only) | Total number of entries for the specified ShakeMap metric |
| _MIN_[METRIC] (SHAKING/DAMAGE only) | The minimum reported value for the specified ShakeMap metric |
| _MAX_[METRIC] (SHAKING/DAMAGE only) | The maximum reported value for the specified ShakeMap metric |
| _MEAN_[METRIC] (SHAKING/DAMAGE only) | The averaged value for the specified ShakeMap metric |
| EXCEEDANCE_RATIO (DAMAGE only) | The relative position between the LOW_LIMIT and HIGH_LIMIT values, normalized to between 0 and 1. |

{% include links.html %}
