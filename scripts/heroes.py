import requests
import bs4
import re
import json
import unidecode

# We get everything from the wiki
wikiurl = "https://feheroes.fandom.com"

# Download the webpage containing a list of all the units
html = requests.get(wikiurl + '/wiki/List_of_Heroes').text
# Using the previously downloaded html we create a recursive list containing all heroes by selecting all table rows with the correct class
herolist = bs4.BeautifulSoup(html, 'html.parser').select('tr.hero-filter-element')

# Storage dictionary for heroes data
heroes = {}

# Add data from the patched in hack because they are not yet properly listed in the wiki
with open("patchin.json", "r") as datasource:
	heroes = json.load(datasource)["heroes"]

for i in range(0, len(herolist)):
	# Download the edit wiki page (it's lighter and easier to parse plaintext) for each character to grab additional data 
	heropage = bs4.BeautifulSoup(requests.get(wikiurl + herolist[i].select_one('a').get('href') + "?action=edit").text, 'html.parser')
	# Get the plaintext of all data to parse
	data = heropage.select_one('textarea#wpTextbox1').text

	# To grab the level 1 stats and growths from the plaintext we must search the content for the initial string and then split each category using the | separator
	# We would get lists like this where we later have to ignore the first element
	# ['', 'Lv1HP=17', 'Lv1ATK=7', 'Lv1SPD=8', 'Lv1DEF=8', 'Lv1RES=6']
	# ['', 'GRHP=50', 'GRATK=60', 'GRSPD=55', 'GRDEF=40', 'GRRES=45']
	stats = re.search(r'(.*?Lv1HP.*?)\n', data)[0].strip().split("|")
	growths = re.search(r'(.*?GRHP.*?)\n', data)[0].strip().split("|")

	# Strip the hero title string of the Editing part and store it for later lookups
	titlename = re.search(r'Infobox\n(.*?Name.*?)\n', data)[0].strip().split("=")[1].lstrip() + ": " + re.search(r'(.*?Title.*?)\n', data)[0].strip().split("=")[1].lstrip()
	print(str(i) + ". " + titlename)
	
	# Download the wiki page for the face art since we can't reliably get the real link because it appears to be in folders with random numbers
	artpage = bs4.BeautifulSoup(requests.get(wikiurl + '/wiki/File:' + unidecode.unidecode(titlename).replace(": ", "_").replace(" ", "_").replace("'", "").replace("\"", "") + "_Face.webp").text, 'html.parser')
	# Grab the link for the fullart picture
	picture = artpage.select_one('div.fullImageLink').select_one('a').get('href').split("/revision")[0]

	# Update the hero dictionary with a new unit
	heroes[titlename] = {
		# For most of the data we search we just need to strip the string of the newline at the end, split using the = separator and grab the second item
		"WeaponType": re.search(r'(.*?WeaponType.*?)\n', data)[0].strip().split("=")[1],
		"moveType": re.search(r'(.*?MoveType.*?)\n', data)[0].strip().split("=")[1],
		"frontArt": picture,
		# Since we already stripped stats and growths of the newline we just need to split by = and grab the second value
		# ['', 'Lv1HP=17', 'Lv1ATK=7', 'Lv1SPD=8', 'Lv1DEF=8', 'Lv1RES=6']
		"stats": {
			"HP": int(stats[1].split("=")[1]),
			"Atk": int(stats[2].split("=")[1]),
			"Spd": int(stats[3].split("=")[1]),
			"Def": int(stats[4].split("=")[1]),
			"Res": int(stats[5].split("=")[1])
		},
		# ['', 'GRHP=50', 'GRATK=60', 'GRSPD=55', 'GRDEF=40', 'GRRES=45']
		"growths": {
			"HP": int(growths[1].split("=")[1]),
			"Atk": int(growths[2].split("=")[1]),
			"Spd": int(growths[3].split("=")[1]),
			"Def": int(growths[4].split("=")[1]),
			"Res": int(growths[5].split("=")[1])
		}
	}

# Store all the data for internal usage
with open("../data/heroes.json", "w") as outfile:
    json.dump(heroes, outfile)

# Store a list just with the heroes name for browser usage
with open("../static/heroes.json", "w") as outfile:
    json.dump({k: [] for k in heroes}, outfile)
    
