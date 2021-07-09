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

refinemodifierchart = {
	"Sword": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Lance": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Axe": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Dragonstone": {"Effect": [3, 0, 0, 0, 0], "Atk": [5, 2, 0, 0, 0], "Spd": [5, 0, 3, 0, 0], "Def": [5, 0, 0, 4, 0], "Res": [5, 0, 0, 0, 4]},
	"Blue Tome": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Red Tome": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Green Tome": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Bow": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Dagger": {"Effect": [0, 0, 0, 0, 0], "Atk": [2, 1, 0, 0, 0], "Spd": [2, 0, 2, 0, 0], "Def": [2, 0, 0, 3, 0], "Res": [2, 0, 0, 0, 3]},
	"Staff": {"Dazzling": [0, 0, 0, 0, 0], "Wrathful": [0, 0, 0, 0, 0]}
}

summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2]
}

passivemodifiers = {
	"Fortress Def 1": [0, -3, 0, 3, 0],
	"Fortress Def 2": [0, -3, 0, 4, 0],
	"Fortress Def 3": [0, -3, 0, 5, 0],
	"Fortress Res 1": [0, -3, 0, 0, 3],
	"Fortress Res 2": [0, -3, 0, 0, 4],
	"Fortress Res 3": [0, -3, 0, 0, 5],
	"Fury 1": [0, 1, 1, 1, 1],
	"Fury 2": [0, 2, 2, 2, 2],
	"Fury 3": [0, 3, 3, 3, 3],
	"Fury 4": [0, 4, 4, 4, 4],
	"G Duel Flying 1": [3, 0, 0, 0, 0],
	"G Duel Flying 2": [4, 0, 0, 0, 0],
	"G Duel Flying 3": [5, 0, 0, 0, 0],
	"G Duel Flying 4": [5, 2, 2, 2, 2],
	"G Duel Infantry 1": [3, 0, 0, 0, 0],
	"G Duel Infantry 2": [4, 0, 0, 0, 0],
	"G Duel Infantry 3": [5, 0, 0, 0, 0],
	"G Duel Infantry 4": [5, 2, 2, 2, 2],
	"R Duel Cavalry 1": [3, 0, 0, 0, 0],
	"R Duel Cavalry 2": [4, 0, 0, 0, 0],
	"R Duel Cavalry 3": [5, 0, 0, 0, 0],
	"R Duel Cavalry 4": [5, 2, 2, 2, 2],
	"R Duel Flying 1": [3, 0, 0, 0, 0],
	"R Duel Flying 2": [4, 0, 0, 0, 0],
	"R Duel Flying 3": [5, 0, 0, 0, 0],
	"R Duel Flying 4": [5, 2, 2, 2, 2],
	"R Duel Infantry 1": [3, 0, 0, 0, 0],
	"R Duel Infantry 2": [4, 0, 0, 0, 0],
	"R Duel Infantry 3": [5, 0, 0, 0, 0],
	"R Duel Infantry 4": [5, 2, 2, 2, 2],
	"B Duel Infantry 1": [3, 0, 0, 0, 0],
	"B Duel Infantry 2": [4, 0, 0, 0, 0],
	"B Duel Infantry 3": [5, 0, 0, 0, 0],
	"B Duel Infantry 4": [5, 2, 2, 2, 2],
	"B Duel Flying 1": [3, 0, 0, 0, 0],
	"B Duel Flying 2": [4, 0, 0, 0, 0],
	"B Duel Flying 3": [5, 0, 0, 0, 0],
	"B Duel Flying 4": [5, 2, 2, 2, 2],
	"B Duel Cavalry 1": [3, 0, 0, 0, 0],
	"B Duel Cavalry 2": [4, 0, 0, 0, 0],
	"B Duel Cavalry 3": [5, 0, 0, 0, 0],
	"B Duel Cavalry 4": [5, 2, 2, 2, 2],
	"C Duel Cavalry 1": [3, 0, 0, 0, 0],
	"C Duel Cavalry 2": [4, 0, 0, 0, 0],
	"C Duel Cavalry 3": [5, 0, 0, 0, 0],
	"C Duel Cavalry 4": [5, 2, 2, 2, 2],
	"HP/Atk 1": [3, 1, 0, 0, 0],
	"HP/Atk 2": [4, 2, 0, 0, 0],
	"HP/Spd 1": [3, 0, 1, 0, 0],
	"HP/Spd 2": [4, 0, 2, 0, 0],
	"HP/Def 1": [3, 0, 0, 1, 0],
	"HP/Def 2": [4, 0, 0, 2, 0],
	"HP/Res 1": [3, 0, 0, 0, 1],
	"HP/Res 2": [4, 0, 0, 0, 2],
	"Spd/Def 1": [0, 0, 1, 1, 0],
	"Spd/Def 2": [0, 0, 2, 2, 0],
	"Spd/Res 1": [0, 0, 1, 0, 1],
	"Spd/Res 2": [0, 0, 2, 0, 2],
	"Def/Res 1": [0, 0, 0, 1, 1],
	"Def/Res 2": [0, 0, 0, 2, 2],
	"Atk/Res 1": [0, 1, 0, 0, 1],
	"Atk/Res 2": [0, 2, 0, 0, 2],
	"Atk/Def 1": [0, 1, 0, 1, 0],
	"Atk/Def 2": [0, 2, 0, 2, 0],
	"Atk/Spd 1": [0, 1, 1, 0, 0],
	"Atk/Spd 2": [0, 2, 2, 0, 0],
	"HP +3": [3, 0, 0, 0, 0],
	"HP +4": [4, 0, 0, 0, 0],
	"HP +5": [5, 0, 0, 0, 0],
	"Resistance +1": [0, 0, 0, 0, 1],
	"Resistance +2": [0, 0, 0, 0, 2],
	"Resistance +3": [0, 0, 0, 0, 3],
	"Defense +1": [0, 0, 0, 1, 0],
	"Defense +2": [0, 0, 0, 2, 0],
	"Defense +3": [0, 0, 0, 3, 0],
	"Speed +1": [0, 0, 1, 0, 0],
	"Speed +2": [0, 0, 2, 0, 0],
	"Speed +3": [0, 0, 3, 0, 0],
	"Attack +1": [0, 1, 0, 0, 0],
	"Attack +2": [0, 2, 0, 0, 0],
	"Attack +3": [0, 3, 0, 0, 0],
	"Fort. Def/Res 1": [0, -3, 0, 3, 3],
	"Fort. Def/Res 2": [0, -3, 0, 4, 4],
	"Fort. Def/Res 3": [0, -2, 0, 6, 6],
	"Life and Death 1": [0, 3, 3, -3, -3],
	"Life and Death 2": [0, 4, 4, -4, -4],
	"Life and Death 3": [0, 5, 5, -5, -5],
	"Life and Death 4": [0, 7, 7, -5, -5]
}

def weaponmodifiers(name, weapon, refine):
	# Not multiplier (in case no check is met)
	stats = [0, 0, 0, 0, 0]
	# Obtain the normal values from the base weapon
	if weapon:
		stats = [int(x) for x in weapon["statModifiers"].split(",")]
	# If the weapon is refined then add with the values
	if refine:
		stats = [x+y for x,y in zip(stats, refinemodifierchart[weapon["WeaponType"]][refine])]
		# This list of weapons are brave melee of the triangle axe-lance-sword and suffer a -1 penalty when refining for Atk so we check this
		if name in ["Amiti", "Arden's Blade", "Cherche's Axe", "Hewn Lance", "Rowdy Sword"] and refine == "Atk":
			stats[1] -= 1
	return stats
