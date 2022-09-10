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

async function summon(type) {
	// Get the focus pool content
	focus5pool = []
	for (i = 0; i < select5focus.selectedOptions.length; i++) {
		focus5pool.push(select5focus.selectedOptions[i].value);
	} 
	// Prevent crashes from empty pools with defined gacha percents
	if (focus5pool.length == 0 && parseInt(pityfocus5.value) > 0) {
		alert("You provided a percentage for the 5* focus summons but no members for the pool");
		return;
	}
	focus4pool = []
	for (i = 0; i < select4focus.selectedOptions.length; i++) {
		focus4pool.push(select4focus.selectedOptions[i].value);
	}
	// Prevent crashes from empty pools with defined gacha percents
	if (focus4pool.length == 0 && parseInt(pityfocus4.value) > 0) {
		alert("You provided a percentage for the 4* focus summons but no members for the pool");
		return;
	}
	// Obtain the colors we want to target by looping the currently existing targets
	targetcolors = []
	for (i = 0; i < targets.length; i++) {
		// Do not add unless the target has a number bigger than 0
		if (parseInt(document.getElementById(targets[i]).value) > 0) {
			targetcolors.push(detectcolor(units[targets[i]]["weapon"]));
		}
	}
	// Prevent no-summon circles when you select sniping but not focusing on units
	if (method.value == "snipe" && targetcolors.length == 0) {
		alert("You choose sniping as the summoning strategy but provided no targets");
		return;
	}
	// We always calculate to the total percetange by adding each of gacha inputs
	totalpercent = parseFloat(pityfocus5.value) + parseFloat(pityofffocus5.value) + parseFloat(pityfocus4.value) + parseFloat(pityspecial4.value) + parseFloat(pityofffocus4.value) + parseFloat(pityofffocus3.value)
	// Confirm with the user that he wants to continue despite not using a clean percentage value of 100
	if (totalpercent != 100) {
		if (confirm("The total percentage of all gacha values isn't 100%. Continue?") == false) {
			return;
		}
	}
	// Initiate the pool that we are going to use for this summoning session
	pool = [
		{"percent": parseFloat(pityfocus5.value), "pool": focus5pool, "rarity": 5},
		{"percent": parseFloat(pityofffocus5.value), "pool": permapools["5starpool"], "rarity": 4.9},
		{"percent": parseFloat(pityfocus4.value), "pool": focus4pool, "rarity": 4},
		{"percent": parseFloat(pityspecial4.value), "pool": permapools["4starspecialpool"], "rarity": 4.5},
		{"percent": parseFloat(pityofffocus4.value), "pool": permapools["4starpool"], "rarity": 4},
		{"percent": parseFloat(pityofffocus3.value), "pool": permapools["3starpool"], "rarity": 3}
	]
	// Get a random value between 0 and the totalpercent five times to get the pool to draw heroes from
	randomvalues = [(Math.random() * totalpercent).toFixed(2), (Math.random() * totalpercent).toFixed(2), (Math.random() * totalpercent).toFixed(2), (Math.random() * totalpercent).toFixed(2), (Math.random() * totalpercent).toFixed(2)];
	// Heroes we obtained
	draws = [];
	// FIXME: For ease of testing
	drawsnames = [];
	console.log(randomvalues)
	// FIXME: For now force summon the last hero if none matched our target but we should allow to set color priorities
	totalsummoned = 0;
	// Now the loop the entire pool for each random value (adding each percent on top of each other to check where the roll landed) then pick one randomly
	for (i = 0; i < randomvalues.length; i++) {
		offset = 0;
		for (j = 0; j < pool.length; j++) {
			// If the random value is smaller than the rarity associated with the pool we got a match
			if (offset + pool[j]["percent"] > randomvalues[i]) {
				// So obtain another random number to determine the hero
				heronumber = Math.floor((Math.random() * pool[j]["pool"].length));
				// Get the color of the hero based on his weapon
				color = detectcolor(units[pool[j]["pool"][heronumber]]["weapon"]);
				// If the color is that of one our targets or we are doing full circles we unveil it
				summoned = targetcolors.includes(color) || method.value == "full" ? true : false;
				// FIXME: For now force summon the last hero if none matched our target but we should allow to set color priorities
				totalsummoned += summoned ? 1 : 0;
				summoned = i == 4 && totalsummoned == 0 ? true : summoned;
				// Add it to the draw and break out of this loop
				draws.push({"hero": pool[j]["pool"][heronumber], "rarity": pool[j]["rarity"], "color": color, "summoned": summoned});
				// FIXME: For ease of testing
				drawsnames.push(languages[selectlanguage.value]["M" + pool[j]["pool"][heronumber]] + ": " + languages[selectlanguage.value][pool[j]["pool"][heronumber].replace("PID", "MPID_HONOR")])
				break;
			// If not a match, increase the offset using the percent and let the loop continue onto the next pool check
			} else {
				offset += pool[j]["percent"];
			}
		}
	}
	console.log(draws)
	// Loop through all the summons to increase our pity if needed
	for (i = 0; i < draws.length; i++) {
		// We only care about what we unveiled
		if (draws[i]["summoned"]) {
			// If the rarity is 5 reset the pityrun to 0
			if (draws[i]["rarity"] == 5) {
				console.log("focus")
				pityrun = 0;
			// If it is 4.9 reduce the pityrun by 20 to mimic the in-game (off-focus 5 star only reduces pity by a combined 2%
			} else if (draws[i]["rarity"] == 4.9) {
				console.log("offfocus")
				pityrun = (pityrun - 20 < 0) ? 0 : pityrun - 20;
				draws[i]["rarity"] = 5;
			// If it is 4.5 let's patch it before drawing so it becomes 5
			} else if (draws[i]["rarity"] == 4.5) {
				console.log("special")
				draws[i]["rarity"] = 5;
			// For any other rarity the pityrun must be increased by 1
			} else {
				pityrun += 1;
			}
		}
	}
	// Now we the renewed pityrun modify the gacha pity rates accordingly
	modifiersamount = parseInt(pityrun / 5);
	// When the offfocus5 value is set to 0 we increase the focus by 0.5, otherwise both go up by 0.25
	if (offfocus5.value == "0") {
		pityfocus5.value = parseInt(focus5.value) + (0.5 * modifiersamount);
	} else if (focus5.value == "0") {
		pityofffocus5.value = parseInt(offfocus5.value) + (0.5 * modifiersamount);
	} else {
		pityfocus5.value = parseInt(focus5.value) + (0.25 * modifiersamount);
		pityofffocus5.value = parseInt(offfocus5.value) + (0.25 * modifiersamount);
	}
	// Always reduce 4 and 3 stars pool by 0.3 and 0.2 respectively (FIXME: This is not accurate but close enough for now until I figure out the correct rules)
	pityofffocus4.value = parseInt(offfocus4.value) - (0.3 * modifiersamount);
	pityofffocus3.value = parseInt(offfocus3.value) - (0.2 * modifiersamount);
	console.log(drawsnames)
	drawcircle(draws)
}

// X,Y centered positions for each summoned hero sprite
position = [
	[356, 322],
	[568, 472],
	[488, 724],
	[224, 724],
	[144, 472]
]
async function drawcircle(heroes) {
	// Obtain the object
	var preview = document.getElementById("canvas").getContext("2d");

	// Print the background
	await getimage("/common/other/summoningaltar.webp").then(img => {
		preview.drawImage(img, -173, 0, 1067, 1280);
	})

	// FIXME: For now we summon the last 
	// Draw every hero in the canvas clockwise order
	for (i = 0; i < heroes.length; i++) {
		// If summoned print the sprites
		if (heroes[i]["summoned"]) {
			await getimage("/common/sprites/" + heroes[i]["hero"] + ".webp").then(img => {
				// We need offsetting based on the sprite sizes to properly center them
				offsetX = img.width / 2; offsetY = img.height / 2;
				preview.drawImage(img, position[i][0] - offsetX, position[i][1] - offsetY);
			});
			// Print the rarity of the hero below their sprite
			await getimage("/common/other/rarity" + heroes[i]["rarity"] + ".webp").then(img => {
				// We need offsetting based on the sprite sizes to properly place them below
				preview.drawImage(img, position[i][0] - (img.width / 2), position[i][1] + offsetY - 10);
			});
		// Otherwise print the corresponding color
		} else {
			// Print the rarity of the hero below their sprite
			await getimage("/common/other/" + heroes[i]["color"] + "_orb.webp").then(img => {
				// We need offsetting based on the sprite sizes to properly center them
				offsetX = img.width / 2; offsetY = img.height / 2;
				preview.drawImage(img, position[i][0] - offsetX, position[i][1] - offsetY);
			});
		}
	}
	// Convert canvas to a data url
	var url = document.getElementById("canvas").toDataURL("image/png");
	// Update the image element
	document.getElementById("fakecanvas").src = url;
}

async function getimage(url, fallback = "/common/base/oopsie.webp") {
	// This premise will not return until the image has fully loaded
	const imageLoadPromise = new Promise(resolve => {
		img = new Image();
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

// Return a color string based on weapon ID for the hero (for detection of orb to print when sniping
function detectcolor(weaponid) {
	if ([0,3,7,11,16,20].includes(weaponid)) {
		return "red";
	} else if ([1,4,8,12,17,21].includes(weaponid)) {
		return "blue";
	} else if ([2,5,9,13,18,22].includes(weaponid)) {
		return "green";
	} else {
		return "colorless";
	}
}
