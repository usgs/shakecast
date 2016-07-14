#!/usr/bin/perl

# $Id: system_check.pl 408 2008-03-24 21:54:13Z klin $

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
# U.S. Geological Survey (USGS) and Gatekeeper Systems have no
# obligations to provide maintenance, support, updates, enhancements or
# modifications. In no event shall USGS or Gatekeeper Systems be liable
# to any party for direct, indirect, special, incidental or consequential
# damages, including lost profits, arising out of the use of this
# software, its documentation, or data obtained though the use of this
# software, even if USGS or Gatekeeper Systems have been advised of the
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

use Win32::TieRegistry(Delimiter=>'/');
$| = 1;

my @packages = ('DBI'	=> ['DBI', 
									'http://shakecast.awardspace.com/Installer/Modules/DBI/DBI.ppd'],
				'DBD::mysql'	=> ['DBD-mysql',
									'http://shakecast.awardspace.com/Installer/Modules/DBD-mysql/DBD-mysql.ppd'],
				'DBD::ODBC'	=> ['DBD-ODBC', 
									'http://shakecast.awardspace.com/Installer/Modules/DBD-ODBC/DBD-ODBC.ppd'],
				'Text::CSV_XS'	=> ['Text-CSV_XS', 
									'http://shakecast.awardspace.com/Installer/Modules/Text-CSV_XS/Text-CSV_XS.ppd'],
				'Config::General'	=> ['Config-General',
									'http://shakecast.awardspace.com/Installer/Modules/Config-General/Config-General.ppd'],
				'XML::LibXML::Simple'	=> ['XML-LibXML-Simple', 
									'http://shakecast.awardspace.com/Installer/Modules/XML-Writer/XML-Writer.ppd'],
				'XML::Writer'	=> ['XML-Writer', 
									'http://shakecast.awardspace.com/Installer/Modules/XML-Writer/XML-Writer.ppd'],
				'Template'	=> ['Template-Toolkit',
									'http://shakecast.awardspace.com/Installer/Modules/Template-Toolkit/Template-Toolkit.ppd'],
				'enum'	=> ['enum', 
									'http://shakecast.awardspace.com/Installer/Modules/enum/enum.ppd'],
				'PDF::API2'	=> ['PDF-API2', 
									'http://shakecast.awardspace.com/Installer/Modules/enum/enum.ppd'],
				'PDF::Table'	=> ['PDF-Table', 
									'http://shakecast.awardspace.com/Installer/Modules/enum/enum.ppd'],
				'Win32::Daemon'	=> ['Win32-Daemon', 
								'http://www.roth.net/perl/packages/win32-daemon.ppd', 
								'http://www.pavelec.net/adam/perl/packages/win32-daemon.ppd'],
				'Image::Size'	=> ['Image-Size',
								'http://theoryx5.uwinnipeg.ca/ppms/GD.ppd'], 
				'MIME::Lite'	=> ['MIME-Lite',
								'http://theoryx5.uwinnipeg.ca/ppms/GD.ppd'], 
				'GD'	=> 'http://theoryx5.uwinnipeg.ca/ppms/GD.ppd', 
				'GD::Text'	=> 'http://theoryx5.uwinnipeg.ca/ppms/GDTextUtil.ppd', 
				'GD::Graph'	=> 'http://theoryx5.uwinnipeg.ca/ppms/GDGraph.ppd', 
				'GD::Graph3d'	=> 'http://theoryx5.uwinnipeg.ca/ppms/GD-Graph3d.ppd', 
				);
				
my $applications = {'Apache'	=> 'ServerRoot', 
				'MySQL'	=> 'Location',
				#'perl'	=> 'BinDir', 
				'PHP'	=> 'InstallDir', 
				};
my ($match_app, $match_key);

my $install = ($ARGV[0] =~ /install/i) ? 1 : 0;
#
#  Check installed Perl modules
#
print "Checking installed Perl modules \n";
$install_count = 0;
$pack_count = scalar @packages;
while (my $module = shift @packages) {
	$ppm = shift @packages;
	print "Module $module -> ";
	if (eval "use $module; 1" ) {
		print "OK\n";
		$install_count++;
	} else {
		print "Not found.\n";
		if (install_module($module, $ppm)) {
			print "Module $module successfully installed\n";
			$install_count++;
		} else {
			print "Failed to install module $module\n";
		}
	}
}

if ($install_count < $pack_count) {
	print "Perl module check failed. \n\n";
} else {
	print "Looks good. \n\n";
}

#
#  Check installed applications required by ShakeCast
#
print "Checking installed Applications \n";
if (check_content('LMachine/Software')) {
	print "Application check failed. \n\n";
} else {
	print "Looks good. \n\n";
}

require ExtUtils::MakeMaker;
my $yn = ExtUtils::MakeMaker::prompt
	("Press any key to continue.", '');

exit 0;


sub install_module {

	my ($module, $ppd) = @_;
	my $installed = 0;
	
	require ExtUtils::MakeMaker;
	my $yn;
	
	if ($install) {
		$yn = 'y';
	} else {
		$yn = ExtUtils::MakeMaker::prompt
			("  Install $module now?", 'y');
	}
  
	unless ($yn =~ /^y/i) {
		print " *** ShakeCast will not function properly without $module...\n";
		return $installed;
	}

	my @repos;
	if (ref($ppd) eq "ARRAY") {
		push @repos, @$ppd;
	} else {
		push @repos, $ppd;
	}
	
	foreach my $repo (@repos) {
		if ($^O eq 'MSWin32') {
			system("ppm install $repo");
		} else {
			require Cwd;
			require File::Spec;
			require CPAN;

			# Save this 'cause CPAN will chdir all over the place.
			my $cwd = Cwd::cwd();

			CPAN::Shell->install('$module');
			CPAN::Shell->expand("Module", "$module")->uptodate
			  or return $installed;

			chdir $cwd or return $installed;
		}
		return 1 if (eval "use $module; 1");
	}
	
	return $installed;

}

sub display_reg
{
	my $hash_ref = shift;

	if (ref($hash_ref) eq "Win32::TieRegistry") {
		foreach my $hash_key (keys %$hash_ref) {
			if ($hash_key =~ m#/$#) {
				#print "SubKey $hash_key ",$hash_ref->{hash_key},"\n";
				display_reg($hash_ref->{$hash_key});
			} else {
				if ($hash_key =~ /$match_key/) {
					print "Found ", $app, " installed at ",$hash_ref->{$hash_key},"\n";
					$install_count++;
					return $hash_ref->{$hash_key};
				}
			}
		}
	}
}


sub check_content
{
	$install_count = 0;
	my $root = shift;
	my $diskkeys = $Registry->{$root};
	$apps = join '|', keys %$applications;
	foreach $entry ( keys %$diskkeys )
	{
		next unless ($entry =~ /$apps/i);
		foreach $app (keys %$applications) {
			next unless ($entry =~ /$app/i);
			$match_key = $applications->{$app};
			display_reg($diskkeys->{$entry});
			last;
		}
	}
	if ($install_count < scalar (keys %$applications)) {
		return 1;
	} else {
		return 0;
	}

}


