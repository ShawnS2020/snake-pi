// *** TODO: figure out why the big chart is not displaying all values ***

const body = document.getElementsByTagName("body")[0];
const container = document.getElementsByClassName("container")[0];
body.style.height = window.innerHeight + "px";
const homeBtn = document.getElementById("home");
const response = await fetch('/players');
let players = await response.json();
console.log(players)
const response2 = await fetch('/scorelist');
let scorelist = await response2.json();
console.log(scorelist)

homeBtn.addEventListener('click', () => {
    window.location.href = '/';
});

const dropdown = document.getElementById("myDropdown");

async function populateDropdown() {
    const response = await fetch("/scorelist");
    const scorelist = await response.json();
    console.log(scorelist);

    // Clear existing options
    dropdown.innerHTML = "";

    // Add a default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "Select an option";
    dropdown.appendChild(defaultOption);

    // Populate options from the array of JSON data
    const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
    });

    for (let i = 0; i < scorelist.length; i++) {
        const option = document.createElement("option");
        const timestamp = new Date(scorelist[i].time * 1000);
        option.value = scorelist[i].time; // Use the "time" key
        option.text = dateTimeFormat.format(timestamp);
        dropdown.appendChild(option);
    }
}

// Call the populateDropdown function to initialize the dropdown
populateDropdown();

// An array of 10 players with random properties for testing.
// players = Array(10).fill(0).map(() => {
//     // Generate a random color in hex format.
//     let color = '#';
//     for (let i = 0; i < 3; i ++) {
//         let component = Math.floor(Math.random() * 256).toString(16);
//         if (component.length == 1) {
//             component = '0' + component;
//         }
//         color += component;
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

// Function to update the big chart with game data
function updateBigChart(gamesData, chart) {
    // Clear existing datasets
    bigChart.data.datasets = [];

    // Add datasets for each player's scoreGraph
    for (const playerData of gamesData) {
        bigChart.data.datasets.push({
            label: playerData.name,
            data: playerData.scoreGraph,
            borderWidth: 4,
            borderColor: `rgb(${playerData.color[0]}, ${playerData.color[1]}, ${playerData.color[2]})`,
            pointRadius: 0,
        });
    }

    // Update chart axes based on the new data
    bigChart.options.scales.x.max = gamesData[0].scoreGraph.length - 1;
    bigChart.update();
}

// Event listener for the dropdown change event
dropdown.addEventListener('change', (event) => {
    const selectedTimestamp = event.target.value;

    if (selectedTimestamp) {
        console.log('Selected Timestamp:', selectedTimestamp);

        // Filter the scorelist array for the selected timestamp
        const gamesData = scorelist.filter(item => item.time == selectedTimestamp)[0].data;

        console.log('Filtered Game Data:', gamesData);

        if (gamesData && gamesData.length > 0) {
            console.log('Updating Big Chart with Game Data:', gamesData);
            updateBigChart(gamesData, bigChart);
        } else {
            console.error('No game data found for the selected timestamp.');
        }
    }
});


// Continue with the rest of your code...
