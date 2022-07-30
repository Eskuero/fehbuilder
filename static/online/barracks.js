barracksdialog = document.getElementById("barracksdialog");

// Try to get all saved units
if (localStorage.getItem('barracks')) {
	barracks = JSON.parse(localStorage.getItem('barracks'));
// Or setup it up
} else {
	barracks = {};
	localStorage.setItem('barracks', JSON.stringify(barracks));
}
loadbarracks();

async function loadbarracks() {
	var domitem = document.getElementById("selectbuild");
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang] || !other) {
		await sleep(100);
	}
	// Get current value to restore it back if possible
	var previousvalue = domitem.value;
	// First delete them all
	while (domitem.lastChild) {
		domitem.removeChild(domitem.lastChild);
	}
	// All data to be printed (Always add the None option with it's proper translation)
	var options = {"None": {"string": languages[selectlanguage.value]["MSID_H_NONE"]}};
	var sorted = {};
	// If indicated to bypass don't do checks for this select, print everything and leave (this is exclusively for the heroes select)
	Object.entries(barracks).forEach(([key, info]) => {
		sorted[languages[selectlanguage.value]["M" + info["hero"]] + ": " + (languages[selectlanguage.value][info["hero"].replace("PID", "MPID_HONOR")] || "Generic") + " - " + info["name"]] = key;
	});
	sorted = Object.keys(sorted).sort().reduce((res, key) => (res[key] = sorted[key], res), {});
	// Obtain the final data object that rebspicker can read
	for (const [string, tag] of Object.entries(sorted)) {
		options[tag] = {"string": string};
		if (other["duokeywords"][tag]) {
			options[tag]["keywords"] = other["duokeywords"][tag];
		}
	}
	// Generate the select
	selectbarracks = new Rebspicker(domitem, "single", options);
	// Restore the previous value if it's available on the updated select
	if ([...selectbarracks.options].map(opt => opt.value).includes(previousvalue)) {
		selectbarracks.value = previousvalue;
	}
}

function showbuild() {
	var buildid = selectbarracks.value;
	var language = selectlanguage.value;
	if (barracks[buildid]) {
		// Show unit name
		document.getElementById("buildhero").innerHTML = languages[language]["M" + barracks[buildid]["hero"]] + ": " + (languages[selectlanguage.value][barracks[buildid]["hero"].replace("PID", "MPID_HONOR")] || "Generic");

		// List of info that can be previewed easily
		var showinfo = ["attire","support","merges","flowers","boon","bane","ascended","refine"];
		for (i = 0; i < showinfo.length; i++) {
			document.getElementById("build" + showinfo[i]).innerHTML = barracks[buildid][showinfo[i]];
		}

		// Show blessing name since we store a numeric value
		var blessings = ["Fire","Water","Wind","Earth","Light","Dark","Astra"];
		document.getElementById("buildblessing").innerHTML = barracks[buildid]["blessing"] != "None" ? blessings[barracks[buildid]["blessing"] - 1] : "-";

		// Some other slots need to be translate on the fly
		var translateinfo = ["weapon","assist","special","A","B","C","S"];
		for (i = 0; i < translateinfo.length; i++) {
			document.getElementById("build" + translateinfo[i]).innerHTML = barracks[buildid][translateinfo[i]] != "None" ? languages[language]["M" + barracks[buildid][translateinfo[i]]] : "-";
		}
	} else {
		// Clear the preview since we are return to None in the select soon
		var showinfo = ["hero","attire","support","merges","flowers","boon","bane","ascended","blessing", "refine","weapon","assist","special","A","B","C","S"];
		for (i = 0; i < showinfo.length; i++) {
			document.getElementById("build" + showinfo[i]).innerHTML = "-";
		}
	}
}

async function removebuild() {
	var buildid = selectbarracks.value;
	// Check if the key exists before proceeding
	if (barracks[buildid]) {
		delete barracks[buildid];
		// Clear the preview since we are return to None in the select soon
		var showinfo = ["hero","attire","support","merges","flowers","boon","bane","ascended","blessing", "refine","weapon","assist","special","A","B","C","S"];
		for (i = 0; i < showinfo.length; i++) {
			document.getElementById("build" + showinfo[i]).innerHTML = "-";
		}
		// Rebuild select again
		await loadbarracks();
		// Save to local storage
		localStorage.setItem('barracks', JSON.stringify(barracks));
	}
}

async function loadbuild() {
	var buildid = selectbarracks.value;
	// Stop if we are loading None
	if (buildid == "None") {
		return;
	}

	// First apply hero, cheats and max skill toogles to make sure the selects contain the required info
	selectheroes.value = barracks[buildid]["hero"];
	cheats.checked = barracks[buildid]["cheats"];
	bestskills.checked = barracks[buildid]["max"];
	// Now force a reload of all the selects
	await populateall(false);
	// Now recover the weapon as it enables different refines and then rebuild those
	selectweapons.value = barracks[buildid]["weapon"];
	updateRefine();
	// Replace the most of the remaining easy info
	var buildinfo = ["attire","rarity","beast","support","merges","flowers","boon","bane","ascended","bonus","blessing","refine","assist","special","A","B","C","S","sp","hm","art","template","offsetX","offsetY","mirror","background","favorite","accessory"]
	var buildselects = [selectattire,selectrarity,selectbeast,selectsummoner,selectmerges,selectflowers,selectboons,selectbanes,selectascendent,selectbonusunit,selectblessings,selectrefines,selectassists,selectspecials,selectA,selectB,selectC,selectS,selectsp,selecthm,selectartstyle,selecttemplate,selectoffsetX,selectoffsetY,selectmirror,selectbackground,selectfavorite,selectaccessory]
	for (i = 0; i < buildinfo.length; i++) {
		buildselects[i].value = barracks[buildid][buildinfo[i]];
	}

	// Restore appui
	appui.checked = barracks[buildid]["appui"];

	// Restore bonuses and pairup values
	var bonuses = barracks[buildid]["bonuses"];
	selectatk.value = bonuses[0]; selectspd.value = bonuses[1]; selectdef.value = bonuses[2]; selectres.value = bonuses[3];
	var pairup = barracks[buildid]["pairup"];
	selectatkpairup.value = pairup[0]; selectspdpairup.value = pairup[1]; selectdefpairup.value = pairup[2]; selectrespairup.value = pairup[3];

	// Trigger a rebuild of the allies providing buffs
	var toberestored = [];
	for (let i = 0; i < selectallies.options.length; i++) {
		let ally = selectallies.options[i].value;
		if (barracks[buildid]["allies"][ally]) {
			toberestored.push(ally);
		}
	}
	fillblessed(false, toberestored);
	showallies(true, barracks[buildid]["allies"]);

	// Regenerate the image
	reload();
}

async function savebuild(action = "save") {
	// Do not run if no hero is selected
	if (selectheroes.value == "None") {
		alert("Current build slot has no hero set, cannot " + action + ".");
		return;
	}
	// Stop if we are overwritting to None
	if (selectbarracks.value == "None" && action == "overwrite") {
		return;
	}
	// Use epoch as unit ID to prevent dobles when saving anew, otherwise steal the old place
	var unitid = action == "save" ? new Date().getTime() : selectbarracks.value;
	// If overwritting to not ask for a new name but re-use the old one
	if (action == "overwrite") {
		var name = barracks[unitid]["name"];
	} else {
		var name = prompt("Save current build? Specify a name for the build:");
		// If name was not specified or empty don't do anything
		if (!name) {  
			return;  
		}
	}
	// Get allies info
	var allies = {}
	for (let i = 0; i < selectallies.selectedOptions.length; i++) {
		let ally = selectallies.selectedOptions[i].value;
		allies[ally] = document.getElementById(ally).value;
	}
	// Set the unit to barracks
	barracks[unitid] = {
		"name": name,
		"cheats": cheats.checked,
		"max": bestskills.checked,
		"hero": selectheroes.value,
		"attire": selectattire.value,
		"rarity": selectrarity.value,
		"beast": selectbeast.value,
		"support": selectsummoner.value,
		"merges": selectmerges.value,
		"flowers": selectflowers.value,
		"boon": selectboons.value,
		"bane": selectbanes.value,
		"ascended": selectascendent.value,
		"bonus": selectbonusunit.value,
		"blessing": selectblessings.value,
		"weapon": selectweapons.value,
		"refine": selectrefines.value,
		"assist": selectassists.value,
		"special": selectspecials.value,
		"A": selectA.value,
		"B": selectB.value,
		"C": selectC.value,
		"S": selectS.value,
		"allies": allies,
		"bonuses": [selectatk.value, selectspd.value, selectdef.value, selectres.value],
		"pairup": [selectatkpairup.value, selectspdpairup.value, selectdefpairup.value, selectrespairup.value],
		"sp": selectsp.value,
		"hm": selecthm.value,
		"art": selectartstyle.value,
		"template": selecttemplate.value,
		"offsetX": selectoffsetX.value,
		"offsetY": selectoffsetY.value,
		"mirror": selectmirror.value,
		"background": selectbackground.value,
		"favorite": selectfavorite.value,
		"accessory": selectaccessory.value,
		"appui": appui.checked
	}
	// Save to local storage
	localStorage.setItem('barracks', JSON.stringify(barracks));
	// Rebuild select
	await loadbarracks();
	// Load the new build again to stay in synced
	selectbarracks.value = unitid.toString();
	showbuild();
}

function openclosebarracks(action) {
	if (action == "close") {
		barracksdialog.style.display = "none";
	} else {
		barracksdialog.style.display = "flex";
	}
}
