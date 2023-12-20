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

echo "4) Running: electron-forge package"
./node_modules/.bin/electron-forge package

echo "5) Running electron-builder -l appimage zip deb snap rpm"
export DEBUG=electron-builder
./node_modules/.bin/electron-builder -l appimage zip deb snap rpm

