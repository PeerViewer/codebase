#!/bin/sh

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
# Don't include Windows VNC binaries on Linux
rm -rf vnc-software/uvnc-windows
if [ ! -d "vnc-software/tigervnc-linux-x86_64" ]; then
        echo "vnc-software/tigervnc-linux-x86_64 not found, running vnc-software/download_generic.sh"
        ./vnc-software/download_generic.sh "tigervnc-latest-stable.tar.gz" "tigervnc-linux-x86_64" "https://netix.dl.sourceforge.net/project/tigervnc/stable/1.13.1/tigervnc-1.13.1.x86_64.tar.gz" "d643316760fb34cb610b843b8af75e19f16eae34acf8e55cae088c4f7adf083f" "tigervnc.conf" "tigervnc-linux-x86_64/usr/bin/plain.bin"
	downloadresult=$?
	if [ $downloadresult -ne 0 ]; then
		echo "Download of VNC client returned error: $downloadresult"
		exit 1
	fi
fi


# If you run it in dev mode first with:
# npm run start
# Then the app tries to connect to localhost:3000 instead of packaging the actual files when building with:
#./node_modules/.bin/electron-builder

# Therefore, first make sure the correct files are packaged with electron-forge:
echo "4) Packaging with: electron-forge package -p linux -a x64"
./node_modules/.bin/electron-forge package -p linux -a x64

# NOTE: Don't use prepackage because the electron-builder will not add the tigervnc/ folder:
#./node_modules/.bin/electron-builder --prepackaged  out/peerviewer-linux-x64/ -l appimage
echo "5) Building release binaries with: electron-builder --linux appimage deb snap rpm tar.gz"
export DEBUG=electron-builder
./node_modules/.bin/electron-builder --linux appimage deb snap rpm tar.gz

