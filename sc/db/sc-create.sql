-- phpMyAdmin SQL Dump
-- version 2.10.1
-- http://www.phpmyadmin.net
-- 
-- Host: localhost
-- Generation Time: May 16, 2014 at 07:34 PM
-- Server version: 5.1.73
-- PHP Version: 5.3.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- Database: `sc`
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `administrator_role`
-- 

DROP TABLE IF EXISTS `administrator_role`;
CREATE TABLE IF NOT EXISTS `administrator_role` (
  `ADMINISTRATOR_ROLE` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`ADMINISTRATOR_ROLE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `aggregation_counted`
-- 

DROP TABLE IF EXISTS `aggregation_counted`;
CREATE TABLE IF NOT EXISTS `aggregation_counted` (
  `name` varchar(64) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `aggregation_grouped`
-- 

DROP TABLE IF EXISTS `aggregation_grouped`;
CREATE TABLE IF NOT EXISTS `aggregation_grouped` (
  `name` varchar(64) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `aggregation_measured`
-- 

DROP TABLE IF EXISTS `aggregation_measured`;
CREATE TABLE IF NOT EXISTS `aggregation_measured` (
  `name` varchar(64) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `config`
-- 

DROP TABLE IF EXISTS `config`;
CREATE TABLE IF NOT EXISTS `config` (
  `CONFIG_NAME` varchar(255) NOT NULL,
  `CONFIG_VALUE` varchar(255) NOT NULL,
  `SERVICE` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`CONFIG_NAME`,`CONFIG_VALUE`,`SERVICE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `damage_level`
-- 

DROP TABLE IF EXISTS `damage_level`;
CREATE TABLE IF NOT EXISTS `damage_level` (
  `DAMAGE_LEVEL` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `SEVERITY_RANK` int(11) DEFAULT NULL,
  `IS_MAX_SEVERITY` tinyint(4) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`DAMAGE_LEVEL`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `delivery_method`
-- 

DROP TABLE IF EXISTS `delivery_method`;
CREATE TABLE IF NOT EXISTS `delivery_method` (
  `DELIVERY_METHOD` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `SCRIPT_NAME` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`DELIVERY_METHOD`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `delivery_status`
-- 

DROP TABLE IF EXISTS `delivery_status`;
CREATE TABLE IF NOT EXISTS `delivery_status` (
  `DELIVERY_STATUS` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`DELIVERY_STATUS`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `dispatch_task`
-- 

DROP TABLE IF EXISTS `dispatch_task`;
CREATE TABLE IF NOT EXISTS `dispatch_task` (
  `task_id` int(10) unsigned NOT NULL,
  `request` text,
  `status` varchar(30) DEFAULT NULL,
  `create_ts` datetime DEFAULT NULL,
  `dispatch_ts` datetime DEFAULT NULL,
  `update_ts` datetime DEFAULT NULL,
  `next_dispatch_ts` datetime DEFAULT NULL,
  `crontab` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`task_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `event`
-- 

DROP TABLE IF EXISTS `event`;
CREATE TABLE IF NOT EXISTS `event` (
  `EVENT_ID` varchar(80) NOT NULL,
  `EVENT_VERSION` int(11) NOT NULL DEFAULT '0',
  `EVENT_STATUS` varchar(10) NOT NULL,
  `EVENT_TYPE` varchar(10) NOT NULL,
  `EVENT_NAME` varchar(80) DEFAULT NULL,
  `EVENT_LOCATION_DESCRIPTION` varchar(255) DEFAULT NULL,
  `EVENT_REGION` varchar(4) DEFAULT NULL,
  `EVENT_SOURCE_TYPE` varchar(4) DEFAULT NULL,
  `EVENT_TIMESTAMP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `EXTERNAL_EVENT_ID` varchar(80) NOT NULL,
  `RECEIVE_TIMESTAMP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `MAGNITUDE` double DEFAULT NULL,
  `MAG_TYPE` varchar(10) DEFAULT NULL,
  `LAT` double DEFAULT NULL,
  `LON` double DEFAULT NULL,
  `DEPTH` double DEFAULT NULL,
  `SEQ` int(11) NOT NULL AUTO_INCREMENT,
  `INITIAL_VERSION` int(11) DEFAULT NULL,
  `MAJOR_EVENT` int(11) DEFAULT NULL,
  `SUPERCEDED_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`EVENT_ID`,`EVENT_VERSION`),
  KEY `SEQ` (`SEQ`),
  KEY `EVENT_EVENT_NAME_IDX` (`EVENT_NAME`),
  KEY `EVENT_EVENT_TS_IDX` (`EVENT_TIMESTAMP`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=45744 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `event_status`
-- 

DROP TABLE IF EXISTS `event_status`;
CREATE TABLE IF NOT EXISTS `event_status` (
  `EVENT_STATUS` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`EVENT_STATUS`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `event_type`
-- 

DROP TABLE IF EXISTS `event_type`;
CREATE TABLE IF NOT EXISTS `event_type` (
  `EVENT_TYPE` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`EVENT_TYPE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility`
-- 

DROP TABLE IF EXISTS `facility`;
CREATE TABLE IF NOT EXISTS `facility` (
  `FACILITY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FACILITY_TYPE` varchar(32) NOT NULL,
  `EXTERNAL_FACILITY_ID` varchar(32) DEFAULT NULL,
  `FACILITY_NAME` varchar(128) DEFAULT NULL,
  `SHORT_NAME` varchar(32) DEFAULT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `LAT_MIN` double NOT NULL,
  `LAT_MAX` double NOT NULL,
  `LON_MIN` double NOT NULL,
  `LON_MAX` double NOT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`FACILITY_ID`),
  KEY `FACILITY_EXT_ID_IDX` (`FACILITY_TYPE`,`EXTERNAL_FACILITY_ID`),
  KEY `FACILITY_LAT_IDX` (`LAT_MIN`,`LAT_MAX`),
  KEY `FACILITY_SHORT_NAME_IDX` (`SHORT_NAME`),
  KEY `FACILITY_NAME` (`FACILITY_NAME`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=173275 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_attribute`
-- 

DROP TABLE IF EXISTS `facility_attribute`;
CREATE TABLE IF NOT EXISTS `facility_attribute` (
  `facility_id` int(11) NOT NULL,
  `attribute_name` varchar(20) NOT NULL,
  `attribute_value` varchar(30) DEFAULT NULL,
  KEY `facility_id` (`facility_id`,`attribute_name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_feature`
-- 

DROP TABLE IF EXISTS `facility_feature`;
CREATE TABLE IF NOT EXISTS `facility_feature` (
  `FACILITY_ID` int(11) NOT NULL,
  `GEOM_TYPE` varchar(32) DEFAULT NULL,
  `GEOM` mediumtext,
  `DESCRIPTION` mediumtext,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`FACILITY_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_fragility`
-- 

DROP TABLE IF EXISTS `facility_fragility`;
CREATE TABLE IF NOT EXISTS `facility_fragility` (
  `FACILITY_FRAGILITY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FACILITY_ID` int(11) NOT NULL,
  `DAMAGE_LEVEL` varchar(10) NOT NULL,
  `LOW_LIMIT` double DEFAULT NULL,
  `HIGH_LIMIT` double DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`FACILITY_FRAGILITY_ID`),
  KEY `facility_fragility_facility_ix` (`FACILITY_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=890764 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_fragility_model`
-- 

DROP TABLE IF EXISTS `facility_fragility_model`;
CREATE TABLE IF NOT EXISTS `facility_fragility_model` (
  `FACILITY_FRAGILITY_MODEL_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FACILITY_ID` int(11) NOT NULL,
  `CLASS` varchar(32) DEFAULT NULL,
  `COMPONENT` varchar(64) NOT NULL,
  `DAMAGE_LEVEL` varchar(10) NOT NULL,
  `ALPHA` double DEFAULT NULL,
  `BETA` double DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`FACILITY_FRAGILITY_MODEL_ID`),
  KEY `facility_fragility_model_facility_ix` (`FACILITY_ID`),
  KEY `CLASS` (`CLASS`,`COMPONENT`,`FACILITY_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2401 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_fragility_probability`
-- 

DROP TABLE IF EXISTS `facility_fragility_probability`;
CREATE TABLE IF NOT EXISTS `facility_fragility_probability` (
  `FACILITY_ID` int(11) NOT NULL,
  `grid_id` int(11) NOT NULL,
  `FACILITY_FRAGILITY_MODEL_ID` int(11) NOT NULL,
  `DAMAGE_LEVEL` varchar(10) NOT NULL,
  `PROBABILITY` double DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`FACILITY_ID`,`grid_id`,`FACILITY_FRAGILITY_MODEL_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_model`
-- 

DROP TABLE IF EXISTS `facility_model`;
CREATE TABLE IF NOT EXISTS `facility_model` (
  `FACILITY_MODEL_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FACILITY_ID` int(11) NOT NULL,
  `GMPE` varchar(32) NOT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`FACILITY_MODEL_ID`),
  KEY `facility_model_facility_ix` (`FACILITY_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=785 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_model_shaking`
-- 

DROP TABLE IF EXISTS `facility_model_shaking`;
CREATE TABLE IF NOT EXISTS `facility_model_shaking` (
  `facility_id` int(11) NOT NULL,
  `SEQ` int(11) NOT NULL,
  `dist` double DEFAULT NULL,
  `value_1` double DEFAULT NULL,
  `value_2` double DEFAULT NULL,
  `value_3` double DEFAULT NULL,
  `value_4` double DEFAULT NULL,
  `value_5` double DEFAULT NULL,
  `value_6` double DEFAULT NULL,
  `value_7` double DEFAULT NULL,
  `value_8` double DEFAULT NULL,
  `value_9` double DEFAULT NULL,
  `value_10` double DEFAULT NULL,
  PRIMARY KEY (`facility_id`,`SEQ`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_notification_request`
-- 

DROP TABLE IF EXISTS `facility_notification_request`;
CREATE TABLE IF NOT EXISTS `facility_notification_request` (
  `FACILITY_ID` int(11) NOT NULL,
  `NOTIFICATION_REQUEST_ID` int(11) NOT NULL,
  PRIMARY KEY (`FACILITY_ID`,`NOTIFICATION_REQUEST_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_process`
-- 

DROP TABLE IF EXISTS `facility_process`;
CREATE TABLE IF NOT EXISTS `facility_process` (
  `facility_id` int(11) NOT NULL,
  `process_name` varchar(32) NOT NULL,
  `process_value` varchar(32) DEFAULT NULL,
  KEY `facility_id` (`facility_id`,`process_name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_shaking`
-- 

DROP TABLE IF EXISTS `facility_shaking`;
CREATE TABLE IF NOT EXISTS `facility_shaking` (
  `facility_id` int(11) NOT NULL,
  `grid_id` int(11) NOT NULL,
  `dist` double DEFAULT NULL,
  `value_1` double DEFAULT NULL,
  `value_2` double DEFAULT NULL,
  `value_3` double DEFAULT NULL,
  `value_4` double DEFAULT NULL,
  `value_5` double DEFAULT NULL,
  `value_6` double DEFAULT NULL,
  `value_7` double DEFAULT NULL,
  `value_8` double DEFAULT NULL,
  `value_9` double DEFAULT NULL,
  `value_10` double DEFAULT NULL,
  PRIMARY KEY (`facility_id`,`grid_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_type`
-- 

DROP TABLE IF EXISTS `facility_type`;
CREATE TABLE IF NOT EXISTS `facility_type` (
  `FACILITY_TYPE` varchar(32) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`FACILITY_TYPE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_type_attribute`
-- 

DROP TABLE IF EXISTS `facility_type_attribute`;
CREATE TABLE IF NOT EXISTS `facility_type_attribute` (
  `FACILITY_TYPE_ATTRIBUTE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FACILITY_TYPE` varchar(32) NOT NULL,
  `ATTRIBUTE_NAME` varchar(20) NOT NULL,
  `DESCRIPTION` varchar(30) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`FACILITY_TYPE_ATTRIBUTE_ID`),
  KEY `FACILITY_TYPE` (`FACILITY_TYPE`,`ATTRIBUTE_NAME`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=78 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `facility_type_fragility`
-- 

DROP TABLE IF EXISTS `facility_type_fragility`;
CREATE TABLE IF NOT EXISTS `facility_type_fragility` (
  `FACILITY_TYPE_FRAGILITY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FACILITY_TYPE` varchar(32) NOT NULL,
  `DAMAGE_LEVEL` varchar(10) NOT NULL,
  `LOW_LIMIT` double DEFAULT NULL,
  `HIGH_LIMIT` double DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`FACILITY_TYPE_FRAGILITY_ID`),
  KEY `facility_fragility_facility_ix` (`FACILITY_TYPE`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=592 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `geometry_facility_profile`
-- 

DROP TABLE IF EXISTS `geometry_facility_profile`;
CREATE TABLE IF NOT EXISTS `geometry_facility_profile` (
  `FACILITY_ID` int(11) NOT NULL,
  `PROFILE_ID` int(11) NOT NULL,
  PRIMARY KEY (`FACILITY_ID`,`PROFILE_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `geometry_profile`
-- 

DROP TABLE IF EXISTS `geometry_profile`;
CREATE TABLE IF NOT EXISTS `geometry_profile` (
  `PROFILE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `PROFILE_NAME` varchar(128) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `GEOM` mediumtext NOT NULL,
  `UPDATED` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`PROFILE_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=101 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `geometry_user_profile`
-- 

DROP TABLE IF EXISTS `geometry_user_profile`;
CREATE TABLE IF NOT EXISTS `geometry_user_profile` (
  `SHAKECAST_USER` int(11) NOT NULL,
  `PROFILE_ID` int(11) NOT NULL,
  PRIMARY KEY (`SHAKECAST_USER`,`PROFILE_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `grid`
-- 

DROP TABLE IF EXISTS `grid`;
CREATE TABLE IF NOT EXISTS `grid` (
  `SHAKEMAP_ID` varchar(80) NOT NULL,
  `SHAKEMAP_VERSION` int(11) NOT NULL,
  `LAT_MIN` double NOT NULL,
  `LAT_MAX` double NOT NULL,
  `LON_MIN` double NOT NULL,
  `LON_MAX` double NOT NULL,
  `ORIGIN_LAT` double DEFAULT NULL,
  `ORIGIN_LON` double DEFAULT NULL,
  `LATITUDE_CELL_COUNT` int(11) DEFAULT NULL,
  `LONGITUDE_CELL_COUNT` int(11) DEFAULT NULL,
  `GRID_ID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`SHAKEMAP_ID`,`SHAKEMAP_VERSION`),
  UNIQUE KEY `GRID_ID_IDX` (`GRID_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4959 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `grid_value`
-- 

DROP TABLE IF EXISTS `grid_value`;
CREATE TABLE IF NOT EXISTS `grid_value` (
  `GRID_VALUE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `GRID_ID` int(11) NOT NULL,
  `LAT_MIN` double NOT NULL,
  `LAT_MAX` double NOT NULL,
  `LON_MIN` double NOT NULL,
  `LON_MAX` double NOT NULL,
  `VALUE_1` double DEFAULT NULL,
  `VALUE_2` double DEFAULT NULL,
  `VALUE_3` double DEFAULT NULL,
  `VALUE_4` double DEFAULT NULL,
  `VALUE_5` double DEFAULT NULL,
  `VALUE_6` double DEFAULT NULL,
  `VALUE_7` double DEFAULT NULL,
  `VALUE_8` double DEFAULT NULL,
  `VALUE_9` double DEFAULT NULL,
  `VALUE_10` double DEFAULT NULL,
  PRIMARY KEY (`GRID_VALUE_ID`),
  KEY `GRID_VALUE_COMP_IDX` (`LAT_MIN`,`LAT_MAX`,`GRID_ID`),
  KEY `GRID_VALUE_GRID_ID_IDX` (`GRID_ID`),
  KEY `GRID_VALUE_LAT_IDX` (`LAT_MIN`,`LAT_MAX`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `lognorm_probability`
-- 

DROP TABLE IF EXISTS `lognorm_probability`;
CREATE TABLE IF NOT EXISTS `lognorm_probability` (
  `PROBABILITY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `PROBABILITY` double NOT NULL,
  `LOW_LIMIT` double DEFAULT NULL,
  `HIGH_LIMIT` double DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`PROBABILITY_ID`),
  KEY `high_ix` (`HIGH_LIMIT`),
  KEY `low_ix` (`LOW_LIMIT`),
  KEY `probability_ix` (`PROBABILITY`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=101 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `log_message`
-- 

DROP TABLE IF EXISTS `log_message`;
CREATE TABLE IF NOT EXISTS `log_message` (
  `LOG_MESSAGE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `LOG_MESSAGE_TYPE` varchar(10) NOT NULL,
  `SERVER_ID` int(11) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `RECEIVE_TIMESTAMP` datetime DEFAULT NULL,
  `DELIVERY_STATUS` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`LOG_MESSAGE_ID`),
  KEY `SERVER_ID` (`SERVER_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=23295 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `log_message_type`
-- 

DROP TABLE IF EXISTS `log_message_type`;
CREATE TABLE IF NOT EXISTS `log_message_type` (
  `LOG_MESSAGE_TYPE` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`LOG_MESSAGE_TYPE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `message_format`
-- 

DROP TABLE IF EXISTS `message_format`;
CREATE TABLE IF NOT EXISTS `message_format` (
  `MESSAGE_FORMAT` int(11) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `FILE_NAME` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`MESSAGE_FORMAT`),
  UNIQUE KEY `NAME` (`NAME`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `metric`
-- 

DROP TABLE IF EXISTS `metric`;
CREATE TABLE IF NOT EXISTS `metric` (
  `SHORT_NAME` varchar(10) NOT NULL,
  `METRIC_ID` int(11) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`METRIC_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `notification`
-- 

DROP TABLE IF EXISTS `notification`;
CREATE TABLE IF NOT EXISTS `notification` (
  `NOTIFICATION_ID` int(11) NOT NULL AUTO_INCREMENT,
  `NOTIFICATION_REQUEST_ID` int(11) NOT NULL,
  `SHAKECAST_USER` int(11) NOT NULL,
  `QUEUE_TIMESTAMP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `DELIVERY_TIMESTAMP` datetime DEFAULT NULL,
  `NEXT_DELIVERY_TIMESTAMP` datetime DEFAULT NULL,
  `TRIES` int(11) DEFAULT NULL,
  `DELIVERY_ATTEMPT_TIMESTAMP` datetime DEFAULT NULL,
  `FACILITY_ID` int(11) DEFAULT NULL,
  `DELIVERY_STATUS` varchar(10) NOT NULL,
  `GRID_ID` int(11) DEFAULT NULL,
  `GRID_VALUE_ID` int(11) DEFAULT NULL,
  `event_id` varchar(80) DEFAULT NULL,
  `EVENT_VERSION` int(11) DEFAULT NULL,
  `PRODUCT_ID` int(11) DEFAULT NULL,
  `DELIVERY_ADDRESS` text,
  `METRIC` varchar(10) DEFAULT NULL,
  `GRID_VALUE` double DEFAULT NULL,
  `DELIVERY_COMMENT` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`NOTIFICATION_ID`),
  KEY `NOTIFICATION_PRODUCT_ID_IDX` (`PRODUCT_ID`),
  KEY `NOTIFICATION_EVENT_ID_DX` (`event_id`),
  KEY `NOTIFICATION_QUEUE_TS_IDX` (`QUEUE_TIMESTAMP`),
  KEY `NOTIFICATION_DELIV_TS_IDX` (`DELIVERY_TIMESTAMP`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=40352 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `notification_class`
-- 

DROP TABLE IF EXISTS `notification_class`;
CREATE TABLE IF NOT EXISTS `notification_class` (
  `NOTIFICATION_CLASS` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`NOTIFICATION_CLASS`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `notification_request`
-- 

DROP TABLE IF EXISTS `notification_request`;
CREATE TABLE IF NOT EXISTS `notification_request` (
  `NOTIFICATION_REQUEST_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DAMAGE_LEVEL` varchar(10) DEFAULT NULL,
  `SHAKECAST_USER` int(11) NOT NULL,
  `NOTIFICATION_TYPE` varchar(10) DEFAULT NULL,
  `EVENT_TYPE` varchar(10) DEFAULT NULL,
  `DELIVERY_METHOD` varchar(10) NOT NULL,
  `MESSAGE_FORMAT` varchar(10) DEFAULT NULL,
  `LIMIT_VALUE` double DEFAULT NULL,
  `USER_MESSAGE` varchar(255) DEFAULT NULL,
  `NOTIFICATION_PRIORITY` int(11) DEFAULT NULL,
  `AUXILIARY_SCRIPT` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `DISABLED` tinyint(4) DEFAULT NULL,
  `PRODUCT_TYPE` varchar(10) DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  `AGGREGATE` tinyint(4) DEFAULT NULL,
  `AGGREGATION_GROUP` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`NOTIFICATION_REQUEST_ID`),
  KEY `NR_SHAKECAST_USER_IDX` (`SHAKECAST_USER`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=237 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `notification_request_status`
-- 

DROP TABLE IF EXISTS `notification_request_status`;
CREATE TABLE IF NOT EXISTS `notification_request_status` (
  `PARMNAME` varchar(32) NOT NULL,
  `PARMVALUE` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`PARMNAME`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `notification_type`
-- 

DROP TABLE IF EXISTS `notification_type`;
CREATE TABLE IF NOT EXISTS `notification_type` (
  `NOTIFICATION_TYPE` varchar(10) NOT NULL,
  `NOTIFICATION_CLASS` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `NOTIFICATION_ATTEMPTS` int(11) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`NOTIFICATION_TYPE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `permission`
-- 

DROP TABLE IF EXISTS `permission`;
CREATE TABLE IF NOT EXISTS `permission` (
  `PERMISSION` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_auth_access`
-- 

DROP TABLE IF EXISTS `phpbb_auth_access`;
CREATE TABLE IF NOT EXISTS `phpbb_auth_access` (
  `group_id` mediumint(8) NOT NULL,
  `forum_id` smallint(5) unsigned NOT NULL,
  `auth_view` tinyint(1) NOT NULL,
  `auth_read` tinyint(1) NOT NULL,
  `auth_post` tinyint(1) NOT NULL,
  `auth_reply` tinyint(1) NOT NULL,
  `auth_edit` tinyint(1) NOT NULL,
  `auth_delete` tinyint(1) NOT NULL,
  `auth_sticky` tinyint(1) NOT NULL,
  `auth_announce` tinyint(1) NOT NULL,
  `auth_vote` tinyint(1) NOT NULL,
  `auth_pollcreate` tinyint(1) NOT NULL,
  `auth_attachments` tinyint(1) NOT NULL,
  `auth_mod` tinyint(1) NOT NULL,
  KEY `group_id` (`group_id`),
  KEY `forum_id` (`forum_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_banlist`
-- 

DROP TABLE IF EXISTS `phpbb_banlist`;
CREATE TABLE IF NOT EXISTS `phpbb_banlist` (
  `ban_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `ban_userid` mediumint(8) NOT NULL,
  `ban_ip` char(8) NOT NULL,
  `ban_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ban_id`),
  KEY `ban_ip_user_id` (`ban_ip`,`ban_userid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_config`
-- 

DROP TABLE IF EXISTS `phpbb_config`;
CREATE TABLE IF NOT EXISTS `phpbb_config` (
  `config_name` varchar(255) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  PRIMARY KEY (`config_name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_confirm`
-- 

DROP TABLE IF EXISTS `phpbb_confirm`;
CREATE TABLE IF NOT EXISTS `phpbb_confirm` (
  `confirm_id` char(32) NOT NULL,
  `session_id` char(32) NOT NULL,
  `code` char(6) NOT NULL,
  PRIMARY KEY (`session_id`,`confirm_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_disallow`
-- 

DROP TABLE IF EXISTS `phpbb_disallow`;
CREATE TABLE IF NOT EXISTS `phpbb_disallow` (
  `disallow_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `disallow_username` varchar(32) NOT NULL,
  PRIMARY KEY (`disallow_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_groups`
-- 

DROP TABLE IF EXISTS `phpbb_groups`;
CREATE TABLE IF NOT EXISTS `phpbb_groups` (
  `group_id` mediumint(8) NOT NULL AUTO_INCREMENT,
  `group_type` tinyint(4) NOT NULL DEFAULT '1',
  `group_name` varchar(40) NOT NULL,
  `group_description` varchar(255) NOT NULL,
  `group_moderator` mediumint(8) NOT NULL,
  `group_single_user` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`group_id`),
  KEY `group_single_user` (`group_single_user`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=48 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_posts_text`
-- 

DROP TABLE IF EXISTS `phpbb_posts_text`;
CREATE TABLE IF NOT EXISTS `phpbb_posts_text` (
  `post_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `SHAKEMAP_ID` char(80) NOT NULL,
  `post_subject` char(80) DEFAULT NULL,
  `post_text` text,
  PRIMARY KEY (`post_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_search_results`
-- 

DROP TABLE IF EXISTS `phpbb_search_results`;
CREATE TABLE IF NOT EXISTS `phpbb_search_results` (
  `search_id` int(11) unsigned NOT NULL,
  `session_id` char(32) NOT NULL,
  `search_time` int(11) NOT NULL,
  `search_array` mediumtext NOT NULL,
  PRIMARY KEY (`search_id`),
  KEY `session_id` (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_sessions`
-- 

DROP TABLE IF EXISTS `phpbb_sessions`;
CREATE TABLE IF NOT EXISTS `phpbb_sessions` (
  `session_id` char(32) NOT NULL,
  `session_user_id` mediumint(8) NOT NULL,
  `session_start` int(11) NOT NULL,
  `session_time` int(11) NOT NULL,
  `session_ip` char(8) NOT NULL,
  `session_page` int(11) NOT NULL,
  `session_logged_in` tinyint(1) NOT NULL,
  `session_admin` tinyint(2) NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `session_user_id` (`session_user_id`),
  KEY `session_id_ip_user_id` (`session_id`,`session_ip`,`session_user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_sessions_keys`
-- 

DROP TABLE IF EXISTS `phpbb_sessions_keys`;
CREATE TABLE IF NOT EXISTS `phpbb_sessions_keys` (
  `key_id` varchar(32) NOT NULL,
  `user_id` mediumint(8) NOT NULL,
  `last_ip` varchar(8) NOT NULL,
  `last_login` int(11) NOT NULL,
  PRIMARY KEY (`key_id`,`user_id`),
  KEY `last_login` (`last_login`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_themes`
-- 

DROP TABLE IF EXISTS `phpbb_themes`;
CREATE TABLE IF NOT EXISTS `phpbb_themes` (
  `themes_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `template_name` varchar(30) NOT NULL,
  `style_name` varchar(30) NOT NULL,
  `head_stylesheet` varchar(100) DEFAULT NULL,
  `body_background` varchar(100) DEFAULT NULL,
  `body_bgcolor` varchar(6) DEFAULT NULL,
  `body_text` varchar(6) DEFAULT NULL,
  `body_link` varchar(6) DEFAULT NULL,
  `body_vlink` varchar(6) DEFAULT NULL,
  `body_alink` varchar(6) DEFAULT NULL,
  `body_hlink` varchar(6) DEFAULT NULL,
  `tr_color1` varchar(6) DEFAULT NULL,
  `tr_color2` varchar(6) DEFAULT NULL,
  `tr_color3` varchar(6) DEFAULT NULL,
  `tr_class1` varchar(25) DEFAULT NULL,
  `tr_class2` varchar(25) DEFAULT NULL,
  `tr_class3` varchar(25) DEFAULT NULL,
  `th_color1` varchar(6) DEFAULT NULL,
  `th_color2` varchar(6) DEFAULT NULL,
  `th_color3` varchar(6) DEFAULT NULL,
  `th_class1` varchar(25) DEFAULT NULL,
  `th_class2` varchar(25) DEFAULT NULL,
  `th_class3` varchar(25) DEFAULT NULL,
  `td_color1` varchar(6) DEFAULT NULL,
  `td_color2` varchar(6) DEFAULT NULL,
  `td_color3` varchar(6) DEFAULT NULL,
  `td_class1` varchar(25) DEFAULT NULL,
  `td_class2` varchar(25) DEFAULT NULL,
  `td_class3` varchar(25) DEFAULT NULL,
  `fontface1` varchar(50) DEFAULT NULL,
  `fontface2` varchar(50) DEFAULT NULL,
  `fontface3` varchar(50) DEFAULT NULL,
  `fontsize1` tinyint(4) DEFAULT NULL,
  `fontsize2` tinyint(4) DEFAULT NULL,
  `fontsize3` tinyint(4) DEFAULT NULL,
  `fontcolor1` varchar(6) DEFAULT NULL,
  `fontcolor2` varchar(6) DEFAULT NULL,
  `fontcolor3` varchar(6) DEFAULT NULL,
  `span_class1` varchar(25) DEFAULT NULL,
  `span_class2` varchar(25) DEFAULT NULL,
  `span_class3` varchar(25) DEFAULT NULL,
  `img_size_poll` smallint(5) unsigned DEFAULT NULL,
  `img_size_privmsg` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`themes_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_themes_name`
-- 

DROP TABLE IF EXISTS `phpbb_themes_name`;
CREATE TABLE IF NOT EXISTS `phpbb_themes_name` (
  `themes_id` smallint(5) unsigned NOT NULL,
  `tr_color1_name` char(50) DEFAULT NULL,
  `tr_color2_name` char(50) DEFAULT NULL,
  `tr_color3_name` char(50) DEFAULT NULL,
  `tr_class1_name` char(50) DEFAULT NULL,
  `tr_class2_name` char(50) DEFAULT NULL,
  `tr_class3_name` char(50) DEFAULT NULL,
  `th_color1_name` char(50) DEFAULT NULL,
  `th_color2_name` char(50) DEFAULT NULL,
  `th_color3_name` char(50) DEFAULT NULL,
  `th_class1_name` char(50) DEFAULT NULL,
  `th_class2_name` char(50) DEFAULT NULL,
  `th_class3_name` char(50) DEFAULT NULL,
  `td_color1_name` char(50) DEFAULT NULL,
  `td_color2_name` char(50) DEFAULT NULL,
  `td_color3_name` char(50) DEFAULT NULL,
  `td_class1_name` char(50) DEFAULT NULL,
  `td_class2_name` char(50) DEFAULT NULL,
  `td_class3_name` char(50) DEFAULT NULL,
  `fontface1_name` char(50) DEFAULT NULL,
  `fontface2_name` char(50) DEFAULT NULL,
  `fontface3_name` char(50) DEFAULT NULL,
  `fontsize1_name` char(50) DEFAULT NULL,
  `fontsize2_name` char(50) DEFAULT NULL,
  `fontsize3_name` char(50) DEFAULT NULL,
  `fontcolor1_name` char(50) DEFAULT NULL,
  `fontcolor2_name` char(50) DEFAULT NULL,
  `fontcolor3_name` char(50) DEFAULT NULL,
  `span_class1_name` char(50) DEFAULT NULL,
  `span_class2_name` char(50) DEFAULT NULL,
  `span_class3_name` char(50) DEFAULT NULL,
  PRIMARY KEY (`themes_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_users`
-- 

DROP TABLE IF EXISTS `phpbb_users`;
CREATE TABLE IF NOT EXISTS `phpbb_users` (
  `user_id` mediumint(8) NOT NULL,
  `user_active` tinyint(1) DEFAULT '1',
  `username` varchar(32) NOT NULL,
  `user_password` varchar(64) NOT NULL,
  `user_session_time` int(11) NOT NULL DEFAULT '0',
  `user_session_page` smallint(5) NOT NULL DEFAULT '0',
  `user_lastvisit` int(11) NOT NULL DEFAULT '0',
  `user_regdate` int(11) NOT NULL DEFAULT '0',
  `user_level` tinyint(4) DEFAULT '0',
  `user_posts` mediumint(8) unsigned NOT NULL DEFAULT '0',
  `user_timezone` decimal(5,2) NOT NULL DEFAULT '0.00',
  `user_style` tinyint(4) DEFAULT NULL,
  `user_lang` varchar(255) DEFAULT NULL,
  `user_dateformat` varchar(14) NOT NULL DEFAULT 'd M Y H:i',
  `user_new_privmsg` smallint(5) unsigned NOT NULL DEFAULT '0',
  `user_unread_privmsg` smallint(5) unsigned NOT NULL DEFAULT '0',
  `user_last_privmsg` int(11) NOT NULL DEFAULT '0',
  `user_login_tries` smallint(5) unsigned NOT NULL DEFAULT '0',
  `user_last_login_try` int(11) NOT NULL DEFAULT '0',
  `user_emailtime` int(11) DEFAULT NULL,
  `user_viewemail` tinyint(1) DEFAULT NULL,
  `user_attachsig` tinyint(1) DEFAULT NULL,
  `user_allowhtml` tinyint(1) DEFAULT '1',
  `user_allowbbcode` tinyint(1) DEFAULT '1',
  `user_allowsmile` tinyint(1) DEFAULT '1',
  `user_allowavatar` tinyint(1) NOT NULL DEFAULT '1',
  `user_allow_pm` tinyint(1) NOT NULL DEFAULT '1',
  `user_allow_viewonline` tinyint(1) NOT NULL DEFAULT '1',
  `user_notify` tinyint(1) NOT NULL DEFAULT '1',
  `user_notify_pm` tinyint(1) NOT NULL DEFAULT '0',
  `user_popup_pm` tinyint(1) NOT NULL DEFAULT '0',
  `user_rank` int(11) DEFAULT '0',
  `user_avatar` varchar(100) DEFAULT NULL,
  `user_avatar_type` tinyint(4) NOT NULL DEFAULT '0',
  `user_email` varchar(255) DEFAULT NULL,
  `user_icq` varchar(15) DEFAULT NULL,
  `user_fullname` varchar(100) DEFAULT NULL,
  `user_from` varchar(100) DEFAULT NULL,
  `user_sig` text,
  `user_sig_bbcode_uid` char(10) DEFAULT NULL,
  `user_aim` varchar(255) DEFAULT NULL,
  `user_yim` varchar(255) DEFAULT NULL,
  `user_msnm` varchar(255) DEFAULT NULL,
  `user_occ` varchar(100) DEFAULT NULL,
  `user_organization` varchar(255) DEFAULT NULL,
  `user_actkey` varchar(32) DEFAULT NULL,
  `user_newpasswd` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `user_session_time` (`user_session_time`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_user_group`
-- 

DROP TABLE IF EXISTS `phpbb_user_group`;
CREATE TABLE IF NOT EXISTS `phpbb_user_group` (
  `group_id` mediumint(8) NOT NULL,
  `user_id` mediumint(8) NOT NULL,
  `user_pending` tinyint(1) DEFAULT NULL,
  KEY `group_id` (`group_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `phpbb_validated`
-- 

DROP TABLE IF EXISTS `phpbb_validated`;
CREATE TABLE IF NOT EXISTS `phpbb_validated` (
  `validated_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `validated_userid` mediumint(8) NOT NULL,
  `validated_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`validated_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `processor_parameter`
-- 

DROP TABLE IF EXISTS `processor_parameter`;
CREATE TABLE IF NOT EXISTS `processor_parameter` (
  `PROCESSOR_NAME` varchar(32) NOT NULL,
  `PARAMETER_NAME` varchar(10) NOT NULL,
  `PARAMETER_VALUE` varchar(255) NOT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `product`
-- 

DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `product` (
  `SHAKEMAP_ID` varchar(80) NOT NULL,
  `SHAKEMAP_VERSION` int(11) NOT NULL,
  `PRODUCT_TYPE` varchar(10) NOT NULL,
  `PRODUCT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `PRODUCT_STATUS` varchar(10) NOT NULL,
  `GENERATING_SERVER` int(11) NOT NULL,
  `MAX_VALUE` double DEFAULT NULL,
  `MIN_VALUE` double DEFAULT NULL,
  `GENERATION_TIMESTAMP` datetime DEFAULT NULL,
  `RECEIVE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `LAT_MIN` double DEFAULT NULL,
  `LAT_MAX` double DEFAULT NULL,
  `LON_MIN` double DEFAULT NULL,
  `LON_MAX` double DEFAULT NULL,
  `PRODUCT_FILE_EXISTS` char(1) DEFAULT NULL,
  `SUPERCEDED_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SHAKEMAP_ID`,`SHAKEMAP_VERSION`,`PRODUCT_TYPE`),
  KEY `PRODUCT_ID` (`PRODUCT_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=140770 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `product_format`
-- 

DROP TABLE IF EXISTS `product_format`;
CREATE TABLE IF NOT EXISTS `product_format` (
  `PRODUCT_FORMAT` double NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`PRODUCT_FORMAT`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `product_status`
-- 

DROP TABLE IF EXISTS `product_status`;
CREATE TABLE IF NOT EXISTS `product_status` (
  `PRODUCT_STATUS` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`PRODUCT_STATUS`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `product_type`
-- 

DROP TABLE IF EXISTS `product_type`;
CREATE TABLE IF NOT EXISTS `product_type` (
  `PRODUCT_TYPE` varchar(10) NOT NULL,
  `NAME` varchar(32) DEFAULT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  `FILENAME` varchar(32) DEFAULT NULL,
  `URL` varchar(255) DEFAULT NULL,
  `DISPLAY` int(11) DEFAULT NULL,
  `PRODUCT_SOURCE` varchar(64) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`PRODUCT_TYPE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `profile_notification_request`
-- 

DROP TABLE IF EXISTS `profile_notification_request`;
CREATE TABLE IF NOT EXISTS `profile_notification_request` (
  `NOTIFICATION_REQUEST_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DAMAGE_LEVEL` varchar(10) DEFAULT NULL,
  `PROFILE_ID` int(11) NOT NULL,
  `NOTIFICATION_TYPE` varchar(10) DEFAULT NULL,
  `EVENT_TYPE` varchar(10) DEFAULT NULL,
  `DELIVERY_METHOD` varchar(10) NOT NULL,
  `MESSAGE_FORMAT` varchar(10) DEFAULT NULL,
  `LIMIT_VALUE` double DEFAULT NULL,
  `USER_MESSAGE` varchar(255) DEFAULT NULL,
  `NOTIFICATION_PRIORITY` int(11) DEFAULT NULL,
  `AUXILIARY_SCRIPT` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `DISABLED` tinyint(4) DEFAULT NULL,
  `PRODUCT_TYPE` varchar(10) DEFAULT NULL,
  `METRIC` varchar(10) DEFAULT NULL,
  `AGGREGATE` tinyint(4) DEFAULT NULL,
  `AGGREGATION_GROUP` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`NOTIFICATION_REQUEST_ID`),
  KEY `NR_SHAKECAST_USER_IDX` (`PROFILE_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=234 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `server`
-- 

DROP TABLE IF EXISTS `server`;
CREATE TABLE IF NOT EXISTS `server` (
  `SERVER_ID` int(11) NOT NULL,
  `DNS_ADDRESS` varchar(128) DEFAULT NULL,
  `IP_ADDRESS` varchar(15) DEFAULT NULL,
  `OWNER_ORGANIZATION` varchar(32) DEFAULT NULL,
  `LAST_HEARD_FROM` datetime DEFAULT NULL,
  `ERROR_COUNT` int(11) DEFAULT NULL,
  `SYSTEM_GENERATION` int(11) DEFAULT NULL,
  `SOFTWARE_VERSION` varchar(32) DEFAULT NULL,
  `BIRTH_TIMESTAMP` datetime DEFAULT NULL,
  `DEATH_TIMESTAMP` datetime DEFAULT NULL,
  `PKI_KEY` longtext,
  `SERVER_STATUS` varchar(10) DEFAULT NULL,
  `LAT` double DEFAULT NULL,
  `LON` double DEFAULT NULL,
  `LAST_EVENT_TIMESTAMP` datetime DEFAULT NULL,
  `NUMBER_OF_USERS` int(11) DEFAULT NULL,
  `ACCESS_COUNT` int(11) DEFAULT NULL,
  `EVENT_COUNT` int(11) DEFAULT NULL,
  `PRODUCT_COUNT` int(11) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `PASSWORD` varchar(128) DEFAULT NULL,
  `UPSTREAM_FLAG` tinyint(4) DEFAULT NULL,
  `DOWNSTREAM_FLAG` tinyint(4) DEFAULT NULL,
  `POLL_FLAG` tinyint(4) DEFAULT NULL,
  `QUERY_FLAG` tinyint(4) DEFAULT NULL,
  `SELF_FLAG` tinyint(4) DEFAULT NULL,
  `EVENT_HWM` int(11) DEFAULT NULL,
  `SHAKEMAP_HWM` int(11) DEFAULT NULL,
  `PRODUCT_HWM` int(11) DEFAULT NULL,
  PRIMARY KEY (`SERVER_ID`),
  KEY `SERVER_DNS_ADDRESS_IDX` (`DNS_ADDRESS`),
  KEY `SERVER_IP_ADDRESS_IDX` (`IP_ADDRESS`),
  KEY `SERVER_LAST_HEARD_FROM_IDX` (`LAST_HEARD_FROM`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `server_administrator`
-- 

DROP TABLE IF EXISTS `server_administrator`;
CREATE TABLE IF NOT EXISTS `server_administrator` (
  `SERVER_ID` int(11) NOT NULL,
  `SHAKECAST_USER` int(11) NOT NULL,
  `ADMINISTRATOR_ROLE` varchar(10) NOT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `server_permission`
-- 

DROP TABLE IF EXISTS `server_permission`;
CREATE TABLE IF NOT EXISTS `server_permission` (
  `SERVER_ID` int(11) NOT NULL,
  `PERMISSION` varchar(10) NOT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `server_status`
-- 

DROP TABLE IF EXISTS `server_status`;
CREATE TABLE IF NOT EXISTS `server_status` (
  `SERVER_STATUS` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SERVER_STATUS`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `shakecast_user`
-- 

DROP TABLE IF EXISTS `shakecast_user`;
CREATE TABLE IF NOT EXISTS `shakecast_user` (
  `SHAKECAST_USER` int(11) NOT NULL AUTO_INCREMENT,
  `EMAIL_ADDRESS` varchar(255) DEFAULT NULL,
  `PHONE_NUMBER` varchar(32) DEFAULT NULL,
  `FULL_NAME` varchar(32) DEFAULT NULL,
  `PASSWORD` varchar(64) DEFAULT NULL,
  `USERNAME` varchar(32) DEFAULT NULL,
  `USER_TYPE` varchar(10) NOT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SHAKECAST_USER`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=49 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `shakemap`
-- 

DROP TABLE IF EXISTS `shakemap`;
CREATE TABLE IF NOT EXISTS `shakemap` (
  `SHAKEMAP_ID` varchar(80) NOT NULL,
  `SHAKEMAP_VERSION` int(11) NOT NULL,
  `SHAKEMAP_STATUS` varchar(10) NOT NULL,
  `EVENT_ID` varchar(80) NOT NULL,
  `EVENT_VERSION` int(11) NOT NULL,
  `GENERATING_SERVER` int(11) NOT NULL,
  `SHAKEMAP_REGION` char(2) NOT NULL,
  `GENERATION_TIMESTAMP` datetime DEFAULT NULL,
  `RECEIVE_TIMESTAMP` datetime DEFAULT NULL,
  `LAT_MIN` double DEFAULT NULL,
  `LAT_MAX` double DEFAULT NULL,
  `LON_MIN` double DEFAULT NULL,
  `LON_MAX` double DEFAULT NULL,
  `BEGIN_TIMESTAMP` datetime DEFAULT NULL,
  `END_TIMESTAMP` datetime DEFAULT NULL,
  `SEQ` int(11) NOT NULL AUTO_INCREMENT,
  `SUPERCEDED_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SHAKEMAP_ID`,`SHAKEMAP_VERSION`),
  UNIQUE KEY `SHAKEMAP_SEQ_IDX` (`SEQ`),
  KEY `SEQ` (`SEQ`),
  KEY `SHAKEMAP_EVENT_ID_IDX` (`EVENT_ID`,`EVENT_VERSION`),
  KEY `SHAKEMAP_LAT_LON_IDX` (`LAT_MIN`,`LON_MAX`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5079 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `shakemap_metric`
-- 

DROP TABLE IF EXISTS `shakemap_metric`;
CREATE TABLE IF NOT EXISTS `shakemap_metric` (
  `SHAKEMAP_ID` varchar(80) NOT NULL,
  `SHAKEMAP_VERSION` int(11) NOT NULL,
  `METRIC` varchar(10) NOT NULL,
  `VALUE_COLUMN_NUMBER` tinyint(4) DEFAULT NULL,
  `MAX_VALUE` double DEFAULT NULL,
  `MIN_VALUE` double DEFAULT NULL,
  PRIMARY KEY (`SHAKEMAP_ID`,`SHAKEMAP_VERSION`,`METRIC`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `shakemap_parameter`
-- 

DROP TABLE IF EXISTS `shakemap_parameter`;
CREATE TABLE IF NOT EXISTS `shakemap_parameter` (
  `SHAKEMAP_ID` varchar(80) NOT NULL,
  `SHAKEMAP_VERSION` int(11) NOT NULL,
  `SRC_MECH` varchar(40) DEFAULT NULL,
  `FAULTFILES` varchar(256) DEFAULT NULL,
  `SITE_CORRECTION` varchar(40) DEFAULT NULL,
  `SITECORR_REGIME` varchar(10) DEFAULT NULL,
  `PGM2MI` varchar(40) DEFAULT NULL,
  `MISCALE` varchar(40) DEFAULT NULL,
  `MI2PGM` varchar(40) DEFAULT NULL,
  `GMPE` varchar(40) DEFAULT NULL,
  `BIAS` varchar(40) DEFAULT NULL,
  `BIAS_LOG_AMP` varchar(4) DEFAULT NULL,
  `IPE` varchar(40) DEFAULT NULL,
  `MI_BIAS` double DEFAULT NULL,
  `MEAN_UNCERTAINTY` double DEFAULT NULL,
  `GRADE` varchar(4) DEFAULT NULL,
  `RECEIVE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SHAKEMAP_ID`,`SHAKEMAP_VERSION`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `shakemap_region`
-- 

DROP TABLE IF EXISTS `shakemap_region`;
CREATE TABLE IF NOT EXISTS `shakemap_region` (
  `SHAKEMAP_REGION` char(2) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SHAKEMAP_REGION`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `shakemap_status`
-- 

DROP TABLE IF EXISTS `shakemap_status`;
CREATE TABLE IF NOT EXISTS `shakemap_status` (
  `SHAKEMAP_STATUS` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SHAKEMAP_STATUS`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `station`
-- 

DROP TABLE IF EXISTS `station`;
CREATE TABLE IF NOT EXISTS `station` (
  `STATION_ID` int(11) NOT NULL AUTO_INCREMENT,
  `STATION_NETWORK` varchar(10) NOT NULL,
  `EXTERNAL_STATION_ID` varchar(32) DEFAULT NULL,
  `STATION_NAME` varchar(128) DEFAULT NULL,
  `SOURCE` varchar(255) DEFAULT NULL,
  `COMMTYPE` varchar(32) DEFAULT NULL,
  `LATITUDE` double NOT NULL,
  `LONGITUDE` double NOT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`STATION_ID`),
  UNIQUE KEY `STATION_EXT_ID_IDX` (`STATION_NETWORK`,`EXTERNAL_STATION_ID`),
  KEY `LATITUDE` (`LATITUDE`),
  KEY `STATION_NAME` (`STATION_NAME`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=20451 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `station_facility`
-- 

DROP TABLE IF EXISTS `station_facility`;
CREATE TABLE IF NOT EXISTS `station_facility` (
  `FACILITY_ID` int(11) NOT NULL,
  `STATION_ID` int(11) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`FACILITY_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `station_shaking`
-- 

DROP TABLE IF EXISTS `station_shaking`;
CREATE TABLE IF NOT EXISTS `station_shaking` (
  `STATION_ID` int(11) NOT NULL,
  `GRID_ID` int(11) NOT NULL,
  `RECORD_ID` int(11) NOT NULL AUTO_INCREMENT,
  `value_1` double DEFAULT NULL,
  `value_2` double DEFAULT NULL,
  `value_3` double DEFAULT NULL,
  `value_4` double DEFAULT NULL,
  `value_5` double DEFAULT NULL,
  `value_6` double DEFAULT NULL,
  PRIMARY KEY (`RECORD_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=270219 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `temp_facility`
-- 

DROP TABLE IF EXISTS `temp_facility`;
CREATE TABLE IF NOT EXISTS `temp_facility` (
  `facility_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `user_delivery_method`
-- 

DROP TABLE IF EXISTS `user_delivery_method`;
CREATE TABLE IF NOT EXISTS `user_delivery_method` (
  `USER_DELIVERY_METHOD_ID` int(11) NOT NULL AUTO_INCREMENT,
  `SHAKECAST_USER` int(11) NOT NULL,
  `DELIVERY_METHOD` varchar(10) NOT NULL,
  `DELIVERY_ADDRESS` varchar(255) NOT NULL,
  `PRIORITY` int(11) DEFAULT NULL,
  `AUXILIARY_DATA` varchar(255) DEFAULT NULL,
  `ACTKEY` varchar(32) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`USER_DELIVERY_METHOD_ID`),
  KEY `USER_DELIVERY_METHOD_ID` (`USER_DELIVERY_METHOD_ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=215 ;

-- --------------------------------------------------------

-- 
-- Table structure for table `user_type`
-- 

DROP TABLE IF EXISTS `user_type`;
CREATE TABLE IF NOT EXISTS `user_type` (
  `USER_TYPE` varchar(10) NOT NULL,
  `NAME` varchar(32) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_USERNAME` varchar(32) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`USER_TYPE`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

-- 
-- Table structure for table `yes_no`
-- 

DROP TABLE IF EXISTS `yes_no`;
CREATE TABLE IF NOT EXISTS `yes_no` (
  `ID` int(11) DEFAULT NULL,
  `NAME` varchar(4) DEFAULT NULL,
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
