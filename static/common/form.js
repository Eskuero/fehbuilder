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
	// Check if the hero is listed as pre-blessed, update and lock
	if (other["blessed"][selectheroes.value]) {
		selectblessings.value = other["blessed"][selectheroes.value]["blessing"];
		selectblessings.disabled = true;
		return;
	// If we didn't found a match make sure the blessing select gets unlocked
	} else {
		selectblessings.disabled = false;
	}
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
