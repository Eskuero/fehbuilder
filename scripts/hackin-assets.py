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
import math
import os
from PIL import Image

#########
# FIXME #: We download character sprites from wiki. Sounds like a pain to compose them for datamine
#########
import utils
import requests
import io

if "FEH_ASSETS_DIR" not in os.environ:
	print("FEH_ASSETS_DIR must be a enviroment variable pointing to a folder with all feh assets")
	sys.exit(1)
else:
	FEH_ASSETS_DIR = os.environ["FEH_ASSETS_DIR"]
	if not pathlib.Path(FEH_ASSETS_DIR).is_dir():
		print("FEH_ASSETS_DIR points to a non valid directory")
		sys.exit(1)

##########################################################
# Obtain all english translations for debugging purposes #
with open("../data/languages/fulllanguages.json", "r") as datasource:
	engrishname = json.load(datasource)["USEN"]

# Local path to dump all art
LOCAL_BASE_PATH = "../data/img/"

##########################
# Obtain all heroes data #

print("\n     - Pulling  heroes art...")
with open("../data/content/fullunits.json", "r") as datasource:
	units = json.load(datasource)

# Remote base location for all heroes data in an Android ADV
HEROES_BASE_PATH = f"{FEH_ASSETS_DIR}/Common/Face/"

# Loop through every hero definition to pull their art
for unit in units:
	# Generate a dictionary of all the images we need and their expected remote names. Enemy non boss units lack most of content
	if "EID_" in unit and not units[unit]["boss"]:
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
		# For resplendents pull extra art (enemies can't be resplendent lol)
		if "PID_" in unit and units[unit]["resplendent"]:
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
			print("              - \"" + truename + "\" missing asset \"" + art["localpath"] + "\", pulling from \"" + art["remotepath"] + "\"", end = ": ", flush = True)
			try:
				with open(HEROES_BASE_PATH + art["remotepath"], "rb+") as tempimage:
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

print("\n     - Pulling spritsheets for passive and weapon refine icons...")
# Get the list of files that are spritelistis for passives
spritesheetdir = f"{FEH_ASSETS_DIR}/Common/UI/"

print("\n     - Cropping individual passive and weapon refine icons...")
# For ease of looping create a big dictionary that specifies the expected local path and the iconid too
icons = {}
# First we loop the passives
allpassives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"] | skills["passives"]["X"] | skills["emblemskills"]
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
		truename = engrishname.get("M" + icon, icon)
		print("          - \"" + truename + "\" missing asset \"" + icons[icon]["localpath"] + "\", cropping from spritesheet with ID " + str(icons[icon]["iconid"]), end = ": ", flush = True)
		# Each spritesheet contains 169 icons, that means they end at +168 index. We divide by 169 and floor to detect which one
		sheet = math.floor(icons[icon]["iconid"] / 169)
		# Once we know which sheet we can calculate the ID within it by substracting the starting index from the one we are using
		idwithin = icons[icon]["iconid"] - (sheet * 169)
		# The starting object is the entire spritesheett, which we copy
		with open(f"{spritesheetdir}/Skill_Passive{str(sheet+1)}.png", "rb+") as tempimage:
			iconimage = Image.open(tempimage)
			# Initially we are cropping all icons to 76 x 76 for ease on some checks
			# We calculate the coordinates of each icon box knowing that each line is 13 icons wide
			line = math.floor(idwithin / 13)
			top = 76 * line
			left = 76 * (idwithin - (line * 13))
			iconimage = iconimage.crop((left, top, left + 76, top + 76))
			# But we crop even further to different sizes depending on the existance of the shiny border or not, for that we get an specific pixel
			# If the color of the pixel at 37,9 is (255, 241, 3, 255) that means we have a shiny border, if at 37,70 is (255, 241, 3, 252) it means emblem skill and we treat it the same
			try:
				# FIXME: FIXME: THIS IS HORRIBLE
				isshiny = (iconimage.getpixel((37, 9)) == (255, 241, 3, 255)) or (iconimage.getpixel((37, 70)) == (82, 25, 25, 252))
				# When that happens we crop and resize less than usual
				if isshiny:
					iconimage = iconimage.crop((0, 0, 75, 76)).resize((48, 48))
				else:
					iconimage = iconimage.crop((6, 6, 6 + 66, 6 + 68)).resize((44, 44))
				iconimage.save(LOCAL_BASE_PATH + icons[icon]["localpath"], 'WEBP', lossless = True, quality = 100, method = 6)
				print("Successful")
			except:
				print("Failed")




#########
# FIXME #: We download character sprites from wiki. Sounds like a pain to compose them for datamine
#########
print("\n     - Downloading character sprites...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	# Enemy units are not summonable anyway so skip them
	if "EID_" in unit and not units[unit]["boss"]:
		continue
	truename = engrishname["M" + unit] + ": " + engrishname["M" + unit.replace("ID", "ID_HONOR")]
	# Each pose has an expected wiki name (Enemy units as NPC only have the attack pose that we use as portrait
	sprites = {
		# Sprites at always with png extension
		".webp": truename + "_Mini_Unit_Ok.png"
	}
	# Only query resplendent art if the hero is actually resplendent
	if engrishname.get(unit.replace("PID", "MPID_VOICE") + "EX01", False):
		sprites = sprites | {
			"_Resplendent.webp": truename + "_Resplendent_Mini_Unit_Idle.png"
	}
	for sprite in sprites:
		if not pathlib.Path("../data/img/sprites/" + unit + sprite).is_file():
			ids.append(unit)
			arts.append([sprite,sprites[sprite]])

# We can only query 50 items every time
offset = 0
while offset < len(arts):
	# Since the actual expected name is in the second position of each art item expand it properly
	expandedart = [name[1] for name in arts[offset:offset+50]]
	# Save all urls in their respective positions
	for i, url in enumerate(utils.obtaintrueurl(expandedart)):
		# Decide on the filename based on sprite and hero ID
		filename = ids[offset:offset+50][i] + arts[offset:offset+50][i][0]
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have '" + filename + "', trying to pull as '" + expandedart[i] + "'", end = ": ")
		# Grab and paste the art
		try:
			response = requests.get(url)
			art = Image.open(io.BytesIO(response.content))
			# We save the hero art as webp attempting the better compression method while being lossless to avoid quality drops
			art.save("../data/img/sprites/" + filename, 'WEBP', lossless = True, quality = 100, method = 6)
			print("Successfully downloaded", end = "\n")
		# If anything went wrong on downloading and parsing the image fall back to an error one
		except:
			print("Failed to download")
	offset += 50

print("\n     - Downloading idle character sprites...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	# Enemy units are not summonable anyway so skip them
	if "EID_" in unit and not units[unit]["boss"]:
		continue
	truename = engrishname["M" + unit] + ": " + engrishname["M" + unit.replace("ID", "ID_HONOR")]
	# Each pose has an expected wiki name (Enemy units as NPC only have the attack pose that we use as portrait
	sprites = {
		# Sprites at always with png extension
		".webp": truename + "_Mini_Unit_Idle.png"
	}
	# Only query resplendent art if the hero is actually resplendent
	if engrishname.get(unit.replace("PID", "MPID_VOICE") + "EX01", False):
		sprites = sprites | {
			"_Resplendent.webp": truename + "_Resplendent_Mini_Unit_Idle.png"
	}
	for sprite in sprites:
		if not pathlib.Path("../data/img/sprites-idle/" + unit + sprite).is_file():
			ids.append(unit)
			arts.append([sprite,sprites[sprite]])

# We can only query 50 items every time
offset = 0
while offset < len(arts):
	# Since the actual expected name is in the second position of each art item expand it properly
	expandedart = [name[1] for name in arts[offset:offset+50]]
	# Save all urls in their respective positions
	for i, url in enumerate(utils.obtaintrueurl(expandedart)):
		# Decide on the filename based on sprite and hero ID
		filename = ids[offset:offset+50][i] + arts[offset:offset+50][i][0]
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have '" + filename + "', trying to pull as '" + expandedart[i] + "'", end = ": ")
		# Grab and paste the art
		try:
			response = requests.get(url)
			art = Image.open(io.BytesIO(response.content))
			# We save the hero art as webp attempting the better compression method while being lossless to avoid quality drops
			art.save("../data/img/sprites-idle/" + filename, 'WEBP', lossless = True, quality = 100, method = 6)
			print("Successfully downloaded", end = "\n")
		# If anything went wrong on downloading and parsing the image fall back to an error one
		except:
			print("Failed to download")
	offset += 50
