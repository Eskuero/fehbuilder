# FEH BUILDER
Tool that mimics hero builds from the Fire Emblem Heroes game. It uses the Pillow Python library for generating the picture after the user interacts and send the data on a webpage.
All hero/weapon/passive data is obtained by querying the public non-official wiki API, so please help maintain this tool by keeping the wiki updated

The application is still in a rough state so the code quality is low and may contain bugs on stat calculation, missing icons for the skills/weapons and a long etc. Please use the report bug feature on this repository.

## Setting up

You can host this app yourself by following the next steps (no technical explication or configuration examples are provided for now):
1. Clone this source code
2. Run the units.py, skills.py, downloadimages.py and other.py from the scripts folder to obtain the most recent data from the wiki (the current one as of 18/07/2021 is included in this repo)
3. Ideally you want to replace the Roboto font included under the data folder with the Heroes own font for more fidelity. However I'm uncertain of the nature of the license for that file so it cannot be shared and it's up to you to look it up.
4. Setup nginx/apache or whatever your webserver of choice is to serve the static folder normally
5. Setup the python application so it listens and serves the image generation requests. A Dockerfile is provided for ease of setup
```
sudo docker build -t=fehbuilder .;
sudo docker run -d --rm --name=fehbuilder -p 8000:8000 -v $(pwd)/data:/data fehbuilder
```
6. Add a configuration on your webserver so all requests to /get_image.png are redirected to your local webserver at port 8000
7. Everything should be working now. Don't hesitate to ask questions.

## License
All python, javascript, html and css code in this repository is licensed under GPL3. You are free to modify and redistribute it as long as you provide the modified code to the users of your distribution. Please refer to the include LICENSE file for more details.
The Roboto font included is licensed by Google under Apache License, Version 2.0. Please refer to https://fonts.google.com/specimen/Roboto#license
