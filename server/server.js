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
const playerNames = [];

app.use(express.static(__public));

app.get("/", (req, res) => {
	res.sendFile(join(__public, "/html/index.html"));
});

io.on('connection', (socket) => {
	console.log('A client connected');
	io.emit('updatePlayers', playerNames);

	socket.on('disconnect', () => {
		console.log('a client disconnected');

		// If the disconnected client was a player, update playerNames and emit the new list for the front end to update.
		if (socket.isPlayer) {
			playerNames.splice(playerNames.indexOf(socket.playerName), 1);
			io.emit('updatePlayers', playerNames);
		}
	});

	socket.on('joinGame', (playerName) => {
		console.log(`${playerName} joined the game`);
		socket.isPlayer = true;
		socket.playerName = playerName;
		playerNames.push(playerName);
		io.emit('updatePlayers', playerNames)
	});

	socket.on('startGame', () => {
		io.emit('startGame');
	});

	socket.on('pixels', (pixels) => {
		// console.log(pixels);
	});
});

server.listen(3000, () => console.log("Server started on port 3000"));