import json
import requests
import utils

# Base URL for api requests
url = "https://feheroes.fandom.com/api.php"

# We store all the data in a single dict
heroes = {}

# Parameters to send the API whe requesting the whole list of heroes for data (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Units&fields=_pageName=Page,WeaponType,MoveType,Artist,ActorEN,AdditionDate&limit=max&format=json)
params = dict(
    action = 'cargoquery',
    tables = 'Units',
    fields = '_pageName=Name,WeaponType,MoveType,AdditionDate',
    limit = 'max',
    offset = -500,
    format = 'json'
)
herodata = {}
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
	for hero in [entry["title"] for entry in data["cargoquery"]]:
		herodata[hero["Name"]] = hero

# Parameters to send the API whe requesting the whole list of resplendent heroes (https://feheroes.fandom.com/api.php?action=cargoquery&tables=ResplendentHero&fields=_pageName=Name&limit=max&format=json)
params = dict(
    action = 'cargoquery',
    tables = 'ResplendentHero',
    fields = '_pageName=Name',
    limit = 'max',
    offset = -500,
    format = 'json'
)
resplendentlist = []
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
	for hero in [entry["title"]["Name"] for entry in data["cargoquery"]]:
		resplendentlist.append(hero)

# Parameters to send the API whe requesting the whole list of heroes for stats (https://feheroes.fandom.com/api.php?action=cargoquery&tables=UnitStats&fields=_pageName=Name,Lv1HP5,Lv1Atk5,Lv1Spd5,Lv1Def5,Lv1Res5,HPGR3,AtkGR3,SpdGR3,DefGR3,ResGR3&limit=max&format=json)
params = dict(
    action = 'cargoquery',
    tables = 'UnitStats',
    fields = '_pageName=Name,Lv1HP5,Lv1Atk5,Lv1Spd5,Lv1Def5,Lv1Res5,HPGR3,AtkGR3,SpdGR3,DefGR3,ResGR3',
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
	for hero in [entry["title"] for entry in data["cargoquery"]]:
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
			"resplendent": utils.obtaintrueurl(hero["Name"] + "_Resplendent_Face.webp") if hero["Name"] in resplendentlist else False
		}

with open("../data/units.json", "w") as outfile:
    json.dump(heroes, outfile)

# Smaller version for browser usage
heroeslite = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["WeaponType", "moveType", "AdditionDate"]
	} 
	for heroname, properties in heroes.items()
}

with open("../static/units.json", "w") as outfile:
    json.dump(heroeslite, outfile)
