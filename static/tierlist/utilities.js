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
	html2canvas(tierlist, {logging:false}).then(function(canvas) {
		// Convert canvas to a data url
		var url = canvas.toDataURL("image/png");
		// Create the link element to force the download
		var link = document.createElement('a');
		link.href = url;
		link.download = "Tier List";
		// Add the link, click it to force download and delete it again
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});
}

function updatecolor(event) {
	// The item to change the color is grandpa's first appendChild
	target = event.target.parentElement.parentElement.children[0];
	target.style.backgroundColor = event.target.value;
}

function reorder(event, modifier) {
	// Get the index of the row we are moving
	target = event.target.parentElement.parentElement;
	index = Array.prototype.indexOf.call(tierlist.children, target)
	// Do not do anything if the element doesn't exist (last or first child already)
	if (tierlist.children[index+modifier]) {
		tierlist.insertBefore(target, tierlist.children[index+modifier])
	}
}

function cleartier() {
	// Get all tiers available
	alltiers = document.getElementsByClassName("tiercontent");
	// Loop every tier row and delete all children
	for (i = 0; i < alltiers.length; i++) {
		// First delete all currently rendered
		while (alltiers[i].lastChild) {
			alltiers[i].removeChild(alltiers[i].lastChild);
		}
	}
}

function deletetier(event) {
	// The tier is the grandpa of the caller
	target = event.target.parentElement.parentElement;
	// And must be removed from the great-grandpa
	tierlist.removeChild(target);
}

function addtier() {
	// Create the base tier structure
	var tier = document.createElement('div');
	tier.className = "tier";

	// Create the tier name structure, make it content editable, with a default white color, "new tier" text and append it to the base tier structure 
	var tiername = document.createElement('div');
	tiername.className = "tiername";
	tiername.style.backgroundColor = "#FFFFFF";
	tiername.contentEditable = "true";
	tiername.innerHTML = "New tier";
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
	tiercolor.value = "#FFFFFF";
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
}
