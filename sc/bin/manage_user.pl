#!/usr/local/bin/perl

# $Id: manage_user.pl 520 2008-10-22 14:00:42Z klin $

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

use strict;
use warnings;

use Data::Dumper;
use Getopt::Long;
use IO::File;
use Text::CSV_XS;
#use Digest::MD5 qw(md5_hex);
#use Crypt::SaltedHash;
use Digest::SHA qw( sha256_hex );

use FindBin;
use lib "$FindBin::Bin/../lib";

use SC;


sub epr;
sub vpr;
sub vvpr;

my $update_password = "$FindBin::Bin/update_password.pl";
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

my $csv;
my $fh;

my %columns;        # field_name -> position
my %methods;        # delivery method -> [ pager, email_text, email_html ]
my %profiles;          # attribute name -> position
my %users;          # attribute name -> position

# specify required columns, 1=always required, 2=not required for update
my %required = (
    'USERNAME'		=> 1,
    'USER_TYPE'		=> 1,
    'FULL_NAME'		=> 2,
    'EMAIL_ADDRESS'	=> 2,
    'PHONE_NUMBER'	=> 2
);

# translate delivery method to array index
my %delivery_methods = (
    'PAGER'     => 0,
    'EMAIL_TEXT'    => 1,
    'EMAIL_HTML'       => 2
);
# map array index to delivery method
my @delivery_methods = (
    'PAGER',
    'EMAIL_TEXT',
    'EMAIL_HTML'
);


my $sth_lookup_user;
my $sth_ins;
my $sth_repl;
my $sth_upd;
my $sth_del;
my $sth_del_phpbb;
my $sth_ins_metric;
my $sth_del_metrics;
my $sth_del_one_metric;
my $sth_ins_attr;
my $sth_del_attrs;
my $sth_del_specified_attrs;
my $sth_del_notification;
my $sth_lookup_group_id;
my $sth_ins_lookup_user;

my $sub_ins_upd;
my $sth_del_profiles;
my $sth_ins_profile;
my $sth_ins_method;
my $sth_del_delivery_methods;
my $sth_del_notification_request;
my $sth_del_facility_notification_request;


GetOptions(
    \%options,

    'insert',           # error for existing users
    'skip',             # skip existing users
    'replace',          # replace existing users
    'update',           # update existing users
    'delete',           # delete existing users	
    
    'verbose+',         # repeat for more verbosity
    'help',             # print help and exit

    'limit=n',          # max bad records allowed (0 for no limit)
    
    'quote=s',          # specify alternate quote char (default is ")
    'separator=s'       # specify alternate field separator (default is ,)

) or usage(1);
usage(1) unless scalar @ARGV;
usage(1) if length $options{'separator'} != 1;
usage(1) if length $options{'quote'} != 1;

usage(1) if $options{'insert'} + $options{'replace'} +
            $options{'update'} + $options{'skip'} > 1;

my $mode;
use constant M_INSERT  => 1;
use constant M_REPLACE => 2;
use constant M_UPDATE  => 3;
use constant M_SKIP    => 4;
use constant M_DELETE    => 5;	

$mode = M_REPLACE;      # default mode
$mode = M_INSERT   if $options{'insert'};
$mode = M_UPDATE   if $options{'update'};
$mode = M_SKIP     if $options{'skip'};
$mode = M_DELETE     if $options{'delete'};	

SC->initialize;
my $perl = SC->config->{perlbin};

$sth_lookup_user = SC->dbh->prepare(qq{
    select shakecast_user
      from shakecast_user
     where username = ?});

$sth_del = SC->dbh->prepare(qq{
    delete from shakecast_user
     where shakecast_user = ?});

$sth_del_phpbb = SC->dbh->prepare(qq{
    delete from phpbb_users
     where user_id = ?});

$sth_del_delivery_methods = SC->dbh->prepare(qq{
    delete from user_delivery_method
     where shakecast_user = ?});

$sth_lookup_group_id = SC->dbh->prepare(qq{
    select su.shakecast_user
      from geometry_profile gp inner join shakecast_user su
		on gp.profile_name = su.username
     where gp.profile_name = ?});

$sth_ins_lookup_user = SC->dbh->prepare(qq{
    insert into phpbb_users (
	   user_id, user_active, username, user_email, user_fullname, user_password, user_level)
    select shakecast_user, 1, username, email_address, full_name, ?, ? 
      from shakecast_user
     where shakecast_user = ?});

#$sth_del_notification = SC->dbh->prepare(qq{
#    delete from facility_notification_request
#     where shakecast_user = ?});

#$sth_del_one_method = SC->dbh->prepare(qq{
#    delete from facility_fragility
#     where shakecast_user = ?
#       and metric = ?});

$sth_ins_method = SC->dbh->prepare(qq{
    insert into user_delivery_method (
	   shakecast_user, delivery_method, delivery_address)
    values (?,?,?)});

$sth_ins_profile = SC->dbh->prepare(qq{
    insert into geometry_user_profile (
           shakecast_user, profile_id)
    values (?,?)});

$sth_del_notification_request = SC->dbh->prepare(qq{
    delete fnr, nr from facility_notification_request fnr, notification_request nr
     where fnr.notification_request_id = nr.notification_request_id
		and nr.shakecast_user = ?});

$sth_del_profiles = SC->dbh->prepare(qq{
    delete from geometry_user_profile
     where shakecast_user = ?});

$sth_del_facility_notification_request = SC->dbh->prepare(qq{
    delete f from facility_notification_request as f
	 inner join notification_request as n
	 on f.notification_request_id = n.notification_request_id
     where n.shakecast_user = ?});


$csv = Text::CSV_XS->new({
        'quote_char'  => $options{'quote'},
        'escape_char' => $options{'quote'},
        'sep_char'    => $options{'separator'}
 });

foreach my $file (@ARGV) { 
    $fh = new IO::File;
    unless ($fh->open($file, 'r')) {
        epr "cannot open $file\: $!";
        next;
    }
    vpr "Processing $file";
    process();
    $fh->close;
}
exit;

    
sub process {
    unless (process_header()) {
        epr "file had errors, skipping";
        return;
    }
    my $err_cnt = 0;
    my $nrec = 0;
    my $nins = 0;
    my $nupd = 0;
    my $nrepl = 0;
    my $ndel = 0;
    my $nskip = 0;

    while (!$fh->eof) {
        if ($nrec and $nrec % 100 == 0) {
            vpr "$nrec records processed";
        }
        my $colp = $csv->getline($fh);
        $nrec++;
        # TODO error handling
        if ($options{'limit'} && $err_cnt >= $options{'limit'}) {
            epr "error limit reached, skipping";
            return;
        }
        my $ext_id = $colp->[$columns{USERNAME}];
        my $type   = $colp->[$columns{USER_TYPE}];
        
        my $shakecast_user = lookup_user($ext_id);
	    #my $csh = Crypt::SaltedHash->new(algorithm => 'SHA-256');
	    if (defined $colp->[$columns{PASSWORD}]) {
		system ("$perl $update_password -target user -username $ext_id -password ".$colp->[$columns{PASSWORD}]);
		#$csh->add($colp->[$columns{PASSWORD}]);

		#$colp->[$columns{PASSWORD}] = $csh->generate;
		$colp->[$columns{PASSWORD}] = sha256_hex($colp->[$columns{PASSWORD}]);
	    }
		
        if ($shakecast_user < 0) {
            # error looking up ID
            $err_cnt++;
            next;
        } elsif ($shakecast_user == 0) {
            # new record
            if ($mode == M_UPDATE or $mode == M_DELETE) {
                # update requires the record to already exist
                epr "$type $ext_id does not exist";
                $err_cnt++;
                next;
            }
            eval {
                $sth_ins->execute(&$sub_ins_upd($colp));
                $nins++;
                $shakecast_user = lookup_user($ext_id);
                if ($shakecast_user < 0) {
                    $err_cnt++;
                    next;
                } elsif ($shakecast_user == 0) {
                    epr "lookup failed after insert of $type $ext_id";
                    $err_cnt++;
                    next;
                } else {
					my $password = $colp->[$columns{PASSWORD}];
					my $user_level = ($colp->[$columns{USER_TYPE}] eq 'ADMIN') ? 1 : 0;
					$sth_ins_lookup_user->execute($password, $user_level, $shakecast_user);
				}
            };
            if ($@) {
                epr $@;
                $err_cnt++;
                next;
            }
        } else {
            # record exists
            if ($mode == M_SKIP) {
                # silently skip existing records
                $nskip++;
                next;
            } elsif ($mode == M_INSERT) {
                # insert requres that the record NOT exist
                epr "$type $ext_id already exists";
                $err_cnt++;
                next;
            } elsif ($mode == M_REPLACE) {
                # replace the facility notifications and all delivery methods and profiles
                $sth_del_facility_notification_request->execute($shakecast_user);
                $sth_del_notification_request->execute($shakecast_user);
                $sth_del_delivery_methods->execute($shakecast_user);
                $sth_del_profiles->execute($shakecast_user);
                eval {
                    $sth_del->execute($shakecast_user);
                    $sth_del_phpbb->execute($shakecast_user);
                    $sth_repl->execute(&$sub_ins_upd($colp), $shakecast_user);
                    $nrepl++;
					$shakecast_user = lookup_user($ext_id);
					if ($shakecast_user < 0) {
						$err_cnt++;
						next;
					} elsif ($shakecast_user == 0) {
						epr "lookup failed after insert of $type $ext_id";
						$err_cnt++;
						next;
					} else {
						my $password = $colp->[$columns{PASSWORD}];
						my $user_level = ($colp->[$columns{USER_TYPE}] eq 'ADMIN') ? 1 : 0;
						$sth_ins_lookup_user->execute($password, $user_level, $shakecast_user);
					}
                };
                if ($@) {
                    epr $@;
                    $err_cnt++;
                    next;
                }
            } elsif ($mode == M_DELETE) {
                # replace the facility notifications and all delivery methods and profiles
                $sth_del_facility_notification_request->execute($shakecast_user);
                $sth_del_notification_request->execute($shakecast_user);
                $sth_del_profiles->execute($shakecast_user);
                $sth_del_delivery_methods->execute($shakecast_user);
				eval {
                    $sth_del->execute($shakecast_user);
                    $sth_del_phpbb->execute($shakecast_user);
                    $ndel++;
                };
                if ($@) {
                    epr $@;
                    $err_cnt++;
                }
				next;
            } else {
                # update just updates the existing record
                eval {
                    $sth_upd->execute(&$sub_ins_upd($colp), $shakecast_user);
                    $nupd++;
                };
                if ($@) {
                    epr $@;
                    $err_cnt++;
                    next;
                }
            }
        }
        # at this point the facility record has been either inserted or
        # updated, and $shakecast_user is its PK.
        if (%methods) {
			if ($mode == M_UPDATE or $mode == M_REPLACE) {
                # delete any attributes mentioned in the input file
				$sth_del_delivery_methods->execute($shakecast_user);
            }
            while (my ($method, $ix) = each %methods) {
                my $val = $colp->[$ix];
                # don't insert null attribute values
                next unless defined $val and $val ne '';
                $sth_ins_method->execute($shakecast_user, $method, $colp->[$ix]);
            }
        }

        if (%users) {
			if ($mode == M_UPDATE or $mode == M_REPLACE) {
                 # delete any profiles mentioned in the input file
                $sth_del_facility_notification_request->execute($shakecast_user);
                $sth_del_notification_request->execute($shakecast_user);
                $sth_del_profiles->execute($shakecast_user);
            }
            while (my ($user, $ix) = each %users) {
                my $val = $colp->[$ix];
                # don't insert null notification request values
                next unless defined $val and $val ne '';
				my $source_user = lookup_user($val);
                next unless  $source_user > 0;
                my $result = process_clone_user_notification($shakecast_user, $source_user);
            }
        }

        if (%profiles) {
			if ($mode == M_UPDATE or $mode == M_REPLACE) {
                 # delete any notification requests and profiles mentioned in the input file
                $sth_del_facility_notification_request->execute($shakecast_user);
                $sth_del_notification_request->execute($shakecast_user);
                $sth_del_profiles->execute($shakecast_user);
            }
            while (my ($profile, $ix) = each %profiles) {
                next unless defined $colp->[$ix] and $colp->[$ix] ne '';
                my (@vals) = split /:/, $colp->[$ix];
                # don't insert null profile values
				foreach my $val (@vals) {
					my $result = process_clone_profile($shakecast_user, $val);
				}
            }
        }
    }
    vpr "$nrec records processed ($nins inserted, $nrepl replaced, $nupd updated, $ndel deleted, $err_cnt rejected)";
}


# Return profile_id given profile_name
sub lookup_group_id {
    my ($profile_name) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_group_id, undef,
        $profile_name);

    if (scalar @$idp > 1) {
        epr "multiple matching profiles for $profile_name";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

sub process_clone_profile {
    my ($user_key, $profile) = @_;
    return 0 unless $user_key && $profile;
	my $admin_user = "cmdadmin";
	my $profile_id = lookup_group_id($profile);
	return 0 unless ($profile_id > 0);
	
	my $rc = $sth_ins_profile->execute($user_key, $profile_id);
	
	return $rc;
}


sub process_clone_user_notification {
    my ($user_key, $source_user) = @_;
    return 0 unless $user_key && $source_user;
	my $admin_user = "cmd";
	
    my $sth_n = SC->dbh->prepare(qq/
        select notification_request_id,
               damage_level,
               notification_type,
               event_type,
               delivery_method,
               message_format,
               limit_value,
               user_message,
               notification_priority,
               auxiliary_script,
               disabled,
               product_type,
               metric,
               aggregate,
               aggregation_group
          from notification_request
         where shakecast_user = ?/);
    my $sth_i = SC->dbh->prepare(qq/
        insert into notification_request (
               damage_level,
               notification_type,
               event_type,
               delivery_method,
               message_format,
               limit_value,
               user_message,
               notification_priority,
               auxiliary_script,
               disabled,
               product_type,
               metric,
               aggregate,
               aggregation_group,
               shakecast_user,
               update_username,
               update_timestamp)
        values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)/);
    $sth_n->execute($source_user);

    my %needed_methods; # remember needed delivery methods here
    while (my @v = $sth_n->fetchrow_array) {
        my $old_id = shift @v;
        $needed_methods{$v[3]} = $v[3];
        $sth_i->execute(@v, $user_key, $admin_user, ts()) or return 0;
        # get the notification_request_id for the record just inserted
        my $new_id = SC->dbh->{mysql_insertid};
        return 0 unless $new_id;
        # copy all the facilities for one notification request
        SC->dbh->do(qq/
            insert into facility_notification_request (
                   notification_request_id, facility_id)
                   select $new_id, fnr.facility_id
                     from facility_notification_request fnr
                    where fnr.notification_request_id = ?/, undef, $old_id)
            or return 0;
    }
    # create any missing delivery methods for the new user
    # find out what methods already exist for the new user
    my $existing_methods = SC->dbh->selectcol_arrayref(qq/
        select distinct delivery_method
          from user_delivery_method
         where shakecast_user = ?/, undef, $user_key)
            or return 0;
    foreach my $m (@$existing_methods) {
        delete $needed_methods{$m};
    }
    # now %needed_methods only contains delivery_methods we must still create
    foreach my $m (keys %needed_methods) {
        SC->dbh->do(qq/
            insert into user_delivery_method (
                   delivery_method,
				   delivery_address,
                   shakecast_user,
                   update_username,
                   update_timestamp)
            values (?, ?, ?, ?, ?)/, undef, $m, "TBA", $user_key, $admin_user, ts())
                or return 0;
    }
	return 1;
}


# Return shakecast_user given external_shakecast_user name
sub lookup_user {
    my ($external_id) = @_;
    my $idp = SC->dbh->selectcol_arrayref($sth_lookup_user, undef,
        $external_id);
    if (scalar @$idp > 1) {
        epr "multiple matching shakecast users for $external_id";
        return -1;      # valid IDs are all greater than 0
    } elsif (scalar @$idp == 1) {
        return $$idp[0];
    } else {
        return 0;       # not found
    }
}

# Read and process header, building data structures
# Returns 1 if header is ok, 0 for problems
sub process_header {
    my $err_cnt = 0;
    undef %columns;
    undef %methods;
    undef %profiles;
    undef %users;

    my $header = $fh->getline;
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
    #   DELIVERY:<delivery-method>:<delivery-address>
    #   PROFILE:<profile-name>
    #   USER:<user-name>
    #   <user-column-name>
    foreach my $field (@fields) {
        if ($field =~ /^DELIVERY\s*:\s*(.*)/) {
            vvpr "$ix\: METHOD: $1";
            $methods{$1} = $ix;
        } elsif ($field =~ /^PROFILE|GROUP\s*:\s*(.*)/) {
            vpr "$ix\: PROFILE: $1";
            $profiles{$1} = $ix;
        } elsif ($field =~ /^USER\s*:\s*(.*)/) {
            vvpr "$ix\: USER: $1";
            $users{$1} = $ix;
        } else {
            vvpr "$ix\: COLUMN: $field";
            # TODO check for unknown columns (either here or later on)
            $columns{$field} = $ix;
        }
        $ix++;
    }
    if ($options{'verbose'} >= 2) {
        print Dumper(%columns);
        print Dumper(%methods);
        print Dumper(%profiles);
        print Dumper(%users);
    }

    # check for required fields
    while (my ($req, $req_type) = each %required) {
        # relax required fields for update (only PK is mandatory)
        next if $req_type == 2 and ($mode == M_UPDATE or $mode == M_DELETE);
        unless (defined $columns{$req}) {
            epr "required field $req is missing";
            $err_cnt++;
        }
    }

    return 0 if $err_cnt;

    # build sql
    my @keys = sort keys %columns;
    
    my $sql = 'insert into shakecast_user (' . join(',', @keys) . ') ' .
        'values (' . join(',', ('?') x scalar @keys) . ') '; 
    vvpr "insert: $sql";
    $sth_ins = SC->dbh->prepare($sql);
    
    $sql = 'update shakecast_user set '. join(',', map { qq{$_ = ?} } @keys) . 
        ' where shakecast_user = ?';
    vvpr "update: $sql";
    $sth_upd = SC->dbh->prepare($sql);

    $sql = 'insert into shakecast_user (' . join(',', @keys) . ',shakecast_user) ' .
        'values (' . join(',', ('?') x scalar @keys) . ',?) '; 
    vvpr "replace: $sql";
    $sth_repl = SC->dbh->prepare($sql);
    
    # dynamically create a sub that takes the input array of fields and
    # returns a new list with just those fields that go into the facility
    # insert/update statement, in the proper order
    my $sub = "sub { (" .
        join(',', (map { q{$_[0]->[} . $columns{$_} . q{]} } (@keys))) .
        ') }';
    
    vvpr $sub;
    $sub_ins_upd = eval $sub;

    return 1;

}


sub ts {
    my $time = shift;
    my($sec, $min, $hr, $mday, $mon, $yr);

    $time = time unless defined $time;
    ($sec, $min, $hr, $mday, $mon, $yr) = localtime $time;
    sprintf ("%04d-%02d-%02d %02d:%02d:%02d",
	     $yr+1900, $mon+1, $mday,
	     $hr, $min, $sec);
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
manage_user.pl -- User Management utility
Usage:
  manage_user [ mode ] [ option ... ] input-file

Mode is one of:
    --replace  Inserts new users and replaces existing ones, along with
               any existing notification preferences
    --insert   Inserts new users.  Existing users are not
               modified; each one generates an error.
    --delete   Delete users. Each non-exist one generates an error.
    --update   Updates existing users.  Only those fields present in the
               input file are modified; other fields not mentioned are left
               alone.  An error is generated for each user that does not
               exist.
    --skip     Inserts users not in the database.  Skips existing
               users.
  
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

