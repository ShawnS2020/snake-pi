import scores
import matplotlib.pyplot as plt

xnum = []
scorey= []

for x, y in dict(scores.sorted_list).items():
        scorey.append(y)

print(scorey)

for i in range(len(scorey)):
	xnum.append(i+1)

print(xnum)

plt.bar(xnum, scorey)
# #plt.scatter(xs, data_reader.temp)
# #plt.bar(xs, data_reader.temp)
plt.xlabel("Score Placement")
plt.ylabel("Score")
plt.axis((0, 20, 0, 50))
plt.savefig('Score.png')
