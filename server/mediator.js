import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { io as ioClient } from "socket.io-client"
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
const ioServer = new Server(httpServer);
const __filename = fileURLToPath(import.meta.url);
const __server = dirname(__filename);
const __public = join(__server, "/public");

app.use(express.static(__public));

const mediatorSocket = ioClient.connect('https://presently-fresh-kingfish.ngrok-free.app');

mediatorSocket.on('connect', () => {
    console.log('Connected to server');

    mediatorSocket.on('startGame', () => {
        ioServer.emit('startGame');
    });

    mediatorSocket.on('stopGame', () => {
        ioServer.emit('stopGame');
    });
})

ioServer.on('connection', (playerSocket) => {
	console.log('A client connected');
    let name = '';

    playerSocket.on('disconnect', () => {
		console.log(`${name} disconnected`);
        mediatorSocket.emit('playerDisconnect', name);
    });

    playerSocket.on('joinGame', (playerName) => {
        console.log(`${playerName} joined the game`);
        name = playerName;
        mediatorSocket.emit('joinGame', playerName);
    });

	playerSocket.on('pixels', (pixels) => {
        mediatorSocket.emit('pixels', pixels);
    });
});

httpServer.listen(8080, () => console.log("Server started on port 8080"));