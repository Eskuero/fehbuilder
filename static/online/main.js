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
var units, skills, other, languages;
// Where we render the image
canvas = document.getElementById('canvas');
// Where we show the image
fakecanvas = document.getElementById('fakecanvas');
// The whole form since is a rebspicker listeners
form = document.getElementsByClassName("form")[0];
// All selects we have available
selectrarity = document.getElementById('rarity');
selectmerges = document.getElementById('merges');
selectflowers = document.getElementById('flowers');
selectboons = document.getElementById('boons');
selectbanes = document.getElementById('banes');
selectascendent = document.getElementById('ascendent');
selectbeast = document.getElementById('beast');
selectrefines = document.getElementById('refine');
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
selectmirror = document.getElementById('mirror');
selectbackground = document.getElementById('background');
selectfavorite = document.getElementById('favorite');
selectaccessory = document.getElementById('accessory');
selectlanguage = document.getElementById('language');
cheats = document.getElementById('cheats');
bestskills = document.getElementById('bestskills');
appui = document.getElementById('appui');
selecttemplate = document.getElementById('template');
usedallies = document.getElementById('usedalliesform');
selectatkpairup = document.getElementById("atk-pairup");
selectspdpairup = document.getElementById("spd-pairup");
selectdefpairup = document.getElementById("def-pairup");
selectrespairup = document.getElementById("res-pairup");

// We store languages data for display of strings within the browser
languages = {};

// Which builder slot is active right now
buildslot = 0;
	// Initial data for each build slot
builds = [
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","base","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","base","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","base","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","base","1","None", true],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,8000,"Portrait","MyUnit","0","0","None","base","1","None", true]
];

// Dialog to manage your barracks
barracksdialog = document.getElementById("barracksdialog");
// Try to get all saved units
if (localStorage.getItem('barracks')) {
	barracks = JSON.parse(localStorage.getItem('barracks'));
// Or setup it up
} else {
	barracks = {};
	localStorage.setItem('barracks', JSON.stringify(barracks));
}

// Fetch all the game data from each json
fetch('/common/data/languages/fulllanguages-' + selectlanguage.value + '.json')
	.then(res => res.json())
	.then((out) => {
		// We store languages data for display of strings within the browser
		languages[selectlanguage.value] = out;
		// We can download the rest of the data now that lenguages are available
		fetch('/common/data/content/fullunits.json')
			.then(res => res.json())
			.then((out) => {
				// We store the heroes for basic checks within the browser
				units = out;
				fetch('/common/data/content/fullskills.json')
					.then(res => res.json())
					.then((out) => {
						// We store the skills for basic checks within the browser
						skills = out;
						// We need to have all skills available as a whole in case we use cheat seals
						allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"]);
						fetch('/common/data/content/fullother.json')
							.then(res => res.json())
							.then((out) => {
								// We store other data for basic checks within the browser
								other = out;
                                // We finished downloading all data
								init();
						}).catch(err => console.error(err));
				}).catch(err => console.error(err));
		}).catch(err => console.error(err));
}).catch(err => console.error(err));

async function init() {
    loadbarracks();
	await populateall();
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
}