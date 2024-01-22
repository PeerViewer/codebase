# PeerViewer codebase

PeerViewer is a remote desktop and support solution, completely free for unlimited personal and commercial use.

Under the hood, it uses direct (peer-to-peer) connections between the participants.

This was recently made possible by the advanced holepunching techniques, made by the HolePunch company.

# Why peer-to-peer?

Traditionally, when you use network apps such as TeamViewer, place audio and video calls or share files, your data is going through intermediate servers which are expensive to host, can harm your privacy, increase latency and consume additional bandwidth.

Peer-to-peer solutions such as PeerViewer have the advantage of:

- Being the highest bandwidth AND lowest latency way of establishing a network connection.
- Ensuring maximum privacy for all participants.
- Being low cost, making it possible to survive on a pay-what-you-can/voluntary/donation basis.
- Minimizing time-to-market and allowing for quick MVP's without a lot of server-side datacenter setup work.
- Building blocks

We're lucky to be standing on the shoulders of giants to pull this off.

Here's a list of some key, free and open-source technologies that make this possible:

- HolePunch, for establishing direct peer-to-peer connections.
- LNBits, for quickly building reusable payment QR codes using the LNURLp standard.
- Electron, for building standalone applications using open web standards.
- Bitcoin and Lightning, for accepting payments without needing anyone's permission or approval.

# Installation instructions

## All-in-one bundles

The .AppImage and .zip releases are all-in-one bundles that don't require any dependency installation.

- Use the .AppImage if you want an all-in-one portable file that just works when you make it executable and start it.
- Same for the .zip; just extract it where you like and double-click the "peerviewer" file.
- If you use the AppImage or the .zip, you need to create your own shortcut on the desktop or in the start menu, if you want one.

## Debian/Ubuntu

To install the dependencies for the Debian/Ubuntu Linux .deb package, you may need to run or install something like:

`sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0 libsecret-common libnspr4`

And then install the PeerViewer_version_amd64.deb file by double-clicking it or running something like:

`sudo dpkg -i PeerViewer_version_amd64.deb`

## Redhat/Fedora/OpenSuse/CentOS

To install the dependencies for the Redhat/Fedora/OpenSuse/CentOS .rpm package, you may need to run something like (untested):

`sudo yum install at-spi2-core gtk3 libnotify libuuid nss xdg-utils`

And then install the PeerViewer_version_amd64.rpm file by double-clicking it or running something like:

`sudo rpm -i PeerViewer_version_amd64.deb`

## Snap package

The .snap package is untested as of yet but it should just work. If you're into snap, try it out and give some feedback!

# Development

## Install dependencies

To install the dependencies from package.json using the specific version from package-lock.json, run:

`npm install`

## Download and extract TigerVNC

Before starting the app, first make sure you have downloaded and extracted the TigerVNC software:

`./vnc-software/download_tigervnc.sh`

## Start the app

To start the PeerViewer standalone Electron app, do:

`npm run # which runs the "start" script from package.json`

You can enable Chrome Developer Tools by setting "devTools: true" in src/main.js and then pressing CTRL-SHIFT-i in the app.

## Build a release

To build a release, have a look at the interactive script:

`./release.sh`

## Run as webapp

To run it as a webapp on http://localhost:8000/, do:
 
`./serve_dev_website.sh`

Note that the VNC client and server binaries don't work in the webapp, and neither does the HolePunch DHT.

To get this working in a webbrowser as a webapp, it should be possible to integrate https://novnc.com/ as the VNC Client and use the HolePunch DHT websocket relay for connections.
For the server-side, it might be possible to build a browser-based VNC server using https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/

