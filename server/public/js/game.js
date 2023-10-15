const body = document.getElementsByTagName("body")[0];
body.style.height = window.innerHeight + "px";
const container = document.getElementsByClassName("container")[0];
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const scoresBtn = document.getElementById("scores");
let players = []

const socket = io();

// Gets an array of player names from the server and updates the display.
const getPlayerNames = () => {
    socket.on('updatePlayers', (updatedPlayers) => {
        players = updatedPlayers;
        refreshDisplay();
    });
};

socket.on('connect', () => {
    console.log('Connected to server');
    getPlayerNames();
});

startBtn.addEventListener('click', () => {
    socket.emit('startGame');
});

stopBtn.addEventListener('click', () => {
    socket.emit('stopGame');
});

scoresBtn.addEventListener('click', () => {
    window.location.href = '/scores';
});

// This function is called whenever a player joins or leaves the game and whenever a player's game loops.
// It clears the container and creates a game board for each player that is currently connected.
const refreshDisplay = () => {
    // Clear the container before adding game boards to ensure that no duplicates are created.
    container.innerHTML = '';
    // Create a game board for each player that is currently connected.
    for (let i = 0; i < players.length; i++) {
        const playerSpace = document.createElement('div');
        const gameBoard = document.createElement('div');
        const playerName = document.createElement('h1');

        playerSpace.classList.add('player-space');
        gameBoard.classList.add('game-board');
        playerName.classList.add('player-name');
        playerName.innerText = players[i].name;

        // Create 8 rows of 8 cells each
        let cellNum = 0;
        for (let j = 0; j < 8; j++) {
            const gameRow = document.createElement('div');
            gameRow.classList.add('game-board-row');

            for (let k = 0; k < 8; k++) {
                const gameCell = document.createElement('div');
                gameCell.classList.add('game-board-cell');
                // Only set the background color if the player has submitted pixels.
                if (players[i].pixels.length != 0) {
                    let rgb = players[i].pixels[cellNum];
                    gameCell.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                }
                gameRow.appendChild(gameCell);
                cellNum ++;
            }
            gameBoard.appendChild(gameRow);
        }
        playerSpace.append(gameBoard, playerName);
        container.appendChild(playerSpace);
    }
};