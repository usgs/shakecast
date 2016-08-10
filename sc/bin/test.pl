#!/usr/local/bin/perl

use strict;
use warnings;

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;
use PDF::API2;
use PDF::Table;

use XML::LibXML::Simple;
use Data::Dumper;

use constant cm => 2.54 / 72;
use constant in => 1 / 72;
use constant inch => 1 / 72;
use constant pt => 1;

SC->initialize();
my $config = SC->config;

my $evid = $ARGV[0];
my $version = $ARGV[1];
my $event = "$evid-$version";

my $sc_dir = $config->{'DataRoot'};
my $db_dir = $config->{'RootDir'} . '/db';
my $temp_dir = $config->{'TemplateDir'} . '/pdf';


my $pdf = PDF::API2->open( "$temp_dir/template.pdf" );
my $directive = XMLin("$temp_dir/template.conf" );
#print Dumper($directive);
my ($earthquake, $default) = load_default();

my $page = $pdf->openpage(1);
my $rc;

if (ref $directive->{page} eq 'ARRAY') {
	foreach my $page_directive (@{$directive->{page}}) {
		#print Dumper($page_directive);
		if (defined $page_directive->{number}) {
			$page = $pdf->openpage($page_directive->{number});
		} elsif (defined $page_directive->{list}) {
			if ($page_directive->{list} eq 'exposure.csv') {
				# some data to layout
				my $facility_data = parse_facility($evid, $version);
				my $index;
				foreach my $facility (@$facility_data) {
					$page = $pdf->page;
					$rc = draw_block($page_directive->{block}, $facility);
				}
			}
			next;
		} else {
			$page = $pdf->page unless (defined $page_directive->{pdf});
		}
		
		foreach my $component (keys %{$page_directive}) {
			if ($component eq 'pdf') {
				$rc = draw_pdf($page_directive->{pdf});
			} elsif ($component eq 'table') {
				$rc = draw_table($page_directive->{table});
			} elsif ($component eq 'block') {
				$rc = draw_block($page_directive->{block});
				#$rc = import_image($directive->{block}->{image}) if (defined $directive->{block}->{image});
			} elsif ($component eq 'text') {
				$rc = draw_text($page_directive->{text});
				#$rc = import_image($directive->{block}->{image}) if (defined $directive->{block}->{image});
			}
		}
	}
} else {
	my $page_directive = $directive->{page};
	$rc = draw_block($page_directive->{block}) if (defined $page_directive->{block});
}

#$pdf->saveas("$sc_dir/$evid-$version/shakecast_report.pdf");
$pdf->saveas("shakecast_report.pdf");
$pdf->end();

print $rc, "\n";
exit;


#
# Load Default Parameters
#
sub load_default {
	my $sta_file = "$sc_dir/$event/stationlist.xml";
	$sta_file =~ s/_v(\d+)\//-$1\//;
	my $xml =  XMLin($sta_file);
	my $earthquake = $xml->{'earthquake'};

	$earthquake->{timestamp} = sprintf ("%04d-%02d-%02d %02d:%02d:%02d GMT",
	$earthquake->{'year'}, $earthquake->{'month'}, $earthquake->{'day'},
	$earthquake->{'hour'}, $earthquake->{'minute'}, $earthquake->{'second'},
	$earthquake->{'timezone'});

	my ($sec, $min, $hour, $d_mon, $mon, $year) = gmtime();
	$earthquake->{process_time} = sprintf ("Created: %04d-%02d-%02d %02d:%02d:%02d GMT",
	$year+1900, $mon+1, $d_mon, $hour, $min, $sec);
	
	$earthquake->{evid} = $evid;
	$earthquake->{version} = $version;
	
	my %default = (
		'font_type' => {
			'helvetica'  => $pdf->corefont( 'Helvetica',         -encoding => 'latin1' ),
			'helvetica-roman'  => $pdf->corefont( 'Helvetica',         -encoding => 'latin1' ),
			'helvetica-bold' => $pdf->corefont( 'Helvetica-Bold',    -encoding => 'latin1' ),
			'helvetica-italic' => $pdf->corefont( 'Helvetica-Oblique', -encoding => 'latin1' ),
			'times-bold'   => $pdf->corefont( 'Times-Bold',   -encoding => 'latin1' ),
			'times-roman'  => $pdf->corefont( 'Times',        -encoding => 'latin1' ),
			'times'  => $pdf->corefont( 'Times',        -encoding => 'latin1' ),
			'times-italic' => $pdf->corefont( 'Times-Italic', -encoding => 'latin1' ),
		},
		'font_size' => 12,
		'font_color' => 'black',
		'linewidth' => 1,
		'fillcolor' => 'lightgrey',
		'pad' => 0.1,
		);

	return ($earthquake, \%default);
}


#
# Substitute key/value in template
#
sub set_keyword {
	my ($raw_text) = @_;

	foreach my $key (keys %{$earthquake}) {
		$raw_text =~ s/\[$key\]/$earthquake->{$key}/i 
			if ($raw_text =~ /\[$key\]/i);
	}
	foreach my $key (keys %{$default}) {
		$raw_text =~ s/\[$key\]/$default->{$key}/i 
			if ($raw_text =~ /\[$key\]/i);
	}
	
	return $raw_text;
}

#
# ShakeCast Homepage capture
#
sub screen_capture {
	my ($block) = @_;
	
	#print Dumper($block);
	my $path = set_keyword($block->{path});
	my ($w, $h, $unit) = ($block->{w}, $block->{h}, $block->{unit});
	if ($unit eq 'cm') {
		$w = $w / cm * in; $h = $h / cm * in; 
	} elsif ($unit eq 'pt') {
		$w = $w * in; $h = $h * in; 
	}
	
	my $prog = 'wkhtmltoimage '.$path.' '.$sc_dir.'/'.$event.'/sc.jpg';
	my $result = `$prog`;
	my $pad = (defined $block->{pad}) ? $block->{pad} : $default->{pad};
	if ( -e $sc_dir.'/'.$event.'/sc.jpg') {
		my $rc = import_image({'x' => 0, 'y' => 0, 'type' => 'jpeg', 'path' => 'sc.jpg',
			'unit' => 'inch', 'align' => 'center', 'valign' => 'center', 'pad' => $pad,
			'w' => $w - $pad * 2 , 'h' => $h - $pad * 2}, $block);
	}
}

#
# Historic Earthquake List
#
sub historic_table {
	my ($block) = @_;
	
	my ($w, $h, $x, $y, $unit) = ($block->{w}, $block->{h},
		$block->{x}, $block->{y}, $block->{unit});
	if ($unit eq 'cm') {
		$x = $x / cm * in; $y = $y / cm * in; $w = $w / cm * in; $h = $h / cm * in; 
	} elsif ($unit eq 'pt') {
		$x = $x * in; $y = $y * in; $w = $w * in; $h = $h * in; 
	}
	my $pad = $default->{font_size} * in / 3;
	my $header_h = $default->{font_size}*2*in;
	my $h_fillcolor = (defined $block->{h_fillcolor}) ? $block->{h_fillcolor} : $default->{fillcolor};
	draw_block({'x' => $x, 'w' => $w, 'unit' => 'inch', 'h' => $header_h,
		'y' => $y + $h - $header_h, 'style' => 'fillstroke', 'action' => 'rect', 'fillcolor' => $h_fillcolor});
		
		print "exit draw_block\n";
	
	my $earthquake_history = parse_earthquake_history($earthquake->{'lat'}, $earthquake->{'lon'});
	my $earthquake_history_text = $page->text;
	$earthquake_history_text->font( $default->{font_type}->{'helvetica'}, $default->{font_size} );
	$earthquake_history_text->fillcolor($default->{font_color});

	my $msg;
	if (defined $earthquake_history) {
	  $msg = "Recent significant earthquakes in the region\n \n";
	} else {
	  $msg = "No significant earthquakes was recorded in the region";
	}

	my ($endw, $ypos, $paragraph ) = text_block(
		$earthquake_history_text,
		$msg,
		-x        => ($x+$pad) / in,
		-y        => ($y + $h - $pad * 4) / in,
		-w => ($w - $pad * 3) / in,
		-h => ($h + 1) / in,
		-lead     => $default->{font_size},
		-parspace => 0 / pt,
		-align    => 'left',
	);


	print "$y, $ypos, $h\n";
	if (defined $earthquake_history) {
		$earthquake_history_text->font( $default->{font_type}->{'times'}, $default->{font_size} - 2);
		text_block(
			$earthquake_history_text,
			$earthquake_history,
			-x        => ($x+$pad) / in,
			-y        => $ypos,
			-w => ($w - $pad * 3) / in,
			-h => $ypos - $y / in,
			-lead     => $default->{font_size} - 1,
			-parspace => 0 / pt,
			-align    => 'left',
			-hang     => "\xB7  ",

		);
	}
	
	

}


#
# Draw Table in PDF
#
sub draw_table {
	my ($table_directive) = @_;

	my $path = $table_directive->{list};
	my $unit = $table_directive->{unit};
	return unless (defined $path);
	$path = "$sc_dir/$event/".$path;
	my $facility_data = parse_facility($evid, $version);

	my $pdftable = new PDF::Table;
	
	my %dimension = ('x'=>1, 'start_y'=>1, 'next_y'=>1, 
		'start_h'=>1, 'next_h'=>1, 'w'=>1);
	my $option = '$pdf, $page, $facility_data, ';
	foreach my $key (keys %{$table_directive}) {
		next if ($key eq 'list' || $key eq 'unit');
		my $value = $table_directive->{$key};
		if ($dimension{$key}) {
			if ($unit eq 'inch') {
				$value /= in;
			} elsif ($unit eq 'cm') {
				$value /= cm;
			} elsif ($unit eq 'pt') {
				$value /= pt;
			}
		}
		$option .= '-'.$key.' => "'.$value.'", ';
	}
	$option =~ s/\, $//;
	
	#print "$option\n";

	my $rc;
	if (defined $facility_data) {
		$rc = eval "\$pdftable->table($option)";
	};
	
	return $rc;
}
	

#
# Draw Text in PDF
#
sub draw_text {
	my ($local_text_directive) = @_;
	
	my $text_directive = [];
	if (ref $local_text_directive eq 'ARRAY') {
		if  (scalar @$local_text_directive > 0) {
			$text_directive = shift @$local_text_directive;
			draw_text($local_text_directive) ;
		} else {
			return $rc;
		}
	} else {
		$text_directive = $local_text_directive;
	}
	
	my $unit = $text_directive->{unit};	
	my @strings;
	
	if (ref $text_directive->{string} eq 'ARRAY') {
		push @strings, @{$text_directive->{string}};
	} else {
		push @strings, $text_directive->{string};
	}
	

	my %dimension = ('x'=>1, 'y'=>1, 'w'=>1, 'h'=>1);
	my $endw = 0;
	my ($ypos, $paragraph );
	foreach my $string_directive (@strings) {
		my $header_text = $page->text;
		my ($string, $font_size, $font_type, $font_color);
			$font_size = $default->{font_size};
			$font_type = 'times';
			$font_color = $default->{font_color};
		if (ref $string_directive eq 'HASH') {
			$string = $string_directive->{content};
			$font_size = $string_directive->{size} if (defined $string_directive->{size});
			$font_type = lc($string_directive->{type}) if (defined $string_directive->{type});
			$font_color = lc($string_directive->{color}) if (defined $string_directive->{color});
		} else {
			$string = $string_directive;
		}
		$header_text->font( $default->{font_type}->{$font_type}, $font_size / pt );
		$header_text->fillcolor($font_color);
		
		my (@keys) = $string =~ /\[(\w+)\]/g;
		if (scalar @keys) {
			foreach my $key (@keys) {
				my $value = $earthquake->{lc($key)};
				$string =~ s/\[$key\]/$value/;
			}
		}


		my $option = '$header_text, $string, ';
		my $assign_width;
		foreach my $key (keys %{$text_directive}) {
			next if ($key eq 'string' || $key eq 'unit');
			my $value = $text_directive->{$key};
			if ($dimension{$key}) {
				if ($unit eq 'inch') {
					$value /= in;
				} elsif ($unit eq 'cm') {
					$value /= cm;
				} elsif ($unit eq 'pt') {
					$value /= pt;
				}
			}
			$value += $endw if ($key eq 'x');
			$option .= '-'.$key.' => "'.$value.'", ';
			$assign_width = ($value - $endw)*0.9 if ($key eq 'w');
		}
		$option =~ s/\, $//;
		
		if (!($string =~ /\n/)) {
			my @words = split( /\s+/, $string );
			my $width = 999;
			while ($font_size > 12 && defined $assign_width && $width > $assign_width) {
				$width = 0;
				foreach (@words) {
					$width += $header_text->advancewidth($_);
				}
				print "$font_size, $endw, $width, $assign_width\n";
				last if ($width <= $assign_width);
				$font_size -= 2;
				$header_text->font( $default->{font_type}->{$font_type}, $font_size / pt );
			}
		}

		($endw, $ypos, $paragraph ) = eval "text_block($option)";
	}
	
	return $rc;
}
	

#
# Draw External PDF in PDF
#
sub draw_pdf {
	my ($pdf_directive) = @_;
	my $path = $pdf_directive->{path};
	$path =~ s/\[EVID\]/$evid/i;
	$path = $sc_dir.'/'.$path;
	
	my @paths = eval "<$path>";
	if ( scalar @paths && -e $paths[0]) {
		my $pdf_page = PDF::API2->open($paths[0]);
		my $onepager = $pdf->importpage($pdf_page,1); # get page 1
	}
	
}

#
# Set GFX/Text properties for current page
#
sub set_gfx {
	my ($gfx, $block) = @_;
	
	$block = $default unless (defined $block);
	foreach my $prop ('linewidth', 'linecap', 'linejoin', 'meterlimit',
		'linedash', 'flatness', 'egstate', 'fillcolor', 'strokecolor') {
		if (defined $block->{$prop}) {
			my $value = $block->{$prop};
			eval "\$gfx->$prop('$value')";
		}
	}
}

#
# Draw Block in PDF
#
sub draw_block {
	my ($local_block, $facility) = @_;
	my $rc;
	
	#print Dumper($local_block);
	my $block = [];
	if (ref $local_block eq 'ARRAY') {
		if  (scalar @$local_block > 0) {
			$block = shift @$local_block;
			draw_block($local_block, $facility) ;
		} else {
			return $rc;
		}
	} else {
		$block = $local_block;
	}
	
	my ($w, $h, $x, $y, $unit, $action, $style) = ($block->{w}, $block->{h},
		$block->{x}, $block->{y}, $block->{unit}, $block->{action}, $block->{style});

	my $blue_box = $page->gfx;
	set_gfx($blue_box, $block);
	if ($unit eq 'cm') {
		$x = $x / cm * in; $y = $y / cm * in; $w = $w / cm * in; $h = $h / cm * in; 
	} elsif ($unit eq 'pt') {
		$x = $x * in; $y = $y * in; $w = $w * in; $h = $h * in; 
	}
	eval "\$blue_box->$action( \$x / in, \$y / in, \$w / in, \$h / in)";
	eval "\$rc = \$blue_box->$style";

	if (defined $block->{image}) {
		if (ref $block->{image} eq 'HASH') {
			import_image($block->{image}, $block, $facility);
		} else {
			foreach my $image (@{$block->{image}}) {
				import_image($image, $block, $facility);
			}
		}
	} 
	
	if (defined $block->{block}) {
		draw_block($block->{block}, $facility);
	} 
	
	if (defined $block->{text}) {
		draw_text($block->{text});
	}
	
	if (defined $block->{routine}) {
		my $routine = $block->{routine};
		print "$routine\n";
		eval "&$routine (\$block)";
	}

	#$blue_box->linewidth($default->{linewidth});
	set_gfx($blue_box);
	
	return $rc;
}


#
# Import Image into PDF
#
sub import_image {
	my ($image, $block, $facility) = @_;

	my $path = $image->{path};
	return unless (defined $path);
	$path = "$sc_dir/$event/".$path;
	my (@indexer) = $path =~ /\[(\d+)\]/g;
	if (scalar @indexer) {
		foreach my $index (@indexer) {
			$path =~ s/\[$index\]/$facility->[$index]/;
		}
	}
	
	my @paths = eval "<$path>";
	my $rc;
	if ( scalar @paths) {
		my $photo = $page->gfx;
		my ($w, $h, $x, $y, $unit, $type, $align, $valign, $pad) = 
			($image->{w}, $image->{h},
			$image->{x}, $image->{y}, $image->{unit}, $image->{type}, $image->{align}
			, $image->{valign}, $image->{pad});
		use Image::Size;
		my ($width, $height) = imgsize($paths[0]);
		return $rc unless (defined $width);
		#print $path, " ($width, $height)\n";
		my $adj_h = $height / $width * $w;
		my $off_h = ($h - $adj_h) /2;
		if ($align eq 'center') {
			$x = $x + $block->{x} + ($block->{w} -$w) / 2;
		} elsif ($align eq 'right') {
			$x = $x + $block->{x} + ($block->{w} -$w) - $pad;
		} else {
			$x += $block->{x} + $pad;
		}
		if ($valign eq 'center') {
			$y += $block->{y} + ($h - $adj_h) /2 + $pad;
		} elsif ($valign eq 'top') {
			$y += $block->{y} + ($block->{h} - $adj_h) - $pad;
		} else {
			$y += $block->{y} + $pad;
		}
		
		my $photo_file;
		eval "\$photo_file = \$pdf->image_$type(\$paths[0]);";
		print "$x / in, $y / in, $w / in, $adj_h / in\n";
		if ($unit eq 'inch') {
			$rc = $photo->image( $photo_file, $x / in, $y / in, $w / in, $adj_h / in );
		} elsif ($unit eq 'cm') {
			$rc = $photo->image( $photo_file, $x / cm, $y / cm, $w / cm, $adj_h / cm );
		} elsif ($unit eq 'pt') {
			$rc = $photo->image( $photo_file, $x / pt, $y / pt, $w / pt, $adj_h / pt );
		}
	}
	return $rc;
}

### SAVE ROOM AT THE TOP ###
sub parse_facility {
  my ($evid, $version) = @_;
  my $file = "$sc_dir/$evid-$version/exposure.csv";
  return unless (-e $file);
  

  use Text::CSV_XS;

  my @rows;
  my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or return "Cannot use CSV: ".Text::CSV->error_diag ();
 
  open my $fh, "<:encoding(utf8)", $file or return"$file: $!";
  while ( my $row = $csv->getline( $fh ) ) {
    $row->[0] =~ m/\w+/ or next; # 3rd field should match
    $row->[0] !~ m/^facility_type/i or next; # skip header
    push @rows, $row;
  }
  $csv->eof or $csv->error_diag();
  close $fh;

  return \@rows;
}

### SAVE ROOM AT THE TOP ###
sub parse_earthquake_history {
  my ($e_lat, $e_lon) = @_;
  my $file = "$db_dir/earthquake.csv";
  return unless (-e $file);
	my $count = 10;

  use Text::CSV_XS;

  my ($msg, $counter);
  my $csv = Text::CSV_XS->new ( { binary => 1 } )  # should set binary attribute.
                 or return "Cannot use CSV: ".Text::CSV->error_diag ();
 
  open my $fh, "<:encoding(utf8)", $file or return"$file: $!";
  while ( my $row = $csv->getline( $fh ) ) {
    $row->[5] =~ m/\d+/ or next; # 5th field should match
	my ($locstring, $tabsol, $mag, $lat, $lon) = 
	  ( $row->[2],  $row->[3],  $row->[5],  $row->[6],  $row->[7]); 
    if (abs($lon-$e_lon) <= 2 && abs($lat-$e_lat) <= 2) {
      $msg .= "M". $mag . " ". $locstring . " at " . $tabsol. "\n";
	  last if (++$counter >= $count);
	}
  }
  $csv->eof or $csv->error_diag();
  close $fh;

  return $msg;
}

sub text_block {

    my $text_object = shift;
    my $text        = shift;

    my %arg = @_;
	$arg{'-lead'} = 0 unless (defined $arg{'-lead'});
	
    # Get the text in paragraphs
    my @paragraphs = split( /\n/, $text );

    # calculate width of all words
    my $space_width = $text_object->advancewidth(' ');

    my @words = split( /\s+/, $text );
    my %width = ();
    foreach (@words) {
        next if exists $width{$_};
        $width{$_} = $text_object->advancewidth($_);
    }

    my ($ypos, $endw);
	$ypos = $arg{'-y'};
    my @paragraph = split( / /, shift(@paragraphs) );

    my $first_line      = 1;
    my $first_paragraph = 1;

    # while we can add another line

    while ( $ypos >= $arg{'-y'} - $arg{'-h'} + $arg{'-lead'} ) {

        unless (@paragraph) {
            last unless scalar @paragraphs;

            @paragraph = split( / /, shift(@paragraphs) );

            $ypos -= $arg{'-parspace'} if $arg{'-parspace'};
            last unless $ypos >= $arg{'-y'} - $arg{'-h'};

            $first_line      = 1;
            $first_paragraph = 0;
        }

        my $xpos = $arg{'-x'};

        # while there's room on the line, add another word
        my @line = ();

        my $line_width = 0;
        if ( $first_line && exists $arg{'-hang'} ) {

            my $hang_width = $text_object->advancewidth( $arg{'-hang'} );

            $text_object->translate( $xpos, $ypos );
            $text_object->text( $arg{'-hang'} );

            $xpos       += $hang_width;
            $line_width += $hang_width;
            $arg{'-indent'} += $hang_width if $first_paragraph;

        }
        elsif ( $first_line && exists $arg{'-flindent'} ) {

            $xpos       += $arg{'-flindent'};
            $line_width += $arg{'-flindent'};

        }
        elsif ( $first_paragraph && exists $arg{'-fpindent'} ) {

            $xpos       += $arg{'-fpindent'};
            $line_width += $arg{'-fpindent'};

        }
        elsif ( exists $arg{'-indent'} ) {

            $xpos       += $arg{'-indent'};
            $line_width += $arg{'-indent'};

        }

        while ( @paragraph
            and $line_width + ( scalar(@line) * $space_width ) +
            $width{ $paragraph[0] } < $arg{'-w'} )
        {

            $line_width += $width{ $paragraph[0] };
            push( @line, shift(@paragraph) );

        }

        # calculate the space width
        my ( $wordspace, $align );
        if ( $arg{'-align'} eq 'fulljustify'
            or ( $arg{'-align'} eq 'justify' and @paragraph ) )
        {

            if ( scalar(@line) == 1 ) {
                @line = split( //, $line[0] );

            }
            $wordspace = ( $arg{'-w'} - $line_width ) / ( scalar(@line) - 1 );

            $align = 'justify';
        }
        else {
            $align = ( $arg{'-align'} eq 'justify' ) ? 'left' : $arg{'-align'};

            $wordspace = $space_width;
        }
        $line_width += $wordspace * ( scalar(@line) - 1 );

        if ( $align eq 'justify' ) {
            foreach my $word (@line) {

                $text_object->translate( $xpos, $ypos );
                $text_object->text($word);

                $xpos += ( $width{$word} + $wordspace ) if (@line);

            }
            $endw = $arg{'-w'};
        }
        else {

            # calculate the left hand position of the line
            if ( $align eq 'right' ) {
                $xpos += $arg{'-w'} - $line_width;

            }
            elsif ( $align eq 'center' ) {
                $xpos += ( $arg{'-w'} / 2 ) - ( $line_width / 2 );

            }

            # render the line
            $text_object->translate( $xpos, $ypos );

            $endw = $text_object->text( join( ' ', @line ) );

        }
        $ypos -= $arg{'-lead'};
        $first_line = 0;

    }
    unshift( @paragraphs, join( ' ', @paragraph ) ) if scalar(@paragraph);

    return ( $endw, $ypos, join( "\n", @paragraphs ) )

}


