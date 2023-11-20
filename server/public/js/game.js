const body = document.getElementsByTagName("body")[0];
body.style.height = window.innerHeight + "px";
const container = document.getElementsByClassName("container")[0];
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const scoresBtn = document.getElementById("scores");
const highScoresBtn = document.getElementById("highscores");
let players = [];

const socket = io();

// Gets an array of player names from the server and updates the display.
function updatePlayers() {
    socket.on('updatePlayerCount', (updatedPlayers) => {
        // Update the players array.
        players = updatedPlayers;
        // Update the display.
        updatePlayerBoardCount(players);
    });

    socket.on('updatePixels', (updatedPlayer) => {
        // Find the index of the player that was updated by comparing the id of updatedPlayer to the ids of the players in the players array.
        let i = players.findIndex(player => player.id == updatedPlayer.id);
        // Update this players pixels in the players array.
        players[i].pixels = updatedPlayer.pixels;
        // Update the pixels of this player's board.
        updatePixels(i);
    });
};

socket.on('connect', () => {
    console.log('Connected to server');
    updatePlayers();
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

highScoresBtn.addEventListener('click', () => {
    window.location.href = '/highscores';
});

// Updates the pixels of the player's board at the given index.
// This is called whenever the server receives an event from a player to update their pixels.
function updatePixels(updatedPlayerIndex) {
    // Find the player's game board.
    const playerSpace = container.children[updatedPlayerIndex];
    // Create an array of the game board's cells.
    const gameCells = playerSpace.getElementsByClassName('game-board-cell');
    // Update the background color of each cell.
    for (let i = 0; i < gameCells.length; i++) {
        let rgb = players[updatedPlayerIndex].pixels[i];
        gameCells[i].style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
} 

// Updates the number of player boards displayed.
// This is called whenever a player joins or leaves.
function updatePlayerBoardCount(players) {
    // Clear the container before adding game boards to ensure that no duplicates are created.
    container.innerHTML = '';
    // Create a game board for each player that is currently connected.
    for (let i = 0; i < players.length; i++) {
        const playerContainer = document.createElement('div');
        const playerBoard = document.createElement('div');
        const playerName = document.createElement('h1');

        playerContainer.classList.add('player-space');
        playerBoard.classList.add('game-board');
        playerName.classList.add('player-name');
        playerName.innerText = players[i].name;

        // Create 8 rows of 8 cells each
        for (let j = 0; j < 8; j++) {
            const gameRow = document.createElement('div');
            gameRow.classList.add('game-board-row');

            for (let k = 0; k < 8; k++) {
                const gameCell = document.createElement('div');
                gameCell.classList.add('game-board-cell');
                gameRow.appendChild(gameCell);
            }
            playerBoard.appendChild(gameRow);
        }
        playerContainer.append(playerBoard, playerName);
        container.appendChild(playerContainer);
    }
}
