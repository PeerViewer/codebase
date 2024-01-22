#!/bin/sh

sources=src

for tocopy in index.css index.html images/ ; do
	cp -R "$sources"/"$tocopy" ../website/
done
