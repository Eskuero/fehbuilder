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

# List of folders to open each json from within and indent it
folders = ["enemy", "heroes", "sacredseals", "skills", "weaponevolutions"]

# Loop through each of them
for folder in folders:
	# Obtain the list of json files contained within
	jsonfiles = os.listdir("hackin/" + folder + "/")
	# Loop through each of them
	for jsonfile in jsonfiles:
		# Load the data contained
		with open("hackin/" + folder + "/" + jsonfile, "r") as datasource:
			data = json.load(datasource)
		# Save it back indented
		with open("hackin/" + folder + "/" + jsonfile, "w") as outfile:
			json.dump(data, outfile, indent='\t')
