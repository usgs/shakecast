
# $Id: Arias.pm 441 2008-08-14 18:54:49Z klin $

##############################################################################
# 
# Terms and Conditions of Software Use
# ====================================
# 
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
# 
# Disclaimer of Earthquake Information
# ====================================
# 
# The data and maps provided through this system are preliminary data
# and are subject to revision. They are computer generated and may not
# have received human review or official approval. Inaccuracies in the
# data may be present because of instrument or computer
# malfunctions. Subsequent review may result in significant revisions to
# the data. All efforts have been made to provide accurate information,
# but reliance on, or interpretation of earthquake data from a single
# source is not advised. Data users are cautioned to consider carefully
# the provisional nature of the information before using it for
# decisions that concern personal or public safety or the conduct of
# business that involves substantial monetary or operational
# consequences.
# 
# Disclaimer of Software and its Capabilities
# ===========================================
# 
# This software is provided as an "as is" basis.  Attempts have been
# made to rid the program of software defects and bugs, however the
# U.S. Geological Survey (USGS) have no obligations to provide maintenance, 
# support, updates, enhancements or modifications. In no event shall USGS 
# be liable to any party for direct, indirect, special, incidental or 
# consequential damages, including lost profits, arising out of the use 
# of this software, its documentation, or data obtained though the use 
# of this software, even if USGS or have been advised of the
# possibility of such damage. By downloading, installing or using this
# program, the user acknowledges and understands the purpose and
# limitations of this software.
# 
# Contact Information
# ===================
# 
# Coordination of this effort is under the auspices of the USGS Advanced
# National Seismic System (ANSS) coordinated in Golden, Colorado, which
# functions as the clearing house for development, distribution,
# documentation, and support. For questions, comments, or reports of
# potential bugs regarding this software please contact wald@usgs.gov or
# klin@usgs.gov.  
#
#############################################################################


package Shake::Metric::Arias;

use Shake::Distance;

# Module to generate Arias Intensity in addition to PGA/PGV/etc

$CONSTANTS{'arias'} =
  { c1 => 2.800, c2 => -1.981, c3 => 20.72, c4 => -1.703,
    h2 => 8.78**2, 
    s11 => 0.454, s12 => 0.101, s21 => 0.479, s22 => 0.334,
    f1 => -0.166, f2 => 0.512,
  };

# multiplicative rather than additive factors.
%SIGMA = ('arias' => 1.18,
	 );

sub new {
	my $class = shift;
	my $lat   = shift;
	my $lon   = shift;
	my $mag   = shift;
	my $source_type;
  
	# ignore the magnitude min, max range if passed as arguments
  
	my $self = { lat=>$lat, lon=>$lon, mag =>$mag };

	# If there is a fault model specified, extract it.
	foreach (@_) { 
		$self->{fault} = $_ if (ref $_ eq 'ARRAY');
		$source_type = $_->type if (ref $_ eq 'Source');
	}
  
	if (!defined $source_type) {
		print "Regression: No source mechanism specified. Using default.\n";
	} elsif ($source_type =~ /(SS|RS|ALL)/i) {
		$source_type = uc $1;
		print "Regression: Source mechanism: $source_type.\n";
	} else {
		print "Regression: Unknown source mechanism '$source_type'. Using default.\n";
		undef $source_type;
	}
	$source_type = 'ALL' unless (defined $source_type);
	$self->{type} = $source_type;

	$self->{ bias } = { pga   => 1,
		      pgv   => 1,
		      psa03 => 1,
		      psa10 => 1,
		      psa30 => 1 };
  
	bless $self, $class;
}


sub get_metric {
	my ($class, $event, $facility, $facility_shaking) = @_;

	my $M = $event->{MAGNITUDE};
	return 0 unless ($M);
	
	my $R = Shake::Distance::dist($event->{LAT}, $event->{LON}, $facility->{LAT_MIN}, $facility->{LON_MIN});
	my $type = '';
	
	my %c = %{$CONSTANTS{'arias'}};
	my ($Fn,$Fr) = ($type =~ /SS/) ? (0,0)
               : ($type =~ /RS/) ? (0,1)
               : ($type =~ /NS/) ? (1,0)
               : (0,0);

	my $A = $c{c1} + $c{c2}*($M-6) + $c{c3}*log($M/6)
        + $c{f1}*$Fn + $c{f2}*$Fr;

	my $sc_term = get_site_corr($M, $facility->{SVEL});
	my $Ia = exp($A + $sc_term + $c{c4}*log(sqrt($R**2 + $c{h2})));

	return $Ia * 1.15;
}


sub get_damage {
	my ($class, $event, $facility, $facility_fragility) = @_;

	my $Ia = $facility_fragility->{ARIAS};
	my $damage_level = $facility_fragility->{DAMAGE_LEVEL};
	my $low_limit = $facility_fragility->{LOW_LIMIT};
	my $high_limit = $facility_fragility->{HIGH_LIMIT};
	
	return 1 if ($Ia >= $low_limit && $Ia < $high_limit);
	
	return 0;
}


sub get_site_corr {
	my ($M, $stavel) = @_;

	my %c = %{$CONSTANTS{'arias'}};
	my $sc_term = $c{s11} + $c{s12}*($M-6);
	my $sd_term = $c{s21} + $c{s22}*($M-6);

	$stavel = 768 unless (defined $stavel and $stavel > 0);
  
    my ($sc,$sd) = ($stavel < 360)    ? (0,1) # D
                 : ($stavel < 760)    ? (1,0) # C
                 : (0,0);                     # B

    my $corr = exp($sc_term*$sc + $sd_term*$sd);
	
    return $corr;
}

1;
