import json
import math

# Hero request squeleton definition
hero = {
	"name": False, "title": False, "boon": False, "bane": False, "merges": False, "flowers": False, "weapon": False, "refine": False, "assist": False, "special": False, "passiveA": False, "passiveB": False, "passiveC": False, "passiveS": False, "summoner": False, "blessing": False, "attire": False, "bonusunit": False, "allies": False, "buffs": False, "sp": False, "hm": False, "artstyle": False, "offset": False, "favorite": False, "appui": False
}

def herosanitization(heroes, skills, name, args):
	for prop in hero:
		value = args.get(prop)
		# It's safe to assume the provided values for the hero name and title are correct since we checked they do exist
		if prop == "name":
			hero[prop] = name.split(":")[0]
		elif prop == "title":
			hero[prop] = name.split(":")[1].lstrip() if ":" in name else "Enemy"
		# Banes and boons are valid within a set amount of values
		elif prop in ["boon", "bane"]:
			hero[prop] = value if value in ["HP", "Atk", "Spd", "Def", "Res"] else None
		# If merges are not provided default to 0, if provided but not a valid digit default to 0, if valid but above 10 default to 10, anything else should be fine
		elif prop == "merges":
			hero[prop] = 0 if not value else (0 if not value.isdigit() else (10 if int(value) > 10 else int(value)))
		# If flowers are not provided default to 0, if provided but not a valid digit default to 0, if valid but above 15 default to 15, anything else should be fine
		elif prop == "flowers":
			hero[prop] = 0 if not value else (0 if not value.isdigit() else (15 if int(value) > 15 else int(value)))
		# Weapon must exist in our data otherwise we don't print it
		elif prop == "weapon":
			hero[prop] = value if value in skills["weapons"] else "-"
		# Refine can only be from a certain set
		elif prop == "refine":
			hero[prop] = value if value in ["Effect", "Atk", "Spd", "Def", "Res", "Dazzling", "Wrathful"] else None
		# Assists and specials must exist in our data otherwise we don't print it
		elif prop in ["assist", "special"]:
			hero[prop] = value if value in skills[prop + "s"] else "-"
		# Passives must exist in our data otherwise we don't print it
		elif prop in ["passiveA", "passiveB", "passiveC", "passiveS"]:
			hero[prop] = value if value in skills["passives"][prop[-1:]] else "-"
		# Summoner support rank can only be of C, B, A or S
		elif prop == "summoner":
			hero[prop] = value if value in summonerranks else None
		# Blessing can only be of this set of 8
		elif prop == "blessing":
			hero[prop] = value if value in ["Dark", "Light", "Anima", "Astra", "Fire", "Water", "Earth", "Wind"] else None
		# The attire can only be Resplendent or Normal
		elif prop == "attire":
			hero[prop] = True if value == "Resplendent" else False
		# Bonus can only be yes or no
		elif prop == "bonusunit":
			hero[prop] = True if value == "yes" else False
		# For allies we add the list provided unless nothing is provided in which case we add an empty string
		elif prop == "allies":
			hero[prop] = value if value else ""
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
		elif prop == "offset":
			hero[prop] = 0 if not value else (0 if not value.isdigit() else (300 if int(value) > 300 else int(value)))
		# For favorite marks if it's a strig numeric from 1 to 8
		elif prop == "favorite":
			hero[prop] = value if value in ["1", "2", "3", "4", "5", "6", "7", "8"] else "0"
		# For app ui default to render unless told otherwise
		elif prop == "appui":
			hero[prop] = False if value == "false" else True
	return hero

def statcalc(stats, growths, boon, bane, merges, flowers):
	# We are not allowing other than 5 star rarity so we hardcore 1.14% multiplier
	# "stats": {"HP": 18, "Atk": 7, "Spd": 8, "Def": 6, "Res": 5}, "growths": {"HP": 45, "Atk": 50, "Spd": 60, "Def": 35, "Res": 50}, "boons": {"HP": 5, "Atk": -5, "Spd": 0, "Def": 0, "Res": -5}}
	# Disable banes in the calculations if we are merged
	if merges > 0:
		bane = None
	# Modify the level 1 stats based on the boons and banes provided
	truelevel1 = {
		"HP": stats["HP"] + (-1 if bane == "HP" else (1 if boon == "HP" else 0)),
		"Atk": stats["Atk"] + (-1 if bane == "Atk" else (1 if boon == "Atk" else 0)),
		"Spd": stats["Spd"] + (-1 if bane == "Spd" else (1 if boon == "Spd" else 0)),
		"Def": stats["Def"] + (-1 if bane == "Def" else (1 if boon == "Def" else 0)),
		"Res": stats["Res"] + (-1 if bane == "Res" else (1 if boon == "Res" else 0))
	}
	# Modify the growth based on the boons and banes provided
	truegrowth = {
		"HP": growths["HP"] + (-5 if bane == "HP" else (5 if boon == "HP" else 0)),
		"Atk": growths["Atk"] + (-5 if bane == "Atk" else (5 if boon == "Atk" else 0)),
		"Spd": growths["Spd"] + (-5 if bane == "Spd" else (5 if boon == "Spd" else 0)),
		"Def": growths["Def"] + (-5 if bane == "Def" else (5 if boon == "Def" else 0)),
		"Res": growths["Res"] + (-5 if bane == "Res" else (5 if boon == "Res" else 0))
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
	# The the growth from level 1 to 40 is calculating by trunc(39 x trunc(growth value * rarity)/100))
	return [
		truelevel1["HP"] + math.trunc(39 * (math.trunc(truegrowth["HP"] * 1.140000001) / 100)),
		truelevel1["Atk"] + math.trunc(39 * (math.trunc(truegrowth["Atk"] * 1.140000001) / 100)),
		truelevel1["Spd"] + math.trunc(39 * (math.trunc(truegrowth["Spd"] * 1.140000001) / 100)),
		truelevel1["Def"] + math.trunc(39 * (math.trunc(truegrowth["Def"] * 1.140000001) / 100)),
		truelevel1["Res"] + math.trunc(39 * (math.trunc(truegrowth["Res"] * 1.140000001) / 100))
	]

def weaponmodifiers(name, weapon, refine):
	# Not multiplier (in case no check is met)
	stats = [0, 0, 0, 0, 0]
	# Obtain the normal values from the base weapon (or the additional effect weapon if refined for that)
	if weapon:
		stats = [int(x) for x in (weapon["statModifiers"] if refine != "Effect" else weapon["specialstatModifiers"])]
		# If the weapon is refined then add with the values
		if refine in refinemodifierchart[weapon["WeaponType"][0]]:
			stats = [x+y for x,y in zip(stats, refinemodifierchart[weapon["WeaponType"][0]][refine])]
			# This list of weapons are brave melee of the triangle axe-lance-sword and suffer a -1 penalty when refining for Atk so we check this
			if name in ["Amiti", "Arden's Blade", "Cherche's Axe", "Hewn Lance", "Rowdy Sword"] and refine == "Atk":
				stats[1] -= 1
	return stats

# Define the positions where each passive must render
passiverender = {
	"A": {"icon": (369, 945), "text": (420, 953), "indicator": (396, 966)},
	"B": {"icon": (369, 994), "text": (420, 1003), "indicator": (396, 1016)},
	"C": {"icon": (369, 1043), "text": (420, 1053), "indicator": (396, 1066)},
	"S": {"icon": (369, 1093), "text": (420, 1103), "indicator": (396, 1116)}
}

# Base ruleset for refine visual stats depending on weapon type
refinemodifierchart = {
	"Red Sword": {"Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Blue Lance": {"Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Green Axe": {"Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Red Breath": {"Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Green Breath": {"Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Blue Breath": {"Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Colorless Breath": {"Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Blue Tome": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Tome": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Green Tome": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Colorless Tome": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Blue Bow": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Bow": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Green Bow": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Colorless Bow": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Dagger": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Blue Dagger": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Green Dagger": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Colorless Dagger": {"Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Beast": {"Atk": [0, 0, 0, 0, 0], "Spd": [0, 0, 0, 0, 0], "Def": [0, 0, 0, 0, 0], "Res": [0, 0, 0, 0, 0]},
	"Blue Beast": {"Atk": [0, 0, 0, 0, 0], "Spd": [0, 0, 0, 0, 0], "Def": [0, 0, 0, 0, 0], "Res": [0, 0, 0, 0, 0]},
	"Green Beast": {"Atk": [0, 0, 0, 0, 0], "Spd": [0, 0, 0, 0, 0], "Def": [0, 0, 0, 0, 0], "Res": [0, 0, 0, 0, 0]},
	"Colorless Beast": {"Atk": [2, 1, 0, 0, 0], "Spd": [0, 0, 0, 0, 0], "Def": [0, 0, 0, 0, 0], "Res": [0, 0, 0, 0, 0]},
	"Colorless Staff": {"Dazzling": [0, 0, 0, 0, 0], "Wrathful": [0, 0, 0, 0, 0]}
}

# Visible stats from having Summoner Support
summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2]
}
