import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { createServer } from "http";
import Papa from 'papaparse';
import fs from "fs";
import mysql from "mysql";

const app = express();
const httpServer = createServer(app);
const ioServer = new Server(httpServer);
const __filename = fileURLToPath(import.meta.url);
const __server = dirname(__filename);
const __public = join(__server, "/public");
const db = mysql.createConnection({
  host: "34.41.216.29",
  user: "root",
  password: "jN@:f)ky\"Q?'cl?^",
  database: "score", // comment out if running example 1
});

// Establish connection with the DB
db.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log(`Successfuly connected to the DB!`);
  }
});
// This variable is used to prevent more than 10 players from joining the game.
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

app.use(express.static(__public));

app.get("/", (req, res) => {
	res.sendFile(join(__public, "/html/game.html"));
});

app.get("/scores", (req, res) => {
	res.sendFile(join(__public, "/html/scores.html"));
});

app.get("/highscores", (req, res) => {
	res.sendFile(join(__public, "/html/highscores.html"));
});

app.get('/players', (req, res) => {
	res.send(players);
});

app.get('/scorelist', (req, res) => {
	let sql_list =  'SELECT * FROM score_list';
	let query = db.query(sql_list, function (err, result) {
		if (err) {
				throw err;
			} else {
				console.log(result)
				res.send(result)
				// Object.keys(result).forEach(function(key) {
				// 	var row = result[key];
				// 	console.log(row)
				// });
			}
		});
	// fs.readFile('data.csv', 'utf8', (err, data) => {
	// 	if (err) {
	// 		console.error(err);
	// 		return;
	// 	}
	// 	Papa.parse(data, {
	// 		delimiter: "|",
	// 		header: true,
	// 		skipEmptyLines: true,
	// 		complete: function(results) {
	// 			let scorelist = results.data;
	// 			console.log(scorelist);
	// 			res.send(scorelist);
	// 		}
	// 	});
	// });
});

ioServer.on('connection', (socket) => {
	console.log('A client connected');
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
		//set up json for sql storage
		let sql_data = { name: playerName, date: currentTimestamp, data: scoreGraph.toString() };
		let sql_query = `INSERT INTO score_list SET ?`;
		//code that inserts the data into the database using the query above
		let query = db.query(sql_query, sql_data, (err, result) => {
			if (err) {
					throw err;
				} else {
					console.log("Data saved");
				}
			});
		// old data storage implementation
		// fs.appendFileSync("data.csv", playerName + "|" + currentTimestamp + "|[" + scoreGraph + "]\n", "utf-8", (err) => {
		// 	if (err) console.log(err);
		// 	else console.log("Data saved");
		// });

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
