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

# Go back to original directory
cd -
