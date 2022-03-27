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
var units, other;
// All selects we have available
selectheroes = document.getElementById('selectheroes');
selectartstyle = document.getElementById('artstyle');
selectstructure = document.getElementById('selectstructure');
selectmap = document.getElementById("mapselect");
selectcheats = document.getElementById("cheats");

// Checkboxes
checkshowweapon = document.getElementById("showweapon");
checkshowmovement = document.getElementById("showmovement");
checkshowblessing = document.getElementById("showblessing");

// Current map
mapcanvas = document.getElementById("map");

// We store languages data for display of strings within the browser
languages = {};

// Fetch all data from each json
// We can download the rest of the data now that lenguages are available
fetch('/common/data/individual/summonlanguages-USEN.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages["USEN"] = out;
		fetch('/common/data/tierunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store unit data for basic checks within the browser
				units = out;
				fetch('/common/data/mapsother.json')
					.then(res => res.json())
					.then((out) => {
						// We store other data for basic checks within the browser
						other = out;
						init();
				}).catch(err => console.error(err));
		}).catch(err => console.error(err));
}).catch(err => console.error(err));

// Custom matcher for search results filtering
function matchCustom(params, data) {
	// If there are no search terms, return all of the data
	if ($.trim(params.term) === '') {
		return data;
	}
	// Do not display the item if there if the entry is null
	if (typeof data === 'undefined') {
		return null;
	}

	// This is the entry we are checking
	var entry = data.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace("'","");
	// This is the search string we are using
	var search = params.term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace("'","");

	// Check if the search string exists within a certain entry
	if (entry.indexOf(search) > -1) {
		return data;
	}

	// If the particular PID for the option is a duo with defined keywords check if any of them match the search
	if (other["duokeywords"][data.id]) {
		if (other["duokeywords"][data.id].toUpperCase().indexOf(search) > -1) {
			return data;
		}
	}

	// Return `null` if the term should not be displayed
	return null;
}

// Once the document is ready initiate the selects with their required
$(document).ready(function() {
	$('.s2-select').select2({
		matcher: matchCustom,
		width: '100%'
	});
});

// FIXME: Workaround for https://github.com/select2/select2/issues/5993 when using JQuery 3.6
$(document).on("select2:open", () => {
	document.querySelector(".select2-container--open .select2-search__field").focus();
});

function init() {
	// Setup map background
	changemap();

	// Scan the map to generate limits
	scan();

	// Populate hero select
	populate(selectheroes, units, true);
}

function updatedialog(caller) {
	// Restore the selected structure
	if (caller.lastChild) {
		if (caller.lastChild.className == "structure") {
			selectstructure.value = caller.lastChild.id;
			// If the struct is mandatory and cheats are not enabled do not show the dialog at all
			if (caller.lastChild.getAttribute("structtype") == "mandatory" && !selectcheats.checked) {
				return;
			}
		} else {
			selectstructure.value = "None";
		}
	} else {
		selectstructure.value = "None";
	}

	// Loop through all structures with their class and disable them when necessary
	var structures = document.getElementsByClassName("structure");
	var todisable = [];
	for (let j = 0; j < selectstructure.options.length; j++) {
		selectstructure.options[j].disabled = false;
		for (let i = 0; i < structures.length; i++) {
			// Disable duplicates
			if (selectstructure.options[j].value == structures[i].id && structures[i].parentElement.id != "results") {
				todisable.push(selectstructure.options[j]);
			}
			// Don't allow more than six defensive structures
			if (selectstructure.options[j].getAttribute("structtype") == "defensive" && maplimits["defensive"].length >= 6) {
				// If the item already in the cell is a defensive structure don't disable them to allow replacing
				let typeofchild = caller.firstChild ? caller.firstChild.getAttribute("structtype") : "none";
				if (typeofchild != "defensive") {
					todisable.push(selectstructure.options[j]);
				}
			}
			// Don't allow more than one school
			if (selectstructure.options[j].value.indexOf("school") != -1 && maplimits["schooled"]) {
				// If the item already in the cell is a school don't disable them to allow replacing
				let typeofchild = caller.firstChild ? caller.firstChild.id : "none";
				if (typeofchild.indexOf("school") == -1) {
					todisable.push(selectstructure.options[j]);
				}
			}
		}
	}
	// If cheats are enabled we don't care about this
	if (!selectcheats.checked) {
		for (let i = 0; i < todisable.length; i++) {
			todisable[i].disabled = true;
		}
	}

	// Check the map tile to enable or disable certain aspects
	var map = selectmap.value;
	var tiletype = other["maps"][map][caller.id] ? other["maps"][map][caller.id] : "nothing";
	// If the tile if not nothing it means we can't place shit there so stop right away
	if (tiletype != "nothing" && !selectcheats.checked) {
		return;
	}

	// If cheats are enabled we don't care about this
	if (!selectcheats.checked) {
		// Arriving here the tile isn't occupied but if the row isn't 0 or 1 we disable the hero picker as the team can't be there
		if (parseInt(caller.id[0]) > 1) {
			selectheroes.disabled = true;
		} else {
			// If the tile we are selecting contains a hero allow modifying it always.
			// FIXME: If you go until the 7 unit limit you will be allowed to replace the mythic who enables the extra slot with a normal hero
			let typeofchild = caller.firstChild ? caller.firstChild.className : "none";
			if (typeofchild == "hero") {
				selectheroes.disabled = false;
			// If not a hero check if we can add new heroes or if it goes over the limit
			} else if ((!maplimits["extrae"] && maplimits["heroes"].length >= 6) || (maplimits["extrae"] && maplimits["heroes"].length >= 7)) {
				selectheroes.disabled = true;
			// For any other circumstance just enable it
			} else {
				selectheroes.disabled = false;
			}
		}
	} else {
		selectheroes.disabled = false;
	}
	// Repopulate the hero select with the option choosen for that tile if already exists
	var restore = caller.lastChild ? caller.lastChild.id.split("-")[0] : "None";
	populate(selectheroes, units, true, restore);
	
	// Finally set the selected tile attribute and shot the box
	selectheroes.setAttribute("selectedtile", caller.id);
	selectstructure.setAttribute("selectedtile", caller.id);
	document.getElementById("buttonclean").setAttribute("selectedtile", caller.id);
	document.getElementById("updatedialog").style.display = "flex";
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
	// We need to do a variety of checks before even attempting to paste an item
	var targettile = ev.target;
	var data = document.getElementById(ev.dataTransfer.getData("text"));

	// If the target isn't a cell we must iterate up until we find it
	while (targettile.className != "cell") {
		targettile = targettile.parentElement;
	}
	// If cheats are enabled we don't care about this
	if (!selectcheats.checked) {
		// First, if the target is a reserved tile we skip it completely
		if (other["maps"][selectmap.value][targettile.id]) {
			return;
		}
		// If the data comes from a hero and the target tile is not in rows 0 or 1 we can't do it either.
		if (data.className == "hero" && parseInt(targettile.id[0]) > 1) {
			return;
		}
		// If the data to be dropped is an structure check if it's not already limited in amount of type
		if (data.className == "structure") {
			// If it's of type defensive and we already have six different of those deny the drop
			if (data.getAttribute("structtype") == "defensive" && maplimits["defensive"].length >= 6 && !maplimits["defensive"].includes(data.id)) {
				return;
			}
			// If it's a school and we already have a different one deny the drop
			if (data.id.indexOf("school") != -1 && maplimits["schooled"] && !maplimits["defensive"].includes(data.id)) {
				return;
			}
		}
	}
	// If the target already contains a child structure or hero we must attempt to relocate it first
	if (targettile.lastChild && !selectcheats.checked) {
		// If the parent of the dragged element is a cell try to swap their childs
		if (data.parentElement.className == "cell") {
			// For structures is fine to always relocate unless the new child is a hero and the target outside the 0,1 rows
			if (targettile.lastChild.className == "structure" && !(data.className == "hero" && parseInt(targettile.id[0]) > 1)) {
				data.parentElement.appendChild(targettile.lastChild);
			// If the replaced child is a hero make sure her destination on swap is a valid row
			} else if (targettile.lastChild.className == "hero" && parseInt(data.parentElement.id[0]) < 2) {
				data.parentElement.appendChild(targettile.lastChild);
			// Otherwise just relocate it
			} else {
				let relocated = relocate(targettile.lastChild);
				// If we failed to relocate skip
				if (!relocated) {
					return;
				}
			}
		} else {
			let relocated = relocate(targettile.lastChild);
			// If we failed to relocate skip
			if (!relocated) {
				return;
			}
		}
	// Much simpler logic for cheats enabled
	} else if (targettile.lastChild && selectcheats.checked) {
		// If the parent of the dragged element is a cell swap their childs
		if (data.parentElement.className == "cell") {
			data.parentElement.appendChild(targettile.lastChild);
		// Otherwise just relocate it
		} else {
			let relocated = relocate(targettile.lastChild);
			// If we failed to relocate skip
			if (!relocated) {
				return;
			}
		}
	}
	targettile.appendChild(data);
	// After appending re-scan the map again to see limits
	scan();
}

function scan() {
	// Map info (to limit number of structures/heroes placed)
	maplimits = {
		// Mandatory structures
		"mandatory": [],
		// Defensive structures
		"defensive": [],
		// Trap structures
		"trap": [],
		// Decorative structures
		"decorative": [],
		// Amount of heroes
		"heroes": [],
		// Extra slot?
		"extrae": false,
		// Already one school?
		"schooled": false
	};
	var structures = document.getElementsByClassName("structure");
	var heroes = document.getElementsByClassName("hero");
	// Store structs in their respective category (skipping the ones outside)
	for (let i = 0; i < structures.length; i++) {
		if (structures[i].parentElement.className == "cell") {
			let structid = structures[i].id;
			maplimits[structures[i].getAttribute("structtype")].push(structid);
			// If the struct is a school mark it
			if (structid.indexOf("school") != -1) {
				maplimits["schooled"] = true;
			}
		}
	}
	// Store heroes
	for (let i = 0; i < heroes.length; i++) {
		maplimits["heroes"].push(heroes[i].id);
		let heroid = heroes[i].id.split("-")[0];
		// If the hero is preblessed for dark or anima and has a extrae variant it can provide an additional slot in AR-D
		let variant = other["blessed"][heroid] ? ([6,8].includes(other["blessed"][heroid]["blessing"]) ? other["blessed"][heroid]["variant"] : "none") : "none";
		if (variant.indexOf("extrae") != -1) {
			maplimits["extrae"] = true;
		}
	}
}

function populate(select, data, clean, previousvalue = "None") {
	// First delete them all
	while (select.lastChild) {
		select.removeChild(select.lastChild);
	}
	// Always add the None option with it's proper translation
	var opt = document.createElement('option');
	opt.value = "None";
	opt.innerHTML = "None";
	select.appendChild(opt);
	// All data to be printed
	var options = {};
	// If indicated to bypass don't do checks for this select, print everything and leave (this is exclusively for the heroes select)
	Object.keys(data).forEach((value) => {
		options[languages["USEN"]["M" + value] + ": " + (languages["USEN"][value.replace("PID", "MPID_HONOR")] || "Generic")] = value;
	});
	// Sort all the values byt visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {});
	// For each entry print an option
	for (const [string, tag] of Object.entries(options)) {
		let opt = document.createElement('option');
		opt.value = tag;
		// If of type person we also append the title
		opt.innerHTML = string;
		select.appendChild(opt);
	}
	// Restore the previous value if it's available on the updated select
	if ([...select.options].map(opt => opt.value).includes(previousvalue)) {
		select.value = previousvalue;
	}
}

function showhelp() {
	alert("These are some instructions and explanations for the AR-D Map Builder:\n\n- Click a tile to show a dialog where you can choose a unit or structure.\n\n- You can drag and drop between tiles as long as is valid content.\n\n- Structures are provided below as well to drag and drop with ease.\n\n");
}

function statictranslations() {
}
