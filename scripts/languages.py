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
import os

# Obtain all blessed heroes to allow them in the customlanguages
with open("fullother.json", "r") as datasource:
	blessed = json.load(datasource)["blessed"]
	
# Big dictionary to store all translations (we're ignoring Spanish (US) and English (EU) as they are probably 99% identical to save same bandwidth)
languages = {"EUDE": {}, "EUES": {}, "USES": {}, "EUFR": {}, "EUIT": {}, "JPJA": {}, "TWZH": {}, "USEN": {}, "EUEN": {}, "USPT": {}}

# This is a list of strings for translating the UI and must always be included
basicstrings = ["MID_HP", "MID_ATTACK", "MID_AGILITY", "MID_DEFENSE", "MID_RESIST", "MID_SKILL_POINT", "MID_HEROISM_POINT", "MID_LEVEL2", "MID_EXP", "MSID_H_NONE", "MID_UNIT_INFO_EXP_MAX", "MID_UNIT_INFO_TO_TALK", "MID_UNIT_INFO_TO_SKILLLEARN", "MID_UNIT_INFO_TO_SKILLEQUIP", "MID_UNIT_INFO_TO_SKILLSET"]

for language in languages:
	files = os.listdir("feh-assets-json/files/assets/" + language + "/Message/Data/")
	strings = {}
	for file in files:
		with open("feh-assets-json/files/assets/" + language + "/Message/Data/" + file, "r") as datasource:
			data = json.load(datasource)
			# We only add strings related to either skills or units as long as they are not descriptions
			for string in [string for string in data if (any(substring in string["key"] for substring in ["MPID_", "MEID_", "MSID_"]) and not any(substring in string["key"] for substring in ["MPID_H_", "MSID_H_", "MPID_SEARCH_", "MPID_LEGEND_"])) or string["key"] in basicstrings]:
				strings[string["key"]] = string["value"]
	languages[language] = strings

# Some languages are only inside the Menu but we only need specific keys from them.
for language in languages:
	files = os.listdir("feh-assets-json/files/assets/" + language + "/Message/Menu/")
	strings = {}
	for file in files:
		with open("feh-assets-json/files/assets/" + language + "/Message/Menu/" + file, "r") as datasource:
			data = json.load(datasource)
			# We only add strings related to either skills or units as long as they are not descriptions
			for string in [string for string in data if string["key"] in basicstrings]:
				strings[string["key"]] = string["value"]
	languages[language] = languages[language] | strings

# Store all the data for internal usage
with open("fulllanguages.json", "w") as outfile:
    json.dump(languages, outfile)

# Smaller version for offline wiki builder
languageslite = {
	language: {
		key: string
		for key, string in strings.items() if not any(substring in key for substring in ["ILLUST", "VOICE"])
	}
	for language, strings in languages.items()
}
with open("litelanguages.json", "w") as outfile:
    json.dump(languageslite, outfile)

# Even smaller version for summoning
languagessummon = {
	language: {
		key: string
		for key, string in strings.items() if not any(substring in key for substring in basicstrings + ["ILLUST", "VOICE", "SID", "EID"])
	}
	for language, strings in languages.items()
}
with open("summonlanguages.json", "w") as outfile:
    json.dump(languagessummon, outfile)

# Alternative version for custom unit builder
languagescustom = {
	language: {
		key: string
		for key, string in strings.items() if not any(substring in key for substring in ["PID", "EID"]) or key.replace("PID_HONOR", "PID").replace("MPID", "PID") in blessed
	}
	for language, strings in languages.items()
}
with open("customlanguages.json", "w") as outfile:
    json.dump(languagescustom, outfile)
