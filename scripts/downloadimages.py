import requests
import io
import pathlib
from PIL import Image

# Create all temp routes as needed
pathlib.Path("../data/img/heroes").mkdir(parents=True, exist_ok=True)
pathlib.Path("../data/img/other").mkdir(parents=True, exist_ok=True)

def download():
	for icon in icons:
		print(icon)
		# Grab and paste the heroes art in the image
		response = requests.get(icons[icon].split("?")[0])
		# We store the size as part of the URL and just grab it
		dimensions = (int(icons[icon].split("?")[1]), int(icons[icon].split("?")[2]))
		# By default we save on the "other" folder
		location = "../data/img/other/"
		# Download the art image and resize it according to the set config
		art = Image.open(io.BytesIO(response.content)).resize(dimensions)
		art.save(location + icon + ".png", 'PNG')

icons = {
	# Movement types
	"0-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/45/Icon_Move_Infantry.png?32?32",
	"0-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a4/Dragonflower_I.png?60?60",
	"1-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/80/Icon_Move_Armored.png?32?32",
	"1-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2c/Dragonflower_A.png?60?60",
	"2-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9f/Icon_Move_Cavalry.png?32?32",
	"2-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/f0/Dragonflower_C.png?60?60",
	"3-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/73/Icon_Move_Flying.png?32?32",
	"3-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Dragonflower_F.png?60?60",
	# Weapon types
	"0-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/47/Icon_Class_Red_Sword.png?32?32",
	"1-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/60/Icon_Class_Blue_Lance.png?32?32",
	"2-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6e/Icon_Class_Green_Axe.png?32?32",
	"3-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/25/Icon_Class_Red_Bow.png?32?32",
	"4-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/1e/Icon_Class_Blue_Bow.png?32?32",
	"5-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/76/Icon_Class_Green_Bow.png?32?32",
	"6-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c1/Icon_Class_Colorless_Bow.png?32?32",
	"7-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a0/Icon_Class_Red_Dagger.png?32?32",
	"8-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/81/Icon_Class_Blue_Dagger.png?32?32",
	"9-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9d/Icon_Class_Green_Dagger.png?32?32",
	"10-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/68/Icon_Class_Colorless_Dagger.png?32?32",
	"11-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8a/Icon_Class_Red_Tome.png?32?32",
	"12-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8e/Icon_Class_Blue_Tome.png?32?32",
	"13-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/75/Icon_Class_Green_Tome.png?32?32",
	"14-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/39/Icon_Class_Colorless_Tome.png?32?32",
	"15-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cd/Icon_Class_Colorless_Staff.png?32?32",
	"16-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/ee/Icon_Class_Red_Breath.png?32?32",
	"17-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/3d/Icon_Class_Blue_Breath.png?32?32",
	"18-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/eb/Icon_Class_Green_Breath.png?32?32",
	"19-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Icon_Class_Colorless_Breath.png?32?32",
	"20-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2f/Icon_Class_Red_Beast.png?32?32",
	"21-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/30/Icon_Class_Blue_Beast.png?32?32",
	"22-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Icon_Class_Green_Beast.png?32?32",
	"23-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/Icon_Class_Colorless_Beast.png?32?32",
	# Refines
	"Atk-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/20/Attack_Plus_W.png?44?44",
	"Spd-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/Speed_Plus_W.png?44?44",
	"Def-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cd/Defense_Plus_W.png?44?44",
	"Res-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/50/Resistance_Plus_W.png?44?44",
	"Dazzling-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Dazzling_Staff_W.png?44?44",
	"Wrathful-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/42/Wrathful_Staff_W.png?44?44",
	"weapon-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Icon_Skill_Weapon.png?44?44",
	# Category indicator for skill icons
	"indicator-skillA": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/68/Passive_Icon_A.png?21?21",
	"indicator-skillB": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6a/Passive_Icon_B.png?21?21",
	"indicator-skillC": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/84/Passive_Icon_C.png?21?21",
	"indicator-skillS": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6f/Passive_Icon_S.png?21?21",
	# Blessings
	"1-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c5/Icon_LegendFire.png?147?160",
	"2-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2e/Icon_LegendWater.png?147?160",
	"3-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/28/Icon_LegendWind.png?147?160",
	"4-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendEarth.png?147?160",
	"5-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/51/Icon_LegendLight.png?147?160",
	"6-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/72/Icon_LegendDark.png?147?160",
	"7-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/7b/Icon_LegendHeaven.png?147?160",
	"8-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/df/Icon_LegendLogic.png?147?160",
	# Supports
	"Support-C": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/88/Icon_Support_Summoner_C.png?147?160",
	"Support-B": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/aa/Icon_Support_Summoner_B.png?147?160",
	"Support-A": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a2/Icon_Support_Summoner_A.png?147?160",
	"Support-S": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8a/Icon_Support_Summoner_S.png?147?160",
	# Favorite marks
	"favorite_0": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a9/FavoriteMark0.png?90?92",
	"favorite_1": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b2/FavoriteMark1.png?90?92",
	"favorite_2": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9b/FavoriteMark2.png?90?92",
	"favorite_3": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/0a/FavoriteMark3.png?90?92",
	"favorite_4": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/81/FavoriteMark4.png?90?92",
	"favorite_5": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/20/FavoriteMark5.png?90?92",
	"favorite_6": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6e/FavoriteMark6.png?90?92",
	"favorite_7": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/17/FavoriteMark7.png?90?92",
	"favorite_8": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/e8/FavoriteMark8.png?90?92",
	# Other
	"normalbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9d/BG_DetailedStatus.png?1067?1280",
	"summonerbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Summoner_Support_Background.png?1067?1280",
	"resplendent": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b8/Icon_GodWear_L.png?82?82"
}

download()
