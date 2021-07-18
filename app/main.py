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
with open("../data/units.json", "r") as datasource:
	heroes = json.load(datasource)

# Load all skills data from the json file
with open("../data/skills.json", "r") as datasource:
	skills = json.load(datasource)

# Load other data from the json file
with open("../data/other.json", "r") as datasource:
	other = json.load(datasource)

@app.route('/get_image.png')
def getimage():
	# Create new image
	canvas = Image.new("RGBA", (720, 1280))
	# Open the basic bg image
	fg = Image.open("../data/img/base/foreground.png")
	bg = Image.open("../data/img/other/normalbg.png")
	# Paste the background first than anything UI
	canvas.paste(bg, (-173, 0), bg)

	# Get the hero name to draw, we skip entirely if none is provided
	name = flask.request.args.get('name')
	if name is not None and name in heroes:
		# Populate a dictionary with all the data we got
		hero = {
			"name": name.split(":")[0],
			"title": name.split(":")[1].lstrip() if ":" in name else "Enemy",
			"boon": flask.request.args.get('boon') if flask.request.args.get('boon') != "None" else None,
			"bane": flask.request.args.get('bane') if flask.request.args.get('bane') != "None" else None,
			"merges": flask.request.args.get('merges') or 0,
			"flowers": flask.request.args.get('flowers') or 0,
			"weapon": flask.request.args.get('weapon') if flask.request.args.get('weapon') in skills["weapons"] else "-",
			"refine": flask.request.args.get('refine') if flask.request.args.get('refine') != "None" else None,
			"assist": flask.request.args.get('assist') if flask.request.args.get('assist') in skills["assists"] else "-",
			"special": flask.request.args.get('special') if flask.request.args.get('special') in skills["specials"] else "-",
			"passiveA": flask.request.args.get('passiveA') if flask.request.args.get('passiveA') in skills["passives"]["A"] else "-",
			"passiveB": flask.request.args.get('passiveB') if flask.request.args.get('passiveB') in skills["passives"]["B"] else "-",
			"passiveC": flask.request.args.get('passiveC') if flask.request.args.get('passiveC') in skills["passives"]["C"] else "-",
			"passiveS": flask.request.args.get('passiveS') if flask.request.args.get('passiveS') in skills["passives"]["S"] else "-",
			"summoner": flask.request.args.get('summoner') if flask.request.args.get('summoner') != "None" else "",
			"blessing": flask.request.args.get('blessing') if flask.request.args.get('blessing') != "None" else "",
			"attire": True if flask.request.args.get('attire') != "Normal" else False,
			"bonusunit": True if flask.request.args.get('bonusunit') == "yes" else False,
			"allies": flask.request.args.get('allies') if flask.request.args.get('allies') != "" else False,
			"buffs": flask.request.args.get('buffs') if flask.request.args.get('buffs') else False,
			"sp": flask.request.args.get('sp') if flask.request.args.get('sp') else "9999",
			"hm": flask.request.args.get('hm') if flask.request.args.get('hm') else "7000",
			"appui": False if flask.request.args.get('appui') == "false" else True
		}
		now = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
		print(now + " - " + str(hero))
		# Make sure we received a proper string of buffs as expected
		if len(flask.request.args.get('buffs').split(";")) == 4:
			try:
				hero["buffs"] = [0] + [int(x) for x in flask.request.args.get('buffs').split(";")]
			except:
				print("Received invalid buff string (" + flask.request.args.get('buffs') + ") so we default to 0 to everything")
				hero["buffs"] = [0, 0, 0, 0, 0]
		# Initialize the drawing rectacle and font
		font = ImageFont.truetype("../data/" + config["fontfile"], 35)
		draw = ImageDraw.Draw(canvas)
		# For any support level we change the bg
		if hero["summoner"]:
			bg = Image.open("../data/img/other/summonerbg.png")
			canvas.paste(bg, (-173, 0))
			# Position for the summoner support icon, we may override this later
			summonerpos = (575, 570)
		# Decide the art to print, even if the user choose resplendent we make sure art for it exists
		heroart = heroes[name]["resplendent"] if hero["attire"] and heroes[name]["resplendent"] else heroes[name]["frontArt"]
		# Check if the heroes art is already in the temporal folder for speeding up requests from the wiki
		if (pathlib.Path("../data/img/heroes/" + name + ("_Resplendent.webp" if hero["attire"] and heroes[name]["resplendent"] else ".webp")).is_file()):
			art = Image.open("../data/img/heroes/" + name + ("_Resplendent.webp" if hero["attire"] and heroes[name]["resplendent"] else ".webp"))
		else:
			# Grab and paste the heroes art in the image
			try:
				response = requests.get(heroart)
				art = Image.open(io.BytesIO(response.content)).resize((1330, 1596))
				art.save("../data/img/heroes/" + name + ("_Resplendent.webp" if hero["attire"] and heroes[name]["resplendent"] else ".webp"), 'WEBP')
			# If anything went wrong on downloading and parsing the image fall back to an error one
			except:
				art = Image.open("../data/img/base/missigno.png")
		canvas.paste(art, (-305, 0), art)
		# Paste the foregroud UI
		if hero["appui"]:
			fg = Image.open("../data/img/base/foreground-ui.png")
		canvas.paste(fg, (0, 0), fg)
		# Print the resplendent icon
		if hero["attire"]:
			resplendent = Image.open("../data/img/other/resplendent.png")
			canvas.paste(resplendent, (262, 492), resplendent)
		# Write the title and name using an horizontally centered anchor to avoid going out of bounds
		draw.text((188, 585), hero["title"], font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))
		draw.text((222, 659), hero["name"], font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))
		# Print the artist and actor names if appui enabled
		if hero["appui"]:
			font = ImageFont.truetype("../data/" + config["fontfile"], 21)
			# If the hero is truly a resplendent one we might have data for it
			if hero["attire"] and heroes[name]["resplendent"]:
				# Add a fallback to original actor if none is provided because that means they didn't change it
				draw.text((47, 1212), heroes[name]["actorresplendent"] if heroes[name]["actorresplendent"] != "" else heroes[name]["actor"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
				draw.text((47, 1241), heroes[name]["artistresplendent"], font=font, fill="#ffffff",stroke_width=3, stroke_fill="#0a2533")
			else:
				draw.text((47, 1212), heroes[name]["actor"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
				draw.text((47, 1241), heroes[name]["artist"], font=font, fill="#ffffff",stroke_width=3, stroke_fill="#0a2533")
		# First write the static text for each stat (normal anchoring)
		font = ImageFont.truetype("../data/" + config["fontfile"], 25)
		draw.text((115, 805), "HP", font=font, fill="#b1ecfa" if hero["boon"] == "HP" else ("#f0a5b3" if hero["bane"] == "HP" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 854), "Atk", font=font, fill="#b1ecfa" if hero["boon"] == "Atk" else ("#f0a5b3" if hero["bane"] == "Atk" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 903), "Spd", font=font, fill="#b1ecfa" if hero["boon"] == "Spd" else ("#f0a5b3" if hero["bane"] == "Spd" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 953), "Def", font=font, fill="#b1ecfa" if hero["boon"] == "Def" else ("#f0a5b3" if hero["bane"] == "Def" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 1003), "Res", font=font, fill="#b1ecfa" if hero["boon"] == "Res" else ("#f0a5b3" if hero["bane"] == "Res" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")

		# Obtain the calculated stats to draw
		statsmodifier = utilities.statcalc(heroes[name]["stats"], heroes[name]["growths"], hero["boon"], hero["bane"], int(hero["merges"]), int(hero["flowers"]))
		# We have a couple of stats modifiers based on weapon, summoner support, attire, bonus unit, visible buffs and maybe not completely parsed A/S skills that we must add
		if hero["weapon"] in skills["weapons"]:
			weaponmodifier = utilities.weaponmodifiers(hero["weapon"], skills["weapons"][hero["weapon"]] if hero["weapon"] else None, hero["refine"])
			statsmodifier = [x+y for x,y in zip(statsmodifier, weaponmodifier)]
		statsmodifier = [x+y for x,y in zip(statsmodifier, utilities.summonerranks[hero["summoner"]] if hero["summoner"] else [0,0,0,0,0])]
		if hero["passiveA"] in skills["passives"]["A"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, skills["passives"]["A"][hero["passiveA"]]["statModifiers"])]
		if hero["passiveS"] in skills["passives"]["S"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, skills["passives"]["S"][hero["passiveS"]]["statModifiers"])]
		if hero["attire"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [2, 2, 2, 2, 2])]
		if hero["bonusunit"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [10, 4, 4, 4, 4])]
		statsmodifier = [x+y for x,y in zip(statsmodifier, hero["buffs"])]
		# Calculate the visible buffs you get for each allied mythic or legendary
		if hero["allies"] and hero["blessing"] in ["Dark", "Light", "Anima", "Astra", "Fire", "Water", "Earth", "Wind"]:
			allies = hero["allies"].split("|")
			for ally in allies:
				ally = ally.split(";")
				# For each hero with a valid blessing we add the visible buffs and multiply for the amount of that ally
				if ally[0] in other["blessed"][hero["blessing"]]:
					statsmodifier = [x+(y*int(ally[1])) for x,y in zip(statsmodifier, other["blessed"][hero["blessing"]][ally[0]])]
		# Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers)
		font = ImageFont.truetype("../data/" + config["fontfile"], 26)
		draw.text((265, 805), str(statsmodifier[0]), font=font, anchor="ra", fill="#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 854), str(statsmodifier[1]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][1] > 0 else ("#ff506e" if hero["buffs"][1] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 903), str(statsmodifier[2]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][2] > 0 else ("#ff506e" if hero["buffs"][2] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 953), str(statsmodifier[3]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][3] > 0 else ("#ff506e" if hero["buffs"][3] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 1002), str(statsmodifier[4]), font=font, anchor="ra", fill="#64e6f0" if hero["buffs"][4] > 0 else ("#ff506e" if hero["buffs"][4] < 0 else "#fffaaf"), stroke_width=3, stroke_fill="#0a2533")
		# Print the amount of SP and HM
		draw.text((265, 1052), hero["sp"], font=font, anchor="ra", fill="#82f546" if hero["sp"] == "9999" else "#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 1100), hero["hm"], font=font, anchor="ra", fill="#82f546" if hero["hm"] == "7000" else "#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		# Print the move type and weapon type icons
		movetype = Image.open("../data/img/other/" + heroes[name]["moveType"].lstrip() + "-move.png")
		canvas.paste(movetype, (229, 743), movetype)
		weapontype = Image.open("../data/img/other/" + heroes[name]["WeaponType"].lstrip() + "-weapon.png")
		canvas.paste(weapontype, (20, 742), weapontype)

		# If we have merges we add the text next to the level
		if int(hero["merges"]) > 0:
			font = ImageFont.truetype("../data/" + config["fontfile"], 25)
			draw.text((165, 742), "+", font=font, fill="#82f546" if hero["merges"] == "10" else "#ffffff", stroke_width=3, stroke_fill="#0a2533")
			draw.text((184, 744), hero["merges"], font=font, fill="#82f546" if hero["merges"] == "10" else "#ffffff", stroke_width=3, stroke_fill="#0a2533")
		# If we have flowers we add another box with the number
		if int(hero["flowers"]) > 0:
			font = ImageFont.truetype("../data/" + config["fontfile"], 25)
			flowerholder = Image.open("../data/img/base/flowerholder.png")
			canvas.paste(flowerholder, (271, 732), flowerholder)
			flowericon = Image.open("../data/img/other/" + heroes[name]["moveType"].lstrip() + "-flower.png")
			canvas.paste(flowericon, (289, 727), flowericon)
			draw.text((345, 742), "+", font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			draw.text((364, 744), hero["flowers"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Paste the exp indicator
		expindicator = Image.open("../data/img/base/expindicator.png")
		canvas.paste(expindicator, (418, 732) if int(hero["flowers"]) > 0 else (271, 732), expindicator)

		font = ImageFont.truetype("../data/" + config["fontfile"], 23)
		# If the weapon is valid try to print an icon
		if hero["weapon"] in skills["weapons"]:
			# By default we always use the basic weapon icon or the predefined stat boosters ones
			icon = hero["refine"] + "-Refine.png" if hero["refine"] in ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"] else "weapon-Refine.png"
			# If the icon is an special effect we might have to download it
			if hero["refine"] == "Effect":
				# Check if the heroes art is already in the temporal folder for speeding up requests from the wiki
				if not (pathlib.Path("../data/img/icons/" + hero["weapon"] + "-Effect.png").is_file()):
					# Download, resize and cache the special effect refine picture
					response = requests.get(skills["weapons"][hero["weapon"]]["specialIcon"])
					art = Image.open(io.BytesIO(response.content)).resize((44, 44))
					art.save("../data/img/icons/" + hero["weapon"] + "-Effect.png", 'PNG')
				icon = hero["weapon"] + "-Effect.png"
			weaponicon = Image.open("../data/img/icons/" + icon)
			canvas.paste(weaponicon, (370, 797), weaponicon)
			# Hack Falchion name since we show the user the real name but display should be the same
			if "Falchion (" in hero["weapon"]:
				hero["weapon"] = "Falchion"
		# If not just print the basic icon
		else:
			weaponicon = Image.open("../data/img/icons/weapon-Refine.png")
			canvas.paste(weaponicon, (370, 797), weaponicon)
		# We always paste the text because it might as well be unarmed and have a "-"
		draw.text((420, 805), hero["weapon"], font=font, fill="#82f546" if hero["refine"] else "#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Print assist and special info
		draw.text((420, 853), hero["assist"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		draw.text((420, 903), hero["special"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Render all the passives
		for category in utilities.passiverender.keys():
			# If the passive is not the list we skip trying to download an image
			if hero["passive" + category] in skills["passives"][category]:
				# Check if the icon art is already in the temporal folder for speeding up requests from the wiki
				if (pathlib.Path("../data/img/icons/" + hero["passive" + category].replace(" ", "_").replace("/", "_") + ".png").is_file()):
					art = Image.open("../data/img/icons/" + hero["passive" + category].replace(" ", "_").replace("/", "_") + ".png")
				else:
					# Download, resize and cache the picture
					try:
						response = requests.get(skills["passives"][category][hero["passive" + category]]["icon"])
						art = Image.open(io.BytesIO(response.content)).resize((44, 44))
						art.save("../data/img/icons/" + hero["passive" + category].replace(" ", "_").replace("/", "_") + ".png", 'PNG')
					except:
						# We failed to download the icon for this skill :(
						print("Failed to download icon for " + hero["passive" + category])
				canvas.paste(art, utilities.passiverender[category]["icon"], art)
			# We always write the text because it might be a simple "-"
			draw.text(utilities.passiverender[category]["text"], hero["passive" + category], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			# Print the category indicator
			indicator = Image.open("../data/img/other/indicator-skill" + category + ".png")
			canvas.paste(indicator, utilities.passiverender[category]["indicator"], indicator)

		# If the blessing is not valid we skip it
		if hero["blessing"] in ["Dark", "Light", "Anima", "Astra", "Fire", "Water", "Earth", "Wind"]:
			blessingicon = Image.open("../data/img/other/" + hero["blessing"] + "-Blessing.png")
			canvas.paste(blessingicon, (575, 570), blessingicon)
			# If whe printed a blessing the summoner support position icon must go further to the left
			summonerpos = (450, 570)
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
