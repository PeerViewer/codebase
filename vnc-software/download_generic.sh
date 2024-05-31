#!/bin/sh -x
# This script needs: readlink, dirname, curl, shasum, unzip, tar
# On windows: unzip
# On linux: tar
# On macos: hdiutil

outfile="$1"
outdir="$2"
downloadlink="$3"
shasum="$4"
configfilesrc="$5"
configfiledst="$6"

if [ $# -ne 6 ]; then
	echo "Usage: $0 outfile outdir downloadlink sha256sum configfilesrc configfiledst"
	exit 1
fi

# Execute with containing directory as current working directory
mydir=$(readlink -f "$0")
mydir=$(dirname "$mydir")
cd "$mydir"


curl -L "$downloadlink" > "$outfile"
result=$?

if [ $result -eq 0 ]; then
	echo "Download successful, checking checksum and extracting..."
	# make sure outdir is gone so it will be replaced entierly
	rm -rf "$outdir"

	echo "$shasum  $outfile" | shasum -a 256 -c -
	sharesult=$?
	if [ "$sharesult" -eq 0 ]; then
		if echo "$outfile" | grep "\.zip"; then
			if unzip -d "$outdir" "$outfile"; then
				echo "SUCCESS!"
			else
				echo "ERROR: unzip failed!"
				exit 3
			fi
		elif echo "$outfile" | grep "\.dmg"; then
			echo "Extracting .dmg file"
			mountpoint=/Volumes/tigervnc-for-peerviewer-build
			hdiutil attach -mountpoint "$mountpoint" "$outfile"
			cp -R "$mountpoint"/TigerVNC*.app tigervnc-macos-x86_64/
			hdiutil detach "$mountpoint"
		else # assume it's a tar
			if tar xf "$outfile"; then
				mv tigervnc-1.13.1.x86_64 tigervnc-linux-x86_64
				echo "SUCCESS!"
			else
				echo "ERROR: tar extract failed!"
				exit 4
			fi
		fi
		configfiledstdir=$(dirname "$configfiledst")
		if [ -f "$configfilesrc" -a -d "$configfiledstdir" ]; then
			# the windows build requires removing \r so the line endings are only \n
			#cat "$configfilesrc" | sed  -e 's/\r*$/\r/' > "$configfiledst"
			#cat "$configfilesrc" | tr -d '\r' > "$configfiledst"
			# Disabled the \r removal because the password file happens to contain a \r
			cp "$configfilesrc" "$configfiledst"
		else
			echo "ERROR: could not write config file because $configfilesrc is not a file or $configfiledstdir is not a directory!"
			exit 5
		fi
	else
		echo "ERROR: sha256sum of $outfile did not match!"
		exit 2
	fi

	# cleanup if download was successful
	rm "$outfile"
else
	echo "ERROR: download of $downloadlink returned exit code: $result"
	cd - # Go back to original directory
	exit 1
fi

	
cd - # Go back to original directory
