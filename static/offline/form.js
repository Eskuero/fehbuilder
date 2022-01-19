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

// Fetch all data from each json
fetch('/common/data/litelanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/liteunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out
				populate(selectheroes, units, true, true)
		}).catch(err => console.error(err));
		fetch('/common/data/liteskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out
				populateall()
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/liteother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out
		init();
}).catch(err => console.error(err));

function init() {
	// Draw it for the first time
	reload();
}

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
	// Make sure we got a valid blessing for locked mythics/legendaries
	validblessing()
	// Make sure we don't end with invalid allies on the list
	reblessed()
	// Disable or enable beast select based on unit
	beastcheck()
}

function reload(scroll = false) {
	// Obtain the list of support heroes
	allies = "";
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		allies += selectallies.selectedOptions[i].value + "|"
	}
	// Obtain the visible buffs
	buffs = selectatk.value + ";" + selectspd.value + ";" + selectdef.value + ";" + selectres.value
	// Change the URL of the img to force it to reload
	document.getElementById('fakecanvas').src = "/get_image.png?name=" + encodeURIComponent(selectheroes.value) + "&rarity=" + selectrarity.value + "&merges=" + selectmerges.value + "&flowers=" + selectflowers.value + "&boon=" + selectboons.value + "&bane=" + selectbanes.value + "&ascendent=" + selectascendent.value + "&beast=" + selectbeast.value + "&weapon=" + encodeURIComponent(selectweapons.value) + "&refine=" + selectrefines.value + "&assist=" + encodeURIComponent(selectassists.value) + "&special=" + encodeURIComponent(selectspecials.value) + "&passiveA=" + encodeURIComponent(selectA.value) + "&passiveB=" + encodeURIComponent(selectB.value) + "&passiveC=" + encodeURIComponent(selectC.value) + "&passiveS=" + encodeURIComponent(selectS.value) + "&blessing=" + selectblessings.value + "&summoner=" + selectsummoner.value + "&attire=" + selectattire.value + "&appui=" + appui.checked + "&bonusunit=" + selectbonusunit.value + "&allies=" + encodeURIComponent(allies) + "&buffs=" + encodeURIComponent(buffs) + "&sp=" + selectsp.value + "&hm=" + selecthm.value + "&artstyle=" + selectartstyle.value + "&offsetY=" + selectoffsetY.value + "&offsetX=" + selectoffsetX.value + "&mirror=" + selectmirror.value + "&favorite=" + selectfavorite.value + "&accessory=" + selectaccessory.value + "&language=" + selectlanguage.value;

	// Autoscroll all the way up so the user can inmediately see the hero preview on portrait screens
	if (scroll) {
		window.scrollTo(0, 0);
	}
}

function reblessed() {
	// We need to know which options to restore
	toberestored = []
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		toberestored.push(selectallies.selectedOptions[i].value)
	}
	// First delete all allies
	while (selectallies.lastChild) {
		selectallies.removeChild(selectallies.lastChild);
	}
	// Stop if we did unset the blessing type
	if (selectblessings.value == "None") {
		selectallies.disabled = true
		return;
	}
	blessing = parseInt(selectblessings.value)
	// Make sure the allies select is enabled if arrvied here
	selectallies.disabled = false
	// All data to be printed
	options = {}
	for (const [hero, properties] of Object.entries(other["blessed"])) {
		// We skip certain iterations depending on the type of hero and blessing selected
		// For preblessed we only allow mythics for legendaries and viceversa
		if (other["blessed"][selectheroes.value]) {
			if ((blessing > 4 && properties["blessing"] > 4) || (blessing < 5 && properties["blessing"] < 5)) {
				continue;
			}
		} else if (blessing != properties["blessing"]) {
			continue;
		}
		// Depending on the type of blessing there's a limit on allies (for preblessed we do the opposite). For arena blessings the limit is always 3, for aether raids the limit is 6 for extra slot heroes and 5 for older ones
		if (other["blessed"][selectheroes.value]) {
			var max = [5, 6, 7, 8].includes(blessing) ? 3 : (properties["variant"].includes("extrae") ? 6 : 5);
		} else {
			var max = [5, 6, 7, 8].includes(blessing) ? (properties["variant"].includes("extrae") ? 6 : 5) : 3;
		}
		// If the heroe is for AR attacking reduce the max by one
		max -= ([5, 7].includes(properties["blessing"])) ? 1 : 0
		// Add an option for each value
		for (j = 1; j <= max; j++) {
			options[languages[selectlanguage.value]["M" + hero] + ": " + languages[selectlanguage.value][hero.replace("PID", "MPID_HONOR")] + " x" + j] = hero + ";" + j;
		}
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

function checkallies() {
	blessing = parseInt(selectblessings.value)
	// Depending on the type of blessing there's a limit on allies (for preblessed we do the opposite). Unlike on the reblessed function right here we hardcode the AR max value to the defense with extra slot and later offset the individual value of each hero inside the checks
	if (other["blessed"][selectheroes.value]) {
		var max = [5, 6, 7, 8].includes(blessing) ? 3 : 6;
	} else {
		var max = [5, 6, 7, 8].includes(blessing) ? 6 : 3;
	}
	// Detect the amount and the blessings of the allies currently deployed and wheter they unlocked the bonusslot already or not
	allies = 0;
	blessings = [];
	bonus = false;
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		values = selectallies.selectedOptions[i].value.split(';')
		properties = other["blessed"][values[0]]
		allies += parseInt(values[1])
		if (!blessings.includes(properties["blessing"])) {
			blessings.push(properties["blessing"])
		}
		if (properties["variant"].includes("extrae")) {
			bonus = true;
		}
	}
	remaining = max - allies
	// Now for every option in the select disable those that are too big for the amount of slots for allies we have remaining
	for (i = 0; i < selectallies.options.length; i++) {
		// Ignore entries that are already selected
		if (!selectallies.options[i].selected) {
			// Get the properties for the hero
			properties = other["blessed"][selectallies.options[i].value.split(";")[0]]
			// This offset basically fixes the amount of copies we are allowed for this particular ally after we pressumed max team a few lines ago
			// We add one if the blessing of the hero is offensive (Light/Astra) and another if the hero doesn't enable the extra slot
			offset = 0
			if ([5, 6, 7, 8].includes(properties["blessing"])) {
				offset += properties["variant"].includes("extrae") || bonus ? 0 : 1;
				offset += [5, 7].includes(properties["blessing"]) ? 1 : 0;
			}
			// Disable the entry if the associated multiplier is too big to be selected later
			if ((parseInt(selectallies.options[i].value.split(";")[1]) + offset) > remaining) {
				selectallies.options[i].disabled = true;
			// Otherwise enable it
			} else {
				selectallies.options[i].disabled = false;
			}
			// Preblessed have additional rules
			if (selectblessings.disabled == true) {
				// For mythics if the amount of blessings reached 2 and the blessing for this option is not already selected we disable all of them (seasons only have two)
				if (parseInt(selectblessings.value) > 4 && blessings.length == 2 && !blessings.includes(properties["blessing"])) {
					selectallies.options[i].disabled = true;
				// For legendaries we disable "opposite" blessings if one is already selected (we can't get dark and light blessings on anima/astra season)
				} else if ((blessings.some(r=> [6,7].includes(r)) && [4,5].includes(properties["blessing"])) || (blessings.some(r=> [4,5].includes(r)) && [6,7].includes(properties["blessing"]))) {
					selectallies.options[i].disabled = true;
				}
			}
		}
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
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","None","1","None", true],
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","None","1","None", true]
]
// List of values to be restored (their document element)
selects = [selectrarity,selectmerges, selectflowers, selectboons, selectbanes, selectascendent, selectbeast, selectrefines, selectspecials, selectassists, selectA, selectB, selectC, selectS, selectsummoner, selectattire, selectbonusunit, selectatk, selectspd, selectdef, selectres, selectsp, selecthm, selectartstyle, selectoffsetY, selectoffsetX, selectmirror, selectfavorite, selectaccessory, appui]
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
	builds[buildslot][6] = []
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		builds[buildslot][6].push(selectallies.selectedOptions[i].value)
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
	// Trigger a rebuild of the allies select based on the selection of blessing
	selectblessings.value = builds[buildslot][5];
	reblessed();
	for (i = 0; i < selectallies.options.length; i++) {
		if (builds[buildslot][6].includes(selectallies.options[i].value)) {
			selectallies.options[i].selected = true;
		}
	}
	checkallies();
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
	for (i = 0; i < skills["weapons"][weapon]["refines"].length; i++) {
		var opt = document.createElement('option');
		opt.value = skills["weapons"][weapon]["refines"][i];
		opt.innerHTML = skills["weapons"][weapon]["refines"][i];
		selectrefines.appendChild(opt);
	}
	// Restore the previous value if it's available on the updated select
	if ([...selectrefines.options].map(opt => opt.value).includes(previousvalue)) {
		selectrefines.value = previousvalue;
	}
}
