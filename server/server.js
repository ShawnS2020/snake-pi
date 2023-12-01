import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { createServer } from "http";
import Papa from 'papaparse'
import fs from "fs";
import {
	slitherioGame,
	boardArray as slitherioBoardArray,
	setGameOver,
} from "./slitherio_server.js";

const app = express();
const httpServer = createServer(app);
const ioServer = new Server(httpServer);
const __filename = fileURLToPath(import.meta.url);
const __server = dirname(__filename);
const __public = join(__server, "/public");
// This variable is used to prevent players from joining a game that has already started.
let isGameRunning = false;
// Create an array of colors to assign to players.
// Each element is a 3-tuple of RGB values.
// The colors are Green, Blue, Yellow, Apricot, Cyan, Orange, Pink, Purple, Dark Green, and White.
const colors = [[0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 192, 128], [0, 255, 255], [255, 128, 0], [255, 128, 192], [128, 0, 128], [0, 100, 0], [255, 255, 255]];
let players = [];
let scorelist = [];
class Player {
	constructor(id, name, color) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.pixels = [];
		this.scoreGraph = [];
	}
}
class SlitherioPlayer {
	constructor(id, name, color) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.movDelay = 350;
		this.posX = [0];
		this.posY = [0];
		this.prevMovX = 0;
		this.prevMovY = 0;
		this.movX = 0;
		this.movY = 0;
		this.gameOver = false;
	}
}

// Slitherio test players
// for (let i = 0; i < 8; i ++) {
// 	players.push(new SlitherioPlayer(i, `Player ${i + 1}`, colors[i]));
// }

app.use(express.static(__public));

app.get("/", (req, res) => {
	res.sendFile(join(__public, "/html/GameModeSelectScreen.html"));
});

app.get("/classic", (req, res) => {
	res.sendFile(join(__public, "/html/ClassicMultiplayer.html"));
});

app.get("/slitherio", (req, res) => {
	res.sendFile(join(__public, "/html/slitherio.html"));
});

app.get("/scores", (req, res) => {
	res.sendFile(join(__public, "/html/ClassicMultiplayerScores.html"));
});

app.get("/highscores", (req, res) => {
	res.sendFile(join(__public, "/html/ClassicMultiplayerHighScores.html"));
});

app.get('/players', (req, res) => {
	res.send(players);
});

app.get('/scorelist', (req, res) => {
	fs.readFile('server/data.csv', 'utf8', (err, data) => {
	if (err) {
		console.error(err);
		return;
	}
		Papa.parse(data, {
			delimiter: "|",
			header: true,
			skipEmptyLines: true,
			complete: function(results) {
				//console.log(results);
				let scorelist = results.data;
				res.send(scorelist);
			}
		});
	});
});

ioServer.on('connection', (socket) => {
	console.log('A client connected');
	ioServer.emit('updatePlayerCount', players);
	// Emit slitherio data in case the front end is refreshed
	ioServer.emit('updateBoard', slitherioBoardArray);
	ioServer.emit('updatePlayerCount', players);

	socket.on('disconnect', () => {
		console.log('A client disconnected');
		// If the disconnected client was a player, update players and emit the new list for the front end to update.
		if (socket.isPlayer) {
			let i = players.findIndex(player => player.id == socket.playerId);
			players.splice(i, 1);
			ioServer.emit('updatePlayerCount', players);
		}
	});

	// This is a unique event that the mediator server emits when its player disconnects.
	socket.on('playerDisconnect', (playerName) => {
		console.log(`${playerName} disconnected`);
		let i = players.findIndex(player => player.name == playerName);
		players.splice(i, 1);
		ioServer.emit('updatePlayerCount', players);
	});

	// Emitted by snake_multi.py when a player joins the game.
	socket.on('joinGame', (playerName) => {
		// Don't allow more than 10 players.
		if (players.length >= 10 || isGameRunning) {
			socket.emit('gameFull');
			socket.disconnect();
			return;
		}
		console.log(`${playerName} joined the game`);
		socket.isPlayer = true;
		// Find the lowest id that is not already taken.
		let newId = 0;
		while (players.some(player => player.id == newId)) {
			newId ++;
		}
		socket.playerId = newId;
		// Let the player's color be the earliest color that is not already taken.
		let playerColor = colors[0];
		let i = 0;
		while (players.some(player => player.color == playerColor)) {
			i ++;
			playerColor = colors[i];
		}
		let player = new Player(newId, playerName, playerColor);
		players.push(player);
		ioServer.emit('updatePlayerCount', players)
		socket.emit('playerColor', playerColor)
	});

	// Player's LED array is emitted by snake_multi.py every time the game loops.
	socket.on('pixels', (pixels) => {
		let i = players.findIndex(player => player.id == socket.playerId);
		players[i].pixels = pixels;
		let updatedPlayer = players[i];
		ioServer.emit('updatePixels', updatedPlayer);
	});

	// Player's score graph is emitted by snake_multi.py when the player loses.
	socket.on('scoreGraph', (scoreGraph) => {
		let i = players.findIndex(player => player.id == socket.playerId);
		players[i].scoreGraph = scoreGraph;
		//console.log(scoreGraph);
		//let highScore = scoreGraph[scoreGraph.length - 1];
		let playerName = players[i].name;
		let currentTimestamp = Math.floor(new Date().getTime() / 1000);
		fs.appendFileSync("data.csv", playerName + "|" + currentTimestamp + "|[" + scoreGraph + "]\n", "utf-8", (err) => {
			if (err) console.log(err);
			else console.log("Data saved");
		});
	});

	// Emitted by the front end when the user clicks the start button.
	socket.on('startGame', () => {
		isGameRunning = true;
		ioServer.emit('startGame');
	});

	// Emitted by the front end when the user clicks the stop button.
	socket.on('stopGame', () => {
		isGameRunning = false;
		ioServer.emit('stopGame');
	});

	/*** SLITHERIO ***/

	socket.on('joinSlitherio', (playerName) => {
		console.log(`${playerName} joined Slitherio`);
		socket.isPlayer = true;
		// Find the lowest id that is not already taken.
		let newId = 0;
		while (players.some(player => player.id == newId)) {
			newId ++;
		}
		socket.playerId = newId;
		// Let the player's color be the earliest color that is not already taken.
		let playerColor = colors[0];
		let i = 0;
		while (players.some(player => player.color == playerColor)) {
			i ++;
			playerColor = colors[i];
		}
		let player = new SlitherioPlayer(newId, playerName, playerColor);
		players.push(player);
		console.log(players);
		ioServer.emit('updatePlayerCount', players)
		socket.emit('playerColor', playerColor)
	});

	socket.on('startSlitherio', () => {
		ioServer.emit('startSlitherio');
		slitherioGame();
	});

	socket.on('stopSlitherio', () => {
		setGameOver();
		for (let i = 0; i < players.length; i++) {
			players[i].gameOver = true;
		}
	});

	socket.on('movement', movementObj => {
		const { playerId, key } = movementObj;
		const i = players.findIndex(player => player.id == playerId);
		if (key == 'ArrowUp' && players[i].prevMovY != 1) {
			players[i].movX = 0;
			players[i].movY = -1;
		} else if (key == 'ArrowDown' && players[i].prevMovY != -1) {
			players[i].movX = 0;
			players[i].movY = 1;
		} else if (key == 'ArrowLeft' && players[i].prevMovX != 1) {
			players[i].movX = -1;
			players[i].movY = 0;
		} else if (key == 'ArrowRight' && players[i].prevMovX != -1) {
			players[i].movX = 1;
			players[i].movY = 0;
		}
	});
});

httpServer.listen(3000, () => console.log("Server started on port 3000"));

export { ioServer, players }