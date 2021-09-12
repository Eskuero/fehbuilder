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
var units, languages, other, permapools;
// All heroes to add
targets = [];
// Amount of heroes we have gone without a 5 star
pityrun = 0;
select5focus = document.getElementById('5starfocus');
select4focus = document.getElementById('4starfocus');
targetsui = document.getElementById('targets');
selectlanguage = document.getElementById('language');
method = document.getElementById('method');
// Base gacha percents
focus5 = document.getElementById('focus5');
offfocus5 = document.getElementById('offfocus5');
focus4 = document.getElementById('focus4');
special4 = document.getElementById('special4');
offfocus4 = document.getElementById('offfocus4');
offfocus3 = document.getElementById('offfocus3');
// Pity gacha percents
pityfocus5 = document.getElementById('pityfocus5');
pityofffocus5 = document.getElementById('pityofffocus5');
pityfocus4 = document.getElementById('pityfocus4');
pityspecial4 = document.getElementById('pityspecial4');
pityofffocus4 = document.getElementById('pityofffocus4');
pityofffocus3 = document.getElementById('pityofffocus3');

// Fetch all data from each json
fetch('/common/data/litelanguages.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages = out
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/summonunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out
				populate(select5focus, units)
				populate(select4focus, units)
				fetch('/common/data/summonpools.json')
					.then(res => res.json())
					.then((out) => {
						// We store summoning pool data
						permapools = out;
						// Now that everything is loaded we can init
						init();
				}).catch(err => console.error(err));
		}).catch(err => console.error(err));
}).catch(err => console.error(err));
fetch('/common/data/summonother.json')
	.then(res => res.json())
	.then((out) => {
		// We store other data for basic checks within the browser
		other = out;
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

async function init() {
	// Obtain the object
	var preview = document.getElementById("fakecanvas").getContext("2d");

	// Print the background
	await getimage("/common/other/summoningaltar.webp").then(img => {
		preview.drawImage(img, -173, 0, 1067, 1280);
	})
}

function populate(select, data) {
	// Get current value to restore it back if possible
	previousvalue = select.value
	// First delete them all
	while (select.lastChild) {
		select.removeChild(select.lastChild);
	}
	// All data to be printed
	options = {}
	Object.keys(data).forEach((value) => {
		options[languages[selectlanguage.value]["M" + value] + ": " + (languages[selectlanguage.value][value.replace("PID", "MPID_HONOR")] || "Generic")] = value
	});
	// Sort all the values by visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
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

function changetargets() {
	// All heroes to add
	targets = [];
	// Add 5 start focuses
	for (i = 0; i < select5focus.selectedOptions.length; i++) {
		targets.push(select5focus.selectedOptions[i].value);
	}
	// Add 4 star focuses
	for (i = 0; i < select4focus.selectedOptions.length; i++) {
		// Make sure we are not adding duplicates
		if (!targets.includes(select4focus.selectedOptions[i].value))
			targets.push(select4focus.selectedOptions[i].value);
	}
	// Always delete all current options to make a clean rebuild
	while (targetsui.lastChild) {
		targetsui.removeChild(targetsui.lastChild);
	}
	// Loop through all the targets and add each option in groups of two
	for (i = 0; i < targets.length; i = i + 2) {
		// Major div element
		var container = document.createElement("div");
		container.className = "row-property double";
		// Add the first element of this iteration
		var element1img = document.createElement("img");
		element1img.className = "imagelabel"; element1img.src = "/common/faces/" + targets[i] + ".webp";
		container.appendChild(element1img);
		var element1input = document.createElement("input");
		element1input.setAttribute("type", "number"); element1input.id = targets[i]; element1input.value = 1;
		container.appendChild(element1input);
		// Add another element if it actually exists
		if (targets[i+1]) {
			var element2img = document.createElement("img");
			element2img.className = "imagelabel"; element2img.src = "/common/faces/" + targets[i+1] + ".webp";
			container.appendChild(element2img);
			var element2input = document.createElement("input");
			element2input.setAttribute("type", "number"); element2input.id = targets[i+1]; element2input.value = 1;
			container.appendChild(element2input);
		}
		// Finally append the line to the targets section
		targetsui.appendChild(container);
	}
}

function reset() {
	// Resete pity
	pityrun = 0;
	// Update all the values from the current pity using the newly defined ones
	percentages = ["focus5", "offfocus5", "focus4", "special4", "offfocus4", "offfocus3"]
	for (i = 0; i < percentages.length; i++) {
		document.getElementById("pity" + percentages[i]).value = document.getElementById(percentages[i]).value;
	}
}
