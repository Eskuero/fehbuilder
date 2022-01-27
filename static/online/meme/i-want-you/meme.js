 
async function memedraw() {
	// Get epoch as rendering ID
	let renderingid = new Date().getTime();
	// Put our rendering ID on queue
	renderingqueue.push(renderingid);
	// Until our rendering ID is the first, wait and check again in 100ms
	while (renderingqueue[0] != renderingid) {
		await sleep(100);
	}
	// Cleanly hide all canvas except portrait
	document.getElementById("fakecanvas").style.display = "initial";
	document.getElementById("fakecanvascond").style.display = "none";
	document.getElementById("fakecanvasechoes").style.display = "none";
	selecttemplate.value = "MyUnit";
	
	// Obtain the object
	var preview = document.getElementById("fakecanvas").getContext("2d");

	// Print the propaganda
	await getimage("../online/meme/cartel.webp", "/common/base/missigno.webp").then(img => {
		preview.drawImage(img, 0, 0);
	});
	
	// Clean the queue
	renderingqueue.shift();
}

function opencyl() {
	window.open("https://vote6.campaigns.fire-emblem-heroes.com/en-US/hero/107017");
}
