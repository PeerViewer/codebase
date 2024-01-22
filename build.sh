#!/bin/sh


# If you run it in dev mode first with:
# npm run start
# Then the app tries to connect to localhost:3000 instead of packaging the actual files when building with:
#./node_modules/.bin/electron-builder

# Therefore, first make sure the correct files are packaged with electron-forge like:
./node_modules/.bin/electron-forge package

export DEBUG=electron-builder
./node_modules/.bin/electron-builder -l appimage

# build more:
#./node_modules/.bin/electron-builder -l appimage zip deb snap rpm

# NOTE: Don't use prepackage because the electron-builder will not add the tigervnc/ folder:
#./node_modules/.bin/electron-builder --prepackaged  out/peerviewer-linux-x64/ -l appimage

