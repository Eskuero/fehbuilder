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
// Loading circle
loadingoverlay = document.getElementById('loadingoverlay');
// Placeholder initial preview
preview = document.getElementById('preview');
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
selectemblemhero = document.getElementById('emblemhero');
selectemblemmerges = document.getElementById('emblemmerges');
selectblessings = document.getElementById('blessing');
selectlevel = document.getElementById("level");
selectsummoner = document.getElementById('summoner');
selectattire = document.getElementById('attire');
selectbonusunit = document.getElementById('bonusunit');
selectallies = document.getElementById('allies');
selectaide = document.getElementById('aide');
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
selectotherworldbond = document.getElementById("otherworldbond");

// Some static variables
const MAXHM = 9000
const MAXFLOWERS = 35

// We store languages data for display of strings within the browser
languages = {};

// Which builder slot is active right now
buildslot = 0;
	// Initial data for each build slot
builds = [
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","0","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,MAXHM,"Portrait","MyUnit","0","0","None","base","1","None", "", true, "level40", "no"],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","0","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,MAXHM,"Portrait","MyUnit","0","0","None","base","1","None", "", true, "level40", "no"],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","0","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,MAXHM,"Portrait","MyUnit","0","0","None","base","1","None", "", true, "level40", "no"],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","0","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,MAXHM,"Portrait","MyUnit","0","0","None","base","1","None", "", true, "level40", "no"],
	["None", false, true, "USEN", "None", "None", {},"5","0","0","None","None","None","no","None","None","None","0","None","None","None","None","None","None","None","Normal","no","0","0","0","0","0","0","0","0",9999,MAXHM,"Portrait","MyUnit","0","0","None","base","1","None", "", true, "level40", "no"]
];

// This array will be used as rendering queue
renderingqueue = [];

// Try to get all saved units
if (localStorage.getItem('barracks')) {
	barracks = JSON.parse(localStorage.getItem('barracks'));
// Or setup it up
} else {
	barracks = {};
	localStorage.setItem('barracks', JSON.stringify(barracks));
}

window.onload = init();

async function init() {
	// Get all data and store it
	languages[selectlanguage.value] = await fetch('/common/data/languages/unitlanguages-' + selectlanguage.value + '.json').then(response => {return response.json();});
	units = await fetch('/common/data/content/onlineunits.json').then(response => {return response.json();});
	skills = await fetch('/common/data/content/onlineskills.json').then(response => {return response.json();});
	allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"], skills["passives"]["X"]);
	other = await fetch('/common/data/content/onlineother.json').then(response => {return response.json();});

	// Build barrack and unit selects
	loadbarracks();
	populateall();

	// Load the numberfont specifically since we will use it multiple times
	await getimage(other["images"]["other"]["numberfont"]).then(img => {
		numberfont = img;
	});
}
