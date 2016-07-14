#!/usr/local/bin/perl -w

#       @(#)Graphics_2D.pm	1.2     07/27/99     TriNet
# $Id: Graphics_2D.pm 64 2007-06-05 14:58:38Z klin $

package Point;

# some constants
$Point::X = 0;
$Point::Y = 1;

# $objref = new Point ($x,$y);
sub new {
    @_ == 3 or die "$0: Point::new: wrong number of arguments ";
    my $class  = shift;
    my ($x,$y) = @_;

    my $self   = [];
    bless $self;

    @$self = ($x,$y);

    return $self;
}

# $angle = Angle $pntref;
sub Angle {
    my $point = shift;
    my($x,$y,$angle);

    ($x,$y) = ($$point[$X],$$point[$Y]);
    unless ($x == 0 and $y == 0) {
	$angle = atan2($y,$x);
    }
    else {
	$angle = 0;
    }

    return $angle;
}

# $objref = Rotate $pntref ($angle);
sub Rotate {
    @_ == 2 or die "$0: Point::Rotate: wrong number of arguments ";
    my $point = shift;
    my $angle = shift;
    my($x,$y);

    $x = $$point[$X] * cos($angle) - $$point[$Y] * sin($angle);
    $y = $$point[$X] * sin($angle) + $$point[$Y] * cos($angle);

    my $rotated = new Point ($x,$y);

    return $rotated;
}

# $pntref = Translate $pntref ($translation);
sub Translate {
    my $point       = shift;
    my $translation = shift;

    $$point[$X] += $$translation[$X];
    $$point[$Y] += $$translation[$Y];

    return $point;
}

# $objref = Mirror $pntref ($angle);
sub Mirror {
    my $point = shift;
    my $angle = shift;
    my($rot_pt,$mirror_pt);

    $rot_pt    = $point->Rotate(-$angle);
    $$rot_pt[$Y] *= -1;
    $mirror_pt = $rot_pt->Rotate($angle);

    return $mirror_pt;
}

package Rectangle;

# some constants
$Rectangle::MIN = 0;
$Rectangle::MAX = 1;
$Rectangle::X   = 0;
$Rectangle::Y   = 1;

# $objref = new Rectangle ($pntref1,$pntref2) OR ($px1,$py1,$px2,$py2)
sub new {
    (@_ == 3 or @_ == 5) or die "$0: Rectangle::new: wrong number arguments ";
    my $class    = shift;
    my($pnt1,$pnt2,$x1,$y1,$x2,$y2);
    my($min,$max);
    if (@_ == 2) {
	$pnt1 = shift;
	$pnt2 = shift;
	($x1,$y1) = @$pnt1;
	($x2,$y2) = @$pnt2;
    }
    else {
	$x1   = shift;
	$y1   = shift;
	$x2   = shift;
	$y2   = shift;
    }

    if ($x1 == $x2 or $y1 == $y2) {
	return 0;
    }
    $min = new Point ($x1 < $x2 ? $x1 : $x2, $y1 < $y2 ? $y1 : $y2);
    $max = new Point ($x1 > $x2 ? $x1 : $x2, $y1 > $y2 ? $y1 : $y2);
    
    my $self     = [];
    bless $self;

    @$self = ($min,$max);

    return $self;
}

sub checkBounding {
    my $rect  = shift;
    my $point = shift;
    my $inside = 1;

    if ($$rect[$MIN][$X] > $$point[$X] or $$rect[$MAX][$X] < $$point[$X] or
	$$rect[$MIN][$Y] > $$point[$Y] or $$rect[$MAX][$Y] < $$point[$Y]) {
	    $inside = 0;
    }

    return $inside;
}
    

package Polygon;

# some constants
$Polygon::Pi = 4 * atan2(1,1);
$Polygon::X = 0;
$Polygon::Y = 1;

# $objref = new Polygon ($pntref1,$pntref2,...);
sub new {
    my $class = shift;

    my $self  = [];
    bless $self;
    
    @$self = @_;

    # if the last point is the same as the first point, get rid of it
    if ($$self[0][$X] == $$self[$#_][$X] and $$self[0][$Y] == $$self[$#_][$Y]) {
        splice(@$self,$#_,1);
    }

    return $self;
}


sub Copy {
    my $source = shift;
    my @pntref;

    foreach (@$source) {
	my $point = new Point (@$_);
	push(@pntref,$point);
    }
    my $self = new Polygon (@pntref);

    return $self;
}

# Check if point is in polygon
# shoot a test ray along +X axis - slower version, less messy
# (a point on the polygon outline is *not* found to be in the polygon)
sub crossingstest {
    my $poly  = shift;
    my $point = shift;
    my($i,$j,$inside_flag,$xflag0,$numverts);
    my($vtx0,$vtx1,$dv0,$pgon);
    my($crossings,$yflag0,$yflag1);

    $inside_flag = $poly->checkBounding ($point);
    return $inside_flag if $inside_flag == 0;

    $pgon = $poly;
    $numverts = @$poly;
    $vtx0 = $$pgon[$numverts-1];
    # get test bit for above/below X axis 
    $dv0 = $$vtx0[$Y] - $$point[$Y];
    $yflag0 = ($dv0 > 0.0);

    $crossings = 0;
    for ($j=0;$j < $numverts;$j++) {
	# cleverness:  bobble between filling endpoints of edges, so
	# that the previous edge's shared endpoint is maintained.
	if ($j & 0x1) {
	    $vtx0 = $$pgon[$j];
	    $dv0 = $$vtx0[$Y] - $$point[$Y];
	    $yflag0 = ($dv0 > 0.0);
	    }
	else {
	    $vtx1 = $$pgon[$j];
	    $yflag1 = ($$vtx1[$Y] > $$point[$Y]);
	}

	# check if points not both above/below X axis - can't hit ray
	if ($yflag0 != $yflag1) {
	    # check if points on same side of Y axis
	    if (($xflag0 = ($$vtx0[$X] > $$point[$X])) ==
		     ($$vtx1[$X] > $$point[$X])) {
		$crossings++ if $xflag0;
	    } 
	    else {
		# compute intersection of pgon segment with X ray, note
		#  if > point's X.
		$crossings += ($$vtx0[$X] -
			       $dv0*($$vtx1[$X]-$$vtx0[$X])/
			       ($$vtx1[$Y]-$$vtx0[$Y])) > $$point[$X];
	    }
	}
    }
    # test if crossings is odd */
    # if we care about is winding number > 0, then just:
    #  inside_flag = crossings > 0;
    $inside_flag = $crossings & 0x01;

    return ($inside_flag);
}


sub checkBounding {
    my $poly   = shift;
    my $pnt    = shift;

    my $inside = 0;
    my($no_minx,$no_maxx,$no_miny,$no_maxy) = (1,1,1,1);
    my($x,$y,$minx,$maxx,$miny,$maxy);

    # find min and max x's and y's
    foreach $point (@$poly) {
	($x,$y) = @$point;
	if ($no_minx or $x < $minx) {
	    $minx    = $x;
	    $no_minx = 0;
	}
	if ($no_maxx or $x > $maxx) {
	    $maxx    = $x;
	    $no_maxx = 0;
	}
	if ($no_miny or $y < $miny) {
	    $miny    = $y;
	    $no_miny = 0;
	}
	if ($no_maxy or $y > $maxy) {
	    $maxy    = $y;
	    $no_maxy = 0;
	}
    }

    # now compare the point passed to the subroutine with the max and min
    ($x,$y) = @$pnt;
    if ($minx <= $x && $x <= $maxx && $miny <= $y && $y <= $maxy) {
	$inside = 1;
    }

    return $inside;
}


sub Intersect {
    my $polyref      = shift;
    my $origin       = shift;              # i.e. the line segment start point
    my $tip          = shift;
    my $polygon      = Copy $polyref;      # makes a local copy
    my $end          = new Point (@$tip);  # make a local copy
    my $intersection = undef;
    my($angle,$unrotpnt,$length,@rotated,$x_intercept,$intercept);
    my($vtx0,$vtx1,$yflag0,$yflag1,$minlength,$intersect_angle,$point);
    # Note: the accuracy of this routine near polygon vertices seems to be 
    # INCREDIBLY sensitive to the following parameter.
    # It cannot be too big or too small
    my $nearly_zero = 1e-10; 

    # translate and rotate line on X-axis
    $$end[$X] -= $$origin[$X];
    $$end[$Y] -= $$origin[$Y];
    $angle = atan2($$end[$Y],$$end[$X]);
    $rotpnt = Rotate $end (-$angle);
    $length = $$rotpnt[$X];  # length of ray segment

    # translate and rotate the polygon points
    foreach $point (@$polygon) {
	$$point[$X] -= $$origin[$X];
	$$point[$Y] -= $$origin[$Y];
	$rotpnt = Rotate $point (-$angle);
	push(@rotated,$rotpnt);
    }

    # for each polygon, check if intersects the line segment
    # Note: much of this code looks like crossingstest()
    $vtx0 = $rotated[$#rotated];
    # get test bit for above/below X axis 
    $yflag0 = ($$vtx0[$Y] >= 0.0);

    $minlength = $length;
    for ($j=0;$j < @rotated;$j++) {
	# cleverness:  bobble between filling endpoints of edges, so
	# that the previous edge's shared endpoint is maintained.
	if ($j & 0x1) {
	    $vtx0 = $rotated[$j];
	    $yflag0 = ($$vtx0[$Y] >= 0.0);
	    }
	else {
	    $vtx1 = $rotated[$j];
	    $yflag1 = ($$vtx1[$Y] >= 0.0);
	}

	# check if points not both above/below X axis - can't hit ray
	if ($yflag0 != $yflag1) {
	    # compute intersection of polygon segment with X ray,
	    # note if > 0.0.
	    $x_intercept = $$vtx0[$X] -
		           $$vtx0[$Y]*
		           ($$vtx1[$X]-$$vtx0[$X])/($$vtx1[$Y]-$$vtx0[$Y]);
	    if ($x_intercept > $nearly_zero and $x_intercept <= $minlength) {
		$minlength    = $x_intercept;
		$point = new Point ($x_intercept,0);
		$point = Rotate $point ($angle);
		$$point[$X] += $$origin[$X];
		$$point[$Y] += $$origin[$Y];
		$intersect_angle = atan2($$vtx1[$Y]-$$vtx0[$Y],$$vtx1[$X]-$$vtx0[$X]);
		$intersection->{'side angle'} = $angle + $intersect_angle;
		$sign = $intersect_angle >= 0 ? 1 : -1;
		$intersect_angle = $sign *($Pi/2 - abs($intersect_angle));
		$intersection->{'point'}  = $point;
		$intersection->{'length'} = $minlength;
		$intersection->{'angle'}  = $intersect_angle;
	    }
	}
    }

    return $intersection;  # may be undef
}

# @polygon = Mosaic Polygon (@polyrefs);
sub Mosaic {
    my $class   = shift;
    my @polyref = @_;
    my($top,$i,$j,@throw);

    for ($i=1;$i<@polyref;$i++) {
	$top = $polyref[$i];
	for ($j=0;$j<$i;$j++) {
	    if ($top->Contains ($polyref[$j])) {
		push(@throw,$j);
		next;
	    }
	    if ($polyref[$j]->Contains ($top)) {
		Punch $top ($polyref[$j]);
		next;
	    }
	    @within = Intersection ($polyref[$j],$top);
	    # @within needs to have points of intersection as well.
	    $polyref[$j]->Change (@within);
	}
    }
    
    # remove polyrefs listed in @throw
    foreach $index (@throw) {
	splice(@polyref,$index,1);
    }

    return (@polyref);
}

1;
