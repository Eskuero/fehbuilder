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

function download() {
	// Convert the HTML to canvas using html2canvas
	html2canvas(mapcanvas, {logging:false, dpi: 300}).then(function(canvas) {
		// Convert canvas to a data url
		var url = canvas.toDataURL("image/png");
		// Create the link element to force the download
		var link = document.createElement('a');
		link.href = url;
		link.download = "AR-D Defense";
		// Add the link, click it to force download and delete it again
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});
}

async function changelang() {
	// Make sure the selected language is available, download it if not
	var newlang = selectlanguage.value;
	if (!languages[newlang]) {
		var response = await fetch('/common/data/languages/ardlanguages-' + newlang + '.json');
		var data = await response.json();
		languages[newlang] = data;
	}
	populate(selectheroes, units, true);
	populatestructures();
	statictranslations();
}

function changemap() {
	var map = selectmap.value;
	mapcanvas.style.background = 'url("/common/other/maps-' + map + '.webp")';
	for (let a = 0; a < 6; a++) {
		for (let b = 0; b < 6; b++) {
			let tileid = a + "" + b;
			let tile = document.getElementById(tileid);
			let tiletype = other["maps"][map][tileid] ? other["maps"][map][tileid] : "nothing";
			if (tiletype.indexOf("wall") != -1) {
				tile.style.background = 'url("/common/other/maps-' + tiletype + '.webp")';
			} else if (tiletype == "water") {
				tile.style.background = '';
				mapcanvas.style.background = '#195687 url("/common/other/maps-' + map + '.webp")';
			} else if (tiletype == "lava") {
				tile.style.background = '';
				mapcanvas.style.background = '#ffbd23 url("/common/other/maps-' + map + '.webp")';
			} else {
				tile.style.background = '';
			}
			// If the tiletype is not nothing that means we shouldn't have anything there
			if (tile.firstChild && tiletype != "nothing") {
				// Try to relocate the item
				let relocated = relocate(tile.lastChild);
				// If we failed to relocate delete it
				if (!relocated) {
					tile.removeChild(tile.lastChild);
				}
			}
		}
	}
}

function pasteunit() {
	var option = selectheroes.value;
	var classname = "hero";
	var extraid = "-" + new Date().getTime();
	var target = document.getElementById(selectheroes.getAttribute("selectedtile"));
	// Always delete whatever the tile contains
	while (target.lastChild) {
		target.removeChild(target.lastChild);
	}
	// If selected a valid option setup the image with all the required elements
	if (option != "None") {
		var item = document.createElement('div');
		item.className = classname;
		item.draggable = true;
		item.id = option + extraid;
		item.addEventListener("dragstart", function(event) {drag(event)});
		// Add the hero as an image
		var hero = document.createElement('img');
		hero.src = "/common/" + selectartstyle.value + "/" + option + ".webp";
		// Once the hero image is loaded apply proper styles to make it fit better
		hero.addEventListener("load", function(event) {herosize(event.target)});
		hero.draggable = false;
		item.appendChild(hero);
		// Create and add the items indicating weapon, movement and blessing
		var weapon = document.createElement('img');
		weapon.className = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[option]["WeaponType"]) ? "iconinfo weapon patched" : "iconinfo weapon";
		weapon.src = "/common/other/" + units[option]["WeaponType"] + "-weapon.webp";
		weapon.draggable = false;
		item.appendChild(weapon);
		var movement = document.createElement('img');
		movement.className = "iconinfo movement";
		movement.src = "/common/other/" + units[option]["moveType"] + "-move.webp";
		movement.draggable = false;
		item.appendChild(movement);
		if (other["blessed"][option]) {
			var blessing = document.createElement('img');
			blessing.className = "iconinfo blessing";
			blessing.src = "/common/other/" + other["blessed"][option]["blessing"] + "-Blessing-special.webp";
			blessing.draggable = false;
			item.appendChild(blessing);
		}
		target.appendChild(item);
	}
	// Hide the dialog now
	document.getElementById("updatedialog").style.display = "none";
	// After appending re-scan the map again to see limits
	scan();
}

function herosize(caller) {
	var hero = caller.parentElement.id.split("-")[0];
	// By default set the height to 100% of the cell
	var height = 100;
	// We do some adjustments when using sprites
	if (selectartstyle.value.indexOf("sprites") != -1) {
		// Increase the size a 10% for mounted units
		if ([2,3].includes(units[hero]["moveType"])) {
			height += 10;
		} else {
			height -= 5;
		}
	}
	caller.style.height = height + "%";
}

function changeart() {
	var heroes = document.getElementsByClassName("hero");
	var artstyle = selectartstyle.value;
	for (let i = 0; i < heroes.length; i++) {
		heroes[i].firstChild.src = "/common/" + artstyle + "/" + heroes[i].id.split("-")[0] + ".webp";
	}
}

function pastestructure(caller) {
	var option = caller.value;
	var target = document.getElementById(caller.getAttribute("selectedtile"));
	// Always delete whatever the tile contains
	while (target.lastChild) {
		target.removeChild(target.lastChild);
	}
	// If selected a valid option setup the image with all the required elements
	if (option != "None") {
		var item = document.createElement('div');
		item.className = "structure";
		item.draggable = true;
		item.id = option;
		item.addEventListener("dragstart", function(event) {drag(event)});
		// Add the structure as an image
		var structure = document.createElement('img');
		structure.src = "/common/other/maps-" + option + ".webp";
		structure.draggable = false;
		item.appendChild(structure);
		// In the case of structures check if the one we are placing exists under results and delete that one
		var results = document.getElementById("results").children;
		for (let i = 0; i < results.length; i++) {
			if (results[i].id == option) {
				results[i].parentElement.removeChild(results[i]);
			}
		}
		target.appendChild(item);
	}
	// Hide the dialog now
	document.getElementById("updatedialog").style.display = "none";
	// After appending re-scan the map again to see limits
	scan();
}

function clearmap() {
	var tiles = document.getElementsByClassName("cell");
	for (let i = 0; i < tiles.length; i++) {
		if (tiles[i].lastChild) {
			// Do not delete fortress or aether structs unless on cheat mode
			if ((tiles[i].lastChild.className == "structure" ? other["structures"][tiles[i].lastChild.id]["type"] != "mandatory" : true) || selectcheats.checked) {
				tiles[i].removeChild(tiles[i].lastChild);
			}
		}
	}
	// After clearing re-scan the map again to see limits
	scan();
}

function relocate(item) {
	// Get current position
	var currenttile = parseInt(item.parentElement.id);
	// First generate suspected adjacent spaces and try to relocate there in order (left, right, top, bottom, top-left, top-right, bottom-left, bottom-right)
	var adjacent = [
		(currenttile - 1).toString().padStart(2, '0'),
		(currenttile + 1).toString().padStart(2, '0'),
		(currenttile - 10).toString().padStart(2, '0'),
		(currenttile + 10).toString().padStart(2, '0'),
		(currenttile - 11).toString().padStart(2, '0'),
		(currenttile - 9).toString().padStart(2, '0'),
		(currenttile + 9).toString().padStart(2, '0'),
		(currenttile + 11).toString().padStart(2, '0')
	];
	for (let i = 0; i < adjacent.length; i++) {
		// If the item is a hero and the supposedly adjacent tile is not row 0 or 1 skip this iteration
		if (item.className == "hero" && parseInt(adjacent[i][0]) > 1) {
			continue;
		}
		// If the tile exists proceed
		if (document.getElementById(adjacent[i])) {
			// If the tile is not occupied and not a reserved terrain relocate it and tell the calling function inmediately
			if (!other["maps"][selectmap.value][adjacent[i]] && !document.getElementById(adjacent[i]).firstChild) {
				document.getElementById(adjacent[i]).appendChild(item);
				return true;
			}
		}
	}
	// If we ended the entire loop with a failure report it background
	return false;
}

function deleteitem(caller) {
	var tile = document.getElementById(caller.getAttribute("selectedtile"));
	if (tile.lastChild) {
		tile.removeChild(tile.lastChild);
	}
	document.getElementById("updatedialog").style.display = "none";
	// After deleting re-scan the map again to see limits
	scan();
}

function iconvisibility(caller) {
	// Class of the icon to hide
	var target = caller.id.slice(4);
	var items = document.querySelectorAll("." + target);
	switch(target) {
		case "weapon":
		case "movement":
		case "blessing":
			for (let i = 0; i < items.length; i++) {
				items[i].style.display = caller.checked == true ? "block" : "none";
			}
			break;
		case "cell":
			for (let i = 0; i < items.length; i++) {
				items[i].style.borderColor = caller.checked == true ? "black" : "transparent";
			}
			break;
	}
}
