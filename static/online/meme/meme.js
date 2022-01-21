// Check if the cookie exists
if (document.cookie.indexOf("propaganda") != -1) {
	// It does so leave inmediately
	close();
} else {
	// Set initial background background
	document.getElementById("meme").style.backgroundImage = "url(/online/meme/1.webp)";
}

function moveon(selection) {
	currentscreen = document.getElementById("meme").style.backgroundImage[18];
	switch (currentscreen) {
		case "1":
			// We are the initial screen, if selection is fine show the happy screen and leave after 3 seconds
			if (selection == "yes") {
				document.getElementById("meme").style.backgroundImage = "url(/online/meme/2.webp)";
				document.getElementsByClassName("memeoptions")[0].style.display = "none";
				setcookie();
				setTimeout(function() {
					close();
				}, 3000);
			// Otherwise show the angry screen and prompt again
			} else {
				document.getElementById("meme").style.backgroundImage = "url(/online/meme/3.webp)";
				document.getElementById("option1").innerHTML = "I will vote for you";
				document.getElementById("option2").innerHTML = "Get off my screen!";
			}
		break;
		case "3":
			// We are the final screen, if selection is fine show the happy screen and leave after 3 seconds
			if (selection == "yes") {
				document.getElementById("meme").style.backgroundImage = "url(/online/meme/2.webp)";
				document.getElementsByClassName("memeoptions")[0].style.display = "none";
				setcookie();
				setTimeout(function() {
					close();
				}, 3000);
			// Otherwise leave inmediately
			} else {
				close();
				setcookie();
			}
		break;
	}
}

function setcookie() {
	// Calculate tomorrow's cookie date
	const today = new Date();
	const tomorrow = new Date(today);
	//tomorrow.setMinutes(tomorrow.getMinutes() + 1);
	tomorrow.setDate(tomorrow.getDate() + 1);
	expirydate = tomorrow.toUTCString() 
	document.cookie = "propaganda; expires=" + expirydate;
}

function close() {
	document.getElementById("meme").style.display = "none";
}

