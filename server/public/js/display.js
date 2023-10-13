const container = document.getElementsByClassName("container")[0];
container.style.height = window.innerHeight + "px";

const socket = io();

// Gets an array of player names from the server and updates the display.
const getPlayerNames = () => {
  socket.on('updatePlayers', (playerNames) => {
    refreshDisplay(playerNames);
  });
};

socket.on('connect', () => {
    console.log('Connected to server');
    getPlayerNames();
});

// This function is called whenever a player joins or leaves the game.
// It clears the container and creates a game board for each player that is currently connected.
const refreshDisplay = (playerNames) => {
    // Clear the container before adding game boards to ensure that no duplicates are created.
    container.innerHTML = '';
    // Create a game board for each player that is currently connected.
    for (let i = 0; i < playerNames.length; i++) {
        const playerSpace = document.createElement('div');
        const gameBoard = document.createElement('div');
        const playerName = document.createElement('h1');

        playerSpace.classList.add('player-space');
        gameBoard.classList.add('game-board');
        playerName.classList.add('player-name');
        playerName.innerText = playerNames[i];

        // Create 8 rows of 8 cells each
        for (let j = 0; j < 8; j++) {
            const gameRow = document.createElement('div');
            gameRow.classList.add('game-board-row');

            for (let k = 0; k < 8; k++) {
                const gameCell = document.createElement('div');
                gameCell.classList.add('game-board-cell');
                gameRow.appendChild(gameCell);
            }
            gameBoard.appendChild(gameRow);
        }
        playerSpace.append(gameBoard, playerName);
        container.appendChild(playerSpace);
    }
};