// *** TODO: figure out why the big chart is not displaying all values ***

const body = document.getElementsByTagName("body")[0];
const container = document.getElementsByClassName("container")[0];
body.style.height = window.innerHeight + "px";
const homeBtn = document.getElementById("home");
const response = await fetch('/scorelist');
let scorelist = await response.json();
//console.log(scorelist)

homeBtn.addEventListener('click', () => {
    window.location.href = '/';
});

// Custom comparison function to sort by the last entry in the array in descending order
function compareByLastEntryDescending(a, b) {

    //console.log(a);
    let parseA = a.data.split(",");
    let parseB = b.data.split(",");
    // if data is empty, set last score to 0
    if (parseA[parseA.length - 1] === "") {
        parseA.push(0);
    }
    if (parseB[parseB.length - 1] === "") {
        parseB.push(0);
    }
    const lastA = parseA[parseA.length - 1]
    const lastB = parseB[parseB.length - 1]
    //console.log(parseA);
    //console.log(parseB);

    // Compare numeric values directly
    return lastB - lastA;
}


// Sort the JSON data using the custom comparison function
scorelist.sort(compareByLastEntryDescending);

// Display the sorted data
//console.log(scorelist);

// Function to populate the table
function populateTable(data) {
    var tableBody = document.getElementById("tableBody");

    // Clear existing rows
    tableBody.innerHTML = '';

    // format object for the dates
    const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
    });

    // Loop through the JSON data and create rows
    data.forEach(function (item, index) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);

        let scoreArray = item.data.split(",")
        let scoreData = scoreArray[scoreArray.length - 1]
        //console.log(scoreData)
        if (scoreData === "") {
            scoreData = 0;
        }

        // Populate cells with data from JSON
        cell1.innerHTML = item.name;
        const timestamp = new Date(item.date * 1000);
        cell2.innerHTML = dateTimeFormat.format(timestamp);
        cell3.innerHTML = scoreData;
    });
}

// Call the function with your JSON data
populateTable(scorelist);
