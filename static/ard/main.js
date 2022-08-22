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
// The whole form since is a rebspicker listeners
form = document.getElementsByClassName("form")[0];
// All selects we have available
selectheroes = new Rebspicker(document.getElementById('selectheroes'), "single", {"None": {"string": "None"}});
selectartstyle = document.getElementById('artstyle');
selectstructure = document.getElementById('selectstructure');
selectmap = document.getElementById("mapselect");
selectcheats = document.getElementById("cheats");
selectlanguage = document.getElementById("language");

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
fetch('/common/data/languages/summonlanguages-' + selectlanguage.value + '.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages["USEN"] = out;
		fetch('/common/data/content/tierunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store unit data for basic checks within the browser
				units = out;
				fetch('/common/data/content/mapsother.json')
					.then(res => res.json())
					.then((out) => {
						// We store other data for basic checks within the browser
						other = out;
						init();
				}).catch(err => console.error(err));
		}).catch(err => console.error(err));
}).catch(err => console.error(err));

function init() {
	// Setup map background
	changemap();

	// Scan the map to generate limits
	scan();

	// Populate hero select
	populate(selectheroes, units, true);

	// Populate structures select
	populatestructures();
}