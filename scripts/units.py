import json
import requests
import utils

# We store all the data in a single dict
heroes = {}

# Parameters to send the API whe requesting the whole list of weapon evolutions (https://feheroes.fandom.com/api.php?action=cargoquery&tables=WeaponEvolutions&fields=BaseWeapon,EvolvesInto&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'WeaponEvolutions',
    fields = 'BaseWeapon,EvolvesInto'
)
weaponevolutions = {}
# Get skill data every time individually before upon entering the loop
for weapon in [entry["title"] for entry in utils.retrieveapidata(params)]:
	weaponevolutions[weapon["BaseWeapon"]] = weapon["EvolvesInto"]

# Parameters to send the API whe requesting the whole list of heroes for their base skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=UnitSkills&fields=_pageName=Name,group_concat(skill)=skills&group_by=Name&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'UnitSkills',
    fields = '_pageName=Name,group_concat(skill)=skills',
    group_by = 'Name'
)
heroskills = {}
# Get skill data every time individually before upon entering the loop
for hero in [entry["title"] for entry in utils.retrieveapidata(params)]:
	heroskills[hero["Name"]] = hero["skills"].split(",")
	# If any of the skills for the hero has an evolution available add it to the list
	for item in [item for item in heroskills[hero["Name"]] if item in weaponevolutions]:
		heroskills[hero["Name"]].append(weaponevolutions[item])

# Parameters to send the API whe requesting the whole list of heroes for data (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Units&fields=_pageName=Name,WeaponType,MoveType,Artist,ActorEN,AdditionDate&limit=max&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Units',
    fields = '_pageName=Name,WeaponType,MoveType,Artist,ActorEN,AdditionDate'
)
herodata = {}
stop = False
for hero in [entry["title"] for entry in utils.retrieveapidata(params)]:
	herodata[hero["Name"]] = hero

# Parameters to send the API whe requesting the whole list of resplendent heroes (https://feheroes.fandom.com/api.php?action=cargoquery&tables=ResplendentHero&fields=_pageName=Name&limit=max&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'ResplendentHero',
    fields = '_pageName=Name'
)
resplendentlist = []
# Get skill data every time individually before upon entering the loop
for hero in [entry["title"]["Name"] for entry in utils.retrieveapidata(params)]:
	resplendentlist.append(hero)

# Parameters to send the API whe requesting the whole list of artists (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Artists&fields=Name,NameUSEN&limit=max&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Artists',
    fields = 'Name,NameUSEN'
)
# Store the english name equivalent for each JP one
artistsnames = {artist["Name"]: artist["NameUSEN"] for artist in [entry["title"] for entry in utils.retrieveapidata(params)]}

# Parameters to send the API whe requesting the whole list of heroes for stats (https://feheroes.fandom.com/api.php?action=cargoquery&tables=UnitStats&fields=_pageName=Name,Lv1HP5,Lv1Atk5,Lv1Spd5,Lv1Def5,Lv1Res5,HPGR3,AtkGR3,SpdGR3,DefGR3,ResGR3&limit=max&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'UnitStats',
    fields = '_pageName=Name,Lv1HP5,Lv1Atk5,Lv1Spd5,Lv1Def5,Lv1Res5,HPGR3,AtkGR3,SpdGR3,DefGR3,ResGR3'
)
# Get skill data every time individually before upon entering the loop
for hero in [entry["title"] for entry in utils.retrieveapidata(params)]:
	print(hero["Name"])
	heroes[hero["Name"]] = {
		"stats": {
			"HP": int(hero["Lv1HP5"]),
			"Atk": int(hero["Lv1Atk5"]),
			"Spd": int(hero["Lv1Spd5"]),
			"Def": int(hero["Lv1Def5"]),
			"Res": int(hero["Lv1Res5"])
		},
		"growths": {
			"HP": int(hero["HPGR3"]),
			"Atk": int(hero["AtkGR3"]),
			"Spd": int(hero["SpdGR3"]),
			"Def": int(hero["DefGR3"]),
			"Res": int(hero["ResGR3"])
		},
		"WeaponType": herodata[hero["Name"]]["WeaponType"],
		"moveType": herodata[hero["Name"]]["MoveType"],
		"AdditionDate": herodata[hero["Name"]]["AdditionDate"],
		"frontArt": utils.obtaintrueurl(hero["Name"] + ("_BtlFace.png" if ":" not in hero["Name"] else "_Face.webp")),
		"resplendent": utils.obtaintrueurl(hero["Name"] + "_Resplendent_Face.webp") if hero["Name"] in resplendentlist else False,
		"basekit": heroskills[hero["Name"]] if hero["Name"] in heroskills else [],
		"artist": artistsnames[herodata[hero["Name"]]["Artist"]] if herodata[hero["Name"]]["Artist"] in artistsnames else "",
		"actor": herodata[hero["Name"]]["ActorEN"].replace(",", " + ")
	}

with open("../data/units.json", "w") as outfile:
    json.dump(heroes, outfile)

# Smaller version for browser usage
heroeslite = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["WeaponType", "moveType", "AdditionDate", "basekit"]
	}
	for heroname, properties in heroes.items()
}

with open("../static/units.json", "w") as outfile:
    json.dump(heroeslite, outfile)
