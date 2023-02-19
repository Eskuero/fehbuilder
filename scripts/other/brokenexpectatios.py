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

# Load all unit data from the json file
with open("../../data/content/fullunits.json", "r") as datasource:
	heroes = json.load(datasource)

# Load all language data from the json file
with open("../../data/languages/fulllanguages.json", "r") as datasource:
	strings = json.load(datasource)["USEN"]

realnames = ["HP", "Atk", "Spd", "Def", "Res"]
for hero in heroes:
	stats = [value+2 for value in heroes[hero]["stats"]]
	# Skeleton info of hero
	entry = {
		"stats": stats,
		"affected": ""
	}

	for i in range(1,5):
		if entry["stats"][i] == entry["stats"][0]-1:
			entry["affected"] += " (+" + realnames[i] + "/-HP) ||"
		elif entry["stats"][i] == entry["stats"][0]:
			entry["affected"] += " (+" + realnames[i] + "/-Anything) || (-HP/+Anything)"
		elif entry["stats"][i] == entry["stats"][0]+1:
			entry["affected"] += " (Anything but +HP) || Neutral"
		elif entry["stats"][i] >= entry["stats"][0]+1:
			entry["affected"] += " (Anything but +HP/-" + realnames[i] + ") ||"

	# Clear leftover bars
	entry["affected"] = entry["affected"].rstrip("||")

	if entry["affected"]:
		print(strings["M" + hero] + ": " + strings["M" + hero.replace("ID", "ID_HONOR")] + " with bases " + str(entry["stats"]) + " for this spreads:" + str(entry["affected"]))
