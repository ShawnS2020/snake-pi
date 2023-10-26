// *** TODO: figure out why the big chart is not displaying all values ***

const body = document.getElementsByTagName("body")[0];
const container = document.getElementsByClassName("container")[0];
body.style.height = window.innerHeight + "px";
const homeBtn = document.getElementById("home");
const response = await fetch('/players');
let players = await response.json();
console.log(players)

homeBtn.addEventListener('click', () => {
    window.location.href = '/';
});

// // An array of 10 players with random properties for testing.
// players = Array(10).fill(0).map(() => {
//     // Generate a random color in rgb format.
//     let color = [];
//     for (let i = 0; i < 3; i ++) {
//         color.push(Math.floor(Math.random() * 256));
//     }
//     // Generate a random score graph.
//     let randomGraph = [0];
//     // Make length a random number between 20 and 100.
//     let length = Math.floor(Math.random() * 80) + 20;
//     for (let i = 1; i < length; i ++) {
//         let prev = randomGraph[i - 1];
//         let next = Math.random() < 0.5 ? prev : prev + 1;
//         randomGraph.push(next);
//     }
//     return {
//         name: 'Random',
//         color: color,
//         scoreGraph: randomGraph,
//     }
// })

// Individual charts for each player.
for (let i = 0; i < players.length; i ++) {
    const player = players[i];
    console.log(player)
    const chartContainer = document.createElement('div');
    const canvas = document.createElement('canvas');
    chartContainer.classList.add('chart');
    chartContainer.appendChild(canvas);
    container.appendChild(chartContainer);
    console.log('Score: ' + player.scoreGraph[player.scoreGraph.length - 1])
    console.log(player.scoreGraph)

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: player.scoreGraph.map((score, index) => index),
            datasets: [{
                label: player.name,
                data: player.scoreGraph,
                borderWidth: 8,
                borderColor: `rgb(${player.color[0]}, ${player.color[1]}, ${player.color[2]})`,
                pointRadius: 0,
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        color: '#000'
                    },
                    ticks: {
                        color: '#000',
                    },
                    min: 0,
                    max: player.scoreGraph.length - 1,
                },
                y: {
                    grid: {
                        color: '#000'
                    },
                    ticks: {
                        color: '#000',
                        stepSize: 1
                    },
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#000',
                        fontSize: 40,
                        font: {
                            size: 20,
                        }
                    }
                }
            }
        }
    })
}

// A big chart with all players.
const bigChart = document.getElementById('bigChart');

let bigChartDatasets = [];
for (let i = 0; i < players.length; i ++) {
    const player = players[i];
    bigChartDatasets.push({
        label: player.name,
        data: player.scoreGraph,
        borderWidth: 4,
        borderColor: `rgb(${player.color[0]}, ${player.color[1]}, ${player.color[2]})`,
        pointRadius: 0,
    });
}

// Create a variable for the longest score graph.
let longestGraph = players.reduce((longest, player) => {
    return player.scoreGraph.length > longest ? player.scoreGraph.length : longest;
}, 0);
console.log('Longest graph: ' + longestGraph);
new Chart(bigChart, {
    type: 'line',
    data: {
        labels: players[0].scoreGraph.map((score, index) => index),
        datasets: bigChartDatasets
    },
    options: {
        scales: {
            x: {
                grid: {
                    color: '#000'
                },
                ticks: {
                    color: '#000',
                },
                min: 0,
                max: longestGraph - 1,
            },
            y: {
                grid: {
                    color: '#000'
                },
                ticks: {
                    color: '#000',
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#000',
                    fontSize: 40,
                    font: {
                        size: 20,
                    }
                }
            }
        }
    }
});