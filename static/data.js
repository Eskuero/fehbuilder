// Dicts for info
var units, skills;
// All selects we have available
selectheroes = document.getElementById('selectheroes');
selectmerges = document.getElementById('merges');
selectflowers = document.getElementById('flowers');
selectboons = document.getElementById('boons');
selectbanes = document.getElementById('banes');
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
cheats = document.getElementById('cheats');
bestskills = document.getElementById('bestskills');
// Where we show the image
var canvas = document.getElementById('fakecanvas');

$(document).ready(function() {
    $('select').select2({
		theme: "bootstrap4",
	});
	$(".s2-select-without-search").select2({
		minimumResultsForSearch: Infinity,
		theme: "bootstrap4",
	});
});

$('.select2-search').select2('open');

// Fetch all data from each json
fetch('units.json')
	.then(res => res.json())
	.then((out) => {
		// We store the skills for basic checks within the browser
		units = out
		populate(selectheroes, units, Object.keys(units), true)
}).catch(err => console.error(err));
fetch('skills.json')
	.then(res => res.json())
	.then((out) => {
		// We store the skills for basic checks within the browser
		skills = out
		populateall()
}).catch(err => console.error(err));

function populateall() {
	// We go through all the selects
	populate(selectweapons, skills["weapons"], Object.keys(skills["weapons"]))
	populate(selectspecials, skills["specials"], Object.keys(skills["specials"]))
	populate(selectassists, skills["assists"], Object.keys(skills["assists"]))
	populate(selectA, skills["passives"]["A"], Object.keys(skills["passives"]["A"]))
	populate(selectB, skills["passives"]["B"], Object.keys(skills["passives"]["B"]))
	populate(selectC, skills["passives"]["C"], Object.keys(skills["passives"]["C"]))
	populate(selectS, skills["passives"]["S"], Object.keys(skills["passives"]["S"]))
    // Make sure we do not end with an invalid refine option setup
    updateRefine()
	// Add only the required amount of flowers
	updatedragonflowers()
}

function populate(select, data, list, bypass) {
	// First delete them all except the None element
	while (select.lastChild && select.childElementCount > 1) {
        select.removeChild(select.lastChild);
    }
    // If indicated to bypass don't do checks for this select, print everything and leave
    if (bypass) {
		list.forEach((value) => {
			var opt = document.createElement('option');
			opt.value = value;
			opt.innerHTML = value;
			select.appendChild(opt);
		});
		return;
	}
	if (selectheroes.value != "None") {
		// Hero info for possible later checks
		weapontype = units[selectheroes.value]["WeaponType"];
		movetype = units[selectheroes.value]["moveType"];
		basekit = units[selectheroes.value]["basekit"];
		// This skills have abnormal SP cost but are the highest of their family each so hardcode them for possible later checks
		abnormalskills = ["Attack +3", "Defense +3", "Resistance +3", "Speed +3", "Drag Back", "Hit and Run", "Lunge", "Knock Back", "Axe Experience 3", "Axe Valor 3", "B Tome Exp. 3", "B Tome Valor 3", "Beast Exp. 3", "Beast Valor 3", "Bow Exp. 3", "Bow Valor 3", "Dagger Exp. 3", "Dagger Valor 3", "Dragon Valor 3", "G Tome Exp. 3", "G Tome Valor 3", "Lance Exp. 3", "Lance Valor 3", "R Tome Exp. 3", "R Tome Valor 3", "Staff Exp. 3", "Staff Valor 3", "Sword Exp. 3", "Sword Valor 3"];
	// If no hero is selected we have nothing to do
	} else {
		return;
	}
	// For disabled cheats we only add the options that match move/ type restrictions and exclusive skills
	list.forEach((value) => {
		// If we arrived here we might or might not have to do checks so enable adding the skill by default
		add = true
		if (bestskills.checked == true) {
			// Best skills mode is disabled so now we conditionally enable the skill so the default value must be false
			add = false
			// Skip it if another skill of the same category has a + sign at the end
			if (value + "+" in data) {
				return;
			}
			// For weapons the anything with more than 200 SP is valid since that's the value for prerequisites of the Steel Axes
			if (value in skills["weapons"] && data[value]["cost"] > 200) {
				add = true;
			// For assists our checks are more complex. For assists that only score 150 we add them only if they are not base rallies
			} else if (value in skills["assists"] && (data[value]["cost"] > 150 || ! value.includes("Rally"))) {
				add = true;
			// Specials are fine as long as they cost more than 100 SP (Base versions of the boosting ones are worth 100 and the ones for AoE are 150) except for Heavenly Light because is the only upgrade from Imbue
			} else if (value in skills["specials"] && (data[value]["cost"] > 150 || value == "Heavenly Light")) {
				add = true;
			// Passives are a bit more complex but for starters anything bigger than 150 is fine except for the hardcoded skills
			} else if ((value in skills["passives"]["A"] || value in skills["passives"]["B"] || value in skills["passives"]["C"] || value in skills["passives"]["S"])
				&& (data[value]["cost"] > 150 || abnormalskills.includes(data))) {
				add = true;
			// If we met no condition we can't print the weapon
			} else {
				return;
			}
		}
		if (cheats.checked == false) {
			// Cheat mode is disabled so now we conditionally enable the skill and the default value must be false even if we might have passed bestskills checks
			add = false
			// Check if the skills has weapon restrictions and if it does check if we meet them
			if ("WeaponType" in data[value]) {
				if (data[value]["WeaponType"].includes(weapontype)) {
					add = true;
				// If it doesn't contain out weapon type we cannot use it regardless of if we are going to meet movement type so we just skip this iteration
				} else {
					return;
				}
			}
			// Check if the skills has movement restrictions and if it does check if we meet them so we just skip this iteration
			if ("moveType" in data[value]) {
				if (data[value]["moveType"].includes(movetype)) {
					add = true;
				// If it doesn't contain out movement type we cannot use it regardless of if we met weapon type
				} else {
					return;
				}
			}
			// Check if the skill is exclusive and if it does check if it's included on the units basekit
			if (data[value]["exclusive"]) {
				if (basekit.includes(value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\(|\)/g, "").replace("'", ""))) {
					add = true;
				// If it isn't on the unit basekit he can't use it regarless of other conditions so we skip this iteration
				} else {
					return;
				}
			}
		}
		// Arriving at this check with a true add value measn we can add the option
		if (add) {
			var opt = document.createElement('option');
			opt.value = value;
			opt.innerHTML = value;
			select.appendChild(opt);
		}
	});
}

function reload() {
	document.getElementById('fakecanvas').src = "/get_image.png?name=" + encodeURIComponent(selectheroes.value) + "&merges=" + selectmerges.value + "&flowers=" + selectflowers.value + "&boon=" + selectboons.value + "&bane=" + selectbanes.value + "&weapon=" + encodeURIComponent(selectweapons.value) + "&refine=" + selectrefines.value + "&assist=" + encodeURIComponent(selectassists.value) + "&special=" + encodeURIComponent(selectspecials.value) + "&passiveA=" + encodeURIComponent(selectA.value) + "&passiveB=" + encodeURIComponent(selectB.value) + "&passiveC=" + encodeURIComponent(selectC.value) + "&passiveS=" + encodeURIComponent(selectS.value) + "&blessing=" + selectblessings.value + "&summoner=" + selectsummoner.value + "&attire=" + selectattire.value;
}

function updatedragonflowers() {
	// Default for cheating mode is 15
	flowers = 15;
	// First delete them all except the 0 element
	while (selectflowers.lastChild && selectflowers.childElementCount > 1) {
        selectflowers.removeChild(selectflowers.lastChild);
    }
    if (cheats.checked == false && selectheroes.value != "None") {
		// Default for new heroes is at least 5
		flowers = 5;
		release = new Date(units[selectheroes.value]["AdditionDate"]);
		if (release < new Date('2020-08-18')) {
			flowers += 5;
			if (release < new Date('2019-02-06') && units[selectheroes.value]["moveType"] == "Infantry") {
				flowers += 5;
			}
		}
	}
	// Loop for each flower allowed
	for (i = 1; i <= flowers; i++) {
		var opt = document.createElement('option');
		opt.value = i;
		opt.innerHTML = i;
		selectflowers.appendChild(opt);
	}
}



function updateRefine() {
	weapon = selectweapons.value

	// Clear all children on the refine select first
	while (selectrefines.lastChild) {
        selectrefines.removeChild(selectrefines.lastChild);
    }
    var opt = document.createElement('option');
	opt.value = "None";
	opt.innerHTML = "None";
	selectrefines.appendChild(opt);
	if (weapon == "None") {
		return;
	}
	if (skills["weapons"][weapon]["upgrades"]) {
		if (skills["weapons"][weapon]["WeaponType"].includes("Colorless Staff")) {
			// Staffs cannot have normal refines and special ones
			if (skills["weapons"][weapon]["specialIcon"].includes("Wrathful")) {
				var opt = document.createElement('option');
				opt.value = "Dazzling";
				opt.innerHTML = "Dazzling";
				selectrefines.appendChild(opt);
				var opt = document.createElement('option');
				opt.value = "Wrathful";
				opt.innerHTML = "Wrathful";
				selectrefines.appendChild(opt);
			 } else {
				var opt = document.createElement('option');
				opt.value = "Effect";
				opt.innerHTML = "Effect";
				selectrefines.appendChild(opt);
			 }
			return
		}
		if (skills["weapons"][weapon]["specialIcon"]) {
			var opt = document.createElement('option');
			opt.value = "Effect";
			opt.innerHTML = "Effect";
			selectrefines.appendChild(opt);
		}
		["Atk", "Spd", "Def", "Res"].forEach((stat) => {
			var opt = document.createElement('option');
			opt.value = stat;
			opt.innerHTML = stat;
			selectrefines.appendChild(opt);
		});
	}
}
