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

function changemap() {
	map = selectmap.value;
	mapcanvas.style.background = 'url("/common/other/maps-' + map + '.webp")';
	for (i = 0; i < 6; i++) {
		for (j = 0; j < 6; j++) {
			tileid = i + "" + j;
			tiletype = other["maps"][map][tileid] ? other["maps"][map][tileid] : "nothing";
			if (tiletype.indexOf("wall") != -1) {
				document.getElementById(tileid).style.background = 'url("/common/other/maps-' + tiletype + '.webp")';
			} else if (tiletype == "water") {
				document.getElementById(tileid).style.background = '';
				mapcanvas.style.background = '#195687 url("/common/other/maps-' + map + '.webp")';
			} else if (tiletype == "lava") {
				document.getElementById(tileid).style.background = '';
				mapcanvas.style.background = '#ffbd23 url("/common/other/maps-' + map + '.webp")';
			} else {
				document.getElementById(tileid).style.background = '';
			}
		}
	}
}

function pasteunit(caller) {
	option = caller.value;
	classname = "hero";
	extraid = "-" + new Date().getTime();
	target = document.getElementById(caller.getAttribute("selectedtile"));
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
		hero = document.createElement('img');
		hero.src = "/common/sprites-idle/" + option + ".webp";
		// Once the hero image is loaded apply proper styles to make it fit better
		hero.addEventListener("load", function(event) {herosize(event.target)});
		hero.draggable = false;
		item.appendChild(hero);
		// Create and add the items indicating weapon, movement and blessing
		var weapon = document.createElement('img');
		weapon.className = "iconinfo weapon";
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
}

function herosize(caller) {
	hero = caller.parentElement.id.split("-")[0]
	// By default set the height to 100% of the cell
	height = 100;
	// Increase the size a 10% for mounted units
	if ([2,3].includes(units[hero]["moveType"])) {
		height += 10;
	} else {
		height -= 5;
	}
	caller.style.height = height + "%";
}

function pastestructure(caller) {
	option = caller.value;
	target = document.getElementById(caller.getAttribute("selectedtile"));
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
		structure = document.createElement('img');
		structure.src = "/common/other/maps-" + option + ".webp";
		structure.draggable = false;
		item.appendChild(structure);
		// In the case of structures check if the one we are placing exists under results and delete that one
		results = document.getElementById("results").children;
		for (i = 0; i < results.length; i++) {
			if (results[i].id == option) {
				results[i].parentElement.removeChild(results[i]);
			}
		}
		target.appendChild(item);
	}
	// Hide the dialog now
	document.getElementById("updatedialog").style.display = "none";
}

function clearmap() {
	tiles = document.getElementsByClassName("cell");
	for (i = 0; i < tiles.length; i++) {
		if (tiles[i].lastChild) {
			// Do not delete fortress or aether structs
			if (!["aetheramphorae", "aetherfountain", "fortress"].includes(tiles[i].lastChild.id)) {
				tiles[i].removeChild(tiles[i].lastChild);
			}
		}
	}
}


function iconvisibility(caller) {
	// If we are only modifying an specific icon check with the caller
	if (caller) {
		// Class of the icon to hide
		target = caller.id.slice(4);
		icons = document.querySelectorAll("." + target);
		for (i = 0; i < icons.length; i++) {
			icons[i].style.display = caller.checked == true ? "block" : "none";
		}
	}
}
