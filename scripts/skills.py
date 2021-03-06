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

# Get all the files that contain skill definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Skill/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Skill/" + file, "r") as datasource:
		data = json.load(datasource)
		# SID_็กใ is skeleton data for a skill so we ignore
		for entry in [entry for entry in data if entry["id_tag"] != "SID_็กใ"]:
			# Store all the data except if it's a refine
			if not entry["refine_base"] and entry["category"] in range(0, 7):
				categories[entry["category"]][entry["id_tag"]] = {
					"WeaponType": entry["wep_equip"],
					"moveType": entry["mov_equip"],
					"statModifiers": [value for value in entry["stats"].values()],
					"exclusive": entry["exclusive"],
					# Always default to isMax false for seals since we modify the info later when filling the data
					"isMax": True if not entry["next_skill"] and not entry["passive_next"] and entry["category"] != 6 else False
				}
				# For weapons add the might as part of the statsmodifiers for Atk and emtpy refines definition
				if entry["category"] == 0:
					skills["weapons"][entry["id_tag"]]["statModifiers"][1] += entry["might"]
					skills["weapons"][entry["id_tag"]]["refines"] = {}

			# For refines we just store them separetely for later processing
			elif entry["refine_base"]:
				refines[entry["id_tag"]] = {
					"baseWeapon": entry["refine_base"],
					"statModifiers": [value for value in entry["stats"].values()],
				}
				refines[entry["id_tag"]]["statModifiers"][1] += entry["might"]
				# If there's a refine ID this means is an special effect refine and we might need effectids
				if entry["refine_id"] not in [None, "SID_็ฅ็ฝฐใฎๆ3", "SID_ๅนปๆใฎๆ3"]:
					refines[entry["id_tag"]]["effectid"] = entry["refine_id"]

refinenames = {"็ฅ": "Wrathful", "ๅนป": "Dazzling", "ATK": "Atk", "AGI": "Spd", "DEF": "Def", "RES": "Res"}
# For each refine defined update the original weapon info
for refinable in refines:
	# The last part of the refine ID is the one that indicates the type
	refine = refinable.split("_")[-1]
	refine = refinenames[refine] if refine in refinenames else "Effect"
	# Always add the stats modifiers for the particular refine
	skills["weapons"][refines[refinable]["baseWeapon"]]["refines"][refine] = {
		"statModifiers": refines[refinable]["statModifiers"]
	}
	# For Effect refines we have skill references
	if refine == "Effect":
		skills["weapons"][refines[refinable]["baseWeapon"]]["refines"][refine].update({
			"effectid": refines[refinable]["effectid"]
		})

# Complete seals data by getting which skills are available to buy and copying their counterparts data (except for the isMax setting, which depends on if it's the last seal of it's line)
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/SkillAccessory/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/SkillAccessory/" + file, "r") as datasource:
		data = json.load(datasource)
		# Retrieve all normal skill data to get info because we don't know the category of the skill
		allpassives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"]
		# SID_็กใ is skeleton data for a skill so we ignore
		for entry in [entry for entry in data if entry["id_tag"] != "SID_็กใ"]:
			skills["passives"]["S"][entry["id_tag"]] = allpassives[entry["id_tag"]]
			skills["passives"]["S"][entry["id_tag"]]["isMax"] = True if not entry["next_seal"] else False

# Store all the data for internal usage
with open("fullskills.json", "w") as outfile:
	json.dump(skills, outfile)

# Smaller version for offline wiki builder
skillslite = {
	"weapons": {
		weaponname: {
			property: [item for item in value] if property == "refines" else value
			for property, value in properties.items() if property in ["WeaponType", "moveType", "exclusive", "isMax", "refines"]
		} 
		for weaponname, properties in skills["weapons"].items()
    },
	"assists": skills["assists"],
	"specials": skills["specials"],
	"passives": {
		passivecategory: {
			passive: {
				property: value
				for property, value in properties.items() if property in ["WeaponType", "moveType", "exclusive", "isMax"]
			} 
			for passive, properties in skills["passives"][passivecategory].items()
		}
		for passivecategory in ["A", "B", "C", "S"]
    }
}
with open("liteskills.json", "w") as outfile:
	json.dump(skillslite, outfile)

# Altenative version for custom unit builder
skillscustom = {
	"weapons": {
		weaponname: {
			property: value
			for property, value in properties.items() if property in ["WeaponType", "moveType", "statModifiers", "isMax", "refines"]
		} 
		for weaponname, properties in skills["weapons"].items()
    },
	"assists": skills["assists"],
	"specials": skills["specials"],
	"passives": {
		passivecategory: {
			passive: {
				property: value
				for property, value in properties.items() if property in ["WeaponType", "moveType", "statModifiers", "isMax"]
			} 
			for passive, properties in skills["passives"][passivecategory].items()
		}
		for passivecategory in ["A", "B", "C", "S"]
    }
}
with open("customskills.json", "w") as outfile:
	json.dump(skillscustom, outfile)
