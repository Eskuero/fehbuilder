import json

# Load all heroes data from the json file
with open("../data/units.json", "r") as datasource:
	heroes = json.load(datasource)

# Load all skills data from the json file
with open("../data/skills.json", "r") as datasource:
	skills = json.load(datasource)

# Load all skills data from the json file
with open("../data/languages.json", "r") as datasource:
	languages = json.load(datasource)["USEN"]

print("Heroes normal art (not resplendent):")
for hero in list(heroes.keys()):
	for art in heroes[hero]["art"]:
		if not heroes[hero]["art"][art]:
			print("     " + languages["M" + hero] + " (" + hero + "): doesn't have art for " + art)

print("\nWeapons +Eff Refine:")
for weapon in skills["weapons"]:
	if skills["weapons"][weapon].get("effectrefine", False):
		if "specialIcon" not in skills["weapons"][weapon]:
			print("     " + languages["M" + weapon] + " (" + weapon + "): not in the wiki table (doesn't exist or has incorrect tagID)")
		elif not skills["weapons"][weapon]["specialIcon"]:
			print("     " + languages["M" + weapon] + " (" + weapon + "): failed to retrieve full URL")

print("\nPassives A, B, C, S:")
for tipo in skills["passives"]:
	for skill in skills["passives"][tipo]:
		if "icon" not in skills["passives"][tipo][skill]:
			print("     " + languages["M" + skill] + " (" + skill + "): not in the wiki table (doesn't exist or has incorrect tagID)")
		elif not skills["passives"][tipo][skill]["icon"]:
			print("     " + languages["M" + skill] + " (" + skill + "): failed to retrieve full URL")
