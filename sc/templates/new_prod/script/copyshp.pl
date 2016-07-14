#!/usr/local/sc/sc.bin/perl

use File::Copy;

my $destination = '/tmp/%EVENT_ID%_%EVENT_VERSION%_shape.zip';
my $data_dir = '/usr/local/sc/data/%EVENT_ID%-%EVENT_VERSION%';
my $rc = 0;

if (-f "$data_dir/shape.zip") {
    copy "$data_dir/shape.zip", $destination;
} else {
    print STDERR "shape file zip for event %EVENT_ID%-%EVENT_VERSION% not readable\n";
    $rc = 1;
}

exit $rc;


#####
