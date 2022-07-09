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
var units, skills, other;
// The whole form since is a rebspicker listeners
form = document.getElementsByClassName("form")[0];
// All selects we have available
selecthero = document.getElementById('hero');
selecttitle = document.getElementById('title');
selectmerges = document.getElementById('merges');
selectflowers = document.getElementById('flowers');
selectboons = document.getElementById('boons');
selectbanes = document.getElementById('banes');
selectascendent = document.getElementById('ascendent');
selectduoharmo = document.getElementById('duoharmo');
selectbeast = document.getElementById('beast');
selectmovetype = document.getElementById('movetype');
selectweapontype = document.getElementById('weapontype');
selectbasehero = new Rebspicker(document.getElementById('selectheroes'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectweapons = new Rebspicker(document.getElementById('weapon'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectrefines = document.getElementById('refine');
selectspecials = new Rebspicker(document.getElementById('special'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectassists = new Rebspicker(document.getElementById('assist'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectA = new Rebspicker(document.getElementById('Askill'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectB = new Rebspicker(document.getElementById('Bskill'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectC = new Rebspicker(document.getElementById('Cskill'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectS = new Rebspicker(document.getElementById('Sskill'), "single", {"None": {"string": "None"}}, [window], [form, window]);
selectblessings = document.getElementById('blessing');
selectsummoner = document.getElementById('summoner');
selectattire = document.getElementById('attire');
selectbonusunit = document.getElementById('bonusunit');
selectallies = new Rebspicker(document.getElementById('allies'), "multiple", {}, [window], [form, window]);
selecthp = document.getElementById('hp');
selectatk = document.getElementById('atk');
selectspd = document.getElementById('spd');
selectdef = document.getElementById('def');
selectres = document.getElementById('res');
selectsp = document.getElementById('sp');
selecthm = document.getElementById('hm');
selectart = document.getElementById('art');
selectoffsetY = document.getElementById('offsetY');
selectoffsetX = document.getElementById('offsetX');
selectmirror = document.getElementById('mirror');
selectexpand = document.getElementById('expand');
selectfavorite = document.getElementById('favorite');
selectaccessory = document.getElementById('accessory');
selectlanguage = document.getElementById('language');
cheats = document.getElementById('cheats');
bestskills = document.getElementById('bestskills');
appui = document.getElementById('appui');
// Stats exclusive for advanced mode
statsmode = document.getElementById('advancedmode');
selectadhp = document.getElementById('hp1');
selectadatk = document.getElementById('atk1');
selectadspd = document.getElementById('spd1');
selectaddef = document.getElementById('def1');
selectadres = document.getElementById('res1');
selectadhpgrowth = document.getElementById('hpgrowth');
selectadatkgrowth = document.getElementById('atkgrowth');
selectadspdgrowth = document.getElementById('spdgrowth');
selectaddefgrowth = document.getElementById('defgrowth');
selectadresgrowth = document.getElementById('resgrowth');
// Where we show the image
canvas = document.getElementById('fakecanvas');
usedallies = document.getElementById('usedallies');

// We store languages data for display of strings within the browser
languages = {};
// Fetch all data from each json
fetch('/common/data/languages/litelanguages-' + selectlanguage.value + '.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages[selectlanguage.value] = out;
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/content/customunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out;
				populate(selectbasehero, units, true, true);
		}).catch(err => console.error(err));
		fetch('/common/data/content/customskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out;
				// We need to have all skills available as a whole in case we use cheat seals
				allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"]);
				populateall();
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/content/customother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
		init();
}).catch(err => console.error(err));

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

	// Detect which stat mode we are on
	changemode();

	// Draw it for the first time
	reload();
}

function populateall(clean) {
	// We go through all the selects
	populate(selectweapons, skills["weapons"], clean);
	populate(selectspecials, skills["specials"], clean);
	populate(selectassists, skills["assists"], clean);
	populate(selectA, skills["passives"]["A"], clean);
	populate(selectB, skills["passives"]["B"], clean);
	populate(selectC, skills["passives"]["C"], clean);
	populate(selectS, Object.assign({}, skills["passives"]["S"], cheats.checked ? Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"]) : {}), clean);
	// Update translations
	statictranslations()
	// Make sure we don't end with invalid allies on the list
	fillblessed();
	// Disable or enable beast select based on unit
	beastcheck();
}

async function populate(select, data, clean, bypass = false) {
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
	// All data to be printed (Always add the None option with it's proper translation)
	var options = {"None": {"string": languages[selectlanguage.value]["MSID_H_NONE"]}};
	var sorted = {};
	// If indicated to bypass don't do checks for this select, print everything and leave (this is exclusively for the heroes select)
	if (bypass) {
		Object.keys(data).forEach((value) => {
			sorted[languages[selectlanguage.value]["M" + value] + ": " + (languages[selectlanguage.value][value.replace("PID", "MPID_HONOR")] || "Generic")] = value;
		});
		// Sort all the values byt visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
		var sorted = Object.keys(sorted).sort().reduce((res, key) => (res[key] = sorted[key], res), {})
		// For each entry print an option
		for (const [string, tag] of Object.entries(sorted)) {
			options[tag] = {"string": string};
		}
		// Generate the select
		select = new Rebspicker(select.domitem, "single", options, [window], [form, window]);
		// Restore the previous value if it's available on the updated select
		if ([...select.options].map(opt => opt.value).includes(previousvalue)) {
			select.value = previousvalue;
		}
		return;
	}
	// Hero info for possible later checks
	var weapontype = parseInt(selectweapontype.value);
	var movetype = parseInt(selectmovetype.value);
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
		}
		// Arriving at this check with a true add value measn we can add the option
		if (add) {
			sorted[languages[selectlanguage.value]["M" + value]] = value;
		}
	});
	// Sort all the values byt visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	var sorted = Object.keys(sorted).sort().reduce((res, key) => (res[key] = sorted[key], res), {});
	// For each entry print an option
	for (const [string, tag] of Object.entries(sorted)) {
		options[tag] = {"string": string};
	}
	// Generate the select
	select = new Rebspicker(select.domitem, "single", options, [window], [form, window]);
	// Restore the previous value if it's available on the updated select
	if ([...select.options].map(opt => opt.value).includes(previousvalue)) {
		select.value = previousvalue;
	}
	// For select of weapons once done we make sure to update the refine one
	if (select == selectweapons) {
		updateRefine();
	}
}

function beastcheck() {
	// Obtain the weapon category for the unit
	var weapontype = parseInt(selectweapontype.value);
	if (![20, 21, 22, 23].includes(weapontype)) {
		selectbeast.value = "no";
		selectbeast.disabled = true;
	} else {
		selectbeast.disabled = false;
	}
}

async function fillblessed() {
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang]) {
		await sleep(100);
	}
	// We need to know which options to restore
	var toberestored = [];
	for (let i = 0; i < selectallies.selectedOptions.length; i++) {
		toberestored.push(selectallies.selectedOptions[i].value);
	}
	// First delete all allies
	while (selectallies.lastChild) {
		selectallies.removeChild(selectallies.lastChild);
	}
	var blessingsstrings = ["MID_ITEM_BLESSING_FIRE", "MID_ITEM_BLESSING_WATER", "MID_ITEM_BLESSING_WIND", "MID_ITEM_BLESSING_EARTH", "MID_ITEM_BLESSING_LIGHT", "MID_ITEM_BLESSING_DARK", "MID_ITEM_BLESSING_HEAVEN", "MID_ITEM_BLESSING_LOGIC"];
	// All data to be printed
	var options = {};
	var sorted = {};
	// Add an option for each value
	for (const [hero, properties] of Object.entries(other["blessed"])) {
		sorted[languages[selectlanguage.value]["M" + hero] + ": " + languages[selectlanguage.value][hero.replace("PID", "MPID_HONOR")]] = hero;
	}
	// Sort all the values by visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	var sorted = Object.keys(sorted).sort().reduce((res, key) => (res[key] = sorted[key], res), {});
	// For each entry print an option
	for (const [string, tag] of Object.entries(sorted)) {
		options[tag] = {
			"string": string,
			"keywords": languages[newlang][blessingsstrings[other["blessed"][tag]["blessing"]-1]]
		};
	}
	selectallies = new Rebspicker(document.getElementById('allies'), "multiple", options, [window], [form, window], toberestored);
}

function showallies() {
	var allies = {};
	// Create inputs for every selected ally
	for (let i = 0; i < selectallies.selectedOptions.length; i++) {
		let ally = selectallies.selectedOptions[i].value;
		// If the ally already exists add the current value to prevent losing data
		allies[ally] = document.getElementById(ally) ? document.getElementById(ally).value : 1;
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

function swapskill(caller, target) {
	// Switch the selected option in the tabs by changing the background color
	var options = document.getElementsByClassName("tabs")[0].children;
	for (let i = 0; i < options.length; i++) {
		if (options[i] == caller) {
			options[i].className = "imagelabel selected";
		} else {
			options[i].className = "imagelabel";
		}
	}

	// Only some type of skills types allow changing of the icon
	var options = ["refine", "Askill", "Bskill", "Cskill", "Sskill"];
	if (options.includes(target)) {
		// Always first make sure the row is actually visible
		document.getElementById("skill-icon").style.display = "flex";
		// Now for each individual skill decide whether to show it or not
		for (let i = 0; i < options.length; i++) {
			if (options[i] == target) {
				document.getElementById("icon" + options[i]).style.display = "initial";
			} else {
				document.getElementById("icon" + options[i]).style.display = "none";
			}
		}
	} else {
		document.getElementById("skill-icon").style.display = "none";
	}

	// Everyone but refines allows changing the name
	var options = ["weapon", "assist", "special", "Askill", "Bskill", "Cskill", "Sskill"];
	if (target != "refine") {
		// Always first make sure the row is actually visible
		document.getElementById("skill-name").style.display = "flex";
		// Now for each individual skill decide whether to show it or not
		for (let i = 0; i < options.length; i++) {
			if (options[i] == target) {
				document.getElementById("name" + options[i]).style.display = "initial";
			} else {
				document.getElementById("name" + options[i]).style.display = "none";
			}
		}
	} else {
		document.getElementById("skill-name").style.display = "none";
	}

	// All types of skills allow modifying the visible stats except for assists and passives
	var options = ["weapon", "refine", "Askill", "Bskill", "Cskill", "Sskill"];
	var stats = ["hp", "atk", "spd", "def", "res"];
	if (options.includes(target)) {
		// Always first make sure the row is actually visible
		document.getElementById("skill-stats").style.display = "flex";
		// Now for each individual skill decide whether to show it or not
		for (let i = 0; i < options.length; i++) {
			if (options[i] == target) {
				for (let j = 0; j < stats.length; j++) {
					document.getElementById(stats[j] + options[i]).style.display = "initial";
				}
			} else {
				for (let j = 0; j < stats.length; j++) {
					document.getElementById(stats[j] + options[i]).style.display = "none";
				}
			}
		}
	} else {
		document.getElementById("skill-stats").style.display = "none";
	}

	// For all skills now swap their selects
	var options = ["weapon", "refine", "assist", "special", "Askill", "Bskill", "Cskill", "Sskill"];
	for (let i = 0; i < options.length; i++) {
		if (options[i] == target) {
			document.getElementById(options[i]).style.display = "block";
		} else {
			document.getElementById(options[i]).style.display = "none";
		}
	}
}

// Update the values in the inputs given a base skill
function updatebases(caller) {
	// Everyone but refines allows changing the name
	var options = ["weapon", "assist", "special", "Askill", "Bskill", "Cskill", "Sskill"];
	if (options.includes(caller.id)) {
		document.getElementById("name" + caller.id).value = caller.value != "None" ? languages[selectlanguage.value]["M" + caller.value] : "";
	}
	// All types of skills allow modifying the visible stats except for assists and passives
	var options = ["weapon", "refine", "Askill", "Bskill", "Cskill", "Sskill"];
	var stats = ["hp", "atk", "spd", "def", "res"];

	// Apply the stats from the selected weapon
	if (caller.id == "weapon") {
		for (let i = 0; i < stats.length; i++) {
			document.getElementById(stats[i] + "weapon").value = caller.value != "None" ? skills["weapons"][caller.value]["statModifiers"][i] : 0;
		}
	}

	// Apply offsetting values on the refine stats inputs (weapon refine modifiers - base weapon)
	if (caller.id == "refine") {
		for (let i = 0; i < stats.length; i++) {
			document.getElementById(stats[i] + "refine").value = caller.value != "None" ? skills["weapons"][selectweapons.value]["refines"][caller.value]["statModifiers"][i] - skills["weapons"][selectweapons.value]["statModifiers"][i] : 0;
		}
	}

	// Apply the stats from the selected skill
	if (["Askill", "Bskill", "Cskill", "Sskill"].includes(caller.id)) {
		for (let i = 0; i < stats.length; i++) {
			document.getElementById(stats[i] + caller.id).value = caller.value != "None" ? allpassives[caller.value]["statModifiers"][i] : 0;
		}
	}
}

function changetype(caller) {
	// Compose the weapon/move url
	var url = "/common/other/" + caller.value + "-" + caller.id.slice(0, -4) + ".webp";
	// Now change the url on the imagelabel
	document.getElementById(caller.id.slice(0, -4) + "icon").src = url;
}

function filldefaults() {
	// Get current language and base hero
	var language = selectlanguage.value;
	var defaulthero = selectbasehero.value;
	// If we switched to no base hero return to default values
	if (defaulthero == "None") {
		selecthero.value = "";
		selecttitle.value = "";
		selectadhp.value = "18";
		selectadatk.value = "7";
		selectadspd.value = "8";
		selectaddef.value = "6";
		selectadres.value = "5";
		selectadhpgrowth.value = "45";
		selectadatkgrowth.value = "50";
		selectadspdgrowth.value = "60";
		selectaddefgrowth.value = "35";
		selectadresgrowth.value = "50";
	// Else place all the values corresponding to name, title, stats (+2 because we are storing rarity 1), growths, move and weapon types
	} else {
		selecthero.value = languages[language]["M" + defaulthero];
		selecttitle.value = languages[language][defaulthero.replace("PID", "MPID_HONOR")];
		selectadhp.value = units[defaulthero]["stats"][0] + 2;
		selectadatk.value = units[defaulthero]["stats"][1] + 2;
		selectadspd.value = units[defaulthero]["stats"][2] + 2;
		selectaddef.value = units[defaulthero]["stats"][3] + 2;
		selectadres.value = units[defaulthero]["stats"][4] + 2;
		selectadhpgrowth.value = units[defaulthero]["growths"][0];
		selectadatkgrowth.value = units[defaulthero]["growths"][1];
		selectadspdgrowth.value = units[defaulthero]["growths"][2];
		selectaddefgrowth.value = units[defaulthero]["growths"][3];
		selectadresgrowth.value = units[defaulthero]["growths"][4];
		selectmovetype.value = units[defaulthero]["moveType"];
		selectweapontype.value = units[defaulthero]["WeaponType"];
	}
	// Make sure we update the images on the move/weapon type selects and enable or disable the best selector if necessary
	changetype(selectmovetype);
	changetype(selectweapontype);
	beastcheck();
	// Make sure we enable advanced mode to show the proper stats modifiers
	statsmode.checked = "true";
	changemode();
}

function changemode() {
	if (statsmode.checked) {
		document.getElementById("smallstats").style.display = "none";
		document.getElementById("advancedstats").style.display = "flex";
	} else {
		document.getElementById("smallstats").style.display = "flex";
		document.getElementById("advancedstats").style.display = "none";
	}
}

async function statictranslations() {
	// If the language required is not downloaded yet wait a bit more
	var newlang = selectlanguage.value;
	while (!languages[newlang]) {
		await sleep(100);
	}
}
