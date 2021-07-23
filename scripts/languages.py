import json
import os

# Big dictionary to store all translations (we're ignoring Spanish (US) and English (EU) as they are probably 99% identical to save same bandwidth)
languages = {"EUDE": {}, "EUES": {}, "EUFR": {}, "EUIT": {}, "JPJA": {}, "TWZH": {}, "USEN": {}, "USPT": {}}

for language in languages:
	files = os.listdir("feh-assets-json/files/assets/" + language + "/Message/Data/")
	strings = {}
	for file in files:
		with open("feh-assets-json/files/assets/" + language + "/Message/Data/" + file, "r") as datasource:
			data = json.load(datasource)
			# We only add strings related to either skills or units as long as they are not descriptions
			for string in [string for string in data if any(substring in string["key"] for substring in ["MPID_", "MSID_"]) and not any(substring in string["key"] for substring in ["MPID_H_", "MSID_H_", "MPID_SEARCH_", "MPID_LEGEND_"])]:
				strings[string["key"]] = string["value"]
	languages[language] = strings

# Store all the data for internal usage
with open("../data/languages.json", "w") as outfile:
    json.dump(languages, outfile)

# Smaller version for browser usage
languageslite = {
	language: {
		key: string
		for key, string in strings.items() if not any(substring in key for substring in ["ILLUST", "VOICE"])
	}
	for language, strings in languages.items()
}
with open("../static/languages.json", "w") as outfile:
    json.dump(languageslite, outfile)
