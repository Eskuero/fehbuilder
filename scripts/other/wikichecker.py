import json
import utils
import os
# Script to check if the wiki Skils and Tables are missing any data from the dumps, we basically obtain any key, then parse the dumps and check one by one if they are in the list obtained from the cargoquery. We merely load the English locales to be able to print a humar readable string related to the string

# Load all languages from the json file
print("Getting english strings...")
languages = {}
files = os.listdir("feh-assets-json/files/assets/USEN/Message/Data/")
for file in files:
	with open("feh-assets-json/files/assets/USEN/Message/Data/" + file, "r") as datasource:
		data = json.load(datasource)
		for string in [string for string in data if any(substring in string["key"] for substring in ["MPID_", "MSID_"]) and not any(substring in string["key"] for substring in ["MPID_H_", "MSID_H_", "MPID_SEARCH_", "MPID_LEGEND_"])]:
			languages[string["key"]] = string["value"]

print("\nChecking skills...")
# Parameters to send the API whe requesting the whole list of skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Skills&fields=TagID&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Skills',
    fields = "TagID"
)
# This is the list of skills who have shiny borders (This is any skill for A or C category that isn't exclusive, costs 300 SP and doesn't end on 3, Counter, Foil or Ward (for now lol))
allskilltags = [skill['TagID'] for skill in [entry["title"] for entry in utils.retrieveapidata(params)]]

files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Skill/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Skill/" + file, "r") as datasource:
		data = json.load(datasource)
		# SID_無し is skeleton data for a hero
		for entry in [entry for entry in data if entry["category"] in range(0, 7) and entry["id_tag"] != "SID_無し"]:
			if entry["id_tag"] not in allskilltags:
				print("Tag " + entry["id_tag"] + " is not in the Skills cargotable. It's English string is " + languages[entry["name_id"]])

print("\nChecking heroes...")
# Parameters to send the API whe requesting the whole list of skills (https://feheroes.fandom.com/api.php?action=cargoquery&tables=Units&fields=TagID&limit=max&offset=0&format=json)
params = dict(
    action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
    tables = 'Units',
    fields = "TagID"
)
# This is the list of skills who have shiny borders (This is any skill for A or C category that isn't exclusive, costs 300 SP and doesn't end on 3, Counter, Foil or Ward (for now lol))
allheroestags = [skill['TagID'] for skill in [entry["title"] for entry in utils.retrieveapidata(params)]]

files = os.listdir("feh-assets-json/files/assets/Common/SRPG/Person/")
for file in files:
	with open("feh-assets-json/files/assets/Common/SRPG/Person/" + file, "r") as datasource:
		data = json.load(datasource)
		# SID_無し is skeleton data for a hero
		for entry in [entry for entry in data if entry["id_tag"] != "PID_無し"]:
			if entry["id_tag"] not in allheroestags:
				print("Tag " + entry["id_tag"] + " is not in the Heroes cargotable. It's English string is " + languages["M" + entry["id_tag"]] + ": " + languages["M" + entry["id_tag"].replace("PID", "PID_HONOR")])
