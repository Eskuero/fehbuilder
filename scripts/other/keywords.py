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

# Get unit definitions for all heroes
with open("../../data/content/fullunits.json", "r") as datasource:
	heroes = json.load(datasource)

for hero in heroes:
	# Skip enemy units
	if "EID" in hero:
		continue
	keywords[hero] = {}
	for language in languages:
		try:
			keywords[hero][language] = translations[language]["M" + hero] + ": " + translations[language][hero.replace("PID", "MPID_HONOR")]
		except KeyError:
			print(f"Failed to get translation for hero {hero} at language {language}")

with open("keywords.json", "w") as outfile:
    json.dump(keywords, outfile, indent='\t')
