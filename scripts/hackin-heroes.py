# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import json
import os
import datetime

# Load all heroes data from the json file
with open("../data/content/fullunits.json", "r") as datasource:
	heroes = json.load(datasource)

# Get all the manually defined hero jsons
files = os.listdir("hackin/heroes/")
for file in files:
	with open("hackin/heroes/" + file, "r") as datasource:
		dataheroes = json.load(datasource)
	# Update or add each entry
	for hero in dataheroes:
		heroes[hero] = dataheroes[hero]

# Sort all heroes by ID so they have a nicer appearance in tierlist maker
heroessorted = sorted(heroes.items(), key = lambda x: x[1].get('id',-1))
heroes = {}
for hero in heroessorted:
	heroes.update({hero[0]: hero[1]})

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Store all the data for internal usage of scripts
with open("fullunits.json", "w") as outfile:
	json.dump(heroes, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in online unit builder (doesn't need origin, resplendent indicator or id)
heroesonline = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon", "move", "stats", "growths", "basekit", "flowers"]
	}
	for heroname, properties in heroes.items()
}
with open("onlineunits.json", "w") as outfile:
	json.dump(heroesonline, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in custom unit builder (Only needs types, stats and growths)
heroescustom = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon", "move", "stats", "growths"]
	}
	for heroname, properties in heroes.items()
}
with open("customunits.json", "w") as outfile:
	json.dump(heroescustom, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in summoning simulator (Only needs weapon type to detect color)
heroessummon = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon"]
	}
	for heroname, properties in heroes.items() if "EID" not in heroname
}
with open("summonunits.json", "w") as outfile:
	json.dump(heroessummon, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in crd and tierlist builders (Needs types, origin, resplendent and id)
heroestier = {
	heroname: {
		property: value
		for property, value in properties.items() if property in ["weapon", "move", "origin", "resplendent", "id"]
	}
	for heroname, properties in heroes.items() if "EID" not in heroname
}
with open("tierunits.json", "w") as outfile:
	json.dump(heroestier, outfile)

