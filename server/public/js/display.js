const container = document.getElementsByClassName("container")[0];
container.style.height = window.innerHeight + "px";
const gameBoards = [];
let playerCount = 0;

const socket = io();

// Define a function that fetches the player count from the server
const getPlayerCount = () => {
  // Listen for the "playerCount" event emitted by the server
  socket.on('playerCount', (count) => {
    playerCount = count;
    refreshDisplay(playerCount);
  });
};

socket.on('connect', () => {
    console.log('connected to server');
    getPlayerCount();
});

// Create 6 player spaces
// A player space contains a game board and a player name
const refreshDisplay = (playerCount) => {
    // Clear the container before adding game boards to ensure that no duplicates are created.
    container.innerHTML = '';
    // Create a game board for each player that is currently connected.
    for (let i = 0; i < playerCount; i++) {
        const playerSpace = document.createElement('div');
        const gameBoard = document.createElement('div');
        const playerName = document.createElement('h1');

        playerSpace.classList.add('player-space');
        gameBoard.classList.add('game-board');
        playerName.classList.add('player-name');
        playerName.innerText = 'Player ' + (i + 1);

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
        gameBoards.push(gameBoard);

        container.appendChild(playerSpace);
    }
};