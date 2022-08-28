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
selectweapontype = document.getElementById("weapontype");
selectmovetype = document.getElementById("movetype");
selectblessing = document.getElementById("blessingtype");
selectduoharmo = document.getElementById("duoharmo");
selectgametype = document.getElementById("gametype");
selectattire = document.getElementById("attire");
selectbookrelease = document.getElementById("bookrelease");
selectthemegroup = document.getElementById("themegroup");
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
	};
	localStorage.setItem('saves', JSON.stringify(saves));
}

window.onload = init();

async function init() {
	// Get all data and store it
	units = await fetch('/common/data/content/tierunits.json').then(response => {return response.json();});
	other = await fetch('/common/data/content/tierother.json').then(response => {return response.json();});

	// Populate the tierlist select based on saved data
	populatetierlistlist();

	// Show units based on current filters
	populate();
}