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

@app.route('/get_image.png')
def getimage():
	# Create new image
	canvas = Image.new("RGBA", (720, 1280))
	# Open the basic fg and bg images
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
			"weapon": flask.request.args.get('weapon') if flask.request.args.get('weapon') != "None" else None,
			"refine": flask.request.args.get('refine') if flask.request.args.get('refine') != "None" else None,
			"assist": flask.request.args.get('assist') if flask.request.args.get('assist') != "None" else "",
			"special": flask.request.args.get('special') if flask.request.args.get('special') != "None" else "",
			"passiveA": flask.request.args.get('passiveA') if flask.request.args.get('passiveA') != "None" else "",
			"passiveB": flask.request.args.get('passiveB') if flask.request.args.get('passiveB') != "None" else "",
			"passiveC": flask.request.args.get('passiveC') if flask.request.args.get('passiveC') != "None" else "",
			"passiveS": flask.request.args.get('passiveS') if flask.request.args.get('passiveS') != "None" else "",
			"summoner": flask.request.args.get('summoner') if flask.request.args.get('summoner') != "None" else "",
			"blessing": flask.request.args.get('blessing') if flask.request.args.get('blessing') != "None" else "",
			"attire": True if flask.request.args.get('attire') != "Normal" else False
		}
		now = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
		print(now + " - " + str(hero))
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
		canvas.paste(fg, (0, 0), fg)
		# Print the resplendent icon
		if hero["attire"]:
			resplendent = Image.open("../data/img/other/resplendent.png")
			canvas.paste(resplendent, (270, 490), resplendent)
		# Initialize the drawing rectacle and font
		font = ImageFont.truetype("../data/" + config["fontfile"], 35)
		draw = ImageDraw.Draw(canvas)
		# Write the title and name using an horizontally centered anchor to avoid going out of bounds
		draw.text((188, 585), hero["title"], font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))
		draw.text((222, 659), hero["name"], font=font, anchor="mm", stroke_width=3, stroke_fill=(50, 30, 10))
		# First write the static text for each stat (normal anchoring)
		font = ImageFont.truetype("../data/" + config["fontfile"], 25)
		draw.text((115, 805), "HP", font=font, fill="#b1ecfa" if hero["boon"] == "HP" else ("#f0a5b3" if hero["bane"] == "HP" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 854), "Atk", font=font, fill="#b1ecfa" if hero["boon"] == "Atk" else ("#f0a5b3" if hero["bane"] == "Atk" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 903), "Spd", font=font, fill="#b1ecfa" if hero["boon"] == "Spd" else ("#f0a5b3" if hero["bane"] == "Spd" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 953), "Def", font=font, fill="#b1ecfa" if hero["boon"] == "Def" else ("#f0a5b3" if hero["bane"] == "Def" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")
		draw.text((115, 1003), "Res", font=font, fill="#b1ecfa" if hero["boon"] == "Res" else ("#f0a5b3" if hero["bane"] == "Res" and int(hero["merges"]) == 0 else "#ffffff"), stroke_width=3, stroke_fill="#0a2533")

		# Obtain the calculated stats to draw
		stats = utilities.statcalc(heroes[name]["stats"], heroes[name]["growths"], hero["boon"], hero["bane"], int(hero["merges"]), int(hero["flowers"]))
		# We have a couple of stats modifiers based on weapon, summoner support and maybe not completely parsed A/S skills that we must add
		statsmodifier = utilities.weaponmodifiers(hero["weapon"], skills["weapons"][hero["weapon"]] if hero["weapon"] else None, hero["refine"])
		statsmodifier = [x+y for x,y in zip(statsmodifier, utilities.summonerranks[hero["summoner"]] if hero["summoner"] else [0,0,0,0,0])]
		if hero["passiveA"] in skills["passives"]["A"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, skills["passives"]["A"][hero["passiveA"]]["statModifiers"])]
		if hero["passiveS"] in skills["passives"]["S"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, skills["passives"]["S"][hero["passiveS"]]["statModifiers"])]
		if hero["attire"]:
			statsmodifier = [x+y for x,y in zip(statsmodifier, [2, 2, 2, 2, 2])]
		# Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers)
		font = ImageFont.truetype("../data/" + config["fontfile"], 26)
		draw.text((265, 805), str(stats["HP"] + statsmodifier[0]), font=font, anchor="ra", fill="#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 854), str(stats["Atk"] + statsmodifier[1]), font=font, anchor="ra", fill="#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 903), str(stats["Spd"] + statsmodifier[2]), font=font, anchor="ra", fill="#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 953), str(stats["Def"] + statsmodifier[3]), font=font, anchor="ra", fill="#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 1002), str(stats["Res"] + statsmodifier[4]), font=font, anchor="ra", fill="#fffaaf", stroke_width=3, stroke_fill="#0a2533")
		# TODO: SP and HM for now are not customizable
		draw.text((265, 1052), "9999", font=font, anchor="ra", fill="#82f546", stroke_width=3, stroke_fill="#0a2533")
		draw.text((265, 1100), "7000", font=font, anchor="ra", fill="#82f546", stroke_width=3, stroke_fill="#0a2533")
		# Print the move type and weapon type icons
		movetype = Image.open("../data/img/icons/" + heroes[name]["moveType"].lstrip() + "-move.png")
		canvas.paste(movetype, (229, 743), movetype)
		weapontype = Image.open("../data/img/icons/" + heroes[name]["WeaponType"].lstrip() + ".png")
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
			flowericon = Image.open("../data/img/icons/" + heroes[name]["moveType"].lstrip() + "-flower.png")
			canvas.paste(flowericon, (289, 727), flowericon)
			draw.text((345, 742), "+", font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
			draw.text((364, 744), hero["flowers"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Paste the exp indicator
		expindicator = Image.open("../data/img/base/expindicator.png")
		canvas.paste(expindicator, (418, 732) if int(hero["flowers"]) > 0 else (271, 732), expindicator)


		font = ImageFont.truetype("../data/" + config["fontfile"], 23)
		# Print weapon info
		if hero["weapon"]:
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
			draw.text((420, 805), hero["weapon"], font=font, fill="#82f546" if hero["refine"] else "#ffffff", stroke_width=3, stroke_fill="#0a2533")

		# Print assist and special info
		draw.text((420, 853), hero["assist"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		draw.text((420, 903), hero["special"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		# If the passive is not the list we skip it
		if hero["passiveA"] in skills["passives"]["A"]:
			# Check if the icon art is already in the temporal folder for speeding up requests from the wiki
			if (pathlib.Path("../data/img/icons/" + hero["passiveA"].replace(" ", "_").replace("/", "_") + ".png").is_file()):
				art = Image.open("../data/img/icons/" + hero["passiveA"].replace(" ", "_").replace("/", "_") + ".png")
			else:
				# Download, resize and cache the picture
				try:
					response = requests.get(skills["passives"]["A"][hero["passiveA"]]["icon"])
					art = Image.open(io.BytesIO(response.content)).resize((48, 48))
					art.save("../data/img/icons/" + hero["passiveA"].replace(" ", "_").replace("/", "_") + ".png", 'PNG')
				except:
					art = Image.open("../data/img/icons/fallback-skillA.png")
			canvas.paste(art, (369, 943), art)
			draw.text((420, 953), hero["passiveA"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		# If the passive is not the list we skip it
		if hero["passiveB"] in skills["passives"]["B"]:
			# Check if the icon art is already in the temporal folder for speeding up requests from the wiki
			if (pathlib.Path("../data/img/icons/" + hero["passiveB"].replace(" ", "_").replace("/", "_") + ".png").is_file()):
				art = Image.open("../data/img/icons/" + hero["passiveB"].replace(" ", "_").replace("/", "_") + ".png")
			else:
				# Download, resize and cache the picture
				try:
					response = requests.get(skills["passives"]["B"][hero["passiveB"]]["icon"])
					art = Image.open(io.BytesIO(response.content)).resize((46, 46))
					art.save("../data/img/icons/" + hero["passiveB"].replace(" ", "_").replace("/", "_") + ".png", 'PNG')
				except:
					art = Image.open("../data/img/icons/fallback-skillB.png")
			canvas.paste(art, (369, 993), art)
			draw.text((420, 1003), hero["passiveB"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		# If the passive is not the list we skip it
		if hero["passiveC"] in skills["passives"]["C"]:
			# Check if the icon art is already in the temporal folder for speeding up requests from the wiki
			if (pathlib.Path("../data/img/icons/" + hero["passiveC"].replace(" ", "_").replace("/", "_") + ".png").is_file()):
				art = Image.open("../data/img/icons/" + hero["passiveC"].replace(" ", "_").replace("/", "_") + ".png")
			else:
				# Download, resize and cache the picture
				try:
					response = requests.get(skills["passives"]["C"][hero["passiveC"]]["icon"])
					art = Image.open(io.BytesIO(response.content)).resize((48, 48))
					art.save("../data/img/icons/" + hero["passiveC"].replace(" ", "_").replace("/", "_") + ".png", 'PNG')
				except:
					art = Image.open("../data/img/icons/fallback-skillC.png")
			canvas.paste(art, (369, 1043), art)
			draw.text((420, 1053), hero["passiveC"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
		# If the passive is not the list we skip it
		if hero["passiveS"] in skills["passives"]["S"]:
			# Check if the icon art is already in the temporal folder for speeding up requests from the wiki
			if (pathlib.Path("../data/img/icons/" + hero["passiveS"].replace(" ", "_").replace("/", "_") + ".png").is_file()):
				art = Image.open("../data/img/icons/" + hero["passiveS"].replace(" ", "_").replace("/", "_") + ".png")
			else:
				# Download, resize and cache the picture
				try:
					response = requests.get(skills["passives"]["S"][hero["passiveS"]]["icon"])
					art = Image.open(io.BytesIO(response.content)).resize((48, 48))
					art.save("../data/img/icons/" + hero["passiveS"].replace(" ", "_").replace("/", "_") + ".png", 'PNG')
				except:
					art = Image.open("../data/img/icons/fallback-skillS.png")
			canvas.paste(art, (369, 1093), art)
			draw.text((420, 1103), hero["passiveS"], font=font, fill="#ffffff", stroke_width=3, stroke_fill="#0a2533")
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

	# Save the image tp a byte element to return to the browser
	img_io = io.BytesIO()
	canvas.save(img_io, 'PNG')
	img_io.seek(0)

	return flask.send_file(img_io, mimetype='image/png')
