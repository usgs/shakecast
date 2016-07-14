#!/bin/sh

# set server and ID to identify the source shakecast system

export server='gldcast.cr.usgs.gov'
export id='1000'

export ts="`date -u '+%Y-%m-%d %k:%M:%S GMT'`"

/usr/bin/perl /usr/local/sc/bin/sm_inject.pl --conf /usr/local/sc/conf/sm.conf <<__EOF__
<event
    event_id="heartbeat_${id}"
    event_version="1"
    event_status="NORMAL"
    event_type="HEARTBEAT"
    event_name="ShakeCast system heartbeat"
    event_location_description="ShakeCast Heartbeat from ${server}"
    event_timestamp="${ts}"
    external_event_id="heartbeat_${id}"
    magnitude="0"
    lat="35.00"
    lon="-117.00"
/>
__EOF__

