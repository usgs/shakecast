#!/usr/local/sc/sc.bin/perl

open F, ">> c:/temp/shakecast.kml" or die "Can't open: $!\n";

print F <<__KML__;
<Placemark>
<name>%FACILITY_NAME%</name>
<description>&lt;br&gt;Location: &lt;br&gt;Lat: %FACILITY_LAT% Lon: %FACILITY_LON% &lt;br&gt;%METRIC%: &lt;b&gt;%GRID_VALUE%&lt;br&gt;</description>
<visibility>0</visibility>
<styleUrl>#stationIcon</styleUrl>
<Point>
<extrude>0</extrude>
<tessellate>0</tessellate>
<altitudeMode>clampToGround</altitudeMode>
<coordinates>%FACILITY_LON%,%FACILITY_LAT%,0</coordinates>
</Point>
</Placemark>
__KML__

close F;

