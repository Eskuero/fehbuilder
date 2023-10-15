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
	// Convert the HTML to canvas using html-to-image
	htmlToImage.toPng(tierlist, {filter: filter}).then(function (url) {
		var link = document.createElement('a');
		link.href = url;
		link.download = "Tier List";
		// Add the link, click it to force download and delete it again
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});
}
// This function just tells html-to-image to not render tieroptions
function filter(node) {
	return node.className == 'tieroptions' ? false : true;
}

function updatecolor(event) {
	// The item to change the color is grandpa's first appendChild
	var target = event.target.parentElement.parentElement.children[0];
	target.style.backgroundColor = event.target.value;
}

function reorder(event, modifier) {
	// Get the index of the row we are moving
	var target = event.target.parentElement.parentElement;
	var index = Array.prototype.indexOf.call(tierlist.children, target);
	// Do not do anything if the element doesn't exist (last or first child already)
	if (tierlist.children[index+modifier]) {
		tierlist.insertBefore(target, tierlist.children[index+modifier])
	}
}

function cleartier() {
	// Get all tiers available
	var alltiers = document.getElementsByClassName("tiercontent");
	// Loop every tier row and delete all children
	for (let i = 0; i < alltiers.length; i++) {
		// First delete all currently rendered
		while (alltiers[i].lastChild) {
			alltiers[i].removeChild(alltiers[i].lastChild);
		}
	}
}

function deletetier(event) {
	// The tier is the grandpa of the caller
	var target = event.target.parentElement.parentElement;
	// And must be removed from the great-grandpa
	tierlist.removeChild(target);
}

function addtier(color = "#FFFFFF", name = "New tier") {
	// Create the base tier structure
	var tier = document.createElement('div');
	tier.className = "tier";

	// Create the tier name structure, make it content editable, with a default white color, "new tier" text and append it to the base tier structure 
	var tiername = document.createElement('div');
	tiername.className = "tiername";
	tiername.style.backgroundColor = color;
	tiername.contentEditable = "true";
	tiername.innerHTML = name;
	tiername.addEventListener("drop", function(event) {event.preventDefault(); return false;});
	tier.appendChild(tiername);

	// Create the tier content structure with the proper event listeners and append it to the base tier structure
	var tiercontent = document.createElement('div');
	tiercontent.className = "tiercontent";
	tiercontent.addEventListener("drop", function(event) {drop(event)});
	tiercontent.addEventListener("dragover", function(event) {allowDrop(event)});
	tier.appendChild(tiercontent);

	// Create the tier options structure, with the custom ignore atribute for html2canvas
	var tieroptions = document.createElement('div');
	tieroptions.className = "tieroptions";
	tieroptions.setAttribute("data-html2canvas-ignore", "true");
	// Tier options require some children items, like tiercolor
	var tiercolor = document.createElement('input');
	tiercolor.className = "tiercolor";
	tiercolor.type = "color";
	tiercolor.value = color;
	tiercolor.addEventListener("change", function(event) {updatecolor(event)});
	tieroptions.appendChild(tiercolor);
	// Tierdelete
	var tierdelete = document.createElement('span');
	tierdelete.className = "material-icons deletebutton";
	tierdelete.addEventListener("click", function(event) {deletetier(event)});
	tierdelete.innerHTML = "delete";
	tieroptions.appendChild(tierdelete);
	// Tierup and down
	var tierup = document.createElement('span');
	var tierdown = document.createElement('span');
	tierup.className = "material-icons"; tierdown.className = "material-icons";
	tierup.addEventListener("click", function(event) {reorder(event, -1)});
	tierdown.addEventListener("click", function(event) {reorder(event, 2)});
	tierup.innerHTML = "expand_less"; tierdown.innerHTML = "expand_more";
	tieroptions.appendChild(tierdown);
	tieroptions.appendChild(tierup);
	// Append the tier options structure to the base tier structure
	tier.appendChild(tieroptions);

	// Append the whole new tier to the tierlist
	tierlist.appendChild(tier);

	// Return the generated tier since this function might be called by others that need to do more work
	return tier;
}

function iconvisibility(caller) {
	// If we are only modifying an specific icon check with the caller
	if (caller) {
		// Class of the icon to hide
		var target = caller.id.slice(4);
		var icons = document.querySelectorAll("." + target);
		for (let i = 0; i < icons.length; i++) {
			icons[i].style.display = caller.checked == true ? "block" : "none";
		}
	}
}

function newsave() {
	// Ask for the new
	var name = prompt("What name do you want to give to your new empty tierlist?");
	// Unless is empty or already existing move forward
	if (name && !saves[name]) {
		var save = {
			"tierlist": [
				{"color": "#FF7F7F", "name": "S", "content": []},
				{"color": "#FFBF7F", "name": "A", "content": []},
				{"color": "#FFFF7F", "name": "B", "content": []},
				{"color": "#BFFF7F", "name": "C", "content": []},
				{"color": "#7FFFFF", "name": "D", "content": []},
				{"color": "#7FBFFF", "name": "E", "content": []}
			]
		};
		saves[name] = save;
		// Save the generic new save in the localstorage
		localStorage.setItem('saves', JSON.stringify(saves));
		// Add the option to the select
		var savename = document.createElement('option');
		savename.value = name;
		savename.innerHTML = name;
		selectsavelist.appendChild(savename);
	} else {
		alert("Invalid or duplicated name");
	}
}

function loadsave(save = selectsavelist.value) {
	// Do not move forward if no value is selected
	if (!selectsavelist.value) {
		return;
	}
	// First clear everything
	while (tierlist.lastChild) {
		tierlist.removeChild(tierlist.lastChild);
	}
	// Loop through all expected tiers and add them
	for (let i = 0; i < saves[save]["tierlist"].length; i++) {
		let tier = addtier(saves[save]["tierlist"][i]["color"], saves[save]["tierlist"][i]["name"]);
		let characters = saves[save]["tierlist"][i]["content"];
		// Add each character to the tier
		for (let j = 0; j < characters.length; j++) {
			// Character ID and variant
			let alldata = characters[j].split("-");
			let character = alldata[0];
			let variant = alldata[1] == "resp" ? "_Resplendent" : "";
			// Use current epoch just to make sure we can add duplicated units
			let epoch = alldata.length == 3 ? alldata[2] : alldata[1];
			let opt = document.createElement('div');
			// Change variant if resplendent
			opt.style.backgroundImage = "url(/common/hd-faces/" + character + variant + ".webp)";
			opt.draggable = "true";
			opt.className = "unit";
			opt.id = character + (variant == "_Resplendent" ? "-resp" : "") + "-" + epoch;
			opt.addEventListener("dragstart", function(event) {drag(event)});
			// Create and add the items indicating weapon, movement, blessing and origin
			let weapon = document.createElement('img');
			weapon.className = [0, 3, 7, 11, 16, 20, 2, 5, 9, 13, 18, 22].includes(units[character]["weapon"]) ? "iconinfo weapon patched" : "iconinfo weapon";
			weapon.src = "/common/other/" + units[character]["weapon"] + "-weapon.webp";
			opt.appendChild(weapon);
			let movement = document.createElement('img');
			movement.className = "iconinfo movement";
			movement.src = "/common/other/" + units[character]["move"] + "-move.webp";
			opt.appendChild(movement);
			let origin = document.createElement('img');
			origin.className = "iconinfo origin";
			origin.src = "/common/other/" + units[character]["origin"] + "-game.webp";
			opt.appendChild(origin);
			if (other["blessed"][character]) {
				let blessing = document.createElement('img');
				blessing.className = "iconinfo blessing";
				blessing.src = "/common/other/" + other["blessed"][character]["blessing"] + "-Blessing-mini.webp";
				opt.appendChild(blessing);
			}
			tier.children[1].appendChild(opt);
		}
	}
	// Make sure the icons are respecting the set rules
	iconvisibility(checkshowweapon); iconvisibility(checkshowmovement); iconvisibility(checkshowblessing); iconvisibility(checkshoworigin);
}

function savesave() {
	// Do not move forward if no value is selected
	if (!selectsavelist.value) {
		return;
	}
	var target = selectsavelist.value;
	// Confirm with the user
	var confirmsave = confirm("Save your current tierlist as '" + target + "'? Previous state will be overwritten.");
	if (confirmsave) {
		// To store the to-be-saved save
		var save = {"tierlist": []}
		// Loop through all the currently tiers built
		var tiers = tierlist.children;
		for (let i = 0; i < tiers.length; i++) {
			// Retrieve all data we need
			let tiername = tiers[i].children[0].innerHTML;
			let tiercolor = tiers[i].children[2].firstChild.value;
			let tiercontent = [];
			for (let j = 0; j < tiers[i].children[1].children.length; j++) {
				tiercontent.push(tiers[i].children[1].children[j].id);
			}
			save["tierlist"].push({"color": tiercolor, "name": tiername, "content": tiercontent});
		}
		// Store it on both temporal and localstorage
		saves[target] = save;
		localStorage.setItem('saves', JSON.stringify(saves));
	}
}

function deletesave() {
	var target = selectsavelist.value;
	// Confirm with the user
	var confirmsave = confirm("Delete your tierlist '" + target + "'? Will be gone forever.");
	if (confirmsave) {
		// Store it on both temporal and localstorage
		delete saves[target];
		localStorage.setItem('saves', JSON.stringify(saves));
		// Delete the select option
		selectsavelist.removeChild(selectsavelist[selectsavelist.selectedIndex]);
	}
}
