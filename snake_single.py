from sense_hat import SenseHat
import time
import random
from datetime import datetime
from csv import writer

senseHat = SenseHat()
senseHat.clear()

GREEN = (0, 255, 0)
RED = (255, 0, 0)
START_DELAY = 1
MATRIX_MIN_VALUE = 0
MATRIX_MAX_VALUE = 7
MATRIX_SIZE = 8

while True:
    # variables:
    gameOverFlag = False
    growSnakeFlag = False
    generateRandomFoodFlag = False
    snakeMovementDelay = 0.5
    snakeMovementDelayDecrease = -0.02
    score = 0
    # make empty array for use in data file
    sense_data = []

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
    senseHat.show_message("Snake", text_colour = GREEN)
    senseHat.show_letter("3", GREEN)
    time.sleep(1)
    senseHat.show_letter("2", GREEN)
    time.sleep(1)
    senseHat.show_letter("1", GREEN)

    # -----------------------------------
    #             game loop
    # -----------------------------------
    while not gameOverFlag:
        # check if snake eats food:
        if foodPosX == snakePosX[0] and foodPosY == snakePosY[0]:
            growSnakeFlag = True
            generateRandomFoodFlag = True
            snakeMovementDelay += snakeMovementDelayDecrease
            score += 1

        # check if snake bites itself:
        for i in range(1, len(snakePosX)):
            if snakePosX[i] == snakePosX[0] and snakePosY[i] == snakePosY[0]:
                gameOverFlag = True

        # check if game-over:
        if gameOverFlag:
            # print score for debugging purposes
            print("Score: " + str(score))
            # append score when game is over
            sense_data.append(score)
            # append date too
            sense_data.append(datetime.now())
            print(sense_data)
            with open('scores.csv', 'a', newline='') as f:
                data_writer = writer(f)
                data_writer.writerow(sense_data)
            sense_data = []
            score = 0
#             senseHat.show_message("Game Over", text_colour = RED)
#             senseHat.stick.get_events()
#             senseHat.show_message("Play again?: up/down? ")
#             PLAY_AGAIN = input("Play again?: up/down? ")
# 
#             time.sleep(10)
# 
#             if event.direction == 'up':
#                 break
#             else:
#                 exit()
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

        ### loop delay is now handled by the orientation loop! ###
        # snake speed (game loop delay):
        # time.sleep(snakeMovementDelay)