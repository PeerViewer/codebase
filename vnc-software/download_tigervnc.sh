#!/bin/sh

# Execute with containing directory as current working directory
mydir=$(readlink -f "$0")
mydir=$(dirname "$mydir")
cd "$mydir"

# Download link obtained from https://sourceforge.net/projects/tigervnc/
outfile=tigervnc-latest-stable.tar.gz

wget https://netix.dl.sourceforge.net/project/tigervnc/stable/1.13.1/tigervnc-1.13.1.x86_64.tar.gz -O "$outfile" && \
tar xf "$outfile" && \
rm -rf tigervnc-linux-x86_64 && \
mv tigervnc-1.13.1.x86_64 tigervnc-linux-x86_64 && \
rm "$outfile"

# Password generated with: echo -n "nopassword" | ./vnc-software/tigervnc-linux-x86_64/usr/bin/vncpasswd -f | hexdump -C # 00000000  33 11 7e 54 aa 0d 4d 3b           |3.~T..M;|
# Use /bin/echo and not /bin/sh's built-in echo because it doesn't support -e
/bin/echo -ne "\x33\x11\x7e\x54\xaa\x0d\x4d\x3b" > tigervnc-linux-x86_64/usr/bin/plain.bin

# Go back to original directory
cd -
