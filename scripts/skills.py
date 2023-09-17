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

MODE = os.environ["RENEWDATA_MODE"] if "RENEWDATA_MODE" in os.environ else False
# Detect what update mode we are using
if MODE == "hertz_wiki":
	SKILLS_BASEDIR = "feh-assets-json/files/assets/Common/SRPG/Skill/"
	SEALS_BASEDIR = "feh-assets-json/files/assets/Common/SRPG/SkillAccessory/"
elif MODE == "hackin_device":
	SKILLS_BASEDIR = "hackin/skills/"
	SEALS_BASEDIR = "hackin/sacredseals/"
else:
	print("Invalid RENEWDATA_MODE enviroment variable, must be hertz_wiki or hackin_device")
	sys.exit(1)

# We store all the data in a single dict
skills = {
	"weapons": {},
	"passives": {
		"A": {},
		"B": {},
		"C": {},
		"S": {}
	},
	"assists": {},
	"specials": {}
}
categories = [skills["weapons"], skills["assists"], skills["specials"], skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"]]
refines = {}
allskills = {}

# Get all the files that contain skill definitions and loop through them
files = os.listdir(SKILLS_BASEDIR)
for file in files:
	with open(SKILLS_BASEDIR + file, "r") as datasource:
		data = json.load(datasource)
		# SID_無し is skeleton data for a skill so we ignore
		for entry in [entry for entry in data if entry["id_tag"] != "SID_無し"]:
			# Do a clean copy in allskills first for later checks
			allskills[entry["id_tag"]] = entry
			# Store all the data except if it's a refine
			if not entry["refine_base"] and entry["category"] in range(0, 7):
				categories[entry["category"]][entry["id_tag"]] = {
					"weapon": entry["wep_equip"],
					"move": entry["mov_equip"]
				}
				# Indicate exclusive preferred weapons
				if entry["exclusive"]:
					categories[entry["category"]][entry["id_tag"]]["prf"] = True
				# Always default to max false for seals since we modify the info later when filling the data
				if not entry["next_skill"] and not entry["passive_next"] and entry["category"] != 6:
					categories[entry["category"]][entry["id_tag"]]["max"] = True
				# Specials and Assists do not provide visible stats
				if entry["category"] not in [1,2]:
					categories[entry["category"]][entry["id_tag"]]["stats"] = [value for value in entry["stats"].values()]
				# For weapons add the might as part of the statsmodifiers for Atk, emtpy refines definition and indication of being arcane
				if entry["category"] == 0:
					skills["weapons"][entry["id_tag"]]["stats"][1] += entry["might"]
					skills["weapons"][entry["id_tag"]]["refines"] = {}
					if entry["arcane_weapon"]:
						skills["weapons"][entry["id_tag"]]["arcane"] = True
				# For passives add the iconid at the top level
				elif entry["category"] in range(3, 7):
					categories[entry["category"]][entry["id_tag"]]["iconid"] = entry["icon_id"]

			# For refines we just store them separetely for later processing
			elif entry["refine_base"]:
				refines[entry["id_tag"]] = {
					"baseWeapon": entry["refine_base"],
					"stats": [value for value in entry["stats"].values()],
				}
				refines[entry["id_tag"]]["stats"][1] += entry["might"]
				# If there's a refine ID this means is an special effect refine and we might need effectids
				if entry["refine_id"] not in [None, "SID_神罰の杖3", "SID_幻惑の杖3"]:
					refines[entry["id_tag"]]["effectid"] = entry["refine_id"]
					refines[entry["id_tag"]]["iconid"] = entry["icon_id"]

refinenames = {"神": "Wrathful", "幻": "Dazzling", "ATK": "Atk", "AGI": "Spd", "DEF": "Def", "RES": "Res"}
# For each refine defined update the original weapon info
for refinable in refines:
	# The last part of the refine ID is the one that indicates the type
	refine = refinable.split("_")[-1]
	refine = refinenames[refine] if refine in refinenames else "Effect"
	# Always add the stats modifiers for the particular refine
	skills["weapons"][refines[refinable]["baseWeapon"]]["refines"][refine] = {
		"stats": refines[refinable]["stats"]
	}
	# For Effect refines we have skill references
	if refine == "Effect":
		basestats = skills["weapons"][refines[refinable]["baseWeapon"]]["refines"][refine]["stats"]
		# If the refine had an effectid we must append stats to the base refine from the reference
		if refines[refinable]["effectid"]:
			effectstats = [value for value in allskills[refines[refinable]["effectid"]]["stats"].values()]
			basestats = [basestats[0] + effectstats [0], basestats[1] + effectstats [1], basestats[2] + effectstats [2], basestats[3] + effectstats [3], basestats[4] + effectstats [4]]
		skills["weapons"][refines[refinable]["baseWeapon"]]["refines"][refine].update({
			"stats": basestats,
			"iconid": refines[refinable]["iconid"]
		})

# Complete seals data by getting which skills are available to buy and copying their counterparts data (except for the max setting, which depends on if it's the last seal of it's line)
files = os.listdir(SEALS_BASEDIR)
for file in files:
	with open(SEALS_BASEDIR + file, "r") as datasource:
		data = json.load(datasource)
		# Retrieve all normal skill data to get info because we don't know the category of the skill
		allpassives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"]
		# SID_無し is skeleton data for a skill so we ignore
		for entry in [entry for entry in data if entry["id_tag"] != "SID_無し"]:
			skills["passives"]["S"][entry["id_tag"]] = allpassives[entry["id_tag"]]
			skills["passives"]["S"][entry["id_tag"]]["max"] = True if not entry["next_seal"] else False

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Store all the data for internal usage of scripts
with open("fullskills.json", "w") as outfile:
	json.dump(skills, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version barebones for bandwith friendly initialization
skillsskeleton = {
	"weapons": {
		weaponname: {}
		for weaponname in skills["weapons"].keys()
    },
	"assists": {
		assist: {}
		for assist in skills["assists"].keys()
    },
	"specials": {
		special: {}
		for special in skills["specials"].keys()
    },
	"passives": {
		passivecategory: {
			passive: {}
			for passive in skills["passives"][passivecategory].keys()
		}
		for passivecategory in ["A", "B", "C", "S"]
    }
}
with open("skeletonskills.json", "w") as outfile:
	json.dump(skillsskeleton, outfile)

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
