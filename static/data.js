// Dicts for info
var units, skills, other, languages;
// All selects we have available
selectheroes = document.getElementById('selectheroes');
selectrarity = document.getElementById('rarity');
selectmerges = document.getElementById('merges');
selectflowers = document.getElementById('flowers');
selectboons = document.getElementById('boons');
selectbanes = document.getElementById('banes');
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

// Once the document is ready initiate the selects with their required
$(document).ready(function() {
	$('.s2-select').select2({
		templateResult: copyClassesToSelect2,
		width: '100%'
	});
	// For small selects do not enable the search box
	$(".s2-select-without-search").select2({
		minimumResultsForSearch: Infinity,
		width: '100%'
	});
});

// FIXME: Workaround for https://github.com/select2/select2/issues/5993 when using JQuery 3.6
$(document).on("select2:open", () => {
	document.querySelector(".select2-container--open .select2-search__field").focus()
})

// Fetch all data from each json
fetch('litelanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out
		// We can download the rest of the data now that lenguages are available
		fetch('liteunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out
				populate(selectheroes, units, true, true)
		}).catch(err => console.error(err));
		fetch('liteskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out
				populateall()
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('liteother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out
}).catch(err => console.error(err));

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

function reload(scroll = true) {
	// Obtain the list of support heroes
	allies = "";
	for (i = 0; i < selectallies.selectedOptions.length; i++) {
		allies += selectallies.selectedOptions[i].value + "|"
	}
	// Obtain the visible buffs
	buffs = selectatk.value + ";" + selectspd.value + ";" + selectdef.value + ";" + selectres.value
	// Change the URL of the img to force it to reload
	document.getElementById('fakecanvas').src = "/get_image.png?name=" + encodeURIComponent(selectheroes.value) + "&rarity=" + selectrarity.value + "&merges=" + selectmerges.value + "&flowers=" + selectflowers.value + "&boon=" + selectboons.value + "&bane=" + selectbanes.value + "&beast=" + selectbeast.value + "&weapon=" + encodeURIComponent(selectweapons.value) + "&refine=" + selectrefines.value + "&assist=" + encodeURIComponent(selectassists.value) + "&special=" + encodeURIComponent(selectspecials.value) + "&passiveA=" + encodeURIComponent(selectA.value) + "&passiveB=" + encodeURIComponent(selectB.value) + "&passiveC=" + encodeURIComponent(selectC.value) + "&passiveS=" + encodeURIComponent(selectS.value) + "&blessing=" + selectblessings.value + "&summoner=" + selectsummoner.value + "&attire=" + selectattire.value + "&appui=" + appui.checked + "&bonusunit=" + selectbonusunit.value + "&allies=" + encodeURIComponent(allies) + "&buffs=" + encodeURIComponent(buffs) + "&sp=" + selectsp.value + "&hm=" + selecthm.value + "&artstyle=" + selectartstyle.value + "&offsetY=" + selectoffsetY.value + "&offsetX=" + selectoffsetX.value + "&favorite=" + selectfavorite.value + "&accessory=" + selectaccessory.value + "&language=" + selectlanguage.value;
	// Autoscroll all the way up so the user can inmediately see the hero preview on portrait screens
	if (scroll) {
		window.scrollTo(0, 0);
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
		selectbeast.dispatchEvent(new Event('change'));
	} else {
		selectbeast.disabled = false;
	}
}

function validblessing() {
	// Check if the hero is listed as pre-blessed and update and lock
	if (other["blessed"][selectheroes.value]) {
		selectblessings.value = other["blessed"][selectheroes.value]["blessing"];
		selectblessings.disabled = true;
		selectblessings.dispatchEvent(new Event('change'));
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

// Data for each build slot
builds = [
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","1","None", true],
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","1","None", true],
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","1","None", true],
	["None", false, true, "USEN", "None", "None", [],"5","0","0","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0",9999,7000,"Portrait","0","0","1","None", true]
]
// List of values to be restored (their document element)
selects = [selectrarity,selectmerges, selectflowers, selectboons, selectbanes, selectbeast, selectrefines, selectspecials, selectassists, selectA, selectB, selectC, selectS, selectsummoner, selectattire, selectbonusunit, selectatk, selectspd, selectdef, selectres, selectsp, selecthm, selectartstyle, selectoffsetY, selectoffsetX, selectfavorite, selectaccessory, appui]
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
	// Restore changes to current slot (heroes select, cheats and maxskill setting are to be done first because they affect the content of other selects)
	selectheroes.value = builds[buildslot][0];
	cheats.checked = builds[buildslot][1];
	bestskills.checked = builds[buildslot][2];
	selectlanguage.value = builds[buildslot][3];
	// Trigger a rebuild of the selects based on the filters set
	selectlanguage.dispatchEvent(new Event('change'));
	// Trigger a rebuild of the refine select based on the selection of weapon
	selectweapons.value = builds[buildslot][4];
	selectweapons.dispatchEvent(new Event('change'));
	// Trigger a rebuild of the allies select based on the selection of blessing
	selectblessings.value = builds[buildslot][5];
	selectblessings.dispatchEvent(new Event('change'));
	for (i = 0; i < selectallies.options.length; i++) {
		if (builds[buildslot][6].includes(selectallies.options[i].value)) {
			selectallies.options[i].selected = true;
		}
	}
	selectallies.dispatchEvent(new Event('change'));
	// Now restore the rest of the data
	for (i = 0; i < selects.length; i++) {
		if (selects[i].type == "checkbox") {
			selects[i].checked = builds[buildslot][i+7];
		} else {
			$('#'+selects[i].id).val(builds[buildslot][i+7]).trigger('change');
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
