# FEH BUILDER
Tool that mimics hero builds from the Fire Emblem Heroes game. It uses the Pillow Python library for generating the picture server side or the canvas functionality on your browser after the user interacts with the webpage.

All static data is obtained by parsing HertzDevil's dumps:

https://github.com/HertzDevil/feh-assets-json

And then obtains the required assests such as heroes art and skills icons from the fandom wiki:

https://feheroes.fandom.com/wiki/Main_Page

## Setting up

You can host this app yourself by following the next steps (no technical explication or configuration examples are provided for now):
1. Clone this source code
```
$ git clone https://github.com/Eskuero/fehbuilder
```
2. Run the images-wiki.py (this is only needed for the first setup) and renewdata.sh from the scripts folder to obtain the most recent data and assets.
```
$ cd scripts/other;
```
```
$ python3 images-wiki.py;
```
```
$ cd ..;
```
```
$ sh renewdata.sh;
```

3. Ideally you want to replace the Roboto font included under the data folder with the Heroes own font for more fidelity. However I'm uncertain of the nature of the license for that file so it cannot be included in this repo.
4. Setup nginx/apache or whatever your webserver of choice is to serve the static folder normally. I also recommend adding configuration to instruct clients to cache the images longer. This is a sample version:
```
location / {
	root /fehbuilder/static/;
	index index.html;
	location ~* \.(jpeg|jpg|webp|png|woff2)$ {
		add_header Cache-Control "max-age=86400, must-revalidate";
	}
	location ~* \.(json|js|css|html)$ {
		add_header Cache-Control "no-cache";
	}
}
```
5. Everything should be working now. Don't hesitate to ask questions.
## License
All Python and Javascript code in this repository is licensed under AGPL v3. You are free to modify and redistribute it as long as you provide the modified code to the users you make it available to (either via distribution or over a network). Please refer to the include LICENSE file for more details.

The Roboto font included is licensed by Google under Apache License, Version 2.0. Please refer to https://fonts.google.com/specimen/Roboto#license
