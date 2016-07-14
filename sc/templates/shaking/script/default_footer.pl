#!/usr/local/sc/sc.bin/perl

open F, ">> c:/temp/shakecast.kml" or die "Can't open: $!\n";

print F <<__KML__;
</Folder>
</Document>
</kml>
__KML__

close F;

