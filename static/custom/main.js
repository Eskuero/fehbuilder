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
selectherotype = document.getElementById('herotype');
selectbeast = document.getElementById('beast');
selectmovetype = document.getElementById('movetype');
selectweapontype = document.getElementById('weapontype');
selectrefines = document.getElementById('refine');
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
selectmirror = document.getElementById('mirror');
selectbackground = document.getElementById('background');
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
// Where we render the image
canvas = document.getElementById('canvas');
// Where we show the image
fakecanvas = document.getElementById('fakecanvas');
usedallies = document.getElementById('usedalliesform');

// Some static variables
const MAXHM = 9000

// We store languages data for display of strings within the browser
languages = {};

// This array will be used as rendering queue
renderingqueue = [];

window.onload = init();

async function init() {
	// Get all data and store it
	languages[selectlanguage.value] = await fetch('/common/data/languages/unitlanguages-' + selectlanguage.value + '.json').then(response => {return response.json();});
	units = await fetch('/common/data/content/customunits.json').then(response => {return response.json();});
	skills = await fetch('/common/data/content/customskills.json').then(response => {return response.json();});
	allpassives = Object.assign({}, skills["passives"]["A"], skills["passives"]["B"], skills["passives"]["C"], skills["passives"]["S"]);
	other = await fetch('/common/data/content/customother.json').then(response => {return response.json();});

	// Build unit selects
	populateall();

	// Load the numberfont specifically since we will use it multiple times
	await getimage(other["images"]["other"]["numberfont"]).then(img => {
		numberfont = img;
	});

	// Detect which stat mode we are on
	changemode();
}
