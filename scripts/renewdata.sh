#!/bin/sh
date=$(date +"%Y-%m-%d-%H-%M")

echo "Updating FeH dumps... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
git submodule update --remote >> fehupdate-$date.log 2>&1
echo -e "\nParsing other data... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 other.py >> fehupdate-$date.log 2>&1
echo -e "\nRetrieving needed strings... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 languages.py >> fehupdate-$date.log 2>&1
echo -e "\nParsing all skills... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 skills.py >> fehupdate-$date.log 2>&1
echo -e "\nParsing all heroes... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 units.py >> fehupdate-$date.log 2>&1
echo -e "\nObtaining summoning pools info... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 summoning.py >> fehupdate-$date.log 2>&1
echo -e "\nCopying outputs to their final destination... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
mv *skills.json *other.json *pools.json *units.json ../data/content/;
mv *languages*.json ../data/languages/;
echo -e "\nCompressing outputs in their final destination... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
gzip -fk ../data/content/*json;
gzip -fk ../data/languages/*json;

echo -e "\nDownloading missing assets... ($(date +"%Y-%m-%d-%H-%M-%S"))" >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 downloadassets.py >> fehupdate-$date.log 2>&1
