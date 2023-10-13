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
let playerCount = 0;
let clientCount = 0;

app.use(express.static(__public));

app.get("/", (req, res) => {
	res.sendFile(join(__public, "/html/index.html"));
});

io.on('connection', (socket) => {
	console.log('A client connected');
	clientCount++;

	// Emit the current number of players to the front end
	socket.emit('playerCount', playerCount);

	socket.on('disconnect', () => {
		console.log('a client disconnected');
		clientCount--;

		// If the disconnected client was a player, decrement the player count
		if (socket.isPlayer) {
			playerCount--;
			// Emit the current number of connected clients to all clients
			io.emit('playerCount', playerCount);
		}
	});

	socket.on('joinGame', () => {
		console.log('a player joined the game');
		socket.isPlayer = true;
		playerCount++;
		io.emit('playerCount', playerCount);
	});

	socket.on('pixels', (msg) => {
		console.log(msg);
	});
});

server.listen(3000, () => console.log("Server started on port 3000"));