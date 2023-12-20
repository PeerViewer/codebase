#!/bin/sh

echo "1) make sure devtools are disabled in src/main.js"
read yes

echo "2) make sure you've incremented the version number in package.json"
read yes

echo "3) Running: electron-forge package"
./node_modules/.bin/electron-forge package

echo "4) Running electron-builder -l appimage zip deb snap rpm"
export DEBUG=electron-builder
./node_modules/.bin/electron-builder -l appimage zip deb snap rpm

