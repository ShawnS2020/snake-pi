# snake-pi

## Hosting a multiplayer server

**To do...**

## Running without internet connection on your Raspberry Pi

**This option is for people who want to play the game without connecting their Raspberry Pi to the internet.**
- Follow these instructions on your local machine that you are using to SSH into your Raspberry Pi.
- Install NodeJS.
- Run the mediator server, mediator.js, on your local machine that is connected to the internet: `node mediator.js`
- This server will relay WebSocket events from your Pi to the machine hosting the multiplayer server.
- SSH into your Raspberry Pi from your local machine using remote port forwarding from port 3000 to 8080.
- The command for this is: `ssh -R 3000:localhost:8080 [your-username]@raspberrypi.local`
- Follow the instructions below for running the game and connecting to the server.

## Running the game

- Follow these instructions on your Raspberry Pi.
- Download the game files from GitHub: https://github.com/ShawnS2020/multiplayer-snake.git
- Install the Sense HAT library: `sudo apt-get install sense-hat`
- Install other dependencies: navigate into the project folder and use the command `pip install -r requirements.txt`
- Start the script: `python3 snake_multi.py`
- Follow the prompts to connect to the server and start the game.