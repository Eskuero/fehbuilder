#!/bin/sh
date=$(date +"%Y-%m-%d-%H-%M-%S")

# Force a clean data renew but without syncing. TODO: Hopefully hackin scripts should source everything on their own later.
sh renewdata.sh --force --hackin;

echo -e "\nNow adding manually defined data" >> fehupdate-$date.log 2>&1


PYTHONUNBUFFERED=1 python3 hackin-languages.py >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 hackin-units.py >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 hackin-skills.py >> fehupdate-$date.log 2>&1

echo -e "\n        - Copying outputs to destination..." >> fehupdate-$date.log 2>&1
mv *languages*.json ../data/languages/;
mv *units.json *skills.json ../data/content/;
echo -e "\n        - Compressing outputs..." >> fehupdate-$date.log 2>&1
gzip -fk ../data/languages/*json;
gzip -fk ../data/content/*json;

echo -e "\nExtracting missing assets from device..." >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 hackin-assets.py >> fehupdate-$date.log 2>&1
