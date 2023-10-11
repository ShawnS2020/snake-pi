from csv import reader
import matplotlib.pyplot as plt

scores = []
timestamp = []
scorelist = {}

with open('scores.csv', newline='') as f:
    data_reader = reader(f)
    first_line = 0

    for row in data_reader:
        scores.append(int(row[0]))
        timestamp.append(row[1])
        first_line += 1

    for x in range(len(scores)):
        scorelist[timestamp[x]] = scores[x]

    print(scorelist)
    sorted_list = sorted(scorelist.items(), key=lambda x:x[1], reverse = True)
    print(sorted_list)

    print ("High Scores:")
    for x, y in dict(sorted_list).items():
        print("Score: " + str(y) + "    \tDate: " + str(x))
