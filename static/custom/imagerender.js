async function reload() {
	// Obtain the object
	var preview = document.getElementById("fakecanvas").getContext("2d");
	// Sometimes the text stroke could cause graphical glitches
	preview.miterLimit = 2;

	// Hero ID
	hero = selecthero.value;
	
	// Load and wait for the font to be ready
	const font = new FontFace("FeH-Font", "url('/common/feh-font.woff2') format('woff2')");
    await font.load();
    document.fonts.add(font);

	// Print the background depending on the type of support
	background = selectsummoner.value == "None" ? "bgnosupport" : "bgsupport";
	await getimage(other["images"]["other"][background]).then(img => {
		preview.drawImage(img, -173, 0, 1067, 1280);
	})

	// Print the hero art selected
	if (selectart.files[0]) {
		var reader = new FileReader();
		const fileLoadPromise = new Promise(resolve => {
			reader.onload = resolve;
			reader.readAsDataURL(selectart.files[0]);
		});
		await fileLoadPromise;
		await getimage(reader.result).then(img => {
			// Size of the image must vary depending on the multiplier used
			multiplier = parseInt(selectexpand.value) / 100;
			preview.drawImage(img, 0 + parseInt(selectoffsetX.value), 0 - parseInt(selectoffsetY.value), img.width * multiplier, img.height * multiplier);
		})
	}
	
	// Print the foregroundUI
	foreground = appui.checked ? other["images"]["other"]["fgui"] : other["images"]["other"]["fgnoui"]
	await getimage(foreground).then(img => {
		preview.drawImage(img, 0, 0);
	})

	// Print the rarity line
	// Convert the rarity variable into an int now to cater to calculation needs
	rarity = 5
	// The width of the line depends of the amount of stars, increasing 37 for each from a base value of 16 (margins?)
	await getimage(other["images"]["rarity"][rarity]).then(img => {
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

	// Print title and name (we expect the first part to be the name and the second the title
	fullname = hero.split(":")
	title = fullname[1] ? fullname[1] : ""
	// Use horizontally centered anchor to avoid going out of bounds
	preview.fillStyle = 'white'; preview.strokeStyle = 'rgb(50, 30, 10)'; preview.textAlign = 'center'; preview.textBaseline = "middle"; preview.font = '35px FeH-Font'; preview.lineWidth = 6;
	// Add the fill and the stroke for the title
	preview.strokeText(title, 188, 585); preview.fillText(title, 188, 585);
	// Add the fill and the stroke for the name
	name = fullname[0]
	preview.strokeText(name, 222, 659); preview.fillText(name, 222, 659);

	// Print the artist and actor names, as well as the favorite mark and other minor strings if appui is enabled
	if (appui.checked) {
		preview.fillStyle = 'white'; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.font = '21px FeH-Font'; preview.lineWidth = 6;
		voice = document.getElementById("actor").value ? document.getElementById("actor").value : "-";
		artist = document.getElementById("artist").value ? document.getElementById("artist").value : "-";
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
	// Obtain the base stats to draw
	statsmodifier = [
		parseInt(selecthp.value) ? parseInt(selecthp.value) : 0,
		parseInt(selectatk.value) ? parseInt(selectatk.value) : 0,
		parseInt(selectspd.value) ? parseInt(selectspd.value) : 0,
		parseInt(selectdef.value) ? parseInt(selectdef.value) : 0,
		parseInt(selectres.value) ? parseInt(selectres.value) : 0
	];

	// All type of skills we grab stats from
	options = ["weapon", "refine", "Askill", "Bskill", "Cskill", "Sskill"];
	stats = ["hp", "atk", "spd", "def", "res"];
	for (i = 0; i < options.length; i++) {
		skillstats = [];
		for (j = 0; j < stats.length; j++) {
			value = document.getElementById(stats[j] + options[i]).value;
			skillstats.push(parseInt(value) ? parseInt(value) : 0);
		}
		statsmodifier = statsmodifier.map(function (value, index) {
			return value + skillstats[index];
		});
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

	// Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers). Also prevent to number from going below 0
	preview.font = 'bold 26px FeH-Font'; preview.textAlign = 'end'; preview.textBaseline = "top"; preview.strokeStyle = '#0a2533'; preview.fillStyle = "#fffa96";
	// Each stat name is pushed down by 49 pixels with an initial offset of 805
	for (i = 0; i < stats.length; i++) {
		preview.strokeText(statsmodifier[i], 265, 805 + (i * 49) + (i * 0.3)); preview.fillText(statsmodifier[i], 265, 805 + (i * 49) + (i * 0.3));
	}
	// Print the amount of SP and HM
	preview.fillStyle = selectsp.value >= "9999" ? "#82f546" : "#fffa96";
	preview.strokeText(selectsp.value, 265, 1052); preview.fillText(selectsp.value, 265, 1052);
	preview.fillStyle = selecthm.value >= "7000" ? "#82f546" : "#fffa96";
	preview.strokeText(selecthm.value, 265, 1100); preview.fillText(selecthm.value, 265, 1100);

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
	await getimage(other["images"]["movetype"][parseInt(selectmovetype.value)]).then(img => {
		// Position is slightly off if we had an accessory
		posX = accessory ? 223 : 229;
		preview.drawImage(img, posX, 743, 32, 32);
	});
	await getimage(other["images"]["weapontype"][parseInt(selectweapontype.value)]).then(img => {
		preview.drawImage(img, 20, 743, 32, 32);
	});
	// Print the level string
	preview.font = '24px FeH-Font'; preview.fillStyle = "#ffffff"; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start';
	preview.strokeText(languages[language]["MID_LEVEL2"], 70, 746); preview.fillText(languages[language]["MID_LEVEL2"], 70, 746);
	// Print the level 40. It was hardcoded previously so we just do this to make sure it doesn't look off side by side with the merge count
	preview.font = 'bold 25px FeH-Font';
	preview.strokeText("40", 126, 745); preview.fillText("40", 126, 745);

	// If we have merges we add the text next to the level
	if (merges > 0) {
		preview.fillStyle = merges == 10 ? "#82f546" : "#ffffff";
		preview.strokeText("+", 165, 743); preview.fillText("+", 165, 743);
		preview.strokeText(merges, 184, 745); preview.fillText(merges, 184, 745);
	}
	preview.fillStyle = "#ffffff";
	// If we have flowers we add another box with the number
	if (flowers > 0) {
		await getimage(other["images"]["other"]["flowerholder"]).then(img => {
			preview.drawImage(img, 271 + offset, 732);
		});
		await getimage(other["images"]["flowers"][parseInt(selectmovetype.value)]).then(img => {
			preview.drawImage(img, 289 + offset, 727, 60, 60);
		});
		preview.strokeText("+", 345 + offset, 742); preview.fillText("+", 345 + offset, 742);
		preview.strokeText(flowers, 364 + offset, 745); preview.fillText(flowers, 364 + offset, 745);
		offset += 147;
	}

	// Paste the exp indicator
	await getimage(other["images"]["other"]["expindicator"]).then(img => {
		preview.drawImage(img, 271 + offset, 732);
	});
	preview.font = '24px FeH-Font';
	preview.strokeText(languages[language]["MID_EXP"], 308 + offset, 745); preview.fillText(languages[language]["MID_EXP"], 308 + offset, 745);
	preview.strokeText(languages[language]["MID_UNIT_INFO_EXP_MAX"], 415 + offset, 745); preview.fillText(languages[language]["MID_UNIT_INFO_EXP_MAX"], 415 + offset, 745);

	weapon = document.getElementById("nameweapon").value; refine = selectrefines.value == "None" ? false : selectrefines.value;
	// If the weapon is valid try to print an icon
	if (weapon) {
		// First try to use the icon provided
		if (document.getElementById("iconrefine").files[0]) {
			var reader = new FileReader();
			const fileLoadPromise = new Promise(resolve => {
				reader.onload = resolve;
				reader.readAsDataURL(document.getElementById("iconrefine").files[0]);
			});
			await fileLoadPromise;
			weaponicon = reader.result;
		// If it is not defined switch to checking about the refine as normal
		} else {
			// By default we always use the basic weapon icon or the predefined stat boosters ones
			weaponicon = ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"].includes(refine) ? other["images"]["refines"][refine] : other["images"]["other"]["noweapon"];
			// If the icon is an special effect we might have to download it
			if (refine == "Effect" && skills["weapons"][selectweapons.value]["refines"]["Effect"]) {
				weaponicon = "../common/icons/" + selectweapons.value + "-Effect.png"
			}
		}
		await getimage(weaponicon).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		});
		// Get the string to print
		printableweapon = weapon;
	// If not just print the basic icon
	} else {
		printableweapon = "-";
		await getimage(other["images"]["other"]["noweapon"]).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		});
	}
	// We always paste the text because it might as well be unarmed and have a "-"
	preview.fillStyle = refine || document.getElementById("iconrefine").files[0] ? "#82f546" : "#ffffff";
	preview.strokeText(printableweapon, 420, 806); preview.fillText(printableweapon, 420, 806);

	assist = document.getElementById("nameassist").value ? document.getElementById("nameassist").value : "-";
	special = document.getElementById("namespecial").value ? document.getElementById("namespecial").value : "-";
	// Print assist and special info
	preview.fillStyle = "#ffffff";
	preview.strokeText(assist, 420, 854); preview.fillText(assist, 420, 854);
	preview.strokeText(special, 420, 904); preview.fillText(special, 420, 904);

	passives = ["Askill", "Bskill", "Cskill", "Sskill"]
	// Render all the passives
	for (i = 0; i < passives.length; i++) {
		name = document.getElementById("name" + passives[i]).value != "" ? document.getElementById("name" + passives[i]).value : "-";
		// Check first for a custom icon
		if (document.getElementById("icon" + passives[i]).files[0]) {
			var reader = new FileReader();
			const fileLoadPromise = new Promise(resolve => {
				reader.onload = resolve;
				reader.readAsDataURL(document.getElementById("icon" + passives[i]).files[0]);
			});
			await fileLoadPromise;
			// Icons are automatically resized into 44 regarless of source
			await getimage(reader.result).then(img => {
				preview.drawImage(img, passiverender[passives[i][0]]["icon"][0], passiverender[passives[i][0]]["icon"][1], 44, 44);
			});
		} else if (document.getElementById(passives[i]).value != "None") {
			await getimage("../common/icons/" + document.getElementById(passives[i]).value + ".png").then(img => {
				// If the image size is bigger than 44 these are some tier 4 skills that have shiny borders and their icon must be and offsetted accordingly
				iconoffset = img.height > 44 ? -2 : 0;
				preview.drawImage(img, passiverender[passives[i][0]]["icon"][0] + iconoffset, passiverender[passives[i][0]]["icon"][1] + iconoffset);
			});
		}
		// We always write the text because it might be a simple "-"
		preview.strokeText(name, passiverender[passives[i][0]]["text"][0], passiverender[passives[i][0]]["text"][1])
		preview.fillText(name, passiverender[passives[i][0]]["text"][0], passiverender[passives[i][0]]["text"][1]);
		// Print the category indicator
		await getimage(other["images"]["skillindicators"][passives[i][0]]).then(img => {
			preview.drawImage(img, passiverender[passives[i][0]]["indicator"][0], passiverender[passives[i][0]]["indicator"][1], 21, 21);
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