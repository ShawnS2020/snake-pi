const socket = io();
const roster = document.getElementsByClassName("roster")[0];
const startBtn = document.getElementsByClassName("start-button")[0];
const stopBtn = document.getElementsByClassName("stop-button")[0];

startBtn.addEventListener('click', () => {
    socket.emit('startSlitherio');
});

stopBtn.addEventListener('click', () => {
    socket.emit('stopSlitherio');
});

/*** Play from the front end for testing purposes only ***/
// socket.on('getMovement', playerId => {
//     if (playerId != 0) return;
//     let key = '';
//     function keydownHandler(e) {
//         if ((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
//             key = e.key;
//             socket.emit('movement', { playerId: playerId, key: key });
//         }
//     };
// 
//     document.addEventListener('keydown', keydownHandler);
// });

const gameBoard = document.getElementsByClassName('game-board')[0];
// Create the game board.
for (let i = 0; i < 20; i++) {
    const row = document.createElement('div');
    row.classList.add('game-board-row');
    gameBoard.appendChild(row);

    for (let j = 0; j < 40; j++) {
        const cell = document.createElement('div');
        cell.classList.add('game-board-cell');
        row.appendChild(cell);
    }
}

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('updatePlayerCount', (players) => {
    roster.innerHTML = '';
    for (let i = 0; i < players.length; i++) {
        const player = document.createElement('div');
        player.classList.add('player');
        player.style.backgroundColor = `rgb(${players[i].color[0]}, ${players[i].color[1]}, ${players[i].color[2]})`;
        player.innerText = players[i].name;
        roster.appendChild(player);
    }
});

socket.on('updateBoard', (boardArray) => {
    updateBoard(boardArray);
});

function updateBoard(boardArray) {
    // update the game board cells corresponding to the indices of elements in boardArray that are not null
    for (let i = 0; i < boardArray.length; i++) {
        let rgb = boardArray[i];
        let row = Math.floor(i / 40);
        let col = i % 40;
        gameBoard.children[row].children[col].style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
}