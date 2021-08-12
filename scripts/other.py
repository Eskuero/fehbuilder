import os
import json

# All data
other = {
	"blessed": {},
	"duo": [],
	"resonant": []
}

# Get all the files that contain unit definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Person/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
		data = json.load(datasource)
		# Only use the entries where the legendary field is not null
		for entry in [entry for entry in data if entry["legendary"]]:
			if entry["legendary"]["element"] > 0:
				other["blessed"][entry["id_tag"]] = {
					"blessing": entry["legendary"]["element"],
					"boosts": [value for value in entry["legendary"]["bonus_effect"].values()],
					"variant": "-".join([stat for stat, value in entry["legendary"]["bonus_effect"].items() if value > 0 and stat != "hp"]) + ("pairup" if entry["legendary"]["pair_up"] else ("-extrae" if entry["legendary"]["ae_extra"] else ""))
				}
			# If the unit doesn't have element but is of kind 2 or 3 is a duo hero
			elif entry["legendary"]["kind"] in [2, 3]:
				other["duo" if entry["legendary"]["kind"] == 2 else "resonant"].append(entry["id_tag"])

with open("fullother.json", "w") as outfile:
    json.dump(other, outfile)

# Smaller version for browser usage
otherlite = {
	"blessed": {
		hero: {
			property: value
			for property, value in properties.items() if property in ["blessing", "variant"]
		}
		for hero, properties in other["blessed"].items()
	}
}

with open("liteother.json", "w") as outfile:
    json.dump(otherlite, outfile)
