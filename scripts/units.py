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
import sys
import os
import datetime

MODE = os.environ["RENEWDATA_MODE"] if "RENEWDATA_MODE" in os.environ else False
# Detect what update mode we are using
if MODE == "hertz_wiki":
	EVOLUTIONS_BASEDIR = "feh-assets-json/files/assets/Common/SRPG/WeaponRefine/"
	HEROES_BASEDIR = "feh-assets-json/files/assets/Common/SRPG/Person/"
	ENEMIES_BASEDIR = "feh-assets-json/files/assets/Common/SRPG/Enemy/"
elif MODE == "hackin_device":
	EVOLUTIONS_BASEDIR = "hackin/weaponevolutions/"
	HEROES_BASEDIR = "hackin/heroes/"
	ENEMIES_BASEDIR = "hackin/enemy/"
else:
	print("Invalid RENEWDATA_MODE enviroment variable, must be hertz_wiki or hackin_device")
	sys.exit(1)

# We store all the data in a single dict
heroes = {}

# Load all weapon data from the json file
with open("fullskills.json", "r") as datasource:
	weapons = json.load(datasource)["weapons"]
weaponevolutions = {}
# Get all the files that contain weapon evolution definitions and loop through them
files = os.listdir(EVOLUTIONS_BASEDIR)
for file in files:
	with open(EVOLUTIONS_BASEDIR + file, "r") as datasource:
		data = json.load(datasource)
		# Skip any weapon evolution not in the weapons to avoid adding normal refines
		for entry in [entry for entry in data if entry["refined"] in weapons]:
			weaponevolutions[entry["orig"]] = entry["refined"]

# Load all language data from the json file
with open("fulllanguages.json", "r") as datasource:
	strings = json.load(datasource)["USEN"]

# Store all face_name indications to know if we get duplicated enemy units
facenames = []

# Get all the files that contain unit definitions and loop through them
files = os.listdir(HEROES_BASEDIR)
for file in files:
	with open(HEROES_BASEDIR + file, "r") as datasource:
		data = json.load(datasource)
		# PID_無し is skeleton data for a hero so we ignore it
		for entry in [entry for entry in data if entry["id_tag"] != "PID_無し"]:

			heroes[entry["id_tag"]] = {
				# The base stats values stored for each hero are so at 5 star rarity (it's safe to reduce them all by 2 to match 1* star rarity)
				"stats": [value-2 for value in entry["base_stats"].values()],
				"growths": [value for value in entry["growth_rates"].values()],
				"weapon": entry["weapon_type"],
				"origin": entry["series"],
				"move": entry["move_type"],
				"flowers": entry["dragonflowers"]["max_count"],
				# Obtain the base kit skipping empty entries (it's provided as a list of list for each rarity unlock but we just need one)
				"basekit": [skill for category in entry["skills"] for skill in category if skill],
				"resplendent": True if entry["id_tag"].replace("PID", "MPID_VOICE") + "EX01" in strings else False,
				"id": entry["id_num"],
				"art": entry["face_name"]
			}
			facenames.append(entry["face_name"])
			# Clean basekit of duplicates
			tempkit = []
			[tempkit.append(skill) for skill in heroes[entry["id_tag"]]["basekit"] if skill not in tempkit]
			heroes[entry["id_tag"]]["basekit"] = tempkit
			# Complete the basekit by adding the skills that have weapon evolutions available
			for item in [item for item in heroes[entry["id_tag"]]["basekit"] if item in weaponevolutions]:
				heroes[entry["id_tag"]]["basekit"].append(weaponevolutions[item])

# Get all the files that contain enemy definitions and loop through them
files = os.listdir(ENEMIES_BASEDIR)
for file in files:
	with open(ENEMIES_BASEDIR + file, "r") as datasource:
		data = json.load(datasource)
		# EID_無し is skeleton data for a enemy so we ignore it.
		for entry in [entry for entry in data if entry["id_tag"] != "EID_無し"]:
			# We skip boss units only if they have a matching already existing hero for her valid face name
			if entry["is_boss"] and entry["face_name"] in facenames or not entry["face_name"]:
				continue
			heroes[entry["id_tag"]] = {
				# The base stats values stored for each hero are so at 5 star rarity (it's safe to reduce them all by 2 to match 1* star rarity)
				"stats": [value-2 for value in entry["base_stats"].values()],
				"growths": [value for value in entry["growth_rates"].values()],
				"weapon": entry["weapon_type"],
				"move": entry["move_type"],
				# For boss enemy units the basekit might contain a single weapon, otherwise empty
				"basekit": [entry["top_weapon"]] if entry["is_boss"] else [],
				"art": entry["face_name"],
				"boss": entry["is_boss"]
			}

# Sort all heroes by ID so they have a nicer appearance in tierlist make
heroessorted = sorted(heroes.items(), key = lambda x: x[1].get('id',-1))
heroes = {}
for hero in heroessorted:
	heroes.update({hero[0]: hero[1]})

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Store all the data for internal usage of scripts
with open("fullunits.json", "w") as outfile:
	json.dump(heroes, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version barebones for bandwith friendly initialization
heroesskeleton = {
	heroname: {}
	for heroname in heroes.keys()
}
with open("skeletonunits.json", "w") as outfile:
	json.dump(heroesskeleton, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in online unit builder (doesn't need origin, resplendent indicator or id)
heroesonline = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon", "move", "stats", "growths", "basekit", "flowers"]
	}
	for heroname, properties in heroes.items()
}
with open("onlineunits.json", "w") as outfile:
	json.dump(heroesonline, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in custom unit builder (Only needs types, stats and growths)
heroescustom = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon", "move", "stats", "growths"]
	}
	for heroname, properties in heroes.items()
}
with open("customunits.json", "w") as outfile:
	json.dump(heroescustom, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in summoning simulator (Only needs weapon type to detect color)
heroessummon = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon"]
	}
	for heroname, properties in heroes.items() if "EID" not in heroname
}
with open("summonunits.json", "w") as outfile:
	json.dump(heroessummon, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in crd and tierlist builders (Needs types, origin, resplendent and id)
heroestier = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon", "move", "origin", "resplendent", "id"]
	}
	for heroname, properties in heroes.items() if "EID" not in heroname
}
with open("tierunits.json", "w") as outfile:
	json.dump(heroestier, outfile)
