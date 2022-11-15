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

import os
import json
import math
from PIL import Image

# Get all info about what spritesheets to build
with open("spritesheets.json", "r") as datafile:
	spritesheets = json.load(datafile)

# We loop through every defined spritesheet under the folder
for sheet, values in spritesheets.items():
	# If no number of columns is specified use as many columns as needed to fit all the icons in one line
	columns = values.get("sheetcolumns", len(values["icons"]))
	# The width of the spritesheet is the amount of columns x the specified size
	width = columns * values["iconsize"]
	# The height of the spritesheet is the amount of rows needed to fix all the specified icons considering each has a fixed length of "sheetcolumns".
	# Decimals must always be ceiled to make sure we don't barely miss the mark
	height = math.ceil(len(values["icons"]) / columns) * values["iconsize"]
	# Create the new image canvas
	canvas = Image.new("RGBA", (width, height))
	# Remember icons size for comparissons
	prevsize = 0
	
	# Loop through every icon
	for i, icon in enumerate(values["icons"]):
		# Open the image and instantly resize it to the expected value
		image = Image.open(values["location"] + icon).resize((values["iconsize"], values["iconsize"]))
		# By diving the current icon count by the max per column, floored, then multiply by size, we get the position in Y
		posY = math.floor(i/columns) * values["iconsize"]
		# By getting the mod of the current icon count divided by the max per column, floored, then multiply by size, we get the position in X
		posX = math.floor(math.fmod(i,columns)) * values["iconsize"]
		# Append the previous size
		prevsize += os.path.getsize(values["location"] + icon) / 1024
		# Paste the image in it's position
		canvas.paste(image, (posX, posY))

	# We save the images as webp attempting the better compression method while being lossless to avoid quality drops
	canvas.save(values["output"] + sheet + ".webp", 'WEBP', lossless = True, quality = 100, method = 6)
	
	# Print sizes for fun
	print(sheet + " results...")
	print("Previous file size was :", prevsize, "kilobytes")
	print("Final file size was :", os.path.getsize(values["output"] + sheet + ".webp") / 1024, "kilobytes")