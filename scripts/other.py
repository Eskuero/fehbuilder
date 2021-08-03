import os
import json

# All data
other = {
	# 1,Fire   2,Water   3,Wind   4,Earth   5,Light   6,Dark   7,Astra   8,Anima
	"blessed": [{}, {}, {}, {}, {}, {}, {}, {}],
	"duo": [],
	"resonant": []
}
# For browser usage
otherlite = {
	# 1,Fire   2,Water   3,Wind   4,Earth   5,Light   6,Dark   7,Astra   8,Anima
	"blessed": [[], [], [], [], [], [], [], []]
}

# Get all the files that contain unit definitions and loop through them
files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Person/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
		data = json.load(datasource)
		# Only use the entries where the legendary field is not null
		for entry in [entry for entry in data if entry["legendary"]]:
			if entry["legendary"]["element"] > 0:
				other["blessed"][entry["legendary"]["element"]-1][entry["id_tag"]] = {
					"boosts": [value for value in entry["legendary"]["bonus_effect"].values()],
					"variant": "-".join([stat for stat, value in entry["legendary"]["bonus_effect"].items() if value > 0 and stat != "hp"]) + ("pairup" if entry["legendary"]["pair_up"] else ("-extrae" if entry["legendary"]["ae_extra"] else ""))
				}
				otherlite["blessed"][entry["legendary"]["element"]-1].append(entry["id_tag"])
			# If the unit doesn't have element but is of kind 2 or 3 is a duo hero
			elif entry["legendary"]["kind"] in [2, 3]:
				other["duo" if entry["legendary"]["kind"] == 2 else "resonant"].append(entry["id_tag"])

with open("fullother.json", "w") as outfile:
    json.dump(other, outfile)

with open("liteother.json", "w") as outfile:
    json.dump(otherlite, outfile)
