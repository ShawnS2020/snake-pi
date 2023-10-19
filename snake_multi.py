from sense_hat import SenseHat
import time
import random
import socketio

senseHat = SenseHat()
senseHat.clear()
socket = socketio.Client()
GREEN = (0, 255, 0)
RED = (255, 0, 0)
WHITE = (0, 0, 0)
START_DELAY = 1
MATRIX_MIN_VALUE = 0
MATRIX_MAX_VALUE = 7
MATRIX_SIZE = 8
gameOverFlag = False

def game():
    # variables:
    global gameOverFlag
    gameOverFlag = False
    growSnakeFlag = False
    generateRandomFoodFlag = False
    snakeMovementDelay = 0.5
    snakeMovementDelayDecrease = -0.02

    # start delay:
    time.sleep(START_DELAY)

    # set default snake starting position (values are chosen by preference):
    snakePosX = [3]
    snakePosY = [6]

    # generate random food position:
    while True:
        foodPosX = random.randint(0, 7)
        foodPosY = random.randint(0, 7)
        if foodPosX != snakePosX[0] or foodPosY != snakePosY[0]:
            break

    # set default snake starting direction (values are chosen by preference):
    movementX = 0
    movementY = -1

    # Game start screen
    senseHat.show_letter("3", GREEN)
    socket.emit('pixels', senseHat.get_pixels())
    time.sleep(1)
    senseHat.show_letter("2", GREEN)
    socket.emit('pixels', senseHat.get_pixels())
    time.sleep(1)
    senseHat.show_letter("1", GREEN)
    socket.emit('pixels', senseHat.get_pixels())

    # -----------------------------------
    #             game loop
    # -----------------------------------
    while not gameOverFlag:

        socket.emit('pixels', senseHat.get_pixels())

        # check if snake eats food:
        if foodPosX == snakePosX[0] and foodPosY == snakePosY[0]:
            growSnakeFlag = True
            generateRandomFoodFlag = True
            snakeMovementDelay += snakeMovementDelayDecrease

        # check if snake bites itself:
        for i in range(1, len(snakePosX)):
            if snakePosX[i] == snakePosX[0] and snakePosY[i] == snakePosY[0]:
                gameOverFlag = True

        # check if game-over:
        if gameOverFlag:
            break

        # check orientation:
        # for some reason this needs to loop at delay of .05 to read properly
        for i in range(0, round(snakeMovementDelay / .05)):
            o = senseHat.get_orientation()
            pitch = o["pitch"]
            roll = o["roll"]

            if pitch > 20 and pitch < 270 and movementX != 1:
                movement = "left"
                p = pitch
                r = roll
                movementX = -1
                movementY = 0
            elif pitch < 340 and pitch > 270 and movementX != -1:
                movement = "right"
                p = pitch
                r = roll
                movementX = 1
                movementY = 0
            elif roll < 340 and roll > 270 and movementY != 1:
                movement = "up"
                p = pitch
                r = roll
                movementY = -1
                movementX = 0
            elif roll > 20 and roll < 270 and movementY != -1:
                movement = "down"
                p = pitch
                r = roll
                movementY = 1
                movementX = 0
            time.sleep(.05)

        # grow snake:
        if growSnakeFlag:
            growSnakeFlag = False
            snakePosX.append(0)
            snakePosY.append(0)

        # move snake:
        for i in range((len(snakePosX) - 1), 0, -1):
            snakePosX[i] = snakePosX[i - 1]
            snakePosY[i] = snakePosY[i - 1]

        snakePosX[0] += movementX
        snakePosY[0] += movementY

        # check game borders:
        if snakePosX[0] > MATRIX_MAX_VALUE:
            snakePosX[0] -= MATRIX_SIZE
        elif snakePosX[0] < MATRIX_MIN_VALUE:
            snakePosX[0] += MATRIX_SIZE
        if snakePosY[0] > MATRIX_MAX_VALUE:
            snakePosY[0] -= MATRIX_SIZE
        elif snakePosY[0] < MATRIX_MIN_VALUE:
            snakePosY[0] += MATRIX_SIZE

        # spawn random food:
        if generateRandomFoodFlag:
            generateRandomFoodFlag = False
            retryFlag = True
            while retryFlag:
                foodPosX = random.randint(0, 7)
                foodPosY = random.randint(0, 7)
                retryFlag = False
                for x, y in zip(snakePosX, snakePosY):
                    if x == foodPosX and y == foodPosY:
                        retryFlag = True
                        break
         
        # update matrix:
        senseHat.clear()
        senseHat.set_pixel(foodPosX, foodPosY, RED)
        for x, y in zip(snakePosX, snakePosY):
            senseHat.set_pixel(x, y, GREEN)

@socket.event
def connect():
    print('Connected to the server')
    name = input("Enter your name: ")
    socket.emit('joinGame', name)

@socket.on('startGame')
def startGame():
    print('Game started')
    global gameOverFlag
    gameOverFlag = False
    game()

@socket.on('stopGame')
def stopGame():
    print('Game over')
    global gameOverFlag
    gameOverFlag = True

isMediator = input("Is your Pi connected to the internet? (y/n): ")

if (isMediator == 'y'):
    url = 'https://presently-fresh-kingfish.ngrok-free.app'
else:
    url = 'http://localhost:3000'

try:
    socket.connect(url)
    socket.wait()
except:
    print("Could not connect to the server")
    exit()