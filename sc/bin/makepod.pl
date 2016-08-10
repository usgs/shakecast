#!/usr/local/bin/perl

use strict;
use warnings;

use File::Path;
use FindBin;

use Pod::Html;
use Pod::Find;

use vars qw(@ARGV %sources $htmldir);

my $root = $FindBin::Bin;
$root =~ s#.bin$##;
$htmldir = "$root/html";

my @dirs = map { "$root/$_" } qw(bin lib scripts);

%sources = Pod::Find::pod_find(@dirs);

# process each file
foreach my $src (sort keys %sources) {
    $src =~ tr#\\#/#;
    print "$src\n";
    my $html;
    ($html = $src) =~ s/(pl|pm|pod)$/html/i;
    $html =~ s#^$root/##i;
    my $d;
    ($d = $html) =~ s#/[^/]+$##;
    $d = "$htmldir/$d";
    print STDERR "file=$html, dir=$d\n";
    mkpath($d) unless -d $d;
    pod2html(
	"--header",
	"--css=$root/html/style.css",
	"--outfile=$htmldir/$html",
	"--htmldir=$htmldir",
	$src);
}


