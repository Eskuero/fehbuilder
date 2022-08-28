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

async function populateall() {
	select5focus = await populate(select5focus, units, false);
	select4focus = await populate(select4focus, units, false);
}

async function populate(origin, data, clean, toberestored = []) {
	var newlang = selectlanguage.value;
	// Get current value to restore it back if possible
	if (!clean) {
		for (let i = 0; i < origin.selectedOptions.length; i++) {
			toberestored.push(origin.selectedOptions[i].value);
		}
		origin = origin.domitem;
	}
	// First delete them all
	while (origin.lastChild) {
		origin.removeChild(origin.lastChild);
	}
	// All data to be printed
	var options = {};
	var sorted = {};
	Object.keys(data).forEach((value) => {
		sorted[languages[newlang]["M" + value] + ": " + (languages[newlang][value.replace("PID", "MPID_HONOR")] || "Generic")] = value
	});
	// Sort all the values by visible string (https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html)
	sorted = Object.keys(sorted).sort().reduce((res, key) => (res[key] = sorted[key], res), {})
	// Obtain the final data object that rebspicker can read
	for (const [string, tag] of Object.entries(sorted)) {
		options[tag] = {"string": string};
		if (other["duokeywords"][tag]) {
			options[tag]["keywords"] = other["duokeywords"][tag];
		}
	}
	var select = new Rebspicker(origin, "multiple", options, toberestored);
	return select;
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
		element1img.className = "dinamiclabel"; element1img.src = "/common/faces/" + targets[i] + ".webp";
		container.appendChild(element1img);
		var element1input = document.createElement("input");
		element1input.setAttribute("type", "number"); element1input.id = targets[i]; element1input.value = 1;
		container.appendChild(element1input);
		// Add another element if it actually exists
		if (targets[i+1]) {
			var element2img = document.createElement("img");
			element2img.className = "dinamiclabel"; element2img.src = "/common/faces/" + targets[i+1] + ".webp";
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
