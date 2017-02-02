#!/usr/local/bin/perl

use strict;
use warnings;

use File::Path qw(make_path remove_tree);
use FindBin;
my $wk_bin = '/opt/local/bin/wkhtmltopdf';
#my $url_base = 'http://127.0.0.1:4005/shakecast/';

my @htmls = <$FindBin::Bin/../_site/*.html>;

my $data_dir = "$FindBin::Bin/../pdf";
make_path($data_dir) unless (-d $data_dir);

foreach my $html (@htmls) {
    my ($file_name) = $html =~ /_site\/(.*).html/;
#    my $url_file = "$url_base/$file_name.html";
    my $out_file = "$data_dir/$file_name.pdf";
    print  `$wk_bin $html $out_file\n`;
}

exit 0;
