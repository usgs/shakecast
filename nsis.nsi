!include LogicLib.nsh

# define the name of installer
OutFile "dist\Shakecast_Installer.exe"

# define default installation directory
InstallDir "$PROGRAMFILES\Shakecast"

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

Function PythonCheck
    IfFileExists "C:\Python39\python.exe" 0 Skip
    ExecWait '"$INSTDIR\python-3.9.7.exe" /uninstall'
    ExecWait 'rmdir /sq C:\Python39'

    Skip:
FunctionEnd

# start default section
Section "Install ShakeCast" IDOK
    # remove pythonn if it exists
    Call PythonCheck

    # set the installation directory as the destination for the following actions
    SetOutPath $INSTDIR

    # set environment variable for shakecast home
    ; include for some of the windows messages defines
    !include "winmessages.nsh"
    ; HKLM (all users) vs HKCU (current user) defines
    !define env_hklm 'HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"'
    !define env_hkcu 'HKCU "Environment"'
    ; set variable for local machine
    WriteRegExpandStr ${env_hklm} SHAKECAST_USER_DIRECTORY "$INSTDIR\user"
    ; and current user
    WriteRegExpandStr ${env_hkcu} SHAKECAST_USER_DIRECTORY "$INSTDIR\user"

    ; add Python paths to PATH
    EnVar::AddValue "PATH" "C:\Python39"
    EnVar::AddValue "PATH" "C:\Python39\Scripts"
    EnVar::AddValue "PATH" "C:\Python39\Lib\site-packages\pywin32_system32"
    EnVar::AddValue "PATH" "C:\Python39\Lib\site-packages\win32"

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
    File "..\requirements\python-3.9.7.exe"
    ExecWait '"$INSTDIR\python-3.9.7.exe" /quiet TargetDir=C:\Python39 InstallAllUsers=1'

    # install the windows extensions
    
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m pip install pywin32 --upgrade --no-cache-dir --trusted-host pypi.python.org --trusted-host files.pythonhosted.org --trusted-host pypi.org"
    DetailPrint "Python is ready..."
SectionEnd

Section "ShakeCast installation"
    DetailPrint "Installing ShakeCast"
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m pip install usgs-shakecast --upgrade --no-cache-dir --trusted-host pypi.python.org --trusted-host files.pythonhosted.org --trusted-host pypi.org"

    DetailPrint "Initializing ShakeCast..."
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast.app.startup"
    DetailPrint "App init."

    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast.app.windows.set_paths"
    DetailPrint "Paths set."
    
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast.app.windows install"
    DetailPrint "Services installed."

    DetailPrint "Starting ShakeCast..."
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast start"
    
    DetailPrint "Waiting..."
    Sleep 5000

    DetailPrint "Stopping ShakeCast..."
    ExecDos::exec /DETAILED "net stop sc_server"
    ExecDos::exec /DETAILED "net stop sc_web_server"

    DetailPrint "Waiting..."
    Sleep 10000

    DetailPrint "Starting ShakeCast..."
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast start"
    DetailPrint "Started"

    # make a link to the python package from the install directory
    DetailPrint "Adding links..."
    CreateShortCut "$INSTDIR\shakecast.lnk" "C:\Python39\Lib\site-packages\shakecast"
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

    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast stop"
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast.app.windows uninstall"
    ExecDos::exec /DETAILED "C:\Python39\python.exe -m shakecast.app.windows.set_paths remove"
    ExecWait '"$INSTDIR\python-3.9.7.exe" /uninstall'

	# Remove files
	delete $INSTDIR\*

    # Remove data directory
    rmDir /r "$PROFILE\.shakecast"

    # Remove python
    rmDir /r "C:\Python39"

	# Always delete uninstaller as the last action
	delete $INSTDIR\uninstall.exe
 
	# Try to remove the install directory
	rmDir /r $INSTDIR
 
sectionEnd