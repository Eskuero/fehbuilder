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
legality = document.getElementById('legality');
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
	// For enabled legality we only add the options that match move and type restrictions (also bypass for the units select)
	if (legality.checked == true && ! bypass && selectheroes.value != "None") {
		// By default we do not add the skill
		add = false
		weapontype = units[selectheroes.value]["WeaponType"]
		movetype = units[selectheroes.value]["moveType"]
		basekit = units[selectheroes.value]["basekit"]
		list.forEach((value) => {
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
				if (basekit.includes(value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
					add = true;
				// If it isn't on the unit basekit he can't use it regarless of other conditions so we skip this iteration
				} else {
					return;
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
	// If we are cheating we just add as much options as we have to everything and anything
	} else {
		list.forEach((value) => {
			var opt = document.createElement('option');
			opt.value = value;
			opt.innerHTML = value;
			select.appendChild(opt);
		});
	}
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
    if (legality.checked == true && selectheroes.value != "None") {
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
