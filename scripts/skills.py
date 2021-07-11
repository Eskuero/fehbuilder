import requests
import json
import utils

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
# Base URL for api requests
url = "https://feheroes.fandom.com/api.php"


# Parameters to send the API whe requesting the whole list of seals (https://feheroes.fandom.com/api.php?action=cargoquery&tables=SacredSealCosts&fields=Skill&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery',
    tables = 'SacredSealCosts',
    fields = 'Skill',
    limit = 'max',
    offset = -500,
    format = 'json'
)
stop = False
seals = []
while not stop:
	# We can only request 500 entries everytime so we increment it everytime we enter the loop
	params["offset"] += 500
	response = requests.get(url = url, params = params)
	data = response.json()
	# If we got less than 500 entries that means this is the last iteration
	if len(data["cargoquery"]) < 500:
		stop = True
	# Just in case we reach the end on a perfect mutliplier of 500
	if len(data["cargoquery"]) == 0:
		break
	seals += [seal["Skill"] for seal in [entry["title"] for entry in data["cargoquery"]]]

# Parameters to send the API whe requesting the whole list of skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=Name,Scategory,Icon,StatModifiers,CanUseMove,CanUseWeapon,RefinePath&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery',
    tables = 'Skills',
    fields = 'Name,Scategory,Icon,StatModifiers,CanUseMove,CanUseWeapon,RefinePath',
# TODO: find a way to reduce the query size without too much hassle
# where = 'RefinePath is NULL OR RefinePath="Skill1"',
    limit = 'max',
    offset = -500,
    format = 'json'
)
stop = False
while not stop:
	# We can only request 500 entries everytime so we increment it everytime we enter the loop
	params["offset"] += 500
	response = requests.get(url = url, params = params)
	data = response.json()
	# If we got less than 500 entries that means this is the last iteration
	if len(data["cargoquery"]) < 500:
		stop = True
	# Just in case we reach the end on a perfect mutliplier of 500
	if len(data["cargoquery"]) == 0:
		break
	# Get skill data every time individually before upon entering the loop
	for skill in [entry["title"] for entry in data["cargoquery"]]:
		print(skill["Name"])
		# Weapon type handling
		if skill["Scategory"] == "weapon":
			# If we already saved the weapon to the final dict this means it's duplicated because it has refines
			if skill["Name"] in skills["weapons"]:
				skills["weapons"][skill["Name"]]["upgrades"] = True
				# Additionally, if the refine path is of class skill1 this means we have a custom icon and an effect refine
				if skill["RefinePath"] == "skill1":
					skills["weapons"][skill["Name"]]["specialIcon"] = utils.obtaintrueurl(skill["Icon"]) if utils.obtaintrueurl(skill["Icon"]) else "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Icon_Skill_Weapon.png"
			else:
				skills["weapons"][skill["Name"]] = {
					# Split the weapon types by commas to make later checks easier
					"WeaponType": skill["CanUseWeapon"].replace(",  ", ",").split(","),
					"statModifiers": [int(x) for x in skill["StatModifiers"].split(",")],
					"upgrades": False,
					"specialIcon": False
				}
		# Assist type handling
		if skill["Scategory"] == "assist":
			# Because assists have no restrictions based on weapon or movement we just store them
			skills["assists"][skill["Name"]] = {
				"WeaponType": skill["CanUseWeapon"].replace(",  ", ",").split(",")
			}
		# Special type handling
		if skill["Scategory"] == "special":
			# Because specials have no restrictions based on movement we just store the weapon restrictions
			skills["specials"][skill["Name"]] = {
				"WeaponType": skill["CanUseWeapon"].replace(", ", ",").split(", ")
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
				"moveType": skill["CanUseMove"].replace(",  ", ",").split(",")
			}
		# Seals type handling
		if skill["Scategory"] == "sacredseal":
			# Obtain the true url by parsing the html page for it
			skills["passives"]["S"][skill["Name"]] = {
				"icon": utils.obtaintrueurl(skill["Icon"]),
				"statModifiers": [0, 0, 0, 0, 0] if skill["StatModifiers"] == "" else [int(x) for x in skill["StatModifiers"].split(",")],
				"WeaponType": skill["CanUseWeapon"].replace(",  ", ",").split(","),
				"moveType": skill["CanUseMove"].replace(",  ", ",").split(",")
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
			for property, value in properties.items() if property in ["specialIcon", "upgrades", "WeaponType"]
		} 
		for weaponname, properties in skills["weapons"].items()
    },
	"assists": skills["assists"],
	"specials": skills["specials"],
	"passives": {
		passivecategory: {
			passive: {
				property: value
				for property, value in properties.items() if property in ["WeaponType", "moveType"]
			} 
			for passive, properties in skills["passives"][passivecategory].items()
		}
		for passivecategory in ["A", "B", "C", "S"]
    }
}

with open("../static/skills.json", "w") as outfile:
    json.dump(skillslite, outfile)
