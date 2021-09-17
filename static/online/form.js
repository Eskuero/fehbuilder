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

// Fetch all data from each json
fetch('/common/data/fulllanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out;
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/fullunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out;
				populate(selectheroes, units, true, true);
		}).catch(err => console.error(err));
		fetch('/common/data/fullskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out;
				// We need to have all skills available as a whole in case we use cheat seals
				allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"])
				populateall();
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/fullother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
		init();
}).catch(err => console.error(err));

async function init() {
	// Load and wait for the font to be ready
	const font = new FontFace("FeH-Font", "url('/common/feh-font.woff2') format('woff2')");
	await font.load();
	document.fonts.add(font);

	// Load the numberfont specifically since we will use it multiple times
	numberfont = undefined;
	await getimage(other["images"]["other"]["numberfont"]).then(img => {
		numberfont = img;
	})

	// Draw it for the first time
	reload();
}

async function reload() {
	// Obtain the object
	var preview = document.getElementById("fakecanvas").getContext("2d");
	// Sometimes the text stroke could cause graphical glitches
	preview.miterLimit = 2;

	// Hero ID
	hero = selectheroes.value == "None" ? false : selectheroes.value;

	// Print the background depending on the type of support
	background = selectsummoner.value == "None" ? "bgnosupport" : "bgsupport";
	await getimage(other["images"]["other"][background]).then(img => {
		preview.drawImage(img, -173, 0, 1067, 1280);
	})

	// Save the context here in case we need to do so some flipping
	preview.save();
	artoffsetX = parseInt(selectoffsetX.value);
	artoffsetY = parseInt(selectoffsetY.value);
	// We only make modifications if some mirror config is set to other than None
	switch (mirror.value) {
		case "Horizontal":
			preview.translate(720, 0);
			preview.scale(-1, 1);
			artoffsetX = -artoffsetX;
			break;
		case "Vertical":
			preview.translate(0, 1280);
			preview.scale(1, -1);
			artoffsetY = -artoffsetY;
			break;
		case "Both":
			preview.translate(720, 1280);
			preview.scale(-1, -1);
			artoffsetX = -artoffsetX;
			artoffsetY = -artoffsetY;
			break;
	}
	// Print the hero art selected
	if (hero) {
		// If we selected Resplendent and it actually is a legit choose the art
		attire = (selectattire.value == "Resplendent" && languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"]) ? "_Resplendent_" : "_";
		await getimage("../common/heroes/" + hero + attire + selectartstyle.value + ".webp", "/common/base/missigno.webp").then(img => {
			// We always print the image at the 0 coordinate on Y, but this is not good enough when vertically flipping because we expect the lower half of the hero not to be cut
			coordinateY = ["Vertical", "Both"].includes(mirror.value) ? - (img.height - 1280) : 0;
			preview.drawImage(img, -305 + artoffsetX, coordinateY - artoffsetY);
		})
	}
	// Always restore the previous context to avoid issues
	preview.restore();
	
	// Print the foregroundUI
	foreground = appui.checked ? other["images"]["other"]["fgui"] : other["images"]["other"]["fgnoui"]
	await getimage(foreground).then(img => {
		preview.drawImage(img, 0, 0);
	})
	
	//After this if no hero is selected we STOP
	if (!hero) {
		return;
	}

	// Print the rarity line
	// Convert the rarity variable into an int now to cater to calculation needs
	rarity = selectrarity.value == "Forma" ? 5 : parseInt(selectrarity.value)
	// The width of the line depends of the amount of stars, increasing 37 for each from a base value of 16 (margins?)
	await getimage(other["images"]["rarity"][selectrarity.value]).then(img => {
		preview.drawImage(img, 65, 505, 16 + (rarity * 37), 53);
	})
	
	// Print the resplendent icon
	if (["Resplendent", "Stats-Only"].includes(selectattire.value)) {
		await getimage(other["images"]["other"]["resplendent"]).then(img => {
			preview.drawImage(img, 262, 492, 82, 82);
		})
	}

	// Language selected
	language = selectlanguage.value;

	// Print title and name
	title = hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_HONOR")] : "Enemy";
	// Use horizontally centered anchor to avoid going out of bounds
	preview.fillStyle = 'white'; preview.strokeStyle = 'rgb(50, 30, 10)'; preview.textAlign = 'center'; preview.textBaseline = "middle"; preview.font = '35px FeH-Font'; preview.lineWidth = 6;
	// Add the fill and the stroke for the title
	preview.strokeText(title, 188, 585); preview.fillText(title, 188, 585);
	// Add the fill and the stroke for the name
	name = languages[language]["M" + hero];
	preview.strokeText(name, 222, 659); preview.fillText(name, 222, 659);

	// Print the artist and actor names, as well as the favorite mark and other minor strings if appui is enabled
	if (appui.checked) {
		preview.fillStyle = 'white'; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.font = '21px FeH-Font';
		// If the hero is truly a resplendent one we might have data for it
		if (selectattire.value == "Resplendent" && languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"]) {
			voice = languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"];
			artist = languages[language][hero.replace("PID", "MPID_ILLUST") + "EX01"];
		} else {
			voice = hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_VOICE")] : ""
			artist = hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_ILLUST")] : ""
		}
		preview.strokeText(voice, 47, 1213); preview.fillText(voice, 47, 1213);
		preview.strokeText(artist, 47, 1242); preview.fillText(artist, 47, 1242);
		// Print favorite icon
		await getimage(other["images"]["favorite"][selectfavorite.value]).then(img => {
			preview.drawImage(img, 3, 229, 90, 92);
		})
		// Translate buttons
		preview.font = '24px FeH-Font'; preview.textAlign = 'center'; preview.textBaseline = "middle";
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLSET"], 126, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLSET"], 126, 1175);
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLEQUIP"], 360, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLEQUIP"], 360, 1175);
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLLEARN"], 594, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLLEARN"], 594, 1175);
		preview.font = '26px FeH-Font';
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_TALK"], 617, 47); preview.fillText(languages[language]["MID_UNIT_INFO_TO_TALK"], 617, 47);
	}

	boon = selectboons.value == "None" ? false : selectboons.value; bane = selectbanes.value == "None" ? false : selectbanes.value; merges = parseInt(selectmerges.value);
	// First write the static text for each stat (normal anchoring)
	preview.font = '25px FeH-Font'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.strokeStyle = '#0a2533';
	stats = ["HP", "Atk", "Spd", "Def", "Res"]; statsstrings = ["MID_HP", "MID_ATTACK", "MID_AGILITY", "MID_DEFENSE", "MID_RESIST"]
	// Each stat name is pushed down by 49pixels with an initial offset of 805
	for (i = 0; i < stats.length; i++) {
		// The filling color vaires depending of it being a boon, bane (without merges) or neutral
		preview.fillStyle = stats[i] == boon ? "#b1ecfa" : (stats[i] == bane && merges == 0 ? "#f0a5b3" : "#ffffff");
		preview.strokeText(languages[language][statsstrings[i]], 115, 805 + (i * 49) + (i * 0.3)); preview.fillText(languages[language][statsstrings[i]], 115, 805 + (i * 49) + (i * 0.3));
	}
	preview.font = '24px FeH-Font'; preview.fillStyle = 'white';
	preview.strokeText(languages[language]["MID_SKILL_POINT"], 120, 1052); preview.fillText(languages[language]["MID_SKILL_POINT"], 120, 1052);
	preview.strokeText(languages[language]["MID_HEROISM_POINT"], 115, 1103); preview.fillText(languages[language]["MID_HEROISM_POINT"], 115, 1103);

	flowers = parseInt(selectflowers.value);
	// Obtain the calculated stats to draw
	statsmodifier = statcalc(units[hero]["stats"], units[hero]["growths"], rarity, boon, bane, merges, flowers);

	weapon = selectweapons.value == "None" ? false : selectweapons.value; refine = selectrefines.value == "None" ? false : selectrefines.value;
	//We have a couple of stats modifiers based on weapon, summoner support, attire, bonus unit, visible buffs and maybe not completely parsed A/S skills that we must add
	if (weapon) {
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + weaponmodifiers(weapon, refine)[index];
		});
	}

	passives = {
		"A": selectA.value == "None" ? false : selectA.value,
		"B": selectB.value == "None" ? false : selectB.value,
		"C": selectC.value == "None" ? false : selectC.value,
		"S": selectS.value == "None" ? false : selectS.value
	}
	// Add visible stats from skills
	for (const [category, skill] of Object.entries(passives)) {
		if (skill) {
			statsmodifier = statsmodifier.map(function (value, index) {
				return value + allpassives[skill]["statModifiers"][index];
			});
		}
	}

	// Add resplendent stats
	if (selectattire.value != "Normal") {
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + [2, 2, 2, 2, 2][index];
		});
	}
	// Add bonus unit stats
	if (selectbonusunit.value == "yes") {
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + [10, 4, 4, 4, 4][index];
		});
	}
	// Add transformed beast bonus
	if (selectbeast.value == "yes") {
		statsmodifier[1] += 2;
	}
	summoner = selectsummoner.value == "None" ? false : selectsummoner.value;
	// Add summoner support stats
	if (summoner) {
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + summonerranks[summoner][index];
		});
	}

	allies = {};
	// For each ally selected add it to the dictionary
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		ally = selectallies.selectedOptions[i].value.split(";");
		amount = parseInt(ally[1])
		allies[ally[0]] = allies[ally[0]] ? allies[ally[0]] + amount : amount;
	}
	// Calculate the visible stats you get for each allied mythic or legendary
	for (const [ally, amount] of Object.entries(allies)) {
		// For each hero we add the visible buffs and multiply for the amount of that ally
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + (other["blessed"][ally]["boosts"][index] * amount);
		});
	}

	buffs = [
		0,
		parseInt(selectatk.value) ? parseInt(selectatk.value) : 0,
		parseInt(selectspd.value) ? parseInt(selectspd.value) : 0,
		parseInt(selectdef.value) ? parseInt(selectdef.value) : 0,
		parseInt(selectres.value) ? parseInt(selectres.value) : 0
	];
	// Add the normal visible buffs
	statsmodifier = statsmodifier.map(function (value, index) {
		// This is the value that we will have if we add the buffs
		modifier = value + buffs[index];
		// The stat cannot go beyond 99 or below 0
		stat = -1 < modifier ? (modifier < 100 ? modifier : 99) : 0;
		return stat;
	});

	// Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers).
	for (i = 0; i < stats.length; i++) {
		// Decide type of font depending on if we buffer, debuffed or neutral
		numbertype = buffs[i] > 0 ? 2 : (buffs[i] < 0 ? 3 : 0);
		// Each stat name is pushed down by 49 pixels with an initial offset of 805
		printnumbers(preview, statsmodifier[i], numbertype, 265, 805 + (i * 49) + (i * 0.3), "end");
	}
	// Print the amount of SP and HM
	numbertype = selectsp.value >= "9999" ? 4 : 0;
	printnumbers(preview, parseInt(selectsp.value), numbertype, 265, 1052, "end");
	numbertype = selecthm.value >= "7000" ? 4 : 0;
	printnumbers(preview, parseInt(selecthm.value), numbertype, 265, 1100, "end");

	accessory = selectaccessory.value == "None" ? false : selectaccessory.value;
	// If we selected an accessory we paste a newer bigger holder and define an offset to push all next items to the right
	offset = 0;
	if (accessory) {
		await getimage(other["images"]["other"]["accessoryexpand"]).then(img => {
			preview.drawImage(img, 4, 732);
		});
		await getimage(other["images"]["accessory"][accessory]).then(img => {
			preview.drawImage(img, 256, 743, 32, 32);
		});
		offset += 27;
	}
	// Print the move type and weapon type icons
	await getimage(other["images"]["movetype"][units[hero]["moveType"]]).then(img => {
		// Position is slightly off if we had an accessory
		posX = accessory ? 223 : 229;
		preview.drawImage(img, posX, 743, 32, 32);
	});
	await getimage(other["images"]["weapontype"][units[hero]["WeaponType"]]).then(img => {
		preview.drawImage(img, 20, 743, 32, 32);
	});
	// Print the level string
	preview.font = '24px FeH-Font'; preview.fillStyle = "#ffffff"; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start';
	preview.strokeText(languages[language]["MID_LEVEL2"], 70, 746); preview.fillText(languages[language]["MID_LEVEL2"], 70, 746);
	// Print the level 40. It was hardcoded previously so we just do this to make sure it doesn't look off side by side with the merge count
	printnumbers(preview, 40, 1, 124, 745);

	// If we have merges we add the text next to the level
	if (merges > 0) {
		// Decide type of font depending on if we are fully merged or not
		numbertype = merges == 10 ? 4 : 1;
		printnumbers(preview, "+", numbertype, 163, 748);
		printnumbers(preview, merges, numbertype, 181, 745);
	}
	preview.fillStyle = "#ffffff";
	// If we have flowers we add another box with the number
	if (flowers > 0) {
		await getimage(other["images"]["other"]["flowerholder"]).then(img => {
			preview.drawImage(img, 271 + offset, 732);
		});
		await getimage(other["images"]["flowers"][units[hero]["moveType"]]).then(img => {
			preview.drawImage(img, 289 + offset, 727, 60, 60);
		});
		printnumbers(preview, "+", 1, 345 + offset, 748);
		printnumbers(preview, flowers, 1, 364 + offset, 745);
		offset += 147;
	}

	// Paste the exp indicator
	await getimage(other["images"]["other"]["expindicator"]).then(img => {
		preview.drawImage(img, 271 + offset, 732);
	});
	preview.font = '24px FeH-Font';
	preview.strokeText(languages[language]["MID_EXP"], 308 + offset, 745); preview.fillText(languages[language]["MID_EXP"], 308 + offset, 745);
	preview.strokeText(languages[language]["MID_UNIT_INFO_EXP_MAX"], 415 + offset, 745); preview.fillText(languages[language]["MID_UNIT_INFO_EXP_MAX"], 415 + offset, 745);

	// If the weapon is valid try to print an icon
	if (weapon) {
		// By default we always use the basic weapon icon or the predefined stat boosters ones
		weaponicon = ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"].includes(refine) ? other["images"]["refines"][refine] : other["images"]["other"]["noweapon"];
		// If the icon is an special effect we might have to download it
		if (refine == "Effect" && skills["weapons"][weapon]["refines"]["Effect"]) {
			weaponicon = "../common/icons/" + weapon + "-Effect.webp"
		}
		await getimage(weaponicon).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		});
		// Get the string to print
		printableweapon = languages[language]["M" + weapon];
	// If not just print the basic icon
	} else {
		printableweapon = "-";
		await getimage(other["images"]["other"]["noweapon"]).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		});
	}
	// We always paste the text because it might as well be unarmed and have a "-"
	preview.fillStyle = refine ? "#82f546" : "#ffffff";
	preview.strokeText(printableweapon, 420, 806); preview.fillText(printableweapon, 420, 806);

	assist = selectassists.value == "None" ? "-" : languages[language]["M" + selectassists.value];
	special = selectspecials.value == "None" ? "-" : languages[language]["M" + selectspecials.value];
	// Print assist and special info
	preview.fillStyle = "#ffffff";
	preview.strokeText(assist, 420, 854); preview.fillText(assist, 420, 854);
	preview.strokeText(special, 420, 904); preview.fillText(special, 420, 904);

	// Render all the passives
	for (const [category, skill] of Object.entries(passives)) {
		name = "-"
		// If the passive doesn't exist skip
		if (allpassives[skill]) {
			await getimage("../common/icons/" + skill + ".webp").then(img => {
				// If the image size is bigger than 44 these are some tier 4 skills that have shiny borders and their icon must be and offsetted accordingly
				iconoffset = img.height > 44 ? -2 : 0;
				preview.drawImage(img, passiverender[category]["icon"][0] + iconoffset, passiverender[category]["icon"][1] + iconoffset);
			});
			name = languages[language]["M" + skill];
		}
		// We always write the text because it might be a simple "-"
		preview.strokeText(name, passiverender[category]["text"][0], passiverender[category]["text"][1])
		preview.fillText(name, passiverender[category]["text"][0], passiverender[category]["text"][1]);
		// Print the category indicator
		await getimage(other["images"]["skillindicators"][category]).then(img => {
			preview.drawImage(img, passiverender[category]["indicator"][0], passiverender[category]["indicator"][1], 21, 21);
		});
	}

	blessing = selectblessings.value == "None" ? false : parseInt(selectblessings.value);
	// X amount to additionally push each icon to the left
	offsetX = 0;
	// Detect if we are printing more than three icons (this could happen on duo/blessed/summoner supported allies) so we can resize accordingly
	needsresize = blessing && summoner && other["duo"].includes(hero) ? true : false;
	posY = needsresize ? 595 : 570; posX = needsresize ? 600 : 575;
	width = needsresize ? 115 : 147; height = needsresize ? 125 : 160;
	// If blessed print the icon
	if (blessing) {
		// If the hero is on the list of the blessed ones for that particular blessing it has icon variant defined (otherwise use the normal one)
		variant = other["blessed"][hero] ? other["blessed"][hero]["variant"] : "normal";
		blessingicon = other["images"]["blessing"][blessing-1][variant]
		await getimage(blessingicon).then(img => {
			preview.drawImage(img, posX, posY, width, height);
		});
		// If printed a blessing the next's position icon must go further to the left
		offsetX += needsresize ? 100 : 125;
	}

	// If is a duo hero of any kind print the icon
	if (other["duo"].concat(other["resonant"]).includes(hero)) {
		specialtype = other["duo"].includes(hero) ? "Duo" : "Resonance";
		specialicon = other["images"]["other"][specialtype];
		await getimage(specialicon).then(img => {
			preview.drawImage(img, posX - offsetX, posY, width, height);
		});
		// If printed a duo icon the next's position icon must go further to the left
		offsetX += needsresize ? 100 : 125;
		// If appui is enabled we also print the conversation icon
		if (appui.checked) {
			await getimage(other["images"]["other"]["duoconversation"]).then(img => {
				preview.drawImage(img, 3, 322);
			});
		}
	}

	// If summoner supported print the icon
	if (summoner) {
		await getimage(other["images"]["summoner"][summoner]).then(img => {
			preview.drawImage(img, posX - offsetX, posY, width, height);
		});
	}
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

function download() {
	// Hero ID
	hero = selectheroes.value == "None" ? false : selectheroes.value;
	if (hero) {
		// Convert canvas to a data url
		var url = document.getElementById("fakecanvas").toDataURL("image/png");
		// Get desired filename
		language = selectlanguage.value;
		truename = languages[language]["M" + hero] + " - " + (hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_HONOR")] : "Enemy");
		// Create the link element to force the download
		var link = document.createElement('a');
		link.href = url;
		link.download = "FeH Unit builder - " + truename;
		// Add the link, click it to force download and delete it again
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

function updateRefine() {
	// Get current value to restore it back if possible
	previousvalue = selectrefines.value
	weapon = selectweapons.value

	// Clear all children on the refine select first
	while (selectrefines.lastChild) {
		selectrefines.removeChild(selectrefines.lastChild);
	}
	// Always add the None option with it's proper translation
	var opt = document.createElement('option');
	opt.value = "None";
	opt.innerHTML = languages[selectlanguage.value]["MSID_H_NONE"];
	selectrefines.appendChild(opt);
	if (weapon == "None") {
		return;
	}
	// Get the list of refines for that weapon
	refines = Object.keys(skills["weapons"][weapon]["refines"])
	for (i = 0; i < refines.length; i++) {
		var opt = document.createElement('option');
		opt.value = refines[i];
		opt.innerHTML = refines[i];
		selectrefines.appendChild(opt);
	}
	// Restore the previous value if it's available on the updated select
	if ([...selectrefines.options].map(opt => opt.value).includes(previousvalue)) {
		selectrefines.value = previousvalue;
	}
}
