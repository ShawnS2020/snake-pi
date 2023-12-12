# Snake Game for Raspberry Pi with Sense HAT

## Overview
This project implements the classic arcade game Snake on the Raspberry Pi's Sense HAT using Python, introducing a unique gyroscopic control mechanism.  
Players have two different game modes to select from. In single player mode, the game simply displays on the Raspberry Pi's Sense Hat.  
In multiplayer mode, players connect to a web server from their Pi. Another computer is needed to display, start, and stop the game as well as display scores at the end of a game. On the web front end, players are able to see their Sense HAT appear on screen.  
The web server was created using Node.js and Express, showcasing real-time data from the Sense HAT's LED array. Player input is monitored using the socket.io library for bidirection communication between players and the server.  

## Project structure
### In the project's root folder you will find...
1. The multiplayer submodule (contents described below).
2. The server directory containing all files pertinent to hosting the server on your own (details below).
3. snake.py, the game's entry point. Running this script will open a terminal menu for selecting between single player and multiplayer.
4. snake_single.py, the single player script.
5. Score files left over from milestone 1 before we transferred over to a server.
6. Various package manager and git files.

### multiplayer-snake submodule
1. mediator.js, a proxy server for connecting to the multiplayer server when your Pi does not have internet.
2. snake_multi.py, the multiplayer script.
3. Various package manager and git files.

### server directory
1. server.js, the multiplayer server.
2. public directory containing HTML, CSS, and JS files for the front end.
3. test_client.js, a script for testing.
4. Package manager files.