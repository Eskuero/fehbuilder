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
import pathlib
import subprocess
import math
import os
from PIL import Image

try:
	os.mkdir("temp")
except:
	pass

##########################################################
# Obtain all english translations for debugging purposes #
with open("../data/languages/fulllanguages.json", "r") as datasource:
	engrishname = json.load(datasource)["USEN"]

# Local path to dump all art
LOCAL_BASE_PATH = "../data/img/"

##########################
# Obtain all heroes data #

print("Pulling  heroes art...")
with open("../data/content/fullunits.json", "r") as datasource:
	units = json.load(datasource)

# Remote base location for all heroes data in an Android ADV
HEROES_BASE_PATH = "/data/data/com.nintendo.zaba/files/assets/Common/Face/"

# Loop through every hero definition to pull their art
for unit in units:
	# Generate a dictionary of all the images we need and their expected remote names. Enemy units lack most of content
	if "EID_" in unit:
		artlist = [
			{"remotepath": units[unit]["art"] + "/BtlFace.png", "localpath": "heroes/" + unit + "_Portrait.webp", "dimensions": (1330, 1596)},
			{"remotepath": units[unit]["art"] + "/BtlFace_BU.png", "localpath": "condensed-faces/" + unit + "_Attack.webp", "dimensions": (321, 202)}
		]
	else:
		artlist = [
			{"remotepath": units[unit]["art"] + "/Face.png", "localpath": "heroes/" + unit + "_Portrait.webp", "dimensions": (1330, 1596)}, # Full art front pose
			{"remotepath": units[unit]["art"] + "/BtlFace.png", "localpath": "heroes/" + unit + "_Attack.webp", "dimensions": (1330, 1596)}, # Full art attack pose
			{"remotepath": units[unit]["art"] + "/BtlFace_C.png", "localpath": "heroes/" + unit + "_Special.webp", "dimensions": (1330, 1596)}, # Full art special pose
			{"remotepath": units[unit]["art"] + "/BtlFace_D.png", "localpath": "heroes/" + unit + "_Damage.webp", "dimensions": (1330, 1596)}, # Full art damage pose
			{"remotepath": units[unit]["art"] + "/Face_FC.png", "localpath": "faces/" + unit + ".webp", "dimensions": (50, 50)}, # Face art low quality
			{"remotepath": units[unit]["art"] + "/Face_FC.png", "localpath": "hd-faces/" + unit + ".webp", "dimensions": (100, 100)}, # Face art high quality
			{"remotepath": units[unit]["art"] + "/BtlFace_BU.png", "localpath": "condensed-faces/" + unit + "_Attack.webp", "dimensions": (321, 202)}, # Condensed art attack pose
			{"remotepath": units[unit]["art"] + "/BtlFace_BU_D.png", "localpath": "condensed-faces/" + unit + "_Damage.webp", "dimensions": (321, 202)}, # Condensed art damage pose
		]
		# For resplendents pull extra art
		if units[unit]["resplendent"]:
			artlist = artlist + [
				{"remotepath": units[unit]["art"] + "EX01/Face.png", "localpath": "heroes/" + unit + "_Resplendent_Portrait.webp", "dimensions": (1330, 1596)}, # Full art front pose
				{"remotepath": units[unit]["art"] + "EX01/BtlFace.png", "localpath": "heroes/" + unit + "_Resplendent_Attack.webp", "dimensions": (1330, 1596)}, # Full art attack pose
				{"remotepath": units[unit]["art"] + "EX01/BtlFace_C.png", "localpath": "heroes/" + unit + "_Resplendent_Special.webp", "dimensions": (1330, 1596)}, # Full art special pose
				{"remotepath": units[unit]["art"] + "EX01/BtlFace_D.png", "localpath": "heroes/" + unit + "_Resplendent_Damage.webp", "dimensions": (1330, 1596)}, # Full art damage pose
				{"remotepath": units[unit]["art"] + "EX01/Face_FC.png", "localpath": "faces/" + unit + "_Resplendent.webp", "dimensions": (50, 50)}, # Face art low quality
				{"remotepath": units[unit]["art"] + "EX01/Face_FC.png", "localpath": "hd-faces/" + unit + "_Resplendent.webp", "dimensions": (100, 100)}, # Face art high quality
				{"remotepath": units[unit]["art"] + "EX01/BtlFace_BU.png", "localpath": "condensed-faces/" + unit + "_Resplendent_Attack.webp", "dimensions": (321, 202)}, # Condensed art attack pose
				{"remotepath": units[unit]["art"] + "EX01/BtlFace_BU_D.png", "localpath": "condensed-faces/" + unit + "_Resplendent_Damage.webp", "dimensions": (321, 202)}, # Condensed art damage pose
			]

	# Check all localpaths and pull the art if it doesn't exist already
	for art in artlist:
		if not pathlib.Path(LOCAL_BASE_PATH + art["localpath"]).is_file():
			truename = engrishname["M" + unit] + ((": " + engrishname[unit.replace("PID", "MPID_HONOR")]) if "PID_" in unit else "")
			print("\"" + truename + "\" missing asset \"" + art["localpath"] + "\", pulling from \"" + art["remotepath"] + "\"", end = ": ", flush = True)
			try:
				with open("temp/heroart", "wb+") as tempimage:
					subprocess.run(['adb', 'shell', "su -c", "dd if=" + HEROES_BASE_PATH + art["remotepath"]], stdout=tempimage, stderr = subprocess.DEVNULL)
					image = Image.open(tempimage).resize(art["dimensions"])
					# We save the icons as webp attempting the better compression method while being lossless to avoid quality drops
					image.save(LOCAL_BASE_PATH + art["localpath"], 'WEBP')
				print("Correct")
			except:
				print("Failed")

###################################
# Obtain all skills to pull icons #
with open("../data/content/fullskills.json", "r") as datasource:
	skills = json.load(datasource)

print("\nPulling spritsheets for passive and weapon refine icons...")
# First obtain all the icon spritesheets
p = subprocess.Popen(['adb', 'shell', "su -c", "ls /data/data/com.nintendo.zaba/files/assets/Common/UI/Skill_Passive*"], stdout=subprocess.PIPE, stderr = subprocess.DEVNULL)
spritesheets = p.communicate()[0].decode().split()
# Pull each spritesheet and store them ordered
orderedsheets = []
for i in range(0, len(spritesheets)):
	# Obtain the real index of the sheet. For that strip the filepath of everything but the number - 1
	realindex = int(spritesheets[i].strip("/data/data/com.nintendo.zaba/files/assets/Common/UI/Skill_Passive").strip(".png")) - 1
	with open("temp/sheet" + str(realindex), "wb+") as tempimage:
		subprocess.run(['adb', 'shell', "su -c", "dd if=" + spritesheets[i]], stdout=tempimage, stderr = subprocess.DEVNULL)
		orderedsheets.insert(realindex, Image.open(tempimage))

print("\nCropping individual passive and weapon refine icons...")
# For ease of looping create a big dictionary that specifies the expected local path and the iconid too
icons = {}
# First we loop the passives
allpassives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"]
for passive in allpassives:
	icons[passive] = {
		"localpath": "icons/" + passive + ".webp",
		"iconid": allpassives[passive]["iconid"]
	}
# Now loop the weapons for the ones with an effect refine
for weapon in skills["weapons"]:
	if "Effect" in skills["weapons"][weapon]["refines"]:
		icons[weapon] = {
			"localpath": "icons/" + weapon + "-Effect.webp",
			"iconid": skills["weapons"][weapon]["refines"]["Effect"]["iconid"]
		}

# Check all localpaths and crop the icon if it doesn't exist already
for icon in icons:
	if not pathlib.Path(LOCAL_BASE_PATH + icons[icon]["localpath"]).is_file():
		truename = engrishname["M" + icon]
		print("\"" + truename + "\" missing asset \"" + icons[icon]["localpath"] + "\", cropping from spritesheet with ID " + str(icons[icon]["iconid"]), end = ": ", flush = True)
		# Each spritesheet contains 169 icons, that means they end at +168 index. We divide by 169 and floor to detect which one
		sheet = math.floor(icons[icon]["iconid"] / 169)
		# Once we know which sheet we can calculate the ID within it by substracting the starting index from the one we are using
		idwithin = icons[icon]["iconid"] - (sheet * 169)
		# The starting object is the entire spritesheett, which we copy
		iconimage = orderedsheets[sheet].copy()
		# Initially we are cropping all icons to 76 x 76 for ease on some checks
		# We calculate the coordinates of each icon box knowing that each line is 13 icons wide
		line = math.floor(idwithin / 13)
		top = 76 * line
		left = 76 * (idwithin - (line * 13))
		iconimage = iconimage.crop((left, top, left + 76, top + 76))
		# But we crop even further to different sizes depending on the existance of the shiny border or not, for that we get an specific pixel
		# If the color of the pixel at 37,9 is (255, 241, 3, 255) that means we have a shiny border
		try:
			isshiny = iconimage.getpixel((37, 9)) == (255, 241, 3, 255)
			# When that happens we crop and resize less than usual
			if isshiny:
				iconimage = iconimage.crop((0, 0, 75, 76)).resize((48, 48))
			else:
				iconimage = iconimage.crop((6, 6, 6 + 66, 6 + 68)).resize((44, 44))
			iconimage.save(LOCAL_BASE_PATH + icons[icon]["localpath"], 'WEBP', lossless = True, quality = 100, method = 6)
			print("Successful")
		except:
			print("Failed")

# Clean after us
for tempfile in os.listdir("temp"):
	os.unlink("temp/" + tempfile)