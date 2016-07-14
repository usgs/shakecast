#!/usr/local/bin/perl

#use IO::File;
#use Text::CSV_XS;
use XML::LibXML::Simple;
use Data::Dumper;

$file=$ARGV[0];

$xml = XMLin($file);
#print Dumper($xml);
$data = $xml->{Worksheet}->{Table}->{Row};
foreach $item (@$data) {
  $cells = $item->{Cell};
print (map {$_->{Data}->{content}} @$cells),"---\n";
}
#$csv = Text::CSV_XS->new({
# });

#open my $fh, "<:encoding(utf8)","$file" or die "couldn't open file";
#@lines = <FH>;
#while (my $row = $csv->getline($fh)) {
#  push @rows, $row;
#}
#$ind=0;
#foreach $line (@rows) {
#print "$ind :";
#print $line;
#$ind++;
#       if ( my $colp = $csv->parse($line)) {
#		print $ind,":",scalar @$line,"\n";
#	   print @$line,"\n";
#		}

#}

#close($fh);
