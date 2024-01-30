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
import sys
import json

MODE = os.environ["RENEWDATA_MODE"] if "RENEWDATA_MODE" in os.environ else False
# Detect what update mode we are using
if MODE == "hertz_wiki":
	HEROES_BASEDIR = "feh-assets-json/files/assets/Common/SRPG/Person/"
elif MODE == "hackin_device":
	HEROES_BASEDIR = "hackin/heroes/"
else:
	print("Invalid RENEWDATA_MODE enviroment variable, must be hertz_wiki or hackin_device")
	sys.exit(1)

# Load all the hardcoded data from the external file
with open("hardcoded.json", "r") as datasource:
	hardcoded = json.load(datasource)

# All data
other = {
	"blessed": {},
	"duo": [],
	"resonant": [],
	"ascended": [],
	"rearmed" : [],
	"attuned" : [],
	"emblem" : [],
	"duokeywords": hardcoded["duokeywords"],
	"images": hardcoded["images"],
	"seasonals": hardcoded["seasonals"],
	"maps": hardcoded["maps"],
	"structures": hardcoded["structures"]
}

# Get all the files that contain unit definitions and loop through them
files = os.listdir(HEROES_BASEDIR)
for file in files:
	with open(HEROES_BASEDIR + file, "r") as datasource:
		data = json.load(datasource)
		# Only use the entries where the legendary field is not null
		for entry in [entry for entry in data if entry["legendary"]]:
			if entry["legendary"]["element"] > 0:
				other["blessed"][entry["id_tag"]] = {
					"blessing": entry["legendary"]["element"],
					"boosts": [value for value in entry["legendary"]["bonus_effect"].values()],
					# First just add the stats bonuses
					"variant": "-".join([stat for stat, value in entry["legendary"]["bonus_effect"].items() if value > 0 and stat != "hp"])
				}
				# Now add the pair-up mechanic with a separator if we are giving stats other than HP
				if entry["legendary"]["pair_up"]:
					other["blessed"][entry["id_tag"]]["variant"] += "-pairup" if other["blessed"][entry["id_tag"]]["variant"] else "pairup"
				# Extra slots in AR always give out stats
				if entry["legendary"]["ae_extra"]:
					other["blessed"][entry["id_tag"]]["variant"] += "-extrae"
			# If the unit doesn't have element but is of kind 2, 3, 4, 5, 6 is a rare special type we remember separately
			elif entry["legendary"]["kind"] in [2, 3, 4, 5, 6, 7]:
				specialtype = [None, None, "duo", "resonant", "ascended", "rearmed", "attuned", "emblem"][entry["legendary"]["kind"]]
				other[specialtype].append(entry["id_tag"])

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Store all the data for internal usage of scripts
with open("fullother.json", "w") as outfile:
	json.dump(other, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in online unit builder
otheronline = {
	"blessed": other["blessed"],
	"duo": other["duo"],
	"ascended": other["ascended"],
	"rearmed": other["rearmed"],
	"attuned": other["attuned"],
	"emblem": other["emblem"],
	"resonant": other["resonant"],
	"duokeywords": hardcoded["duokeywords"],
	"images": hardcoded["images"]
}
with open("onlineother.json", "w") as outfile:
	json.dump(otheronline, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in custom unit builder
othercustom = {
	"blessed": other["blessed"],
	"duokeywords": hardcoded["duokeywords"],
	"images": hardcoded["images"]
}
with open("customother.json", "w") as outfile:
	json.dump(othercustom, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in summoning (we only need the duokeywords)
othersummon = {
	"duokeywords": hardcoded["duokeywords"]
}
with open("summonother.json", "w") as outfile:
	json.dump(othersummon, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in ard builders (structures, maps and preblessed)
othermaps = {
	"blessed": {
		hero: {
			property: value
			for property, value in properties.items() if property in ["blessing", "variant"]
		}
		for hero, properties in other["blessed"].items()
	},
	"maps": hardcoded["maps"],
	"structures": hardcoded["structures"],
	"duokeywords": hardcoded["duokeywords"]
}
with open("mapsother.json", "w") as outfile:
	json.dump(othermaps, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in tier list maker (groups, preblessed and other filters)
othertier = {
	"blessed": {
		hero: {
			property: value
			for property, value in properties.items() if property in ["blessing"]
		}
		for hero, properties in other["blessed"].items()
	},
	"duo": other["duo"],
	"resonant": other["resonant"],
	"ascended": other["ascended"],
	"rearmed": other["rearmed"],
	"attuned": other["attuned"],
	"emblem": other["emblem"],
	"seasonals": hardcoded["seasonals"]
}
with open("tierother.json", "w") as outfile:
	json.dump(othertier, outfile)
