#!/bin/sh

# Force a clean data renew but without syncing. TODO: Hopefully hackin scripts should source everything on their own later.
sh renewdata.sh --force --hackin;

python3 hackin-languages.py;
python3 hackin-units.py;
python3 hackin-skills.py;

echo -e "\n        - Copying outputs to destination..."
mv *languages*.json ../data/languages/;
mv *units.json *skills.json ../data/content/;
echo -e "\n        - Compressing outputs..."
gzip -fk ../data/languages/*json;
gzip -fk ../data/content/*json;

echo -e "Extracting missing assets from device..."
python3 hackin-assets.py;
