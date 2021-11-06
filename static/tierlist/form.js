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
		populate();
}).catch(err => console.error(err));
fetch('/common/data/tierother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
}).catch(err => console.error(err));

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

function populate() {
	// First delete all currently rendered
	while (rendered.lastChild) {
		rendered.removeChild(rendered.lastChild);
	}
	// List of heroes to be added
	heroes = [];
	
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
		} else if (units[value]["moveType"] == parseInt(selectmovetype.value)) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the weapon type
		if (selectweapontype.value == "All") {
			add = true;
		} else if (units[value]["WeaponType"] == parseInt(selectweapontype.value)) {
			add = true;
		// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
		} else {
			return;
		}

		// Check if we match the legendary type
		if (selectblessing.value == "All") {
			add = true;
		} else if (other["blessed"][value] ? (other["blessed"][value]["blessing"] == parseInt(selectblessing.value)) : false) {
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
		} else if (units[value]["origin"] == parseInt(selectgametype.value)) {
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
		var opt = document.createElement('img');
		opt.src = "/common/hd-faces/" + heroes[i] + ".webp";
		opt.style.height = "5em";
		opt.draggable = "true";
		opt.id = heroes[i];
		opt.addEventListener("dragstart", function(event) {drag(event)}); 
		rendered.appendChild(opt);
	}
}

function statictranslations() {
}

function reset(section) {
	switch (section) {
		case "unit":
			selectrarity.value = "5";
			selectmerges.value = "0";
			selectflowers.value = "0";
			selectsummoner.value = "None";
			selectattire.value = "Normal";
			// For beasts disable transformation
			weapontype = units[selectheroes.value]["WeaponType"];
			if ([20, 21, 22, 23].includes(weapontype)) {
				selectbeast.value = "no";
			}
		break;
		case "skills":
			selectweapons.value = "None";
			updateRefine();
			selectrefines.value = "None";
			selectassists.value = "None";
			selectspecials.value = "None";
			selectA.value = "None";
			selectB.value = "None";
			selectC.value = "None";
			// Trigger a rebuild of the selects based on the language filters set
			populateall(false);
	}
	reload();
}

function changetype(caller) {
	// Compose the weapon/move url
	weapon = caller.value == "All" ? "0" : caller.value;
	url = "/common/other/" + weapon + "-" + caller.id.slice(0, -4) + ".webp";
	// Now change the url on the imagelabel
	document.getElementById(caller.id.slice(0, -4) + "icon").src = url;
}
