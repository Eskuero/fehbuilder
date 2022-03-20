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
			// Reset select blessings only if it's not locked (otherwise it means we have a mythic/legendary)
			if (!selectblessings.disabled) {
				selectblessings.value = "None";
			}
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
		break;
		case "stats":
			// Detect which section we are on
			options = document.getElementsByClassName("tabs")[0].children;
			for (i = 1; i < options.length - 1; i++) {
				if (options[i].className == "imagelabel selected") {
					selection = options[i].title;
				}
			}
			switch (selection) {
				case "Blessings":
					// First delete all selections
					fillblessed(true);
					// Now delete all existing
					while (usedallies.lastChild) {
						usedallies.removeChild(usedallies.lastChild);
					}
				break;
				case "Bonuses":
					selectatk.value = 0;
					selectspd.value = 0;
					selectdef.value = 0;
					selectres.value = 0;
				break;
				case "Pair-Up":
					selectatkpairup.value = 0;
					selectspdpairup.value = 0;
					selectdefpairup.value = 0;
					selectrespairup.value = 0;
				break;
			}
		break;
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
