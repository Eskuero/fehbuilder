import json

# Load all heroes data from the json file
with open("../data/units.json", "r") as datasource:
	heroes = json.load(datasource)

# Load all skills data from the json file
with open("../data/skills.json", "r") as datasource:
	skills = json.load(datasource)

for hero in list(heroes.keys()):
	for art in heroes[hero]["art"]:
		if not heroes[hero]["art"][art]:
			print(heroes[hero]["NameEN"] + ": " + art)

for tipo in skills["passives"]:
	for skill in skills["passives"][tipo]:
		if not skills["passives"][tipo][skill]["icon"]:
			print(skills["passives"][tipo][skill]["NameEN"])
