import json
import utils
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

# Obtain the whole list of names for the passives to be able to retrieve the icon urls
with open("fulllanguages.json", "r") as datasource:
	engrishname = json.load(datasource)["USEN"]

# Obtain the whole list of icons for the passives in case we hit an old skill/passive that doesn't follow expected rules (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=TagID,Icon&where=Scategory+in+(%27passivea%27,%27passiveb%27,%27passivec%27,%27sacredseal%27)+OR+RefinePath=%27skill1%27&limit=max&offset=0&format=json)
params = dict(
	action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
	tables = 'Skills',
	fields = "TagID,Icon",
	where = "Scategory in ('passivea', 'passiveb', 'passivec', 'sacredseal') OR RefinePath = 'skill1'"
)
# Store a relation of TagID to Icon for each skill
passiveicons = {
	entry["TagID"]: entry["Icon"]
	for entry in [entry["title"] for entry in utils.retrieveapidata(params)]
}

# Get all the files that contain skill definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Skill/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Skill/" + file, "r") as datasource:
		data = json.load(datasource)
		# SID_無し is skeleton data for a skill so we ignore
		for entry in [entry for entry in data if entry["id_tag"] != "SID_無し"]:
			print(entry["id_tag"])
			# Store all the data except if it's a refine
			if not entry["refine_base"] and entry["category"] in range(0, 7):
				categories[entry["category"]][entry["id_tag"]] = {
					"WeaponType": entry["wep_equip"],
					"moveType": entry["mov_equip"],
					"statModifiers": [value for value in entry["stats"].values()],
					"exclusive": entry["exclusive"],
					"isMax": True if not entry["next_skill"] else False
				}
				# For weapons add the might as part of the statsmodifiers for Atk
				if entry["category"] == 0:
					skills["weapons"][entry["id_tag"]]["statModifiers"][1] += entry["might"]
				if entry["category"] in [3, 4, 5, 6]:
					# Check if the skill is in the list reported by the wiki to obtain the true URL for the icon if so
					categories[entry["category"]][entry["id_tag"]]["icon"] = utils.obtaintrueurl([engrishname["M" + entry["id_tag"]] + ".png"])[0]
					# If we failed to obtain the icon using their name + _W this might be and old uploaded file that uses a manually set name so we still rely on using cargotables
					if not categories[entry["category"]][entry["id_tag"]]["icon"] and entry["id_tag"] in passiveicons:
						categories[entry["category"]][entry["id_tag"]]["icon"] = utils.obtaintrueurl([passiveicons[entry["id_tag"]]])[0]

			# For refines we just store additional data
			elif entry["refine_base"]:
				refines[entry["id_tag"]] = {"upgrades": True, "baseWeapon": entry["refine_base"]}
				# If there's a refine ID this means is an special effect refine and we might need additional stat modifiers (except if the refine is wrathful or dazzling because we already manually have those available)
				if entry["refine_id"] not in [None, "SID_神罰の杖3", "SID_幻惑の杖3"]:
					refines[entry["id_tag"]]["effectrefine"] = True
					refines[entry["id_tag"]]["effectid"] = entry["refine_id"]
					refines[entry["id_tag"]]["specialIcon"] = utils.obtaintrueurl([engrishname["M" + entry["refine_base"]] + "_W.png"])[0]
					# If we failed to obtain the icon using their name + _W this might be and old uploaded file that uses a manually set name so we still rely on using cargotables
					if not refines[entry["id_tag"]]["specialIcon"] and entry["id_tag"] in passiveicons:
						refines[entry["id_tag"]]["specialIcon"] = utils.obtaintrueurl([passiveicons[entry["id_tag"]]])[0]

# For each refine defined update the original weapon info
for refinable in refines:
	skills["weapons"][refines[refinable]["baseWeapon"]].update(refines[refinable])

# Complete seals data by obtaining which skills ara available to buy and then copy their counterparts data (except for the isMax setting, which depends on if it's the last sela of it's line)
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/SkillAccessory/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/SkillAccessory/" + file, "r") as datasource:
		data = json.load(datasource)
		# Retrieve all normal skill data to get info because we don't know the category of the skill
		allpassives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"]
		for entry in data:
			# If the skill is available as a sacred seal we complete their data too
			if entry["id_tag"] in allpassives:
				skills["passives"]["S"][entry["id_tag"]] = allpassives[entry["id_tag"]]
				skills["passives"]["S"][entry["id_tag"]]["isMax"] = True if not entry["next_seal"] else False

# Store all the data for internal usage
with open("fullskills.json", "w") as outfile:
    json.dump(skills, outfile)

# Smaller version for browser usage
skillslite = {
	"weapons": {
		weaponname: {
			property: value
			for property, value in properties.items() if property in ["effectrefine", "upgrades", "WeaponType", "moveType", "exclusive", "isMax"]
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
