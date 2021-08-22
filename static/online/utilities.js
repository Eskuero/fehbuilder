function statcalc(stats, growths, rarity, boon, bane, merges, flowers) {
	// Disable banes in the calculations if we are merged
	if (merges > 0)
		bane = false;
	// Modify the level 1 stats based on the rarity provided
	almosttruelevel1 = {"HP": stats[0], "Atk": stats[1], "Spd": stats[2], "Def": stats[3], "Res": stats[4]}
	// For 3 and 5 star rarity we can simply bump everything by 1 point
	if (rarity >= 3) {
		Object.keys(almosttruelevel1).forEach(key => {
			almosttruelevel1[key] += 1;
		});
	}
	if (rarity == 5) {
		Object.keys(almosttruelevel1).forEach(key => {
			almosttruelevel1[key] += 1;
		});
	}
	// For two and four star rarities we have to bump the 2 highest non-HP stats by 1
	if ([2, 4].includes(rarity)) {
		// We sort the level 1 stats to see the correct order to apply rarity stats
		sortedalmosttruelevel1 = dictsort(almosttruelevel1);
		increased = 0;
		for (i = 0; i < sortedalmosttruelevel1.length; i++) {
			stat = sortedalmosttruelevel1[i][0];
			// We ignore HP until 3 or 5 rarity
			if (stat != "HP") {
				almosttruelevel1[stat] += 1;
				// If already increased two stats we stop here
				increased += 1;
				if (increased == 2)
					break
			}
		}
	}

	// Modify the level 1 stats based on the boons and banes provided
	truelevel1 = {
		"HP": almosttruelevel1["HP"] + (boon == "HP" ? 1 : (bane == "HP" ? -1 : 0)),
		"Atk": almosttruelevel1["Atk"] + (boon == "Atk" ? 1 : (bane == "Atk" ? -1 : 0)),
		"Spd": almosttruelevel1["Spd"] + (boon == "Spd" ? 1 : (bane == "Spd" ? -1 : 0)),
		"Def": almosttruelevel1["Def"] + (boon == "Def" ? 1 : (bane == "Def" ? -1 : 0)),
		"Res": almosttruelevel1["Res"] + (boon == "Res" ? 1 : (bane == "Res" ? -1 : 0))
	}
	// Modify the growth based on the boons and banes provided
	truegrowth = {
		"HP": growths[0] + (boon == "HP" ? 5 : (bane == "HP" ? -5 : 0)),
		"Atk": growths[1] + (boon == "Atk" ? 5 : (bane == "Atk" ? -5 : 0)),
		"Spd": growths[2] + (boon == "Spd" ? 5 : (bane == "Spd" ? -5 : 0)),
		"Def": growths[3] + (boon == "Def" ? 5 : (bane == "Def" ? -5 : 0)),
		"Res": growths[4] + (boon == "Res" ? 5 : (bane == "Res" ? -5 : 0))
	}

	// We sort the level 1 stats to see the correct order to apply merges and dragonflowers
	sortedtruelevel1 = dictsort(truelevel1);
	// We loop as many times as merges we got to apply the boosts, we save in a variable the next to be updated index
	stat = 0;
	for (i = 0; i < merges; i++) {
		// If we are neutral but merged we increase the first two stats twice on the initial merge
		truelevel1[sortedtruelevel1[stat][0]] += (boon || i > 0) ? 1 : 2;
		stat = stat == 4 ? 0 : stat + 1
		truelevel1[sortedtruelevel1[stat][0]] += (boon || i > 0) ? 1 : 2;
		stat = stat == 4 ? 0 : stat + 1
		// If we are neutral but merged we increase an additional stat on the first merge but without incrementing the counter
		if (!boon && i == 0)
			truelevel1[sortedtruelevel1[stat][0]] += 1;
	}

	// We loop as many times as dragonflowers we got to apply the boosts, we save in a variable the next to be updated index
	stat = 0;
	for (i = 0; i < flowers; i++) {
		// If we are neutral but merged we increase the first two stats twice
		truelevel1[sortedtruelevel1[stat][0]] += 1;
		stat = stat == 4 ? 0 : stat + 1;
	}

	return [
		truelevel1["HP"] + generalgrowths[rarity-1][(truegrowth["HP"] / 5) - 4],
		truelevel1["Atk"] + generalgrowths[rarity-1][(truegrowth["Atk"] / 5) - 4],
		truelevel1["Spd"] + generalgrowths[rarity-1][(truegrowth["Spd"] / 5) - 4],
		truelevel1["Def"] + generalgrowths[rarity-1][(truegrowth["Def"] / 5) - 4],
		truelevel1["Res"] + generalgrowths[rarity-1][(truegrowth["Res"] / 5) - 4],
	]
}
// Growth table from https://feheroes.fandom.com/wiki/Stat_growth (this is hardcoded because deriving the actual values from the base formula is increasingly tricky due aproximations .99999 decimals and such). Theorically we should be able to calculate with (math.trunc(truegrowth["Res"] * raritymultipliers[rarity-1]) / 100)
generalgrowths = [
	// 1 star
	[6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 28, 30],
	// 2 star
	[7, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 26, 28, 30, 32],
	// 3 star
	[7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
	// 4 star
	[8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 31, 33, 35, 37],
	// 5 star
	[8, 10, 13, 15, 17, 19, 22, 24, 26, 28, 30, 33, 35, 37, 39]
]

// Function to order items from a dictionary like object in javascript. Ripped from https://stackoverflow.com/a/25500462
function dictsort(dictionary) {
	// Create items array
	var items = Object.keys(dictionary).map(function(key) {
		return [key, dictionary[key]];
	});

	// Sort the array based on the second element
	items.sort(function(first, second) {
		return second[1] - first[1];
	});
	return items;
}

function weaponmodifiers(weapon, refine) {
	// Merge allpasives together for ease of wide checks
	allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"])
	// Retrieve weapon data
	weapon = skills["weapons"][weapon];
	stats = [0, 0, 0, 0, 0]
	// Obtain the values from the refined weapon if it has it available
	if (refine) {
		stats = weapon["refines"][refine]["statModifiers"];
		// If the weapon has an effect ID and we are refining for it we need to check if it has visible stats on it from a base skill (then add them)
		if (weapon["refines"][refine]["effectid"]) {
			stats = stats.map(function (value, index) {
				return value + (allpassives[weapon["refines"][refine]["effectid"]] ? allpassives[weapon["refines"][refine]["effectid"]]["statModifiers"] : [0,0,0,0,0])[index];
			});
		}
	// Unrefined weapon, just use base values
	} else {
		stats = weapon["statModifiers"];
	}
	return stats;
}

// Visible stats from having Summoner Support
summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2]
}

passiverender = {
	"A": {"icon": [369, 945], "text": [420, 954], "indicator": [396, 966]},
	"B": {"icon": [369, 994], "text": [420, 1003], "indicator": [396, 1016]},
	"C": {"icon": [369, 1043], "text": [420, 1053], "indicator": [396, 1066]},
	"S": {"icon": [369, 1093], "text": [420, 1103], "indicator": [396, 1116]}
}
