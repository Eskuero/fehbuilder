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

import flask
from PIL import Image, ImageDraw, ImageFont
import io
import json
import pathlib
from datetime import datetime

# Import out external file of utilities
import utilities

app = flask.Flask(__name__)

# Load app config
with open("config.json", "r") as config:
	config = json.load(config)

# Load all heroes data from the json file
with open("../data/fullunits.json", "r") as datasource:
	heroes = json.load(datasource)

# Load all skills data from the json file
with open("../data/fullskills.json", "r") as datasource:
	skills = json.load(datasource)
	allpassives = skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"]

# Load other data from the json file
with open("../data/fullother.json", "r") as datasource:
	other = json.load(datasource)

# Load all languages from the json file
with open("../data/fulllanguages.json", "r") as datasource:
	languages = json.load(datasource)

@app.route('/get_image.png')
def getimage():
	# Create new image
	canvas = Image.new("RGBA", (720, 1280))

	# Get the hero name to draw, we skip entirely if none is provided, it doesn't exist in our data or the request length is unexpectedly long
	name = flask.request.args.get('name')
	if name is not None and name in heroes and len(str(flask.request)) < 1000:
		# Sanitize all the data we got fro the user
		hero = utilities.herosanitization(heroes, skills, languages, other["blessed"], name, flask.request.args)
		# Print the data we will use for logging purposes
		now = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
		print()
		print(now + " - " + str(hero))

		# Initialize the drawing rectacle and font
		font = ImageFont.truetype("../data/" + config["fontfile"], 35)
		draw = ImageDraw.Draw(canvas)

		# Print the background
		bg = utilities.images["other"]["bgsupport"] if hero["summoner"] else utilities.images["other"]["bgnosupport"]
		canvas.paste(bg, (-173, 0))

		# Decide on the filename we will use to save and retrieve this particular hero and pose
		filename = name + ("_Resplendent_" + hero["artstyle"] + ".webp" if hero["attire"] == "Resplendent" and languages[hero["language"]].get(hero["name"].replace("PID", "MPID_VOICE") + "EX01", False) else "_" + hero["artstyle"] + ".webp")
		# Check if the heroes art is already downloaded
		if (pathlib.Path("../data/img/heroes/" + filename).is_file()):
			art = Image.open("../data/img/heroes/" + filename)
		else:
			# Something went wrong opening the art file, fallback to missigno
			art = Image.open("../data/img/base/missigno.webp")
			print("Failed to load art for " + name)
		canvas.paste(art, (-305 + hero["offsetX"], 0 - hero["offsetY"]), art)

		# Paste the foregroud UI
		fg = utilities.images["other"]["fgui"] if hero["appui"] else utilities.images["other"]["fgnoui"]
		canvas.paste(fg, (0, 0), fg)

		# Print the rarity line
		canvas.paste(utilities.images["rarity"][hero["rarity"]], (65, 505), utilities.images["rarity"][hero["rarity"]])
		# Patch the rarity variable to cater to our later needs
		hero["rarity"] = 5 if hero["rarity"] == "Forma" else int(hero["rarity"])

		# Print the resplendent icon
		if hero["attire"] in ["Resplendent", "Stats-Only"]:
			canvas.paste(utilities.images["other"]["resplendent"], (262, 492), utilities.images["other"]["resplendent"])

		# Write the title and name using an horizontally centered anchor to avoid going out of bounds
		title = languages[hero["language"]][hero["name"].replace("PID", "MPID_HONOR")] if "PID_" in hero["name"] else "Enemy"
		draw.text((188, 585), title, font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))
		draw.text((222, 659), languages[hero["language"]]["M" + hero["name"]], font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))

		# Print the artist and actor names, as well as the favorite mark and other minor strings if appui is enabled
		if hero["appui"]:
			font = ImageFont.truetype("../data/" + config["fontfile"], 21)
			# If the hero is truly a resplendent one we might have data for it
			if hero["attire"] == "Resplendent" and languages[hero["language"]].get(hero["name"].replace("PID", "MPID_VOICE") + "EX01", False):
				# Add a fallback to original actor if none is provided because that means they didn't change it
				draw.text((47, 1212), languages[hero["language"]][hero["name"].replace("PID", "MPID_VOICE") + "EX01"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
				draw.text((47, 1241), languages[hero["language"]][hero["name"].replace("PID", "MPID_ILLUST") + "EX01"], font=font, fill="#ffffff",stroke_width=3, stroke_fill="#0a2533")
			else:
				voice = languages[hero["language"]][hero["name"].replace("PID", "MPID_VOICE")] if "PID_" in hero["name"] else ""
				artist = languages[hero["language"]][hero["name"].replace("PID", "MPID_ILLUST")] if "PID_" in hero["name"] else ""
				draw.text((47, 1212), voice, font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
				draw.text((47, 1241), artist, font=font, fill="#ffffff",stroke_width=3, stroke_fill="#0a2533")
			# Print favorite icon
			canvas.paste(utilities.images["favorite"][hero["favorite"]], (3, 229), utilities.images["favorite"][hero["favorite"]])
			# Translate buttons
			font = ImageFont.truetype("../data/" + config["fontfile"], 24)
			draw.text((126, 1175), languages[hero["language"]]["MID_UNIT_INFO_TO_SKILLSET"], font=font, anchor="mm", fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			draw.text((360, 1175), languages[hero["language"]]["MID_UNIT_INFO_TO_SKILLEQUIP"], font=font, anchor="mm", fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			draw.text((594, 1175), languages[hero["language"]]["MID_UNIT_INFO_TO_SKILLLEARN"], font=font, anchor="mm", fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			font = ImageFont.truetype("../data/" + config["fontfile"], 26)
			draw.text((617, 47), languages[hero["language"]]["MID_UNIT_INFO_TO_TALK"], font=font, anchor="mm", fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# First write the static text for each stat (normal anchoring)
		font = ImageFont.truetype("../data/" + config["fontfile"], 25)
		draw.text((115, 805), languages[hero["language"]]["MID_HP"], font=font, fill="#b1ecfa" if hero["boon"] == "HP" else ("#f0a5b3" if hero["bane"] == "HP" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 854), languages[hero["language"]]["MID_ATTACK"], font=font, fill="#b1ecfa" if hero["boon"] == "Atk" else ("#f0a5b3" if hero["bane"] == "Atk" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 903), languages[hero["language"]]["MID_AGILITY"], font=font, fill="#b1ecfa" if hero["boon"] == "Spd" else ("#f0a5b3" if hero["bane"] == "Spd" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 953), languages[hero["language"]]["MID_DEFENSE"], font=font, fill="#b1ecfa" if hero["boon"] == "Def" else ("#f0a5b3" if hero["bane"] == "Def" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 1003), languages[hero["language"]]["MID_RESIST"], font=font, fill="#b1ecfa" if hero["boon"] == "Res" else ("#f0a5b3" if hero["bane"] == "Res" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		font = ImageFont.truetype("../data/" + config["fontfile"], 24)
		draw.text((120, 1051), languages[hero["language"]]["MID_SKILL_POINT"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 1101), languages[hero["language"]]["MID_HEROISM_POINT"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Obtain the calculated stats to draw
		statsmodifier = utilities.statcalc(heroes[name]["stats"], heroes[name]["growths"], hero["rarity"], hero["boon"], hero["bane"], int(hero["merges"]), int(hero["flowers"]))
		# We have a couple of stats modifiers based on weapon, summoner support, attire, bonus unit, visible buffs and maybe not completely parsed A/S skills that we must add
		if hero["weapon"] :
			weaponmodifier = utilities.weaponmodifiers(hero["weapon"], skills["weapons"][hero["weapon"]], hero["refine"], allpassives)
			statsmodifier = [x+y for x,y in zip(statsmodifier, weaponmodifier)]
		if hero["summoner"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, utilities.summonerranks[hero["summoner"]])]
		# Append passives visible stats
		for category in ["A", "B", "C", "S"]:
			if hero["passive" + category]:
				statsmodifier = [x+y for x,y in zip(statsmodifier, allpassives[hero["passive" + category]]["statModifiers"])]
		if hero["attire"] in ["Resplendent", "Stats-Only"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [2, 2, 2, 2, 2])]
		if hero["bonusunit"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [10, 4, 4, 4, 4])]
		if hero["beast"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [0, 2, 0, 0, 0])]
		# Add the normal visible buffs
		statsmodifier = [x+y for x,y in zip(statsmodifier, hero["buffs"])]
		# Calculate the visible stats you get for each allied mythic or legendary
		if hero["allies"] and hero["blessing"]:
			for ally in hero["allies"]:
				# For each hero we add the visible buffs and multiply for the amount of that ally
				statsmodifier = [x + (y*hero["allies"][ally]) for x,y in zip(statsmodifier, other["blessed"][ally]["boosts"])]
		# Clean the stats to avoid overflowing beyond 99 or below 0
		for i in range(len(statsmodifier)):
			statsmodifier[i] = 0 if statsmodifier[i] < 0 else (99 if statsmodifier[i] > 99 else statsmodifier[i])

		# Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers). Also prevent to number from going below 0
		for i in range(5):
			# Decide type of font depending on if we buffer, debuffed or neutral
			numbertype = 2 if hero["buffs"][i] > 0 else (3 if hero["buffs"][i] < 0 else 0);
			# Each stat name is pushed down by 49 pixels with an initial offset of 805
			utilities.printnumbers(canvas, statsmodifier[i], numbertype, 265, 805 + (i * 49) + int(i * 0.3), "end")
		# Print the amount of SP and HM
		numbertype = 4 if hero["sp"] == 9999 else 0;
		utilities.printnumbers(canvas, hero["sp"], numbertype, 265, 1052, "end");
		numbertype = 4 if hero["hm"] == 7000 else 0;
		utilities.printnumbers(canvas, hero["hm"], numbertype, 265, 1100, "end");

		# If we selected an accessory we paste a newer bigger holder and define an offset to push all next items to the right
		offset = 0
		if hero["accessory"]:
			canvas.paste(utilities.images["other"]["accessoryexpand"], (4, 732), utilities.images["other"]["accessoryexpand"])
			canvas.paste(utilities.images["accessory"][hero["accessory"]], (256, 743), utilities.images["accessory"][hero["accessory"]])
			offset += 27
		# Print the move type and weapon type icons
		canvas.paste(utilities.images["movetype"][heroes[name]["moveType"]], (229 if not hero["accessory"] else 223, 743), utilities.images["movetype"][heroes[name]["moveType"]])
		canvas.paste(utilities.images["weapontype"][heroes[name]["WeaponType"]], (20, 742), utilities.images["weapontype"][heroes[name]["WeaponType"]])
		# Print the level string
		font = ImageFont.truetype("../data/" + config["fontfile"], 24)
		draw.text((70, 745), languages[hero["language"]]["MID_LEVEL2"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		# Print the level 40. It was hardcoded previously so we just do this to make sure it doesn't look off side by side with the merge count
		utilities.printnumbers(canvas, 40, 1, 124, 745);

		# If we have merges we add the text next to the level
		if hero["merges"] > 0:
			# Decide type of font depending on if we are fully merged or not
			numbertype = 4 if hero["merges"] == 10 else 1;
			utilities.printnumbers(canvas, "+", numbertype, 163, 748);
			utilities.printnumbers(canvas, hero["merges"], numbertype, 181, 745);
		# If we have flowers we add another box with the number
		if hero["flowers"] > 0:
			canvas.paste(utilities.images["other"]["flowerholder"], (271 + offset, 732), utilities.images["other"]["flowerholder"])
			canvas.paste(utilities.images["flowers"][heroes[name]["moveType"]], (289 + offset, 727), utilities.images["flowers"][heroes[name]["moveType"]])
			utilities.printnumbers(canvas, "+", 1, 345 + offset, 748);
			utilities.printnumbers(canvas, hero["flowers"], 1, 364 + offset, 745);
			offset += 147

		# Paste the exp indicator
		canvas.paste(utilities.images["other"]["expindicator"], (271 + offset, 732), utilities.images["other"]["expindicator"])
		font = ImageFont.truetype("../data/" + config["fontfile"], 24)
		draw.text((308 + offset, 744), languages[hero["language"]]["MID_EXP"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		draw.text((415 + offset, 744), languages[hero["language"]]["MID_UNIT_INFO_EXP_MAX"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		font = ImageFont.truetype("../data/" + config["fontfile"], 24)
		# If the weapon is valid try to print an icon
		if hero["weapon"]:
			# By default we always use the basic weapon icon or the predefined stat boosters ones
			icon = "other/" + hero["refine"] + "-Refine.webp" if hero["refine"] in ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"] else "other/weapon-Refine.webp"
			# If the icon is an special effect we might have to download it
			if hero["refine"] == "Effect" and "Effect" in skills["weapons"][hero["weapon"]]["refines"]:
				# Check if the heroes art is already in the temporal folder
				if not (pathlib.Path("../data/img/icons/" + hero["weapon"] + "-Effect.webp").is_file()):
					# Something went wrong reading the icon (maybe wiki was down while refreshing)
					print("Failed to load special refine icon for " + hero["weapon"])
				else:
					icon = "icons/" + hero["weapon"] + "-Effect.webp"
			weaponicon = Image.open("../data/img/" + icon)
			canvas.paste(weaponicon, (370, 797), weaponicon)
			# Hack Falchion and Missiletain name since we show the user the real internal name for difference but rendering should be clean
			printableweapon = languages[hero["language"]]["M" + hero["weapon"]]
		# If not just print the basic icon
		else:
			printableweapon = "-"
			canvas.paste(utilities.images["other"]["noweapon"], (370, 797), utilities.images["other"]["noweapon"])
		# We always paste the text because it might as well be unarmed and have a "-"
		draw.text((420, 805), printableweapon, font=font, fill="#82f546" if hero["refine"] else "#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Print assist and special info
		draw.text((420, 853), languages[hero["language"]]["M" + hero["assist"]] if hero["assist"] else "-", font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		draw.text((420, 903), languages[hero["language"]]["M" + hero["special"]] if hero["special"] else "-", font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Render all the passives
		for category in utilities.passiverender.keys():
			# If the passive is not the list we skip trying to download an image
			if hero["passive" + category]:
				# Decide on the name of the icon
				iconname = hero["passive" + category] + ".webp"
				# Check if the icon art is already downloaded
				if (pathlib.Path("../data/img/icons/" + iconname).is_file()):
					art = Image.open("../data/img/icons/" + iconname)
					canvas.paste(art, tuple(map(sum, zip(utilities.passiverender[category]["icon"], (-2, -2) if art.size[0] > 44 else (0, 0)))), art)
				else:
					# We failed to read the icon for this skill :(
					print("Failed to load icon for " + hero["passive" + category])
			# We always write the text because it might be a simple "-"
			draw.text(utilities.passiverender[category]["text"], languages[hero["language"]]["M" + hero["passive" + category]] if hero["passive" + category] else "-", font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			# Print the category indicator
			indicator = Image.open("../data/img/other/indicator-skill" + category + ".webp")
			canvas.paste(indicator, utilities.passiverender[category]["indicator"], indicator)

		# X amount to additionally push each icon to the left
		offsetX = 0
		# Detect if we are printing more than three icons (this could happen on duo/blessed/summoner supported allies) so we can resize accordingly
		needsresize = True if hero["blessing"] and hero["summoner"] and hero["name"] in other["duo"] + other["resonant"] else False
		posY = 570 if not needsresize else 595
		posX = 575 if not needsresize else 600
		# If blessed print the icon
		if hero["blessing"]:
			# If the hero is on the list of the blessed ones for that particular blessing it has icon variant defined (otherwise use the normal one)
			variant = other["blessed"].get(hero["name"], {}).get("variant", "normal")
			blessingicon = utilities.images["blessing"][hero["blessing"]-1][variant]
			if needsresize:
				blessingicon = blessingicon.resize((115, 125))
			canvas.paste(blessingicon, (posX, posY), blessingicon)
			# If printed a blessing the next's position icon must go further to the left
			offsetX += 100 if needsresize else 125

		# If is a duo hero print the icon
		if hero["name"] in other["duo"] + other["resonant"]:
			specialtype = "Duo" if hero["name"] in other["duo"] else "Resonance"
			specialicon = utilities.images["other"][specialtype]
			if needsresize:
				specialicon = specialicon.resize((115, 125))
			canvas.paste(specialicon, (posX - offsetX, posY), specialicon)
			# If printed a duo icon the next's position icon must go further to the left
			offsetX += 100 if needsresize else 125
			# If appui is enabled we also print the conversation icon
			if hero["appui"]:
				canvas.paste(utilities.images["other"]["duoconversation"], (3, 322), utilities.images["other"]["duoconversation"])

		# If summoner supported print the icon
		if hero["summoner"]:
			summonericon = utilities.images["summoner"][hero["summoner"]]
			if needsresize:
				summonericon = summonericon.resize((115, 125))
			canvas.paste(summonericon, (posX - offsetX, posY), summonericon)
	else:
		# We arrived here without a proper hero name so paste the basic bg and fg and say bye
		canvas.paste(utilities.images["other"]["bgnosupport"], (-173, 0), utilities.images["other"]["bgnosupport"])
		canvas.paste(utilities.images["other"]["fgui"], (0, 0), utilities.images["other"]["fgui"])

	# We completed all rendering so now we can drop the Alpha channel
	canvas = canvas.convert("RGB")
	# Save the image tp a byte element to return to the browser
	img_io = io.BytesIO()
	canvas.save(img_io, 'PNG')
	img_io.seek(0)

	return flask.send_file(img_io, mimetype='image/png')
