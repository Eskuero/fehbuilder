import requests
import json
import utils

# Falchion and Missiletainn
hadcordeddata = {
	"Falchion": {
		"SID_ファルシオン覚醒": {
			"NameEN": "Falchion (Awakening)",
			"WeaponType": ["Red Sword"],
			"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
			"statModifiers": [0, 16, 0, 0, 0],
			"specialIcon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9f/Falchion_Awakening_W.png",
			"specialstatModifiers": [3, 16, 0, 0, 0],
			"upgrades": True,
			"exclusive": True,
			"isMax": True
		},
		"SID_ファルシオン外伝": {
			"NameEN": "Falchion (Gaiden)",
			"WeaponType": ["Red Sword"],
			"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
			"statModifiers": [0, 16, 0, 0, 0],
			"specialIcon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/dd/Falchion_Gaiden_W.png",
			"specialstatModifiers": [3, 16, 0, 0, 0],
			"upgrades": True,
			"exclusive": True,
			"isMax": True
		},
		"SID_ファルシオン": {
			"NameEN": "Falchion (Mystery)",
			"WeaponType": ["Red Sword"],
			"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
			"statModifiers": [0, 16, 0, 0, 0],
			"specialIcon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b0/Falchion_Mystery_W.png",
			"specialstatModifiers": [3, 16, 0, 0, 0],
			"upgrades": True,
			"exclusive": True,
			"isMax": True
		}
	},
	"Missiletainn": {
		"SID_ミステルトィン": {
			"NameEN": "Missiletainn (Sword)",
			"WeaponType": ["Red Sword"],
			"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
			"statModifiers": [0, 16, 0, 0, 0],
			"specialIcon": False,
			"specialstatModifiers": [0, 0, 0, 0, 0],
			"upgrades": False,
			"exclusive": True,
			"isMax": True
		},
		"SID_魔書ミステルトィン": {
			"NameEN": "Missiletainn (Tome)",
			"WeaponType": ["Blue Tome"],
			"moveType": ["Infantry", "Armored",  "Cavalry",  "Flying"],
			"statModifiers": [0, 14, 0, 0, 0],
			"specialIcon": False,
			"specialstatModifiers": [0, 0, 0, 0, 0],
			"upgrades": False,
			"exclusive": True,
			"isMax": True
		}
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

# Parameters to send the API whe requesting the whole list of seals (https://feheroes.fandom.com/api.php?action=cargoquery&tables=SacredSealCosts&fields=group_concat(Skill)=Skills&group_by=_pageName&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'SacredSealCosts',
    fields = 'group_concat(Skill)=Skills',
    group_by = '_pageName'
)
maxseals = []
seals = []
for seal in [entry["title"] for entry in utils.retrieveapidata(params)]:
	# All seals for the family
	family = sorted(seal["Skills"].split(","))
	# Add the whole lsit to the seals list
	seals += family
	# But only the last of each to the max list
	maxseals += family[-1:]

# Parameters to send the API whe requesting the list of skills grouped by family (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=group_concat(Name)=FamilyMembers,SP,Scategory&group_by=GroupName&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Skills',
    fields = 'group_concat(Name)=FamilyMembers,SP,Scategory',
    group_by = 'GroupName'
)
# We will use this list later to check which skills are considered max value of their family
maxskills = []
for skill in [entry["title"] for entry in utils.retrieveapidata(params)]:
	# For weapons the anything with more than 200 SP is valid since that's the value for prerequisites of the Steel Axes
	if skill["Scategory"] == "weapon" and int(skill["SP"]) > 200:
		maxskills.append(sorted(skill["FamilyMembers"].split(","))[-1])
	# For assists our checks are more complex. For assists that only score 150 we add them only if they are not base rallies.
	elif skill["Scategory"] == "assist" and (int(skill["SP"]) > 150 or "Rally" not in skill["FamilyMembers"]):
		maxskills.append(sorted(skill["FamilyMembers"].split(","))[-1])
	# Specials are fine as long as they cost more than 100 SP (Base versions of the boosting ones are worth 100 and the ones for AoE are 150) except for Heavenly Light because is the only upgrade from Imbue
	elif skill["Scategory"] == "special" and (int(skill["SP"]) > 150 or "Heavenly Light" in skill["FamilyMembers"]):
		maxskills.append(sorted(skill["FamilyMembers"].split(","))[-1])
	# Arriving here means the skill is a passive and has a well defined family and the skill we add depends on their size
	elif skill["Scategory"] in ["passivea", "passiveb", "passivec"]:
		family = sorted(skill["FamilyMembers"].split(","))
		# We always add the last member unless there are four, then we also add the second last because tier 3 ones are available by themselves except Ideals and Catchs (yet!)
		maxskills.append(family[-1])
		if len(family) == 4:
			maxskills.append(family[-2])

# Now ignore every skill that has a clone ending with "+" (refinable inheritable or improved specials/assists) or " II" (those are remix prf)
maxskills = [skill for skill in maxskills if (skill + "+") not in maxskills and (skill + " II") not in maxskills]


# Parameters to send the API whe requesting the whole list of shiny skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=Name&where=Scategory+in+(%22passivea%22,%20%22passivec%22)+and+SP=300+and+exclusive=0+and+Name+not+like+'%253'+and+Name+not+like+'%25Counter'+and+Name+not+like+'%25Foil'+and+Name+not+like+'%25Ward'&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Skills',
    fields = "Name",
    where = "Scategory in ('passivea','passivec') and SP=300 and exclusive=0 and Name not like '%3' and Name not like '%Counter' and Name not like '%Foil' and Name not like '%Ward'"
)
# This is the list of skills who have shiny borders (This is any skill for A or C category that isn't exclusive, costs 300 SP and doesn't end on 3, Counter, Foil or Ward (for now lol))
shinyskills = [skill['Name'] for skill in [entry["title"] for entry in utils.retrieveapidata(params)]]

# Parameters to send the API whe requesting the whole list of skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=Name,TagID,Scategory,group_concat(StatModifiers%20separator%20%27;%27)=StatModifiers,CanUseMove,CanUseWeapon,group_concat(Exclusive)=Exclusive,group_concat(ifnull(concat(Icon),%20%27%27))=Icon,group_concat(ifnull(concat(RefinePath),%20%27%27))=refines,SP&group_by=Name&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Skills',
# We group concat all values for statsmodifiers, exclusivity, icons and refinepaths to be able to consistently identify which values are the ones for the weapon at base (we basically get the index for a NULL refinepath when filling the dicttionary)
    fields = "Name,TagID,Scategory,group_concat(StatModifiers separator ';')=StatModifiers,CanUseMove,CanUseWeapon,group_concat(Exclusive)=Exclusive,group_concat(ifnull(concat(Icon), ''))=Icon,group_concat(ifnull(concat(RefinePath), ''))=refines,SP",
    group_by = "Name"
)
# Get skill data every time individually before upon entering the loop
for skill in [entry["title"] for entry in utils.retrieveapidata(params)]:
	print(skill["Name"])
	# Weapon type handling
	if skill["Scategory"] == "weapon":
		# We are hardcoding Falchion so we don't parse it normally
		if skill["Name"] in ["Falchion", "Missiletainn"]:
			skills["weapons"].update(hadcordeddata[skill["Name"]])
			continue
		# The position where the refine path is empty is the index of the base weapon
		index = skill["refines"].split(",").index('')
		skills["weapons"][skill["TagID"]] = {
			"NameEN": skill["Name"],
			# Split the weapon types by commas to make later checks easier
			"WeaponType": [item.strip() for item in skill["CanUseWeapon"].split(",")],
			"moveType": [item.strip() for item in skill["CanUseMove"].split(",")],
			"statModifiers": [int(x) for x in skill["StatModifiers"].split(";")[index].split(",")],
			"specialIcon": False,
			"specialstatModifiers": [0, 0, 0, 0, 0],
			"upgrades": True if skill["refines"] != "" else False,
			"exclusive": True if skill["Exclusive"].split(",")[index] == "1" else False,
			"isMax": True if skill["Name"] in maxskills else False
		}
		# If we had upgrades and a skill1 string is on the refine list we have a custom icon and maybe additional visible stats (Mystletain, Axe of Virility have Fury 3)
		if skills["weapons"][skill["TagID"]]["upgrades"] and "skill1" in skill["refines"]:
			# This is the index where the skill1 icon is specified
			effectindex = skill["refines"].split(",").index("skill1")
			skills["weapons"][skill["TagID"]]["specialIcon"] = utils.obtaintrueurl([skill["Icon"].split(",")[effectindex]])[0] if utils.obtaintrueurl([skill["Icon"].split(",")[effectindex]])[0] else "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Icon_Skill_Weapon.png"
			skills["weapons"][skill["TagID"]]["specialstatModifiers"] = skill["StatModifiers"].split(";")[effectindex].split(",")
	# Assist type handling
	if skill["Scategory"] == "assist":
		# Because assists have no restrictions based on weapon or movement we just store them
		skills["assists"][skill["TagID"]] = {
			"NameEN": skill["Name"],
			"WeaponType": [item.strip() for item in skill["CanUseWeapon"].split(",")],
			"exclusive": True if skill["Exclusive"] == "1" else False,
			"isMax": True if skill["Name"] in maxskills else False
		}
	# Special type handling
	if skill["Scategory"] == "special":
		# Because specials have no restrictions based on movement we just store the weapon restrictions
		skills["specials"][skill["TagID"]] = {
			"NameEN": skill["Name"],
			"WeaponType": [item.strip() for item in skill["CanUseWeapon"].split(",")],
			"exclusive": True if skill["Exclusive"] == "1" else False,
			"isMax": True if skill["Name"] in maxskills else False
		}
	# Passive type handling
	if skill["Scategory"] in ["passivea", "passiveb", "passivec"]:
		# Get the category in our format (last character capitalized)
		truecategorie = skill["Scategory"][-1].capitalize()
		# Obtain the true url by parsing the html page for it
		skills["passives"][truecategorie][skill["TagID"]] = {
			"NameEN": skill["Name"],
			"icon": utils.obtaintrueurl([skill["Icon"]])[0],
			"statModifiers": [0, 0, 0, 0, 0] if skill["StatModifiers"] == "" else [int(x) for x in skill["StatModifiers"].split(",")],
			"WeaponType": [item.strip() for item in skill["CanUseWeapon"].split(",")],
			"shiny": True if skill["Name"] in shinyskills else False,
			"moveType": [item.strip() for item in skill["CanUseMove"].split(",")],
			"exclusive": True if skill["Exclusive"] == "1" else False,
			"isMax": True if skill["Name"] in maxskills else False
		}
		# If the skill is available as a sacred seal we complete their data too
		if skill["Name"] in seals:
			skills["passives"]["S"][skill["TagID"]] = skills["passives"][truecategorie][skill["TagID"]]
			skills["passives"]["S"][skill["TagID"]]["isMax"] = True if skill["Name"] in maxseals else False
			
	# Seals type handling
	if skill["Scategory"] == "sacredseal":
		# Obtain the true url by parsing the html page for it
		skills["passives"]["S"][skill["TagID"]] = {
			"NameEN": skill["Name"],
			"icon": utils.obtaintrueurl([skill["Icon"]])[0],
			"statModifiers": [0, 0, 0, 0, 0] if skill["StatModifiers"] == "" else [int(x) for x in skill["StatModifiers"].split(",")],
			"WeaponType": [item.strip() for item in skill["CanUseWeapon"].split(",")],
			"shiny": False,
			"moveType": [item.strip() for item in skill["CanUseMove"].split(",")],
			"exclusive": True if skill["Exclusive"] == "1" else False,
			"isMax": True if skill["Name"] in maxseals else False
		}

# Store all the data for internal usage
with open("../data/skills.json", "w") as outfile:
    json.dump(skills, outfile)

# Smaller version for browser usage
skillslite = {
	"weapons": {
		weaponname: {
			property: value
			for property, value in properties.items() if property in ["NameEN", "specialIcon", "upgrades", "WeaponType", "moveType", "exclusive", "isMax"]
		} 
		for weaponname, properties in skills["weapons"].items()
    },
	"assists": skills["assists"],
	"specials": skills["specials"],
	"passives": {
		passivecategory: {
			passive: {
				property: value
				for property, value in properties.items() if property in ["NameEN", "WeaponType", "moveType", "exclusive", "isMax"]
			} 
			for passive, properties in skills["passives"][passivecategory].items()
		}
		for passivecategory in ["A", "B", "C", "S"]
    }
}

with open("../static/skills.json", "w") as outfile:
    json.dump(skillslite, outfile)
