import bs4
import requests
import unidecode

def obtaintrueurl(filename):
	# Cleaned up name for the file
	name = unidecode.unidecode(filename).replace(" ", "_").replace(":", "").replace("?", "").replace("'", "")
	# Download the wiki page for the icon art since we can't reliably get the real link because it appears to be in folders with random numbers
	artpage = bs4.BeautifulSoup(requests.get("https://feheroes.fandom.com/wiki/File:" + name).text, 'html.parser')
	try:
		# We get the full url by reading the doc item href value
		return artpage.select_one("a[href*=" + name.replace(".", "\.")[-20:] + "]").get('href').split("/revision")[0]
	except:
		# The referenced data art is probably incorrect and we couldn't get a full url, return here false and let the caller handle fallback values
		return False

def retrieveapidata(params):
	# Base URL for api requests
	url = "https://feheroes.fandom.com/api.php"
	stop = False
	info = []
	while not stop:
		# We can only request 500 entries everytime so we increment it everytime we enter the loop
		params["offset"] += 500
		response = requests.get(url = url, params = params)
		data = response.json()
		# If we got less than 500 entries that means this is the last iteration
		if len(data["cargoquery"]) < 500:
			stop = True
		# Just in case we reach the end on a perfect mutliplier of 500
		if len(data["cargoquery"]) == 0:
			break
		info += data["cargoquery"]
	return info
