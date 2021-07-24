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

# TODO: This should be possible to check within the actual entry parsin. Parameters to send the API whe requesting the whole list of shiny skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=TagID&where=Scategory+in+(%22passivea%22,%20%22passivec%22)+and+SP=300+and+exclusive=0+and+Name+not+like+%27%253%27+and+Name+not+like+%27%25Counter%27+and+Name+not+like+%27%25Foil%27+and+Name+not+like+%27%25Ward%27&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Skills',
    fields = "TagID",
    where = "Scategory in ('passivea','passivec') and SP=300 and exclusive=0 and Name not like '%3' and Name not like '%Counter' and Name not like '%Foil' and Name not like '%Ward'"
)
# This is the list of skills who have shiny borders (This is any skill for A or C category that isn't exclusive, costs 300 SP and doesn't end on 3, Counter, Foil or Ward (for now lol))
shinyskills = [skill['TagID'] for skill in [entry["title"] for entry in utils.retrieveapidata(params)]]

# Obtain the whole list of icons for the passives (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=TagID,Icon&where=Scategory+in+(%27passivea%27,%27passiveb%27,%27passivec%27,%27sacredseal%27)&limit=max&offset=0&format=json)
params = dict(
	action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
	tables = 'Skills',
	fields = "TagID,Icon",
	where = "Scategory in ('passivea', 'passiveb', 'passivec', 'sacredseal')"
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
					if entry["id_tag"] in passiveicons:
						categories[entry["category"]][entry["id_tag"]]["icon"] = utils.obtaintrueurl([passiveicons[entry["id_tag"]]])[0]
					# Check if the skill is the list of shiny ones to properly render the icon
					categories[entry["category"]][entry["id_tag"]]["shiny"] = True if entry["id_tag"] in shinyskills else False,
			# For refines we just store additional data
			elif entry["refine_base"]:
				refines[entry["id_tag"]] = {"upgrades": True, "baseWeapon": entry["refine_base"]}
				# If there's a refine ID this means is an special effect refine and we need additional stat modifiers
				if entry["refine_id"]:
					refines[entry["id_tag"]]["effectrefine"] = True
					refines[entry["id_tag"]]["specialstatModifiers"] = [value for value in entry["stats"].values()]
					refines[entry["id_tag"]]["specialstatModifiers"][1] += entry["might"]

# Obtain the whole list of icons for the special refines icons (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=TagID,Icon&where=RefinePath+in+('skill1','skill2')&limit=max&offset=0&format=json)
params = dict(
	action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
	tables = 'Skills',
	fields = "TagID,Icon",
	where = "RefinePath in ('skill1', 'skill2')"
)
# For any refined icon that has a matching refine in our list update the refines dictionary (if there's a error on the wiki's tagID we might not get it and have to handle it gracesfully on the runtime)
for skill in [entry["title"] for entry in utils.retrieveapidata(params)]:
	if skill["TagID"] in refines:
		refines[skill["TagID"]]["specialIcon"] = utils.obtaintrueurl([skill["Icon"]])[0]

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
with open("../data/skills.json", "w") as outfile:
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
with open("../static/skills.json", "w") as outfile:
    json.dump(skillslite, outfile)
