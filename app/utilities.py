import json
import math
from PIL import Image

def herosanitization(heroes, skills, languages, blessed, name, args):
	# Hero request squeleton definition
	hero = {
		"name": False, "rarity": False, "boon": False, "bane": False, "merges": False, "flowers": False, "beast": False, "weapon": False, "refine": False, "assist": False, "special": False, "passiveA": False, "passiveB": False, "passiveC": False, "passiveS": False, "summoner": False, "blessing": False, "attire": False, "bonusunit": False, "allies": False, "buffs": False, "sp": False, "hm": False, "artstyle": False, "offsetY": False, "offsetX": False, "favorite": False, "accessory": False, "language": False, "appui": False
	}
	for prop in hero:
		value = args.get(prop)
		if prop == "name":
			hero[prop] = value
		# Rarities are valid within a set amount of values
		elif prop == "rarity":
			hero[prop] = value if value in ["1", "2", "3", "4", "5", "Forma"] else "5"
		# Banes and boons are valid within a set amount of values
		elif prop in ["boon", "bane"]:
			hero[prop] = value if value in ["HP", "Atk", "Spd", "Def", "Res"] else None
		# If merges are not provided default to 0, if provided but not a valid digit default to 0, if valid but above 10 default to 10, anything else should be fine
		elif prop == "merges":
			hero[prop] = 0 if not value else (0 if not value.isdigit() else (10 if int(value) > 10 else int(value)))
		# If flowers are not provided default to 0, if provided but not a valid digit default to 0, if valid but above 20 default to 20, anything else should be fine
		elif prop == "flowers":
			hero[prop] = 0 if not value else (0 if not value.isdigit() else (20 if int(value) > 20 else int(value)))
		# Transformed beast can only be yes or no
		elif prop == "beast":
			hero[prop] = True if value == "yes" else False
		# Weapon must exist in our data otherwise we don't print it
		elif prop == "weapon":
			hero[prop] = value if value in skills["weapons"] else False
		# Refine can only be from a certain set
		elif prop == "refine":
			hero[prop] = value if value in ["Effect", "Atk", "Spd", "Def", "Res", "Dazzling", "Wrathful"] else None
		# Assists and specials must exist in our data otherwise we don't print it
		elif prop in ["assist", "special"]:
			hero[prop] = value if value in skills[prop + "s"] else False
		# Passives must exist in our data otherwise we don't print it
		elif prop in ["passiveA", "passiveB", "passiveC", "passiveS"]:
			hero[prop] = value if value in skills["passives"]["A"] | skills["passives"]["B"] | skills["passives"]["C"] | skills["passives"]["S"] else False
		# Summoner support rank can only be of C, B, A or S
		elif prop == "summoner":
			hero[prop] = value if value in summonerranks else None
		# Blessing can only be an int of this set of 8
		elif prop == "blessing":
			hero[prop] = None if not value else (None if not value.isdigit() else (int(value) if int(value) in range(1, 9) else None))
		# The attire can only be Resplendent, Normal or Stats-Only
		elif prop == "attire":
			hero[prop] = value if value in ["Normal", "Resplendent", "Stats-Only"] else "Normal"
		# Bonus can only be yes or no
		elif prop == "bonusunit":
			hero[prop] = True if value == "yes" else False
		# For allies we add the list provided unless nothing is provided in which case we add an empty string
		elif prop == "allies":
			hero[prop] = {}
			if value:
				allies = value.split("|")
				for ally in allies:
					ally = ally.split(";")
					# For each hero with a valid blessing we can check if the multiplier is valid
					if ally[0] in blessed and len(ally) == 2:
						# We only add the ally if the second value is a digit between 0 and 5.
						hero[prop][ally[0]] = hero[prop].get(ally[0], 0) + (0 if not ally[1].isdigit() else (int(ally[1]) if int(ally[1]) in range(1, 7) else 0))
		# For buffs if nothing is provided we default to an empty list, if something is provided it must be a string that when split by ; has a length of 4, being each element a valid int between -99 and 99
		elif prop == "buffs":
			if not value:
				hero[prop] = [0, 0, 0, 0, 0]
			elif len(value.split(";")) != 4:
				hero[prop] = [0, 0, 0, 0, 0]
			else:
				hero[prop] = [0]
				for x in value.split(";"):
					try:
						hero[prop].append(-99 if int(x) < -99 else (99 if int(x) > 99 else int(x)))
					except:
						hero[prop].append(0)
		# If SP count is not provided default to 9999, if provided but not a valid digit default to 9999, if valid but above 9999 default to 9999, anything else should be fine
		elif prop == "sp":
			hero[prop] = 9999 if not value else (9999 if not value.isdigit() else (9999 if int(value) > 9999 else int(value)))
		# If HM count is not provided default to 7000, if provided but not a valid digit default to 7000, if valid but above 7000 default to 7000, anything else should be fine
		elif prop == "hm":
			hero[prop] = 7000 if not value else (7000 if not value.isdigit() else (7000 if int(value) > 7000 else int(value)))
		# For art style default to portrait unless a valid value is received
		elif prop == "artstyle":
			hero[prop] = value if value in ["Portrait", "Attack", "Special", "Damage"] else "Portrait"
		# If offset valie is not provided default to 0, if provided but not a valid digit default to 0, if valid but above 300 default to 300, anything else should be fine
		elif prop in ["offsetY", "offsetX"]:
			try:
				hero[prop] = -300 if int(value) < -300 else (300 if int(value) > 300 else int(value))
			except:
				hero[prop] = 0
		# For favorite marks if it's a strig numeric from 1 to 8
		elif prop == "favorite":
			hero[prop] = int(value) if value in ["1", "2", "3", "4", "5", "6", "7", "8"] else 0
		# For accessories we just match the list
		elif prop == "accessory":
			hero[prop] = value if value in ["Hat", "Hair", "Mask", "Tiara"] else None
		# For language we must just fit within the available ones (fallback to English)
		elif prop == "language":
			hero[prop] = value if value in languages.keys() else "USEN"
		# For app ui default to render unless told otherwise
		elif prop == "appui":
			hero[prop] = False if value == "false" else True
	return hero

def statcalc(stats, growths, rarity, boon, bane, merges, flowers):
	# Disable banes in the calculations if we are merged
	if merges > 0:
		bane = None
	# Modify the level 1 stats based on the rarity provided
	almosttruelevel1 = {"HP": stats[0], "Atk": stats[1], "Spd": stats[2], "Def": stats[3], "Res": stats[4]}
	# For 3 and 5 star rarity we can simply bump everything by 1 point
	if rarity >= 3:
		almosttruelevel1 = {property: value + 1 for property, value in almosttruelevel1.items()}
	if rarity == 5:
		almosttruelevel1 = {property: value + 1 for property, value in almosttruelevel1.items()}
	# For two and four star rarities we have to bump the 2 highest non-HP stats by 1
	if rarity in [2, 4]:
		# We sort the level 1 stats to see the correct order to apply rarity stats
		almosttruelevel1 = {k: v for k, v in sorted(almosttruelevel1.items(), key=lambda item: item[1], reverse=True)}
		increased = 0
		for stat in almosttruelevel1:
			# We ignore HP until 3 or 5 rarity
			if stat != "HP":
				almosttruelevel1[stat] += 1
				# If already increased two stats we stop here
				increased += 1
				if increased == 2:
					break

	# Modify the level 1 stats based on the boons and banes provided
	truelevel1 = {
		"HP": almosttruelevel1["HP"] + (-1 if bane == "HP" else (1 if boon == "HP" else 0)),
		"Atk": almosttruelevel1["Atk"] + (-1 if bane == "Atk" else (1 if boon == "Atk" else 0)),
		"Spd": almosttruelevel1["Spd"] + (-1 if bane == "Spd" else (1 if boon == "Spd" else 0)),
		"Def": almosttruelevel1["Def"] + (-1 if bane == "Def" else (1 if boon == "Def" else 0)),
		"Res": almosttruelevel1["Res"] + (-1 if bane == "Res" else (1 if boon == "Res" else 0))
	}
	# Modify the growth based on the boons and banes provided
	truegrowth = {
		"HP": growths[0] + (-5 if bane == "HP" else (5 if boon == "HP" else 0)),
		"Atk": growths[1] + (-5 if bane == "Atk" else (5 if boon == "Atk" else 0)),
		"Spd": growths[2] + (-5 if bane == "Spd" else (5 if boon == "Spd" else 0)),
		"Def": growths[3] + (-5 if bane == "Def" else (5 if boon == "Def" else 0)),
		"Res": growths[4] + (-5 if bane == "Res" else (5 if boon == "Res" else 0))
	}
	# We sort the level 1 stats to see the correct order to apply merges and dragonflowers
	truelevel1 = {k: v for k, v in sorted(truelevel1.items(), key=lambda item: item[1], reverse=True)}
	# We loop as many times as merges we got to apply the boosts, we save in a variable the next to be updated index
	stat = 0;
	for i in range(0, merges):
		# If we are neutral but merged we increase the first two stats twice
		truelevel1[list(truelevel1.keys())[stat]] += 2 if not boon and i == 0 else 1
		stat = 0 if stat == 4 else stat + 1
		truelevel1[list(truelevel1.keys())[stat]] += 2 if not boon and i == 0 else 1
		stat = 0 if stat == 4 else stat + 1
		# If we are neutral but merged we increase an additional stat on the first iteration but without incrementing the counter
		if boon is None and i == 0:
			truelevel1[list(truelevel1.keys())[stat]] += 1
	# We loop as many times as dragonflowers we got to apply the boosts, we save in a variable the next to be updated index
	stat = 0;
	for i in range(0, flowers):
		# If we are neutral but merged we increase the first two stats twice
		truelevel1[list(truelevel1.keys())[stat]] += 1
		stat = 0 if stat == 4 else stat + 1
	return [
		truelevel1["HP"] + generalgrowths[rarity-1][int((truegrowth["HP"] / 5) - 4)],
		truelevel1["Atk"] + generalgrowths[rarity-1][int((truegrowth["Atk"] / 5) - 4)],
		truelevel1["Spd"] + generalgrowths[rarity-1][int((truegrowth["Spd"] / 5) - 4)],
		truelevel1["Def"] + generalgrowths[rarity-1][int((truegrowth["Def"] / 5) - 4)],
		truelevel1["Res"] + generalgrowths[rarity-1][int((truegrowth["Res"] / 5) - 4)],
	]

# Growth table from https://feheroes.fandom.com/wiki/Stat_growth (this is hardcoded because deriving the actual values from the base formula is increasingly tricky due aproximations .99999 decimals and such). Theorically we should be able to calculate with (math.trunc(truegrowth["Res"] * raritymultipliers[rarity-1]) / 100)
generalgrowths = [
	# 1 star
	[6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 28, 30],
	# 2 star
	[7, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 26, 28, 30, 32],
	# 3 star
	[7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
	# 4 star
	[8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 31, 33, 35, 37],
	# 5 star
	[8, 10, 13, 15, 17, 19, 22, 24, 26, 28, 30, 33, 35, 37, 39]
]
def weapontype(integer):
	validtypes = ["Red Sword", "Blue Lance", "Green Axe", "Red Bow", "Blue Bow", "Green Bow", "Colorless Bow", "Red Dagger", "Blue Dagger", "Green Dagger", "Colorless Dagger", "Red Tome", "Blue Tome", "Green Tome", "Colorless Tome", "Colorless Staff", "Red Breath", "Blue Breath", "Green Breath", "Colorless Breath", "Red Beast", "Blue Beast", "Green Beast", "Colorless Beast"]
	# We only need to loop through the length of the list and if for any index the bit is 1 it means we succesfully detected the weapon type.
	for i in range(0, len(validtypes)):
		if integer >> i & 1:
			return i

def weaponmodifiers(name, weapon, refine, allpassives):
	# Not multiplier (in case no check is met)
	stats = [0, 0, 0, 0, 0]
	# Obtain the values from the refined weapon if it has it available
	if refine in weapon.get("refines", {}):
		stats = [int(x) for x in weapon["refines"][refine]["statModifiers"]]
		# If the weapon has an effect ID and we are refining for it we need to check if it has visible stats on it from a base skill (then add them)
		if weapon["refines"][refine].get("effectid", False) in allpassives and refine == "Effect":
			stats = [x+y for x,y in zip(stats, allpassives[weapon["refines"][refine]["effectid"]]["statModifiers"])]
	# Unrefined weapon, just use base values
	else:
		stats = [int(x) for x in weapon["statModifiers"]]
	return stats

# Define the positions where each passive must render
passiverender = {
	"A": {"icon": (369, 945), "text": (420, 953), "indicator": (396, 966)},
	"B": {"icon": (369, 994), "text": (420, 1003), "indicator": (396, 1016)},
	"C": {"icon": (369, 1043), "text": (420, 1053), "indicator": (396, 1066)},
	"S": {"icon": (369, 1093), "text": (420, 1103), "indicator": (396, 1116)}
}

# Visible stats from having Summoner Support
summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2]
}

# Load all widely used images to save on disk operations
images = {
	"rarity": {
		"1": Image.open("../data/img/other/rarity1.webp"),
		"2": Image.open("../data/img/other/rarity2.webp"),
		"3": Image.open("../data/img/other/rarity3.webp"),
		"4": Image.open("../data/img/other/rarity4.webp"),
		"5": Image.open("../data/img/other/rarity5.webp"),
		"Forma": Image.open("../data/img/other/rarityForma.webp")
	},
	"movetype": [
		Image.open("../data/img/other/0-move.webp"),
		Image.open("../data/img/other/1-move.webp"),
		Image.open("../data/img/other/2-move.webp"),
		Image.open("../data/img/other/3-move.webp")
	],
	"flowers": [
		Image.open("../data/img/other/0-flower.webp"),
		Image.open("../data/img/other/1-flower.webp"),
		Image.open("../data/img/other/2-flower.webp"),
		Image.open("../data/img/other/3-flower.webp"),
	],
	"weapontype": [
		Image.open("../data/img/other/0-weapon.webp"),
		Image.open("../data/img/other/1-weapon.webp"),
		Image.open("../data/img/other/2-weapon.webp"),
		Image.open("../data/img/other/3-weapon.webp"),
		Image.open("../data/img/other/4-weapon.webp"),
		Image.open("../data/img/other/5-weapon.webp"),
		Image.open("../data/img/other/6-weapon.webp"),
		Image.open("../data/img/other/7-weapon.webp"),
		Image.open("../data/img/other/8-weapon.webp"),
		Image.open("../data/img/other/9-weapon.webp"),
		Image.open("../data/img/other/10-weapon.webp"),
		Image.open("../data/img/other/11-weapon.webp"),
		Image.open("../data/img/other/12-weapon.webp"),
		Image.open("../data/img/other/13-weapon.webp"),
		Image.open("../data/img/other/14-weapon.webp"),
		Image.open("../data/img/other/15-weapon.webp"),
		Image.open("../data/img/other/16-weapon.webp"),
		Image.open("../data/img/other/17-weapon.webp"),
		Image.open("../data/img/other/18-weapon.webp"),
		Image.open("../data/img/other/19-weapon.webp"),
		Image.open("../data/img/other/20-weapon.webp"),
		Image.open("../data/img/other/21-weapon.webp"),
		Image.open("../data/img/other/22-weapon.webp"),
		Image.open("../data/img/other/23-weapon.webp")
	],
	"blessing": [
		# Fire
		{
			"normal": Image.open("../data/img/other/1-Blessing.webp"),
			"atk": Image.open("../data/img/other/1-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/1-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/1-Blessing-def.webp"),
			"res": Image.open("../data/img/other/1-Blessing-res.webp"),
			"pairup": Image.open("../data/img/other/1-Blessing-pairup.webp")
		},
		# Water
		{
			"normal": Image.open("../data/img/other/2-Blessing.webp"),
			"atk": Image.open("../data/img/other/2-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/2-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/2-Blessing-def.webp"),
			"res": Image.open("../data/img/other/2-Blessing-res.webp"),
			"pairup": Image.open("../data/img/other/2-Blessing-pairup.webp")
		},
		# Wind
		{
			"normal": Image.open("../data/img/other/3-Blessing.webp"),
			"atk": Image.open("../data/img/other/3-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/3-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/3-Blessing-def.webp"),
			"res": Image.open("../data/img/other/3-Blessing-res.webp"),
			"pairup": Image.open("../data/img/other/3-Blessing-pairup.webp")
		},
		# Earth
		{
			"normal": Image.open("../data/img/other/4-Blessing.webp"),
			"atk": Image.open("../data/img/other/4-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/4-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/4-Blessing-def.webp"),
			"res": Image.open("../data/img/other/4-Blessing-res.webp"),
			"pairup": Image.open("../data/img/other/4-Blessing-pairup.webp")
		},
		# Light
		{
			"normal": Image.open("../data/img/other/5-Blessing.webp"),
			"atk": Image.open("../data/img/other/5-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/5-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/5-Blessing-def.webp"),
			"res": Image.open("../data/img/other/5-Blessing-res.webp"),
			"atk-extrae": Image.open("../data/img/other/5-Blessing-atk-extrae.webp"),
			"spd-extrae": Image.open("../data/img/other/5-Blessing-spd-extrae.webp"),
			"def-extrae": Image.open("../data/img/other/5-Blessing-def-extrae.webp"),
			"res-extrae": Image.open("../data/img/other/5-Blessing-res-extrae.webp"),
		},
		# Dark
		{
			"normal": Image.open("../data/img/other/6-Blessing.webp"),
			"atk": Image.open("../data/img/other/6-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/6-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/6-Blessing-def.webp"),
			"res": Image.open("../data/img/other/6-Blessing-res.webp"),
			"atk-extrae": Image.open("../data/img/other/6-Blessing-atk-extrae.webp"),
			"spd-extrae": Image.open("../data/img/other/6-Blessing-spd-extrae.webp"),
			"def-extrae": Image.open("../data/img/other/6-Blessing-def-extrae.webp"),
			"res-extrae": Image.open("../data/img/other/6-Blessing-res-extrae.webp"),
		},
		# Astra
		{
			"normal": Image.open("../data/img/other/7-Blessing.webp"),
			"atk": Image.open("../data/img/other/7-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/7-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/7-Blessing-def.webp"),
			"res": Image.open("../data/img/other/7-Blessing-res.webp"),
			"atk-extrae": Image.open("../data/img/other/7-Blessing-atk-extrae.webp"),
			"spd-extrae": Image.open("../data/img/other/7-Blessing-spd-extrae.webp"),
			"def-extrae": Image.open("../data/img/other/7-Blessing-def-extrae.webp"),
			"res-extrae": Image.open("../data/img/other/7-Blessing-res-extrae.webp"),
		},
		# Anima
		{
			"normal": Image.open("../data/img/other/8-Blessing.webp"),
			"atk": Image.open("../data/img/other/8-Blessing-atk.webp"),
			"spd": Image.open("../data/img/other/8-Blessing-spd.webp"),
			"def": Image.open("../data/img/other/8-Blessing-def.webp"),
			"res": Image.open("../data/img/other/8-Blessing-res.webp"),
			"atk-extrae": Image.open("../data/img/other/8-Blessing-atk-extrae.webp"),
			"spd-extrae": Image.open("../data/img/other/8-Blessing-spd-extrae.webp"),
			"def-extrae": Image.open("../data/img/other/8-Blessing-def-extrae.webp"),
			"res-extrae": Image.open("../data/img/other/8-Blessing-res-extrae.webp"),
		}
	],
	"favorite": [
		Image.open("../data/img/other/favorite_0.webp"),
		Image.open("../data/img/other/favorite_1.webp"),
		Image.open("../data/img/other/favorite_2.webp"),
		Image.open("../data/img/other/favorite_3.webp"),
		Image.open("../data/img/other/favorite_4.webp"),
		Image.open("../data/img/other/favorite_5.webp"),
		Image.open("../data/img/other/favorite_6.webp"),
		Image.open("../data/img/other/favorite_7.webp"),
		Image.open("../data/img/other/favorite_8.webp")
	],
	"accessory": {
		"Hat": Image.open("../data/img/other/Accesory-Hat.webp"),
		"Hair": Image.open("../data/img/other/Accesory-Hair.webp"),
		"Mask": Image.open("../data/img/other/Accesory-Mask.webp"),
		"Tiara": Image.open("../data/img/other/Accesory-Tiara.webp")
	},
	"summoner": {
		"C": Image.open("../data/img/other/Support-C.webp"),
		"B": Image.open("../data/img/other/Support-B.webp"),
		"A": Image.open("../data/img/other/Support-A.webp"),
		"S": Image.open("../data/img/other/Support-S.webp"),
	},
	"other": {
		"bgnosupport": Image.open("../data/img/other/normalbg.webp"),
		"bgsupport": Image.open("../data/img/other/summonerbg.webp"),
		"fgui": Image.open("../data/img/base/foreground-ui.webp"),
		"fgnoui": Image.open("../data/img/base/foreground.webp"),
		"resplendent": Image.open("../data/img/other/resplendent.webp"),
		"expindicator": Image.open("../data/img/base/expindicator.webp"),
		"accessoryexpand": Image.open("../data/img/base/accessory-expansion.webp"),
		"flowerholder": Image.open("../data/img/base/flowerholder.webp"),
		"duoconversation": Image.open("../data/img/other/DuoConversation.webp"),
		"noweapon": Image.open("../data/img/other/weapon-Refine.webp"),
		"Duo": Image.open("../data/img/other/Duo.webp"),
		"Resonance": Image.open("../data/img/other/Resonance.webp")
	}
}
