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

const openbutton = document.getElementById("openbutton");
const barrackscontent = document.getElementById("barrackscontent");
const searchbarracks = document.getElementById("searchbarracks");
const sortbarracks = document.getElementById("sortbarracks");
const unitlist = document.getElementById("unitlist");

// Slide open the barracks if clicking on the button
openbutton.addEventListener('click', () => {
	barrackscontent.className = 'visible';
});

// Clicking outside of barracks close it
document.addEventListener('click', (e) => {
	if (!barrackscontent.contains(e.target) && e.target != openbutton) {
		barrackscontent.className = '';
	}
});

// Default values for all categories in case we are updating
barracksdefaults = {
	"cheats": false,
	"max": true,
	"hero": "None",
	"attire": "Normal",
	"rarity": "5",
	"beast": "no",
	"support": "None",
	"merges": "0",
	"flowers": "0",
	"boon": "None",
	"bane": "None",
	"ascended": "None",
	"bonus": "no",
	"blessing": "None",
	"weapon": "None",
	"refine": "None",
	"assist": "None",
	"special": "None",
	"emblemhero": "None",
	"emblemmerges": "0",
	"A": "None",
	"B": "None",
	"C": "None",
	"S": "None",
	"X": "None",
	"allies": {},
	"bonuses": ["0","0","0","0"],
	"pairup": ["0","0","0","0"],
	"sp": "9999",
	"hm": "9000",
	"art": "Portrait",
	"template": "MyUnit",
	"offsetX": "0",
	"offsetY": "0",
	"mirror": "None",
	"background": "base",
	"favorite": "1",
	"accessory": "None",
	"appui": true
}

async function loadbarracks() {
	// First delete them all
	while (unitlist.lastChild) {
		unitlist.removeChild(unitlist.lastChild);
	}

	// Decide barracks order
	sortedbarracks = sortbarracks.value == "newer" ? Object.keys(barracks).reverse() : Object.keys(barracks);
	// For each build in the barracks, add an entry
	sortedbarracks.forEach((key) => {
		info = barracks[key]
		let keywords = info["name"] + " " + languages[selectlanguage.value]["M" + info["hero"]]
		// If the search is not contained in the keywords skip
		if (keywords.toUpperCase().indexOf(searchbarracks.value.toUpperCase()) == -1) {
			return;
		}
		// Create the base radio button
		let option = document.createElement('input');
		option.type = 'radio';
		option.name = "selectedbarrackshero";
		// Use the key as value so later we can figure out who pick
		option.id = key;
		option.value = key;
		// Do not render the base checkbox, we will use labels
		option.className = "unrendered";
		// Show preview when changing the selection
		option.addEventListener('change', function(event) {showbuild();});

		// Create the label
		let label = document.createElement('label');
		label.className = "barrackshero"
		label.setAttribute('for', key);

		// Add image inside the label
		label.style.backgroundImage = "url('/common/hd-faces/" + info["hero"] + ".webp')";

		// Add a tag with the name
		let buildname = document.createElement('div');
		buildname.className = "buildname";
		buildname.innerHTML = info["name"]
		label.appendChild(buildname);

		// Add both the radio and label to content
		unitlist.appendChild(option);
		unitlist.appendChild(label);
	});
	// Show the first build by default
	if (unitlist.firstChild) {
		unitlist.firstChild.checked = "checked";
		showbuild();
	}
}

function showbuild() {
	var buildid = document.querySelector('input[name="selectedbarrackshero"]:checked').id;
	var language = selectlanguage.value;
	if (barracks[buildid]) {
		// Show unit name
		document.getElementById("buildhero").innerHTML = languages[language]["M" + barracks[buildid]["hero"]] + ": " + (languages[selectlanguage.value][barracks[buildid]["hero"].replace("PID", "MPID_HONOR")] || "Generic");

		// List of info that can be previewed easily
		var showinfo = ["merges","flowers","boon","bane","ascended"];
		for (i = 0; i < showinfo.length; i++) {
			document.getElementById("build" + showinfo[i]).innerHTML = barracks[buildid][showinfo[i]] ? barracks[buildid][showinfo[i]] : barracksdefaults[showinfo[i]];
		}

		// Show blessing name since we store a numeric value
		var blessings = ["Fire","Water","Wind","Earth","Light","Dark","Astra"];
		document.getElementById("buildblessing").innerHTML = barracks[buildid]["blessing"] != "None" ? blessings[barracks[buildid]["blessing"] - 1] : "-";

		// Some other slots need to be translated on the fly
		var translateinfo = ["weapon","assist","special","A","B","C","S","X"];
		for (i = 0; i < translateinfo.length; i++) {
			document.getElementById("build" + translateinfo[i]).innerHTML = barracks[buildid][translateinfo[i]] ? (languages[language]["M" + barracks[buildid][translateinfo[i]]] ?? barracksdefaults[translateinfo[i]]) : "-";
		}
	} else {
		// Clear the preview since we are return to None in the select soon
		var showinfo = ["hero","merges","flowers","boon","bane","ascended","blessing", "refine","weapon","assist","special","A","B","C","S","X"];
		for (i = 0; i < showinfo.length; i++) {
			document.getElementById("build" + showinfo[i]).innerHTML = "-";
		}
	}
}


async function loadbuild() {
	if (!document.querySelector('input[name="selectedbarrackshero"]:checked')) {
		return;
	}
	var buildid = document.querySelector('input[name="selectedbarrackshero"]:checked').id;

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
	var buildinfo = ["attire","rarity","beast","support","merges","flowers","boon","bane","ascended","bonus","blessing","refine","assist","special", "emblemhero", "emblemmerges","A","B","C","S","X","sp","hm","art","template","offsetX","offsetY","mirror","background","favorite","accessory"]
	var buildselects = [selectattire,selectrarity,selectbeast,selectsummoner,selectmerges,selectflowers,selectboons,selectbanes,selectascendent,selectbonusunit,selectblessings,selectrefines,selectassists,selectspecials,selectemblemhero,selectemblemmerges,selectA,selectB,selectC,selectS,selectX,selectsp,selecthm,selectartstyle,selecttemplate,selectoffsetX,selectoffsetY,selectmirror,selectbackground,selectfavorite,selectaccessory]
	for (i = 0; i < buildinfo.length; i++) {
		buildselects[i].value = barracks[buildid][buildinfo[i]] ? barracks[buildid][buildinfo[i]] : barracksdefaults[buildinfo[i]];
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

	// Close barracks tab so we can jump background
	barrackscontent.className = '';
}

async function savebuild(action = "save") {
	// Do not run if no hero is selected
	if (selectheroes.value == "None") {
		alert("Current build slot has no hero set, cannot " + action + ".");
		return;
	}
	// Stop if we are overwritting to None
	if (!document.querySelector('input[name="selectedbarrackshero"]:checked') && action == "overwrite") {
		return;
	}
	// Use epoch as unit ID to prevent dobles when saving anew, otherwise steal the old place
	var unitid = action == "save" ? new Date().getTime() : document.querySelector('input[name="selectedbarrackshero"]:checked').id;
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
		"emblemhero": selectemblemhero.value,
		"emblemmerges": selectemblemmerges.value,
		"A": selectA.value,
		"B": selectB.value,
		"C": selectC.value,
		"S": selectS.value,
		"X": selectX.value,
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
	// Rebuild barracks
	await loadbarracks();
	// Load the new build again to stay in synced
	document.getElementById(unitid.toString()).checked = "checked";
	showbuild();
}

async function removebuild() {
	if (!document.querySelector('input[name="selectedbarrackshero"]:checked')) {
		return;
	}
	var buildid = document.querySelector('input[name="selectedbarrackshero"]:checked').id;
	// Check if the key exists before proceeding
	if (barracks[buildid]) {
		delete barracks[buildid];
		// Clear the preview since we are return to None in the select soon
		var showinfo = ["hero","merges","flowers","boon","bane","ascended","blessing", "refine","weapon","assist","special","A","B","C","S","X"];
		for (i = 0; i < showinfo.length; i++) {
			document.getElementById("build" + showinfo[i]).innerHTML = "-";
		}
		// Rebuild select again
		await loadbarracks();
		// Save to local storage
		localStorage.setItem('barracks', JSON.stringify(barracks));
	}
}
