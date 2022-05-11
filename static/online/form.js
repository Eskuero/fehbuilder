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
selectatkpairup = document.getElementById("atk-pairup");
selectspdpairup = document.getElementById("spd-pairup");
selectdefpairup = document.getElementById("def-pairup");
selectrespairup = document.getElementById("res-pairup");

// We store languages data for display of strings within the browser
languages = {};

// Fetch all data from each json
fetch('/common/data/languages/fulllanguages-' + selectlanguage.value + '.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages[selectlanguage.value] = out;
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/content/fullunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out;
				populate(selectheroes, units, true, true);
		}).catch(err => console.error(err));
		fetch('/common/data/content/fullskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out;
				// We need to have all skills available as a whole in case we use cheat seals
				allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"]);
				populateall();
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/content/fullother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
		init();
}).catch(err => console.error(err));

function populateall(clean) {
	// We go through all the selects
	populate(selectweapons, skills["weapons"], clean);
	populate(selectspecials, skills["specials"], clean);
	populate(selectassists, skills["assists"], clean);
	populate(selectA, skills["passives"]["A"], clean);
	populate(selectB, skills["passives"]["B"], clean);
	populate(selectC, skills["passives"]["C"], clean);
	populate(selectS, Object.assign({}, skills["passives"]["S"], cheats.checked ? Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"]) : {}), clean);
	// Add only the required amount of flowers
	updatedragonflowers();
	// Update translations
	statictranslations();
	// Add all allies to the list
	fillblessed();
	// Make sure we got a valid blessing for locked mythics/legendaries
	validblessing();
	// Disable or enable beast select based on unit
	beastcheck();
}

async function init() {
	// This array will be used as rendering queue
	renderingqueue = [];
	// Load and wait for the font to be ready
	var font = new FontFace("FeH-Font", "url('/common/feh-font.woff2') format('woff2')");
	await font.load();
	document.fonts.add(font);

	// Load the numberfont specifically since we will use it multiple times
	await getimage(other["images"]["other"]["numberfont"]).then(img => {
		numberfont = img;
	});

	// Draw it for the first time
	reload();
	// Meme
	//memedraw();
}

async function reload(scroll = false) {
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang]) {
		await sleep(100);
	}
	// Get epoch as rendering ID
	var renderingid = new Date().getTime();
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
			// Load the hpfont specifically since we will use it specifically on condensed layout
			await getimage(other["images"]["other"]["hpfont"]).then(img => {
				hpfont = img;
			});
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

async function populate(select, data, clean, bypass) {
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang]) {
		await sleep(100);
	}
	// Get current value to restore it back if possible
	var previousvalue = select.value;
	// First delete them all
	while (select.lastChild) {
		select.removeChild(select.lastChild);
	}
	// Always add the None option with it's proper translation
	var opt = document.createElement('option');
	opt.value = "None";
	opt.innerHTML = languages[selectlanguage.value]["MSID_H_NONE"];
	select.appendChild(opt);
	// All data to be printed
	var options = {};
	// If indicated to bypass don't do checks for this select, print everything and leave (this is exclusively for the heroes select)
	if (bypass) {
		Object.keys(data).forEach((value) => {
			options[languages[selectlanguage.value]["M" + value] + ": " + (languages[selectlanguage.value][value.replace("PID", "MPID_HONOR")] || "Generic")] = value;
		});
		// Sort all the values byt visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
		var options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {});
		// For each entry print an option
		for (const [string, tag] of Object.entries(options)) {
			var opt = document.createElement('option');
			opt.value = tag;
			// If of type person we also append the title
			opt.innerHTML = string;
			select.appendChild(opt);
		}
		// Restore the previous value if it's available on the updated select
		if ([...select.options].map(opt => opt.value).includes(previousvalue)) {
			select.value = previousvalue;
		}
		return;
	}
	if (selectheroes.value != "None") {
		// Hero info for possible later checks
		var weapontype = units[selectheroes.value]["WeaponType"];
		var movetype = units[selectheroes.value]["moveType"];
		var basekit = units[selectheroes.value]["basekit"];
	// If no hero is selected we have nothing to do
	} else {
		return;
	}
	// For disabled cheats we only add the options that match move/ type restrictions and exclusive skills
	Object.keys(data).forEach((value) => {
		// If we arrived here we might or might not have to do checks so enable adding the skill by default
		let add = true;
		// The entire logic is processed on the python scripts so we just have to check the value set for the corresponding property. Previous values might go through the bestskills check since if we have enabled it after selecting a lower tier skill we don't go to erase it
		if (bestskills.checked == true && ! data[value]["isMax"] && (value != previousvalue || clean)) {
			return;
		}
		if (cheats.checked == false && (value != previousvalue || clean)) {
			// Cheat mode is disabled so now we conditionally enable the skill and the default value must be false even if we might have passed bestskills checks
			add = false;
			// Check if the skills has weapon restrictions and if it does check if we meet them
			if (data[value]["WeaponType"] >> weapontype & 1) {
				add = true;
			// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
			} else {
				return;
			}
			// Check if the skills has movement restrictions and if it does check if we meet them so we just skip this iteration
			if (data[value]["moveType"] >> movetype & 1) {
				add = true;
			// If it doesn't contain out movement type we cannot use it regardless of if we met weapon type
			} else {
				return;
			}
			// Check if the skill is exclusive and if it does check if it's included on the units basekit
			if (data[value]["exclusive"]) {
				if (basekit.includes(value)) {
					add = true;
				// If it isn't on the unit basekit he can't use it regarless of other conditions so we skip this iteration
				} else {
					return;
				}
			}
		}
		// Arriving at this check with a true add value measn we can add the option
		if (add) {
			options[languages[selectlanguage.value]["M" + value]] = value;
		}
	});
	// Sort all the values byt visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	var options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {});
	// For each entry print an option
	for (const [string, tag] of Object.entries(options)) {
		var opt = document.createElement('option');
		opt.value = tag;
		// If of type person we also append the title
		opt.innerHTML = string;
		if (basekit.includes(tag)) {
			opt.className = "basekit";
		}
		select.appendChild(opt);
	}
	// Restore the previous value if it's available on the updated select
	if ([...select.options].map(opt => opt.value).includes(previousvalue)) {
		select.value = previousvalue;
	}
	// For select of weapons once done we make sure to update the refine one
	if (select == selectweapons) {
		updateRefine();
	}
}

async function statictranslations() {
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang]) {
		await sleep(100);
	}
	slotname();
}

function updateRefine() {
	// Get current value to restore it back if possible
	var previousvalue = selectrefines.value;
	var weapon = selectweapons.value;

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
	var refines = Object.keys(skills["weapons"][weapon]["refines"]);
	for (let i = 0; i < refines.length; i++) {
		let opt = document.createElement('option');
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
	var options = document.getElementsByClassName("tabs")[0].children;
	for (let i = 1; i < options.length - 1; i++) {
		if (options[i] == caller) {
			options[i].className = "imagelabel selected";
		} else {
			options[i].className = "imagelabel";
		}
	}

	// If switching from a differently built section use their entire name (for now only legendary boosts)
	var options = ["buffs", "pairups", "legendaries"];
	for (let i = 0; i < options.length; i++) {
		document.getElementById(options[i]).style.display = (options[i] == target) ? "initial" : "none";
	}
}

async function fillblessed(clean = false) {
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang]) {
		await sleep(100);
	}
	// We need to know which options to restore unless called clean
	var toberestored = [];
	if (!clean) {
		for (let i = 0; i < selectallies.selectedOptions.length; i++) {
			toberestored.push(selectallies.selectedOptions[i].value);
		}
	}
	// First delete all allies
	while (selectallies.lastChild) {
		selectallies.removeChild(selectallies.lastChild);
	}
	var blessingsstrings = ["MID_ITEM_BLESSING_FIRE", "MID_ITEM_BLESSING_WATER", "MID_ITEM_BLESSING_WIND", "MID_ITEM_BLESSING_EARTH", "MID_ITEM_BLESSING_LIGHT", "MID_ITEM_BLESSING_DARK", "MID_ITEM_BLESSING_HEAVEN", "MID_ITEM_BLESSING_LOGIC"];
	// Create an optgroup for each blessing type
	for (i = 0; i < 8; i++) {
		let optgroup = document.createElement('optgroup');
		optgroup.label = languages[newlang][blessingsstrings[i]];
		selectallies.appendChild(optgroup);
	}
	// All data to be printed
	var options = {};
	// Add an option for each value
	for (const [hero, properties] of Object.entries(other["blessed"])) {
		options[languages[selectlanguage.value]["M" + hero] + ": " + languages[selectlanguage.value][hero.replace("PID", "MPID_HONOR")]] = hero;
	}
	// Sort all the values by visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	var options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {});
	// For each entry print an option
	for (const [string, tag] of Object.entries(options)) {
		let opt = document.createElement('option');
		opt.value = tag;
		opt.innerHTML = string;
		// If we are only translating and the value was selected restore it
		if (toberestored.includes(tag)) {
			opt.selected = true;
		}
		selectallies.children[other["blessed"][tag]["blessing"]-1].appendChild(opt);
	}
}

function showallies(clean = false, allies = {}) {
	// If clean that means we are receiving data from a buildslot restore and we cannot trust what's already defined
	if (!clean) {
		// Create inputs for every selected ally
		for (let i = 0; i < selectallies.selectedOptions.length; i++) {
			let ally = selectallies.selectedOptions[i].value;
			// If the ally already exists add the current value to prevent losing data
			allies[ally] = document.getElementById(ally) ? document.getElementById(ally).value : 1;
		}
	}
	// Now delete all existing
	while (usedallies.lastChild) {
		usedallies.removeChild(usedallies.lastChild);
	}
	// Loop through all the allies and add each option in groups of two
	var alliesids = Object.keys(allies);
	for (let i = 0; i < alliesids.length; i = i + 2) {
		// Major div element
		let container = document.createElement("div");
		container.className = "row-property double";
		// Add the first element of this iteration
		let element1img = document.createElement("img");
		element1img.className = "imagelabel"; element1img.src = "/common/faces/" + alliesids[i] + ".webp";
		container.appendChild(element1img);
		let element1input = document.createElement("input");
		// Create input number element using the blessed hero ID, the expected value, limits and event listeners
		element1input.setAttribute("type", "number"); element1input.id = alliesids[i]; element1input.value = allies[alliesids[i]];
		element1input.addEventListener("change", function() {reload()}); element1input.max = 7; element1input.min = 0;
		container.appendChild(element1input);
		// Add another element if it actually exists
		if (alliesids[i+1]) {
			let element2img = document.createElement("img");
			element2img.className = "imagelabel"; element2img.src = "/common/faces/" + alliesids[i+1] + ".webp";
			container.appendChild(element2img);
			let element2input = document.createElement("input");
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
	var previousvalue = selectflowers.value;
	// Default for cheating mode is 15
	var flowers = 20;
	// First delete them all except the 0 element
	while (selectflowers.lastChild && selectflowers.childElementCount > 1) {
		selectflowers.removeChild(selectflowers.lastChild);
	}
	if (cheats.checked == false && selectheroes.value != "None") {
		var flowers = units[selectheroes.value]["maxflowers"];
	}
	// Loop for each flower allowed
	for (let i = 1; i <= flowers; i++) {
		let opt = document.createElement('option');
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
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","1","None", true]
];
// List of values to be restored (their document element)
selects = [selectrarity,selectmerges, selectflowers, selectboons, selectbanes, selectascendent, selectbeast, selectrefines, selectspecials, selectassists, selectA, selectB, selectC, selectS, selectsummoner, selectattire, selectbonusunit, selectatk, selectspd, selectdef, selectres, selectatkpairup, selectspdpairup, selectdefpairup, selectrespairup, selectsp, selecthm, selectartstyle, selecttemplate, selectoffsetY, selectoffsetX, selectmirror, selectfavorite, selectaccessory, appui];
// Which builder slot is active right now
buildslot = 0;
function switchbuild(build) {
	// First save changes to current slot (heroes, cheats, language, maxskill, weapons and blessings are to be done first because they affect the content of other selects)
	builds[buildslot][0] = selectheroes.value;
	builds[buildslot][1] = cheats.checked;
	builds[buildslot][2] = bestskills.checked;
	builds[buildslot][3] = selectlanguage.value;
	builds[buildslot][4] = selectweapons.value;
	builds[buildslot][5] = selectblessings.value;
	// Make sure the allies list is empty before saving to sync new possible deletions
	builds[buildslot][6] = {};
	for (let i = 0; i < selectallies.selectedOptions.length; i++) {
		let ally = selectallies.selectedOptions[i].value;
		builds[buildslot][6][ally] = document.getElementById(ally).value;
	}
	// Now save the rest of the data
	for (let i = 0; i < selects.length; i++) {
		if (selects[i].type == "checkbox") {
			builds[buildslot][i+7] = selects[i].checked;
		} else {
			builds[buildslot][i+7] = selects[i].value;
		}
	}
	// Switch active slot
	buildslot = build;
	// Before restoring any changes skill slots must be cleaned since otherwise they will be ilegally carried over from other slots
	var mustclean = [selectweapons, selectspecials, selectassists, selectA, selectB, selectC, selectS];
	for (let i = 0; i < mustclean.length; i++) {
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
	for (let i = 0; i < selectallies.options.length; i++) {
		let ally = selectallies.options[i].value;
		if (builds[buildslot][6][ally]) {
			selectallies.options[i].selected = true;
		} else {
			selectallies.options[i].selected = false;
		}
	}
	showallies(true, builds[buildslot][6]);
	// Now restore the rest of the data
	for (let i = 0; i < selects.length; i++) {
		if (selects[i].type == "checkbox") {
			selects[i].checked = builds[buildslot][i+7];
		} else {
			$('#'+selects[i].id).val(builds[buildslot][i+7]);
		}
	}
	// Reload the image
	reload(false);
}
