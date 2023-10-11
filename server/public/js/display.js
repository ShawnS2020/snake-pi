const container = document.getElementsByClassName("container")[0];
const row1 = document.getElementsByClassName("row")[0];
const row2 = document.getElementsByClassName("row")[1];
const gameBoards = [];

container.style.height = window.innerHeight + "px";

// Create 6 player spaces
// A player space contains a game board and a player name
for (let i = 0; i < 6; i++) {
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

    if (i < 3) {
        row1.appendChild(playerSpace);
    } else {
        row2.appendChild(playerSpace);
    }
}