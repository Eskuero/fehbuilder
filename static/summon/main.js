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
var units, languages, other, permapools;
// All heroes to add
targets = [];
// Amount of heroes we have gone without a 5 star
pityrun = 0;
// The whole form since is a rebspicker listeners
form = document.getElementsByClassName("form")[0];
targetsui = document.getElementById('targets');
selectlanguage = document.getElementById('language');
method = document.getElementById('method');
// Base gacha percents
focus5 = document.getElementById('focus5');
offfocus5 = document.getElementById('offfocus5');
focus4 = document.getElementById('focus4');
special4 = document.getElementById('special4');
offfocus4 = document.getElementById('offfocus4');
offfocus3 = document.getElementById('offfocus3');
// Pity gacha percents
pityfocus5 = document.getElementById('pityfocus5');
pityofffocus5 = document.getElementById('pityofffocus5');
pityfocus4 = document.getElementById('pityfocus4');
pityspecial4 = document.getElementById('pityspecial4');
pityofffocus4 = document.getElementById('pityofffocus4');
pityofffocus3 = document.getElementById('pityofffocus3');

// Fetch all data from each json
fetch('/common/data/languages/litelanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/content/summonunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out
				select5focus = populate(document.getElementById('fivestarfocus'), units, true);
				select4focus = populate(document.getElementById('fourstarfocus'), units, true);
				fetch('/common/data/content/summonpools.json')
					.then(res => res.json())
					.then((out) => {
						// We store summoning pool data
						permapools = out;
						// Now that everything is loaded we can init
						init();
				}).catch(err => console.error(err));
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/content/summonother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
}).catch(err => console.error(err));

async function init() {
	// Obtain the object
	var preview = document.getElementById("fakecanvas").getContext("2d");

	// Print the background
	await getimage("/common/other/summoningaltar.webp").then(img => {
		preview.drawImage(img, -173, 0, 1067, 1280);
	})
}