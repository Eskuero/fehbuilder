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
					# Always default to isMax false for seals since we modify the info later when filling the data
					"isMax": True if not entry["next_skill"] and entry["category"] != 6 else False
				}
				# For weapons add the might as part of the statsmodifiers for Atk and emtpy refines definition
				if entry["category"] == 0:
					skills["weapons"][entry["id_tag"]]["statModifiers"][1] += entry["might"]
					skills["weapons"][entry["id_tag"]]["refines"] = {}
				if entry["category"] in [3, 4, 5, 6]:
					# Check if the skill is in the list reported by the wiki to obtain the true URL for the icon if so
					categories[entry["category"]][entry["id_tag"]]["icon"] = engrishname["M" + entry["id_tag"]] + ".png"

			# For refines we just store them separetely for later processing
			elif entry["refine_base"]:
				refines[entry["id_tag"]] = {
					"baseWeapon": entry["refine_base"],
					"statModifiers": [value for value in entry["stats"].values()],
				}
				refines[entry["id_tag"]]["statModifiers"][1] += entry["might"]
				# If there's a refine ID this means is an special effect refine and we might need custom icons and effectids
				if entry["refine_id"] not in [None, "SID_神罰の杖3", "SID_幻惑の杖3"]:
					refines[entry["id_tag"]]["effectid"] = entry["refine_id"]
					refines[entry["id_tag"]]["icon"] = engrishname["M" + entry["refine_base"]] + "_W.png"

# Loop through every category individually and obtain icons
categories = [skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"], refines]
# We must loop through ordered dictionaries to be able to obtain
for category in categories:
	sortedcategory = [entry for entry in sorted(category) if category[entry].get("icon", False)]
	# We can only query 50 items every time
	offset = 0
	while offset < len(sortedcategory):
		icons = []
		for entry in sortedcategory[offset:offset+50]:
			icons.append(category[entry]["icon"])
		# Save all urls in their respective positions
		for i, url in enumerate(utils.obtaintrueurl(icons)):
			# If url failed to generate by using the expected filename try grabbing it from the cargo table whenever available
			if not url and sortedcategory[offset:offset+50][i] in passiveicons:
				url = utils.obtaintrueurl([passiveicons[sortedcategory[offset:offset+50][i]]])[0]
			category[sortedcategory[offset:offset+50][i]]["icon"] = url
		offset += 50

refinenames = {"神": "Wrathful", "幻": "Dazzling", "ATK": "Atk", "AGI": "Spd", "DEF": "Def", "RES": "Res"}
# For each refine defined update the original weapon info
for refinable in refines:
	# The last part of the refine ID is the one that indicates the type
	refine = refinable.split("_")[-1]
	refine = refinenames[refine] if refine in refinenames else "Effect"
	# Always add the stats modifiers for the particular refine
	skills["weapons"][refines[refinable]["baseWeapon"]]["refines"][refine] = {
		"statModifiers": refines[refinable]["statModifiers"]
	}
	# For Effect refines we have icons and skill references
	if refine == "Effect":
		skills["weapons"][refines[refinable]["baseWeapon"]]["refines"][refine].update({
			"effectid": refines[refinable]["effectid"],
			"icon": refines[refinable]["icon"]
		})

# Complete seals data by getting which skills are available to buy and copying their counterparts data (except for the isMax setting, which depends on if it's the last seal of it's line)
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/SkillAccessory/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/SkillAccessory/" + file, "r") as datasource:
		data = json.load(datasource)
		# Retrieve all normal skill data to get info because we don't know the category of the skill
		allpassives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"]
		# SID_無し is skeleton data for a skill so we ignore
		for entry in [entry for entry in data if entry["id_tag"] != "SID_無し"]:
			skills["passives"]["S"][entry["id_tag"]] = allpassives[entry["id_tag"]]
			skills["passives"]["S"][entry["id_tag"]]["isMax"] = True if not entry["next_seal"] else False

# Store all the data for internal usage
with open("fullskills.json", "w") as outfile:
    json.dump(skills, outfile)

# Smaller version for browser usage
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
