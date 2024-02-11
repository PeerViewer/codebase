#!/bin/sh

echo "Run this with Administrator privileges because the last step needs it."
sleep 3

echo "0) make sure all changes are committed"
diff=$(git diff | wc -l)
if [ $diff -gt 0 ]; then
	echo "You have diff"
	exit 1
fi

echo "1) make sure devtools are set to false in src/main.js"
read yes

echo "2) make sure you've incremented the version number in package.json AND package-lock.json"
read yes

echo "3) Cleaning up old build..."
rm -rf .webpack
rm -rf dist
rm -rf out
# dont include linux binaries in Windows build
rm -rf vnc-software/tigervnc-linux-x86_64
if [ ! -d "vnc-software/uvnc-windows" ]; then
	echo "vnc-software/uvnc-windows not found, running vnc-software/download_uvnc.sh"
	./vnc-software/download_uvnc.sh
fi

# first make sure the correct files are packaged with electron-forge:
echo "4) Packaging with: electron-forge package"
./node_modules/.bin/electron-forge package -p win32 -a x64

echo "5) Building release binaries with: electron-builder --win nsis portable msi zip"
# NOTE: Building for Windows on Linux doesn't seem to work, see:
# https://github.com/electron/electron/issues/1075
# https://github.com/electron-userland/electron-builder/issues/844
# https://github.com/electron-userland/electron-builder/issues/5254
#
# Building for Windows on Linux also requires wine32, see https://www.electron.build/multi-platform-build so something like:
# dpkg --add-architecture i386 && apt-get update && apt-get install wine32
# And then:
#./node_modules/.bin/electron-builder --win nsis portable msi zip

# Execute on a Windows machine (as Administrator, otherwise symlink permission errors):
export DEBUG=electron-builder
node_modules\\.bin\\electron-builder --win nsis portable msi zip



