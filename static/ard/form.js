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
var units, skills, other;
// All selects we have available
selectheroes = document.getElementById('selectheroes');
selectstructure = document.getElementById('selectstructure');
selectmap = document.getElementById("mapselect");

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
	entry = data.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace("'","");
	// This is the search string we are using
	search = params.term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace("'","");

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
	document.querySelector(".select2-container--open .select2-search__field").focus()
});

function init() {
	// Setup map background
	changemap();

	// Populate hero select
	populate(selectheroes, units, true);
}

function updatedialog(caller) {
	// Restore the selected structure
	if (caller.lastChild) {
		if (caller.lastChild.className == "structure") {
			selectstructure.value = caller.lastChild.id;
		} else {
			selectstructure.value = "None";
		}
	} else {
		selectstructure.value = "None";
	}
	// Loop through all structures with their class and disable them to avoid adding duplicates
	structures = document.getElementsByClassName("structure");
	todisable = [];
	for (j = 0; j < selectstructure.options.length; j++) {
		selectstructure.options[j].disabled = false;
		for (i = 0; i < structures.length; i++) {
			if (selectstructure.options[j].value == structures[i].id && structures[i].parentElement.id != "results") {
				todisable.push(selectstructure.options[j]);
			}
		}
	}
	for (i = 0; i < todisable.length; i++) {
		todisable[i].disabled = true;
	}

	// Check the map tile to enable or disable certain aspects
	map = selectmap.value;
	tiletype = other["maps"][map][caller.id] ? other["maps"][map][caller.id] : "nothing";
	// If the tile if not nothing it means we can't place shit there so stop right away
	if (tiletype != "nothing") {
		return;
	}
	// Arriving here the tile isn't occupied but if the row isn't 0 or 1 we disable the hero picker as the team can't be there
	if (parseInt(caller.id[0]) > 1) {
		selectheroes.disabled = true;
	} else {
		selectheroes.disabled = false;
	}
	// Repopulate the hero select with the option choosen for that tile if already exists
	restore = caller.lastChild ? caller.lastChild.id.split("-")[0] : "None";
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
	targettile = ev.target;
	var data = ev.dataTransfer.getData("text");
	// If the target isn't a cell we must iterate up until we find it
	while (targettile.className != "cell") {
		targettile = targettile.parentElement;
	}
	// First, if the target is a reserved tile we skip it completely
	if (other["maps"][selectmap.value][targettile.id]) {
		return;
	}
	// If the data comes from a hero and the target tile is not in rows 0 or 1 we can't do it either.
	if (document.getElementById(data).className == "hero" && parseInt(targettile.id[0]) > 1) {
		return;
	}
	// If the target already contains a child structure or hero we must attempt to relocate it first
	if (targettile.lastChild) {
		// If the parent of the dragged element is a cell try to swap their childs
		if (document.getElementById(data).parentElement.className == "cell") {
			// For structures is fine to always relocate unless the new child is a hero and the target outside the 0,1 rows
			if (targettile.lastChild.className == "structure" && !(document.getElementById(data).className == "hero" && parseInt(targettile.id[0]) > 1)) {
				document.getElementById(data).parentElement.appendChild(targettile.lastChild);
			// If the replaced child is a hero make sure her destination on swap is a valid row
			} else if (targettile.lastChild.className == "hero" && parseInt(document.getElementById(data).parentElement.id[0]) < 2) {
				document.getElementById(data).parentElement.appendChild(targettile.lastChild);
			// Otherwise just relocate it
			} else {
				relocated = relocate(targettile.lastChild);
				// If we failed to relocate skip
				if (!relocated) {
					return;
				}
			}
		} else {
			relocated = relocate(targettile.lastChild);
			// If we failed to relocate skip
			if (!relocated) {
				return;
			}
		}
	}
	targettile.appendChild(document.getElementById(data));
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
	options = {}
	// If indicated to bypass don't do checks for this select, print everything and leave (this is exclusively for the heroes select)
	Object.keys(data).forEach((value) => {
		options[languages["USEN"]["M" + value] + ": " + (languages["USEN"][value.replace("PID", "MPID_HONOR")] || "Generic")] = value
	});
	// Sort all the values byt visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {})
	// For each entry print an option
	for (const [string, tag] of Object.entries(options)) {
		var opt = document.createElement('option');
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

function statictranslations() {
}
