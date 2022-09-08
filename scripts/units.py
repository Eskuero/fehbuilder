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
import datetime

# We store all the data in a single dict
heroes = {}

# Get all the files that contain unit definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Enemy/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Enemy/" + file, "r") as datasource:
		data = json.load(datasource)
		# EID_無し is skeleton data for a enemy so we ignore it. We also ignore the normal bosses
		for entry in [entry for entry in data if entry["id_tag"] != "EID_無し" and not entry["is_boss"]]:

			heroes[entry["id_tag"]] = {
				# The base stats values stored for each hero are so at 3 star rarity (it's safe to reduce them all by 1 to match 1* star rarity)
				"stats": [value-1 for value in entry["base_stats"].values()],
				"growths": [value for value in entry["growth_rates"].values()],
				"WeaponType": entry["weapon_type"],
				"moveType": entry["move_type"],
				"maxflowers": 15,
				# Obtain the base kit skipping empty entries (it's provided as a list of list for each rarity unlock but we just need one)
				"basekit": [],
				"art": entry["face_name"]
			}

# Load all weapon data from the json file
with open("fullskills.json", "r") as datasource:
	weapons = json.load(datasource)["weapons"]
weaponevolutions = {}
# Get all the files that contain weapon evolution definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/WeaponRefine/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/WeaponRefine/" + file, "r") as datasource:
		data = json.load(datasource)
		# Skip any weapon evolution not in the weapons to avoid adding normal refines
		for entry in [entry for entry in data if entry["refined"] in weapons]:
			weaponevolutions[entry["orig"]] = entry["refined"]

# Load all language data from the json file
with open("fulllanguages.json", "r") as datasource:
	strings = json.load(datasource)["USEN"]

# Get all the files that contain unit definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Person/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
		data = json.load(datasource)
		# PID_無し is skeleton data for a hero so we ignore it
		for entry in [entry for entry in data if entry["id_tag"] != "PID_無し"]:

			heroes[entry["id_tag"]] = {
				# The base stats values stored for each hero are so at 3 star rarity (it's safe to reduce them all by 1 to match 1* star rarity)
				"stats": [value-1 for value in entry["base_stats"].values()],
				"growths": [value for value in entry["growth_rates"].values()],
				"WeaponType": entry["weapon_type"],
				"origin": entry["series"],
				"moveType": entry["move_type"],
				"maxflowers": entry["dragonflowers"]["max_count"],
				# Obtain the base kit skipping empty entries (it's provided as a list of list for each rarity unlock but we just need one)
				"basekit": [skill for category in entry["skills"] for skill in category if skill],
				"resplendent": True if entry["id_tag"].replace("PID", "MPID_VOICE") + "EX01" in strings else False,
				"id": entry["id_num"],
				"art": entry["face_name"]
			}
			# Clean basekit of duplicates
			tempkit = []
			[tempkit.append(skill) for skill in heroes[entry["id_tag"]]["basekit"] if skill not in tempkit]
			heroes[entry["id_tag"]]["basekit"] = tempkit
			# Complete the basekit by adding the skills that have weapon evolutions available
			for item in [item for item in heroes[entry["id_tag"]]["basekit"] if item in weaponevolutions]:
				heroes[entry["id_tag"]]["basekit"].append(weaponevolutions[item])

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Store all the data for internal usage of scripts
with open("fullunits.json", "w") as outfile:
	json.dump(heroes, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in online unit builder (doesn't need origin, resplendent indicator or id)
heroesonline = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["WeaponType", "moveType", "stats", "growths", "basekit", "maxflowers"]
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
		for property, value in properties.items() if property in ["WeaponType", "moveType", "stats", "growths"]
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
		for property, value in properties.items() if property in ["WeaponType"]
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
		for property, value in properties.items() if property in ["WeaponType", "moveType", "origin", "resplendent", "id"]
	}
	for heroname, properties in heroes.items() if "EID" not in heroname
}
with open("tierunits.json", "w") as outfile:
	json.dump(heroestier, outfile)

