// Used to loop through all stats names and translations
statsnames = ["HP", "Atk", "Spd", "Def", "Res"]; statsstrings = ["MID_HP", "MID_ATTACK", "MID_AGILITY", "MID_DEFENSE", "MID_RESIST"];

async function echoes() {
	// Obtain the object
	var preview = canvas.getContext("2d");
	// Sometimes the text stroke could cause graphical glitches
	preview.miterLimit = 2;

	// Hero ID
	var hero = selectheroes.value == "None" ? false : selectheroes.value;
	// Language selected
	var language = selectlanguage.value;

	// Print the background
	await getimage(other["images"]["other"]["bgechoes"]).then(img => {
		preview.drawImage(img, 0, 0);
	});

	// Save the context here in case we need to do so some flipping
	preview.save();
	var artoffsetX = parseInt(selectoffsetX.value);
	var artoffsetY = parseInt(selectoffsetY.value);
	// We only make modifications if some mirror config is set to other than None
	switch (mirror.value) {
		case "Horizontal":
			preview.translate(720, 0);
			preview.scale(-1, 1);
			var artoffsetX = -artoffsetX + 200;
			break;
		case "Vertical":
			preview.translate(0, 540);
			preview.scale(1, -1);
			var artoffsetY = -artoffsetY;
			break;
		case "Both":
			preview.translate(720, 540);
			preview.scale(-1, -1);
			var artoffsetX = -artoffsetX + 200;
			var artoffsetY = -artoffsetY;
			break;
	}

	// Print the hero art selected
	if (hero) {
		// If we selected Resplendent and it actually is a legit choose the art
		var attire = (selectattire.value == "Resplendent" && languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"]) ? "_Resplendent_" : "_";
		var style = selectartstyle.value;
		await getimage("../common/heroes/" + hero + attire + style + ".webp").then(img => {
			preview.drawImage(img, -400 + artoffsetX, 50 - artoffsetY);
		});
	}
	// Always restore the previous context to avoid issues
	preview.restore();

	// Print the foregroundUI
	await getimage(other["images"]["other"]["fgechoes"]).then(img => {
		preview.drawImage(img, 0, 0);
	});

	// After this if no hero is selected we STOP and clear the queue
	if (!hero) {
		renderingqueue.shift();
		return;
	}

	// Convert the rarity variable into an int now to cater to calculation needs
	var rarity = selectrarity.value == "Forma" ? 5 : parseInt(selectrarity.value);
	await getimage(other["images"]["rarity"][selectrarity.value]).then(img => {
		// We must resize which means width must vary proportionally
		var height = 34; var width = (img.width / img.height) * height;
		preview.drawImage(img, 15, 45, width, height);
	});

	// Print hero name
	preview.fillStyle = 'white'; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.font = '21px FeH-Font'; preview.lineWidth = 6;
	// Add the fill and the stroke for the name
	var name = languages[language]["M" + hero] + ": " + languages[language][hero.replace("PID", "MPID_HONOR")];
	preview.fillText(name, 8, 7);

	var boon = selectboons.value == "None" ? false : selectboons.value; var bane = selectbanes.value == "None" ? false : selectbanes.value; var ascendent = selectascendent.value == "None" ? false : selectascendent.value; var merges = parseInt(selectmerges.value);
	// First write the static text for each stat (normal anchoring)
	preview.font = '20px FeH-Font'; preview.textAlign = 'end'; preview.textBaseline = "top"; preview.lineWidth = 6; preview.fillStyle = '#cd7b7b';
	// Each stat name is pushed down by 49pixels with an initial offset of 805
	for (let i = 0; i < statsnames.length; i++) {
		// The boon indicator varies depending of it being a boon, bane (without merges), neutral or ascendent
		if (boon == statsnames[i]) {
			var indicator = "+";
		} else if (bane == statsnames[i]) {
			if (merges != 0 && ascendent == statsnames[i]) {
				var indicator = "+";
			} else if (merges != 0 || ascendent == statsnames[i]) {
				var indicator = "";
			} else {
				var indicator = "-";
			}
		} else if (ascendent == statsnames[i]) {
			var indicator = "+";
		} else {
			var indicator = "";
		}
		// Depending on the stat top margin varies a lot
		let left = 67;
		let down = (i * 30) + (1.3 * i) + 264;
		preview.fillText(indicator + languages[language][statsstrings[i]].toUpperCase(), left, down);
	}

	var flowers = parseInt(selectflowers.value);
	// Obtain the calculated stats to draw
	var statsmodifier = statcalc(units[hero]["stats"], units[hero]["growths"], rarity, boon, bane, ascendent, merges, flowers);

	var weapon = selectweapons.value == "None" ? false : selectweapons.value; var refine = selectrefines.value == "None" ? false : selectrefines.value;
	// We have a couple of stats modifiers based on weapon, summoner support, attire, bonus unit, visible buffs and maybe not completely parsed A/S skills that we must add
	if (weapon) {
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + weaponmodifiers(weapon, refine)[index];
		});
	}

	// Retrieve passives, ss and buffs
	var passives = {
		"A": selectA.value == "None" ? false : selectA.value,
		"B": selectB.value == "None" ? false : selectB.value,
		"C": selectC.value == "None" ? false : selectC.value,
		"S": selectS.value == "None" ? false : selectS.value
	};
	var summoner = selectsummoner.value == "None" ? false : selectsummoner.value;
	var buffs = [
		0,
		parseInt(selectatk.value) ? parseInt(selectatk.value) : 0,
		parseInt(selectspd.value) ? parseInt(selectspd.value) : 0,
		parseInt(selectdef.value) ? parseInt(selectdef.value) : 0,
		parseInt(selectres.value) ? parseInt(selectres.value) : 0
	];
	// Add visible stats from multiple simple origins like passives, SS, resplendent, beast transformation and bonus
	statsmodifier = statsmodifier.map(function (value, index) {
		return value + staticmodifiers(passives, summoner, buffs)[index];
	});

	// Fix stats, cannot go beyond 99 or below 0
	for (let i = 0; i < statsmodifier.length; i++) {
		statsmodifier[i] = -1 < statsmodifier[i] ? (statsmodifier[i] < 100 ? statsmodifier[i] : 99) : 0;
	}

	// Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers).
	for (let i = 0; i < statsnames.length; i++) {
		// Depending on the stat top margin varies a lot
		let left = 107;
		let down = (i * 30) + (1.3 * i) + 264;
		// Depending of it's buffed or no the color of the text varies
		preview.fillStyle = buffs[i] > 0 ? "#63e5ef" : (buffs[i] < 0 ? "#ff506e" : 'white');
		preview.fillText(statsmodifier[i], left, down);
	}

	// Print the move type and weapon type icons
	await getimage(other["images"]["movetype"][units[hero]["move"]]).then(img => {
		preview.drawImage(img, 678, 43, 38, 38);
	});
	await getimage(other["images"]["weapontype"][units[hero]["weapon"]]).then(img => {
		let size = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[hero]["weapon"]) ? 42 : 38;
		let offset = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[hero]["weapon"]) ? -2 : 0;
		preview.drawImage(img, 638 + offset, 43 + offset, size, size);
	});

	// Optionally print floret, resplendent and accessory indicator
	var offsetX = 0;
	var accessory = selectaccessory.value == "None" ? false : selectaccessory.value;
	if (accessory) {
		await getimage(other["images"]["accessory"][accessory]).then(img => {
			preview.drawImage(img, 598 - offsetX, 44, 37, 37);
		});
		offsetX += 44;
	}
	if (ascendent) {
		await getimage(other["images"]["other"]["ascendent"]).then(img => {
			preview.drawImage(img, 598 - offsetX, 41, 40, 40);
		});
		offsetX += 42;
	}
	if (["Resplendent", "Stats-Only"].includes(selectattire.value)) {
		await getimage(other["images"]["other"]["resplendent-small"]).then(img => {
			preview.drawImage(img, 598 - offsetX, 39, 45, 42);
		});
	}
	// Print the level string
	preview.font = '22px FeH-Font'; preview.fillStyle = "#cd7b7b"; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start';
	preview.fillText(languages[language]["MID_LEVEL2"], 445, 7);
	// Print the level 40. It was hardcoded previously so we just do this to make sure it doesn't look off side by side with the merge count
	preview.fillStyle = "white";
	preview.fillText("40", 490, 7);

	// If we have merges we add the text next to the level
	if (merges > 0) {
		// Decide type of font depending on if we are fully merged or not
		preview.fillStyle = merges == 10 ? "#82f546" : "white";
		preview.fillText("+", 525, 5);
		preview.fillText(merges, 540, 7);
	}
	preview.fillStyle = "#ffffff";
	// If we have flowers we add them with the number
	if (flowers > 0) {
		await getimage(other["images"]["flowers"][units[hero]["move"]]).then(img => {
			preview.drawImage(img, 615, 0, 32, 32);
		});
		preview.fillText("+", 650, 5);
		preview.fillText(flowers, 665, 7);
	}

	// If the weapon is valid try to print an icon
	if (weapon) {
		// By default we always use the basic weapon icon or the predefined stat boosters ones
		var weaponicon = ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"].includes(refine) ? other["images"]["refines"][refine] : other["images"]["other"]["noweapon"];
		// If the icon is an special effect we might have to download it
		if (refine == "Effect" && skills["weapons"][weapon]["refines"]["Effect"]) {
			var weaponicon = "../common/icons/" + weapon + "-Effect.webp";
		}
		await getimage(weaponicon).then(img => {
			preview.drawImage(img, 470, 150, 36, 36);
		});
		// Get the string to print
		var printableweapon = languages[language]["M" + weapon];
	// If not just print the basic icon
	} else {
		var printableweapon = "-";
		await getimage(other["images"]["other"]["noweapon"]).then(img => {
			preview.drawImage(img, 470, 150, 36, 36);
		});
	}
	// We always paste the text because it might as well be unarmed and have a "-"
	preview.font = '21px FeH-Font'; preview.fillStyle = refine ? "#82f546" : "#ffffff";
	preview.strokeText(printableweapon, 512, 156); preview.fillText(printableweapon, 512, 156);

	var assist = selectassists.value == "None" ? "-" : languages[language]["M" + selectassists.value];
	var special = selectspecials.value == "None" ? "-" : languages[language]["M" + selectspecials.value];
	// Print assist and special info
	preview.fillStyle = "#ffffff";
	preview.strokeText(assist, 507, 204); preview.fillText(assist, 507, 204);
	preview.strokeText(special, 500, 252); preview.fillText(special, 500, 252);

	// Render all the passives
	for (const [category, skill] of Object.entries(passives)) {
		let name = "-";
		// If the passive doesn't exist skip
		if (allpassives[skill]) {
			await getimage("../common/icons/" + skill + ".webp").then(img => {
				// If the image size is bigger than 44 these are some tier 4 skills that have shiny borders and their icon must be and offsetted accordingly
				let iconoffset = img.height > 44 ? -2 : 0;
				let size = img.height > 44 ? 39 : 36;
				preview.drawImage(img, passiveechoesrender[category]["icon"][0] + iconoffset, passiveechoesrender[category]["icon"][1] + iconoffset, size, size);
			});
			name = languages[language]["M" + skill];
		}
		// We always write the text because it might be a simple "-"
		preview.strokeText(name, passiveechoesrender[category]["text"][0], passiveechoesrender[category]["text"][1]);
		preview.fillText(name, passiveechoesrender[category]["text"][0], passiveechoesrender[category]["text"][1]);
		// Print the category indicator
		await getimage(other["images"]["skillindicators"][category]).then(img => {
			preview.drawImage(img, passiveechoesrender[category]["indicator"][0], passiveechoesrender[category]["indicator"][1], 18, 18);
		});
	}

	var blessing = selectblessings.value == "None" ? false : parseInt(selectblessings.value);
	// X amount to additionally push each icon to the left
	var offsetX = 0;
	var posY = 425; var posX = 0;
	var width = 100; var height = 109;
	// If blessed print the icon
	if (blessing) {
		// If the hero is on the list of the blessed ones for that particular blessing it has icon variant defined (otherwise use the normal one)
		var variant = other["blessed"][hero] ? other["blessed"][hero]["variant"] : false;
		var blessingicon = "/common/other/" + (other["blessed"][hero] ? other["blessed"][hero]["blessing"] : blessing) + "-Blessing" + (variant ? "-" + variant : "") + ".webp";
		await getimage(blessingicon).then(img => {
			preview.drawImage(img, posX, posY, width, height);
		});
		// If printed a blessing the next's position icon must go further to the left
		offsetX += 90;
	}

	// If is a duo hero of any kind print the icon
	if (other["duo"].concat(other["resonant"]).includes(hero)) {
		var specialtype = other["duo"].includes(hero) ? "Duo" : "Resonance";
		var specialicon = other["images"]["other"][specialtype];
		await getimage(specialicon).then(img => {
			preview.drawImage(img, posX + offsetX, posY, width, height);
		});
		// If printed a duo icon the next's position icon must go further to the left
		offsetX += 90;
	}

	// If summoner supported print the icon
	if (summoner) {
		await getimage(other["images"]["summoner"][summoner]).then(img => {
			preview.drawImage(img, posX + offsetX, posY, width, height);
		});
	}

	// Clean the queue
	renderingqueue.shift();
}

async function condensed() {
	// Obtain the object
	var preview = canvas.getContext("2d");
	// Sometimes the text stroke could cause graphical glitches
	preview.miterLimit = 2;

	// Hero ID
	var hero = selectheroes.value == "None" ? false : selectheroes.value;
	// Language selected
	var language = selectlanguage.value;

	// Print the background
	await getimage(other["images"]["other"]["bgcondensed"]).then(img => {
		preview.drawImage(img, 0, 0);
	});

	// Print the hero art selected
	if (hero) {
		// If we selected Resplendent and it actually is a legit choose the art
		var attire = (selectattire.value == "Resplendent" && languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"]) ? "_Resplendent_" : "_";
		// Some styls are non existent for condensed layout faces
		var style = selectartstyle.value == "Damage" ? "Damage" : "Attack";
		await getimage("../common/condensed-faces/" + hero + attire + style + ".webp").then(img => {
			preview.drawImage(img, -105, -3);
		});
	}

	// Print the foregroundUI
	await getimage(other["images"]["other"]["fgcondensed"]).then(img => {
		preview.drawImage(img, 0, 0);
	});

	//After this if no hero is selected we STOP and clear the queue
	if (!hero) {
		renderingqueue.shift();
		return;
	}

	// Convert the rarity variable into an int now to cater to calculation needs
	var rarity = selectrarity.value == "Forma" ? 5 : parseInt(selectrarity.value);
	await getimage(other["images"]["rarityborder"][selectrarity.value]).then(img => {
		preview.drawImage(img, 162, 9);
	});

	// Print hero name
	// Use horizontally centered anchor to avoid going out of bounds
	preview.fillStyle = 'white'; preview.strokeStyle = '#0a2533'; preview.textAlign = 'center'; preview.textBaseline = "middle"; preview.font = '24px FeH-Font'; preview.lineWidth = 6;
	// Add the fill and the stroke for the name
	var name = languages[language]["M" + hero];
	preview.strokeText(name, 294, 31); preview.fillText(name, 294, 31);

	var boon = selectboons.value == "None" ? false : selectboons.value; var bane = selectbanes.value == "None" ? false : selectbanes.value; var ascendent = selectascendent.value == "None" ? false : selectascendent.value; var merges = parseInt(selectmerges.value);
	// First write the static text for each stat (normal anchoring)
	preview.font = '23px FeH-Font'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.lineWidth = 6;
	// Each stat name is pushed down by 49pixels with an initial offset of 805
	for (let i = 0; i < statsnames.length; i++) {
		// The filling color varies depending of it being a boon, bane (without merges), neutral or ascendent
		if (boon == statsnames[i]) {
			preview.fillStyle = "#b1ecfa";
		} else if (bane == statsnames[i]) {
			if (merges != 0 && ascendent == statsnames[i]) {
				preview.fillStyle = "#b1ecfa";
			} else if (merges != 0 || ascendent == statsnames[i]) {
				preview.fillStyle = "#ffffff";
			} else {
				preview.fillStyle = "#f0a5b3";
			}
		} else if (ascendent == statsnames[i]) {
			preview.fillStyle = "#b1ecfa";
		} else {
			preview.fillStyle = "#ffffff";
		}
		// Depending on the stat position varies a lot
		switch (statsnames[i]) {
			case "HP":
				var down = 77; var left = 177;
				break;
			case "Atk":
				var down = 128; var left = 173;
				break;
			case "Spd":
				var down = 128; var left = 302;
				break;
			case "Def":
				var down = 164; var left = 172;
				break;
			case "Res":
				var down = 164; var left = 302;
				break;
		}
		preview.strokeText(languages[language][statsstrings[i]], left, down); preview.fillText(languages[language][statsstrings[i]], left, down);
	}

	var flowers = parseInt(selectflowers.value);
	// Obtain the calculated stats to draw
	var statsmodifier = statcalc(units[hero]["stats"], units[hero]["growths"], rarity, boon, bane, ascendent, merges, flowers);

	var weapon = selectweapons.value == "None" ? false : selectweapons.value; var refine = selectrefines.value == "None" ? false : selectrefines.value;
	// We have a couple of stats modifiers based on weapon, summoner support, attire, bonus unit, visible buffs and maybe not completely parsed A/S skills that we must add
	if (weapon) {
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + weaponmodifiers(weapon, refine)[index];
		});
	}

	// Retrieve passives, ss and buffs
	var passives = {
		"A": selectA.value == "None" ? false : selectA.value,
		"B": selectB.value == "None" ? false : selectB.value,
		"C": selectC.value == "None" ? false : selectC.value,
		"S": selectS.value == "None" ? false : selectS.value
	};
	var summoner = selectsummoner.value == "None" ? false : selectsummoner.value;
	var buffs = [
		0,
		parseInt(selectatk.value) ? parseInt(selectatk.value) : 0,
		parseInt(selectspd.value) ? parseInt(selectspd.value) : 0,
		parseInt(selectdef.value) ? parseInt(selectdef.value) : 0,
		parseInt(selectres.value) ? parseInt(selectres.value) : 0
	];
	// Add visible stats from multiple simple origins like passives, SS, resplendent, beast transformation and bonus
	statsmodifier = statsmodifier.map(function (value, index) {
		return value + staticmodifiers(passives, summoner, buffs)[index];
	});

	// Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers).
	for (let i = 0; i < statsnames.length; i++) {
		// Decide type of font depending on if we buffer, debuffed or neutral
		let numbertype = buffs[i] > 0 ? 2 : (buffs[i] < 0 ? 3 : 0);
		// Depending on the stat position varies a lot
		if (statsnames[i] == "HP") {
			// If the damage art is select we at least have less than half HP
			let currenthp = selectartstyle.value == "Damage" ? parseInt(statsmodifier[i] / 2) - 1 : statsmodifier[i];
			let currentcolor = selectartstyle.value == "Damage" ? 1 : 0;
			printhpnumbers(preview, currenthp, currentcolor, 241, 70, 0.75);
			printhpnumbers(preview, statsmodifier[i], 2, 332, 74, 0.55);
		} else if (statsnames[i] == "Atk") {
			printnumbers(preview, statsmodifier[i], numbertype, 279, 126, "end");
		} else if (statsnames[i] == "Spd") {
			printnumbers(preview, statsmodifier[i], numbertype, 413, 126, "end");
		} else if (statsnames[i] == "Def") {
			printnumbers(preview, statsmodifier[i], numbertype, 279, 162, "end");
		} else if (statsnames[i] == "Res") {
			printnumbers(preview, statsmodifier[i], numbertype, 413, 162, "end");
		}
	}

	// Print the weapon type icon
	await getimage(other["images"]["weapontype"][units[hero]["weapon"]]).then(img => {
		let size = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[hero]["weapon"]) ? 32 : 28;
		let offset = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[hero]["weapon"]) ? -2 : 0;
		preview.drawImage(img, 168 + offset, 17 + offset, size, size);
	});

	// Print the level string
	preview.font = '20px FeH-Font'; preview.fillStyle = "#ffffff"; preview.strokeStyle = '#0a2533'; preview.textAlign = 'center';
	preview.strokeText(languages[language]["MID_LEVEL2"], 501, 6); preview.fillText(languages[language]["MID_LEVEL2"], 501, 6);
	// Print the level 40. It was hardcoded previously so we just do this to make sure it doesn't look off side by side with the merge count
	printnumbers(preview, 40, 1, 480, 30, "start");

	// If we have merges we add the text next to the level
	if (merges > 0) {
		printnumbers(preview, "+", 1, 518, 32, "start");
	}

	preview.font = '24px FeH-Font'; preview.textAlign = 'start';
	// If the weapon is valid try to print an icon
	if (weapon) {
		// By default we always use the basic weapon icon or the predefined stat boosters ones
		var weaponicon = ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"].includes(refine) ? other["images"]["refines"][refine] : other["images"]["other"]["noweapon"];
		// If the icon is an special effect we might have to download it
		if (refine == "Effect" && skills["weapons"][weapon]["refines"]["Effect"]) {
			weaponicon = "../common/icons/" + weapon + "-Effect.webp";
		}
		await getimage(weaponicon).then(img => {
			preview.drawImage(img, 430, 60, 44, 44);
		});
		// Get the string to print
		var printableweapon = languages[language]["M" + weapon];
	// If not just print the basic icon
	} else {
		var printableweapon = "-";
		await getimage(other["images"]["other"]["noweapon"]).then(img => {
			preview.drawImage(img, 430, 60, 44, 44);
		});
	}
	// We always paste the text because it might as well be unarmed and have a "-"
	preview.fillStyle = refine ? "#82f546" : "#ffffff";
	preview.strokeText(printableweapon, 480, 70); preview.fillText(printableweapon, 480, 70);

	var assist = selectassists.value == "None" ? "-" : languages[language]["M" + selectassists.value];
	var special = selectspecials.value == "None" ? "-" : languages[language]["M" + selectspecials.value];
	// Print assist and special info
	preview.fillStyle = "#ffffff";
	preview.strokeText(assist, 480, 114); preview.fillText(assist, 480, 114);
	preview.strokeText(special, 480, 159); preview.fillText(special, 480, 159);

	// Render all the passives
	for (const [category, skill] of Object.entries(passives).reverse()) {
		let name = "-";
		// If the passive doesn't exist skip
		if (allpassives[skill]) {
			await getimage("../common/icons/" + skill + ".webp").then(img => {
				// If the image size is bigger than 44 these are some tier 4 skills that have shiny borders and their icon must be and offsetted accordingly
				let iconoffset = img.height > 44 ? -2 : 0;
				preview.drawImage(img, passivecondensedrender[category]["icon"][0] + iconoffset, passivecondensedrender[category]["icon"][1] + iconoffset);
			});
			name = languages[language]["M" + skill];
		}
		// Print the category indicator
		await getimage(other["images"]["skillindicators"][category]).then(img => {
			preview.drawImage(img, passivecondensedrender[category]["indicator"][0], passivecondensedrender[category]["indicator"][1], 21, 21);
		});
	}

	var blessing = selectblessings.value == "None" ? false : parseInt(selectblessings.value);
	var duoresonance = other["duo"].includes(hero) ? "duo" : (other["resonant"].includes(hero) ? "resonance" : false);
	// Depending on the combination of the duo/blessing status change the icon rendered, as well as it's position
	if (blessing && duoresonance) {
		// Duo heroes can't be pre-blessed, they at most have the normal variant of a manual bless
		var blessingicon = "/common/other/" + blessing + "-Blessing-" + duoresonance + ".webp";
		await getimage(blessingicon).then(img => {
			preview.drawImage(img, 90, 111);
		});
	} else if (blessing) {
		// If the hero is on the list of the blessed ones for that particular blessing it has icon variant defined (otherwise use the normal one)
		var variant = other["blessed"][hero] ? other["blessed"][hero]["variant"] : false;
		var blessingicon = "/common/other/" + (other["blessed"][hero] ? other["blessed"][hero]["blessing"] : blessing) + "-Blessing" + (variant ? "-" + variant : "") + "-mini.webp";
		if (!variant) {
			var posX = 104; var posY = 140;
		} else {
			var posX = 90; var posY = 111;
		}
		await getimage(blessingicon).then(img => {
			preview.drawImage(img, posX, posY);
		});
	} else if (duoresonance) {
		var variant = duoresonance.charAt(0).toUpperCase() + duoresonance.slice(1) + "-mini";
		var duoresonanceicon = other["images"]["other"][variant];
		await getimage(duoresonanceicon).then(img => {
			preview.drawImage(img, 104, 140);
		});
	}

	// Clean the queue
	renderingqueue.shift();
}

async function myunit() {
	// Obtain the object
	var preview = canvas.getContext("2d");
	// Sometimes the text stroke could cause graphical glitches
	preview.miterLimit = 2;

	// Hero ID
	var hero = selectheroes.value == "None" ? false : selectheroes.value;
	// Language selected
	var language = selectlanguage.value;

	// Print the background depending on the type of support
	var background = selectbackground.value + (selectsummoner.value == "None" ? "normal" : "support");
	var bgjob = getimage(other["images"]["backgrounds"][background]).then(img => {
		preview.drawImage(img, -173, 0, 1067, 1280);
	});

	var artoffsetX = parseInt(selectoffsetX.value);
	var artoffsetY = parseInt(selectoffsetY.value);
	// We only make modifications if some mirror config is set to other than None
	switch (mirror.value) {
		case "Horizontal":
			var artoffsetX = -artoffsetX;
			break;
		case "Vertical":
			var artoffsetY = -artoffsetY;
			break;
		case "Both":
			var artoffsetX = -artoffsetX;
			var artoffsetY = -artoffsetY;
			break;
	}
	// Print the hero art selected
	if (hero) {
		// If we selected Resplendent and it actually is a legit choose the art
		var attire = (selectattire.value == "Resplendent" && languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"]) ? "_Resplendent_" : "_";
		var herojob = getimage("../common/heroes/" + hero + attire + selectartstyle.value + ".webp", "/common/base/missigno.webp").then(async img => {
			// We always print the image at the 0 coordinate on Y, but this is not good enough when vertically flipping because we expect the lower half of the hero not to be cut
			var coordinateY = ["Vertical", "Both"].includes(mirror.value) ? - (img.height - 1280) : 0;
			await bgjob;
			// Save the context here in case we need to do so some flipping
			preview.save();
			// We only make modifications if some mirror config is set to other than None
			switch (mirror.value) {
				case "Horizontal":
					preview.translate(720, 0);
					preview.scale(-1, 1);
					break;
				case "Vertical":
					preview.translate(0, 1280);
					preview.scale(1, -1);
					break;
				case "Both":
					preview.translate(720, 1280);
					preview.scale(-1, -1);
					break;
			}
			preview.drawImage(img, -305 + artoffsetX, coordinateY - artoffsetY);
			// Always restore the previous context to avoid issues
			preview.restore();
		});
	}
	
	// Print the foregroundUI.
	// Since this has a dependency chain for rendering (bg --> hero --> fg) waiting for it to finish guarantees we can move ont
	var foreground = appui.checked ? other["images"]["other"]["fgui"] : other["images"]["other"]["fgnoui"];
	await getimage(foreground).then(async img => {
		await herojob;
		preview.drawImage(img, 0, 0);
	});
	
	//After this if no hero is selected we STOP and delete the first print queue
	if (!hero) {
		renderingqueue.shift();
		return;
	}

	// We are gonna store an array with all the promises for drawing so we wait until everything rendered before copying the image.
	renderjobs = [];

	// Print the rarity line
	// Convert the rarity variable into an int now to cater to calculation needs
	var rarity = selectrarity.value == "Forma" ? 5 : parseInt(selectrarity.value);
	// The width of the line depends of the amount of stars, increasing 37 for each from a base value of 16 (margins?)
	renderjobs.push(getimage(other["images"]["rarity"][selectrarity.value]).then(img => {
		preview.drawImage(img, 65, 505, 16 + (rarity * 37), 53);
	}));
	
	// Print the resplendent icon
	if (["Resplendent", "Stats-Only"].includes(selectattire.value)) {
		renderjobs.push(getimage(other["images"]["other"]["resplendent"]).then(img => {
			preview.drawImage(img, 262, 492, 82, 82);
		}));
	}

	// Print title and name
	var title = hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_HONOR")] : "Enemy";
	// Use horizontally centered anchor to avoid going out of bounds
	preview.fillStyle = 'white'; preview.strokeStyle = 'rgb(50, 30, 10)'; preview.textAlign = 'center'; preview.textBaseline = "middle"; preview.font = '35px FeH-Font'; preview.lineWidth = 6;
	// Add the fill and the stroke for the title
	preview.strokeText(title, 188, 585); preview.fillText(title, 188, 585);
	// Add the fill and the stroke for the name
	var name = languages[language]["M" + hero];
	preview.strokeText(name, 222, 659); preview.fillText(name, 222, 659);

	// Print the artist and actor names, as well as the favorite mark and other minor strings if appui is enabled
	if (appui.checked) {
		preview.fillStyle = 'white'; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.font = '21px FeH-Font';
		// If the hero is truly a resplendent one we might have data for it
		if (selectattire.value == "Resplendent" && languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"]) {
			var voice = languages[language][hero.replace("PID", "MPID_VOICE") + "EX01"];
			var artist = languages[language][hero.replace("PID", "MPID_ILLUST") + "EX01"];
		} else {
			var voice = hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_VOICE")] : "";
			var artist = hero.includes("PID_") ? languages[language][hero.replace("PID", "MPID_ILLUST")] : "";
		}
		preview.strokeText(voice, 47, 1213); preview.fillText(voice, 47, 1213);
		preview.strokeText(artist, 47, 1242); preview.fillText(artist, 47, 1242);
		// Print favorite icon
		renderjobs.push(getimage(other["images"]["favorite"][selectfavorite.value]).then(img => {
			preview.drawImage(img, 3, 229, 90, 92);
		}));
		// Translate buttons
		preview.font = '24px FeH-Font'; preview.textAlign = 'center'; preview.textBaseline = "middle";
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLSET"], 126, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLSET"], 126, 1175);
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLEQUIP"], 360, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLEQUIP"], 360, 1175);
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLLEARN"], 594, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLLEARN"], 594, 1175);
		preview.font = '26px FeH-Font';
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_TALK"], 617, 47); preview.fillText(languages[language]["MID_UNIT_INFO_TO_TALK"], 617, 47);
	}

	var boon = selectboons.value == "None" ? false : selectboons.value; var bane = selectbanes.value == "None" ? false : selectbanes.value; var ascendent = selectascendent.value == "None" ? false : selectascendent.value; var merges = parseInt(selectmerges.value);
	// First write the static text for each stat (normal anchoring)
	preview.font = '25px FeH-Font'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.strokeStyle = '#0a2533';
	// Each stat name is pushed down by 49pixels with an initial offset of 805
	for (let i = 0; i < statsnames.length; i++) {
		// The filling color varies depending of it being a boon, bane (without merges), neutral or ascendent
		if (boon == statsnames[i]) {
			preview.fillStyle = "#b1ecfa";
		} else if (bane == statsnames[i]) {
			if (merges != 0 && ascendent == statsnames[i]) {
				preview.fillStyle = "#b1ecfa";
			} else if (merges != 0 || ascendent == statsnames[i]) {
				preview.fillStyle = "#ffffff";
			} else {
				preview.fillStyle = "#f0a5b3";
			}
		} else if (ascendent == statsnames[i]) {
			preview.fillStyle = "#b1ecfa";
		} else {
			preview.fillStyle = "#ffffff";
		}
		preview.strokeText(languages[language][statsstrings[i]], 115, 805 + (i * 49) + (i * 0.3)); preview.fillText(languages[language][statsstrings[i]], 115, 805 + (i * 49) + (i * 0.3));
	}
	preview.font = '24px FeH-Font'; preview.fillStyle = 'white';
	preview.strokeText(languages[language]["MID_SKILL_POINT"], 120, 1052); preview.fillText(languages[language]["MID_SKILL_POINT"], 120, 1052);
	preview.strokeText(languages[language]["MID_HEROISM_POINT"], 115, 1103); preview.fillText(languages[language]["MID_HEROISM_POINT"], 115, 1103);

	var flowers = parseInt(selectflowers.value);
	// Obtain the calculated stats to draw
	var statsmodifier = statcalc(units[hero]["stats"], units[hero]["growths"], rarity, boon, bane, ascendent, merges, flowers);

	var weapon = selectweapons.value == "None" ? false : selectweapons.value; var refine = selectrefines.value == "None" ? false : selectrefines.value;
	// We have a couple of stats modifiers based on weapon, summoner support, attire, bonus unit, visible buffs and maybe not completely parsed A/S skills that we must add
	if (weapon) {
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + weaponmodifiers(weapon, refine)[index];
		});
	}

	// Retrieve passives, ss and buffs
	var passives = {
		"A": selectA.value == "None" ? false : selectA.value,
		"B": selectB.value == "None" ? false : selectB.value,
		"C": selectC.value == "None" ? false : selectC.value,
		"S": selectS.value == "None" ? false : selectS.value
	};
	var summoner = selectsummoner.value == "None" ? false : selectsummoner.value;
	var buffs = [
		0,
		parseInt(selectatk.value) ? parseInt(selectatk.value) : 0,
		parseInt(selectspd.value) ? parseInt(selectspd.value) : 0,
		parseInt(selectdef.value) ? parseInt(selectdef.value) : 0,
		parseInt(selectres.value) ? parseInt(selectres.value) : 0
	];
	// Add visible stats from multiple simple origins like passives, SS, resplendent, beast transformation and bonus
	statsmodifier = statsmodifier.map(function (value, index) {
		return value + staticmodifiers(passives, summoner, buffs)[index];
	});

	// Fix stats, cannot go beyond 99 or below 0
	for (let i = 0; i < statsmodifier.length; i++) {
		statsmodifier[i] = -1 < statsmodifier[i] ? (statsmodifier[i] < 100 ? statsmodifier[i] : 99) : 0;
	}

	// Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers).
	for (let i = 0; i < statsnames.length; i++) {
		// Decide type of font depending on if we buffer, debuffed or neutral
		let numbertype = buffs[i] > 0 ? 2 : (buffs[i] < 0 ? 3 : 0);
		// Each stat name is pushed down by 49 pixels with an initial offset of 805
		printnumbers(preview, statsmodifier[i], numbertype, 265, 805 + (i * 49) + (i * 0.3), "end");
	}
	// Print the amount of SP and HM
	var numbertype = selectsp.value == "9999" ? 4 : 0;
	printnumbers(preview, parseInt(selectsp.value), numbertype, 265, 1052, "end");
	var numbertype = selecthm.value == "8000" ? 4 : 0;
	printnumbers(preview, parseInt(selecthm.value), numbertype, 265, 1100, "end");

	// Print the ascendent floret icon if selected
	if (ascendent) {
		renderjobs.push(getimage(other["images"]["other"]["ascendent"]).then(img => {
			preview.drawImage(img, 10, 502);
		}));
	}

	var accessory = selectaccessory.value == "None" ? false : selectaccessory.value;
	if (accessory) {
		// We always wait for extended baseinfo golder before printing anything else there
		accexpandjob = getimage(other["images"]["other"]["accessoryexpand"]).then(img => {
			preview.drawImage(img, 4, 732);
		});
		renderjobs.push(getimage(other["images"]["accessory"][accessory]).then(async img => {
			await accexpandjob;
			preview.drawImage(img, 256, 743, 32, 32);
		}));
	}

	// Print the move type and weapon type icons
	renderjobs.push(getimage(other["images"]["movetype"][units[hero]["move"]]).then(async img => {
		// Position is slightly off if we had an accessory
		let posX = accessory ? 223 : 229;
		// If an accessory was defined, wait until the expansion is rendered
		if (accessory) {
			await accexpandjob;
		}
		preview.drawImage(img, posX, 743, 32, 32);
	}));
	renderjobs.push(getimage(other["images"]["weapontype"][units[hero]["weapon"]]).then(async img => {
		// We add an small offset on red weapons to make them look decent
		let offset = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[hero]["weapon"]) ? -2 : 0;
		// If an accessory was defined, wait until the expansion is rendered
		if (accessory) {
			await accexpandjob;
		}
		preview.drawImage(img, 20 + offset, 743 + offset);
	}));

	// If an accessory was defined, wait until the expansion is rendered
	if (accessory) {
		await accexpandjob;
	}
	// Print the level string
	preview.font = '24px FeH-Font'; preview.fillStyle = "#ffffff"; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start';
	preview.strokeText(languages[language]["MID_LEVEL2"], 70, 746); preview.fillText(languages[language]["MID_LEVEL2"], 70, 746);
	// Print the level 40. It was hardcoded previously so we just do this to make sure it doesn't look off side by side with the merge count
	printnumbers(preview, 40, 1, 124, 745, "start");

	// If we have merges we add the text next to the level
	if (merges > 0) {
		// Decide type of font depending on if we are fully merged or not
		var numbertype = merges == 10 ? 4 : 1;
		printnumbers(preview, "+", numbertype, 163, 748, "start");
		printnumbers(preview, merges, numbertype, 181, 745, "start");
	}
	preview.fillStyle = "#ffffff";

	// If we have flowers we add another box with the number
	if (flowers > 0) {
		// We always wait for flowerholder before printing anything else there
		flholderjob = getimage(other["images"]["other"]["flowerholder"]).then(img => {
			// Position is slightly off if we had an accessory
			let posX = accessory ? 271 + 27 : 271;
			preview.drawImage(img, posX, 732);
		});
		renderjobs.push(getimage(other["images"]["flowers"][units[hero]["move"]]).then(async img => {
			// Position is slightly off if we had an accessory
			let posX = accessory ? 289 + 27 : 289;
			// Wait until the expansion is rendered
			await flholderjob;
			preview.drawImage(img, posX, 727, 60, 60);
			// Position for flower amount is off if we had an accessory
			var offset = (accessory ? 27 : 0);
			printnumbers(preview, "+", 1, 345 + offset, 748, "start");
			printnumbers(preview, flowers, 1, 364 + offset, 745, "start");
		}));
	}

	// Paste the exp indicator
	renderjobs.push(getimage(other["images"]["other"]["expindicator"]).then(img => {
		// Position is off if we had an accessory and flowers
		let posX = 271 + (accessory ? 27 : 0) + (flowers > 0 ? 147 : 0);
		preview.drawImage(img, posX, 732);
		// Position for text is off if we had an accessory and flowers
		var offset = (accessory ? 27 : 0) + (flowers > 0 ? 147 : 0);
		preview.strokeText(languages[language]["MID_EXP"], 308 + offset, 745); preview.fillText(languages[language]["MID_EXP"], 308 + offset, 745);
		preview.strokeText(languages[language]["MID_UNIT_INFO_EXP_MAX"], 415 + offset, 745); preview.fillText(languages[language]["MID_UNIT_INFO_EXP_MAX"], 415 + offset, 745);
	}));

	// If the weapon is valid try to print an icon
	if (weapon) {
		// By default we always use the basic weapon icon or the predefined stat boosters ones
		var weaponicon = ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"].includes(refine) ? other["images"]["refines"][refine] : other["images"]["other"]["noweapon"];
		// If the icon is an special effect we might have to download it
		if (refine == "Effect" && skills["weapons"][weapon]["refines"]["Effect"]) {
			var weaponicon = "../common/icons/" + weapon + "-Effect.webp";
		}
		renderjobs.push(getimage(weaponicon).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		}));
		// Get the string to print
		var printableweapon = languages[language]["M" + weapon];
	// If not just print the basic icon
	} else {
		var printableweapon = "-";
		renderjobs.push(getimage(other["images"]["other"]["noweapon"]).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		}));
	}
	// We always paste the text because it might as well be unarmed and have a "-"
	preview.fillStyle = refine ? "#82f546" : "#ffffff";
	preview.strokeText(printableweapon, 420, 806); preview.fillText(printableweapon, 420, 806);

	var assist = selectassists.value == "None" ? "-" : languages[language]["M" + selectassists.value];
	var special = selectspecials.value == "None" ? "-" : languages[language]["M" + selectspecials.value];
	// Print assist and special info
	preview.fillStyle = "#ffffff";
	preview.strokeText(assist, 420, 854); preview.fillText(assist, 420, 854);
	preview.strokeText(special, 420, 904); preview.fillText(special, 420, 904);

	// Render all the passives
	for (const [category, skill] of Object.entries(passives)) {
		let name = "-";
		// If the passive doesn't exist skip
		if (allpassives[skill]) {
			let iconjob = getimage("../common/icons/" + skill + ".webp").then(img => {
				// If the image size is bigger than 44 these are some tier 4 skills that have shiny borders and their icon must be and offsetted accordingly
				let iconoffset = img.height > 44 ? -2 : 0;
				preview.drawImage(img, passiverender[category]["icon"][0] + iconoffset, passiverender[category]["icon"][1] + iconoffset);
			});
			// If we are rendering an icon for this category, wait until is rendered for the indicator
			renderjobs.push(getimage(other["images"]["skillindicators"][category]).then(async img => {
				await iconjob;
				preview.drawImage(img, passiverender[category]["indicator"][0], passiverender[category]["indicator"][1], 21, 21);
			}));
			name = languages[language]["M" + skill];
		} else {
			// Print the category indicator
			renderjobs.push(getimage(other["images"]["skillindicators"][category]).then(img => {
				preview.drawImage(img, passiverender[category]["indicator"][0], passiverender[category]["indicator"][1], 21, 21);
			}));
		}
		// We always write the text because it might be a simple "-"
		preview.strokeText(name, passiverender[category]["text"][0], passiverender[category]["text"][1]);
		preview.fillText(name, passiverender[category]["text"][0], passiverender[category]["text"][1]);
	}

	var blessing = selectblessings.value == "None" ? false : parseInt(selectblessings.value);
	// If hero is of special type, detect which
	var specialtype = false;
	if (other["duo"].includes(hero)) {
		var specialtype = "Duo";
	} else if (other["resonant"].includes(hero)) {
		var specialtype = "Resonance";
	} else if (other["ascended"].includes(hero)) {
		var specialtype = "Ascended";
	} else if (other["rearmed"].includes(hero)) {
		var specialtype = "Rearmed";
	}
	// Detect if we are printing more than three icons (this could happen on duo/blessed/summoner supported allies) so we can resize accordingly
	var needsresize = blessing && summoner && specialtype ? true : false;
	var posY = needsresize ? 595 : 570; var posX = needsresize ? 600 : 575;
	var width = needsresize ? 115 : 147; var height = needsresize ? 125 : 160;
	// If blessed print the icon
	if (blessing) {
		// If the hero is on the list of the blessed ones for that particular blessing it has icon variant defined (otherwise use the normal one)
		var variant = other["blessed"][hero] ? other["blessed"][hero]["variant"] : false;
		var blessingicon = "/common/other/" + (other["blessed"][hero] ? other["blessed"][hero]["blessing"] : blessing) + "-Blessing" + (variant ? "-" + variant : "") + ".webp";
		renderjobs.push(getimage(blessingicon).then(img => {
			preview.drawImage(img, posX, posY, width, height);
		}));
	}

	// If we detected a specialtype, print the icon
	if (specialtype) {
		var specialicon = other["images"]["other"][specialtype];
		renderjobs.push(getimage(specialicon).then(img => {
			// If printed a blessing the next's position icon must go further to the left
			let offsetX = (blessing ? 1 : 0) * (needsresize ? 100 : 125);
			preview.drawImage(img, posX - offsetX, posY, width, height);
		}));
		// If appui is enabled we also print the conversation icon for duos/resonance
		if (appui.checked && ["Duo", "Resonance"].includes(specialtype)) {
			renderjobs.push(getimage(other["images"]["other"]["duoconversation"]).then(img => {
				preview.drawImage(img, 3, 415);
			}));
		}
	}

	// If summoner supported print the icon
	if (summoner) {
		renderjobs.push(getimage(other["images"]["summoner"][summoner]).then(img => {
			// If printed a blessing the next's position icon must go further to the left
			let offsetX = ((blessing ? 1 : 0) + (specialtype ? 1 : 0) ) * (needsresize ? 100 : 125);
			preview.drawImage(img, posX - offsetX, posY, width, height);
		}));
	}

	// Wait until all async renders completed
	await Promise.all(renderjobs);

	// Clean the queue
	renderingqueue.shift();
}
