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

const socket = ioClient.connect('presently-fresh-kingfish.ngrok-free.app');

socket.on('connect', () => {
    console.log('Connected to server');
})

ioServer.on('connection', (socket) => {
	console.log('A client connected');
});

ioServer.listen(8080, () => console.log("Server started on port 8080"));