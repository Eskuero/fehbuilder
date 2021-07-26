import json
import utils
import os

# We store all the data in a single dict
heroes = {}

# Parameters to send the API whe requesting the whole list of heroes name-tag relation (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Units&fields=_pageName=Name,TagID&limit=max&format=json)
params = dict(
	action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
	tables = 'Units',
	fields = '_pageName=Name,TagID'
)
engrishname = {
	entry["TagID"]: entry["Name"]
	for entry in [entry["title"] for entry in utils.retrieveapidata(params)]
}

# Get all the files that contain unit definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Enemy/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Enemy/" + file, "r") as datasource:
		data = json.load(datasource)
		# EID_無し is skeleton data for a enemy so we ignore it. We also ignore the normal bosses
		for entry in [entry for entry in data if entry["id_tag"] != "EID_無し" and not entry["is_boss"]]:
			print(entry["id_tag"])
			# If the hero is properly defined on the wiki table get the true name and art
			if entry["id_tag"] in engrishname:
				# Full name of the generic unit
				arturl = utils.obtaintrueurl([engrishname[entry["id_tag"]] + "_BtlFace.png"])[0]
			# If the hero is not properly defined we default all art to zeroes (we still will get get within the builder with the fallback missigno)
			else:
				arturl = False

			heroes[entry["id_tag"]] = {
				# The base stats values stored for each hero are so at 3 star rarity (it's safe to bump them by 1 each)
				"stats": [value+1 for value in entry["base_stats"].values()],
				"growths": [value for value in entry["growth_rates"].values()],
				"WeaponType": entry["weapon_type"],
				"moveType": entry["move_type"],
				"maxflowers": 15,
				"art": {"Portrait": arturl, "Attack": False, "Special": False, "Damage": False},
				"resplendentart": {"Portrait": False, "Attack": False, "Special": False, "Damage": False},
				# Obtain the base kit skipping empty entries (it's provided as a list of list for each rarity unlock but we just need one)
				"basekit": []
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

# Get all the files that contain unit definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Person/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
		data = json.load(datasource)
		# PID_無し is skeleton data for a hero so we ignore it
		for entry in [entry for entry in data if entry["id_tag"] != "PID_無し"]:
			print(entry["id_tag"])
			# If the hero is properly defined on the wiki table get the true name and art
			if entry["id_tag"] in engrishname:
				# This redefinition exists exclusive because of bikini Tharja quotation marks, what a joke
				truename = engrishname[entry["id_tag"]].replace("&quot;", '"')
				# Request a list of all the art for this hero in one go
				availableart = utils.obtaintrueurl([
					truename + ("_BtlFace.png" if ":" not in truename else "_Face.webp"),
					truename + ("_BtlFace.png" if ":" not in truename else "_BtlFace.webp"),
					truename + ("_BtlFace.png" if ":" not in truename else "_BtlFace_C.webp"),
					truename + ("_BtlFace.png" if ":" not in truename else "_BtlFace_D.webp"),
					truename + "_Resplendent_Face.webp",
					truename + "_Resplendent_BtlFace.webp",
					truename + "_Resplendent_BtlFace_C.webp",
					truename + "_Resplendent_BtlFace_D.webp"
				])
			# If the hero is not properly defined we default all art to zeroes (we still will get get within the builder with the fallback missigno)
			else:
				availableart = [False, False, False, False, False, False, False, False]

			heroes[entry["id_tag"]] = {
				# The base stats values stored for each hero are so at 3 star rarity (it's safe to bump them by 1 each)
				"stats": [value+1 for value in entry["base_stats"].values()],
				"growths": [value for value in entry["growth_rates"].values()],
				"WeaponType": entry["weapon_type"],
				"moveType": entry["move_type"],
				"maxflowers": entry["dragonflowers"]["max_count"],
				"art": {
					"Portrait": availableart[0],
					"Attack": availableart[1],
					"Special": availableart[2],
					"Damage": availableart[3],
				},
				"resplendentart": {
					"Portrait": availableart[4],
					"Attack": availableart[5],
					"Special": availableart[6],
					"Damage": availableart[7],
				},
				# Obtain the base kit skipping empty entries (it's provided as a list of list for each rarity unlock but we just need one)
				"basekit": [skill for category in entry["skills"] for skill in category if skill]
			}
			# Complete the basekit by adding the skills that have weapon evolutions available
			for item in [item for item in heroes[entry["id_tag"]]["basekit"] if item in weaponevolutions]:
				heroes[entry["id_tag"]]["basekit"].append(weaponevolutions[item])

# Store all the data for internal usage
with open("fullunits.json", "w") as outfile:
    json.dump(heroes, outfile)
    
# Smaller version for browser usage
heroeslite = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["WeaponType", "moveType", "basekit", "maxflowers"]
	}
	for heroname, properties in heroes.items()
}
with open("liteunits.json", "w") as outfile:
    json.dump(heroeslite, outfile)
