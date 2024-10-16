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

import json
import sys
import os

MODE = os.environ["RENEWDATA_MODE"] if "RENEWDATA_MODE" in os.environ else False
# Detect what update mode we are using
if MODE == "hertz_wiki":
	LANGUAGES_BASEDIR = "feh-assets-json/files/assets/"
	EXTRA_BASEDIR = "/Message/Data/"
elif MODE == "hackin_device":
	LANGUAGES_BASEDIR = "hackin/languages/"
	EXTRA_BASEDIR = "/"
else:
	print("Invalid RENEWDATA_MODE enviroment variable, must be hertz_wiki or hackin_device")
	sys.exit(1)

# Obtain all blessed heroes to allow them in the customlanguages
with open("fullother.json", "r") as datasource:
	blessed = json.load(datasource)["blessed"]
	
# Big dictionary to store all translations
languages = {"EUDE": {}, "EUES": {}, "USES": {}, "EUFR": {}, "EUIT": {}, "JPJA": {}, "TWZH": {}, "USEN": {}, "EUEN": {}, "USPT": {}, "KOKR": {}}

# This is a list of strings for translating the UI and must be included
basicstrings = [
	# None translation
	"MSID_H_NONE"
]
unitstrings = [
	# Unit specific
	"MID_HP", "MID_ATTACK", "MID_AGILITY", "MID_DEFENSE", "MID_RESIST", "MID_SKILL_POINT", "MID_HEROISM_POINT",	"MID_LEVEL2", "MID_EXP", "MID_UNIT_INFO_EXP_MAX", "MID_UNIT_INFO_EXP_REMAIN",
	# Buttons to modify equipment or interact
	"MID_UNIT_INFO_TO_TALK", "MID_UNIT_INFO_TO_SKILLLEARN",	"MID_UNIT_INFO_TO_SKILLEQUIP", "MID_UNIT_INFO_TO_SKILLSET"
]
blessingstrings = [
	# Blessings
	"MID_ITEM_BLESSING_FIRE", "MID_ITEM_BLESSING_WATER", "MID_ITEM_BLESSING_WIND", "MID_ITEM_BLESSING_EARTH", "MID_ITEM_BLESSING_LIGHT",
	"MID_ITEM_BLESSING_DARK", "MID_ITEM_BLESSING_HEAVEN", "MID_ITEM_BLESSING_LOGIC"
]
# Aether structures
aetherstrings = [
	"MID_SCF_砦", "MID_SCF_ギュミル水瓶", "MID_SCF_ギュミル泉", "MID_SCF_音楽堂", "MID_SCF_食堂", "MID_SCF_畑", "MID_SCF_宿屋", "MID_SCF_落雷の罠A",
	"MID_SCF_重圧の罠A", "MID_SCF_停止の罠A", "MID_SCF_落雷の罠ダミー", "MID_SCF_重圧の罠ダミー", "MID_SCF_停止の罠ダミー", "MID_SCF_対重装", "MID_SCF_雷",
	"MID_SCF_白封印祠", "MID_SCF_投石", "MID_SCF_対騎馬", "MID_SCF_黒封印祠", "MID_SCF_防比翼鳥籠", "MID_SCF_対飛行", "MID_SCF_回復", "MID_SCF_対歩行",
	"MID_SCF_恐慌", "MID_SCF_軍師"
]
# Hold all previous for ease
fullstrings = basicstrings + unitstrings + blessingstrings + aetherstrings

for language in languages:
	files = os.listdir(LANGUAGES_BASEDIR + language + EXTRA_BASEDIR)
	strings = {}
	for file in files:
		# Only read .json files
		if ".json" not in file:
			continue
		with open(LANGUAGES_BASEDIR + language + EXTRA_BASEDIR + file, "r") as datasource:
			data = json.load(datasource)
			# We only add strings related to either skills or units as long as they are not descriptions
			for string in [string for string in data if (any(substring in string["key"] for substring in ["MPID_", "MEID_", "MSID_"]) and not any(substring in string["key"] for substring in ["MPID_H_", "MEID_H_", "MSID_H_", "MPID_SEARCH_", "MSID_SEARCH_", "MPID_LEGEND_"])) or string["key"] in fullstrings]:
				strings[string["key"]] = string["value"]
	languages[language] = strings

if MODE == "hertz_wiki":
	# Some languages are only inside the Menu but we only need specific keys from them.
	for language in languages:
		files = os.listdir(LANGUAGES_BASEDIR + language + EXTRA_BASEDIR)
		strings = {}
		for file in files:
			with open(LANGUAGES_BASEDIR + language + EXTRA_BASEDIR + file, "r") as datasource:
				data = json.load(datasource)
				# We only add strings related to either skills or units as long as they are not descriptions
				for string in [string for string in data if string["key"] in fullstrings]:
					strings[string["key"]] = string["value"]
		languages[language] = languages[language] | strings

# Go through each string in english and make sure we have a translation in Korean
for string in languages["USEN"]:
	if string not in languages["KOKR"]:
		# Do not print errors for ILLUST and VOICE strings (we still add them)
		if not any(substr in string for substr in ["VOICE", "ILLUST"]):
			# If not an enemy unit always print the errors
			if not any(substr in string for substr in ["EID"]):
				print("                - Missing Korean translation for \"" + string + "\", falling back to English as \"" + languages["USEN"][string] + "\"")
			# Else print the missing enemy unit if there's a corresponding playable unit
			elif string.replace("EID", "PID") not in languages["USEN"]:
				print("                - Missing Korean translation for \"" + string + "\", falling back to English as \"" + languages["USEN"][string] + "\"")
		languages["KOKR"][string] = languages["USEN"][string]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Store all the data for internal usage of scripts
with open("fulllanguages.json", "w") as outfile:
    json.dump(languages, outfile)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in online and custom unit builders (includes everything but aether structures)
languagesunit = {
	language: {
		key: string
		for key, string in strings.items() if key not in aetherstrings
	}
	for language, strings in languages.items()
}

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in ard builders (only needs units names and titles and aetherstrings + basicstrings)
languagesard = {
	language: {
		key: string
		for key, string in strings.items() if not any(substring in key for substring in ["ILLUST", "VOICE", "SID", "EID"]) and key not in unitstrings + blessingstrings or key in basicstrings + aetherstrings
	}
	for language, strings in languages.items()
}

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Version for usage in summon simulator (only needs units names and titles)
languagessummon = {
	language: {
		key: string
		for key, string in strings.items() if not any(substring in key for substring in fullstrings + ["ILLUST", "VOICE", "SID", "EID"])
	}
	for language, strings in languages.items()
}

# Generate individual files for each language and version to reduce bandwidth usage
for language in languages:
	with open("unitlanguages-" + language + ".json", "w") as outfile:
		json.dump(languagesunit[language], outfile)
	with open("ardlanguages-" + language + ".json", "w") as outfile:
		json.dump(languagesard[language], outfile)
	with open("summonlanguages-" + language + ".json", "w") as outfile:
		json.dump(languagessummon[language], outfile)
