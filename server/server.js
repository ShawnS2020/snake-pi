import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
const ioServer = new Server(httpServer);
const __filename = fileURLToPath(import.meta.url);
const __server = dirname(__filename);
const __public = join(__server, "/public");
// This variable is used to prevent more than 10 players from joining the game.
let isGameRunning = false;
// Create an array of colors to assign to players.
// Each element is a 3-tuple of RGB values.
// The colors are Green, Blue, Yellow, Apricot, Cyan, Orange, Pink, Purple, Dark Green, and White.
const colors = [[0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 192, 128], [0, 255, 255], [255, 128, 0], [255, 128, 192], [128, 0, 128], [0, 100, 0], [255, 255, 255]];
let players = [];
class Player {
	constructor(id, name, color) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.pixels = [];
		this.scoreGraph = [];
	}
}

app.use(express.static(__public));

app.get("/", (req, res) => {
	res.sendFile(join(__public, "/html/game.html"));
});

app.get("/scores", (req, res) => {
	res.sendFile(join(__public, "/html/scores.html"));
});

app.get('/players', (req, res) => {
	res.send(players);
});

ioServer.on('connection', (socket) => {
	console.log('A client connected');
	ioServer.emit('updatePlayerCount', players);

	socket.on('disconnect', () => {
		console.log('a client disconnected');
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
});

httpServer.listen(3000, () => console.log("Server started on port 3000"));