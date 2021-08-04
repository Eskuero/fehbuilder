import json

# Load all heroes data from the json file
with open("../data/fullunits.json", "r") as datasource:
	heroes = json.load(datasource)

# Load all skills data from the json file
with open("../data/fullskills.json", "r") as datasource:
	skills = json.load(datasource)

# Load all skills data from the json file
with open("../data/fulllanguages.json", "r") as datasource:
	languages = json.load(datasource)["USEN"]

print("Heroes normal art (not resplendent):")
for hero in list(heroes.keys()):
	# Ignore enemy generic units since they do only have portrait files
	for art in [art for art in heroes[hero]["art"] if "EID_" not in hero]:
		if not heroes[hero]["art"][art]:
			print("     " + languages["M" + hero] + " (" + hero + "): doesn't have art for " + art)

print("\nWeapons +Eff Refine:")
for weapon in skills["weapons"]:
	if skills["weapons"][weapon].get("effectrefine", False):
		if not skills["weapons"][weapon]["icon"]:
			print("     " + languages["M" + weapon] + " (" + weapon + "): failed to retrieve full URL")

print("\nPassives A, B, C, S:")
for tipo in skills["passives"]:
	for skill in skills["passives"][tipo]:
		if not skills["passives"][tipo][skill]["icon"]:
			print("     " + languages["M" + skill] + " (" + skill + "): failed to retrieve full URL")
