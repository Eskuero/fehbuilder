import json
import math

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
	return {
		"HP": truelevel1["HP"] + math.trunc(39 * (math.trunc(truegrowth["HP"] * 1.140000001) / 100)),
		"Atk": truelevel1["Atk"] + math.trunc(39 * (math.trunc(truegrowth["Atk"] * 1.140000001) / 100)),
		"Spd": truelevel1["Spd"] + math.trunc(39 * (math.trunc(truegrowth["Spd"] * 1.140000001) / 100)),
		"Def": truelevel1["Def"] + math.trunc(39 * (math.trunc(truegrowth["Def"] * 1.140000001) / 100)),
		"Res": truelevel1["Res"] + math.trunc(39 * (math.trunc(truegrowth["Res"] * 1.140000001) / 100))
	}

def weaponmodifiers(name, weapon, refine):
	# Not multiplier (in case no check is met)
	stats = [0, 0, 0, 0, 0]
	# Obtain the normal values from the base weapon (or the additional effect weapon if refined for that)
	if weapon:
		stats = [int(x) for x in (weapon["statModifiers"] if refine != "Effect" else weapon["specialstatModifiers"])]
	# If the weapon is refined then add with the values
	if refine:
		stats = [x+y for x,y in zip(stats, refinemodifierchart[weapon["WeaponType"][0]][refine])]
		# This list of weapons are brave melee of the triangle axe-lance-sword and suffer a -1 penalty when refining for Atk so we check this
		if name in ["Amiti", "Arden's Blade", "Cherche's Axe", "Hewn Lance", "Rowdy Sword"] and refine == "Atk":
			stats[1] -= 1
	return stats

# Define the positions where each passive must render
passiverender = {
	"A": {"icon": (369, 945), "text": (420, 953)},
	"B": {"icon": (369, 994), "text": (420, 1003)},
	"C": {"icon": (369, 1043), "text": (420, 1053)},
	"S": {"icon": (369, 1093), "text": (420, 1103)}
}

# Base ruleset for refine visual stats depending on weapon type
refinemodifierchart = {
	"Red Sword": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Blue Lance": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Green Axe": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Red Breath": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Green Breath": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Blue Breath": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Colorless Breath": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Blue Tome": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Tome": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Green Tome": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Blue Bow": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Bow": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Green Bow": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Colorless Bow": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Dagger": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Blue Dagger": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Green Dagger": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Colorless Dagger": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Colorless Staff": {"Dazzling": [0, 0, 0, 0, 0], "Wrathful": [0, 0, 0, 0, 0], "Effect": [0, 0, 0, 0, 0]}
}

# Visible stats from having Summoner Support
summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2]
}
