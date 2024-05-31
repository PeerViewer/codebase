# PeerViewer codebase

PeerViewer is a remote desktop and support solution, completely free for unlimited personal and commercial use.

Under the hood, it uses direct (peer-to-peer) connections between the participants.

This was recently made possible by the advanced holepunching techniques, made by the HolePunch company.

![Screenshot of PeerViewer v1.2.0](https://peerviewer.org/images/v1.2.0_connect_1350x677.png)

# Why peer-to-peer?

Traditionally, when you use network apps such as TeamViewer, place audio and video calls or share files, your data is going through intermediate servers which are expensive to host, can harm your privacy, increase latency and consume additional bandwidth.

Peer-to-peer solutions such as PeerViewer have the advantage of:

- Being the highest bandwidth AND lowest latency way of establishing a network connection.
- Ensuring maximum privacy for all participants.
- Being low cost, making it possible to survive on a pay-what-you-can/voluntary/donation basis.
- Minimizing time-to-market and allowing for quick MVP's without a lot of server-side datacenter setup work.

**Building blocks**

We're lucky to be standing on the shoulders of giants to pull this off.

Here's a list of some key, free and open-source technologies that make this possible:

- HolePunch, for establishing direct peer-to-peer connections.
- LNBits, for quickly building reusable payment QR codes using the LNURLp standard.
- Electron, for building standalone applications using open web standards.
- Bitcoin and Lightning, for accepting payments without needing anyone's permission or approval.

# Installation instructions

See INSTALL.md

# Development

Tested with node v16.17.1 and npm v8.15.0 but should work with more recent versions too.

## Install dependencies

To install the dependencies from package.json using the specific version from package-lock.json, run:

`npm install`

## Download and extract TigerVNC

Before starting the app, first make sure you have downloaded and extracted the VNC software.

On Linux:

`./vnc-software/download_tigervnc.sh`

On Windows (using Bash for Windows, see below):

`./vnc-software/download_uvnc.sh`

## Start the app

To start the PeerViewer standalone Electron app, do:

`npm start # which runs the "start" script from package.json`

You can enable Chrome Developer Tools by setting "devTools: true" in src/main.js and then pressing CTRL-SHIFT-i in the app.

## Build a release

To build a release, have a look at the interactive scripts:

`./build_release_linux.sh # only tested on a Linux machine`

`./build_release_windows.sh # needs to be done on a Windows machine, more info in the script itself`

## Run as webapp

To run it as a webapp on http://localhost:8000/, do:
 
`./serve_dev_website.sh`

Note that the VNC client and server binaries don't work in the webapp, and neither does the HolePunch DHT.

To get this working in a webbrowser as a webapp, it should be possible to integrate https://novnc.com/ as the VNC Client and use the HolePunch DHT websocket relay for connections.
For the server-side, it might be possible to build a browser-based VNC server using https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/

## Windows

Development can also be done on Windows, and it's also required to build releases for Windows.

Just install node and npm, for example using https://github.com/nodists/nodist/releases

And it's also recommended to install Git For Windows to have Bash and many more handy commandline tools that are used by the .sh scripts in this project.

