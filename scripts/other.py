# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import os
import json

def work():
	# All data
	other = {
		"blessed": {},
		"duo": [],
		"resonant": [],
		"duokeywords": duokeywords,
		"images": images
	}

	# Get all the files that contain unit definitions and loop through them
	files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Person/")
	for file in files:
		with open("feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
			data = json.load(datasource)
			# Only use the entries where the legendary field is not null
			for entry in [entry for entry in data if entry["legendary"]]:
				if entry["legendary"]["element"] > 0:
					other["blessed"][entry["id_tag"]] = {
						"blessing": entry["legendary"]["element"],
						"boosts": [value for value in entry["legendary"]["bonus_effect"].values()],
						"variant": "-".join([stat for stat, value in entry["legendary"]["bonus_effect"].items() if value > 0 and stat != "hp"]) + ("pairup" if entry["legendary"]["pair_up"] else ("-extrae" if entry["legendary"]["ae_extra"] else ""))
					}
				# If the unit doesn't have element but is of kind 2 or 3 is a duo hero
				elif entry["legendary"]["kind"] in [2, 3]:
					other["duo" if entry["legendary"]["kind"] == 2 else "resonant"].append(entry["id_tag"])

	with open("fullother.json", "w") as outfile:
		json.dump(other, outfile)

	# Smaller version for offline wiki builder
	otherlite = {
		"blessed": {
			hero: {
				property: value
				for property, value in properties.items() if property in ["blessing", "variant"]
			}
			for hero, properties in other["blessed"].items()
		},
		"duokeywords": duokeywords
	}
	with open("liteother.json", "w") as outfile:
		json.dump(otherlite, outfile)

	# Even smaller version for summoning
	othersummon = {
		"duokeywords": duokeywords
	}
	with open("summonother.json", "w") as outfile:
		json.dump(othersummon, outfile)

	# Altenative version for custom unit builder
	othercustom = {
		"blessed": other["blessed"],
		"duo": other["duo"],
		"resonant": other["resonant"],
		"images": images
	}
	with open("customother.json", "w") as outfile:
		json.dump(othercustom, outfile)

# We tie each PID with the names of the pairs for duo heroes
duokeywords = {
	"PID_\u6bd4\u7ffc\u30ea\u30fc\u30f4": "thrasir \u30b9\u30e9\u30b7\u30eb \u53f2\u83c8\u5e0c\u723e alfonse \u30a2\u30eb\u30d5\u30a9\u30f3\u30b9 \u963f\u723e\u99ae\u65af veronica \u30f4\u30a7\u30ed\u30cb\u30ab \u7dad\u6d1b\u59ae\u5361",
	"PID_\u6bd4\u7ffc\u30d2\u30eb\u30c0": " marianne \u30de\u30ea\u30a2\u30f3\u30cc \u746a\u8389\u5b89\u5974",
	"PID_\u6bd4\u7ffc\u30d8\u30af\u30c8\u30eb": "lilina \u30ea\u30ea\u30fc\u30ca \u8389\u8389\u5a1c",
	"PID_\u6bd4\u7ffc\u30a8\u30d5\u30e9\u30e0": "lyon \u30ea\u30aa\u30f3 \u5229\u6602",
	"PID_\u6bd4\u7ffc\u30de\u30eb\u30b9": "caeda shiida \u30b7\u30fc\u30c0 \u5e0c\u9054",
	"PID_\u6bd4\u7ffc\u30a2\u30eb\u30d5\u30a9\u30f3\u30b9": "sharena \u30b7\u30e3\u30ed\u30f3 \u590f\u84c9",
	"PID_\u6bd4\u7ffc\u30a2\u30eb\u30e0": "celica \u30bb\u30ea\u30ab \u8cfd\u8389\u5361",
	"PID_\u6bd4\u7ffc\u30a4\u30c9\u30a5\u30f3": "fae \u30d5\u30a1 \u6cd5",
	"PID_\u6bd4\u7ffc\u30d1\u30aa\u30e9": "est esther \u30a8\u30b9\u30c8 \u611b\u7d72\u7279 catria \u30ab\u30c1\u30e5\u30a2 \u5361\u79cb\u96c5",
	"PID_\u6bd4\u7ffc\u30df\u30ab\u30e4": "sothe \u30b5\u30b6 \u85a9\u672d",
	"PID_\u53cc\u754c\u30ef\u30e6": "lucina \u30eb\u30ad\u30ca \u9732\u742a\u5a1c",
	# TODO: Rhea japanese and chinese names?
	"PID_\u6bd4\u7ffc\u30d9\u30ec\u30b9": "seiros \u30bb\u30a4\u30ed\u30b9 \u8cfd\u7f85\u53f8 rhea",
	"PID_\u53cc\u754c\u30f4\u30a7\u30ed\u30cb\u30ab": "xander \u30de\u30fc\u30af\u30b9 \u99ac\u514b\u65af",
	"PID_\u6bd4\u7ffc\u30b7\u30b0\u30eb\u30c9": "deirdre \u30c7\u30a3\u30a2\u30c9\u30e9 \u8fea\u96c5\u6735\u62c9",
	"PID_\u53cc\u754c\u30c1\u30ad": "ninian \u30cb\u30cb\u30a2\u30f3 \u5c3c\u5c3c\u5b89",
	"PID_\u6bd4\u7ffc\u30ea\u30f3": "florina \u30d5\u30ed\u30ea\u30fc\u30ca \u8299\u7f85\u5229\u5a1c",
	"PID_\u53cc\u754c\u30b7\u30fc\u30c0": "plumeria \u30d7\u30eb\u30e1\u30ea\u30a2 \u666e\u8def\u6885\u8389\u4e9e",
	"PID_\u53cc\u754c\u30aa\u30eb\u30c6\u30a3\u30ca": "sanaki \u30b5\u30ca\u30ad \u838e\u5a1c\u742a",
	"PID_\u53cc\u754c\u30c9\u30ed\u30c6\u30a2": "lene \u30ea\u30fc\u30f3 \u7433\u6069",
	"PID_\u6bd4\u7ffc\u30d2\u30ce\u30ab": "camilla \u30ab\u30df\u30e9 \u5361\u7f8e\u62c9",
	"PID_\u53cc\u754c\u30df\u30eb\u30e9": "nah \u30f3\u30f3 \u6069\u6069",
	"PID_\u6bd4\u7ffc\u30a8\u30a4\u30ea\u30fc\u30af": "ephraim \u30a8\u30d5\u30e9\u30e0 \u827e\u592b\u62c9\u59c6",
	"PID_\u6bd4\u7ffc\u30d4\u30a2\u30cb\u30fc": "triandra \u30b9\u30ab\u30d3\u30aa\u30b5 \u53f2\u5361\u7562\u6b50\u85a9",
	"PID_\u53cc\u754c\u5916\u4f1d\u30ab\u30c1\u30e5\u30a2": "thea \u30c6\u30a3\u30c8 \u8482\u7279"
}

# All commonly used images
images = {
	"rarity": {
		"1": "/common/other/rarity1.webp",
		"2": "/common/other/rarity2.webp",
		"3": "/common/other/rarity3.webp",
		"4": "/common/other/rarity4.webp",
		"5": "/common/other/rarity5.webp",
		"Forma": "/common/other/rarityForma.webp"
	},
	"movetype": [
		"/common/other/0-move.webp",
		"/common/other/1-move.webp",
		"/common/other/2-move.webp",
		"/common/other/3-move.webp"
	],
	"flowers": [
		"/common/other/0-flower.webp",
		"/common/other/1-flower.webp",
		"/common/other/2-flower.webp",
		"/common/other/3-flower.webp"
	],
	"weapontype": [
		"/common/other/0-weapon.webp",
		"/common/other/1-weapon.webp",
		"/common/other/2-weapon.webp",
		"/common/other/3-weapon.webp",
		"/common/other/4-weapon.webp",
		"/common/other/5-weapon.webp",
		"/common/other/6-weapon.webp",
		"/common/other/7-weapon.webp",
		"/common/other/8-weapon.webp",
		"/common/other/9-weapon.webp",
		"/common/other/10-weapon.webp",
		"/common/other/11-weapon.webp",
		"/common/other/12-weapon.webp",
		"/common/other/13-weapon.webp",
		"/common/other/14-weapon.webp",
		"/common/other/15-weapon.webp",
		"/common/other/16-weapon.webp",
		"/common/other/17-weapon.webp",
		"/common/other/18-weapon.webp",
		"/common/other/19-weapon.webp",
		"/common/other/20-weapon.webp",
		"/common/other/21-weapon.webp",
		"/common/other/22-weapon.webp",
		"/common/other/23-weapon.webp"
	],
	"blessing": [
		# Fire
		{
			"normal": "/common/other/1-Blessing.webp",
			"atk": "/common/other/1-Blessing-atk.webp",
			"spd": "/common/other/1-Blessing-spd.webp",
			"def": "/common/other/1-Blessing-def.webp",
			"res": "/common/other/1-Blessing-res.webp",
			"pairup": "/common/other/1-Blessing-pairup.webp"
		},
		# Water
		{
			"normal": "/common/other/2-Blessing.webp",
			"atk": "/common/other/2-Blessing-atk.webp",
			"spd": "/common/other/2-Blessing-spd.webp",
			"def": "/common/other/2-Blessing-def.webp",
			"res": "/common/other/2-Blessing-res.webp",
			"pairup": "/common/other/2-Blessing-pairup.webp"
		},
		# Wind
		{
			"normal": "/common/other/3-Blessing.webp",
			"atk": "/common/other/3-Blessing-atk.webp",
			"spd": "/common/other/3-Blessing-spd.webp",
			"def": "/common/other/3-Blessing-def.webp",
			"res": "/common/other/3-Blessing-res.webp",
			"pairup": "/common/other/3-Blessing-pairup.webp"
		},
		# Earth
		{
			"normal": "/common/other/4-Blessing.webp",
			"atk": "/common/other/4-Blessing-atk.webp",
			"spd": "/common/other/4-Blessing-spd.webp",
			"def": "/common/other/4-Blessing-def.webp",
			"res": "/common/other/4-Blessing-res.webp",
			"pairup": "/common/other/4-Blessing-pairup.webp"
		},
		# Light
		{
			"normal": "/common/other/5-Blessing.webp",
			"atk": "/common/other/5-Blessing-atk.webp",
			"spd": "/common/other/5-Blessing-spd.webp",
			"def": "/common/other/5-Blessing-def.webp",
			"res": "/common/other/5-Blessing-res.webp",
			"atk-extrae": "/common/other/5-Blessing-atk-extrae.webp",
			"spd-extrae": "/common/other/5-Blessing-spd-extrae.webp",
			"def-extrae": "/common/other/5-Blessing-def-extrae.webp",
			"res-extrae": "/common/other/5-Blessing-res-extrae.webp",
		},
		# Dark
		{
			"normal": "/common/other/6-Blessing.webp",
			"atk": "/common/other/6-Blessing-atk.webp",
			"spd": "/common/other/6-Blessing-spd.webp",
			"def": "/common/other/6-Blessing-def.webp",
			"res": "/common/other/6-Blessing-res.webp",
			"atk-extrae": "/common/other/6-Blessing-atk-extrae.webp",
			"spd-extrae": "/common/other/6-Blessing-spd-extrae.webp",
			"def-extrae": "/common/other/6-Blessing-def-extrae.webp",
			"res-extrae": "/common/other/6-Blessing-res-extrae.webp",
		},
		# Astra
		{
			"normal": "/common/other/7-Blessing.webp",
			"atk": "/common/other/7-Blessing-atk.webp",
			"spd": "/common/other/7-Blessing-spd.webp",
			"def": "/common/other/7-Blessing-def.webp",
			"res": "/common/other/7-Blessing-res.webp",
			"atk-extrae": "/common/other/7-Blessing-atk-extrae.webp",
			"spd-extrae": "/common/other/7-Blessing-spd-extrae.webp",
			"def-extrae": "/common/other/7-Blessing-def-extrae.webp",
			"res-extrae": "/common/other/7-Blessing-res-extrae.webp",
		},
		# Anima
		{
			"normal": "/common/other/8-Blessing.webp",
			"atk": "/common/other/8-Blessing-atk.webp",
			"spd": "/common/other/8-Blessing-spd.webp",
			"def": "/common/other/8-Blessing-def.webp",
			"res": "/common/other/8-Blessing-res.webp",
			"atk-extrae": "/common/other/8-Blessing-atk-extrae.webp",
			"spd-extrae": "/common/other/8-Blessing-spd-extrae.webp",
			"def-extrae": "/common/other/8-Blessing-def-extrae.webp",
			"res-extrae": "/common/other/8-Blessing-res-extrae.webp",
		}
	],
	"favorite": [
		"/common/other/favorite_0.webp",
		"/common/other/favorite_1.webp",
		"/common/other/favorite_2.webp",
		"/common/other/favorite_3.webp",
		"/common/other/favorite_4.webp",
		"/common/other/favorite_5.webp",
		"/common/other/favorite_6.webp",
		"/common/other/favorite_7.webp",
		"/common/other/favorite_8.webp"
	],
	"skillindicators": {
		"A": "/common/other/indicator-skillA.webp",
		"B": "/common/other/indicator-skillB.webp",
		"C": "/common/other/indicator-skillC.webp",
		"S": "/common/other/indicator-skillS.webp"
	},
	"accessory": {
		"Hat": "/common/other/Accesory-Hat.webp",
		"Hair": "/common/other/Accesory-Hair.webp",
		"Mask": "/common/other/Accesory-Mask.webp",
		"Tiara": "/common/other/Accesory-Tiara.webp"
	},
	"refines": {
		"Atk": "/common/other/Atk-Refine.webp",
		"Spd": "/common/other/Spd-Refine.webp",
		"Def": "/common/other/Def-Refine.webp",
		"Res": "/common/other/Res-Refine.webp",
		"Wrathful": "/common/other/Wrathful-Refine.webp",
		"Dazzling": "/common/other/Dazzling-Refine.webp"
	},
	"summoner": {
		"C": "/common/other/Support-C.webp",
		"B": "/common/other/Support-B.webp",
		"A": "/common/other/Support-A.webp",
		"S": "/common/other/Support-S.webp",
	},
	"other": {
		"bgnosupport": "/common/other/normalbg.webp",
		"bgsupport": "/common/other/summonerbg.webp",
		"fgui": "/common/base/foreground-ui.webp",
		"fgnoui": "/common/base/foreground.webp",
		"resplendent": "/common/other/resplendent.webp",
		"expindicator": "/common/base/expindicator.webp",
		"accessoryexpand": "/common/base/accessory-expansion.webp",
		"numberfont": "/common/base/numberfont.webp",
		"flowerholder": "/common/base/flowerholder.webp",
		"ascendent": "/common/other/ascendent.webp",
		"duoconversation": "/common/other/DuoConversation.webp",
		"noweapon": "/common/other/weapon-Refine.webp",
		"Duo": "/common/other/Duo.webp",
		"Resonance": "/common/other/Resonance.webp"
	}
}
work()
