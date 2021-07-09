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
		response = requests.get(icons[icon])
		size = (44, 44) if "Refine" in icon else ((60, 60) if "flower" in icon else (32, 32))
		art = Image.open(io.BytesIO(response.content)).resize(size)
		art.save("../data/img/icons/" + icon + ".png", 'PNG')
	for blessing in blessings:
		print(blessing)
		# Grab and paste the heroes art in the image
		response = requests.get(blessings[blessing])
		art = Image.open(io.BytesIO(response.content)).resize((147, 160))
		art.save("../data/img/other/" + blessing + ".png", 'PNG')
	for some in other:
		print(some)
		# Grab and paste the heroes art in the image
		response = requests.get(other[some])
		size = (1067, 1280) if "bg" in some else (80, 79)
		art = Image.open(io.BytesIO(response.content)).resize(size)
		art.save("../data/img/other/" + some + ".png", 'PNG')

icons = {
	"Infantry-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/45/Icon_Move_Infantry.png",
	"Infantry-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a4/Dragonflower_I.png",
	"Cavalry-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9f/Icon_Move_Cavalry.png",
	"Cavalry-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/f0/Dragonflower_C.png",
	"Flying-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/73/Icon_Move_Flying.png",
	"Flying-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Dragonflower_F.png",
	"Armored-move": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/80/Icon_Move_Armored.png",
	"Armored-flower": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2c/Dragonflower_A.png",
	"Red Sword": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/47/Icon_Class_Red_Sword.png",
	"Green Axe": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6e/Icon_Class_Green_Axe.png",
	"Blue Lance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/60/Icon_Class_Blue_Lance.png",
	"Blue Tome": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8e/Icon_Class_Blue_Tome.png",
	"Green Tome": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/75/Icon_Class_Green_Tome.png",
	"Red Tome": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8a/Icon_Class_Red_Tome.png",
	"Colorless Tome": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/39/Icon_Class_Colorless_Tome.png",
	"Colorless Dagger": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/68/Icon_Class_Colorless_Dagger.png",
	"Green Dagger": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9d/Icon_Class_Green_Dagger.png",
	"Red Dagger": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a0/Icon_Class_Red_Dagger.png",
	"Blue Dagger": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/81/Icon_Class_Blue_Dagger.png",
	"Colorless Breath": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Icon_Class_Colorless_Breath.png",
	"Green Breath": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/eb/Icon_Class_Green_Breath.png",
	"Red Breath": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/ee/Icon_Class_Red_Breath.png",
	"Blue Breath": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/3d/Icon_Class_Blue_Breath.png",
	"Colorless Staff": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cd/Icon_Class_Colorless_Staff.png",
	"Colorless Beast": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/Icon_Class_Colorless_Beast.png",
	"Green Beast": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Icon_Class_Green_Beast.png",
	"Red Beast": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2f/Icon_Class_Red_Beast.png",
	"Blue Beast": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/30/Icon_Class_Blue_Beast.png",
	"Colorless Bow": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c1/Icon_Class_Colorless_Bow.png",
	"Green Bow": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/76/Icon_Class_Green_Bow.png",
	"Red Bow": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/25/Icon_Class_Red_Bow.png",
	"Blue Bow": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/1e/Icon_Class_Blue_Bow.png",
	"Atk-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/20/Attack_Plus_W.png",
	"Spd-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/Speed_Plus_W.png",
	"Def-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cd/Defense_Plus_W.png",
	"Res-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/50/Resistance_Plus_W.png",
	"Dazzling-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Dazzling_Staff_W.png",
	"Wrathful-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/42/Wrathful_Staff_W.png",
	"weapon-Refine": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Icon_Skill_Weapon.png"
}
blessings = {
	"Water-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2e/Icon_LegendWater.png",
	"Fire-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c5/Icon_LegendFire.png",
	"Wind-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/28/Icon_LegendWind.png",
	"Earth-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendEarth.png",
	"Light-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/51/Icon_LegendLight.png",
	"Dark-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/72/Icon_LegendDark.png",
	"Astra-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/7b/Icon_LegendHeaven.png",
	"Anima-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/df/Icon_LegendLogic.png"
}

other = {
	"normalbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9d/BG_DetailedStatus.png",
	"summonerbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Summoner_Support_Background.png",
	"resplendent": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b8/Icon_GodWear_L.png"
}

download()
