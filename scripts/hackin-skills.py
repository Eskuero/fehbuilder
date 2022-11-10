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

import json
import os

# Load all heroes data from the json file
with open("../data/content/fullskills.json", "r") as datasource:
	skills = json.load(datasource)

# Get all the manually defined hero jsons
files = os.listdir("hackin/skills/")
for file in files:
	with open("hackin/skills/" + file, "r") as datasource:
		dataskills = json.load(datasource)
	# Update or add to non nested entries
	nonnested = ["weapons","assists","specials"]
	for category in nonnested:
		for skill in dataskills[category]:
			skills[category][skill] = dataskills[category][skill]
	# Update or add to nested entries
	nested = ["A","B","C","S"]
	for category in nested:
		for skill in dataskills["passives"][category]:
			skills["passives"][category][skill] = dataskills["passives"][category][skill]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Store all the data for internal usage of scripts
with open("fullskills.json", "w") as outfile:
	json.dump(skills, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in online unit builder (includes everything except icon indicator)
skillsonline = {
	"weapons": {
		weaponname: {
			property: value
			for property, value in properties.items()
		}
		for weaponname, properties in skills["weapons"].items()
    },
	"passives": {
		passivecategory: {
			passive: {
				property: value
				for property, value in properties.items() if property not in ["iconid"]
			}
			for passive, properties in skills["passives"][passivecategory].items()
		}
		for passivecategory in ["A", "B", "C", "S"]
    },
	"assists": skills["assists"],
	"specials": skills["specials"]
}
# FIXME: Can't we just ignore iconids from within the dict comprehession?
for weapon in skillsonline["weapons"]:
	if "Effect" in skillsonline["weapons"][weapon]["refines"]:
		skillsonline["weapons"][weapon]["refines"]["Effect"].pop("iconid")
with open("onlineskills.json", "w") as outfile:
	json.dump(skillsonline, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in custom unit builder (we use everything except exclusive and icon indicator)
skillscustom = {
	"weapons": {
		weaponname: {
			property: value
			for property, value in properties.items() if property not in ["prf"]
		} 
		for weaponname, properties in skills["weapons"].items()
    },
	"assists": skills["assists"],
	"specials": skills["specials"],
	"passives": {
		passivecategory: {
			passive: {
				property: value
				for property, value in properties.items() if property not in ["prf", "iconid"]
			} 
			for passive, properties in skills["passives"][passivecategory].items()
		}
		for passivecategory in ["A", "B", "C", "S"]
    }
}
with open("customskills.json", "w") as outfile:
	json.dump(skillscustom, outfile)
