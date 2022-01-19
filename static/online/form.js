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
usedallies = document.getElementById('usedallies');

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

function populateall(clean) {
	// We go through all the selects
	populate(selectweapons, skills["weapons"], clean)
	populate(selectspecials, skills["specials"], clean)
	populate(selectassists, skills["assists"], clean)
	populate(selectA, skills["passives"]["A"], clean)
	populate(selectB, skills["passives"]["B"], clean)
	populate(selectC, skills["passives"]["C"], clean)
	populate(selectS, Object.assign({}, skills["passives"]["S"], cheats.checked ? Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"]) : {}), clean)
	// Make sure we do not end with an invalid refine option setup
	updateRefine()
	// Add only the required amount of flowers
	updatedragonflowers()
	// Update translations
	statictranslations()
	// Add all allies to the list
	fillblessed()
	// Make sure we got a valid blessing for locked mythics/legendaries
	validblessing()
	// Disable or enable beast select based on unit
	beastcheck()
}

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
	document.getElementById("fakecanvasechoes").style.display = "none";

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
		case "Echoes":
			document.getElementById("fakecanvasechoes").style.display = "initial";
			echoes();
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
	for (i = 1; i < options.length; i++) {
		if (options[i] == caller) {
			options[i].className = "imagelabel selected";
		} else {
			options[i].className = "imagelabel";
		}
	}

	// If switching from a differently built section use their entire name (for now only legendary boosts)
	options = ["buffs", "pairups", "legendaries"]
	for (i = 0; i < options.length; i++) {
		document.getElementById(options[i]).style.display = (options[i] == target) ? "initial" : "none";
	}
}

function fillblessed() {
	// We need to know which options to restore
	toberestored = []
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		toberestored.push(selectallies.selectedOptions[i].value)
	}
	// First delete all allies
	while (selectallies.lastChild) {
		selectallies.removeChild(selectallies.lastChild);
	}
	// All data to be printed
	options = {}
	// Add an option for each value
	for (const [hero, properties] of Object.entries(other["blessed"])) {
		options[languages[selectlanguage.value]["M" + hero] + ": " + languages[selectlanguage.value][hero.replace("PID", "MPID_HONOR")]] = hero;
	}
	// Sort all the values by visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {})
	// For each entry print an option
	for (const [string, tag] of Object.entries(options)) {
		var opt = document.createElement('option');
		opt.value = tag;
		opt.innerHTML = string;
		// If we are only translating and the value was selected restore it
		if (toberestored.includes(tag)) {
			opt.selected = true;
		}
		selectallies.appendChild(opt);
	}
}

function showallies(clean = false, allies = {}) {
	// If clean that means we are receiving data from a buildslot restore and we cannot trust what's already defined
	if (!clean) {
		// Create inputs for every selected ally
		for (i = 0; i < selectallies.selectedOptions.length; i++) {
			ally = selectallies.selectedOptions[i].value;
			// If the ally already exists add the current value to prevent losing data
			allies[ally] = document.getElementById(ally) ? document.getElementById(ally).value : 1;
		}
	}
	// Now delete all existing
	while (usedallies.lastChild) {
		usedallies.removeChild(usedallies.lastChild);
	}
	// Loop through all the allies and add each option in groups of two
	alliesids = Object.keys(allies)
	for (i = 0; i < alliesids.length; i = i + 2) {
		// Major div element
		var container = document.createElement("div");
		container.className = "row-property double";
		// Add the first element of this iteration
		var element1img = document.createElement("img");
		element1img.className = "imagelabel"; element1img.src = "/common/faces/" + alliesids[i] + ".webp";
		container.appendChild(element1img);
		var element1input = document.createElement("input");
		// Create input number element using the blessed hero ID, the expected value, limits and event listeners
		element1input.setAttribute("type", "number"); element1input.id = alliesids[i]; element1input.value = allies[alliesids[i]];
		element1input.addEventListener("change", function() {reload()}); element1input.max = 7; element1input.min = 0;
		container.appendChild(element1input);
		// Add another element if it actually exists
		if (alliesids[i+1]) {
			var element2img = document.createElement("img");
			element2img.className = "imagelabel"; element2img.src = "/common/faces/" + alliesids[i+1] + ".webp";
			container.appendChild(element2img);
			var element2input = document.createElement("input");
			// Create input number element using the blessed hero ID, the expected value, limits and event listeners
			element2input.setAttribute("type", "number"); element2input.id = alliesids[i+1]; element2input.value = allies[alliesids[i+1]];
			element2input.addEventListener("change", function() {reload()}); element2input.max = 7; element2input.min = 0;
			container.appendChild(element2input);
		}
		// Finally append the line to the targets section
		usedallies.appendChild(container);
	}
}

function updatedragonflowers() {
	// Get current value to restore it back if possible
	previousvalue = selectflowers.value
	// Default for cheating mode is 15
	flowers = 20;
	// First delete them all except the 0 element
	while (selectflowers.lastChild && selectflowers.childElementCount > 1) {
		selectflowers.removeChild(selectflowers.lastChild);
	}
	if (cheats.checked == false && selectheroes.value != "None") {
		flowers = units[selectheroes.value]["maxflowers"]
	}
	// Loop for each flower allowed
	for (i = 1; i <= flowers; i++) {
		var opt = document.createElement('option');
		opt.value = i;
		opt.innerHTML = i;
		selectflowers.appendChild(opt);
	}
	// Restore the previous value if it's available on the updated select
	if ([...selectflowers.options].map(opt => opt.value).includes(previousvalue)) {
		selectflowers.value = previousvalue;
	}
}

// Data for each build slot
builds = [
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","MyUnit","0","0","None","1","None", true]
]
// List of values to be restored (their document element)
selects = [selectrarity,selectmerges, selectflowers, selectboons, selectbanes, selectascendent, selectbeast, selectrefines, selectspecials, selectassists, selectA, selectB, selectC, selectS, selectsummoner, selectattire, selectbonusunit, selectatk, selectspd, selectdef, selectres, selectsp, selecthm, selectartstyle, selecttemplate, selectoffsetY, selectoffsetX, selectmirror, selectfavorite, selectaccessory, appui]
// Which builder slot is active right now
var buildslot = 0;
function switchbuild(build) {
	// First save changes to current slot (heroes, cheats, language, maxskill, weapons and blessings are to be done first because they affect the content of other selects)
	builds[buildslot][0] = selectheroes.value;
	builds[buildslot][1] = cheats.checked;
	builds[buildslot][2] = bestskills.checked;
	builds[buildslot][3] = selectlanguage.value;
	builds[buildslot][4] = selectweapons.value;
	builds[buildslot][5] = selectblessings.value;
	// Make sure the allies list is empty before saving to sync new possible deletions
	builds[buildslot][6] = {}
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		ally = selectallies.selectedOptions[i].value;
		builds[buildslot][6][ally] = document.getElementById(ally).value;
	}
	// Now save the rest of the data
	for (i = 0; i < selects.length; i++) {
		if (selects[i].type == "checkbox") {
			builds[buildslot][i+7] = selects[i].checked;
		} else {
			builds[buildslot][i+7] = selects[i].value;
		}
	}
	// Switch active slot
	buildslot = build;
	// Before restoring any changes skill slots must be cleaned since otherwise they will be ilegally carried over from other slots
	mustclean = [selectweapons, selectspecials, selectassists, selectA, selectB, selectC, selectS];
	for (i = 0; i < mustclean.length; i++) {
		mustclean[i].value = "None";
	}
	// Restore changes to current slot (heroes select, cheats and maxskill setting are to be done first because they affect the content of other selects)
	selectheroes.value = builds[buildslot][0];
	cheats.checked = builds[buildslot][1];
	bestskills.checked = builds[buildslot][2];
	selectlanguage.value = builds[buildslot][3];
	// Trigger a rebuild of the selects based on the language filters set
	populate(selectheroes, units, true, true); populateall(false); statictranslations();
	// Trigger a rebuild of the refine select based on the selection of weapon
	selectweapons.value = builds[buildslot][4];
	updateRefine();
	// Trigger a rebuild of the allies providing buffs
	selectblessings.value = builds[buildslot][5];
	for (i = 0; i < selectallies.options.length; i++) {
		ally = selectallies.options[i].value;
		if (builds[buildslot][6][ally]) {
			selectallies.options[i].selected = true;
		} else {
			selectallies.options[i].selected = false;
		}
	}
	showallies(true, builds[buildslot][6]);
	// Now restore the rest of the data
	for (i = 0; i < selects.length; i++) {
		if (selects[i].type == "checkbox") {
			selects[i].checked = builds[buildslot][i+7];
		} else {
			$('#'+selects[i].id).val(builds[buildslot][i+7]);
		}
	}
	// Reload the image
	reload(false);
}
