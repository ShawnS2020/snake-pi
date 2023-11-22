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
    const lastEntryA = a.data[a.data.length - 2];
    const lastEntryB = b.data[b.data.length - 2];

    // Compare numeric values directly
    return lastEntryB - lastEntryA;
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

        // Populate cells with data from JSON
        cell1.innerHTML = item.name;
        const timestamp = new Date(item.time * 1000);
        cell2.innerHTML = dateTimeFormat.format(timestamp);
        cell3.innerHTML = item.data[item.data.length - 2];
    });
}

// Call the function with your JSON data
populateTable(scorelist);
