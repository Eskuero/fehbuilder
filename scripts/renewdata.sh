#!/bin/sh

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

# Enviroment variables for python scripts
export RENEWDATA_MODE="hertz_wiki"
export PYTHONUNBUFFERED=1

DATE=$(date +"%Y-%m-%d-%H-%M"-%S)

if [[ "$2" != "--hackin" ]]; then
	echo -e "---------------------------------------------------------" >> fehupdate-$DATE.log 2>&1
	echo "Updating FeH datamined dumps..." >> fehupdate-$DATE.log 2>&1
	currenthead=$(git -C feh-assets-json/ rev-parse HEAD);
	git submodule update --remote >> fehupdate-$DATE.log 2>&1;

	# Check if something was updated
	newcurrenthead=$(git -C feh-assets-json/ rev-parse HEAD);
fi

if [[ "$currenthead" == "$newcurrenthead" ]] && [[ "$1" != "--force" ]]; then
    echo -e "\n        - Datamined dumps were not updated." >> fehupdate-$DATE.log 2>&1
	echo -e "\n---------------------------------------------------------" >> fehupdate-$DATE.log 2>&1
else
    echo -e "\n        - Datamined dumps have been updated." >> fehupdate-$DATE.log 2>&1
	echo -e "\n---------------------------------------------------------" >> fehupdate-$DATE.log 2>&1
	echo "Parsing and preparing all necessary data:" >> fehupdate-$DATE.log 2>&1
	echo -e "\n        - Other..." >> fehupdate-$DATE.log 2>&1
	python3 other.py >> fehupdate-$DATE.log 2>&1
	echo -e "\n        - Languages..." >> fehupdate-$DATE.log 2>&1
	python3 languages.py >> fehupdate-$DATE.log 2>&1
	echo -e "\n        - Skills..." >> fehupdate-$DATE.log 2>&1
	python3 skills.py >> fehupdate-$DATE.log 2>&1
	echo -e "\n        - Heroes..." >> fehupdate-$DATE.log 2>&1
	python3 units.py >> fehupdate-$DATE.log 2>&1
	# FIXME: UGH
	echo -e "\n        - Summoning pools..." >> fehupdate-$DATE.log 2>&1
	python3 summoning.py >> fehupdate-$DATE.log 2>&1
	echo -e "\n        - Copying outputs to destination..." >> fehupdate-$DATE.log 2>&1
	mv *skills.json *other.json *pools.json *units.json ../data/content/;
	mv *languages*.json ../data/languages/;
	echo -e "\n        - Compressing outputs..." >> fehupdate-$DATE.log 2>&1
	gzip -fk ../data/content/*json;
	gzip -fk ../data/languages/*json;
	echo -e "\n---------------------------------------------------------" >> fehupdate-$DATE.log 2>&1
fi

if [[ "$2" != "--hackin" ]]; then
	echo -e "Downloading missing assets from wiki..." >> fehupdate-$DATE.log 2>&1
	python3 renewdata-assets.py >> fehupdate-$DATE.log 2>&1
fi
