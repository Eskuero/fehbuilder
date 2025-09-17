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

function statcalc(stats, growths, rarity, boon, bane, ascendent, merges, flowers) {
	// Modify the level 1 stats based on the rarity provided
	var almosttruelevel1 = {"HP": stats[0], "Atk": stats[1], "Spd": stats[2], "Def": stats[3], "Res": stats[4]};

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

	return [
		truelevel1["HP"] + generalgrowths[(truegrowth["HP"] / 5) - 4],
		truelevel1["Atk"] + generalgrowths[(truegrowth["Atk"] / 5) - 4],
		truelevel1["Spd"] + generalgrowths[(truegrowth["Spd"] / 5) - 4],
		truelevel1["Def"] + generalgrowths[(truegrowth["Def"] / 5) - 4],
		truelevel1["Res"] + generalgrowths[(truegrowth["Res"] / 5) - 4],
	];
}
// Growth table from https://feheroes.fandom.com/wiki/Stat_growth (this is hardcoded because deriving the actual values from the base formula is increasingly tricky due aproximations .99999 decimals and such). Theorically we should be able to calculate with (math.trunc(truegrowth["Res"] * raritymultipliers[rarity-1]) / 100)
generalgrowths = [8, 10, 13, 15, 17, 19, 22, 24, 26, 28, 30, 33, 35, 37, 39, 42];

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
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function getimage(url, fallback = "/common/base/oopsie.webp") {
	var img = new Image();
	// This premise will not return until the image has fully loaded
	var imageLoadPromise = new Promise(resolve => {
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
		let response = await fetch('/common/data/languages/unitlanguages-' + newlang + '.json');
		let data = await response.json();
		languages[newlang] = data;
	}
	// Make sure all the selects repopulate properly before starting to reload
	await populateall(false);
	reload();
	statictranslations();
}

function setupdownload() {
	var language = selectlanguage.value;
	var hero = selecthero.value;
	// Get desired filename
	var truename = hero == "" ? "None" : hero;
	// Convert canvas to a blob url
	canvas.toBlob(function(blob) {
		url = URL.createObjectURL(blob);
		// Update the image element
		fakecanvas.src = url;
		// Update the download link
		document.getElementById("downloadlink").href = url;
		document.getElementById("downloadlink").download = "FeH Custom Unit builder - " + truename;
	});
}

// Simple housekeeping function to add the stats boost from different static modifiers
function staticmodifiers(summoner) {
	var othermodifiers = [0, 0, 0, 0, 0];

	// All type of skills we grab stats from
	var options = ["weapon", "refine", "Askill", "Bskill", "Cskill", "Sskill", "Xskill"];
	var stats = ["hp", "atk", "spd", "def", "res"];
	for (let i = 0; i < options.length; i++) {
		let skillstats = [];
		for (let j = 0; j < stats.length; j++) {
			let value = document.getElementById(stats[j] + options[i]).value;
			skillstats.push(parseInt(value) ? parseInt(value) : 0);
		}
		othermodifiers = othermodifiers.map(function (value, index) {
			return value + skillstats[index];
		});
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

	return othermodifiers;
}

function showhelp() {
	alert("These are some instructions and explanations for the Custom Unit Builder:\n\n- You can choose a base skill for each category from the already existing ones in the game and it will automatically fill name and visible stats for ease of customization.\n\nThe following information regarding stat calculation only applies if not using advanced mode:\n\n - The game calculates level 40 stats with the following procedure:\n\n1. Take level 1 stats and add +1/-1 on boons/banes.\n2. Take growths percentages and add +5/-5 on boons/banes.\n3. Increase two stats (or three for neutral IVs) for every merge taking priority stats with highest values.\n4. Increase one stat for every flower taking priority the stat with the highest value.\n5. Apply a formula with the modified growth rates obtaining the total growth values for the remaining 39 levels and add it to the level 1 values we got after the 4 first steps.\n\nThis means that since the unit we are generating is fake we do not have neither level 1 values nor growth percentages and have to disregard that entire process.\n\nFor that reason this builder uses as level 40 stats the values provided in the input boxes of the stats section and MERGES/FLOWERS/BOONS/BANES VALUES FROM THE UNIT SECTION ONLY HAVE A COSMETIC EFFECT on the generated hero.\n\nTo theorycraft an already existing unit with different art (per example to showcase an unreleased resplendent) the suggestion is to generate the desired stats on the normal builder and then copy those over.");
}

// Visible stats from having Summoner Support
summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2],
	"S+": [7, 2, 2, 2, 2]
};

// Canvas position to render images passive icons at
passiverender = {
	"A": {"icon": [368, 925], "text": [420, 936], "indicator": [396, 947]},
	"B": {"icon": [368, 973], "text": [420, 984], "indicator": [397, 997]},
	"C": {"icon": [368, 1021], "text": [420, 1032], "indicator": [397, 1045]},
	"S": {"icon": [368, 1070], "text": [420, 1079], "indicator": [396, 1093]},
	"X": {"icon": [369, 1119], "text": [420, 1127], "indicator": [396, 1142]}
};

// Function that prints certain numbers using numberfont spritesheet
function printnumbers(canvas, characters, type, posX, posY, align = "start") {
	if (typeof characters == "number") {
		// Split the full number on individual ones
		var numbers = characters.toString().split("").map(Number);
		// We have an offset that we must increment with every number to keep pushing each to the left and avoid overlaps
		var offsetX = 0;
		// We invert the order of the loop depending on the type of alignment
		if (align == "end") {
			for (let j = numbers.length - 1; j >= 0; j--) {
				// This is the size that the number will take ()
				let width = numberfontrender["end"][numbers[j]] - numberfontrender["start"][numbers[j]];
				// Since we are aligning to the end the actual drawing position on the X coordinate is the posX - width - offset
				let trueposX = posX - (width + offsetX);
				// We must crop the numbers at a certain position depending on type and value
				let sourceX = numberfontrender["start"][numbers[j]]; let sourceY = type * 28;
				// Increase the offset before the next interation using the number width (-3 to make sure we fill the gaps)
				offsetX += width - 3;
				// Print the number
				canvas.drawImage(numberfont, sourceX, sourceY, width, 28, trueposX, posY, width, 28);
			}
		} else {
			for (let j = 0; j < numbers.length; j++) {
				// This is the size that the number will take ()
				let width = numberfontrender["end"][numbers[j]] - numberfontrender["start"][numbers[j]];
				// Since we are aligning to the end the actual drawing position on the X coordinate is the posX - width - offset
				let trueposX = posX + offsetX;
				// We must crop the numbers at a certain position depending on type and value
				let sourceX = numberfontrender["start"][numbers[j]]; let sourceY = type * 28;
				// Increase the offset before the next interation using the number width (-3 to make sure we fill the gaps)
				offsetX += width - 3;
				// Print the number
				canvas.drawImage(numberfont, sourceX, sourceY, width, 28, trueposX, posY, width, 28);
			}
		}
	// Otherwise we are just printing a simple + or -
	} else {
		// We must crop the character at a certain position depending on type and value
		let sourceX = characters == "+" ? 248 : 271; let sourceY = 3 + (type * 6) + (type * 22);
		// Print the number
		canvas.drawImage(numberfont, sourceX, sourceY, 22, 22, posX, posY, 22, 22);
	}
}

// Position on the X coordinate at which each number of numberfont start and ends (for the Y coordinate it's a simple type x 28px)
numberfontrender = {
	"start": [0, 22, 45, 68, 90, 113, 136, 158, 181, 203],
	"end": [22, 44, 67, 90, 112, 135, 158, 180, 203, 225]
};
