import requests
import bs4
import io
import pathlib
from PIL import Image

# Create all temp routes as needed
pathlib.Path("../data/img/heroes").mkdir(parents=True, exist_ok=True)
pathlib.Path("../data/img/ui").mkdir(parents=True, exist_ok=True)
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
		# Refine icons are to be in the same location and size as any other passive
		if "Refine" in icon or "fallback" in icon:
			location = "../data/img/icons/"
		# Download the art image and resize it according to the set config
		art = Image.open(io.BytesIO(response.content)).resize(dimensions)
		art.save(location + icon + ".png", 'PNG')

icons = {
	# Movement types
	"Infantry-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/45/Icon_Move_Infantry.png?32?32",
	"Infantry-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a4/Dragonflower_I.png?60?60",
	"Cavalry-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9f/Icon_Move_Cavalry.png?32?32",
	"Cavalry-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/f0/Dragonflower_C.png?60?60",
	"Flying-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/73/Icon_Move_Flying.png?32?32",
	"Flying-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Dragonflower_F.png?60?60",
	"Armored-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/80/Icon_Move_Armored.png?32?32",
	"Armored-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2c/Dragonflower_A.png?60?60",
	# Weapon types
	"Red Sword-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/47/Icon_Class_Red_Sword.png?32?32",
	"Green Axe-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6e/Icon_Class_Green_Axe.png?32?32",
	"Blue Lance-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/60/Icon_Class_Blue_Lance.png?32?32",
	"Blue Tome-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8e/Icon_Class_Blue_Tome.png?32?32",
	"Green Tome-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/75/Icon_Class_Green_Tome.png?32?32",
	"Red Tome-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8a/Icon_Class_Red_Tome.png?32?32",
	"Colorless Tome-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/39/Icon_Class_Colorless_Tome.png?32?32",
	"Colorless Dagger-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/68/Icon_Class_Colorless_Dagger.png?32?32",
	"Green Dagger-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9d/Icon_Class_Green_Dagger.png?32?32",
	"Red Dagger-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a0/Icon_Class_Red_Dagger.png?32?32",
	"Blue Dagger-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/81/Icon_Class_Blue_Dagger.png?32?32",
	"Colorless Breath-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Icon_Class_Colorless_Breath.png?32?32",
	"Green Breath-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/eb/Icon_Class_Green_Breath.png?32?32",
	"Red Breath-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/ee/Icon_Class_Red_Breath.png?32?32",
	"Blue Breath-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/3d/Icon_Class_Blue_Breath.png?32?32",
	"Colorless Staff-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cd/Icon_Class_Colorless_Staff.png?32?32",
	"Colorless Beast-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/Icon_Class_Colorless_Beast.png?32?32",
	"Green Beast-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Icon_Class_Green_Beast.png?32?32",
	"Red Beast-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2f/Icon_Class_Red_Beast.png?32?32",
	"Blue Beast-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/30/Icon_Class_Blue_Beast.png?32?32",
	"Colorless Bow-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c1/Icon_Class_Colorless_Bow.png?32?32",
	"Green Bow-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/76/Icon_Class_Green_Bow.png?32?32",
	"Red Bow-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/25/Icon_Class_Red_Bow.png?32?32",
	"Blue Bow-weapon": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/1e/Icon_Class_Blue_Bow.png?32?32",
	# Refines
	"Atk-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/20/Attack_Plus_W.png?44?44",
	"Spd-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/Speed_Plus_W.png?44?44",
	"Def-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cd/Defense_Plus_W.png?44?44",
	"Res-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/50/Resistance_Plus_W.png?44?44",
	"Dazzling-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Dazzling_Staff_W.png?44?44",
	"Wrathful-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/42/Wrathful_Staff_W.png?44?44",
	"weapon-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Icon_Skill_Weapon.png?44?44",
	# Fallback skills
	"fallback-skillA": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_Skill_Passive_A.png?44?44",
	"fallback-skillB": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/ca/Icon_Skill_Passive_B.png?44?44",
	"fallback-skillC": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/01/Icon_Skill_Passive_C.png?44?44",
	"fallback-skillS": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9c/Icon_Skill_Passive_S.png?44?44",
	# Blessings
	"Water-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2e/Icon_LegendWater.png?147?160",
	"Fire-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c5/Icon_LegendFire.png?147?160",
	"Wind-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/28/Icon_LegendWind.png?147?160",
	"Earth-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendEarth.png?147?160",
	"Light-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/51/Icon_LegendLight.png?147?160",
	"Dark-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/72/Icon_LegendDark.png?147?160",
	"Astra-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/7b/Icon_LegendHeaven.png?147?160",
	"Anima-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/df/Icon_LegendLogic.png?147?160",
	# Supports
	"Support-C": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/88/Icon_Support_Summoner_C.png?147?160",
	"Support-B": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/aa/Icon_Support_Summoner_B.png?147?160",
	"Support-A": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a2/Icon_Support_Summoner_A.png?147?160",
	"Support-S": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8a/Icon_Support_Summoner_S.png?147?160",
	# Other
	"normalbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9d/BG_DetailedStatus.png?1067?1280",
	"summonerbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Summoner_Support_Background.png?1067?1280",
	"resplendent": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b8/Icon_GodWear_L.png?89?70"
}

download()
