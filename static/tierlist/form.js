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

// Dicts for info
var units, skills, other, languages;
// All selects we have available
selectweapontype = document.getElementById("weapontype");
selectmovetype = document.getElementById("movetype");
selectblessing = document.getElementById("blessing");
selectduoharmo = document.getElementById("duoharmo");
selectgametype = document.getElementById("gametype");
selectattire = document.getElementById("attire");
selectsavelist = document.getElementById("savelist");

// Checkboxes
checkshowweapon = document.getElementById("showweapon");
checkshowmovement = document.getElementById("showmovement");
checkshowblessing = document.getElementById("showblessing");
checkshoworigin = document.getElementById("showorigin");

// All currently rendered units
rendered = document.getElementById("results");
// Current tier
tierlist = document.getElementById("tierlist");

// Fetch all data from each json
// We can download the rest of the data now that lenguages are available
fetch('/common/data/tierunits.json')
	.then(res => res.json())
	.then((out) => {
		// We store the heroes for basic checks within the browser
		units = out;
		fetch('/common/data/tierother.json')
			.then(res => res.json())
			.then((out) => {
				// We store other data for basic checks within the browser
				other = out;
				init();
		}).catch(err => console.error(err));
}).catch(err => console.error(err));

function init() {
	// Try to get all saved tierlists
	if (localStorage.getItem('saves')) {
		saves = JSON.parse(localStorage.getItem('saves'));
	// Or setup the default ones
	} else {
		saves = {
			"Default": {
				"tierlist": [
					{"color": "#FF7F7F", "name": "S", "content": []},
					{"color": "#FFBF7F", "name": "A", "content": []},
					{"color": "#FFFF7F", "name": "B", "content": []},
					{"color": "#BFFF7F", "name": "C", "content": []},
					{"color": "#7FFFFF", "name": "D", "content": []},
					{"color": "#7FBFFF", "name": "E", "content": []}
				]
			}
		}
		localStorage.setItem('saves', JSON.stringify(saves));
	}
	// Fill the select of saved tierlists
	while (selectsavelist.lastChild) {
		selectsavelist.removeChild(selectsavelist.lastChild);
	}
	savenames = Object.keys(saves);
	for (i = 0; i < savenames.length; i++) {
		var savename = document.createElement('option');
		savename.value = savenames[i];
		savename.innerHTML = savenames[i];
		selectsavelist.appendChild(savename);
	}
	// Create the first tierlist if exists
	if (Object.keys(saves)[0]) {
		loadsave(Object.keys(saves)[0]);
	}
	// Populate based on current filters
	populate();
}

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
	target = ev.target;
	if (target.id.substring(0, 3) == "PID") {
		target = ev.target.parentElement;
	}
	target.appendChild(document.getElementById(data));
}

// Function to convert RGB to HEX
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

function populate() {
	// First delete all currently rendered
	while (rendered.lastChild) {
		rendered.removeChild(rendered.lastChild);
	}
	// List of heroes to be added
	heroes = [];
	// Use current epoch just to make sure we can add duplicated units
	epoch = new Date().getTime();
	// Store the selected weapon type to avoid splitting many times
	var curweapontype = selectweapontype.value.split(",");
	// Store the selected blessing type to avoid splitting many times
	var curblessingtype = selectblessing.value.split(",");

	// Start looping through all units
	Object.keys(units).forEach((value) => {
		// Skip enemy units
		if (value[0] == "E") {
			return;
		}
		// By default consider adding the unit until filtered out
		add = true

		// Check if we match the movement type
		if (selectmovetype.value == "All") {
			add = true;
		} else if (units[value]["moveType"] == selectmovetype.value) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the weapon type
		if (curweapontype[0] == "All") {
			add = true;
		} else if (curweapontype.includes(units[value]["WeaponType"].toString())) {
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
		if (selectduoharmo.value == "All") {
			add = true;
		} else if (other[selectduoharmo.value].includes(value)) {
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
		} else if (units[value]["resplendent"]) {
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
	for (i = 0; i < heroes.length; i++) {
		var opt = document.createElement('div');
		// Change variant if resplendent
		variant = selectattire.value == "Resplendent" ? "_Resplendent" : "";
		opt.style.backgroundImage = "url(/common/hd-faces/" + heroes[i] + variant + ".webp)";
		opt.draggable = "true";
		opt.className = "unit";
		opt.id = heroes[i] + (selectattire.value == "Resplendent" ? "-resp" : "") + "-" + epoch;
		opt.addEventListener("dragstart", function(event) {drag(event)});
		// Create and add the items indicating weapon, movement, blessing and origin
		var weapon = document.createElement('img');
		weapon.className = "iconinfo weapon";
		weapon.src = "/common/other/" + units[heroes[i]]["WeaponType"] + "-weapon.webp";
		opt.appendChild(weapon);
		var movement = document.createElement('img');
		movement.className = "iconinfo movement";
		movement.src = "/common/other/" + units[heroes[i]]["moveType"] + "-move.webp";
		opt.appendChild(movement);
		var origin = document.createElement('img');
		origin.className = "iconinfo origin";
		origin.src = "/common/other/" + units[heroes[i]]["origin"] + "-game.webp";
		opt.appendChild(origin);
		if (other["blessed"][heroes[i]]) {
			var blessing = document.createElement('img');
			blessing.className = "iconinfo blessing";
			blessing.src = "/common/other/" + other["blessed"][heroes[i]]["blessing"] + "-Blessing-special.webp";
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
	// Compose the weapon/move url
	weapon = caller.value == "All" ? "0" : caller.value.split(",")[0];
	url = "/common/other/" + weapon + "-" + caller.id.slice(0, -4) + ".webp";
	// Now change the url on the imagelabel
	document.getElementById(caller.id.slice(0, -4) + "icon").src = url;
}
