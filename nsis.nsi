!include LogicLib.nsh

# define the name of installer
OutFile "dist\Shakecast_Installer.exe"

# define default installation directory
InstallDir "$PROFILE\Shakecast"

# Get admin level
RequestExecutionLevel admin

!macro VerifyUserIsAdmin
UserInfo::GetAccountType
pop $0
${If} $0 != "admin" ;Require admin rights on NT4+
        messageBox mb_iconstop "Administrator rights required!"
        setErrorLevel 740 ;ERROR_ELEVATION_REQUIRED
        quit
${EndIf}
!macroend
 
function .onInit
	setShellVarContext all
	!insertmacro VerifyUserIsAdmin
functionEnd

# start default section
Section "Install ShakeCast" IDOK

    # set the installation directory as the destination for the following actions
    SetOutPath $INSTDIR

    # set environment variable for shakecast home
    EnVar::AddValue "SC_HOME" "$PROFILE/.shakecast"

    DetailPrint "Extracting Files into Installation Directory" 

    # specify files to go into the installation directory path
    File /r "*"

    # Uninstaller - See function un.onInit and section "uninstall" for configuration
	writeUninstaller "$INSTDIR\uninstall.exe"

SectionEnd

Section "Python Installation"

    # run the python installer and wait for it to finish
    File "..\requirements\python-2.7.13.msi"
    ExecWait '"$SYSDIR\msiExec" /i "$INSTDIR\python-2.7.13.msi" /qb TARGETDIR=C:\Python27 ALLUSERS=1'

    # install the windows extensions
    File "..\requirements\pywin32-224.win32-py2.7.exe"
    ExecWait 'C:\Python27\Scripts\easy_install.exe "$INSTDIR\pywin32-224.win32-py2.7.exe"'
    

SectionEnd

Section "ShakeCast installation"
    DetailPrint "Installing ShakeCast"

    ExecWait "C:\Python27\python.exe -m pip install usgs-shakecast"
    ExecWait "C:\Python27\python.exe -m shakecast.app.windows.set_paths"
    ExecWait "C:\Python27\python.exe -m shakecast start"
    DetailPrint "Finishing up Installation"
SectionEnd

# Uninstaller
 
function un.onInit
	SetShellVarContext all
 
	#Verify the uninstaller - last chance to back out
	MessageBox MB_OKCANCEL "Permanantly remove ShakeCast?" IDOK next
		Abort
	next:
	!insertmacro VerifyUserIsAdmin
functionEnd
 
section "uninstall"

    ExecWait "c:\python27\python.exe -m shakecast stop"
    ExecWait "c:\python27\python.exe -m shakecast uninstall"
    ExecWait '"$SYSDIR\msiExec" /x "$INSTDIR\python-2.7.13.msi"'

	# Remove files
	delete $INSTDIR\*

    # Remove ShakeCast directories safely
    rmDir /r $INSTDIR\admin
    rmDir /r $INSTDIR\shakecast
    rmDir /r $INSTDIR\appveyor
    rmDir /r $INSTDIR\.git

	# Always delete uninstaller as the last action
	delete $INSTDIR\uninstall.exe
 
	# Try to remove the install directory
	rmDir /r $INSTDIR
 
sectionEnd