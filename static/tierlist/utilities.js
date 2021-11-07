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
	html2canvas(tierlist).then(function(canvas) {
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

function updatecolor(caller) {
	// The item to change the color is grandpa's first appendChild
	target = caller.parentElement.parentElement.children[0];
	target.style.backgroundColor = caller.value;
}

function reorder(caller, modifier) {
	// Get the index of the row we are moving
	target = caller.parentElement.parentElement.parentElement;
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
