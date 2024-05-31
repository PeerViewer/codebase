#!/bin/sh

echo "0) make sure all changes are committed"
diff=$(git diff | wc -l)
if [ $diff -gt 0 ]; then
	echo "You have diff"
	#exit 1
fi

echo "1) make sure devtools are set to false in src/main.js"
if grep "devTools: true" src/main.js; then
	echo "devTools: true found in src/main.js"
	exit 2
fi

echo "2) make sure you've incremented the version number in package.json AND package-lock.json"
read yes

echo "3) Cleaning up old build..."
rm -rf .webpack
rm -rf dist
rm -rf out
# Don't include Windows and Linux binaries on MacOS
rm -rf vnc-software/uvnc-windows
rm -rf vnc-software/tigervnc-linux-x86_64
if [ ! -d "vnc-software/tigervnc-macos-x86_64" ]; then
        echo "vnc-software/tigervnc-macos-x86_64 not found, running vnc-software/download_generic.sh"
        ./vnc-software/download_generic.sh "tigervnc-latest-stable.dmg" "tigervnc-macos-x86_64" "https://altushost-swe.dl.sourceforge.net/project/tigervnc/stable/1.13.1/TigerVNC-1.13.1.dmg" "d823197320e6903458f9039cb9d4dbf5d739ef7f9c18ccabfb68bc3fffe57b9d" "tigervnc.conf" "tigervnc-macos-x86_64/Contents/MacOS/plain.bin"
	downloadresult=$?
	if [ $downloadresult -ne 0 ]; then
		echo "Download of VNC client returned error: $downloadresult"
		exit 1
	fi
fi

if [ ! -d "macVNC.app" ]; then
	echo "macVNC.app not found, downloading it from https://github.com/LibVNC/macVNC and building it..."
	brew install libvncserver cmake
	brewresult=$?
	if [ $? -ne 0 ]; then
		echo "brew install libvncserver cmake failed with error: $brewresult"
		echo "Make sure you have homebrew installed, see brew.sh"
		exit 3
	fi
	cd vnc-software/
	rm -rf build_macVNC
	mkdir build_macVNC/
	cd build_macVNC/
	curl -L "https://github.com/LibVNC/macVNC/archive/59c58931ed5853f344a500b1674405e85d1e70ea.zip" > macVNC.zip
	unzip macVNC.zip
	cd macVNC-*
	mkdir build
	cd build
	cmake ..
	cmake --build .
	if [ ! -d "macVNC.app" ]; then
		echo "ERROR: building macVNC did not result in macVNC.app - something went wrong..."
		exit 4
	fi
	mv macVNC.app ../../..
	cd ../../..
	rm -rf build_macVNC
	cd ..
fi


# If you run it in dev mode first with:
# npm run start
# Then the app tries to connect to localhost:3000 instead of packaging the actual files when building with:
#./node_modules/.bin/electron-builder

# Therefore, first make sure the correct files are packaged with electron-forge:
echo "4) Packaging with: electron-forge package -p macos -a x64"
./node_modules/.bin/electron-forge package -p darwin

# NOTE: Don't use prepackage because the electron-builder will not add the tigervnc/ folder:
#./node_modules/.bin/electron-builder --prepackaged  out/peerviewer-linux-x64/ -l appimage
echo "5) Building release binaries with: electron-builder --linux appimage deb snap rpm tar.gz"
export DEBUG=electron-builder
./node_modules/.bin/electron-builder --macos dmg

