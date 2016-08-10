#!/usr/local/bin/perl

use strict;
use warnings;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;

use Getopt::Long;
use XML::LibXML::Simple;
use XML::Writer;
use Data::Dumper;
use IO::File;
use Text::CSV_XS;

my $fh;
my %columns;        # field_name -> position

sub epr;
sub vpr;
sub vvpr;

my %options = (
    'insert'    => 0,
    'replace'   => 0,
    'skip'      => 0,
    'update'    => 0,
    'delete'    => 0,	
    'verbose'   => 0,
    'help'      => 0,
    'quote'     => '"',
    'separator' => ',',
    'limit=n'   => 50,
);


SC->initialize();
my $config = SC->config;
my @mmi = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X+");

my $sc_dir = $config->{'DataRoot'};
my $temp_dir = $config->{'TemplateDir'} . '/pdf';

my $conf = "$temp_dir/shakecast_report.conf";

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $event = "$evid-$version";

my $file = 'facility_regulatory_level.xml';
exit unless (-f "$sc_dir/$event/$file");

my $xml = XMLin("$sc_dir/$event/$file");

#print keys %{$xml->{facility}};
#print Dumper ($xml);
#print "\n", ref $xml->{facility}, "\n";
#print $xml->{facility}->{id}
my @tags = keys %{$xml->{facility}};

print "No facility\n" unless ($xml->{facility});

print "One facility\n" if (grep(/id/i, @tags));
print "Multiple facilities\n" if (!grep(/id/i, @tags) && scalar @tags > 1);

my $rc;
	my $directive = XMLin($conf);
	if (ref $directive->{page} eq 'ARRAY') {
		foreach my $page_directive (@{$directive->{page}}) {
			
			foreach my $component (keys %{$page_directive}) {
				if ($component eq 'table') {
					$rc = draw_table($page_directive->{table});
				} elsif ($component eq 'block') {
					#$rc = draw_block($page_directive->{block});
					#$rc = import_image($directive->{block}->{image}) if (defined $directive->{block}->{image});
				} elsif ($component eq 'text') {
					#$rc = draw_text($page_directive->{text});
					#$rc = import_image($directive->{block}->{image}) if (defined $directive->{block}->{image});
				}
			}
		}
	}

exit;

#
# Draw Table in PDF
#
sub draw_table {
	my ($table_directive) = @_;

	my $path = $table_directive->{list};
	my $type = $table_directive->{type};
	my $unit = $table_directive->{unit};
	my $field = $table_directive->{field};
	return unless (defined $path);

	my $facility_data = parse_facility($evid, $version, $type, $field, 0);

	#print "$option\n";

	my $rc;
	if (defined $facility_data) {
		#$rc = eval "\$pdftable->table($option)";
	};
	
	return $rc;
}
	
sub parse_facility {
  my ($evid, $version, $type, $field, $offset) = @_;
  my $file = "$sc_dir/$evid-$version/exposure.csv";
  return unless (-e $file);
  
  my @rows;
  my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or return "Cannot use CSV: ".Text::CSV->error_diag ();
 
  open my $fh, "<:encoding(utf8)", $file or return"$file: $!";
    my $header = $fh->getline;
  process_header($csv, $header);
  my $reg_level = process_reg_level("$sc_dir/$evid-$version/facility_regulatory_level.xml");
	#foreach my $fac_hash (keys %$reg_level) {
	#	print @{$reg_level->{$fac_hash}},"\n";
	#}

    # uppercase and trim header field names
    my @fields = map { uc $_ } split (/,/, $field);
	print @fields,"\n";
    foreach (@fields) {
        s/^\s+//;
        s/\s+$//;
    }
    my $sub = "sub { (" .
        join(',', (map { q{$_[0]->[} . $columns{$_} . q{]} } (@fields))) .
        ') }';

   vvpr $sub;
    my $field_map = eval $sub;

  while ( my $row = $csv->getline( $fh ) ) {
    $row->[0] =~ m/\w+/ or next; # 3rd field should match
	next if ($type && $type !~ /$row->[0]/);
	$row->[7] = $mmi[int($row->[7] + 0.5) - 1];
	$row->[4] = sprintf("%.4f", $row->[4]);
	$row->[5] = sprintf("%.4f", $row->[5]);
    #$row->[0] !~ m/^facility_type/i or next; # skip header
	#print  &$field_map($row),"\n";
	push @$row, @{$reg_level->{$row->[$columns{FACILITY_ID}]}}
		if ($reg_level->{$row->[$columns{FACILITY_ID}]});
		print @{$reg_level->{$row->[$columns{FACILITY_ID}]}},"\n" if ($row->[$columns{FACILITY_TYPE}] eq 'NUCLEAR');
    push @rows, $row;
  }
  @rows = sort { $b->[8] <=> $a->[8] } @rows;
  unshift @rows, $header unless ($offset);
  $csv->eof or $csv->error_diag();
  close $fh;

  return \@rows;
}

# Read and process header, building data structures
# Returns 1 if header is ok, 0 for problems
sub process_header {
    my ($csv, $header) = @_;
	
    return 1 unless $header;      # empty file not an error

    # parse header line
    vvpr $header;
    unless ($csv->parse($header)) {
        epr "CSV header parse error on field '", $csv->error_input, "'";
        return 0;
    }

    my $ix = 0;         # field index

    # uppercase and trim header field names
    my @fields = map { uc $_ } $csv->fields;
    foreach (@fields) {
        s/^\s+//;
        s/\s+$//;
    }

    # Field name is one of:
    #   METRIC:<metric-name>:<metric-level>
    #   GROUP:<group-name>
    #   <facility-column-name>
    foreach my $field (@fields) {
		$columns{$field} = $ix;
        $ix++;
    }
	
    return 1;

}

# Read and process header, building data structures
# Returns 1 if header is ok, 0 for problems
sub process_reg_level {
    my ($file) = @_;
	my %fac_reg;
	
    return 1 unless (-f $file);      # empty file not an error

    # parse header line
    my $xml = XMLin($file);
	my (@tags, @facs);

	if (grep(/id/i, @tags)) {
		@tags = keys %{$xml->{facility}};
	} else {
		@facs = keys %{$xml->{facility}};
		@tags = keys %{$xml->{facility}->{$facs[0]}};
	}

	#print "One facility\n" if (grep(/id/i, @tags));
	#print "Multiple facilities\n" if (!grep(/id/i, @tags) && scalar @tags > 1);

    unless ($xml->{facility}) {
        epr "No facility";
        return 0;
    }

    my $ix = scalar keys %columns;         # field index
	#print $ix;
    # uppercase and trim header field names
    my @fields = map { uc $_ } @tags;
    foreach (@fields) {
        s/^\s+//;
        s/\s+$//;
    }

    # Field name is one of:
    #   METRIC:<metric-name>:<metric-level>
    #   GROUP:<group-name>
    #   <facility-column-name>
    foreach my $field (@fields) {
		$columns{$field} = $ix;
        $ix++;
    }
	#print join ',', keys %columns;
	
	if (grep(/id/i, @tags)) {
		my @fac_fields = (map { $xml->{facility}->{$_} } (@tags));
		$fac_reg{$xml->{facility}->{id}} = \@fac_fields;
	} else {
		foreach my $fac_id (@facs) {
			my @fac_fields = (map { $xml->{facility}->{$fac_id}->{$_} } (@tags));
			$fac_reg{$fac_id} = \@fac_fields;
			print @fac_fields,"\n";
		}
	}
	
    return \%fac_reg;

}

sub vpr {
    if ($options{'verbose'} >= 1) {
        print @_, "\n";
    }
}

sub vvpr {
    if ($options{'verbose'} >= 2) {
        print @_, "\n";
    }
}

sub epr {
    print STDERR @_, "\n";
}

sub usage {
    my $rc = shift;

    print qq{
manage_facility -- Facility Import utility
Usage:
  manage_facility [ mode ] [ option ... ] input-file

Mode is one of:
    --replace  Inserts new facilities and replaces existing ones, along with
               any existing fragilities and attributes
    --insert   Inserts new facilities.  Existing facilities are not
               modified; each one generates an error.
    --delete   Delete facilities. Each non-exist one generates an error.
    --update   Updates existing facilities.  Only those fields present in the
               input file are modified; other fields not mentioned are left
               alone.  An error is generated for each facility that does not
               exist.
    --skip     Inserts facilities not in the database.  Skips existing
               facilities.
  
  The default mode is --replace.

Options:
    --help     Print this message
    --verbose  Print details of program operation
    --limit=N  Quit after N bad input records, or 0 for no limit
    --quote=C  Use C as the quote character in place of double quote (")
    --separator=S
               Use S as the field separator in place of comma (,)
};
    exit $rc;
}


