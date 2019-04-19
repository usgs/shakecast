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
    ; include for some of the windows messages defines
    !include "winmessages.nsh"
    ; HKLM (all users) vs HKCU (current user) defines
    !define env_hklm 'HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"'
    !define env_hkcu 'HKCU "Environment"'
    ; set variable for local machine
    WriteRegExpandStr ${env_hklm} SC_HOME "$PROFILE\.shakecast"
    ; and current user
    WriteRegExpandStr ${env_hkcu} SC_HOME "$PROFILE\.shakecast"
    ; make sure windows knows about the change
    SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000

    DetailPrint "Extracting Files into Installation Directory" 
    # specify files to go into the installation directory path
    File "*"

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

    DetailPrint "Python is ready..."
SectionEnd

Section "ShakeCast installation"
    DetailPrint "Installing ShakeCast"

    ExecDos::exec /DETAILED "C:\Python27\python.exe -m pip install usgs-shakecast"
    ExecDos::exec /DETAILED "C:\Python27\python.exe -m pip install usgs-shakecast --upgrade"

    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast.app.startup"
    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast.app.windows.set_paths"
    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast.app.windows install"

    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast start"
    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast stop"
    Sleep 10000
    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast start"

    # make a link to the python package from the install directory
    CreateShortCut "$INSTDIR\shakecast.lnk" "C:\Python27\Lib\site-packages\shakecast"
    CreateShortCut "$INSTDIR\user-data.lnk" "$PROFILE\.shakecast"
    DetailPrint "Finishing up Installation..."
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

    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast stop"
    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast.app.windows uninstall"
    ExecDos::exec /DETAILED "C:\Python27\python.exe -m shakecast.app.windows.set_paths remove"
    ExecDos::exec /DETAILED "C:\Python27\Scripts\pip.exe uninstall pywin32 -y"
    ExecWait '"$SYSDIR\msiExec" /x "$INSTDIR\python-2.7.13.msi"'

	# Remove files
	delete $INSTDIR\*

    # Remove data directory
    rmDir /r "$PROFILE\.shakecast"

    # Remove python
    rmDir /r "C:\Python27"

	# Always delete uninstaller as the last action
	delete $INSTDIR\uninstall.exe
 
	# Try to remove the install directory
	rmDir /r $INSTDIR
 
sectionEnd