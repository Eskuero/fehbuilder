#!/bin/sh
date=$(date +"%Y-%m-%d-%H-%M"-%S)

echo -e "---------------------------------------------------------" >> fehupdate-$date.log 2>&1
echo "Updating FeH datamined dumps..." >> fehupdate-$date.log 2>&1
currenthead=$(git -C feh-assets-json/ rev-parse HEAD);
git submodule update --remote >> fehupdate-$date.log 2>&1

# Check if something was updated
newcurrenthead=$(git -C feh-assets-json/ rev-parse HEAD);
if [[ "$currenthead" == "$newcurrenthead" ]]; then
    echo -e "\n        - Datamined dumps were not updated." >> fehupdate-$date.log 2>&1
	echo -e "\n---------------------------------------------------------" >> fehupdate-$date.log 2>&1
else
    echo -e "\n        - Datamined dumps have been updated." >> fehupdate-$date.log 2>&1
	echo -e "\n---------------------------------------------------------" >> fehupdate-$date.log 2>&1
	echo "Parsing and preparing all necessary data:" >> fehupdate-$date.log 2>&1
	echo -e "\n        - Other..." >> fehupdate-$date.log 2>&1
	PYTHONUNBUFFERED=1 python3 other.py >> fehupdate-$date.log 2>&1
	echo -e "\n        - Languages..." >> fehupdate-$date.log 2>&1
	PYTHONUNBUFFERED=1 python3 languages.py >> fehupdate-$date.log 2>&1
	echo -e "\n        - Skills..." >> fehupdate-$date.log 2>&1
	PYTHONUNBUFFERED=1 python3 skills.py >> fehupdate-$date.log 2>&1
	echo -e "\n        - Heroes..." >> fehupdate-$date.log 2>&1
	PYTHONUNBUFFERED=1 python3 units.py >> fehupdate-$date.log 2>&1
	echo -e "\n        - Summoning pools..." >> fehupdate-$date.log 2>&1
	PYTHONUNBUFFERED=1 python3 summoning.py >> fehupdate-$date.log 2>&1
	echo -e "\n        - Copying outputs to destination..." >> fehupdate-$date.log 2>&1
	mv *skills.json *other.json *pools.json *units.json ../data/content/;
	mv *languages*.json ../data/languages/;
	echo -e "\n        - Compressing outputs..." >> fehupdate-$date.log 2>&1
	gzip -fk ../data/content/*json;
	gzip -fk ../data/languages/*json;
	echo -e "\n---------------------------------------------------------" >> fehupdate-$date.log 2>&1
fi

echo -e "Downloading missing assets from wiki..." >> fehupdate-$date.log 2>&1
PYTHONUNBUFFERED=1 python3 downloadassets.py >> fehupdate-$date.log 2>&1
