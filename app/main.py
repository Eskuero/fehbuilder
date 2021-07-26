import flask
from PIL import Image, ImageDraw, ImageFont
import requests
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
	# Open the basic bg image
	fg = Image.open("../data/img/base/foreground.png")
	bg = Image.open("../data/img/other/normalbg.png")
	# Paste the background first than anything UI
	canvas.paste(bg, (-173, 0), bg)

	# Get the hero name to draw, we skip entirely if none is provided, it doesn't exist in our data or the request length is unexpectedly long
	name = flask.request.args.get('name')
	if name is not None and name in heroes and len(str(flask.request)) < 1000:
		# Sanitize all the data we got fro the user
		hero = utilities.herosanitization(heroes, skills, languages, name, flask.request.args)
		# Print the data we will use for logging purposes
		now = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
		print()
		print(now + " - " + str(hero))

		# Initialize the drawing rectacle and font
		font = ImageFont.truetype("../data/" + config["fontfile"], 35)
		draw = ImageDraw.Draw(canvas)
		# For any support level we change the bg
		if hero["summoner"]:
			bg = Image.open("../data/img/other/summonerbg.png")
			canvas.paste(bg, (-173, 0))
			# Position for the summoner support icon, we may override this later
			summonerpos = (575, 570)
		# Decide on the filename we will use to save and retrieve this particular hero and pose
		filename = name + ("_Resplendent_" + hero["artstyle"] + ".webp" if hero["attire"] and heroes[name]["resplendentart"][hero["artstyle"]] else "_" + hero["artstyle"] + ".webp")
		# Check if the heroes art is already in the temporal folder for speeding up requests from the wiki
		if (pathlib.Path("../data/img/heroes/" + filename).is_file()):
			art = Image.open("../data/img/heroes/" + filename)
		else:
			# Grab and paste the heroes art in the image
			try:
				# Decide the art to download, even if the user choose resplendent we make sure art for it exists or fallback to the normal instead
				heroart = heroes[name]["resplendentart"][hero["artstyle"]] if hero["attire"] and heroes[name]["resplendentart"][hero["artstyle"]] else heroes[name]["art"][hero["artstyle"]]
				response = requests.get(heroart)
				art = Image.open(io.BytesIO(response.content)).resize((1330, 1596))
				art.save("../data/img/heroes/" + filename, 'WEBP')
			# If anything went wrong on downloading and parsing the image fall back to an error one
			except:
				art = Image.open("../data/img/base/missigno.png")
		canvas.paste(art, (-305, 0 - hero["offset"]), art)
		# Paste the foregroud UI
		if hero["appui"]:
			fg = Image.open("../data/img/base/foreground-ui.png")
		canvas.paste(fg, (0, 0), fg)
		# Print the resplendent icon
		if hero["attire"]:
			resplendent = Image.open("../data/img/other/resplendent.png")
			canvas.paste(resplendent, (262, 492), resplendent)
		# Write the title and name using an horizontally centered anchor to avoid going out of bounds
		title = languages[hero["language"]][hero["name"].replace("PID", "MPID_HONOR")] if "PID_" in hero["name"] else "Enemy"
		draw.text((188, 585), title, font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))
		draw.text((222, 659), languages[hero["language"]]["M" + hero["name"]], font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))
		# Print the artist and actor names, as well as the favorite mark if appui enabled
		if hero["appui"]:
			font = ImageFont.truetype("../data/" + config["fontfile"], 21)
			# If the hero is truly a resplendent one we might have data for it
			if hero["attire"] and heroes[name]["resplendentart"]["Portrait"]:
				# Add a fallback to original actor if none is provided because that means they didn't change it
				draw.text((47, 1212), languages[hero["language"]][hero["name"].replace("PID", "MPID_VOICE") + "EX01"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
				draw.text((47, 1241), languages[hero["language"]][hero["name"].replace("PID", "MPID_ILLUST") + "EX01"], font=font, fill="#ffffff",stroke_width=3, stroke_fill="#0a2533")
			else:
				voice = languages[hero["language"]][hero["name"].replace("PID", "MPID_VOICE")] if "PID_" in hero["name"] else ""
				artist = languages[hero["language"]][hero["name"].replace("PID", "MPID_ILLUST")] if "PID_" in hero["name"] else ""
				draw.text((47, 1212), voice, font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
				draw.text((47, 1241), artist, font=font, fill="#ffffff",stroke_width=3, stroke_fill="#0a2533")
			favorite = Image.open("../data/img/other/favorite_" + hero["favorite"] + ".png")
			canvas.paste(favorite, (3, 229), favorite)
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
		statsmodifier = utilities.statcalc(heroes[name]["stats"], heroes[name]["growths"], hero["boon"], hero["bane"], int(hero["merges"]), int(hero["flowers"]))
		# We have a couple of stats modifiers based on weapon, summoner support, attire, bonus unit, visible buffs and maybe not completely parsed A/S skills that we must add
		if hero["weapon"] :
			weaponmodifier = utilities.weaponmodifiers(hero["weapon"], skills["weapons"][hero["weapon"]], hero["refine"])
			statsmodifier = [x+y for x,y in zip(statsmodifier, weaponmodifier)]
		if hero["summoner"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, utilities.summonerranks[hero["summoner"]])]
		# Append passives visible stats
		for category in ["A", "S"]:
			if hero["passive" + category]:
				statsmodifier = [x+y for x,y in zip(statsmodifier, skills["passives"][category][hero["passive" + category]]["statModifiers"])]
		if hero["attire"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [2, 2, 2, 2, 2])]
		if hero["bonusunit"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [10, 4, 4, 4, 4])]
		# Add the normal visible buffs
		statsmodifier = [x+y for x,y in zip(statsmodifier, hero["buffs"])]
		# Calculate the visible stats you get for each allied mythic or legendary
		if hero["allies"] and hero["blessing"]:
			allies = hero["allies"].split("|")
			for ally in allies:
				ally = ally.split(";")
				# For each hero with a valid blessing we add the visible buffs and multiply for the amount of that ally if a quantity is provided (TODO: This should be moved to the sanitizer)
				if ally[0] in other["blessed"][int(hero["blessing"])-1] and len(ally) == 2:
					statsmodifier = [x+(y*int(ally[1]) if ally[1].isdigit() else 0) for x,y in zip(statsmodifier, other["blessed"][int(hero["blessing"])-1][ally[0]]["boosts"])]
		# Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers)
		font = ImageFont.truetype("../data/" + config["fontfile"], 26)
		draw.text((265, 805), str(statsmodifier[0]), font=font, anchor="ra", fill="#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 854), str(statsmodifier[1]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][1] > 0 else ("#ff506e" if hero["buffs"][1] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 903), str(statsmodifier[2]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][2] > 0 else ("#ff506e" if hero["buffs"][2] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 953), str(statsmodifier[3]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][3] > 0 else ("#ff506e" if hero["buffs"][3] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 1002), str(statsmodifier[4]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][4] > 0 else ("#ff506e" if hero["buffs"][4] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		# Print the amount of SP and HM
		draw.text((265, 1052), str(hero["sp"]), font=font, anchor="ra", fill="#82f546" if hero["sp"] == 9999 else "#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 1100), str(hero["hm"]), font=font, anchor="ra", fill="#82f546" if hero["hm"] == 7000 else "#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		# Print the move type and weapon type icons
		movetype = Image.open("../data/img/other/" + str(heroes[name]["moveType"]) + "-move.png")
		canvas.paste(movetype, (229, 743), movetype)
		weapontype = Image.open("../data/img/other/" + str(heroes[name]["WeaponType"]) + "-weapon.png")
		canvas.paste(weapontype, (20, 742), weapontype)
		# Print the level string
		font = ImageFont.truetype("../data/" + config["fontfile"], 24)
		draw.text((70, 745), languages[hero["language"]]["MID_LEVEL2"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# If we have merges we add the text next to the level
		if hero["merges"] > 0:
			font = ImageFont.truetype("../data/" + config["fontfile"], 25)
			draw.text((165, 742), "+", font=font, fill="#82f546" if hero["merges"] == 10 else "#ffffff", stroke_width=3, stroke_fill="#0a2533")
			draw.text((184, 744), str(hero["merges"]), font=font, fill="#82f546" if hero["merges"] == 10 else "#ffffff", stroke_width=3, stroke_fill="#0a2533")
		# If we have flowers we add another box with the number
		if hero["flowers"] > 0:
			font = ImageFont.truetype("../data/" + config["fontfile"], 25)
			flowerholder = Image.open("../data/img/base/flowerholder.png")
			canvas.paste(flowerholder, (271, 732), flowerholder)
			flowericon = Image.open("../data/img/other/" + str(heroes[name]["moveType"]) + "-flower.png")
			canvas.paste(flowericon, (289, 727), flowericon)
			draw.text((345, 742), "+", font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			draw.text((364, 744), str(hero["flowers"]), font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Paste the exp indicator
		expindicator = Image.open("../data/img/base/expindicator.png")
		canvas.paste(expindicator, (418, 732) if hero["flowers"] > 0 else (271, 732), expindicator)
		font = ImageFont.truetype("../data/" + config["fontfile"], 24)
		draw.text((455, 744) if hero["flowers"] > 0 else (308, 744), languages[hero["language"]]["MID_EXP"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		font = ImageFont.truetype("../data/" + config["fontfile"], 23)
		# If the weapon is valid try to print an icon
		if hero["weapon"]:
			# By default we always use the basic weapon icon or the predefined stat boosters ones
			icon = "other/" + hero["refine"] + "-Refine.png" if hero["refine"] in ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"] else "other/weapon-Refine.png"
			# If the icon is an special effect we might have to download it
			if hero["refine"] == "Effect":
				# Check if the heroes art is already in the temporal folder for speeding up requests from the wiki
				if not (pathlib.Path("../data/img/icons/" + hero["weapon"] + "-Effect.png").is_file()):
					# Download, resize and cache the special effect refine picture
					try:
						response = requests.get(skills["weapons"][hero["weapon"]]["specialIcon"])
						art = Image.open(io.BytesIO(response.content)).resize((44, 44))
						art.save("../data/img/icons/" + hero["weapon"] + "-Effect.png", 'PNG')
						icon = "icons/" + hero["weapon"] + "-Effect.png"
					# Something went wrong downloading the icon (maybe wiki down, maybe invalid data, just report on the log and show the default icon)
					except:
						print("Something went wrong downloading special refine icon for " + hero["weapon"])
				else:
					icon = "icons/" + hero["weapon"] + "-Effect.png"
			weaponicon = Image.open("../data/img/" + icon)
			canvas.paste(weaponicon, (370, 797), weaponicon)
			# Hack Falchion and Missiletain name since we show the user the real internal name for difference but rendering should be clean
			printableweapon = languages[hero["language"]]["M" + hero["weapon"]]
		# If not just print the basic icon
		else:
			printableweapon = "-"
			weaponicon = Image.open("../data/img/other/weapon-Refine.png")
			canvas.paste(weaponicon, (370, 797), weaponicon)
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
				iconname = hero["passive" + category] + ".png"
				# Check if the icon art is already in the temporal folder for speeding up requests from the wiki
				if (pathlib.Path("../data/img/icons/" + iconname).is_file()):
					art = Image.open("../data/img/icons/" + iconname)
				else:
					# Download, resize and cache the picture
					try:
						response = requests.get(skills["passives"][category][hero["passive" + category]]["icon"])
						art = Image.open(io.BytesIO(response.content))
						# If the image size is bigger than 70 these are some tier 4 skills that have shiny borders and their icon must be scaled accordingly
						art = art.resize((48, 48) if art.size[0] > 70 else (44, 44))
						art.save("../data/img/icons/" + iconname, 'PNG')
					except:
						# We failed to download the icon for this skill :(
						print("Failed to download icon for " + hero["passive" + category])
				canvas.paste(art, tuple(map(sum, zip(utilities.passiverender[category]["icon"], (-2, -2) if art.size[0] > 44 else (0, 0)))), art)
			# We always write the text because it might be a simple "-"
			draw.text(utilities.passiverender[category]["text"], languages[hero["language"]]["M" + hero["passive" + category]] if hero["passive" + category] else "-", font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			# Print the category indicator
			indicator = Image.open("../data/img/other/indicator-skill" + category + ".png")
			canvas.paste(indicator, utilities.passiverender[category]["indicator"], indicator)

		# If blessed print the icon
		if hero["blessing"]:
			blessingicon = Image.open("../data/img/other/" + hero["blessing"] + "-Blessing.png")
			canvas.paste(blessingicon, (575, 570), blessingicon)
			# If whe printed a blessing the summoner support position icon must go further to the left
			summonerpos = (450, 570)
		# If summoner supported print the icon
		if hero["summoner"]:
			summonericon = Image.open("../data/img/other/Support-" + hero["summoner"] + ".png")
			canvas.paste(summonericon, summonerpos, summonericon)
	else:
		# We arrived here without a proper hero name so paste the foregroud UI and say bye
		canvas.paste(fg, (0, 0), fg)

	# We completed all rendering so now we can drop the Alpha channel
	canvas = canvas.convert("RGB")
	# Save the image tp a byte element to return to the browser
	img_io = io.BytesIO()
	canvas.save(img_io, 'PNG')
	img_io.seek(0)

	return flask.send_file(img_io, mimetype='image/png')
