import requests
import bs4
import json

# We get everything from the wiki
wikiurl = "https://feheroes.fandom.com"

# Download the webpage containing a list of all the passives
html = requests.get(wikiurl + '/wiki/Passives').text
# Using the previously downloaded html we create a list containing each category of passive (A, B, C and S)
passivecategories = bs4.BeautifulSoup(html, 'html.parser').select('table.cargoTable')

# We need to get the seals from a different page
html = requests.get(wikiurl + '/wiki/Sacred_Seals').text
# We replace the entry from seals obtained from the last page with the one from the seals page
passivecategories[3] = bs4.BeautifulSoup(html, 'html.parser').select('table.cargoTable')[0]

# Storage dictionary for passive data
passives = {
	"A": {},
	"B": {},
	"C": {},
	"S": {}
}
# Add data from the patched in hack because they are not yet properly listed in the wiki
with open("patchin.json", "r") as datasource:
	passives = json.load(datasource)["passives"]

passiveslite = {
	"A": [passive for passive in passives["A"]],
	"B": [passive for passive in passives["B"]],
	"C": [passive for passive in passives["C"]],
	"S": [passive for passive in passives["S"]],
}

dontlookatthis = ["A", "B", "C", "S"]
# We only go through the thre first categories on this page because we don't have the 
for i in range(0, len(passivecategories)):
	names = passivecategories[i].select('tr > td.field_Name')
	icons = passivecategories[i].select('tr > td.field_Icon')
	for j in range(0, len(names)):
		# Download the wiki page for the icon art since we can't reliably get the real link because it appears to be in folders with random numbers
		artpage = bs4.BeautifulSoup(requests.get(wikiurl + icons[j].select_one('a').get('href')).text, 'html.parser')
		name = names[j].text
		print(dontlookatthis[i] + str(j) + " " + name)
		# Store the data in the dictionaries
		passives[dontlookatthis[i]][name] = artpage.select_one('div.fullImageLink').select_one('a').get('href').split("/revision")[0]
		passiveslite[dontlookatthis[i]].append(name)

# Store all the data for internal usage
with open("../data/passives.json", "w") as outfile:
    json.dump(passives, outfile)

# Store a list just with the heroes name for browser usage
with open("../static/passives.json", "w") as outfile:
    json.dump(passiveslite, outfile)
