// Fetch all data from each json
fetch('/common/data/litelanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/liteunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out
				populate(selectheroes, units, true, true)
		}).catch(err => console.error(err));
		fetch('/common/data/liteskills.json')
			.then(res => res.json())
			.then((out) => {
				// We store the skills for basic checks within the browser
				skills = out
				populateall()
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/liteother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out
}).catch(err => console.error(err));

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