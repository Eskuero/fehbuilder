// Dicts for info
var units, skills, other, languages;
// All selects we have available
selecthero = document.getElementById('hero');
selectrarity = document.getElementById('rarity');
selectmerges = document.getElementById('merges');
selectflowers = document.getElementById('flowers');
selectboons = document.getElementById('boons');
selectbanes = document.getElementById('banes');
selectbeast = document.getElementById('beast');
selectmovetype = document.getElementById('movetype');
selectweapontype = document.getElementById('weapontype');
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
selectexpand = document.getElementById('expand');
selectfavorite = document.getElementById('favorite');
selectaccessory = document.getElementById('accessory');
selectlanguage = document.getElementById('language');
cheats = document.getElementById('cheats');
bestskills = document.getElementById('bestskills');
appui = document.getElementById('appui');
// Where we show the image
var canvas = document.getElementById('fakecanvas');

// Fetch all data from each json
fetch('/common/data/customlanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out;
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/customskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out;
				// We need to have all skills available as a whole in case we use cheat seals
				allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"])
				populateall();
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/customother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
		reload();
}).catch(err => console.error(err));

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
	// Update translations
	statictranslations()
	// Make sure we don't end with invalid allies on the list
	reblessed()
	// Disable or enable beast select based on unit
	beastcheck()
}

function populate(select, data, clean) {
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
	// Hero info for possible later checks
	weapontype = parseInt(selectweapontype.value);
	movetype = parseInt(selectmovetype.value);
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
		select.appendChild(opt);
	}
	// Restore the previous value if it's available on the updated select
	if ([...select.options].map(opt => opt.value).includes(previousvalue)) {
		select.value = previousvalue;
	}
}

function beastcheck() {
	// Obtain the weapon category for the unit
	weapontype = parseInt(selectweapontype.value);
	if (![20, 21, 22, 23].includes(weapontype)) {
		selectbeast.value = "no";
		selectbeast.disabled = true;
	} else {
		selectbeast.disabled = false;
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
		if (other["blessed"][selecthero.value]) {
			if ((blessing > 4 && properties["blessing"] > 4) || (blessing < 5 && properties["blessing"] < 5)) {
				continue;
			}
		} else if (blessing != properties["blessing"]) {
			continue;
		}
		// Depending on the type of blessing there's a limit on allies (for preblessed we do the opposite). For arena blessings the limit is always 3, for aether raids the limit is 6 for extra slot heroes and 5 for older ones
		if (other["blessed"][selecthero.value]) {
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
	if (other["blessed"][selecthero.value]) {
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
	// Get the list of refines for that weapon
	refines = Object.keys(skills["weapons"][weapon]["refines"])
	for (i = 0; i < refines.length; i++) {
		var opt = document.createElement('option');
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
	options = document.getElementsByClassName("tabs")[0].children;
	for (i = 0; i < options.length; i++) {
		if (options[i] == caller) {
			options[i].className = "imagelabel selected";
		} else {
			options[i].className = "imagelabel";
		}
	}

	// Only some type of skills types allow changing of the icon
	options = ["refine", "Askill", "Bskill", "Cskill", "Sskill"]
	if (options.includes(target)) {
		// Always first make sure the row is actually visible
		document.getElementById("skill-icon").style.display = "flex";
		// Now for each individual skill decide whether to show it or not
		for (i = 0; i < options.length; i++) {
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
	options = ["weapon", "assist", "special", "Askill", "Bskill", "Cskill", "Sskill"];
	if (target != "refine") {
		// Always first make sure the row is actually visible
		document.getElementById("skill-name").style.display = "flex";
		// Now for each individual skill decide whether to show it or not
		for (i = 0; i < options.length; i++) {
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
	options = ["weapon", "refine", "Askill", "Bskill", "Cskill", "Sskill"];
	stats = ["hp", "atk", "spd", "def", "res"];
	if (options.includes(target)) {
		// Always first make sure the row is actually visible
		document.getElementById("skill-stats").style.display = "flex";
		// Now for each individual skill decide whether to show it or not
		for (i = 0; i < options.length; i++) {
			if (options[i] == target) {
				for (j = 0; j < stats.length; j++) {
					document.getElementById(stats[j] + options[i]).style.display = "initial";
				}
			} else {
				for (j = 0; j < stats.length; j++) {
					document.getElementById(stats[j] + options[i]).style.display = "none";
				}
			}
		}
	} else {
		document.getElementById("skill-stats").style.display = "none";
	}

	// For all skills now swap their selects
	options = ["weapon", "refine", "assist", "special", "Askill", "Bskill", "Cskill", "Sskill"];
	for (i = 0; i < options.length; i++) {
		if (options[i] == target) {
			document.getElementById(options[i]).parentElement.style.display = "initial";
		} else {
			document.getElementById(options[i]).parentElement.style.display = "none";
		}
	}
}

// Update the values in the inputs given a base skill
function updatebases(caller) {
	// Everyone but refines allows changing the name
	options = ["weapon", "assist", "special", "Askill", "Bskill", "Cskill", "Sskill"];
	if (options.includes(caller.id)) {
		document.getElementById("name" + caller.id).value = caller.value != "None" ? languages[selectlanguage.value]["M" + caller.value] : "";
	}
	// All types of skills allow modifying the visible stats except for assists and passives
	options = ["weapon", "refine", "Askill", "Bskill", "Cskill", "Sskill"];
	stats = ["hp", "atk", "spd", "def", "res"];

	// Apply the stats from the selected weapon
	if (caller.id == "weapon") {
		for (i = 0; i < stats.length; i++) {
			document.getElementById(stats[i] + "weapon").value = caller.value != "None" ? skills["weapons"][caller.value]["statModifiers"][i] : 0;
		}
	}

	// Apply offsetting values on the refine stats inputs (weapon refine modifiers - base weapon)
	if (caller.id == "refine") {
		for (i = 0; i < stats.length; i++) {
			document.getElementById(stats[i] + "refine").value = caller.value != "None" ? skills["weapons"][selectweapons.value]["refines"][caller.value]["statModifiers"][i] - skills["weapons"][selectweapons.value]["statModifiers"][i] : 0;
		}
	}

	// Apply the stats from the selected skill
	if (["Askill", "Bskill", "Cskill", "Sskill"].includes(caller.id)) {
		for (i = 0; i < stats.length; i++) {
			document.getElementById(stats[i] + caller.id).value = caller.value != "None" ? allpassives[caller.value]["statModifiers"][i] : 0;
		}
	}
}

function changetype(caller) {
	// Compose the weapon/move url
	url = "/common/other/" + caller.value + "-" + caller.id.slice(0, -4) + ".png";
	// Now change the url on the imagelabel
	document.getElementById(caller.id.slice(0, -4) + "icon").src = url;
}

function statictranslations() {
}
