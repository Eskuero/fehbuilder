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

import requests
import unidecode

def obtaintrueurl(filenames):
	# Parameters to send the API whe requesting the image info (https://feheroes.fandom.com/api.php?action=query&prop=imageinfo&titles=File:Distant%20Counter.png&iiprop=url&format=json)
	params = dict(
		action = 'query', format = 'json',
		prop = "imageinfo",
		titles = "",
		iiprop = 'url'
	)
	# Create the list of titles to ask the API about
	for filename in filenames:
		params["titles"] += "File:_" + unidecode.unidecode(filename).replace(" ", "_").replace(":", "").replace("/", "_").replace("'", "").replace('"', '') + "|"
	params["titles"] = params["titles"].rstrip("|")
	# Identify in which position of the list we want to return every url by splitting the original titles in the query
	requestedtitles = params["titles"].split("|")
	# By default our list of returned URLs is everything to False and then modify based on response
	urls = [False for item in requestedtitles]
	# Obtain URL info
	try:
		info = requests.get(url = "https://feheroes.fandom.com/api.php", params = params).json()["query"]
		# Create a dict which tells the corresponding requested name for each real name
		truenames = {}
		for page in info["normalized"]:
			truenames[page["to"]] = page["from"]
	# If the request failed for whatever reason return the expected list with as many Falses as images were requested
	except:
		return urls
	# The response json isn't very convenient for single image queries so we must enter a loop and return with the first value
	for image in info["pages"]:
		# This is the index we caller script expects the requested true URL to be at
		index = requestedtitles.index(truenames[info["pages"][image]["title"]])
		try:
			urls[index] = info["pages"][image]["imageinfo"][0]["url"] + "&format=original"
		# The referenced data art is probably incorrect and we couldn't get a full url, return here false and let the caller handle fallback values
		except:
			urls[index] = False
	return urls

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
