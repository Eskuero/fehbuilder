import requests
import json
import utils

# Falchion
falchiondata = {
	"Falchion (Awakening)": {
		"WeaponType": ["Red Sword"],
		"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
		"statModifiers": [0, 16, 0, 0, 0],
		"specialIcon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9f/Falchion_Awakening_W.png",
		"upgrades": True,
		"exclusive": True
	},
	"Falchion (Gaiden)": {
		"WeaponType": ["Red Sword"],
		"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
		"statModifiers": [0, 16, 0, 0, 0],
		"specialIcon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/dd/Falchion_Gaiden_W.png",
		"upgrades": True,
		"exclusive": True
	},
	"Falchion (Mystery)": {
		"WeaponType": ["Red Sword"],
		"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
		"statModifiers": [0, 16, 0, 0, 0],
		"specialIcon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b0/Falchion_Mystery_W.png",
		"upgrades": True,
		"exclusive": True
	}
}
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

# Parameters to send the API whe requesting the whole list of seals (https://feheroes.fandom.com/api.php?action=cargoquery&tables=SacredSealCosts&fields=Skill&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'SacredSealCosts',
    fields = 'Skill'
)
seals = [seal["Skill"] for seal in [entry["title"] for entry in utils.retrieveapidata(params)]]

# Parameters to send the API whe requesting the whole list of skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=Name,Scategory,StatModifiers,CanUseMove,CanUseWeapon,Exclusive,group_concat(Icon)=Icon,group_concat(RefinePath)=refines&group_by=Name&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Skills',
    fields = 'Name,Scategory,group_concat(Icon)=Icon,StatModifiers,CanUseMove,CanUseWeapon,RefinePath,Exclusive,group_concat(RefinePath)=refines',
    group_by = "Name"
)
# Get skill data every time individually before upon entering the loop
for skill in [entry["title"] for entry in utils.retrieveapidata(params)]:
	print(skill["Name"])
	# Weapon type handling
	if skill["Scategory"] == "weapon":
		# We are hardcoding Falchion so we don't parse it normally
		if skill["Name"] == "Falchion":
			skills["weapons"].update(falchiondata)
			continue
		skills["weapons"][skill["Name"]] = {
			# Split the weapon types by commas to make later checks easier
			"WeaponType": skill["CanUseWeapon"].replace(",  ", ",").split(","),
			"moveType": skill["CanUseMove"].replace(",  ", ",").split(","),
			"statModifiers": [int(x) for x in skill["StatModifiers"].split(",")],
			"specialIcon": False,
			"upgrades": True if skill["refines"] != "" else False,
			"exclusive": True if skill["Exclusive"] == "1" else False
		}
		# If we had upgrades and a skill1 string is on the refine list we have a custom icon and an additional effect
		if skills["weapons"][skill["Name"]]["upgrades"] and "skill1" in skill["refines"]:
			skills["weapons"][skill["Name"]]["specialIcon"] = utils.obtaintrueurl(skill["Icon"].split(",")[0]) if utils.obtaintrueurl(skill["Icon"].split(",")[0]) else "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Icon_Skill_Weapon.png"
	# Assist type handling
	if skill["Scategory"] == "assist":
		# Because assists have no restrictions based on weapon or movement we just store them
		skills["assists"][skill["Name"]] = {
			"WeaponType": skill["CanUseWeapon"].replace(",  ", ",").split(","),
			"exclusive": True if skill["Exclusive"] == "1" else False
		}
	# Special type handling
	if skill["Scategory"] == "special":
		# Because specials have no restrictions based on movement we just store the weapon restrictions
		skills["specials"][skill["Name"]] = {
			"WeaponType": skill["CanUseWeapon"].replace(", ", ",").split(", "),
			"exclusive": True if skill["Exclusive"] == "1" else False
		}
	# Passive type handling
	if skill["Scategory"] in ["passivea", "passiveb", "passivec"]:
		# Get the category in our format (last character capitalized)
		truecategorie = skill["Scategory"][-1].capitalize()
		# Obtain the true url by parsing the html page for it
		skills["passives"][truecategorie][skill["Name"]] = {
			"icon": utils.obtaintrueurl(skill["Icon"]),
			"statModifiers": [0, 0, 0, 0, 0] if skill["StatModifiers"] == "" else [int(x) for x in skill["StatModifiers"].split(",")],
			"WeaponType": skill["CanUseWeapon"].replace(",  ", ",").split(","),
			"moveType": skill["CanUseMove"].replace(",  ", ",").split(","),
			"exclusive": True if skill["Exclusive"] == "1" else False
		}
	# Seals type handling
	if skill["Scategory"] == "sacredseal":
		# Obtain the true url by parsing the html page for it
		skills["passives"]["S"][skill["Name"]] = {
			"icon": utils.obtaintrueurl(skill["Icon"]),
			"statModifiers": [0, 0, 0, 0, 0] if skill["StatModifiers"] == "" else [int(x) for x in skill["StatModifiers"].split(",")],
			"WeaponType": skill["CanUseWeapon"].replace(",  ", ",").split(","),
			"moveType": skill["CanUseMove"].replace(",  ", ",").split(","),
			"exclusive": True if skill["Exclusive"] == "1" else False
		}

# Complete the seals data
for seal in seals:
	# Get the data for each categorie
	passives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"]
	if seal in passives:
		skills["passives"]["S"][seal] = passives[seal]
# Make sure they end properly ordered
skills["passives"]["S"] = {seal: skills["passives"]["S"][seal] for seal in sorted(skills["passives"]["S"])}

# Store all the data for internal usage
with open("../data/skills.json", "w") as outfile:
    json.dump(skills, outfile)

# Smaller version for browser usage
skillslite = {
	"weapons": {
		weaponname: {
			property: value
			for property, value in properties.items() if property in ["specialIcon", "upgrades", "WeaponType", "moveType", "exclusive"]
		} 
		for weaponname, properties in skills["weapons"].items()
    },
	"assists": skills["assists"],
	"specials": skills["specials"],
	"passives": {
		passivecategory: {
			passive: {
				property: value
				for property, value in properties.items() if property in ["WeaponType", "moveType", "exclusive"]
			} 
			for passive, properties in skills["passives"][passivecategory].items()
		}
		for passivecategory in ["A", "B", "C", "S"]
    }
}

with open("../static/skills.json", "w") as outfile:
    json.dump(skillslite, outfile)
