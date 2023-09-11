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
export RENEWDATA_MODE="hackin_device"
export PYTHONUNBUFFERED=1

DATE=$(date +"%Y-%m-%d-%H-%M"-%S)

echo "Updating submodules..." >> fehupdate-$DATE.log 2>&1
git submodule update --remote >> fehupdate-$DATE.log 2>&1;

echo -e "\n        - Other..." >> fehupdate-$DATE.log 2>&1
python3 hackin-other.py >> fehupdate-$DATE.log 2>&1
echo -e "\n        - Languages..." >> fehupdate-$DATE.log 2>&1
python3 hackin-languages.py >> fehupdate-$DATE.log 2>&1
echo -e "\n        - Skills..." >> fehupdate-$DATE.log 2>&1
python3 skills.py >> fehupdate-$DATE.log 2>&1
echo -e "\n        - Heroes..." >> fehupdate-$DATE.log 2>&1
python3 hackin-units.py >> fehupdate-$DATE.log 2>&1

echo -e "\n        - Copying outputs to destination..." >> fehupdate-$DATE.log 2>&1
mv *languages*.json ../data/languages/;
mv *units.json *skills.json *other.json ../data/content/;
echo -e "\n        - Compressing outputs..." >> fehupdate-$DATE.log 2>&1
gzip -fk ../data/languages/*json;
gzip -fk ../data/content/*json;

echo -e "\nExtracting missing assets from device..." >> fehupdate-$DATE.log 2>&1
python3 hackin-assets.py >> fehupdate-$DATE.log 2>&1

echo -e "\nBeautifying json outputs..." >> fehupdate-$DATE.log 2>&1
python3 hackin-indenter.py >> fehupdate-$DATE.log 2>&1
