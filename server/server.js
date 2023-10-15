import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __server = dirname(__filename);
const __public = join(__server, "/public");
const server = createServer(app);
const io = new Server(server);
let players = [];
class Player {
	constructor(id, name, pixels) {
		this.id = id;
		this.name = name;
		this.pixels = pixels;
	}
}

app.use(express.static(__public));

app.get("/", (req, res) => {
	res.sendFile(join(__public, "/html/index.html"));
});

io.on('connection', (socket) => {
	console.log('A client connected');
	io.emit('updatePlayers', players);

	socket.on('disconnect', () => {
		console.log('a client disconnected');

		// If the disconnected client was a player, update players and emit the new list for the front end to update.
		if (socket.isPlayer) {
			let i = players.findIndex(player => player.id == socket.playerId);
			players.splice(i, 1);
			io.emit('updatePlayers', players);
		}
	});

	socket.on('joinGame', (playerName) => {
		console.log(`${playerName} joined the game`);
		socket.isPlayer = true;
		// Find the lowest id that is not already taken.
		let newId = 0;
		while (players.some(player => player.id == newId)) {
			newId ++;
		}
		socket.playerId = newId;
		let player = new Player(newId, playerName, []);
		players.push(player);
		io.emit('updatePlayers', players)
	});

	socket.on('startGame', () => {
		io.emit('startGame');
	});

	socket.on('stopGame', () => {
		io.emit('stopGame');
	});

	socket.on('pixels', (pixels) => {
		let i = players.findIndex(player => player.id == socket.playerId);
		players[i].pixels = pixels;

		io.emit('updatePlayers', players);
	});
});

server.listen(3000, () => console.log("Server started on port 3000"));