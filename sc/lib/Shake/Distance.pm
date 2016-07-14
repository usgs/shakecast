package Shake::Distance;

#	@(#)Distance.pm	1.7	04/26/06	TriNet

# 05152008 vq: Check dist_rjb, die when finite fault point has no depth
# 05152008 vq: Fix multiple fault segments for dist_rjb

use Carp;
use strict;
use Shake::Vector;
use Math::Trig;
use Exporter ();
@Shake::Distance::ISA = qw( Exporter );

@Shake::Distance::EXPORT = qw( dist dist_rjb dist_hypo dist_rrup $PI dist_bound );
use vars qw ( $PI );

$PI=atan2(0,-1);

########################################################################
#=head1
# 
# Distance
#
# Purpose:
#   Return a distance, in kilometers, between two points specified
#   in latitude and longitude, or a point and a fault file.
#
# External Interface:
#
#   <float> = dist( $lat1, $lon1, $lat2, $lon2 );
#   Given P1($lat1, $lon1) and P2($lat2, $lon2), return the distance,
#   in kilometers, between P1 and P2.  P1 and P2 must both be in the
#   same hemisphere.
#
#   <float> = dist_rjb( $lat, $lon, $ref );
#   Rjb distance (2D to epicenter or surface-projected polygon)
#   Where $ref is a reference to a regression object with attached
#    fault object (an array of refs to lat-lon hashes)
#      $fault_object->[$n] --> { 'lat' => $lat, 'lon' => $lon }
#   These points determine one continuous fault line. If the first
#      and last points are identical, then the fault is a closed
#      polygon; distance is zero inside it.
#   If $ref has no fault object, use the regression epicenter.
#   Also,
#   <float> = dist_rjb(  $lat1, $lon1, $lat2, $lon2 );
#   Identical to dist().
#
#   <float> = dist_hypo(  $lat, $lon, $ref );
#   Computes hypocentral distance using the depth parameter in
#     regression object $ref.
#
#   <float> = dist_rrup( $lat, $lon, $ref );
#   For computing r_rup 3D geometry using 4-point planar segments
#      (quadrilaterals), see below.
#
#=cut
########################################################################

######################################################################
#
# Great-circle distance between 2 points on surface
# Both points must be on the same hemisphere
#
######################################################################

sub dist_bound {

  my ($lon, $lat, $dist) = @_;
  my $earthRadius = 6378.137;
  my $facet = 4;

  $lon = $lon * $PI / 180;
  $lat = $lat * $PI / 180;

  my ($max_lon, $min_lon, $max_lat, $min_lat);
  $min_lon = $min_lat = 999;
  $max_lon = $max_lat = -999;
  for (my $ind = 0; $ind < $facet; $ind++) {
    my $brng = $ind * $PI / $facet * 2;
    my $lat2 = asin(sin($lat) * cos($dist/$earthRadius) + cos($lat)*sin($dist/$earthRadius)*cos($brng));
    my $lon2 = $lon + atan2(sin($brng)*sin($dist/$earthRadius)*cos($lat),
      cos($dist/$earthRadius) - sin($lat)*sin($lat2));
    $lat2 = sprintf("%.2f", $lat2 * 180 / $PI);
    $lon2 = sprintf("%.2f", $lon2 * 180 / $PI);
    if ($lon2 > $max_lon) {
      $max_lon = $lon2;
    } elsif ($lon2 < $min_lon) {
      $min_lon = $lon2;
    }
    if ($lat2 > $max_lat) {
      $max_lat = $lat2;
    } elsif ($lat2 < $min_lat) {
      $min_lat = $lat2;
    }
    $lon2 += 360 if ($lon2<-180);
    $lon2 -= 360 if ($lon2>=180);
  } 
  return ($min_lon, $max_lon, $min_lat, $max_lat);
}

######################################################################
#
# Great-circle distance between 2 points on surface
# Both points must be on the same hemisphere
#
######################################################################

sub dist {

  my ($a,$b,$x,$y) = @_;
  my($dlat,$dlon,$avlat,$f,$bb,$aa,$dist,$az);

  # Ensure right hemisphere
  $dlon = ($y-$b);
  $dlon += 360 if ($dlon<-180);
  $dlon -= 360 if ($dlon>=180);
  $dlon *= .0174533;

  $dlat  = ($a-$x)*(.0174533);
  $avlat = ($x+$a)*(.00872665);
  $f     = sqrt (1.0 - 6.76867E-3*((sin $avlat)**2));
  $bb    = ((cos $avlat)*(6378.276)*$dlon/$f);
  $aa    = ((6335.097)*$dlat/($f**3));
  $dist  = sqrt ($aa**2 + $bb**2);
  $dist  = sprintf("%.2f",$dist);

  $az = $PI-atan2($bb,$aa);
  return wantarray ? ($dist,$az) : $dist;
}

######################################################################
#
# Default distance formula (used by HazusPGV, BJF97, Small)
#
######################################################################

sub dist_rjb {
  my ($a,$b,$c,$d) = @_;
  my ($_start,$_end,$p1,$p2,$pt_c);

  if (defined $c and defined $d and !(ref $c)) {
    # Epicentral distance between 2 points
    return dist($a,$b,$c,$d);
  }    
  if ((ref $c) =~ /^Regression::/ and !defined ($c->{fault}) ) {
    # No fault, use epicentral distance
    my $dist = dist($a,$b,$c->{lat},$c->{lon});
    return $dist;
  }

  die "Distance: Unknown fault coordinate object" 
    if (ref $c) !~ /^Regression::/ and ref($c->{fault}) ne 'ARRAY';
  
  # Now assume there's a finite fault. Now just a ref to array of 
  # (lat lon) hash refs. Change this code when fault implementation changes.

    my $dist = 0;
    my ($point, $r);
    my @points = @{$c->{fault}};
    
    # Check if there's just one point?
    if ($#points==0) {
      $dist = dist($a,$b,$points[0]->{lat},$points[0]->{lon});
      return $dist;
    }
            
    # Check if this is inside a loop?
    $_start = $points[0];
    $_end = $points[-1];
    
    if ($_start->{lat}==$_end->{lat} and $_start->{lon}==$_end->{lon}) {
      my @polyrefs = ();
      foreach (@points) {
        my ($a,$b) = ($_->{lon},$_->{lat});
        die "Distance: Bad fault file (polygon with bad segment?)"
          unless (defined $a and defined $b);

	push @polyrefs,[$_->{lon},$_->{lat}];
      }
      my $polyfault = new Polygon(@polyrefs);

      return 0 if ($polyfault->crossingstest([$b,$a]));
    }
    
    # Nope, calculate distance from line/edge.
    foreach ($pt_c=1; $pt_c<=$#points; $pt_c++) {
      $p1 = $points[$pt_c-1];
      $p2 = $points[$pt_c];
      next unless (defined $p1 and defined $p2);
      
      $r = dist_to_line($a,$b,$p1->{lat},$p1->{lon},$p2->{lat},$p2->{lon});
      $dist = $r if ($r<$dist or $dist==0);
 
    }
    return $dist;
}    
   
sub dist_to_line {
  # Calculate distance from point P to line segment [Q1,Q2] using Heron's formula
  # $a = dist. from P to Q1
  # $b = dist. from P to Q2
  # $c = dist. from Q1 to Q2
  # $h = dist. from P to P' which is the projection of P on line (Q1,Q2)

  my ($px,$py,$x1,$y1,$x2,$y2) = @_;
  my ($a,$b,$c,$s,$h,$proj);


  $a = dist($px,$py,$x1,$y1);
  $b = dist($px,$py,$x2,$y2);
  $c = dist($x1,$y1,$x2,$y2);

  ($a,$b) = ($b,$a) if ($a<$b);  # Now $a is the farther point

  return $b if ($c<=0.1);
  
  $s = ($a+$b+$c)/2;
  
  $h = ($s*($s-$a)*($s-$b)*($s-$c) > 0) ? 
    2*sqrt($s*($s-$a)*($s-$b)*($s-$c))/$c : 0.1 ;
  
  # Check if P' is inside segment. $proj = dist. from P' to Q1
  $proj = sqrt($a**2-$h**2);
  return $b if ($proj > $c);
  
  return $h;
}


######################################################################
#
# Hypocentral distance used by AB02
#
######################################################################

sub dist_hypo {

  my ($a,$b,$ref) = @_;

  my $depth = $ref->{depth};
  my $epilat = $ref->{lat};
  my $epilon = $ref->{lon};


  my $dist = dist($a,$b,$epilat,$epilon);

  return $dist if ($depth==0);
  return   sprintf("%.2f",sqrt($dist**2 + $depth**2));
}

######################################################################
#
# Distance to fault rupture (used by Youngs et al 97)
#
# Notes on finite fault :
# In the finite fault file *_fault.txt in the input directory should have
# three columns (lat,lon,depth).
# Each fault is defined by a set of 4-point planar segments (quadrilaterals)
# joined by common sides.
# The points should be arranged in clockwise- or counterclockwise order, e.g.
#
#      3------4
#      |\      \ 
# 1(9)-2 6------5
#   \   \|    
#    8-- 7
#
# The last point is a repeat of the first point. 
#
# Each quadrilateral segment (1278, 2367, 3465) must have 4 corner points 
# which are coplanar and non-collinear. Multiple fault segments must 
# connect in linear fashion as shown above; more degenerate configurations
# are not supported. One planar segment (4 points + the first point
# repeated) or two connected planar segments should be sufficient for 
# most cases.
#
# More than one fault file, representing separate fault segments,
# may be used as long as the first and last points of each fault file 
# are identical.
#
######################################################################

sub dist_rrup {

  my ($a,$b,$c,$d) = @_;
  my ($_start,$_end,$pt_c,$depth);

  if (defined $c and defined $d and !(ref $c)) {
    # Epicentral distance between 2 points
    return dist($a,$b,$c,$d);
  }    
  if ((ref $c) =~ /^Regression::/ and !defined ($c->{fault}) ) {
    # No fault: use the depth that comes from the regression
    my $r = dist($a,$b,$c->{lat},$c->{lon});
    $depth = $c->{depth};
    $r = sqrt($r**2 + $depth**2) if ($depth);
    return $r;
  }

  die "Distance: Unknown fault coordinate object" if
    (ref $c) ne /^Regression::/ and ref ($c->{fault}) ne 'ARRAY';

  # Now assume there's a finite fault. Now just a ref to array of 
  # (lat lon depth) hash refs. Change this code when fault implementation 
  # changes.
  
  my $dist = 0;
  my ($point, $r);
  my @faults = @{$c->{fault}};
  
  # Check if there's just one point?
  if ($#faults==0) {
    $r = dist($a,$b,$faults[0]->{lat},$faults[0]->{lon});
    $depth = $faults[0]->{depth};
    $r = sqrt($r**2 + $depth**2) if ($depth);
    return $r;
  }

  my ($pta,$ptb,$ptc,$ptd,$p0,$p1,$p2,$p3,$s0,$s1,$s2,$s3);
  my ($c1,$c2,$c3,$c4);
  my ($nplane);
  my $d_min = 9999;
  my @points = ();

  # Extract each fault file one at a time.
  while (@faults) {

    # Check if we get a polygon delimiter ('>')
    if (!defined $faults[0]) {
      die "Distance: bad fault file (polygon delimiter in the middle "
        . "of closed polygon?)"
        if (@points);
      shift @faults;
      next;
    }

    push @points,(shift @faults);
    # Check if the the first point is repeated. If so, then
    # this is one complete fault file.

    die "Distance: bad fault file (point with no depth)"
      if (!defined $points[-1]->{depth});

    next if (($points[-1]->{lon} != $points[0]->{lon}) or 
	     ($points[-1]->{lat} != $points[0]->{lat}) or 
	     ($points[-1]->{depth} != $points[0]->{depth}) or 
	     ($#points==0));
  
    $_start = $points[0];
    $_end = $points[-1];
    my $npts = $#points+1;
    # Loop through each planar quadrilateral
    for ($pt_c = 1; $pt_c<($npts-1)/2; $pt_c++) {

      # Figure out the vertices
      $pta = $points[$pt_c-1];
      $ptb = $points[$pt_c];
      $ptc = $points[$npts-$pt_c-2];
      $ptd = $points[$npts-$pt_c-1];

      # Convert to rectangular coords. To simplify calculations,
      # origin is at the station
      $p0 = coord_to_vec($a,$b,$pta);  
      $p1 = coord_to_vec($a,$b,$ptb);
      $p2 = coord_to_vec($a,$b,$ptc);
      $p3 = coord_to_vec($a,$b,$ptd);

#      printf "($npts) %i %i %i %i\n",$npts-$pt_c,$pt_c,$pt_c+1,$npts-$pt_c-1;

      # Find vector normal to plane. Only the first 3 points are used;
      # no check if fourth point is coplanar!

      $nplane = ($p1-$p0)x($p2-$p0);
      die "Malformed fault file found (plane points are collinear)" 
	unless ($nplane->len2);
      
      # Is the projected origin inside the rectangle?
      # Create 4 planes with normals pointing outside rectangle.
      # Dot products show which side the origin is on.
      # If origin is on same side of all the planes, then it is 'inside'

      $s0 = sign((($p1-$p0)x$nplane).$p0);
      $s1 = sign((($p2-$p1)x$nplane).$p1);
      $s2 = sign((($p3-$p2)x$nplane).$p2);
      $s3 = sign((($p0-$p3)x$nplane).$p3);
      
      if ($s0 == $s1 and $s1==$s2 and $s2==$s3) {
	# Origin is inside. Use distance-to-plane formula.
	# (Note that norm is computed only for 'inside' points, this saves
	# on expensive sqrts.)
	$nplane->norm();
	$d = abs($nplane . $p0);
      }
      
      # No, origin is outside. Find distance to edges
      else {
	$s0 = dist2_to_segment_3d($p0,$p1);
	$s1 = dist2_to_segment_3d($p1,$p2);
	$s2 = dist2_to_segment_3d($p2,$p3);
	$s3 = dist2_to_segment_3d($p3,$p0);
	
	$d = sqrt(min($s0,$s1,$s2,$s3));
      }
      $d_min = $d if ($d<$d_min);
    }
    
    # Reset @points array, ready for next fault (if any)
    @points = ();
  }

  die "Unable to compute distance" if ($d_min==9999);
  $d_min = sprintf "%.2f",$d_min;

  return $d_min;
}

sub coord_to_vec {
  # This function returns an (xy) coordinate system (in km) with
  # ($a,$b) at the origin.

  my ($a,$b,$p) = @_;
  
  die "Error calling coord_to_vec" unless (ref $p eq 'HASH');
  my $x = $p->{lat};
  my $y = $p->{lon};

  # Ensure right hemisphere
  my $dlon = ($y-$b);
  $dlon += 360 if ($dlon<-180);
  $dlon -= 360 if ($dlon>=180);
  $dlon *= .0174533;

  my $dlat  = ($a-$x)*(.0174533);
  my $avlat = ($x+$a)*(.00872665);
  my $f     = sqrt (1.0 - 6.76867E-3*((sin $avlat)**2));
  my $bb    =  ((cos $avlat)*(6378.276)*$dlon/$f);
  my $aa    =  ((6335.097)*$dlat/($f**3));

  my $dist  = sqrt ($aa**2 + $bb**2);

  $x = $bb;
  $y = -$aa;
  my $z = $p->{depth};

  my $vec = Vector->new([$x,$y,$z]);
  
  return $vec;
}

sub dist2_to_segment_3d {

  # This algorithm is from CS1 class.

  my $p0 = shift;
  my $p1 = shift;
  
  my $v = $p1 - $p0; 

  # Are the two points equal?
  return ($p0->len2) unless ($v);
  
  # C1 = $c1/|$v| is the projection of the origin O on line (P0,P1).
  # If C1 is negative, then O is outside the segment and
  # closer to the P0 side.
  # If C1 is positive and >V then O is on the other side.
  # If C1 is positive and <V then O is inside.

  my $c1 = -($p0 . $v);
  if ($c1<=0) { return $p0->len2 };
  

  my $c2 = $v . $v;
  if ($c2<=$c1) { return $p1->len2 };
  
  return ($p0 + ($c1/$c2)*$v)->len2;
}

sub min {
  my ($a,$min);
  
  $min=$_[0];
  foreach (@_) {
    $min = $_ if ($_<$min);
  }
  return $min;
}

sub sign {
  my $a = shift;
  
  return 1 if ($a>0);
  return -1 if ($a<0);
  return 0 if ($a==0);
  return undef;
}


1;
