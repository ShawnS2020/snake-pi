import { ioServer, players, colors } from './server.js';

// create a variable called boardArray that is an array of 200 null elements
let boardArray = [];
let gameOverFlag = false;

function setGameOver() {
    gameOverFlag = true;
    console.log("Game over");
}

function getPixel(x, y) {
    return boardArray[x + (y * 40)];
}

function setPixel(x, y, color) {
    boardArray[x + (y * 40)] = color;
    ioServer.emit('updateBoard', boardArray);
}

async function generateFood() {
    while (!gameOverFlag) {
        let foodPosX;
        let foodPosY;
        while (1) {
            foodPosX = Math.floor(Math.random() * 39);
            foodPosY = Math.floor(Math.random() * 19);
            const pixel = getPixel(foodPosX, foodPosY);
            if (pixel[0] == 0 && pixel[1] == 0 && pixel[2] == 0) break;
        }
        setPixel(foodPosX, foodPosY, [255, 0, 0]);
        await new Promise(resolve => { setTimeout(resolve, 3000) });
    }
}

function killSnake(snakeIndex) {
    players[snakeIndex].gameOver = true;
    for (let i = 0; i < players[snakeIndex].posX.length; i ++) {
        setPixel(players[snakeIndex].posX[i], players[snakeIndex].posY[i], [255, 0, 0]);
    }
}

async function moveSnake(snakeIndex) {

    // Check if the player's snake still exists (in case they quit) and is not game over.
    while (players[snakeIndex] && !players[snakeIndex].gameOver) {
        // prevMov variables are used in server.js  'movement' event to prevent the snake from turning 180 degrees.
        players[snakeIndex].prevMovX = players[snakeIndex].movX;
        players[snakeIndex].prevMovY = players[snakeIndex].movY;

        // Check for collisions
        const nextPixelX = players[snakeIndex].posX[0] + players[snakeIndex].movX;
        const nextPixelY = players[snakeIndex].posY[0] + players[snakeIndex].movY;
        let nextPixel = getPixel(nextPixelX, nextPixelY);
        if (nextPixelX < 0 || nextPixelX > 39 || nextPixelY < 0 || nextPixelY > 19) {
            // If the snake head is out of bounds, the snake has collided with the wall.
            killSnake(snakeIndex);
            break;
        } else if (nextPixel[0] == 255 && nextPixel[1] == 0 && nextPixel[2] == 0) {
            // If the snake head is on a food pixel, add a new pixel to the snake body and decrease movement delay by 10ms.
            const newLastPixelX = players[snakeIndex].posX[players[snakeIndex].posX.length - 1];
            const newLastPixelY = players[snakeIndex].posY[players[snakeIndex].posY.length - 1];
            players[snakeIndex].posX.push(newLastPixelX);
            players[snakeIndex].posY.push(newLastPixelY);
            setPixel(newLastPixelX, newLastPixelY, players[snakeIndex].color);
            // 250ms is the minimum movement delay.
            if (players[snakeIndex].movDelay > 250) {
                players[snakeIndex].movDelay -= 25;
            }
        } else if (nextPixel[0] != 0 || nextPixel[1] != 0 || nextPixel[2] != 0) {
            // If the snake head is on a pixel that is not food or empty, the snake has collided with another snake.
            killSnake(snakeIndex);
            break;
        }

        // Set the last pixel in the snake's body to black.
        const lastPixelX = players[snakeIndex].posX.length - 1;
        const lastPixelY = players[snakeIndex].posY.length - 1;
        setPixel(players[snakeIndex].posX[lastPixelX], players[snakeIndex].posY[lastPixelY], [0, 0, 0]);
        // Move each pixel in the snake's body to the position of the pixel in front of it.
        for (let i = lastPixelX; i > 0; i--) {
            players[snakeIndex].posX[i] = players[snakeIndex].posX[i - 1];
            players[snakeIndex].posY[i] = players[snakeIndex].posY[i - 1];
        }

        // Move snake head according to movement direction
        const newHeadPosX = players[snakeIndex].posX[0] + players[snakeIndex].movX;
        const newHeadPosY = players[snakeIndex].posY[0] + players[snakeIndex].movY;
        setPixel(newHeadPosX, newHeadPosY, players[snakeIndex].color);
        players[snakeIndex].posX[0] = newHeadPosX;
        players[snakeIndex].posY[0] = newHeadPosY;

        await new Promise(resolve => { setTimeout(resolve, players[snakeIndex].movDelay) });
    }

    // If a player quits, turn their snake into food.
    if (!players[snakeIndex]) {
        // Create an array of each color found in boardArray.
        let colorsInUse = [[0, 0, 0], [255, 0, 0]];
        for (let i = 0; i < players.length; i ++) {
            colorsInUse.push(players[i].color);
        }

        // Compare colorsInUse to colors from server.js to find each color that is not in use.
        let colorsNotInUse = colors.filter(color => !colorsInUse.includes(color));

        // Use getPixel to find the coordinates of any pixels that are a color that is not in use.
        for (let i = 0; i < 39; i++) {
            for (let j = 0; j < 19; j++) {
                let color = getPixel(i, j);
                if (colorsNotInUse.some(colorNotInUse => areColorsEqual(colorNotInUse, color))) {
                    setPixel(i, j, [255, 0, 0]);
                }
            }
        }

        // Custom function to check if two colors are equal
        function areColorsEqual(color1, color2) {
            // Assuming both colors are arrays of the same length
            for (let k = 0; k < color1.length; k++) {
                if (color1[k] !== color2[k]) {
                    return false;
                }
            }
            return true;
        }
    }
}

async function slitherioGame() {
    // Clear board.
    boardArray = Array(800).fill([0, 0, 0]);

    // Spawn snakes.
    for (let i = 0; i < players.length; i ++) {
        // First 4 players start at the top of the board moving down.
        // Last 4 players start at the bottom of the board moving up.
        players[i].movX = 0;
        players[i].movY = i < 4 ? 1 : -1;
        players[i].posX = [((i % 4) * 10) + 4];
        players[i].posY = [i < 4 ? 3 : 16];
        for (let j = 0; j < players[i].posX.length; j ++) {
            setPixel(players[i].posX[j], players[i].posY[j], players[i].color);
        }
    }

    // Asynchronously generate food.
    generateFood();

    // Asynchronously move snakes.
    const movePromises = Array.from({ length: players.length }, async (_, i) => {
        moveSnake(i);
    });
    await Promise.all(movePromises);
}

export { slitherioGame, boardArray, setGameOver, moveSnake };