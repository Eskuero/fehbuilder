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
var units, skills, other, languages;
// All selects we have available
selectheroes = document.getElementById('selectheroes');
selectrarity = document.getElementById('rarity');
selectmerges = document.getElementById('merges');
selectflowers = document.getElementById('flowers');
selectboons = document.getElementById('boons');
selectbanes = document.getElementById('banes');
selectascendent = document.getElementById('ascendent');
selectbeast = document.getElementById('beast');
selectweapons = document.getElementById('weapon');
selectrefines = document.getElementById('refine');
selectspecials = document.getElementById('special');
selectassists = document.getElementById('assist');
selectA = document.getElementById('Askill');
selectB = document.getElementById('Bskill');
selectC = document.getElementById('Cskill');
selectS = document.getElementById('Sskill');
selectblessings = document.getElementById('blessing');
selectsummoner = document.getElementById('summoner');
selectattire = document.getElementById('attire');
selectbonusunit = document.getElementById('bonusunit');
selectallies = document.getElementById('allies');
selectatk = document.getElementById('atk');
selectspd = document.getElementById('spd');
selectdef = document.getElementById('def');
selectres = document.getElementById('res');
selectsp = document.getElementById('sp');
selecthm = document.getElementById('hm');
selectartstyle = document.getElementById('artstyle');
selectoffsetY = document.getElementById('offsetY');
selectoffsetX = document.getElementById('offsetX');
selectmirror = document.getElementById('mirror');
selectfavorite = document.getElementById('favorite');
selectaccessory = document.getElementById('accessory');
selectlanguage = document.getElementById('language');
cheats = document.getElementById('cheats');
bestskills = document.getElementById('bestskills');
appui = document.getElementById('appui');
// Where we show the image
var canvas = document.getElementById('fakecanvas');

// This makes sure dropdown options have their classes carried over (we need it to color basekit)
function copyClassesToSelect2(data, container) {
	if (data.element) {
		$(container).addClass($(data.element).attr("class"));
	}
	return data.text;
}

// Custom matcher for search results filtering
function matchCustom(params, data) {
	// If there are no search terms, return all of the data
	if ($.trim(params.term) === '') {
		return data;
	}
	// Do not display the item if there if the entry is null
	if (typeof data === 'undefined') {
		return null;
	}

	// This is the entry we are checking
	entry = data.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace("'","");
	// This is the search string we are using
	search = params.term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace("'","");

	// Check if the search string exists within a certain entry
	if (entry.indexOf(search) > -1) {
		return data;
	}

	// If the particular PID for the option is a duo with defined keywords check if any of them match the search
	if (other["duokeywords"][data.id]) {
		if (other["duokeywords"][data.id].toUpperCase().indexOf(search) > -1) {
			return data;
		}
	}

	// Return `null` if the term should not be displayed
	return null;
}

// Once the document is ready initiate the selects with their required
$(document).ready(function() {
	$('.s2-select').select2({
		templateResult: copyClassesToSelect2,
		matcher: matchCustom,
		width: '100%'
	});
});

// FIXME: Workaround for https://github.com/select2/select2/issues/5993 when using JQuery 3.6
$(document).on("select2:open", () => {
	document.querySelector(".select2-container--open .select2-search__field").focus()
});

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

function populate(select, data, clean, bypass) {
	// Get current value to restore it back if possible
	previousvalue = select.value
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
	options = {}
	// If indicated to bypass don't do checks for this select, print everything and leave (this is exclusively for the heroes select)
	if (bypass) {
		Object.keys(data).forEach((value) => {
			options[languages[selectlanguage.value]["M" + value] + ": " + (languages[selectlanguage.value][value.replace("PID", "MPID_HONOR")] || "Generic")] = value
		});
		// Sort all the values byt visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
		options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {})
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
		weapontype = units[selectheroes.value]["WeaponType"];
		movetype = units[selectheroes.value]["moveType"];
		basekit = units[selectheroes.value]["basekit"];
	// If no hero is selected we have nothing to do
	} else {
		return;
	}
	// For disabled cheats we only add the options that match move/ type restrictions and exclusive skills
	Object.keys(data).forEach((value) => {
		// If we arrived here we might or might not have to do checks so enable adding the skill by default
		add = true
		// The entire logic is processed on the python scripts so we just have to check the value set for the corresponding property. Previous values might go through the bestskills check since if we have enabled it after selecting a lower tier skill we don't go to erase it
		if (bestskills.checked == true && ! data[value]["isMax"] && (value != previousvalue || clean)) {
			return;
		}
		if (cheats.checked == false && (value != previousvalue || clean)) {
			// Cheat mode is disabled so now we conditionally enable the skill and the default value must be false even if we might have passed bestskills checks
			add = false
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
	options = Object.keys(options).sort().reduce((res, key) => (res[key] = options[key], res), {})
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
}

function beastcheck() {
	// Obtain the weapon category for the unit
	if (selectheroes.value == "None") {
		weapontype = false;
	} else {
		weapontype = units[selectheroes.value]["WeaponType"];
	}
	if (![20, 21, 22, 23].includes(weapontype)) {
		selectbeast.value = "no";
		selectbeast.disabled = true;
	} else {
		selectbeast.disabled = false;
	}
}

function validblessing() {
	// Check if the hero is listed as pre-blessed and update and lock
	if (other["blessed"][selectheroes.value]) {
		selectblessings.value = other["blessed"][selectheroes.value]["blessing"];
		selectblessings.disabled = true;
		return;
	// If we didn't found a match make sure the blessing select gets unlocked
	} else {
		selectblessings.disabled = false;
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
function slotname() {
	// Update unit name in the builder tab
	if (selectheroes.value != "None") {
		document.getElementById("unitslot").children[buildslot].innerHTML = languages[selectlanguage.value]["M" + selectheroes.value] + ": " + (languages[selectlanguage.value][selectheroes.value.replace("PID", "MPID_HONOR")] || "Generic");
	} else {
		document.getElementById("unitslot").children[buildslot].innerHTML = "#" + (buildslot+1) + " Build";
	}
}

function statictranslations() {
	slotname();
}

function maximize() {
	// Stop if no hero is selected
	if (selectheroes.value == "None") {
		return;
	}
	selectrarity.value = "5";
	selectmerges.value = "10";
	selectflowers.value = units[selectheroes.value]["maxflowers"];
	selectsummoner.value = "S";
	// Only choose resplendent if it's a legit one
	if (languages[selectlanguage.value][selectheroes.value.replace("PID", "MPID_VOICE") + "EX01"]) {
		selectattire.value = "Resplendent";
	} else {
		selectattire.value = "Normal";
	}
	// For beasts enable transformation
	weapontype = units[selectheroes.value]["WeaponType"];
	if ([20, 21, 22, 23].includes(weapontype)) {
		selectbeast.value = "yes";
	}
	reload();
}

function reset(section) {
	switch (section) {
		case "unit":
			selectrarity.value = "5";
			selectmerges.value = "0";
			selectflowers.value = "0";
			selectsummoner.value = "None";
			selectattire.value = "Normal";
			// We cannot check if the unit is a beast unless there's a unit selected
			if (selectheroes.value != "None") {
				// For beasts disable transformation
				weapontype = units[selectheroes.value]["WeaponType"];
				if ([20, 21, 22, 23].includes(weapontype)) {
					selectbeast.value = "no";
				}
			}
			selectboons.value = "None";
			selectbanes.value = "None";
			selectascendent.value = "None";
		break;
		case "skills":
			selectweapons.value = "None";
			updateRefine();
			selectrefines.value = "None";
			selectassists.value = "None";
			selectspecials.value = "None";
			selectA.value = "None";
			selectB.value = "None";
			selectC.value = "None";
			selectS.value = "None";
			// Trigger a rebuild of the selects based on the language filters set
			populateall(false);
	}
	reload();
}

function applybasekit() {
	// Stop if no hero is selected
	if (selectheroes.value == "None") {
		return;
	}
	basekit = {
		"weapon": false,
		"assist": false,
		"special": false,
		"A": false,
		"B": false,
		"C": false
	}
	fullkit = units[selectheroes.value]["basekit"];
	for (i = 0; i < fullkit.length; i++) {
		if (skills["weapons"][fullkit[i]]) {
			for (j = 0; j < selectweapons.options.length; j++) {
				if (selectweapons.options[j].value == fullkit[i]) {
					// If no weapon is added already save it
					if (!basekit["weapon"]) {
						basekit["weapon"] = fullkit[i];
					// If the weapon already added is a prf do not replace it unless the incoming weapon is also a prf
					} else if (!skills["weapons"][basekit["weapon"]]["exclusive"] || skills["weapons"][fullkit[i]]["exclusive"]) {
						basekit["weapon"] = fullkit[i];
					}
				}
			}
		} else if (skills["assists"][fullkit[i]]) {
			for (j = 0; j < selectassists.options.length; j++) {
				if (selectassists.options[j].value == fullkit[i]) {
					basekit["assist"] = fullkit[i];
				}
			}
		} else if (skills["specials"][fullkit[i]]) {
			for (j = 0; j < selectspecials.options.length; j++) {
				if (selectspecials.options[j].value == fullkit[i]) {
					basekit["special"] = fullkit[i];
				}
			}
		} else if (skills["passives"]["A"][fullkit[i]]) {
			for (j = 0; j < selectA.options.length; j++) {
				if (selectA.options[j].value == fullkit[i]) {
					basekit["A"] = fullkit[i];
				}
			}
		} else if (skills["passives"]["B"][fullkit[i]]) {
			for (j = 0; j < selectB.options.length; j++) {
				if (selectB.options[j].value == fullkit[i]) {
					basekit["B"] = fullkit[i];
				}
			}
		} else if (skills["passives"]["C"][fullkit[i]]) {
			for (j = 0; j < selectC.options.length; j++) {
				if (selectC.options[j].value == fullkit[i]) {
					basekit["C"] = fullkit[i];
				}
			}
		}
	}
	selectweapons.value = basekit["weapon"] ? basekit["weapon"] : "None";
	updateRefine();
	// If the weapon has an effect refine, use it
	if (basekit["weapon"]) {
		// The refines available for a weapon are defined as an array for the offline version to save bandwidth so the check is not valid for both version
		if (Array.isArray(skills["weapons"][basekit["weapon"]]["refines"])) {
			if (skills["weapons"][basekit["weapon"]]["refines"].indexOf("Effect")) {
				selectrefines.value = "Effect";
			}
		} else {
			if (skills["weapons"][basekit["weapon"]]["refines"]["Effect"]) {
				selectrefines.value = "Effect";
			}
		}
	}
	selectassists.value = basekit["assist"] ? basekit["assist"] : "None";
	selectspecials.value = basekit["special"] ? basekit["special"] : "None";
	selectA.value = basekit["A"] ? basekit["A"] : "None";
	selectB.value = basekit["B"] ? basekit["B"] : "None";
	selectC.value = basekit["C"] ? basekit["C"] : "None";

	// Trigger a rebuild of the selects based on the language filters set
	populateall(false);
	reload();
}
