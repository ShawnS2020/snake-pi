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

app.use(express.static(__public));

app.get("/", (req, res) => {
	res.sendFile(join(__public, "/html/index.html"));
});

io.on('connection', (socket) => {
	console.log('a player connected');
	socket.on('array', (msg) => {
		console.log(msg);
	});
});

server.listen(3000, () => console.log("Server started on port 3000"));