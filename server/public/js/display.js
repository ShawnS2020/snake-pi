const container = document.getElementsByClassName("container")[0];
const row1 = document.getElementsByClassName("row")[0];
const row2 = document.getElementsByClassName("row")[1];
const gameBoards = [];

container.style.height = window.innerHeight + "px";

for (let i = 0; i < 6; i++) {
    const playerSpace = document.createElement('div');
    playerSpace.classList.add('player-space');
    const playerName = document.createElement('h1');
    playerName.classList.add('player-name');
    playerName.innerText = 'Player ' + (i + 1);
    const gameBoard = document.createElement('div');
    gameBoard.classList.add('game-board');
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