#!/usr/local/sc/sc.bin/perl

$event = "%EVENT_ID%";
$event =~ s/_scte.*$//;

open F, ">c:/temp/shakecast.kml" or die "Can't open: $!\n";

print F <<__KML__;
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<kml xmlns="http://earth.google.com/kml/2.0">
<Document>
<Style id="stationIcon">
<IconStyle>
<scale>0.5</scale>
<Icon>
<href>root://icons/palette-4.png</href>
<x>128</x>
<y>0</y>
<w>32</w>
<h>32</h>
</Icon>
</IconStyle>
</Style>
<GroundOverlay>
<name>ShakeMap</name>
<LookAt>
<longitude>%LON%</longitude>
<latitude>%LAT%</latitude>
<range>300000</range>
<tilt>0</tilt>
<heading>0</heading>
</LookAt>
<color>9effffff</color>
<drawOrder>1</drawOrder>
<Icon>
<href>http://earthquake.usgs.gov/shakemap/global/shake/$event/download/ii_overlay.png</href>
</Icon>
<LatLonBox>
<north>%BOUND_NORTH%</north>
<south>%BOUND_SOUTH%</south>
<east>%BOUND_EAST%</east>
<west>%BOUND_WEST%</west>
</LatLonBox>
</GroundOverlay>
<Placemark>
<description>Event ID: &lt;b&gt;%EVENT_ID%&lt;/b&gt;&lt;br&gt;Magnitude: &lt;b&gt;%MAGNITUDE%&lt;b&gt;&lt;br&gt;Date: %EVENT_TIMESTAMP%&lt;br&gt;Lat: %LAT%&lt;br&gt;Lon: %LON%&lt;br&gt;</description>
<name>Epicenter</name>
<visibility>1</visibility>
<open>0</open>
<Style>
<IconStyle>
<scale>0.75</scale>
<Icon>
<href>root://icons/palette-4.png</href>
<x>64</x>
<y>32</y>
<w>32</w>
<h>32</h>
</Icon>
</IconStyle>
</Style>
<Point>
<extrude>0</extrude>
<tessellate>0</tessellate>
<altitudeMode>clampToGround</altitudeMode>
<coordinates>%LON%,%LAT%,0</coordinates>
</Point>
</Placemark>
<ScreenOverlay>
<name>Intensity Scale</name>
<Icon>
<href>http://earthquake.usgs.gov/shakemap/global/shake/icons/scale_c.jpg</href>
</Icon>
<overlayXY x="0" y="1" xunits="fraction" yunits="fraction" />
<screenXY x="0" y="1" xunits="fraction" yunits="fraction" />
<size x="0" y="0" xunits="fraction" yunits="fraction" />
</ScreenOverlay>
<Folder>
<description>Displays the seismic stations on the map and the peak ground motion at each.</description>
<name>Seismic Stations</name>
<visibility>0</visibility>
<open>0</open>
__KML__

close F;

