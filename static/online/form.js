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

// All selects we have available
selecttemplate = document.getElementById('template');

// Fetch all data from each json
fetch('/common/data/fulllanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out;
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/fullunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out;
				populate(selectheroes, units, true, true);
		}).catch(err => console.error(err));
		fetch('/common/data/fullskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out;
				// We need to have all skills available as a whole in case we use cheat seals
				allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"])
				populateall();
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/fullother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
		init();
}).catch(err => console.error(err));

async function init() {
	// This array will be used as rendering queue
	renderingqueue = [];
	// Load and wait for the font to be ready
	const font = new FontFace("FeH-Font", "url('/common/feh-font.woff2') format('woff2')");
	await font.load();
	document.fonts.add(font);

	// Load the numberfont specifically since we will use it multiple times
	numberfont = undefined;
	await getimage(other["images"]["other"]["numberfont"]).then(img => {
		numberfont = img;
	})

	// Draw it for the first time
	reload();
}

async function reload(scroll = false) {
	// Get epoch as rendering ID
	let renderingid = new Date().getTime();
	// Put our rendering ID on queue
	renderingqueue.push(renderingid);
	// Until our rendering ID is the first, wait and check again in 100ms
	while (renderingqueue[0] != renderingid) {
		await sleep(100);
	}
	// Cleanly hide all canvas
	document.getElementById("fakecanvas").style.display = "none";
	document.getElementById("fakecanvascond").style.display = "none";

	// Switch on depending on selection and run the appropiate renderer
	switch (selecttemplate.value) {
		case "MyUnit":
			document.getElementById("fakecanvas").style.display = "initial";
			myunit();
			break;
		case "Condensed":
			document.getElementById("fakecanvascond").style.display = "initial";
			condensed();
			break;
	}

	// Autoscroll all the way up so the user can inmediately see the hero preview on portrait screens
	if (scroll) {
		window.scrollTo(0, 0);
	}
}

function updateRefine() {
	// Get current value to restore it back if possible
	previousvalue = selectrefines.value
	weapon = selectweapons.value

	// Clear all children on the refine select first
	while (selectrefines.lastChild) {
		selectrefines.removeChild(selectrefines.lastChild);
	}
	// Always add the None option with it's proper translation
	var opt = document.createElement('option');
	opt.value = "None";
	opt.innerHTML = languages[selectlanguage.value]["MSID_H_NONE"];
	selectrefines.appendChild(opt);
	if (weapon == "None") {
		return;
	}
	// Get the list of refines for that weapon
	refines = Object.keys(skills["weapons"][weapon]["refines"])
	for (i = 0; i < refines.length; i++) {
		var opt = document.createElement('option');
		opt.value = refines[i];
		opt.innerHTML = refines[i];
		selectrefines.appendChild(opt);
	}
	// Restore the previous value if it's available on the updated select
	if ([...selectrefines.options].map(opt => opt.value).includes(previousvalue)) {
		selectrefines.value = previousvalue;
	}
}

function swapstat(caller, target) {
	// Switch the selected option in the tabs by changing the background color
	options = document.getElementsByClassName("tabs")[0].children;
	for (i = 0; i < options.length; i++) {
		if (options[i] == caller) {
			options[i].className = "imagelabel selected";
		} else {
			options[i].className = "imagelabel";
		}
	}

	// Loop through every possibility and swap the visiblity of the inputs
	options = ["", "-pairup"]
	stats = ["atk", "spd", "def", "res"]
	for (i = 0; i < options.length; i++) {
		// Now for each individual stat decide whether to show it or not
		for (j = 0; j < stats.length; j++) {
			document.getElementById(stats[j] + options[i]).style.display = (options[i] == target) ? "initial" : "none";
		}
	}
}
