#!/bin/sh
# This script needs: readlink, dirname, curl, sha256sum, unzip

# Execute with containing directory as current working directory
mydir=$(readlink -f "$0")
mydir=$(dirname "$mydir")
cd "$mydir"

# Download link obtained from https://uvnc.com/component/jdownloads/summary/470-ultravnc-1-4-6-zip.html
outfile=uvnc-windows.zip
outdir=uvnc-windows
downloadlink="https://uvnc.com/component/jdownloads/send/0-/470-ultravnc-1-4-6-zip.html"
sha256sum=3afe90cf4f287ff066649225223d9950221ddfd273e5f4805c2f6fde39a5df83

curl "$downloadlink" > "$outfile"
result=$?

if [ $result -eq 0 ]; then
	echo "Download successful, checking checksum and extracting..."
	rm -rf "$outdir"

	echo "$sha256sum  $outfile" | sha256sum -c - && \
	unzip -d "$outdir" "$outfile" && \
	rm "$outfile"

else
	echo "ERROR: download of $downloadlink returned exit code: $result"
	cd - # Go back to original directory
	exit 1
fi

echo "[Permissions]
[admin]
FileTransferEnabled=1
FTUserImpersonation=1
BlankMonitorEnabled=1
BlankInputsOnly=0
DefaultScale=1
UseDSMPlugin=0
DSMPlugin=
primary=1
secondary=0
SocketConnect=1
HTTPConnect=0
AutoPortSelect=0
PortNumber=55900
HTTPPortNumber=5800
InputsEnabled=1
LocalInputsDisabled=0
IdleTimeout=0
EnableJapInput=0
EnableUnicodeInput=0
EnableWin8Helper=0
QuerySetting=2
QueryTimeout=10
QueryDisableTime=0
QueryAccept=0
MaxViewerSetting=0
MaxViewers=128
Collabo=0
Frame=0
Notification=0
OSD=0
NotificationSelection=1
LockSetting=0
RemoveWallpaper=0
RemoveEffects=0
RemoveFontSmoothing=0
DebugMode=0
Avilog=0
path=
DebugLevel=0
AllowLoopback=1
LoopbackOnly=1
AllowShutdown=1
AllowProperties=1
AllowInjection=0
AllowEditClients=1
FileTransferTimeout=30
KeepAliveInterval=5
IdleInputTimeout=0
DisableTrayIcon=0
rdpmode=0
noscreensaver=0
Secure=0
MSLogonRequired=0
NewMSLogon=0
ReverseAuthRequired=1
ConnectPriority=0
service_commandline=
accept_reject_mesg=
cloudServer=
cloudEnabled=0
[UltraVNC]
passwd=33117E54AA0D4D3B55
passwd2=33117E54AA0D4D3B55
[poll]
TurboMode=1
PollUnderCursor=0
PollForeground=0
PollFullScreen=1
OnlyPollConsole=0
OnlyPollOnEvent=0
MaxCpu2=100
MaxFPS=25
EnableDriver=1
EnableHook=1
EnableVirtual=0
autocapt=1
[admin_auth]
group1=VNCACCESS
group2=Administrators
group3=VNCVIEWONLY
locdom1=0
locdom2=0
locdom3=0" | sed  -e 's/\r*$/\r/' > uvnc-windows/x64/UltraVNC.ini
	
cd - # Go back to original directory
