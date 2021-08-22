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
2. Run the downloadimages.py (this is only needed for the first setup) and renewdata.sh from the scripts folder to obtain the most recent data and assets.
```
$ cd scripts;
```
```
$ python3 downloadimages.py;
```
```
$ sh renewdata.sh
```

3. Ideally you want to replace the Roboto font included under the data folder with the Heroes own font for more fidelity. However I'm uncertain of the nature of the license for that file so it cannot be included in this repo.
4. Setup nginx/apache or whatever your webserver of choice is to serve the static folder normally. I also recommend adding configuration to instruct clients to cache the images longer. This is a sample version:
```
location / {
	root /fehbuilder/static/;
	index index.html;
	location ~* \.(jpeg|jpg|webp|png|woff2)$ {
		expires 365d;
		add_header Cache-Control "public, max-age=31536000";
	}
	location ~* \.(json)$ {
		expires 4h;
		add_header Cache-Control "public, max-age=14400";
	}
}
```
5. Everything should be working now. Don't hesitate to ask questions.
6. OPTIONAL: For allowing generation of the image server-side by sending a request. Setup the python application so it listens and serves the image generation requests. A Dockerfile is provided for ease of setup.
```
# docker build -t=fehbuilder .;
# docker run -d --rm --name=fehbuilder -p 8000:8000 -v $(pwd)/data:/data fehbuilder
```
7. Configure your webserver so all requests to /get_image.png are redirected to your local webserver at port 8000.
```
location /get_image.png {
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
	proxy_set_header Host $http_host;
	proxy_redirect off;
	proxy_pass http://127.0.0.1:8000;
}
```
## License
All Python, Javascript, HTML and CSS code in this repository is licensed under GPL v3. You are free to modify and redistribute it as long as you provide the modified code to the users of your distribution. Please refer to the include LICENSE file for more details.

The Roboto font included is licensed by Google under Apache License, Version 2.0. Please refer to https://fonts.google.com/specimen/Roboto#license
