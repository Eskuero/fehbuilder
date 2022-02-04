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
				mapcanvas.style.background = '#195687 url("/common/other/maps-' + map + '.webp")';
			} else if (tiletype == "lava") {
				mapcanvas.style.background = '#ffbd23 url("/common/other/maps-' + map + '.webp")';
			} else {
				document.getElementById(tileid).style.background = '';
			}
		}
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
