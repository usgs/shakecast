---
title: XML/JSON Metadata Formats
tags: [troubleshooting, shakecast_v3]
keywords: appendix, product, format
last_updated: July 3, 2016
sidebar: v3_sidebar
permalink: v3_operator_appendb.html
folder: v3
---

Extensible Markup Language (known by the acronym XML) is a widely used and easily implemented method of exchanging data between disparate computer systems.  The ShakeCast System receives ShakeMap information in XML from the USGS web server and uses XML to communicate all kinds of information between ShakeCast servers:

- Data about ShakeCast Servers and the ShakeCast software itself
- Data about events (earthquakes) and products (data files) available on the network
- Status information that helps the administrators of ShakeCast servers tell if their network is running smoothly

JavaScript Object Notation (JSON) is a text-based open standard designed for human-readable data.  ShakeCast V3 adopts JSON as an alternative to the XML data for exchange of earthquake information.  Specifically, the V3 system receives the USGS earthquake feed in the format ofgeographic data structures (GeoJSON) in order to retrieve selected earthquake products beyond ShakeMaps.  The ShakeCast system also provides its own JSON data, primarily for the purpose of web presentations and for persistent data storage.

All locally generated XML and JSON files are stored in earthquake specific directory as cached content to be used  primarily by the ShakeCast web server.  This Section documents the ShakeCast XML and JSON file formats.

## ShakeMap RSS Feed XML

RSS, which stands for "Really Simple Syndication" (sometimes called Rich Site Summary), has been adopted by news services, weblogs, and other online information services to send content to subscribers. After subscribing to an RSS feed, you will be notified when new content is available without having to visit the web site.  The USGS ShakeMap RSS data feed contains

{% raw %}
```xml
<?xml version="1.0"?>
<?xml-stylesheet href="shake_feed.xsl" type="text/xsl" media="screen"?>
<rss  xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"  xmlns:dc="http://purl.org/dc/elements/1.1/"  xmlns:eq="http://earthquake.usgs.gov/rss/1.0/"  version="2.0">
<channel>
<title>USGS Earthquake ShakeMaps</title>
<description>List of ShakeMaps for events in the last 30 days</description>
<link>http://earthquake.usgs.gov/</link>
<dc:publisher>U.S. Geological Survey</dc:publisher>
<pubDate>Mon, 16 Jul 2007 20:23:29 +0000</pubDate>
<item>
<title>6.7 - NEAR THE WEST COAST OF HONSHU, JAPAN</title>
<description><![CDATA[<img src="http://earthquake.usgs.gov/eqcenter/images/thumbs/shakemap_global_2007ewac.jpg" width="100" style="float:left;" />Date: Mon, 16 Jul 2007 01:13:27 GMT<br />Lat/Lon: 37.574/138.44<br />Depth: 49<br />]]></description>
<link>http://earthquake.usgs.gov/eqcenter/shakemap/global/shake/2007ewac/</link>
<pubDate>Mon, 16 Jul 2007 01:13:27 GMT</pubDate>
<geo:lat>37.574</geo:lat>
<geo:long>138.44</geo:long>
<dc:subject>6</dc:subject>
<eq:seconds>1184598989</eq:seconds>
<eq:depth>49</eq:depth>
<eq:region>global</eq:region>
<eq:shakethumb>http://earthquake.usgs.gov/eqcenter/images/thumbs/shakemap_global_2007ewac.jpg</eq:shakethumb>
</item>
</channel>
</rss>
```
{% endraw %}

**Event XML**

A ShakeCast Event is described by Event XML.  A sample Event XML is below:

{% raw %}
```xml
<event event_id="SAF_south7.8_se" event_version="1" event_status="RELEASED" event_type="SCENARIO" event_name="" event_location_description="SAF-southern M7.8 Scenario" event_timestamp="2006-08-03 12:00:00" external_event_id="SAF_south7.8_se" magnitude="7.8" lat="33.922270" lon="-116.469670" />
```
{% endraw %}

**Product XML**

A ShakeCast Product is described by Product XML.  A sample Product XML is shown in the following figure:

{% raw %}
```xml
<product shakemap_id="SAF_south7.8_se" shakemap_version="1" product_type="HAZUS" product_status="RELEASED" generating_server="1" generation_timestamp="2007-02-08 16:07:03" lat_min="32.405603" lat_max="35.455603" lon_min="-114.769670" lon_max="-119.353003" />
```
{% endraw %}

**ShakeMap XML**

A ShakeCast ShakeMap is described by ShakeMap XML.   A sample ShakeMap XML is shown in the following figure:

{% raw %}
```xml
<shakemap shakemap_id="SAF_south7.8_se" shakemap_version="1" event_id="SAF_south7.8_se" event_version="1" shakemap_status="RELEASED" generating_server="1" shakemap_region="ci" generation_timestamp="2007-02-08 16:07:03" begin_timestamp="2007-02-08 16:07:03" end_timestamp="2007-02-08 16:07:03" lat_min="32.405603" lat_max="35.455603" lon_min="-119.353003" lon_max="-114.769670">
<metric metric_name="MMI" min_value="10.0000" max_value="9.4900" />
<metric metric_name="PGA" min_value="10.0002" max_value="9.9989" />
<metric metric_name="PGV" min_value="10.0000" max_value="99.9109" />
<metric metric_name="PSA03" min_value="10.0005" max_value="99.9687" />
<metric metric_name="PSA10" min_value="10.0007" max_value="99.9747" />
<metric metric_name="PSA30" min_value="1.7880" max_value="9.9989" />
</shakemap>
```
{% endraw %}



## Exposure XML

A ShakeCast Exposure is described by Exposure XML.   A sample Exposure XML is shown in the following figure:

{% raw %}
```xml
<?xml version="1.0" encoding="UTF-8"?>
<exposure>
        xmlns:xlink= ["http://www.w3.org/1999/xlink"](http://www.w3.org/1999/xlink)
        code_version="Pager 0.2.0"
        event_id="usneb6_06"
        version="1"
        timestamp="2006-10-11T16:07:03Z"
        source="us"
        status="RELEASED">
        <event
                type="ACTUAL"
                id="urn:earthquake.usgs.gov:origin:usneb6_06:1"
                magnitude="6.3"
                depth="17.1"
                latitude="-7.955000"
                longitude="110.430000"
                timestamp="2006-05-26T22:54:01GMT"
                description="JAVA, INDONESIA" />
        <shakemap
                code_version="3.1.1 GSM"
                id="urn:earthquake.usgs.gov:shakemap:usneb6_06:6"
                version="6"
                timestamp="2006-10-11T16:07:03Z"
                source="us"
                status="RELEASED" />
        <summary type="MMI" units="mmi">
                <bin label="I" value="1" range="[.5,1.5)" keywords="incomplete">
                        <measure type="population" value="0" units="people" source="landscan2005" />
                </bin>
                <bin label="II" value="2" range="[1.5,2.5)" keywords="incomplete">
                        <measure type="population" value="0" units="people" />
                </bin>
                <bin label="III" value="3" range="[2.5,3.5)" keywords="incomplete">
                        <measure type="population" value="963142" units="people" />
                </bin>
        </summary>
</exposure>
```
{% endraw %}

## Facility Import XML

Facility data combining basic facility information, probabilistic fragility and feature data can be exported directly from Microsoft Excel using the XML Spreadsheet 2003 format to be imported into ShakeCast.   A sample facility import XML is shown in the following figure:

{% raw %}
```xml
<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Lin, Kuo-wan</Author>
  <LastAuthor>Lin, Kuo-wan</LastAuthor>
  <Created>2013-08-30T19:13:27Z</Created>
  <Version>14.00</Version>
 </DocumentProperties>
 <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">
  <AllowPNG/>
 </OfficeDocumentSettings>
 <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
  <WindowHeight>7740</WindowHeight>
  <WindowWidth>19155</WindowWidth>
  <WindowTopX>120</WindowTopX>
  <WindowTopY>90</WindowTopY>
  <ProtectStructure>False</ProtectStructure>
  <ProtectWindows>False</ProtectWindows>
 </ExcelWorkbook>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="s62">
   <Alignment ss:Vertical="Bottom" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"
    ss:Bold="1"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="s63">
   <Alignment ss:Horizontal="Center" ss:Vertical="Bottom" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"
    ss:Bold="1"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="s64">
   <Alignment ss:Horizontal="Center" ss:Vertical="Bottom" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"
    ss:Bold="1"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="Fixed"/>
  </Style>
  <Style ss:ID="s65">
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="s66">
   <Alignment ss:Horizontal="Center" ss:Vertical="Bottom"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="s67">
   <Alignment ss:Horizontal="Center" ss:Vertical="Bottom"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="Fixed"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Sheet1">
  <Table ss:ExpandedColumnCount="19" ss:ExpandedRowCount="31921" x:FullColumns="1"
   x:FullRows="1" ss:DefaultRowHeight="15">
   <Row ss:AutoFitHeight="0" ss:Height="47.25" ss:StyleID="s62">
    <Cell><Data ss:Type="String">EXTERNAL_FACILITY_ID</Data></Cell>
    <Cell><Data ss:Type="String">FACILITY_TYPE</Data></Cell>
    <Cell><Data ss:Type="String">COMPONENT_CLASS</Data></Cell>
    <Cell><Data ss:Type="String">COMPONENT</Data></Cell>
    <Cell><Data ss:Type="String">FACILITY_NAME</Data></Cell>
    <Cell><Data ss:Type="String">SHORT_NAME</Data></Cell>
    <Cell><Data ss:Type="String">DESCRIPTION</Data></Cell>
    <Cell><Data ss:Type="String">FEATURE:GEOM_TYPE</Data></Cell>
    <Cell><Data ss:Type="String">FEATURE:GEOM</Data></Cell>
    <Cell><Data ss:Type="String">FEATURE:DESCRIPTION</Data></Cell>
    <Cell ss:StyleID="s63"><Data ss:Type="String">METRIC</Data></Cell>
    <Cell ss:StyleID="s63"><Data ss:Type="String">METRIC:ALPHA:GREEN</Data></Cell>
    <Cell ss:StyleID="s63"><Data ss:Type="String">METRIC:BETA:GREEN</Data></Cell>
    <Cell ss:StyleID="s64"><Data ss:Type="String">METRIC:ALPHA:YELLOW</Data></Cell>
    <Cell ss:StyleID="s63"><Data ss:Type="String">METRIC:BETA:YELLOW</Data></Cell>
    <Cell ss:StyleID="s64"><Data ss:Type="String">METRIC:ALPHA:ORANGE</Data></Cell>
    <Cell ss:StyleID="s63"><Data ss:Type="String">METRIC:BETA:ORANGE</Data></Cell>
    <Cell ss:StyleID="s64"><Data ss:Type="String">METRIC:ALPHA:RED</Data></Cell>
    <Cell ss:StyleID="s63"><Data ss:Type="String">METRIC:BETA:RED</Data></Cell>
   </Row>
   <Row ss:StyleID="s65">
    <Cell><Data ss:Type="String">57C0705</Data></Cell>
    <Cell><Data ss:Type="String">BRIDGE_LC</Data></Cell>
    <Cell><Data ss:Type="String">SYSTEM</Data></Cell>
    <Cell><Data ss:Type="String">SYSTEM</Data></Cell>
    <Cell><Data ss:Type="String">57C0705 - SANTA MARIA CREEK S/E FORK</Data></Cell>
    <Cell><Data ss:Type="String">57C0705</Data></Cell>
    <Cell><Data ss:Type="String">0.08M N/O HANSON LANE</Data></Cell>
    <Cell><Data ss:Type="String">POINT</Data></Cell>
    <Cell><Data ss:Type="String">-116.8664,33.0275,0</Data></Cell>
    <Cell><Data ss:Type="String">                 &lt;table border=&quot;0&quot; cellpadding=&quot;3&quot; cellspacing=&quot;3&quot; height=&quot;250&quot; width=&quot;350&quot;&gt;                         &lt;tbody&gt;                                 &lt;tr&gt;                                         &lt;td colspan=&quot;2&quot; style=&quot;background-color: rgb(0, 0, 0);&quot;&gt;                                                 &lt;span style=&quot;color:#ffffff;&quot;&gt;&lt;span style=&quot;font-size: 16px;&quot;&gt;&lt;strong&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;SANTA MARIA CREEK S/E FORK&lt;/span&gt;&lt;/strong&gt;&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                 &lt;/tr&gt;                                 &lt;tr&gt;                                         &lt;td style=&quot;text-align: right; background-color: rgb(153, 153, 153);&quot;&gt;                                                 &lt;strong&gt;&lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;Owner:&lt;/span&gt;&lt;/span&gt;&lt;/strong&gt;&lt;/td&gt;                                         &lt;td style=&quot;background-color: rgb(153, 153, 153);&quot;&gt;                                                 &lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;Local&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                 &lt;/tr&gt;                                 &lt;tr&gt;                                         &lt;td style=&quot;text-align: right; background-color: rgb(204, 204, 204);&quot;&gt;                                                 &lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;&lt;strong&gt;Bridge No:&lt;/strong&gt;&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                         &lt;td style=&quot;background-color: rgb(204, 204, 204);&quot;&gt;                                                 &lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;57C0705&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                 &lt;/tr&gt;                                 &lt;tr&gt;                                         &lt;td style=&quot;text-align: right; background-color: rgb(153, 153, 153);&quot;&gt;                                                 &lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;&lt;strong&gt;Location:&lt;/strong&gt;&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                         &lt;td style=&quot;background-color: rgb(153, 153, 153);&quot;&gt;                                                 &lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;0.08M N/O HANSON LANE&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                 &lt;/tr&gt;                                 &lt;tr&gt;                                         &lt;td style=&quot;text-align: right; background-color: rgb(204, 204, 204);&quot;&gt;                                                 &lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;&lt;strong&gt;Description:&lt;/strong&gt;&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                         &lt;td style=&quot;background-color: rgb(204, 204, 204);&quot;&gt;                                                 &lt;span style=&quot;font-size:12px;&quot;&gt;&lt;span style=&quot;font-family: arial,helvetica,sans-serif;&quot;&gt;1-span; Prestressed concrete; Slab; 12 deg skew; 13 m Max Span Length; NBI Class 501; Built 2001; Improved 2001&lt;/span&gt;&lt;/span&gt;&lt;/td&gt;                                 &lt;/tr&gt;                         &lt;/tbody&gt;                 &lt;/table&gt; </Data></Cell>
    <Cell ss:StyleID="s66"><Data ss:Type="String">PSA10</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">10</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">0.6</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">98.901344820675007</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">0.6</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">118.68161378481</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">0.6</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">168.13228619514749</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">0.6</Data></Cell>
   </Row>
   <Row ss:StyleID="s65">
    <Cell><Data ss:Type="String">57C0705</Data></Cell>
    <Cell><Data ss:Type="String">BRIDGE_LC</Data></Cell>
    <Cell><Data ss:Type="String">GENERAL_DISTRESS</Data></Cell>
    <Cell><Data ss:Type="String">ABUTMENT</Data></Cell>
    <Cell ss:Index="11" ss:StyleID="s66"><Data ss:Type="String">PSA10</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">8.2100000000000009</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">0.6</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">90.152101901050102</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="Number">0.6</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String"></Data></Cell>
   </Row>
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <Selected/>
   <Panes>
    <Pane>
     <Number>3</Number>
     <ActiveRow>1</ActiveRow>
     <RangeSelection>R2:R31921</RangeSelection>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
 <Worksheet ss:Name="Sheet2">
  <Table ss:ExpandedColumnCount="1" ss:ExpandedRowCount="1" x:FullColumns="1"
   x:FullRows="1" ss:DefaultRowHeight="15">
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
 <Worksheet ss:Name="Sheet3">
  <Table ss:ExpandedColumnCount="1" ss:ExpandedRowCount="1" x:FullColumns="1"
   x:FullRows="1" ss:DefaultRowHeight="15">
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>
```
{% endraw %}

## Facility Feature Shaking XML

Facility feature shaking XML describes ground-shaking estimates within or along the footprints of facilities for the specified ShakeMap.  It contains shaking estimates only for facilities with defined geometry feature.  A sample facility feature shaking XML is shown below:

{% raw %}
```xml
<?xml version="1.0" encoding="utf-8"?>
<kml>
<grid_field index="1" name="LON"/>
<grid_field index="2" name="LAT"/>
<grid_field index="3" name="PGA"/>
<grid_field index="4" name="SVEL"/>
<grid_field index="5" name="PSA03"/>
<grid_field index="6" name="MMI"/>
<grid_field index="7" name="PGV"/>
<grid_field index="8" name="PSA30"/>
<grid_field index="9" name="PSA10"/>
<facility id="27-A-a">
<geom_shaking>-117.676512368421,33.5527855263158,13.64,330,24.41,6.04,13.19,3.16,12.95
-117.677138857258,33.5540927826784,13.64,330,24.41,6.04,13.19,3.16,12.95
-117.678030566667,33.5552422,13.64,330,24.41,6.04,13.19,3.16,12.95
-117.679133671875,33.55618890625,13.64,330,24.41,6.04,13.19,3.16,12.95
-117.680390588235,33.5569211764706,13.64,330,24.41,6.04,13.19,3.16,12.95
-117.681761858527,33.5574195542636,13.64,330,24.41,6.04,13.19,3.16,12.95
-117.683193220238,33.5576959464286,13.64,330,24.41,6.04,13.19,3.16,12.95
</geom_shaking>
<geom_type>POLYLINE</geom_type>
</facility>
</kml>
```
{% endraw %}

## USGS Earthquake JSON Feed

USGS earthquake JSON feed provides information of earthquakes and related products available on the USGS web site.  A sample earthquake JSON feed is shown below:

{% raw %}
```json
{
type: "FeatureCollection",
metadata: {
generated: 1379445250000,
url: "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson",
title: "USGS Magnitude 1.0+ Earthquakes, Past Day",
status: 200,
api: "1.0.11",
count: 101
},
features: [
{
type: "Feature",
properties: {
mag: 1.1,
place: "41km SSW of North Pole, Alaska",
time: 1379439188000,
updated: 1379439776911,
tz: -480,
url: "http://earthquake.usgs.gov/earthquakes/eventpage/ak10807381",
detail: "http://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/ak10807381.geojson",
felt: null,
cdi: null,
mmi: null,
alert: null,
status: "AUTOMATIC",
tsunami: null,
sig: 19,
net: "ak",
code: "10807381",
ids: ",ak10807381,",
sources: ",ak,",
types: ",general-link,geoserve,nearby-cities,origin,",
nst: null,
dmin: null,
rms: 0.27,
gap: null,
magType: "Ml",
type: "earthquake",
title: "M 1.1 - 41km SSW of North Pole, Alaska"
},
geometry: {
type: "Point",
coordinates: [
-147.7486,
64.4188,
9.7
]
},
id: "ak10807381"
},
```
{% endraw %}

## Facility Fragility Probability JSON

Facility fragility probability JSON describes ground shaking estimates within or along the footprints of facilities for the specified ShakeMap.  It contains shaking estimates only for facilities with defined geometry feature.  A sample facility feature shaking XML is shown below:

{% raw %}
```
{
"26074":
        [
                {
                        "damage_level":"GREEN,YELLOW",
                        "facility_id":"26074",
                        "metric":"PGA",
                        "prob_damage_level":"NA",
                        "component":"LANDSLIDE",
                        "class":"GROUND_FAILURE_HAZARD",
                        "cdf":"0,0",
                        "prob_distribution":"1,0,0"
                },
                {
                        "damage_level":"GREEN,YELLOW",
                        "facility_id":"26074",
                        "metric":"PGA",
                        "prob_damage_level":"NA",
                        "component":"LIQUEFACTION",
                        "class":"GROUND_FAILURE_HAZARD",
                        "cdf":"0,0",
                        "prob_distribution":"1,0,0"
                }
        ],
"25957":
        [
                {
                        "damage_level":"GREEN,YELLOW",
                        "facility_id":"25957",
                        "metric":"PGA",
                        "prob_damage_level":"NA",
                        "component":"LANDSLIDE",
                        "class":"GROUND_FAILURE_HAZARD",
                        "cdf":"0,0",
                        "prob_distribution":"1,0,0"
                },
                {
                        "damage_level":"GREEN,YELLOW",
                        "facility_id":"25957",
                        "metric":"PGA",
                        "prob_damage_level":"NA",
                        "component":"LIQUEFACTION",
                        "class":"GROUND_FAILURE_HAZARD",
                        "cdf":"0,0",
                        "prob_distribution":"1,0,0"
                }
        ]
}
```
{% endraw %}



## Event JSON

JSON equivalent of ShakeCast Event XML.  A sample Event JSON is shown in the following figure:

{% raw %}
```
{
    "shakemap_version": "1",
    "magnitude": "3.66",
    "event_id": "nn00423851",
    "lat": "37.5105",
    "superceded_timestamp": null,
    "shakemap_id": "nn00423851",
    "event_source_type": "",
    "seq": "33443",
    "mag_type": "Mwr",
    "event_name": "",
    "event_status": "NORMAL",
    "event_type": "ACTUAL",
    "event_version": "7",
    "initial_version": "0",
    "depth": "5.5",
    "external_event_id": "",
    "grid_id": "3746",
    "event_location_description": "32km WNW of Alamo, Nevada",
    "event_region": "nn",
    "event_timestamp": "2013-09-16 14:12:31",
    "lon": "-115.4841",
    "major_event": null,
    "receive_timestamp": "2013-09-16 15:43:25"
}
```
{% endraw %}

## ShakeMap JSON

JSON equivalent of ShakeCast ShakeMap XML.  A sample Event JSON is shown below:

{% raw %}
```
{
    "magnitude": "3.51",
    "shakemap_version": "3",
    "event_id": "nn00423851",
    "lat": "37.5135",
    "superceded_timestamp": "2013-09-16 14:20:42",
    "metric": [
        {
            "shakemap_version": "3",
            "min_value": "1",
            "metric_name": "MMI",
            "shakemap_id": "nn00423851",
            "max_value": "5.33",
            "value_column_number": "3"
        },
        {
            "shakemap_version": "3",
            "min_value": "0.01",
            "metric_name": "PGA",
            "shakemap_id": "nn00423851",
            "max_value": "3.11",
            "value_column_number": "1"
        },
        {
            "shakemap_version": "3",
            "min_value": "0",
            "metric_name": "PGV",
            "shakemap_id": "nn00423851",
            "max_value": "0.38",
            "value_column_number": "2"
        },
        {
            "shakemap_version": "3",
            "min_value": "0.01",
            "metric_name": "PSA03"
            "shakemap_id": "nn00423851",
            "max_value": "3.5",
            "value_column_number": "4"
        },
        {
            "shakemap_version": "3",
            "min_value": "0",
            "metric_name": "PSA10",
            "shakemap_id": "nn00423851",
            "max_value": "0.13",
            "value_column_number": "5"
        },
        {
            "shakemap_version": "3",
            "min_value": "0",
            "metric_name": "PSA30",
            "shakemap_id": "nn00423851",
            "max_value": "0",
            "value_column_number": "6"
        },
        {
            "shakemap_version": "3",
            "min_value": "301.25",
            "metric_name": "SVEL",
            "shakemap_id": "nn00423851",
            "max_value": "1061",
            "value_column_number": "8"
        }
    ],
    "end_timestamp": "2013-09-16 15:26:55",
    "shakemap_id": "nn00423851",
    "lon_max": "-114.4841",
    "shakemap_region": "nn",
    "begin_timestamp": "2013-09-16 15:26:55",
    "seq": "33435",
    "lat_min": "36.7105",
    "mag_type": "ml",
    "event_type": "ACTUAL",
    "shakemap_status": "RELEASED",
    "lon_min": "-116.4841",
    "depth": "5.57",
    "event_version": "1",
    "generation_timestamp": "2013-09-16 15:26:55",
    "event_location_description": "32km WNW of Alamo, Nevada",
    "lat_max": "38.3105",
    "lon": "-115.4817",
    "event_timestamp": "2013-09-16 14:12:31",
    "generating_server": "1",
    "receive_timestamp": "2013-09-16 14:19:29"
}
```
{% endraw %}

## Shaking JSON

Shaking JSON describes ground shaking estimates at facility sites for the selected earthquake. A sample Shaking JSON is shown in the following figure:

{% raw %}
```
{
    "facility_probability": {},
    "grid": {
        "shakemap_version": "3",
        "shakemap_id": "nn00423851",
        "lon_max": "-114.4841",
        "lon_min": "-116.4841",
        "origin_lon": "-115.4841",
        "grid_id": "3749",
        "latitude_cell_count": "97",
        "origin_lat": "37.5105",
        "lat_max": "38.3105",
        "longitude_cell_count": "121",
        "lat_min": "36.7105",
        "receive_timestamp": "2013-09-17 19:34:32"
    },
    "facility_shaking": {
        "171187": {
            "pgv": "0.01",
            "psa10": "0",
            "facility_id": "171187",
            "svel": "784",
            "mmi": "1",
            "psa03": "0.01",
            "psa30": "0",
            "dist": "111.15",
            "pga": "0.02",
            "grid_id": "3749"
        },
        "169854": {
            "pgv": "0.01",
            "psa10": "0",
            "facility_id": "169854",
            "svel": "483.25",
            "mmi": "1.08",
            "psa03": "0.02",
            "psa30": "0",
            "dist": "86.76",
            "pga": "0.02",
            "grid_id": "3749"
        },
        "169641": {
            "pgv": "0.04",
            "psa10": "0.02",
            "facility_id": "169641",
            "svel": "460.5",
            "mmi": "3.08",
            "psa03": "0.15",
            "psa30": "0",
            "dist": "32.61",
            "pga": "0.15",
            "grid_id": "3749"
        }
    }
}
```
{% endraw %}

## Damage JSON

Damage JSON describes fragility settings and damage state estimates at facility sites for the selected earthquake. A sample Damage JSON is shown in the following figure:

{% raw %}
```
{
    "facility_probability": {},
    "grid": {
        "shakemap_version": "3",
        "lon_max": "-114.4841",
        "shakemap_id": "nn00423851",
        "lon_min": "-116.4841",
        "grid_id": "3749",
        "origin_lon": "-115.4841",
        "latitude_cell_count": "97",
        "origin_lat": "37.5105",
        "lat_max": "38.3105",
        "longitude_cell_count": "121",
        "lat_min": "36.7105",
        "receive_timestamp": "2013-09-16 15:29:51"
    },
    "damage_summary": {
        "GREEN": 2
    },
    "count": 2,
    "facility_attribute": null,
    "facility_damage": {
        "169854": {
            "psa10": "0",
            "pgv": "0.01",
            "facility_id": "169854",
            "low_limit": "1",
            "svel": "483.25",
            "lon_max": "-114.511",
            "metric": "MMI"
            "psa03": "0.02",
            "psa30": "0",
            "lat_min": "37.615",
            "damage_level": "GREEN",
            "facility_fragility_id": "877837",
            "mmi": "1.08",
            "dist": "86.76",
            "high_limit": "5",
            "lon_min": "-114.511",
            "facility_type": "CITY",
            "facility_name": "Caliente, NV (pop. 1.1K)",
            "pga": "0.02",
            "grid_id": "3749",
            "update_timestamp": null,
            "lat_max": "37.615",
            "update_username": null
        },
        "169641": {
            "psa10": "0.02",
            "pgv": "0.04",
            "facility_id": "169641",
            "low_limit": "1",
            "svel": "460.5",
            "lon_max": "-115.164",
            "metric": "MMI",
            "psa03": "0.15",
            "psa30": "0",
            "lat_min": "37.365",
            "damage_level": "GREEN",
            "facility_fragility_id": "877198",
            "mmi": "3.08",
            "dist": "32.61",
            "high_limit": "5",
            "lon_min": "-115.164",
            "facility_type": "CITY",
            "facility_name": "Alamo, NV (pop. < 1K)",
            "pga": "0.15",
            "grid_id": "3749",
            "update_timestamp": null,
            "lat_max": "37.365",
            "update_username": null
        }
    },
    "type": null
}
```
{% endraw %}

## Station JSON

Station JSON describes stations used to generate ShakeMap. A sample Station JSON is shown in the following figure:

{% raw %}
```
[
    {
        "source": "Southern California Seismic Network",
        "commtype": "DIG",
        "longitude": "-117.43391",
        "station_id": "7",
        "update_timestamp": "2011-01-11 10:07:08",
        "latitude": "34.55046",
        "station_network": "CI",
        "station_name": "Adelanto Receiving Station",
        "external_station_id": "ADO",
        "receive_timestamp": "2013-09-17 19:41:16"
    },
    {
        "source": "Southern California Seismic Network",
        "commtype": "DIG",
        "longitude": "-118.76699",
        "station_id": "8",
        "update_timestamp": "2011-01-11 10:07:08",
        "latitude": "34.14647",
        "station_network": "CI",
        "station_name": "Agoura",
        "external_station_id": "AGO",
        "receive_timestamp": "2013-09-17 19:41:16"
    },
    {
        "source": "Southern California Seismic Network",
        "commtype": "DIG",
        "longitude": "-118.29946",
        "station_id": "9",
        "update_timestamp": "2011-01-11 10:07:08",
        "latitude": "34.68708",
        "station_network": "CI",
        "station_name": "Antelope",
        "external_station_id": "ALP",
        "receive_timestamp": "2013-09-17 19:41:16"
},
]
```
{% endraw %}

## Product JSON

JSON equivalent of ShakeCast Product XML.  A sample Product JSON is shown below:

{% raw %}
```
{
    "shakemap_version": "3",
    "shakemap_id": "nn00423851",
    "lon_max": "-114.4841",
    "lon_min": "-116.4841",
    "update_timestamp": "2013-09-16 15:29:48",
    "product_status": "RELEASED",
    "generation_timestamp": "2013-09-16 15:26:55",
    "lat_max": "38.3105",
    "product": [
        {
            "product_file_exists": "1",
            "metric": "MMI",
            "name": "Instrumental Intensity JPEG",
            "max_value": null,
            "description": null,
            "product_type": "INTEN_JPG",
            "product_id": "111052",
            "min_value": null,
            "filename": "intensity.jpg",
            "url": null
        },
        {
            "product_file_exists": "1",
            "metric": "PGA",
            "name": "PGA JPEG",
            "max_value": null,
            "description": null,
            "product_type": "PGA_JPG",
            "product_id": "111059",
            "min_value": null,
            "filename": "pga.jpg",
            "url": null
        }
]
```
{% endraw %}

## Facility JSON

Facility JSON describes facilities currently populated inside the ShakeCast database. A sample Facility JSON is shown below:

{% raw %}
```
{
    "facility_id": "171293",
    "short_name": "01 0002",
    "model": [
        [
            {
                "damage_level": "YELLOW",
                "facility_id": "171293",
                "metric": "PSA10",
                "beta": "0.6",
                "facility_fragility_model_id": "1248",
                "update_timestamp": "2013-09-02 18:21:24",
                "component": "SUPPORT_RESTRAINER",
                "alpha": "90.1521019010501",
                "class": "SECONDARY",
                "update_username": "admin"
            },
            {
                "damage_level": "GREEN",
                "facility_id": "171293",
                "metric": "PSA10",
                "beta": "0.6",
                "facility_fragility_model_id": "1247",
                "update_timestamp": "2013-09-02 18:21:24",
                "component": "SUPPORT_RESTRAINER",
                "alpha": "9.94",
                "class": "SECONDARY",
                "update_username": "admin"
            }
        ]
    ],
    "lon_max": "-124.055065",
    "external_facility_id": "01 0002",
    "feature": [
        {
            "update_timestamp": "2013-09-02 18:21:24",
            "geom": "41.553771,-124.055065",
            "geom_type": "POINT",
            "facility_id": "171293",
            "update_username": "admin",
            "description": "    "
        }
    ],
    "attribute": [],
    "lat_min": "41.553771",
    "fragility_model": [
        {
            "abut_bearing": null,
            "system": null,
            "key": null,
            "landslide": null,
            "abutment": null,
            "support_seal": null,
            "hinge_restrainer": null,
            "abut_seal": null,
            "support_bearing": null,
            "column": null,
            "abut_restrainer": null,
            "hinge_seal": null,
            "response": null,
            "liquefaction": null,
            "hinge_bearing": null,
            "support_seat": null,
            "abut_seat": null,
            "hinge_seat": null,
            "foundation": null,
            "support_restrainer": null
        }
    ],
    "lon_min": "-124.055065",
    "description": "01-DN-101-8.14",
    "facility_name": "BRIDGE-123456",
    "facility_type": "BRIDGE",
    "update_timestamp": null,
    "lat_max": "41.553771",
    "fragility": [
        {
            "damage_level": "RED",
            "low_limit": "164.79416476536",
            "facility_id": "171293",
            "facility_fragility_id": "882593",
            "metric": "PSA10",
            "high_limit": "999999",
            "update_timestamp": null,
            "update_username": null
        },
        {
            "damage_level": "GREEN",
            "low_limit": "10",
            "facility_id": "171293",
            "facility_fragility_id": "882590",
            "metric": "PSA10",
            "high_limit": "96.937743796238",
            "update_timestamp": null,
            "update_username": null
        },
        {
            "damage_level": "YELLOW",
            "low_limit": "96.9377439796238",
            "facility_id": "171293",
            "facility_fragility_id": "882591",
            "metric": "PSA10",
            "high_limit": "116.325292775549",
            "update_timestamp": null,
            "update_username": null
        },
        {
            "damage_level": "ORANGE",
            "low_limit": "116.325292775549",
            "facility_id": "171293",
            "facility_fragility_id": "882592",
            "metric": "PSA10",
            "high_limit": "164.79416476536",
            "update_timestamp": null,
            "update_username": null
        }
    ],
    "update_username": null,
    "receive_timestamp": "2013-09-17 19:53:36"
}
```
{% endraw %}

{% include links.html %}
