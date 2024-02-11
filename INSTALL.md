# PeerViewer Installation instructions

In the instructions below, x.y.z is the version number you want to install.

# Windows

Download and install one of the Windows builds:

- **PeerViewer.Setup.x.y.z.exe** is a regular assisted installer that creates shortcuts, allows you to choose the installation directory, etc.
- **PeerViewer.x.y.z.msi** is a Microsoft Windows Installer with additional commandline options (add /? for help) to support automated deployments and advanced usage.
- **PeerViewer.x.y.z.exe** is a portable executable - it works out of the box, without installation steps. You'll have to create your own shortcut if you want one.
- **PeerViewer-x.y.z-win.zip** is an archive file that can be extracted to a manually created folder for do-it-yourself installations, including creating your own shortcut.

# Linux

## All-in-one bundles

These don't require any dependency installation.

- **PeerViewer-x.y.z.AppImage** is a portable binary that just works when you make it executable and start it. You'll have to create your own shortcut if you want one.
- **PeerViewer-1.3.0.tar.gz** is an archive file that can be extracted to a manually created folder for do-it-yourself installations, including creating your own shortcut.

## Debian/Ubuntu

To install the dependencies for the Debian/Ubuntu Linux .deb package, you may need to run or install something like:

`sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0 libsecret-common libnspr4`

And then install the PeerViewer_x.y.z_amd64.deb file by double-clicking it or running something like:

`sudo dpkg -i PeerViewer_x.y.z_amd64.deb`

## Redhat/Fedora/OpenSuse/CentOS

To install the dependencies for the Redhat/Fedora/OpenSuse/CentOS .rpm package, you may need to run something like (untested):

`sudo yum install at-spi2-core gtk3 libnotify libuuid nss xdg-utils`

And then install the PeerViewer_x.y.z_x86_64.rpm file by double-clicking it or running something like:

`sudo rpm -i PeerViewer_x.y.z_x86_64.rpm`

## Snap package

The PeerViewer_x.y.z_amd64.snap package is untested as of yet but it should just work. If you're into snap, try it out and give some feedback!

