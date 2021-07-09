import requests
import bs4
import json

# We get everything from the wiki
wikiurl = "https://feheroes.fandom.com"

# Download the webpage containing a list of all the assists
assists = requests.get(wikiurl + '/wiki/Assists').text
# Download the webpage containing a list of all the specials
specials = requests.get(wikiurl + '/wiki/Specials').text

# Storage list for data
assists = [entry.text for entry in bs4.BeautifulSoup(assists, 'html.parser').select('td.field_Name')[1:]]
specials = [entry.text for entry in bs4.BeautifulSoup(specials, 'html.parser').select('td.field_Name')[1:]]

# Add data from the patched in hack because they are not yet properly listed in the wiki
with open("patchin.json", "r") as datasource:
	data = json.load(datasource)
	assists += data["assists"]
	specials += data["specials"]

# Store all the data for internal usage
with open("../data/specials.json", "w") as outfile:
    json.dump(specials, outfile)
with open("../data/assists.json", "w") as outfile:
    json.dump(assists, outfile)

# Store a list just for browser usage
with open("../static/specials.json", "w") as outfile:
    json.dump(specials, outfile)
with open("../static/assists.json", "w") as outfile:
    json.dump(assists, outfile)
