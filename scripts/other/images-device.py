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
import sys
import shutil
import pathlib
from PIL import Image
import json
import subprocess
import requests
import plistlib

if "FEH_ASSETS_DIR" not in os.environ:
	print("FEH_ASSETS_DIR must be a enviroment variable pointing to a folder with all feh assets")
	sys.exit(1)
else:
	FEH_ASSETS_DIR = os.environ["FEH_ASSETS_DIR"]
	if not pathlib.Path(FEH_ASSETS_DIR).is_dir():
		print("FEH_ASSETS_DIR points to a non valid directory")
		sys.exit(1)

# By default we save on the "other" folder
OUTPUT_DIR = "../../data/img/other/"
# EXTENSION to save picture at
OUTPUT_EXTENSION = ".webp"

# Load list of required icons
with open("images-device.json", "r") as datasource:
	images = json.load(datasource)

for image in images:
	# Skip if the file is already exists
	if pathlib.Path(OUTPUT_DIR + image + OUTPUT_EXTENSION).is_file():
		continue
	# Say what are we doing now
	print(f"Processing {image}")
	# Compose location of source image using the ASSETS enviroment variable and the path given
	path = FEH_ASSETS_DIR + images[image].get("path", "undefined")

	# We check the commanded actions and do them. They are not done in the provided order but a hardcoded one for consistency
	# copy: We simply skip any work at all and copy the file directly to the final directory
	# plist: The origin file has a .plist of properties defining where to find each image of the spritesheet. An 'entry' string property must be given.
	# crop: We crop the origin file on certain coordinates. Top-left corner coordinates, width and height must be given as 'position' and 'dimensions' tuple
	# """"""""""""""""""""plist and crop are mutually exclusive"""""""""""""""""""
	# rotate: Rotate the picture before
	# resize: The final dimensions to resize the picture before saving it. Requires a 'scale' tuple
	# Additionally all files are cropped to content to save space
	actions = images[image].get("actions", [])

	# if no actions are given skip this picture
	if len(actions) == 0:
		print("   - No actions were given")
		continue

	# When copying we just move the tempart to the final destination, keep the .webp extension since it's the original format and skip all remaining actions even if asked.
	if "copy" in actions:
		try:
			shutil.copy2(path, OUTPUT_DIR + image + ".webp")
		except:
			print(f"   - Failed to copy to final directory")
			continue
		else:
			# If everything went fine skip all remaining actions
			print("   - Copied to final directory")
			continue

	# Load the picture
	try:
		baseimage = Image.open(path)
	except:
		print(f"   - Failed to load image from {path}, is it corrupt?")
		continue

	# Custom action to create rarity lines
	if "rarity" in actions:
		# Get plist information, it's always located in the same path with plist extension
		plistpath = path.replace(".png", ".plist")
		# Load onto memory
		try:
			with open(plistpath, "rb") as infile:
				plist = plistlib.load(infile)
		except:
			print("   - Failed to load plist info, is it corrupt?")
			continue
		# Generate and use cropping coordinates from content for the hear overlay the base template
		rarity = 5 if image == "rarityForma" else int(image[-1])
		entry = images[image].get("entry", "undefined")
		try:
			# We remove all {}, split by comma and transform each value as ints
			rect = [int(value) for value in plist["frames"][entry]["textureRect"].replace("{", "").replace("}", "").split(",")]
			# Compose and apply croparea.
			croparea = (rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3])
			raritystar = baseimage.crop(croparea)
		except:
			print(f"   - Failed to crop star from plist data, tried entry {entry}")
			continue
		# Crop star to content
		try:
			croparea = raritystar.getbbox()
			raritystar = raritystar.crop(croparea)
		except:
			print("   - Failed to crop star to content, what the fuck happened?")
			continue
		else:
			print("   - Cropped image to content")
		# Resize the star to 53x53
		try:
			raritystar = raritystar.resize((53,53))
		except:
			print("   - Failed to resize image, are scale values correct?")
			continue
		else:
			print("   - Resized image to specifications")
		# Generate base image with specified dimensions
		baseimage = Image.new("RGBA", images[image]["scale"], color = 0)
		# Paste image
		for i in range(0, rarity):
			baseimage.paste(raritystar, (i * 37, 0), raritystar)

	# Custom action to create favorite images
	if "favorite" in actions:
		# Get plist information, it's always located in the same path with plist extension
		plistpath = path.replace(".png", ".plist")
		# Load onto memory
		try:
			with open(plistpath, "rb") as infile:
				plist = plistlib.load(infile)
		except:
			print("   - Failed to load plist info, is it corrupt?")
			continue
		# Generate and use cropping coordinates from content for the hear overlay the base template
		try:
			# The heart entry is composed from the number of the favorite
			number = image.split("_")[1]
			entry = f"Icon_Btn_Lock.{number}.png"
			# We remove all {}, split by comma and transform each value as ints
			rect = [int(value) for value in plist["frames"][entry]["textureRect"].replace("{", "").replace("}", "").split(",")]
			# Compose and apply croparea.
			croparea = (rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3])
			heart = baseimage.crop(croparea)
		except:
			print(f"   - Failed to crop heart from plist data, tried entry {entry}")
			continue
		# This is the entry in the plist that we target
		entry = images[image].get("entry", "undefined")
		# Generate and use cropping coordinates from content fro the base template
		try:
			# We remove all {}, split by comma and transform each value as ints
			rect = [int(value) for value in plist["frames"][entry]["textureRect"].replace("{", "").replace("}", "").split(",")]
			# Compose and apply croparea.
			croparea = (rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3])
			baseimage = baseimage.crop(croparea)
		except:
			print(f"   - Failed to crop baseimage from plist data, tried entry {entry}")
			continue
		# Generate an image overlay with the same size for the heart
		heartoverlay = Image.new("RGBA", (rect[2], rect[3]), color = 0)
		heartoverlay.paste(heart, (31, 33), heart)
		# Paste the heart onto the baseimage
		baseimage = Image.alpha_composite(baseimage, heartoverlay)


	# Crop from plist info
	if "plist" in actions:
		# Get plist information, it's always located in the same path with plist extension
		plistpath = path.replace(".png", ".plist")
		# Load onto memory
		try:
			with open(plistpath, "rb") as infile:
				plist = plistlib.load(infile)
		except:
			print("   - Failed to load plist info, is it corrupt?")
			continue
		# This is the entry in the plist that we target
		entry = images[image].get("entry", "undefined")
		# Generate and use cropping coordinates from content
		try:
			# We remove all {}, split by comma and transform each value as ints
			rect = [int(value) for value in plist["frames"][entry]["textureRect"].replace("{", "").replace("}", "").split(",")]
			# Compose and apply croparea. If rotated we invert the width and height
			if plist["frames"][entry]["textureRotated"]:
				croparea = (rect[0], rect[1], rect[0] + rect[3], rect[1] + rect[2])
			else:
				croparea = (rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3])
			baseimage = baseimage.crop(croparea)
		except:
			print(f"   - Failed to crop image from plist data, tried entry {entry}")
			continue
		# If the entry claims to be rotated, fix it now
		if plist["frames"][entry]["textureRotated"]:
			try:
				baseimage = baseimage.transpose(Image.ROTATE_90)
			except:
				print("   - Failed to rotate image from plist data, how did this happen?")
				continue
		print("   - Cropped image to from plist data")
	# Crop from manual coordinates
	elif "crop" in actions:
			# Generate and use cropping coordinates
			try:
				position = images[image]["position"]
				dimensions = images[image]["dimensions"]
				croparea = (position[0], position[1], position[0] + dimensions[0], position[1] + dimensions[1])
				baseimage = baseimage.crop(croparea)
			except:
				print("   - Failed to crop image, are position and dimension values provided and correct?")
				continue
			else:
				print("   - Cropped image from manual coordinates")

	# Generate and use cropping coordinates from content
	if "content" in actions:
		try:
			croparea = baseimage.getbbox()
			baseimage = baseimage.crop(croparea)
		except:
			print("   - Failed to crop image to content, what the fuck happened?")
			continue
		else:
			print("   - Cropped image to content")

	# Rotate the image backwards
	if "rotate" in actions:
		try:
			baseimage = baseimage.transpose(Image.ROTATE_90)
		except:
			print("   - Failed to rotate image from manual specification")
			continue
		else:
			print("   - Rotated image")

	# Resize the image to the final size
	if "resize" in actions:
		try:
			scale = images[image]["scale"]
			baseimage = baseimage.resize(scale)
		except:
			print("   - Failed to resize image, are scale values correct?")
			continue
		else:
			print("   - Resized image to specifications")

	# Save the image on the final destination
	try:
		baseimage.save(OUTPUT_DIR + image + OUTPUT_EXTENSION, 'WEBP', lossless = True, quality = 100, method = 6)
	except:
		print("   - Failed to save image, WHWHYWHYWYW?")
		continue
	else:
		print("   - Saved to final directory")
