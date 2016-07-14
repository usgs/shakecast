#!/usr/local/sc/sc.bin/perl

my $tmp = "/tmp/junk$$.txt";

open F, ">$tmp" or die "Can't open $tmp: $!\n";

print F "Date: ", scalar(localtime), "\n";
print F "Event ID: %EVENT_ID%\n";
print F "Addr: %DELIVERY_ADDRESS%\n";

#####
