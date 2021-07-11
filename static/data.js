// Dicts for info
var skills;
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
// Where we show the image
var canvas = document.getElementById('fakecanvas');

// Fetch all data from each json
fetch('units.json')
	.then(res => res.json())
	.then((out) => {
		populate(selectheroes, Object.keys(out))
}).catch(err => console.error(err));
fetch('skills.json')
	.then(res => res.json())
	.then((out) => {
		// We store the skills for basic checks within the browser
		skills = out
		populate(selectweapons, Object.keys(skills["weapons"]))
		populate(selectspecials, Object.keys(skills["specials"]))
		populate(selectassists, Object.values(skills["assists"]))
		populate(selectA, Object.keys(skills["passives"]["A"]))
		populate(selectB, Object.keys(skills["passives"]["B"]))
		populate(selectC, Object.keys(skills["passives"]["C"]))
		populate(selectS, Object.keys(skills["passives"]["S"]))
}).catch(err => console.error(err));

function populate(select, info) {
	// Add as much options to the select as heroes we have
	info.forEach((value) => {
		var opt = document.createElement('option');
		opt.value = value;
		opt.innerHTML = value;
		select.appendChild(opt);
	});
}

function reload() {
	document.getElementById('fakecanvas').src = "/get_image.png?name=" + encodeURIComponent(selectheroes.value) + "&merges=" + selectmerges.value + "&flowers=" + selectflowers.value + "&boon=" + selectboons.value + "&bane=" + selectbanes.value + "&weapon=" + encodeURIComponent(selectweapons.value) + "&refine=" + selectrefines.value + "&assist=" + encodeURIComponent(selectassists.value) + "&special=" + encodeURIComponent(selectspecials.value) + "&passiveA=" + encodeURIComponent(selectA.value) + "&passiveB=" + encodeURIComponent(selectB.value) + "&passiveC=" + encodeURIComponent(selectC.value) + "&passiveS=" + encodeURIComponent(selectS.value) + "&blessing=" + selectblessings.value + "&summoner=" + selectsummoner.value + "&attire=" + selectattire.value
}

function updateRefine(weapon) {
	// Clear all children on the refine select first
	while (selectrefines.lastChild) {
        selectrefines.removeChild(selectrefines.lastChild);
    }
    var opt = document.createElement('option');
	opt.value = "None";
	opt.innerHTML = "None";
	selectrefines.appendChild(opt);
	console.log(skills["weapons"][weapon])
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
