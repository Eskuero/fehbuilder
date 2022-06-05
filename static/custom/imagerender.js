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

async function reload() {
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang]) {
		await sleep(100);
	}
	// Get epoch as rendering ID
	var renderingid = new Date().getTime();
	// Put our rendering ID on queue
	renderingqueue.push(renderingid);
	// Until our rendering ID is the first, wait and check again in 100ms
	while (renderingqueue[0] != renderingid) {
		await sleep(100);
	}

	// Obtain the object
	var preview = document.getElementById("fakecanvas").getContext("2d");
	// Sometimes the text stroke could cause graphical glitches
	preview.miterLimit = 2;

	// Print the background depending on the type of support
	var background = selectsummoner.value == "None" ? "bgnosupport" : "bgsupport";
	await getimage(other["images"]["other"][background]).then(img => {
		preview.drawImage(img, -173, 0, 1067, 1280);
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
	if (selectart.files[0]) {
		let reader = new FileReader();
		let fileLoadPromise = new Promise(resolve => {
			reader.onload = resolve;
			reader.readAsDataURL(selectart.files[0]);
		});
		await fileLoadPromise;
		await getimage(reader.result).then(img => {
			// Size of the image must vary depending on the multiplier used
			let multiplier = parseInt(selectexpand.value) / 100;
			preview.drawImage(img, 0 + artoffsetX, 0 - artoffsetY, img.width * multiplier, img.height * multiplier);
		});
	// If no custom file is selected but a base hero is chosen use that
	} else if (selectbasehero.value != "None") {
		// If we selected Resplendent and it actually is a legit choose the art
		let attire = (selectattire.value == "Resplendent" && languages[language][selectbasehero.value.replace("PID", "MPID_VOICE") + "EX01"]) ? "_Resplendent_" : "_";
		await getimage("../common/heroes/" + selectbasehero.value + attire + "Portrait.webp", "/common/base/missigno.webp").then(img => {
			// We always print the image at the 0 coordinate on Y, but this is not good enough when vertically flipping because we expect the lower half of the hero not to be cut
			let coordinateY = ["Vertical", "Both"].includes(mirror.value) ? - (img.height - 1280) : 0;
			preview.drawImage(img, -305 + artoffsetX, coordinateY - artoffsetY);
		});
	}
	// Always restore the previous context to avoid issues
	preview.restore();
	
	// Print the foregroundUI
	var foreground = appui.checked ? other["images"]["other"]["fgui"] : other["images"]["other"]["fgnoui"];
	await getimage(foreground).then(img => {
		preview.drawImage(img, 0, 0);
	});

	// Print the rarity line
	// Convert the rarity variable into an int now to cater to calculation needs
	var rarity = 5;
	// The width of the line depends of the amount of stars, increasing 37 for each from a base value of 16 (margins?)
	await getimage(other["images"]["rarity"][rarity]).then(img => {
		preview.drawImage(img, 65, 505, 16 + (rarity * 37), 53);
	});
	
	// Print the resplendent icon
	if (["Resplendent", "Stats-Only"].includes(selectattire.value)) {
		await getimage(other["images"]["other"]["resplendent"]).then(img => {
			preview.drawImage(img, 262, 492, 82, 82);
		});
	}

	// Language selected
	var language = selectlanguage.value;

	// Print title and name
	var hero = selecthero.value;
	var title = selecttitle.value;
	// Use horizontally centered anchor to avoid going out of bounds
	preview.fillStyle = 'white'; preview.strokeStyle = 'rgb(50, 30, 10)'; preview.textAlign = 'center'; preview.textBaseline = "middle"; preview.font = '35px FeH-Font'; preview.lineWidth = 6;
	// Add the fill and the stroke for the title
	preview.strokeText(title, 188, 585); preview.fillText(title, 188, 585);
	// Add the fill and the stroke for the name
	preview.strokeText(hero, 222, 659); preview.fillText(hero, 222, 659);

	// Print the artist and actor names, as well as the favorite mark and other minor strings if appui is enabled
	if (appui.checked) {
		preview.fillStyle = 'white'; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.font = '21px FeH-Font';
		let voice = document.getElementById("actor").value ? document.getElementById("actor").value : "-";
		let artist = document.getElementById("artist").value ? document.getElementById("artist").value : "-";
		preview.strokeText(voice, 47, 1213); preview.fillText(voice, 47, 1213);
		preview.strokeText(artist, 47, 1242); preview.fillText(artist, 47, 1242);
		// Print favorite icon
		await getimage(other["images"]["favorite"][selectfavorite.value]).then(img => {
			preview.drawImage(img, 3, 229, 90, 92);
		});
		// Translate buttons
		preview.font = '24px FeH-Font'; preview.textAlign = 'center'; preview.textBaseline = "middle";
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLSET"], 126, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLSET"], 126, 1175);
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLEQUIP"], 360, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLEQUIP"], 360, 1175);
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_SKILLLEARN"], 594, 1175); preview.fillText(languages[language]["MID_UNIT_INFO_TO_SKILLLEARN"], 594, 1175);
		preview.font = '26px FeH-Font';
		preview.strokeText(languages[language]["MID_UNIT_INFO_TO_TALK"], 617, 47); preview.fillText(languages[language]["MID_UNIT_INFO_TO_TALK"], 617, 47);
	}

	var boon = selectboons.value == "None" ? false : selectboons.value; var bane = selectbanes.value == "None" ? false : selectbanes.value; var ascendent = selectascendent.value == "None" ? false : selectascendent.value; var merges = selectmerges.value == "Overlevel" ? -1 : parseInt(selectmerges.value);
	// First write the static text for each stat (normal anchoring)
	preview.font = '25px FeH-Font'; preview.textAlign = 'start'; preview.textBaseline = "top"; preview.strokeStyle = '#0a2533';
	var stats = ["HP", "Atk", "Spd", "Def", "Res"]; var statsstrings = ["MID_HP", "MID_ATTACK", "MID_AGILITY", "MID_DEFENSE", "MID_RESIST"];
	// Each stat name is pushed down by 49pixels with an initial offset of 805
	for (let i = 0; i < stats.length; i++) {
		// The filling color varies depending of it being a boon, bane (without merges), neutral or ascendent
		if (boon == stats[i]) {
			preview.fillStyle = "#b1ecfa";
		} else if (bane == stats[i]) {
			if (merges != 0 && ascendent == stats[i]) {
				preview.fillStyle = "#b1ecfa";
			} else if (merges != 0 || ascendent == stats[i]) {
				preview.fillStyle = "#ffffff";
			} else {
				preview.fillStyle = "#f0a5b3";
			}
		} else if (ascendent == stats[i]) {
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
	// Obtain the base stats to draw depending on the method selected
	if (!statsmode.checked) {
		var statsmodifier = [
			parseInt(selecthp.value) ? parseInt(selecthp.value) : 0,
			parseInt(selectatk.value) ? parseInt(selectatk.value) : 0,
			parseInt(selectspd.value) ? parseInt(selectspd.value) : 0,
			parseInt(selectdef.value) ? parseInt(selectdef.value) : 0,
			parseInt(selectres.value) ? parseInt(selectres.value) : 0
		];
	} else {
		let unitstats = [parseInt(selectadhp.value), parseInt(selectadatk.value), parseInt(selectadspd.value), parseInt(selectaddef.value), parseInt(selectadres.value)];
		let unitgrowths = [parseInt(selectadhpgrowth.value), parseInt(selectadatkgrowth.value), parseInt(selectadspdgrowth.value), parseInt(selectaddefgrowth.value), parseInt(selectadresgrowth.value)];
		for (let i = 0; i < unitgrowths.length; i++) {
			if (unitgrowths[i] < 25 || unitgrowths[i] > 85 || unitgrowths[i] % 5 != 0) {
				alert("Growth values for stats must be multiples of 5 between 25 and 85");
				// Clean the queue
				renderingqueue.shift();
				return;
			}
		}
		var statsmodifier = statcalc(unitstats, unitgrowths, rarity, boon, bane, ascendent, merges, flowers);
	}

	var summoner = selectsummoner.value == "None" ? false : selectsummoner.value;
	// Add visible stats from multiple simple origins like passives, SS, resplendent, beast transformation and bonus
	statsmodifier = statsmodifier.map(function (value, index) {
		return value + staticmodifiers(summoner)[index];
	});

	// Patch the final numbers so they don't overdrawn below 0 and beyond 99
	statsmodifier = statsmodifier.map(function (value, index) {
		// The stat cannot go beyond 99 or below 0
		let stat = -1 < value ? (value < 100 ? value : 99) : 0;
		return stat;
	});

	// Now write the calculated stats with right anchoring to not missplace single digits (damm you LnD abusers). Also prevent to number from going below 0
	// Each stat name is pushed down by 49 pixels with an initial offset of 805
	for (let i = 0; i < stats.length; i++) {
		// Each stat name is pushed down by 49 pixels with an initial offset of 805
		printnumbers(preview, statsmodifier[i], 0, 265, 805 + (i * 49) + (i * 0.3), "end");
	}
	// Print the amount of SP and HM
	var numbertype = selectsp.value == "9999" ? 4 : 0;
	printnumbers(preview, parseInt(selectsp.value), numbertype, 265, 1052, "end");
	var numbertype = selecthm.value == "8000" ? 4 : 0;
	printnumbers(preview, parseInt(selecthm.value), numbertype, 265, 1100, "end");

	// Print the ascendent floret icon if selected
	if (ascendent) {
		await getimage(other["images"]["other"]["ascendent"]).then(img => {
			preview.drawImage(img, 10, 502);
		});
	}

	var accessory = selectaccessory.value == "None" ? false : selectaccessory.value;
	// If we selected an accessory we paste a newer bigger holder and define an offset to push all next items to the right
	var offset = 0;
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
		let posX = accessory ? 223 : 229;
		preview.drawImage(img, posX, 743, 32, 32);
	});
	await getimage(other["images"]["weapontype"][parseInt(selectweapontype.value)]).then(img => {
		// We add an small offset on red weapons to make them look decent
		let offset = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(parseInt(selectweapontype.value)) ? -2 : 0;
		preview.drawImage(img, 20 + offset, 743 + offset);
	});
	// Print the level string
	preview.font = '24px FeH-Font'; preview.fillStyle = "#ffffff"; preview.strokeStyle = '#0a2533'; preview.textAlign = 'start';
	preview.strokeText(languages[language]["MID_LEVEL2"], 70, 746); preview.fillText(languages[language]["MID_LEVEL2"], 70, 746);
	// Print the level 40. It was hardcoded previously so we just do this to make sure it doesn't look off side by side with the merge count
	printnumbers(preview, 40, 1, 124, 745);

	// If we have merges we add the text next to the level
	if (merges != 0) {
		// Decide type of font depending on if we are fully merged or not
		let numbertype = merges == 10 ? 4 : 1;
		printnumbers(preview, "+", numbertype, 163, 748);
		if (merges > 0) {
			printnumbers(preview, merges, numbertype, 181, 745);
		}
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

	var weapon = document.getElementById("nameweapon").value; var refine = selectrefines.value == "None" ? false : selectrefines.value;
	// If the weapon is valid try to print an icon
	if (weapon) {
		// First try to use the icon provided
		if (document.getElementById("iconrefine").files[0]) {
			let reader = new FileReader();
			let fileLoadPromise = new Promise(resolve => {
				reader.onload = resolve;
				reader.readAsDataURL(document.getElementById("iconrefine").files[0]);
			});
			await fileLoadPromise;
			var weaponicon = reader.result;
		// If it is not defined switch to checking about the refine as normal
		} else {
			// By default we always use the basic weapon icon or the predefined stat boosters ones
			var weaponicon = ["Atk", "Spd", "Def", "Res", "Wrathful", "Dazzling"].includes(refine) ? other["images"]["refines"][refine] : other["images"]["other"]["noweapon"];
			// If the icon is an special effect we might have to download it
			if (refine == "Effect" && skills["weapons"][selectweapons.value]["refines"]["Effect"]) {
				weaponicon = "../common/icons/" + selectweapons.value + "-Effect.webp";
			}
		}
		await getimage(weaponicon).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		});
		// Get the string to print
		var printableweapon = weapon;
	// If not just print the basic icon
	} else {
		var printableweapon = "-";
		await getimage(other["images"]["other"]["noweapon"]).then(img => {
			preview.drawImage(img, 370, 797, 44, 44);
		});
	}
	// We always paste the text because it might as well be unarmed and have a "-"
	preview.fillStyle = refine || document.getElementById("iconrefine").files[0] ? "#82f546" : "#ffffff";
	preview.strokeText(printableweapon, 420, 806); preview.fillText(printableweapon, 420, 806);

	var assist = document.getElementById("nameassist").value ? document.getElementById("nameassist").value : "-";
	var special = document.getElementById("namespecial").value ? document.getElementById("namespecial").value : "-";
	// Print assist and special info
	preview.fillStyle = "#ffffff";
	preview.strokeText(assist, 420, 854); preview.fillText(assist, 420, 854);
	preview.strokeText(special, 420, 904); preview.fillText(special, 420, 904);

	var passives = ["Askill", "Bskill", "Cskill", "Sskill"];
	// Render all the passives
	for (let i = 0; i < passives.length; i++) {
		let name = document.getElementById("name" + passives[i]).value != "" ? document.getElementById("name" + passives[i]).value : "-";
		// Check first for a custom icon
		if (document.getElementById("icon" + passives[i]).files[0]) {
			let reader = new FileReader();
			let fileLoadPromise = new Promise(resolve => {
				reader.onload = resolve;
				reader.readAsDataURL(document.getElementById("icon" + passives[i]).files[0]);
			});
			await fileLoadPromise;
			// Icons are automatically resized into 44 regarless of source
			await getimage(reader.result).then(img => {
				preview.drawImage(img, passiverender[passives[i][0]]["icon"][0], passiverender[passives[i][0]]["icon"][1], 44, 44);
			});
		} else if (document.getElementById(passives[i]).value != "None") {
			await getimage("../common/icons/" + document.getElementById(passives[i]).value + ".webp").then(img => {
				// If the image size is bigger than 44 these are some tier 4 skills that have shiny borders and their icon must be and offsetted accordingly
				let iconoffset = img.height > 44 ? -2 : 0;
				preview.drawImage(img, passiverender[passives[i][0]]["icon"][0] + iconoffset, passiverender[passives[i][0]]["icon"][1] + iconoffset);
			});
		}
		// We always write the text because it might be a simple "-"
		preview.strokeText(name, passiverender[passives[i][0]]["text"][0], passiverender[passives[i][0]]["text"][1]);
		preview.fillText(name, passiverender[passives[i][0]]["text"][0], passiverender[passives[i][0]]["text"][1]);
		// Print the category indicator
		await getimage(other["images"]["skillindicators"][passives[i][0]]).then(img => {
			preview.drawImage(img, passiverender[passives[i][0]]["indicator"][0], passiverender[passives[i][0]]["indicator"][1], 21, 21);
		});
	}

	var blessing = selectblessings.value == "None" ? false : selectblessings.value;
	// X amount to additionally push each icon to the left
	var offsetX = 0;
	// Detect if we are printing more than three icons (this could happen on duo/blessed/summoner supported allies) so we can resize accordingly
	var needsresize = blessing && summoner && duoharmo.value != "Normal" ? true : false;
	var posY = needsresize ? 595 : 570; var posX = needsresize ? 600 : 575;
	var width = needsresize ? 115 : 147; var height = needsresize ? 125 : 160;
	// If blessed print the icon
	if (blessing) {
		let blessingicon = "/common/other/" + blessing + ".webp";
		await getimage(blessingicon).then(img => {
			preview.drawImage(img, posX, posY, width, height);
		});
		// If printed a blessing the next's position icon must go further to the left
		offsetX += needsresize ? 100 : 125;
	}

	// If is a duo hero of any kind print the icon
	if (duoharmo.value != "Normal") {
		let specialicon = other["images"]["other"][duoharmo.value];
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

	// Clean the queue
	renderingqueue.shift();
}
