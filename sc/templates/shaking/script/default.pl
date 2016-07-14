#!/usr/local/sc/sc.bin/perl

open F, ">c:/temp/shaking.txt" or die "Can't open: $!\n";

print F "Test it: ", scalar(localtime), "\n";

print F "Addr: %DELIVERY_ADDRESS%\n";

#####
print F "Number of Facilities Reported: %_ITEMNO%\n";
print F "Max Value: MMI: %_MAX_METRIC_MMI%; \n";
print F "Acceleration: %_MAX_METRIC_PGA:|NULL|;(not measured)%\n";
print F "Number of Reports of Shaking over Threshold:  %_ITEMNO%\n";

print F "%FACILITY_NAME%\n";
print F "%METRIC%\n";
print F "%GRID_VALUE%\n";

close F;

exit;