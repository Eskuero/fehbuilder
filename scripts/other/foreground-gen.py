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
import json
import pathlib
import plistlib
from PIL import Image

if "FEH_ASSETS_DIR" not in os.environ:
	print("FEH_ASSETS_DIR must be a enviroment variable pointing to a folder with all feh assets")
	sys.exit(1)
else:
	FEH_ASSETS_DIR = os.environ["FEH_ASSETS_DIR"]
	if not pathlib.Path(FEH_ASSETS_DIR).is_dir():
		print("FEH_ASSETS_DIR points to a non valid directory")
		sys.exit(1)

# By default we save on the "other" folder
OUTPUT_DIR = "../../data/img/base/"
# EXTENSION to save picture at
OUTPUT_EXTENSION = ".webp"

def main():
	# Generate base image with specified dimensions
	baseimage = Image.new("RGBA", (720, 1280))

	# Load Common_Window
	Common_Window = {}
	Common_Window["plist"], Common_Window["image"] = loadasset("Common_Window")
	# Load UnitEdit_2
	UnitEdit_2 = {}
	UnitEdit_2["plist"], UnitEdit_2["image"] = loadasset("UnitEdit_2")
	# Load Common
	Common = {}
	Common["plist"], Common["image"] = loadasset("Common")
	# Load Item
	Item = {}
	Item["plist"], Item["image"] = loadasset("Item")
	# Load UnitEdit
	UnitEdit = {}
	UnitEdit["plist"], UnitEdit["image"] = loadasset("UnitEdit")
	# Load Btn_BgChange
	Btn_BgChange = {}
	Btn_BgChange["plist"], Btn_BgChange["image"] = loadasset("Btn_BgChange")
	# Load Resonate
	Resonate = {}
	Resonate["plist"], Resonate["image"] = loadasset("Resonate")

	# Crop out the base background
	image = cropentry(Common_Window["plist"]["Wdw_List.png"], Common_Window["image"])
	# Scale it to 754x100 since that's good enough to offset each border by 17px
	image = image.resize((754,100))
	# Crop and paste to the top half
	tophalf = image.crop((0,0,754,44))
	baseimage = hookedalphacompositepaste(baseimage, tophalf, (-17, 744))
	# Now clone the next two lines a lot until we reach a proper position
	twolines = image.crop((0,44,754,46))
	i = 0;
	while (i < 178):
		baseimage = hookedalphacompositepaste(baseimage, twolines, (-17, 788 + (i * 2)))
		i = i + 1
	# Crop and paste to the bottom half
	bottomhalf = image.crop((0,47,754,100))
	baseimage = hookedalphacompositepaste(baseimage, bottomhalf, (-17, 1144))

	# Crop out the name and title holder
	image = cropentry(UnitEdit_2["plist"]["Frm_Name_2.png"], UnitEdit_2["image"])
	# Scale it to 450x296 since that's good enough to offset each border by 15px
	image = image.resize((443,291))
	# Paste onto the base
	baseimage = hookedalphacompositepaste(baseimage, image, (-12, 475))

	# Crop out holder for stats
	image = cropentry(Common["plist"]["Frm_InfoEdit.0.png"], Common["image"])
	imageexpanded = expandslot(image, (111,54), (276,54), (0,0,55,54), (0, 0), (57,0,111,54), (219,0), (56,0,57,54), 164, 55)
	# Paste onto the base on each required location
	# Move, weapon, types, level
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (2, 724))
	# HP, Atk, Spd, Def, Res, SP, HM
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (50, 776))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (50, 824))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (50, 872))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (50, 920))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (50, 968))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (50, 1016))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (50, 1064))

	# Crop out holder for weapons
	image = cropentry(Common["plist"]["Frm_InfoEdit.3.png"], Common["image"])
	imageexpanded = expandslot(image, (111,54), (329,54), (0,0,55,54), (0,0), (57,0,164,54), (272,0), (56,0,57,54), 217, 55)
	# Paste onto the base on each required location
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (342, 776))

	# Crop out holder for assists
	image = cropentry(Common["plist"]["Frm_InfoEdit.4.png"], Common["image"])
	imageexpanded = expandslot(image, (111,54), (329,54), (0,0,55,54), (0,0), (57,0,164,54), (272, 0), (56,0,57,54), 217, 55)
	# Paste onto the base on each required location
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (342, 824))

	# Crop out holder for specials
	image = cropentry(Common["plist"]["Frm_InfoEdit.5.png"], Common["image"])
	imageexpanded = expandslot(image, (111,53), (329, 53), (0,0,55,53), (0, 0), (57,0,164,53), (272, 0), (56,0,57,53), 217, 55)
	# Paste onto the base on each required location
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (342, 872))

	# Crop out holder for passives
	image = cropentry(Common["plist"]["Frm_InfoEdit.0.png"], Common["image"])
	imageexpanded = expandslot(image, (111,53), (329, 53), (0,0,55,53), (0, 0), (57,0,164,53), (272, 0), (56,0,57,53), 217, 55)
	# Paste onto the base on each required location
	# A, B, C slots
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (342, 920))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (342, 968))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (342, 1016))

	# Crop out holder for seals
	image = cropentry(Common["plist"]["Frm_InfoEdit.2.png"], Common["image"])
	imageexpanded = expandslot(image, (111,53), (329, 53), (0,0,55,53), (0, 0), (57,0,164,53), (272, 0), (56,0,57,53), 217, 55)
	# Paste onto the base on each required location
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (342, 1064))

	# Load empty skill for assists, specials and A/B/C passives from the passives spritesheet
	skillsheet = Image.open(FEH_ASSETS_DIR + "Common/UI/Skill_Passive1.png")

	# The first one is for the empty slots, then to content again
	image = skillsheet.crop((5,4,72,74))
	image = image.crop(image.getbbox())
	# Resize to a proper amount
	image = image.resize((43,44))
	baseimage = hookedalphacompositepaste(baseimage, image, (369, 925))
	baseimage = hookedalphacompositepaste(baseimage, image, (369, 973))
	baseimage = hookedalphacompositepaste(baseimage, image, (369, 1021))

	# Now crop assists
	image = skillsheet.crop((157,4,224,74))
	# Resize to a proper amount
	image = image.resize((45,47))
	baseimage = hookedalphacompositepaste(baseimage, image, (369, 827))

	# Now crop specials
	image = skillsheet.crop((234,4,301,74))
	# Resize to a proper amount
	image = image.resize((45,47))
	baseimage = hookedalphacompositepaste(baseimage, image, (369, 875))

	# Print empty skill accessory for seals
	image = cropentry(Common["plist"]["Icon_AccessoryBlank.png"], Common["image"])
	# Crop circle to content
	image = image.crop(image.getbbox())
	# Resize to a proper amount
	image = image.resize((43,44))
	baseimage = hookedalphacompositepaste(baseimage, image, (369, 1069))

	# Get the feather icon
	image = cropentry(Item["plist"]["Icon_Feather.png"], Item["image"])
	image = image.resize((60,60))
	baseimage = hookedalphacompositepaste(baseimage, image, (57, 1061))

	# Variant name for this image
	variantname = "foreground"
	# We can save this image right now before moving onto other variants
	baseimage.save(OUTPUT_DIR + variantname + OUTPUT_EXTENSION, 'WEBP', lossless = True, quality = 100, method = 6)
	#imageexpanded.save(OUTPUT_DIR + "temp.webp", 'WEBP', lossless = True, quality = 100, method = 6)

	# Append the back button
	image = cropentry(Common["plist"]["Btn_Back.1.png"], Common["image"])
	# Resize to a proper amount
	image = image.crop(image.getbbox())
	image = image.resize((114,114))
	baseimage = hookedalphacompositepaste(baseimage, image, (-9, 8))

	# Append the zoom button
	image = cropentry(UnitEdit["plist"]["Btn_FullView.0.png"], UnitEdit["image"])
	# Resize to a proper amount
	image = image.crop(image.getbbox())
	image = image.resize((96,96))
	baseimage = hookedalphacompositepaste(baseimage, image, (0, 119))

	# Append the bg change button
	image = cropentry(Btn_BgChange["plist"]["Btn_BgChange.0.png"], Btn_BgChange["image"])
	# Resize to a proper amount
	image = image.crop(image.getbbox())
	image = image.resize((96,96))
	baseimage = hookedalphacompositepaste(baseimage, image, (0, 306))

	# Append the voice indicator icon
	image = cropentry(UnitEdit["plist"]["Icon_Voice.png"], UnitEdit["image"])
	# Resize to a proper amount
	image = image.resize((27,25))
	baseimage = hookedalphacompositepaste(baseimage, image, (18, 1221))

	# Append the artist indicator icon
	image = cropentry(UnitEdit["plist"]["Icon_Illustration.png"], UnitEdit["image"])
	# Resize to a proper amount
	image = image.resize((25,25))
	baseimage = hookedalphacompositepaste(baseimage, image, (20, 1251))

	# Append the holder for the tap me audio
	image = cropentry(Common["plist"]["Frm_Help.0.png"], Common["image"])
	# Force opacity a bit higher
	image2 = image.copy()
	image2.putalpha(220)
	image.paste(image2, image)
	imageexpanded = expandslot(image, (43,43), (223, 43), (0,0,21,43), (0, 0), (23,0,43,43), (202, 0), (22,0,23,43), 181, 21)
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (490, 27))

	# Append the exclamation mark
	image = cropentry(UnitEdit["plist"]["Icon_Talk.0.png"], UnitEdit["image"])
	# Resize to a proper amount
	image = image.resize((50,49))
	baseimage = hookedalphacompositepaste(baseimage, image, (498, 22))

	# Append the editing skills buttons
	image = cropentry(Common["plist"]["Btn_OthersS.0.png"], Common["image"])
	imageexpanded = expandslot(image, (73,58), (251, 58), (0,0,36,58), (0, 0), (38,0,74,58), (215, 0), (37,0,38,58), 179, 36)
	# Sets, Change, Learn
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (0, 1165))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (237, 1165))
	baseimage = hookedalphacompositepaste(baseimage, imageexpanded, (474, 1165))

	# Variant name for this image
	variantname = "foreground-ui"
	# We can save this image right now before moving onto other variants
	baseimage.save(OUTPUT_DIR + variantname + OUTPUT_EXTENSION, 'WEBP', lossless = True, quality = 100, method = 6)

	# Now generate the individual holder for X skills that's only downloaded on demand
	image = cropentry(Resonate["plist"]["Frm_InfoEdit_Resonate.png"], Resonate["image"])
	imageexpanded = expandslot(image, (111,53), (329, 53), (0,0,55,53), (0, 0), (57,0,164,53), (272, 0), (56,0,57,53), 217, 55)
	# Variant name for this image
	variantname = "Xskillholder"
	# We can save this image right now before moving onto other variants
	imageexpanded.save(OUTPUT_DIR + variantname + OUTPUT_EXTENSION, 'WEBP', lossless = True, quality = 100, method = 6)

def loadasset(path):
	with open(FEH_ASSETS_DIR + "Common/UI/" + path + ".plist", "rb") as infile:
		plist = plistlib.load(infile)
	image = Image.open(FEH_ASSETS_DIR + "Common/UI/" + path + ".png")
	# Return the data
	return plist["frames"], image

def cropentry(entry, base):
	# We remove all {}, split by comma and transform each value as ints
	rect = [int(value) for value in entry["textureRect"].replace("{", "").replace("}", "").split(",")]
	# Compose and apply croparea. If rotated we invert the width and height
	if entry["textureRotated"]:
		croparea = (rect[0], rect[1], rect[0] + rect[3], rect[1] + rect[2])
	else:
		croparea = (rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3])
	return base.crop(croparea) if not entry["textureRotated"] else base.crop(croparea).transpose(Image.ROTATE_90)

def expandslot(image, resize, expandedsize, leftcoor, pasteleft, rightcoor, pastright, pixelcoor, pixelamount, pixelstart):
	# Scale to 111x53 which is proper to copy
	image = image.resize(resize)
	# Generate a clean image to hold the expanded version
	imageexpanded = Image.new("RGBA", expandedsize)
	# Copy the left and righ portions to the sides
	lefthalf = image.crop(leftcoor)
	imageexpanded.paste(lefthalf, pasteleft, lefthalf)
	rightthalf = image.crop(rightcoor)
	imageexpanded.paste(rightthalf, pastright, rightthalf)
	# Fill everything in between with the middle pixel
	middlepixel = image.crop(pixelcoor)
	i = 0
	while (i < pixelamount):
		imageexpanded.paste(middlepixel, (pixelstart + i, 0), middlepixel)
		i = i + 1
	return imageexpanded

def hookedalphacompositepaste(origin, layer, coordinates):
	origin.alpha_composite(layer, coordinates)
	return origin

main()
