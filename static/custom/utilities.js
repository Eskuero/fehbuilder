// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

async function getimage(url, fallback = "/common/base/oopsie.webp") {
	// This premise will not return until the image has fully loaded
	const imageLoadPromise = new Promise(resolve => {
		img = new Image();
		img.src = url;
		img.onload = resolve;
		// We failed to download the image so fallback to the provided or default 1x1 transparent image
		img.onerror = function () {
			console.log("Download of " + url + " went bad, using fallback image");
			this.src = fallback;
		};
	});
	await imageLoadPromise;
	// Once done return the new object
	return img;
}

function download() {
	// Hero ID
	hero = selecthero.value.split(":");
	// Convert canvas to a data url
	var url = document.getElementById("fakecanvas").toDataURL("image/png");
	// Get desired filename
	truename = (hero[0] ? " - " + hero[0] : "") + (hero[1] ? " - " + hero[1] : "");
	// Create the link element to force the download
	var link = document.createElement('a');
	link.href = url;
	link.download = "Custom Unit" + truename;
	// Add the link, click it to force download and delete it again
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function showhelp() {
	alert("These are some instructions and explanations for the Custom Unit Builder:\n\n- You can choose a base skill for each category from the already existing ones in the game and it will automatically fill name and visible stats for ease of customization.\n\n- The game calculates level 40 stats with the following procedure:\n\n1. Take level 1 stats and add +1/-1 on boons/banes.\n2. Take growths percentages and add +5/-5 on boons/banes.\n3. Increase two stats (or three for neutral IVs) for every merge taking priority stats with highest values.\n4. Increase one stat for every flower taking priority the stat with the highest value.\n5. Apply a formula with the modified growth rates obtaining the total growth values for the remaining 39 levels and add it to the level 1 values we got after the 4 first steps.\n\nThis means that since the unit we are generating is fake we do not have neither level 1 values nor growth percentages and have to disregard that entire process.\n\nFor that reason this builder uses as level 40 stats the values provided in the input boxes of the stats section and MERGES/FLOWERS/BOONS/BANES VALUES FROM THE UNIT SECTION ONLY HAVE A COSMETIC EFFECT on the generated hero.\n\nTo theorycraft an already existing unit with different art (per example to showcase an unreleased resplendent) the suggestion is to generate the desired stats on the normal builder and then copy those over.");
}

// Visible stats from having Summoner Support
summonerranks = {
	"C": [3, 0, 0, 0, 2],
	"B": [4, 0, 0, 2, 2],
	"A": [4, 0, 2, 2, 2],
	"S": [5, 2, 2, 2, 2]
}

// Canvas position to render images passive icons at
passiverender = {
	"A": {"icon": [369, 945], "text": [420, 954], "indicator": [396, 966]},
	"B": {"icon": [369, 994], "text": [420, 1003], "indicator": [396, 1016]},
	"C": {"icon": [369, 1043], "text": [420, 1053], "indicator": [396, 1066]},
	"S": {"icon": [369, 1093], "text": [420, 1103], "indicator": [396, 1116]}
}

// Function that prints certain numbers using numberfont spritesheet
function printnumbers(canvas, characters, type, posX, posY, align = "start") {
	if (typeof characters == "number") {
		// Split the full number on individual ones
		numbers = characters.toString().split("").map(Number);
		// We have an offset that we must increment with every number to keep pushing each to the left and avoid overlaps
		offsetX = 0;
		// We invert the order of the loop depending on the type of alignment
		if (align == "end") {
			for (j = numbers.length - 1; j >= 0; j--) {
				// This is the size that the number will take ()
				width = numberfontrender["end"][numbers[j]] - numberfontrender["start"][numbers[j]];
				// Since we are aligning to the end the actual drawing position on the X coordinate is the posX - width - offset
				trueposX = posX - (width + offsetX);
				// We must crop the numbers at a certain position depending on type and value
				sourceX = numberfontrender["start"][numbers[j]]; sourceY = type * 28;
				// Increase the offset before the next interation using the number width (-3 to make sure we fill the gaps)
				offsetX += width - 3;
				// Print the number
				canvas.drawImage(numberfont, sourceX, sourceY, width, 28, trueposX, posY, width, 28);
			}
		} else {
			for (j = 0; j < numbers.length; j++) {
				// This is the size that the number will take ()
				width = numberfontrender["end"][numbers[j]] - numberfontrender["start"][numbers[j]];
				// Since we are aligning to the end the actual drawing position on the X coordinate is the posX - width - offset
				trueposX = posX + offsetX;
				// We must crop the numbers at a certain position depending on type and value
				sourceX = numberfontrender["start"][numbers[j]]; sourceY = type * 28;
				// Increase the offset before the next interation using the number width (-3 to make sure we fill the gaps)
				offsetX += width - 3;
				// Print the number
				canvas.drawImage(numberfont, sourceX, sourceY, width, 28, trueposX, posY, width, 28);
			}
		}
	// Otherwise we are just printing a simple + or -
	} else {
		// We must crop the character at a certain position depending on type and value
		sourceX = characters == "+" ? 248 : 271; sourceY = 3 + (type * 6) + (type * 22);
		// Print the number
		canvas.drawImage(numberfont, sourceX, sourceY, 22, 22, posX, posY, 22, 22);
	}
}

// Position on the X coordinate at which each number of numberfont start and ends (for the Y coordinate it's a simple type x 28px)
numberfontrender = {
	"start": [0, 22, 45, 68, 90, 113, 136, 158, 181, 203],
	"end": [22, 44, 67, 90, 112, 135, 158, 180, 203, 225]
}
