import requests
import bs4
import re
import json
import unidecode

# We get everything from the wiki
wikiurl = "https://feheroes.fandom.com"

# Download the webpage containing a list of all the weapons
html = requests.get(wikiurl + '/wiki/Weapons').text

# Using the previously downloaded html we create a recursive list containing all weapons by selecting all table rows with the correct class
weaponlist = bs4.BeautifulSoup(html, 'html.parser').select('td.field_Weapon')

# Storage dictionary for weapons data
weapons = {}

# Add data from the patched in hack because they are not yet properly listed in the wiki
with open("patchin.json", "r") as datasource:
	weapons = json.load(datasource)["weapons"]

# Smaller dictionary
weaponslite = {weapon: weapons[weapon] for weapon in weapons}

for i in range(0, len(weaponlist)):
	# Download the edit wiki page (it's lighter and easier to parse plaintext) for each weapon to grab additional data 
	weaponpage = bs4.BeautifulSoup(requests.get(wikiurl + weaponlist[i].select('a')[0].get('href') + "?action=edit").text, 'html.parser')
	# Get the plaintext of all data to parse
	data = weaponpage.select_one('textarea#wpTextbox1').text
	titlename = weaponpage.select_one('h1#firstHeading').text.replace("Editing ", "")
	print(str(i) + ". " + titlename)
	# Update the weapon dictionary with a new one
	weapons[titlename] = {
		# For most of the data we search we just need to strip the string of the newline at the end, split using the = separator and grab the second item
		"WeaponType": re.search(r'(.*?weaponType.*?)\n', data)[0].strip().split("=")[1],
		"statModifiers": re.search(r'(.*?statModifiers.*?)\n', data)[0].strip().split("statModifiers=")[1],
		"specialIcon": re.search(r'(.*?iconSkill1.*?)\n', data)[0].strip().split("=")[1] if re.search(r'(.*?iconSkill1.*?)\n', data) else False,
		"upgrades": True if re.search(r'(.*?Upgrade.*?)\n', data) else False
	}
	# For client-side we only need to know if the weapon has an effect refine and if it's refinable in general
	weaponslite[titlename] = {
		"WeaponType": re.search(r'(.*?weaponType.*?)\n', data)[0].strip().split("=")[1],
		"specialIcon": weapons[titlename]["specialIcon"],
		"upgrades": weapons[titlename]["upgrades"]
	}

# Store all the data for internal usage
with open("../data/weapons.json", "w") as outfile:
    json.dump(weapons, outfile)

# Store a list just for browser usage
with open("../static/weapons.json", "w") as outfile:
    json.dump({weapon: weapons[weapon] for weapon in sorted(weapons)}, outfile)
