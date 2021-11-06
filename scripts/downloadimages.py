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
		# Download the art image, make sure it has an alpha channel resize it according to the set config
		art = Image.open(io.BytesIO(response.content)).convert("RGBA").resize(dimensions)
		# We save the images as webp attempting the better compression method while being lossless to avoid quality drops
		art.save(location + icon + ".webp", 'WEBP', lossless = True, quality = 100, method = 6)

icons = {
	# Gameheads
	"0-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d5/Icon_MiniUnit_Head_0.png?96?86",
	"1-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/12/Icon_MiniUnit_Head_1.png?96?86",
	"2-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a2/Icon_MiniUnit_Head_2.png?96?86",
	"3-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6e/Icon_MiniUnit_Head_3.png?96?86",
	"4-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/12/Icon_MiniUnit_Head_4.png?96?86",
	"5-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c8/Icon_MiniUnit_Head_5.png?96?86",
	"6-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d8/Icon_MiniUnit_Head_6.png?96?86",
	"7-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/57/Icon_MiniUnit_Head_7.png?96?86",
	"8-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/80/Icon_MiniUnit_Head_8.png?96?86",
	"9-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/78/Icon_MiniUnit_Head_9.png?96?86",
	"10-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/ff/Icon_MiniUnit_Head_10.png?96?86",
	"11-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/e9/Icon_MiniUnit_Head_11.png?96?86",
	"12-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a9/Icon_MiniUnit_Head_12.png?96?86",
	"13-game": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/0c/Icon_MiniUnit_Head_13.png?96?86",
	# Rarity Borders
	"rarityborder1": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/1f/RarityBorder1.png?259?43",
	"rarityborder2": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/54/RarityBorder2.png?259?43",
	"rarityborder3": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/22/RarityBorder3.png?259?43",
	"rarityborder4": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b9/RarityBorder4.png?259?43",
	"rarityborder5": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a0/RarityBorder5.png?259?43",
	# Ascendent
	"ascendent": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/13/Icon_FlowerBud_L.webp?58?58",
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
	# Accesories
	"Accesory-Hat": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/98/Accessory_Type_hat.png?32?32",
	"Accesory-Hair": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/7c/Accessory_Type_hair.png?32?32",
	"Accesory-Mask": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/ca/Accessory_Type_mask.png?32?32",
	"Accesory-Tiara": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/db/Accessory_Type_tiara.png?32?32",
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
	# Blessings that can be conferred
	"1-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c5/Icon_LegendFire.png?147?160",
	"1-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/70/Map_Unit_Info_Fire_Blessing.png?54?59",
	"2-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2e/Icon_LegendWater.png?147?160",
	"2-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/32/Map_Unit_Info_Water_Blessing.png?54?59",
	"3-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/28/Icon_LegendWind.png?147?160",
	"3-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/ff/Map_Unit_Info_Wind_Blessing.png?54?59",
	"4-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendEarth.png?147?160",
	"4-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/18/Map_Unit_Info_Earth_Blessing.png?54?59",
	"5-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/51/Icon_LegendLight.png?147?160",
	"5-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/f2/Map_Unit_Info_Light_Blessing.png?54?59",
	"6-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/72/Icon_LegendDark.png?147?160",
	"6-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9b/Map_Unit_Info_Dark_Blessing.png?54?59",
	"7-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/7b/Icon_LegendHeaven.png?147?160",
	"7-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2d/Map_Unit_Info_Astra_Blessing.png?54?59",
	"8-Blessing": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/df/Icon_LegendLogic.png?147?160",
	"8-Blessing-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/29/Map_Unit_Info_Anima_Blessing.png?54?59",
	# Blessings locked to Mythic/Legendary heroes
	# Fire
	"1-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/09/Icon_LegendFireAtk.png?147?160",
	"1-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/29/Icon_LegendFireAtkS.png?80?87",
	"1-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c5/Icon_LegendFire.png?147?160",
	"1-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/70/Map_Unit_Info_Fire_Blessing.png?54?59",
	"1-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b6/Icon_LegendFireDef.png?147?160",
	"1-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/df/Icon_LegendFireDefS.png?80?87",
	"1-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/73/Icon_LegendFireRes.png?147?160",
	"1-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2c/Icon_LegendFireResS.png?80?87",
	"1-Blessing-pairup": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8b/Icon_LegendFireBtl.png?147?160",
	"1-Blessing-pairup-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2b/Icon_LegendFireBtlS.png?80?87",
	# Water
	"2-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2a/Icon_LegendWaterAtk.png?147?160",
	"2-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/91/Icon_LegendWaterAtkS.png?80?87",
	"2-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d0/Icon_LegendWaterSpd.png?147?160",
	"2-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/25/Icon_LegendWaterSpdS.png?80?87",
	"2-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d2/Icon_LegendWaterDef.png?147?160",
	"2-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/00/Icon_LegendWaterDefS.png?80?87",
	"2-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/90/Icon_LegendWaterRes.png?147?160",
	"2-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/bc/Icon_LegendWaterResS.png?80?87",
	"2-Blessing-pairup": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/55/Icon_LegendWaterBtl.webp?147?160",
	"2-Blessing-pairup-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/20/Icon_LegendWaterBtlS.webp?80?87",
	# Wind
	"3-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/de/Icon_LegendWindAtk.png?147?160",
	"3-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6f/Icon_LegendWindAtkS.png?80?87",
	"3-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Icon_LegendWindSpd.png?147?160",
	"3-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/41/Icon_LegendWindSpdS.png?80?87",
	"3-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/61/Icon_LegendWindDef.png?147?160",
	"3-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/47/Icon_LegendWindDefS.png?80?87",
	"3-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/ef/Icon_LegendWindRes.png?147?160",
	"3-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/30/Icon_LegendWindResS.png?80?87",
	"3-Blessing-pairup": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendWindBtl.webp?147?160",
	"3-Blessing-pairup-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/17/Icon_LegendWindBtlS.webp?80?87",
	# Earth
	"4-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/34/Icon_LegendEarthAtk.png?147?160",
	"4-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/86/Icon_LegendEarthAtkS.png?80?87",
	"4-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/e2/Icon_LegendEarthSpd.png?147?160",
	"4-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/e2/Icon_LegendEarthSpdS.png?80?87",
	"4-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c7/Icon_LegendEarthDef.png?147?160",
	"4-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c0/Icon_LegendEarthDefS.png?80?87",
	"4-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendEarth.png?147?160",
	"4-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/18/Map_Unit_Info_Earth_Blessing.png?54?59",
	"4-Blessing-pairup": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9a/Icon_LegendEarthBtl.png?147?160",
	"4-Blessing-pairup-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cd/Icon_LegendEarthBtlS.png?80?87",
	# Light
	"5-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/07/Icon_LegendLightAtk.webp?147?160",
	"5-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/53/Icon_LegendLightAtkS.webp?80?87",
	"5-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/f5/Icon_LegendLightSpd.webp?147?160",
	"5-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendLightSpdS.webp?80?87",
	"5-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/32/Icon_LegendLightDef.webp?147?160",
	"5-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a1/Icon_LegendLightDefS.webp?80?87",
	"5-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/95/Icon_LegendLightRes.png?147?160",
	"5-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/ed/Icon_LegendLightResS.png?80?87",
	"5-Blessing-atk-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/69/Icon_LegendLightAtk_02.webp?147?160",
	"5-Blessing-atk-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/52/Icon_LegendLightAtk_02S.webp?80?87",
	"5-Blessing-spd-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/db/Icon_LegendLightSpd_02.webp?147?160",
	"5-Blessing-spd-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/91/Icon_LegendLightSpd_02S.webp?80?87",
	"5-Blessing-def-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/be/Icon_LegendLightDef_02.webp?147?160",
	"5-Blessing-def-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/cf/Icon_LegendLightDef_02S.webp?80?87",
	"5-Blessing-res-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Icon_LegendLightRes_02.webp?147?160",
	"5-Blessing-res-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c4/Icon_LegendLightRes_02S.webp?80?87",
	# Dark
	"6-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/83/Icon_LegendDarkAtk.webp?147?160",
	"6-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/06/Icon_LegendDarkAtkS.webp?80?87",
	"6-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/e9/Icon_LegendDarkSpd.png?147?160",
	"6-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/Icon_LegendDarkSpdS.webp?80?87",
	"6-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a0/Icon_LegendDarkDef.webp?147?160",
	"6-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/84/Icon_LegendDarkDefS.webp?80?87",
	"6-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/3c/Icon_LegendDarkRes.webp?147?160",
	"6-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/ad/Icon_LegendDarkResS.webp?80?87",
	"6-Blessing-atk-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/ca/Icon_LegendDarkAtk_02.webp?147?160",
	"6-Blessing-atk-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8b/Icon_LegendDarkAtk_02S.webp?80?87",
	"6-Blessing-spd-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/55/Icon_LegendDarkSpd_02.webp?147?160",
	"6-Blessing-spd-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/28/Icon_LegendDarkSpd_02S.webp?80?87",
	"6-Blessing-def-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/78/Icon_LegendDarkDef_02.webp?147?160",
	"6-Blessing-def-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/ce/Icon_LegendDarkDef_02S.webp?80?87",
	"6-Blessing-res-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2e/Icon_LegendDarkRes_02.webp?147?160",
	"6-Blessing-res-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/55/Icon_LegendDarkRes_02S.webp?80?87",
	# Astra
	"7-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/ba/Icon_LegendHeavenAtk.webp?147?160",
	"7-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/1b/Icon_LegendHeavenAtkS.webp?80?87",
	"7-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/27/Icon_LegendHeavenSpd.webp?147?160",
	"7-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/ab/Icon_LegendHeavenSpdS.webp?80?87",
	"7-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/6/6a/Icon_LegendHeavenDef.webp?147?160",
	"7-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/52/Icon_LegendHeavenDefS.webp?80?87",
	"7-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/7b/Icon_LegendHeaven.png?147?160",
	"7-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/0f/Icon_LegendHeavenResS.png?80?87",
	"7-Blessing-atk-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/70/Icon_LegendHeavenAtk_02.webp?147?160",
	"7-Blessing-atk-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/e2/Icon_LegendHeavenAtk_02S.webp?80?87",
	"7-Blessing-spd-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/10/Icon_LegendHeavenSpd_02.webp?147?160",
	"7-Blessing-spd-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/f0/Icon_LegendHeavenSpd_02S.webp?80?87",
	"7-Blessing-def-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/41/Icon_LegendHeavenDef_02.webp?147?160",
	"7-Blessing-def-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/fe/Icon_LegendHeavenDef_02S.webp?80?87",
	"7-Blessing-res-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9b/Icon_LegendHeavenRes_02.webp?147?160",
	"7-Blessing-res-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/44/Icon_LegendHeavenRes_02S.webp?80?87",
	# Anima
	"8-Blessing-atk": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/74/Icon_LegendLogicAtk.png?147?160",
	"8-Blessing-atk-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a4/Icon_LegendLogicAtkS.webp?80?87",
	"8-Blessing-spd": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/92/Icon_LegendLogicSpd.webp?147?160",
	"8-Blessing-spd-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/44/Icon_LegendLogicSpdS.webp?80?87",
	"8-Blessing-def": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a4/Icon_LegendLogicDef.webp?147?160",
	"8-Blessing-def-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c8/Icon_LegendLogicDefS.webp?80?87",
	"8-Blessing-res": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/1a/Icon_LegendLogicRes.webp?147?160",
	"8-Blessing-res-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5b/Icon_LegendLogicResS.webp?80?87",
	"8-Blessing-atk-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/0f/Icon_LegendLogicAtk_02.webp?147?160",
	"8-Blessing-atk-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b5/Icon_LegendLogicAtk_02S.webp?80?87",
	"8-Blessing-spd-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2d/Icon_LegendLogicSpd_02.webp?147?160",
	"8-Blessing-spd-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b5/Icon_LegendLogicSpd_02S.webp?80?87",
	"8-Blessing-def-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/59/Icon_LegendLogicDef_02.webp?147?160",
	"8-Blessing-def-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/16/Icon_LegendLogicDef_02S.webp?80?87",
	"8-Blessing-res-extrae": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/dd/Icon_LegendLogicRes_02.webp?147?160",
	"8-Blessing-res-extrae-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/da/Icon_LegendLogicRes_02S.webp?80?87",
	# Supports
	"Support-C": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/88/Icon_Support_Summoner_C.png?147?160",
	"Support-B": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/aa/Icon_Support_Summoner_B.png?147?160",
	"Support-A": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a2/Icon_Support_Summoner_A.png?147?160",
	"Support-S": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8a/Icon_Support_Summoner_S.png?147?160",
	# Duo icons
	"Resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b3/Icon_Resonance.png?147?160",
	"Resonance-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c4/Resonance.png?54?59",
	"Duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/fb/Unit_Duo.png?147?160",
	"Duo-mini": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/3/3a/Duo.png?54?59",
	"DuoConversation": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/e0/DuoConversation.png?90?92",
	# Duo/Resonance combinations
	"1-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/7/78/Fire-duo.png?80?87",
	"1-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/c/c3/Fire-resonance.png?80?87",
	"2-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b8/Water-duo.png?80?87",
	"2-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/85/Water-resonance.png?80?87",
	"3-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/8c/Wind-duo.png?80?87",
	"3-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/ee/Wind-resonance.png?80?87",
	"4-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/89/Earth-duo.png?80?87",
	"4-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/48/Earth-resonance.png?80?87",
	"5-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/bc/Light-duo.png?80?87",
	"5-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/e/ec/Light-resonance.png?80?87",
	"6-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a7/Dark-duo.png?80?87",
	"6-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/8/82/Dark-resonance.png?80?87",
	"7-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/94/Astra-duo.png?80?87",
	"7-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a9/Astra-resonance.png?80?87",
	"8-Blessing-duo": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/dc/Anima-duo.png?80?87",
	"8-Blessing-resonance": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/f/f9/Anima-resonance.png?80?87",
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
	# Rarity
	"rarity1": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/2/2d/Icon_Rarity_1.png?53?53",
	"rarity2": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/55/RarityLine2.png?90?53",
	"rarity3": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/92/RarityLine3.png?126?53",
	"rarity4": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/bf/RarityLine4.png?163?53",
	"rarity5": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/a8/RarityLine5.png?200?53",
	"rarityForma": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/0/02/RarityLineF.png?200?53",
	# Summoning
	"red_orb": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/1/1a/Red_Orb.png?160?160",
	"blue_orb": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/bc/Blue_Orb.png?160?160",
	"green_orb": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/d/d7/Green_Orb.png?160?160",
	"colorless_orb": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/4e/Colorless_Orb.png?160?160",
	# Other
	"normalbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/9/9d/BG_DetailedStatus.png?1067?1280",
	"summonerbg": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5c/Summoner_Support_Background.png?1067?1280",
	"summoningaltar": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/4/42/BG_Summon_Stone.png?1067?1280",
	"resplendent": "https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/b/b8/Icon_GodWear_L.png?82?82"
}

download()
