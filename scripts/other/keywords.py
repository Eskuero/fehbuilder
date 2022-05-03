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

import os
import json

keywords = {}

# Obtain all translations into english to get the defined names
with open("../../data/languages/fulllanguages.json", "r") as datasource:
	translations = json.load(datasource)

# Big dictionary to store all translations (we're ignoring Spanish (US) and English (EU) as they are probably 99% identical to save same bandwidth)
languages = ["EUDE", "EUES", "EUFR", "EUIT", "JPJA", "TWZH", "USEN", "USPT"]

# Get all the files that contain unit definitions and loop through them
files = os.listdir("../feh-assets-json/files/assets/Common/SRPG/Person/")
for file in files:
	with open("../feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
		data = json.load(datasource)
		for entry in [entry for entry in data if entry["id_tag"] != "PID_無し"]:
			keywords[entry["id_tag"]] = {
				language: translations[language]["M" + entry["id_tag"]] + ": " + translations[language][entry["id_tag"].replace("PID", "MPID_HONOR")]
				for language in languages
			}


with open("keywords.json", "w") as outfile:
    json.dump(keywords, outfile, indent='\t')
