#!/bin/sh
date=$(date +"%Y-%m-%d-%H-%M")

echo "Updating FeH dumps... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
git submodule update -f >> fehupdate-$date.log 2>&1
echo -e "\nDownload runtime backend images... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 downloadimages.py >> fehupdate-$date.log 2>&1
echo -e "\nParsing all skills... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 skills.py >> fehupdate-$date.log 2>&1
echo -e "\nParsing all heroes... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 units.py >> fehupdate-$date.log 2>&1
echo -e "\nParsing other data... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 other.py >> fehupdate-$date.log 2>&1
echo -e "\nRetrieving needed strings... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 languages.py >> fehupdate-$date.log 2>&1
echo -e "\nCopying outputs to their final destination... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
mv full*.json ../data/;
mv lite*.json ../static/;