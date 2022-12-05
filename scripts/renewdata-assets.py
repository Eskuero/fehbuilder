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
import utils
import requests
import io
from PIL import Image

# Obtain all heroes
with open("../data/content/fullunits.json", "r") as datasource:
	units = json.load(datasource)

# Obtain all translations into english to get the defined names
with open("../data/languages/fulllanguages.json", "r") as datasource:
	engrishname = json.load(datasource)["USEN"]

# Obtain all skills to download icons
with open("../data/content/fullskills.json", "r") as datasource:
	skills = json.load(datasource)

print("\n       - Downloading skills icons...")
# Obtain the whole list of icons for the passives in case we hit an old skill/passive that doesn't follow expected rules (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=TagID,Icon&where=Scategory+in+(%27passivea%27,%27passiveb%27,%27passivec%27,%27sacredseal%27)+OR+RefinePath=%27skill1%27&limit=max&offset=0&format=json)
params = dict(
	action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
	tables = 'Skills',
	fields = "TagID,Icon",
	where = "Scategory in ('passivea', 'passiveb', 'passivec', 'sacredseal') OR RefinePath = 'skill1'"
)
# Store a relation of TagID to Icon for each skill
passiveicons = {
	entry["TagID"]: entry["Icon"]
	for entry in [entry["title"] for entry in utils.retrieveapidata(params)]
}

# Split them in different lists to later be able to query by index
ids = []
icons = []
# We are only interested in the weapons (with refined effects) and skills SIDs that are not downloaded yet. We also add a expected icon name to speed up things
for weapon in [weapon for weapon in [weapon for weapon in skills["weapons"] if skills["weapons"][weapon].get("refines", {}).get("Effect", False)] if not pathlib.Path("../data/img/icons/" + weapon + "-Effect.webp").is_file()]:
	ids.append(weapon)
	icons.append(engrishname["M" + weapon] + "_W.png")

for passive in [passive for passive in skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"] if not pathlib.Path("../data/img/icons/" + passive + ".webp").is_file()]:
	ids.append(passive)
	icons.append(engrishname["M" + passive] + ".png")

# We can only query 50 items every time
offset = 0
while offset < len(icons):
	# Save all urls in their respective positions
	for i, url in enumerate(utils.obtaintrueurl(icons[offset:offset+50])):
		# If url failed to generate by using the expected filename try grabbing it from the cargo table whenever available
		if not url:
			# Get matching substrings from the cargotables
			matches = [val for key, val in passiveicons.items() if ids[offset:offset+50][i] in key]
			if len(matches) > 0:
				print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " falling back to wiki cargo table for icon name")
				url = utils.obtaintrueurl([matches[0]])[0]
		# Decide on the filename based on the type of expect icon
		filename = ids[offset:offset+50][i] + ("-Effect.webp" if "_W.png" in icons[offset:offset+50][i] else ".webp")
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have " + filename, end = ": ")
		# Grab and paste the icons
		try:
			response = requests.get(url)
			art = Image.open(io.BytesIO(response.content))
			art = art.resize((48, 48) if art.size[0] > 70 else (44, 44))
			# We save the icons as webp attempting the better compression method while being lossless to avoid quality drops
			art.save("../data/img/icons/" + filename, 'WEBP', lossless = True, quality = 100, method = 6)
			print("Successfully downloaded", end = "\n")
		# If anything went wrong on downloading and parsing the image fall back to an error one
		except:
			print("Failed to download")
			print("Tried url: " + str(url), end = "\n")
	offset += 50

print("\n       - Downloading character art...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	truename = engrishname["M" + unit] + ((": " + engrishname[unit.replace("PID", "MPID_HONOR")]) if "PID_" in unit else "")
	# Each pose has an expected wiki name (Enemy units as NPC only have the attack pose that we use as portrait
	if "EID_" in unit and not units[unit]["boss"]:
		basenames = {
			# Enemy NPCs are uploaded as .pngs for whatever reason
			"_Portrait.webp": truename + "_BtlFace.png",
		}
	# Everyone else has at least four positions
	else:
		basenames = {
			# Friend units have webp arts
			"_Portrait.webp": truename + "_Face.webp",
			"_Attack.webp": truename + "_BtlFace.webp",
			"_Special.webp": truename + "_BtlFace_C.webp",
			"_Damage.webp": truename + "_BtlFace_D.webp"
		}
	# Only query resplendent art if the hero is actually resplendent
	if engrishname.get(unit.replace("PID", "MPID_VOICE") + "EX01", False):
		basenames = basenames | {
		"_Resplendent_Portrait.webp": truename + "_Resplendent_Face.webp",
		"_Resplendent_Attack.webp": truename + "_Resplendent_BtlFace.webp",
		"_Resplendent_Special.webp": truename + "_Resplendent_BtlFace_C.webp",
		"_Resplendent_Damage.webp": truename + "_Resplendent_BtlFace_D.webp"
	}
	for basename in basenames:
		if not pathlib.Path("../data/img/heroes/" + unit + basename).is_file():
			ids.append(unit)
			arts.append([basename,basenames[basename]])

# We can only query 50 items every time
offset = 0
while offset < len(arts):
	# Since the actual expected name is in the second position of each art item expand it properly
	expandedart = [name[1] for name in arts[offset:offset+50]]
	# Save all urls in their respective positions
	for i, url in enumerate(utils.obtaintrueurl(expandedart)):
		# Decide on the filename based on basename and hero ID
		filename = ids[offset:offset+50][i] + arts[offset:offset+50][i][0]
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have " + filename, end = ": ")
		# Grab and paste the art
		try:
			response = requests.get(url)
			art = Image.open(io.BytesIO(response.content)).resize((1330, 1596))
			# We save the hero art as webp attempting the better compression method while being lossless to avoid quality drops
			art.save("../data/img/heroes/" + filename, 'WEBP')
			print("Successfully downloaded", end = "\n")
		# If anything went wrong on downloading and parsing the image fall back to an error one
		except:
			print("Failed to download")
			print("Tried url: " + str(url), end = "\n")
	offset += 50

print("\n       - Downloading character sprites...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	# Enemy units are not summonable anyway so skip them
	if "EID_" in unit and not units[unit]["boss"]:
		continue
	truename = engrishname["M" + unit] + ((": " + engrishname[unit.replace("PID", "MPID_HONOR")]) if "PID_" in unit else "")
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
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have " + filename, end = ": ")
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
			print("Tried url: " + str(url), end = "\n")
	offset += 50

print("\n       - Downloading idle character sprites...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	# Enemy units are not summonable anyway so skip them
	if "EID_" in unit and not units[unit]["boss"]:
		continue
	truename = engrishname["M" + unit] + ((": " + engrishname[unit.replace("PID", "MPID_HONOR")]) if "PID_" in unit else "")
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
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have " + filename, end = ": ")
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
			print("Tried url: " + str(url), end = "\n")
	offset += 50

print("\n       - Downloading character faces for summon simulator...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	# Enemy units are not summonable anyway so skip them
	if "EID_" in unit and not units[unit]["boss"]:
		continue
	truename = engrishname["M" + unit] + ((": " + engrishname[unit.replace("PID", "MPID_HONOR")]) if "PID_" in unit else "")
	# Each pose has an expected wiki name (Enemy units as NPC only have the attack pose that we use as portrait
	faces = {
		".webp": truename + "_Face_FC.webp"
	}
	# Only query resplendent art if the hero is actually resplendent
	if engrishname.get(unit.replace("PID", "MPID_VOICE") + "EX01", False):
		faces = faces | {
			"_Resplendent.webp": truename + "_Resplendent_Face_FC.webp"
	}
	for face in faces:
		if not pathlib.Path("../data/img/faces/" + unit + face).is_file():
			ids.append(unit)
			arts.append([face,faces[face]])

# We can only query 50 items every time
offset = 0
while offset < len(arts):
	# Since the actual expected name is in the second position of each art item expand it properly
	expandedart = [name[1] for name in arts[offset:offset+50]]
	# Save all urls in their respective positions
	for i, url in enumerate(utils.obtaintrueurl(expandedart)):
		# Decide on the filename based on face and hero ID
		filename = ids[offset:offset+50][i] + arts[offset:offset+50][i][0]
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have " + filename, end = ": ")
		# Grab and paste the art
		try:
			response = requests.get(url)
			art = Image.open(io.BytesIO(response.content)).resize((50, 50))
			# We save the hero art as webp attempting the better compression method while being lossless to avoid quality drops
			art.save("../data/img/faces/" + filename, 'WEBP', lossless = True, quality = 100, method = 6)
			print("Successfully downloaded", end = "\n")
		# If anything went wrong on downloading and parsing the image fall back to an error one
		except:
			print("Failed to download")
			print("Tried url: " + str(url), end = "\n")
	offset += 50

print("\n       - Downloading character faces for tier list generator...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	# Enemy units are not summonable anyway so skip them
	if "EID_" in unit and not units[unit]["boss"]:
		continue
	truename = engrishname["M" + unit] + ((": " + engrishname[unit.replace("PID", "MPID_HONOR")]) if "PID_" in unit else "")
	# Each pose has an expected wiki name (Enemy units as NPC only have the attack pose that we use as portrait
	faces = {
		".webp": truename + "_Face_FC.webp"
	}
	# Only query resplendent art if the hero is actually resplendent
	if engrishname.get(unit.replace("PID", "MPID_VOICE") + "EX01", False):
		faces = faces | {
			"_Resplendent.webp": truename + "_Resplendent_Face_FC.webp"
	}
	for face in faces:
		if not pathlib.Path("../data/img/hd-faces/" + unit + face).is_file():
			ids.append(unit)
			arts.append([face,faces[face]])

# We can only query 50 items every time
offset = 0
while offset < len(arts):
	# Since the actual expected name is in the second position of each art item expand it properly
	expandedart = [name[1] for name in arts[offset:offset+50]]
	# Save all urls in their respective positions
	for i, url in enumerate(utils.obtaintrueurl(expandedart)):
		# Decide on the filename based on face and hero ID
		filename = ids[offset:offset+50][i] + arts[offset:offset+50][i][0]
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have " + filename, end = ": ")
		# Grab and paste the art
		try:
			response = requests.get(url)
			art = Image.open(io.BytesIO(response.content)).resize((100, 100))
			# We save the hero art as webp attempting the better compression method while being lossless to avoid quality drops
			art.save("../data/img/hd-faces/" + filename, 'WEBP', lossless = True, quality = 100, method = 6)
			print("Successfully downloaded", end = "\n")
		# If anything went wrong on downloading and parsing the image fall back to an error one
		except:
			print("Failed to download")
			print("Tried url: " + str(url), end = "\n")
	offset += 50

print("\n       - Downloading character faces for condensed template...")
# Split them in different lists to later be able to query by index
ids = []
arts = []
for unit in units:
	truename = engrishname["M" + unit] + ((": " + engrishname[unit.replace("PID", "MPID_HONOR")]) if "PID_" in unit else "")
	# Each pose has an expected wiki name (Enemy units as NPC only have the attack pose
	if "EID_" in unit and not units[unit]["boss"]:
		faces = {
			# Enemy NPCs are uploaded as .pngs for whatever reason
			"_Attack.webp": truename + "_BtlFace_BU.webp",
		}
	else:
		faces = {
			"_Attack.webp": truename + "_BtlFace_BU.webp",
			"_Damage.webp": truename + "_BtlFace_BU_D.webp"
		}
	# Only query resplendent art if the hero is actually resplendent
	if engrishname.get(unit.replace("PID", "MPID_VOICE") + "EX01", False):
		faces = faces | {
			"_Resplendent_Attack.webp": truename + "_Resplendent_BtlFace_BU.webp",
			"_Resplendent_Damage.webp": truename + "_Resplendent_BtlFace_BU_D.webp"
	}
	for face in faces:
		if not pathlib.Path("../data/img/condensed-faces/" + unit + face).is_file():
			ids.append(unit)
			arts.append([face,faces[face]])

# We can only query 50 items every time
offset = 0
while offset < len(arts):
	# Since the actual expected name is in the second position of each art item expand it properly
	expandedart = [name[1] for name in arts[offset:offset+50]]
	# Save all urls in their respective positions
	for i, url in enumerate(utils.obtaintrueurl(expandedart)):
		# Decide on the filename based on face and hero ID
		filename = ids[offset:offset+50][i] + arts[offset:offset+50][i][0]
		print("              - " + engrishname["M" + ids[offset:offset+50][i]] + " doesn't have " + filename, end = ": ")
		# Grab and paste the art
		try:
			response = requests.get(url)
			art = Image.open(io.BytesIO(response.content)).resize((321, 202))
			# We save the hero art as webp attempting the better compression method while being lossless to avoid quality drops
			art.save("../data/img/condensed-faces/" + filename, 'WEBP', lossless = True, quality = 100, method = 6)
			print("Successfully downloaded", end = "\n")
		# If anything went wrong on downloading and parsing the image fall back to an error one
		except:
			print("Failed to download")
			print("Tried url: " + str(url), end = "\n")
	offset += 50
