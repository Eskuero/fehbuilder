// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

function statcalc(stats, growths, rarity, boon, bane, ascendent, merges, flowers, emblemmerges, aide) {
	// Modify the level 1 stats based on the rarity provided
	var almosttruelevel1 = {"HP": stats[0], "Atk": stats[1], "Spd": stats[2], "Def": stats[3], "Res": stats[4]};
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
		var sortedalmosttruelevel1 = dictsort(almosttruelevel1);
		let increased = 0;
		for (let i = 0; i < sortedalmosttruelevel1.length; i++) {
			let stat = sortedalmosttruelevel1[i][0];
			// We ignore HP until 3 or 5 rarity
			if (stat != "HP") {
				almosttruelevel1[stat] += 1;
				// If already increased two stats we stop here
				increased += 1;
				if (increased == 2) {
					break;
				}
			}
		}
	}

	// Modify the level 1 stats based on the boons and banes provided
	var truelevel1hp = {
		"HP": almosttruelevel1["HP"] + (boon == "HP" ? 1 : (bane == "HP" ? -1 : 0))
	}
	// We have to split the level 1 stats in HP and non HP because HP is always guaranteed to receive the first boost, even if not highest stat at lvl 1
	var truelevel1other = {
		"Atk": almosttruelevel1["Atk"] + (boon == "Atk" ? 1 : (bane == "Atk" ? -1 : 0)),
		"Spd": almosttruelevel1["Spd"] + (boon == "Spd" ? 1 : (bane == "Spd" ? -1 : 0)),
		"Def": almosttruelevel1["Def"] + (boon == "Def" ? 1 : (bane == "Def" ? -1 : 0)),
		"Res": almosttruelevel1["Res"] + (boon == "Res" ? 1 : (bane == "Res" ? -1 : 0))
	};
	// We also have a combined copy
	var truelevel1 = {...truelevel1hp, ...truelevel1other};
	// Modify the growth based on the boons and banes provided
	var truegrowth = {
		"HP": growths[0] + (boon == "HP" ? 5 : (bane == "HP" ? -5 : 0)),
		"Atk": growths[1] + (boon == "Atk" ? 5 : (bane == "Atk" ? -5 : 0)),
		"Spd": growths[2] + (boon == "Spd" ? 5 : (bane == "Spd" ? -5 : 0)),
		"Def": growths[3] + (boon == "Def" ? 5 : (bane == "Def" ? -5 : 0)),
		"Res": growths[4] + (boon == "Res" ? 5 : (bane == "Res" ? -5 : 0))
	};

	// We sort the level 1 stats to see the correct order to apply merges and dragonflowers
	var sortedtruelevel1 = [["HP", truelevel1hp["HP"]], ...dictsort(truelevel1other)];

	// Now disregard the bane if we are merged
	if (merges > 0 && bane && bane != boon) {
		truelevel1[bane] += 1;
		truegrowth[bane] += 5;
	}

	// We only apply the ascendent boon after sorting because they are not meant to affect the merge/dragonflower boost order. Also do not apply if there's a match between boon and ascendent boon
	if (truelevel1[ascendent] && boon != ascendent) {
		truelevel1[ascendent] += 1;
		truegrowth[ascendent] += 5;
	}
	// We loop as many times as merges we got to apply the boosts, we save in a variable the next to be updated index
	var stat = 0;
	for (let i = 0; i < merges; i++) {
		// If we are neutral but merged we increase the first two stats twice on the initial merge (unless we have an ascendent boon on that stat)
		truelevel1[sortedtruelevel1[stat][0]] += (boon || i > 0 || sortedtruelevel1[stat][0] == ascendent) ? 1 : 2;
		let ascended = sortedtruelevel1[stat][0] == ascendent ? true : false;
		stat = stat == 4 ? 0 : stat + 1;
		truelevel1[sortedtruelevel1[stat][0]] += (boon || i > 0 || sortedtruelevel1[stat][0] == ascendent) ? 1 : 2;
		ascended = sortedtruelevel1[stat][0] == ascendent ? true : ascended;
		stat = stat == 4 ? 0 : stat + 1;
		// If we are neutral but merged we increase an additional stat on the first merge (unless we have an ascendent boon on that stat) but without incrementing the counter
		if (!boon && i == 0 && sortedtruelevel1[stat][0] != ascendent) {
			truelevel1[sortedtruelevel1[stat][0]] += 1;
		}
		ascended = sortedtruelevel1[stat][0] == ascendent ? true : ascended;

		// If we are neutral but merged we increase an additional stat on the first merge when ascendent stats are in place but without incrementing the counter
		if (!boon && i == 0 && ascended) {
			truelevel1[sortedtruelevel1[stat+1][0]] += 1;
		}
	}

	// We loop as many times as dragonflowers we got to apply the boosts, we save in a variable the next to be updated index
	var stat = 0;
	for (let i = 0; i < flowers; i++) {
		// If we are neutral but merged we increase the first two stats twice
		truelevel1[sortedtruelevel1[stat][0]] += 1;
		stat = stat == 4 ? 0 : stat + 1;
	}

	// We loop as many times as emblemmerges we got to apply the boosts, we save in a variable the next to be updated index
	var stat = 0;
	for (let i = 0; i < emblemmerges; i++) {
		// If we are neutral but merged we increase the first two stats twice
		truelevel1[sortedtruelevel1[stat][0]] += 1;
		stat = stat == 4 ? 0 : stat + 1;
	}

	// If the hero has an aide applied, increase all stats by one
	if (aide) {
		Object.keys(truelevel1).forEach(key => {
			truelevel1[key] += 1;
		});
	}

	// Decide if we will add growth values or not
	var maxed = selectlevel.value == "level1" ? false : true;

	return [
		truelevel1["HP"] + (maxed ? generalgrowths[rarity-1][(truegrowth["HP"] / 5) - 4] : 0),
		truelevel1["Atk"] + (maxed ? generalgrowths[rarity-1][(truegrowth["Atk"] / 5) - 4] : 0),
		truelevel1["Spd"] + (maxed ? generalgrowths[rarity-1][(truegrowth["Spd"] / 5) - 4] : 0),
		truelevel1["Def"] + (maxed ? generalgrowths[rarity-1][(truegrowth["Def"] / 5) - 4] : 0),
		truelevel1["Res"] + (maxed ? generalgrowths[rarity-1][(truegrowth["Res"] / 5) - 4] : 0),
	];
}
// Growth table from https://feheroes.fandom.com/wiki/Stat_growth (this is hardcoded because deriving the actual values from the base formula is increasingly tricky due aproximations .99999 decimals and such). Theorically we should be able to calculate with (math.trunc(truegrowth["Res"] * raritymultipliers[rarity-1]) / 100)
generalgrowths = [
	// 1 star
	[6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 28, 30, 31],
	// 2 star
	[7, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 26, 28, 30, 32, 34],
	// 3 star
	[7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37],
	// 4 star
	[8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 31, 33, 35, 37, 39],
	// 5 star
	[8, 10, 13, 15, 17, 19, 22, 24, 26, 28, 30, 33, 35, 37, 39, 42]
];

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

// Helper function to sleep async functions for a while
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function getimage(url, fallback = "/common/base/oopsie.webp") {
	var img = new Image();
	// This premise will not return until the image has fully loaded
	var imageLoadPromise = new Promise(resolve => {
		img.fetchPriority = "high"
		img.src = url;
		img.onload = resolve;
		// We failed to download the image so fallback to the provided or default 1x1 transparent image
		img.onerror = function () {
			console.log("Download of " + url + " went bad, using fallback image");
			this.src = fallback;
		};
	});
	await imageLoadPromise;
	// Once done return the new object
	return img;
}

async function changelang() {
	// Make sure the selected language is available, download it if not
	var newlang = selectlanguage.value;
	if (!languages[newlang]) {
		var response = await fetch('/common/data/languages/unitlanguages-' + newlang + '.json');
		var data = await response.json();
		languages[newlang] = data;
	}
	// Make sure all the selects repopulate properly before starting to reload
	await populateall(false);
	reload();
	statictranslations();
	loadbarracks();
}

function setupdownload() {
	var language = selectlanguage.value;
	var hero = selectheroes.value;
	// Get desired filename
	var truename = hero == "None" ? languages[language]["MSID_H_NONE"] : languages[language]["M" + hero] + " - " + (hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_HONOR")] : "Enemy");
	// Convert canvas to a blob url
	canvas.toBlob(function(blob) {
		url = URL.createObjectURL(blob);
		// Update the download link
		document.getElementById("downloadlink").href = url;
		document.getElementById("downloadlink").download = "FeH Unit builder - " + truename;
	});
}

// Simple housekeeping function to add the stats boost from different static modifiers
function staticmodifiers(passives, summoner, buffs) {
	var othermodifiers = [0, 0, 0, 0, 0];

	// Add visible stats from skills
	for (const [category, skill] of Object.entries(passives)) {
		if (skill) {
			othermodifiers = othermodifiers.map(function (value, index) {
				return value + allpassives[skill]["stats"][index];
			});
		}
	}

	// Add resplendent stats
	if (selectattire.value != "Normal") {
		othermodifiers = othermodifiers.map(function (value, index) {
			return value + [2, 2, 2, 2, 2][index];
		});
	}
	// Add bonus unit stats
	if (selectbonusunit.value == "yes") {
		othermodifiers = othermodifiers.map(function (value, index) {
			return value + [10, 4, 4, 4, 4][index];
		});
	}
	// Add transformed beast bonus
	if (selectbeast.value == "yes") {
		othermodifiers[1] += 2;
	}
	// Add summoner support stats
	if (summoner) {
		othermodifiers = othermodifiers.map(function (value, index) {
			return value + summonerranks[summoner][index];
		});
	}

	var allies = {};
	// For each ally selected add it to the dictionary
	for (let i = 0; i < selectallies.selectedOptions.length; i++) {
		let ally = selectallies.selectedOptions[i].value;
		let amount = parseInt(document.getElementById(ally).value);
		allies[ally] = amount;
	}
	// Calculate the visible stats you get for each allied mythic or legendary
	for (const [ally, amount] of Object.entries(allies)) {
		// For each hero we add the visible buffs and multiply for the amount of that ally
		othermodifiers = othermodifiers.map(function (value, index) {
			return value + (other["blessed"][ally]["boosts"][index] * amount);
		});
	}

	// Add the normal visible buffs
	othermodifiers = othermodifiers.map(function (value, index) {
		// This is the value that we will have if we add the buffs
		return value + buffs[index];
	});

	var pairups = [
		0,
		parseInt(selectatkpairup.value) ? parseInt(selectatkpairup.value) : 0,
		parseInt(selectspdpairup.value) ? parseInt(selectspdpairup.value) : 0,
		parseInt(selectdefpairup.value) ? parseInt(selectdefpairup.value) : 0,
		parseInt(selectrespairup.value) ? parseInt(selectrespairup.value) : 0
	];

	// Add the pairup modifiers
	othermodifiers = othermodifiers.map(function (value, index) {
		// This is the value that we will have if we add the pairups
		return value + pairups[index];
	});

	return othermodifiers;
}

function weaponmodifiers(weapon, refine) {
	// Retrieve weapon data
	var weapon = skills["weapons"][weapon];
	var stats = [0, 0, 0, 0, 0];
	// Obtain the values from the refined weapon if it has it available
	if (refine) {
		stats = weapon["refines"][refine]["stats"];
	// Unrefined weapon, just use base values
	} else {
		stats = weapon["stats"];
	}
	return stats;
}

// Visible stats from having Summoner Support
summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2]
};

// Canvas position to render images passive icons at
passiverender = {
	"A": {"icon": [368, 925], "text": [420, 936], "indicator": [396, 947]},
	"B": {"icon": [368, 973], "text": [420, 984], "indicator": [397, 997]},
	"C": {"icon": [368, 1021], "text": [420, 1032], "indicator": [397, 1045]},
	"S": {"icon": [368, 1070], "text": [420, 1079], "indicator": [396, 1093]},
	"X": {"icon": [369, 1119], "text": [420, 1127], "indicator": [396, 1142]}
};
// Condensed canvas position to render images passive icons at
passivecondensedrender = {
	"A": {"icon": [518, 9], "indicator": [543, 33]},
	"B": {"icon": [556, 9], "indicator": [581, 35]},
	"C": {"icon": [594, 9], "indicator": [622, 35]},
	"S": {"icon": [632, 9], "indicator": [655, 35]},
	"X": {"icon": [670, 9], "indicator": [696, 35]}
};
// Echoes canvas position to render images passive icons at
passiveechoesrender = {
	"A": {"icon": [455, 295], "text": [500, 300], "indicator": [475, 315]},
	"B": {"icon": [458, 344], "text": [503, 349], "indicator": [478, 364]},
	"C": {"icon": [464, 392], "text": [510, 397], "indicator": [485, 412]},
	"S": {"icon": [475, 439], "text": [520, 444], "indicator": [495, 459]}
};

// Function that prints certain numbers using numberfont spritesheet
function printnumbers(canvas, characters, type, posX, posY, align, scale = 1) {
	if (typeof characters == "number") {
		// Split the full number on individual ones
		var numbers = characters.toString().split("").map(Number);
		// We have an offset that we must increment with every number to keep pushing each to the left and avoid overlaps
		var offsetX = 0;
		// We invert the order of the loop depending on the type of alignment
		if (align == "end") {
			for (let j = numbers.length - 1; j >= 0; j--) {
				// This is the size that the number will take
				let width = numberfontrender["end"][numbers[j]] - numberfontrender["start"][numbers[j]];
				// Since we are aligning to the end the actual drawing position on the X coordinate is the posX - width - offset
				let trueposX = posX - (width * scale + offsetX);
				// We must crop the numbers at a certain position depending on type and value
				let sourceX = numberfontrender["start"][numbers[j]]; let sourceY = type * 28;
				// Increase the offset before the next interation using the number width (-3 to make sure we fill the gaps)
				offsetX += width * scale - 3;
				// Print the number
				canvas.drawImage(numberfont, sourceX, sourceY, width, 28, trueposX, posY, width * scale, 28 * scale);
			}
		} else {
			for (let j = 0; j < numbers.length; j++) {
				// This is the size that the number will take ()
				let width = numberfontrender["end"][numbers[j]] - numberfontrender["start"][numbers[j]];
				// Since we are aligning to the start the actual drawing position on the X coordinate is the posX + offsetX
				let trueposX = posX + offsetX;
				// We must crop the numbers at a certain position depending on type and value
				let sourceX = numberfontrender["start"][numbers[j]]; let sourceY = type * 28;
				// Increase the offset before the next interation using the number width (-3 to make sure we fill the gaps)
				offsetX += width * scale - 3;
				// Print the number
				canvas.drawImage(numberfont, sourceX, sourceY, width, 28, trueposX, posY, width * scale, 28 * scale);
			}
		}
	// Otherwise we are just printing a simple + or -
	} else {
		// We must crop the character at a certain position depending on type and value
		var sourceX = characters == "+" ? 248 : 271; let sourceY = 3 + (type * 6) + (type * 22);
		// Print the number
		canvas.drawImage(numberfont, sourceX, sourceY, 22, 22, posX, posY, 22, 22);
	}
}
// Position on the X coordinate at which each number of numberfont start and ends (for the Y coordinate it's a simple type x 28px)
numberfontrender = {
	"start": [0, 22, 45, 68, 90, 113, 136, 158, 181, 203],
	"end": [22, 44, 67, 90, 112, 135, 158, 180, 203, 225]
};

// Function that prints certain numbers using numberfont spritesheet
function printhpnumbers(canvas, characters, type, posX, posY, scale = 1) {
	// Split the full number on individual ones
	var numbers = characters.toString().split("").map(Number);
	// We have an offset that we must increment with every number to keep pushing each to the left and avoid overlaps
	var offsetX = 0;
	for (let j = 0; j < numbers.length; j++) {
		// This is the size that the number will take
		let width = hpfontrender["end"][numbers[j]] - hpfontrender["start"][numbers[j]];
		// Since we are aligning to the start the actual drawing position on the X coordinate is the posX + offsetX
		let trueposX = posX + offsetX;
		// We must crop the numbers at a certain position depending on type and value
		let sourceX = hpfontrender["start"][numbers[j]]; let sourceY = type * 50;
		// Increase the offset before the next interation using the number width (-1 for better look)
		offsetX += width * scale - 1;
		// Print the number
		canvas.drawImage(hpfont, sourceX, sourceY, width, 50, trueposX, posY, width * scale, 50 * scale);
	}
}
// Position on the X coordinate at which each number of numberhpfont start and ends (for the Y coordinate it's a simple type x 50px)
hpfontrender = {
	"start": [0, 43, 84, 127, 163, 206, 246, 288, 328, 370],
	"end": [39, 71, 120, 161, 203, 241, 285, 325, 365, 406]
};
