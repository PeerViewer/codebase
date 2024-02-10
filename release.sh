#!/bin/sh

echo "0) make sure all changes are committed"
diff=$(git diff | wc -l)
if [ $diff -gt 0 ]; then
	echo "You have diff"
	exit 1
fi

echo "1) make sure devtools are set to false in src/main.js"
read yes

echo "2) make sure you've incremented the version number in package.json"
read yes

echo "3) Cleaning up old build..."
rm -rf .webpack/
rm -rf dist/

# If you run it in dev mode first with:
# npm run start
# Then the app tries to connect to localhost:3000 instead of packaging the actual files when building with:
#./node_modules/.bin/electron-builder

# Therefore, first make sure the correct files are packaged with electron-forge:
echo "4) Running: electron-forge package"
./node_modules/.bin/electron-forge package

# NOTE: Don't use prepackage because the electron-builder will not add the tigervnc/ folder:
#./node_modules/.bin/electron-builder --prepackaged  out/peerviewer-linux-x64/ -l appimage
echo "5) Running electron-builder --linux appimage zip deb snap rpm"
export DEBUG=electron-builder
./node_modules/.bin/electron-builder --linux appimage zip deb snap rpm 

echo "6) Running electron-builder --win"
# This requires wine32, see https://www.electron.build/multi-platform-build so something like:
# dpkg --add-architecture i386 && apt-get update && apt-get install wine32
./node_modules/.bin/electron-builder --win
