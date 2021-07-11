import bs4
import requests

def obtaintrueurl(filename):
	# Download the wiki page for the icon art since we can't reliably get the real link because it appears to be in folders with random numbers
	artpage = bs4.BeautifulSoup(requests.get("https://feheroes.fandom.com/wiki/File:" + filename.replace(" ", "_").replace(":", "").replace("?", "")).text, 'html.parser')
	try:
		# We get the full url by reading the doc item href value
		return artpage.select_one('div.fullImageLink').select_one('a').get('href').split("/revision")[0]
	except:
		# The referenced data art is probably incorrect and we couldn't get a full url, return here false and let the caller handle fallback values
		return False
