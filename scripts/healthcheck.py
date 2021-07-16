import json

# Load all heroes data from the json file
with open("../data/units.json", "r") as datasource:
	heroes = json.load(datasource)

# Load all skills data from the json file
with open("../data/skills.json", "r") as datasource:
	skills = json.load(datasource)

for hero in list(heroes.keys()):
	if not heroes[hero]["frontArt"]:
		print(hero)

for tipo in skills["passives"]:
	for skill in skills["passives"][tipo]:
		if not skills["passives"][tipo][skill]["icon"]:
			print(skill)
