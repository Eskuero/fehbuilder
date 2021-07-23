import requests
import json
import utils

# All data
other = {
	"blessed": {"Water": {}, "Fire": {}, "Earth": {}, "Wind": {}, "Astra": {}, "Light": {}, "Dark": {}, "Anima": {}}
}
# For browser usage
otherlite = {
	"blessed": {"Water": [], "Fire": [], "Earth": [], "Wind": [], "Astra": [], "Light": [], "Dark": [], "Anima": []}
}

# Parameters to send the API whe requesting the whole list of seals (https://feheroes.fandom.com/api.php?action=cargoquery&tables=MythicHero&fields=_pageName=Name,MythicEffect,AllyBoostHP,AllyBoostAtk,AllyBoostSpd,AllyBoostDef,AllyBoostRes&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'MythicHero',
    fields = '_pageName=Name,MythicEffect,AllyBoostHP,AllyBoostAtk,AllyBoostSpd,AllyBoostDef,AllyBoostRes'
)
# For every hero store the visible buffs it gives
for hero in [entry["title"] for entry in utils.retrieveapidata(params)]:
	other["blessed"][hero["MythicEffect"]][hero["Name"]] = [int(hero["AllyBoostHP"]), int(hero["AllyBoostAtk"]), int(hero["AllyBoostSpd"]), int(hero["AllyBoostDef"]), int(hero["AllyBoostRes"])]
	otherlite["blessed"][hero["MythicEffect"]].append(hero["Name"])

# Parameters to send the API whe requesting the whole list of seals (https://feheroes.fandom.com/api.php?action=cargoquery&tables=LegendaryHero&fields=_pageName=Name,LegendaryEffect,AllyBoostHP,AllyBoostAtk,AllyBoostSpd,AllyBoostDef,AllyBoostRes&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'LegendaryHero',
    fields = '_pageName=Name,LegendaryEffect,AllyBoostHP,AllyBoostAtk,AllyBoostSpd,AllyBoostDef,AllyBoostRes'
)
# For every hero store the visible buffs it gives
for hero in [entry["title"] for entry in utils.retrieveapidata(params)]:
	other["blessed"][hero["LegendaryEffect"]][hero["Name"]] = [int(hero["AllyBoostHP"]), int(hero["AllyBoostAtk"]), int(hero["AllyBoostSpd"]), int(hero["AllyBoostDef"]), int(hero["AllyBoostRes"])]
	otherlite["blessed"][hero["LegendaryEffect"]].append(hero["Name"])

with open("../data/other.json", "w") as outfile:
    json.dump(other, outfile)

with open("../static/other.json", "w") as outfile:
    json.dump(otherlite, outfile)
