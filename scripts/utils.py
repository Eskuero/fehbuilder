import requests
import unidecode

def obtaintrueurl(filename):
	# Parameters to send the API whe requesting the image info (https://feheroes.fandom.com/api.php?action=query&prop=imageinfo&titles=File:Distant%20Counter.png&iiprop=url&format=json)
	params = dict(
		action = 'query', format = 'json',
		prop = "imageinfo",
		titles = "File:" + unidecode.unidecode(filename).replace(" ", "_").replace(":", "").replace("?", "").replace("'", "").replace('"', ''),
		iiprop = 'url'
	)
	try:
		# Obtain URL info
		images = requests.get(url = "https://feheroes.fandom.com/api.php", params = params).json()["query"]["pages"]
		# The response json isn't very convenient for single image queries so we must enter a loop and return with the first value
		for k, v in images.items():
			return images[k]["imageinfo"][0]["url"] + "&format=original"
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
