// Dicts for info
var weapons;
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
fetch('heroes.json')
	.then(res => res.json())
	.then((out) => {
		populate(selectheroes, Object.keys(out))
}).catch(err => console.error(err));
fetch('weapons.json')
	.then(res => res.json())
	.then((out) => {
		// We store the weapons for basic checks on refines later within the browser
		weapons = out
		populate(selectweapons, Object.keys(weapons))
}).catch(err => console.error(err));
// Specials and assists json file is a simple list so we send the values instead of the keys
fetch('assists.json')
	.then(res => res.json())
	.then((out) => {
		populate(selectassists, Object.values(out))
}).catch(err => console.error(err));
fetch('specials.json')
	.then(res => res.json())
	.then((out) => {
		populate(selectspecials, Object.values(out))
}).catch(err => console.error(err));

fetch('passives.json')
	.then(res => res.json())
	.then((out) => {
		populate(selectA, Object.values(out["A"]))
		populate(selectB, Object.values(out["B"]))
		populate(selectC, Object.values(out["C"]))
		populate(selectS, Object.values(out["S"]))
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
	if (weapons[weapon]["upgrades"]) {
		if (weapons[weapon]["WeaponType"].includes("Staff")) {
			// Staffs cannot have normal refines and special ones
			if (weapons[weapon]["specialIcon"].includes("Wrathful")) {
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
		if (weapons[weapon]["specialIcon"]) {
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
