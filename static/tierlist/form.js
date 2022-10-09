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

// Functions to allow drag and drop
function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var target = ev.target;
	if (target.id.substring(0, 3) == "PID") {
		target = ev.target.parentElement;
	}
	target.appendChild(document.getElementById(data));
}

function populatetierlistlist() {
	// Fill the select of saved tierlists
	while (selectsavelist.lastChild) {
		selectsavelist.removeChild(selectsavelist.lastChild);
	}
	var savenames = Object.keys(saves);
	for (let i = 0; i < savenames.length; i++) {
		let savename = document.createElement('option');
		savename.value = savenames[i];
		savename.innerHTML = savenames[i];
		selectsavelist.appendChild(savename);
	}
	// Create the first tierlist if exists
	if (Object.keys(saves)[0]) {
		loadsave(Object.keys(saves)[0]);
	}
}

function populate() {
	// First delete all currently rendered
	while (rendered.lastChild) {
		rendered.removeChild(rendered.lastChild);
	}
	// List of heroes to be added
	var heroes = [];
	// Use current epoch just to make sure we can add duplicated units
	var epoch = new Date().getTime();
	// Store the selected weapon type to avoid splitting many times
	var curweapontype = selectweapontype.value.split(",");
	// Store the selected blessing type to avoid splitting many times
	var curblessingtype = selectblessing.value.split(",");
	// Store the book limits to avoid splitting many times
	var minid = selectbookrelease.value.split(",")[0];
	var maxid = selectbookrelease.value.split(",")[1];

	// Start looping through all units
	Object.keys(units).forEach((value) => {
		// Skip enemy units
		if (value[0] == "E") {
			return;
		}
		// By default consider adding the unit until filtered out
		let add = true;

		// Check if we match the movement type
		if (selectmovetype.value == "All") {
			add = true;
		} else if (units[value]["move"] == selectmovetype.value) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the weapon type
		if (curweapontype[0] == "All") {
			add = true;
		} else if (curweapontype.includes(units[value]["weapon"].toString())) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the legendary type
		if (curblessingtype[0] == "All") {
			add = true;
		} else if (other["blessed"][value] ? curblessingtype.includes(other["blessed"][value]["blessing"].toString()) : false) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the unit type
		if (selectherotype.value == "All") {
			add = true;
		} else if (other[selectherotype.value].includes(value)) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the game
		if (selectgametype.value == "All") {
			add = true;
		} else if (units[value]["origin"] == selectgametype.value) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the attire
		if (selectattire.value == "All") {
			add = true;
		} else if (selectattire.value == "Resplendent" && units[value]["resplendent"]) {
			add = true;
		} else if (selectattire.value == "NotResplendent" && !units[value]["resplendent"]) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the release ID for the book
		if (units[value]["id"] >= minid && units[value]["id"] < maxid) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the group theme
		if (selectthemegroup.value == "All") {
			add = true;
		} else if (other["seasonals"][selectthemegroup.value].includes(value)) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Arriving at this check with a true add value measn we can add the option
		if (add) {
			heroes.push(value);
		}
	});
	
	// For every hero that went through the filter add an image
	for (let i = 0; i < heroes.length; i++) {
		let opt = document.createElement('div');
		// Change variant if resplendent
		let variant = selectattire.value == "Resplendent" ? "_Resplendent" : "";
		opt.style.backgroundImage = "url(/common/hd-faces/" + heroes[i] + variant + ".webp)";
		opt.draggable = "true";
		opt.className = "unit";
		opt.id = heroes[i] + (selectattire.value == "Resplendent" ? "-resp" : "") + "-" + epoch;
		opt.addEventListener("dragstart", function(event) {drag(event)});
		// Create and add the items indicating weapon, movement, blessing and origin
		let weapon = document.createElement('img');
		weapon.className = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[heroes[i]]["weapon"]) ? "iconinfo weapon patched" : "iconinfo weapon";
		weapon.src = "/common/other/" + units[heroes[i]]["weapon"] + "-weapon.webp";
		weapon.title = "Weapon Type";
		opt.appendChild(weapon);
		let movement = document.createElement('img');
		movement.className = "iconinfo movement";
		movement.src = "/common/other/" + units[heroes[i]]["move"] + "-move.webp";
		movement.title = "Movement Type";
		opt.appendChild(movement);
		let origin = document.createElement('img');
		origin.className = "iconinfo origin";
		origin.src = "/common/other/" + units[heroes[i]]["origin"] + "-game.webp";
		origin.title = "Game of Origin";
		opt.appendChild(origin);
		if (other["blessed"][heroes[i]]) {
			let blessing = document.createElement('img');
			blessing.className = "iconinfo blessing";
			blessing.src = "/common/other/" + other["blessed"][heroes[i]]["blessing"] + "-Blessing-special.webp";
			blessing.title = "Default Blessing";
			opt.appendChild(blessing);
		}
		rendered.appendChild(opt);
	}
	// Make sure the icons are respecting the set rules
	iconvisibility(checkshowweapon); iconvisibility(checkshowmovement); iconvisibility(checkshowblessing); iconvisibility(checkshoworigin);
}

function statictranslations() {
}

function changetype(caller) {
	var iconid = caller.id.slice(0, -4);
	var iconnumber = caller.value == "All" ? caller.options[1].value.split(",")[0] : caller.value.split(",")[0];
	// Depending on the origin compose different urls
	switch (iconid) {
		case "blessing":
			var url = "/common/other/" + iconnumber + "-Blessing-special.webp";
			break;
		case "weapon":
		case "move":
		case "game":
			var url = "/common/other/" + iconnumber + "-" + iconid + ".webp";
			break;
	}
	// Now change the url on the imagelabel
	document.getElementById(iconid + "icon").src = url;
}
