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

def work():
	# All data
	other = {
		"blessed": {},
		"duo": [],
		"resonant": [],
		"duokeywords": duokeywords,
		"images": images
	}

	# Get all the files that contain unit definitions and loop through them
	files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Person/")
	for file in files:
		with open("feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
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
				# If the unit doesn't have element but is of kind 2 or 3 is a duo hero
				elif entry["legendary"]["kind"] in [2, 3]:
					other["duo" if entry["legendary"]["kind"] == 2 else "resonant"].append(entry["id_tag"])

	with open("fullother.json", "w") as outfile:
		json.dump(other, outfile)

	# Smaller version for offline wiki builder
	otherlite = {
		"blessed": {
			hero: {
				property: value
				for property, value in properties.items() if property in ["blessing", "variant"]
			}
			for hero, properties in other["blessed"].items()
		},
		"duokeywords": duokeywords
	}
	with open("liteother.json", "w") as outfile:
		json.dump(otherlite, outfile)

	# Even smaller version for summoning
	othersummon = {
		"duokeywords": duokeywords
	}
	with open("summonother.json", "w") as outfile:
		json.dump(othersummon, outfile)

	# Altenative version for custom unit builder
	othercustom = {
		"blessed": other["blessed"],
		"duo": other["duo"],
		"resonant": other["resonant"],
		"images": images
	}
	with open("customother.json", "w") as outfile:
		json.dump(othercustom, outfile)

	# Altenative version for ar-d map builder
	othermaps = {
		"blessed": {
			hero: {
				property: value
				for property, value in properties.items() if property in ["blessing", "variant"]
			}
			for hero, properties in other["blessed"].items()
		},
		"maps": maps,
		"duokeywords": duokeywords
	}
	with open("mapsother.json", "w") as outfile:
		json.dump(othermaps, outfile)

	# Altenative version for tier list generator
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
		"seasonals": seasonals
	}
	with open("tierother.json", "w") as outfile:
		json.dump(othertier, outfile)

# Load all the hardcoded data from the external file
with open("hardcoded.json", "r") as datasource:
	hardcoded = json.load(datasource)

# Seasonal groups
seasonals = hardcoded["seasonals"]
# We tie each PID with the names of the pairs for duo heroes
duokeywords = hardcoded["duokeywords"]
# All commonly used images
images = hardcoded["images"]
# Maps data
maps = hardcoded["maps"]

work()
