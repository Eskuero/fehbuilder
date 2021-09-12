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

import json
import utils

pools = {
	"5starpool": [],
	# The special rate pool has to be manually updated since the wiki data is not reliable
	"4starspecialpool": ['PID_アルム', 'PID_アメリア', 'PID_アイラ', 'PID_アクア', 'PID_セリカ', 'PID_魔女セリカ', 'PID_総選挙セリカ', 'PID_クロム2', 'PID_ディアドラ', 'PID_デューテ', 'PID_ドルカス', 'PID_エイリーク2', 'PID_エルトシャン', 'PID_エリンシア', 'PID_エリーゼ', 'PID_エフラム', 'PID_総選挙エフラム', 'PID_エフィ', 'PID_ジェニー', 'PID_グレイ', 'PID_暗黒ハーディン', 'PID_総選挙ヘクトル', 'PID_ヘクトル', 'PID_ヒノカ2', 'PID_ヒノカ', 'PID_総選挙アイク', 'PID_アイク', 'PID_ヒーニアス', 'PID_イシュタル', 'PID_ジャファル', 'PID_ユリア', 'PID_カンナ女', 'PID_カレル', 'PID_カアラ', 'PID_カタリナ', 'PID_リーフ', 'PID_リーン', 'PID_レオン', 'PID_リンダ', 'PID_総選挙ルキナ', 'PID_ルキナ', 'PID_ルーク', 'PID_ルーテ', 'PID_総選挙リン', 'PID_リン', 'PID_マリアベル', 'PID_ワユ', 'PID_ミカヤ', 'PID_ミネルバ', 'PID_ミスト', 'PID_マーク女', 'PID_ミルラ', 'PID_ネフェニー', 'PID_ニニアン', 'PID_ニノ2', 'PID_オリヴィエ2', 'PID_オルエン', 'PID_オルエン2', 'PID_ラインハルト2', 'PID_シャラ', 'PID_邪竜ルフレ男', 'PID_総選挙ロイ', 'PID_リョウマ', 'PID_セーバー', 'PID_サナキ', 'PID_シノノメ', 'PID_ジークベルト', 'PID_シグルド', 'PID_ソニア', 'PID_スミア', 'PID_タクミ', 'PID_ターナ', 'PID_チキ', 'PID_総選挙ヴェロニカ', 'PID_ゼルギウス','PID_夢カミラ','PID_夢カムイ男','PID_夢カムイ女','PID_フローラ','PID_ヘルビンディ味方','PID_ニシキ','PID_フランネル','PID_クリフ','PID_レーギャルン味方','PID_レーヴァテイン味方','PID_リアーネ','PID_レヴィン','PID_ロキ味方','PID_夢ミコト','PID_ニケ','PID_エポニーヌ','PID_オフェリア','PID_ウード','PID_キュアン','PID_キヌ','PID_スルト味方','PID_ティバーン','PID_ベロア','PID_ユルグ'],
	"4starpool": [],
	"3starpool": []
}
# By doing a join between the SummoningAvailability and Units tables we to retrieve all rarities to TagID relation (https://feheroes.fandom.com/api.php?action=cargoquery&tables=SummoningAvailability,Units&join_on=SummoningAvailability._pageName=Units._pageName&fields=Units.TagID,SummoningAvailability.Rarity&where=SummoningAvailability.EndTime+like+%27%252038%25%27&limit=max&offset=0&format=json)
params = dict(
	action = 'cargoquery', limit = 'max', offset = -500, format = 'json',
	tables = 'SummoningAvailability,Units',
	join_on = 'SummoningAvailability._pageName=Units._pageName',
	fields = 'SummoningAvailability._pageName=Name,Units.TagID,SummoningAvailability.Rarity,SummoningAvailability.EndTime',
# Ending date on 2038 is just a way of telling the unit is in the permanent pool
	where = 'SummoningAvailability.EndTime like "%2038%"'
)
# Complete the normal pools using the retrieved values if they are not in the hardcoded special rate pool
for entry in [entry["title"] for entry in utils.retrieveapidata(params)]:
	if entry["TagID"] in pools["4starspecialpool"] or "EID" in entry["TagID"]:
		continue
	pools[entry["Rarity"] + "starpool"].append(entry["TagID"])

with open("summonpools.json", "w") as outfile:
    json.dump(pools, outfile)
