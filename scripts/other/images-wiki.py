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

import requests
import io
import pathlib
from PIL import Image
import json

# Load list of required icons
with open("images-wiki.json", "r") as datasource:
	icons = json.load(datasource)

def download():
	for icon in icons:
		# By default we save on the "other" folder
		location = "../../data/img/other/"
		# Skip if the file is already downloaded
		if pathlib.Path(location + icon + ".webp").is_file():
			continue
		print(icon)
		# Grab and paste the heroes art in the image
		response = requests.get(icons[icon].split("?")[0])
		# We store the size as part of the URL and just grab it
		dimensions = (int(icons[icon].split("?")[1]), int(icons[icon].split("?")[2]))
		# Download the art image, make sure it has an alpha channel resize it according to the set config
		art = Image.open(io.BytesIO(response.content)).convert("RGBA").resize(dimensions)
		# We save the images as webp attempting the better compression method while being lossless to avoid quality drops
		art.save(location + icon + ".webp", 'WEBP', lossless = True, quality = 100, method = 6)

download()
