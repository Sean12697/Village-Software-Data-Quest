window.addEventListener('load', init);

var arr;
var jsonResults = [];
const size = 10;

var startTime;

function init() {
    // download(generateTestData(1000, 1000), 'sample.csv', 'text/plain');
    startTime = new Date().getTime();
    //var values = [15,10,12,7];
    //getData(['ExampleGoldCsv.csv', 'ExampleIronCsv.csv', 'ExampleOilCsv.csv', 'ExampleWheatCsv.csv'], [], values);
    var values = [10, 12, 9, 1.8];
    getData(['GoldCsv.csv', 'IronCsv.csv', 'OilCsv.csv', 'WheatCsv.csv'], [], values);
}

// xml request method specified from: https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function getData(files, strings, values) { // files = array of csv file locations, strings is a blank array filled with file data, values are of the comodities in the order of the csv files
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            strings.push(xmlhttp.responseText); // adds lines of the file at to the array
            if (files.length == 0) crunchData(strings, values); // once all files have been retrived
            if (files.length != 0) getData(files, strings, values); // recursive call, going to next file
        }
    }

    xmlhttp.open("GET", files.pop(), true); // getting the end file and removing it from string array
    xmlhttp.send();
}

function crunchData(strings, values) {
    var arrays = []; // to store the 4 type plots (3D Array)
    for (var i = strings.length; i != 0; i--) arrays.push(intoArray(strings.pop())); // Converts file strings to 2D Arrays and adds
    arrays.reverse(); // Due to the nature of popping strings, reverse will put the pulled last back to the front
    console.log("Values");
    console.log(arrays);

    // Going through every array and multiplying their values by their respective worth
    for (var i = 0; i < arrays.length; i++)
        for (var j = 0; j < arrays[i].length; j++)
            for (var k = 0; k < arrays[i][j].length; k++) arrays[i][j][k] *= values[i]; // 'i' is a type (gold, iron, etc)
    console.log("Total Worth");
    console.log(arrays);

    arr = arrays[0]; // initiating the summed array to the sie
    for (var i = 1; i < arrays.length; i++) // using index 1, since index 0 is the basis of 'arr'
        for (var j = 0; j < arrays[i].length; j++)
            for (var k = 0; k < arrays[i][j].length; k++) arr[j][k] += arrays[i][j][k]; 
    console.log("Summed");
    console.log(arr);

    afterDataCollected();
}

function afterDataCollected() {
    // arrayToCSV(arr);

    // finding the value of every possible plot
    for (var i = 0; i < arr[0].length - size; i++) {
        for (var j = 0; j < arr.length - size; j++) {
            jsonResults.push({
                total: sumOfSize(i, j),
                x: i,
                y: j
            });
        }
    } jsonResults = jsonResults.sort((a, b) => b.total - a.total); // simple lambda function to sort

    var topPlots = []; // shortens from 980,100 plots, since the following function getUniquePlots would take a long time
    for (var i = 0; i < 1000; i++) topPlots.push(jsonResults[i]);
    console.log("Top Plots");
    console.log(topPlots);

    uniquePlots = getUniquePlots(topPlots); // removing overlaps from given plots, which many will be due to the high values in cells in the overlaps
    console.log("Top Unique Plots found in " + (new Date().getTime() - startTime) + "ms!");
    console.log(uniquePlots);
    for (var i = 0; i < 15; i++) console.log('x: ' + (uniquePlots[i].x + 1) + ' y: ' + (uniquePlots[i].y + 1) + ' (' + uniquePlots[i].total + ')');
    drawOnCanvas(uniquePlots);
    // drawPlot(); // Attempted use of plotly
}

function drawOnCanvas(plots) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.scale(0.5, 0.5);
    for (var i = 0; i < plots.length; i++) {
        ctx.fillStyle = randomHex();
        ctx.fillRect(plots[i].x, plots[i].y, size, size);
    } console.log("Drawn Canvas in " + (new Date().getTime() - startTime) + "ms!");
}

// returns a new array of objects, being plots with the greatest value that do not overlap, from given plot array of objects 
function getUniquePlots(plots) {
    var uniquePlots = [];
    for (var i = 0; i < plots.length; i++) {
        var ovrlp = false; // gpi = greaterPlotIndex
        for (var gpi = i - 1; gpi > -1 && !ovrlp; gpi--)
            if (overlap(plots[i], plots[gpi])) ovrlp = true;
        if (!ovrlp) uniquePlots.push(plots[i]);
    } return uniquePlots;
}

// Attempted use at Plotly
function drawPlot() {
    Plotly.d3.csv('combinedValues.csv', function (err, rows) {

        var data = [{
            z: arr,
            type: 'surface'
        }];

        var layout = {
            title: 'Village Data Quest',
            autosize: true,
            width: 500,
            height: 500,
            margin: {
                l: 65,
                r: 50,
                b: 65,
                t: 90,
            }
        };
        Plotly.newPlot('plot', data, layout);
    });
}

// https://stackoverflow.com/questions/1152024/best-way-to-generate-a-random-color-in-javascript
function randomHex() {
    return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
}

// Used once to give summed csv files in testing alone
function arrayToCSV(array) {
    var arrString = "";
    for (var i = 0; i < array.length; i++) {
        if (i != 0) arrString += '\n';
        for (var j = 0; j < array[i].length; j++) arrString += array[i][j];
    } download(arrString, 'combinedValues.csv', 'text/plain');
}

// Assume error correction is done before the call, so x is not on the edge and cannot get further data
function sumOfSize(x, y) {
    var total = 0;
    for (var i = x; i < x + size; i++) {
        for (var j = y; j < y + size; j++) {
            total += parseInt(arr[i][j]);
        }
    } return total;
}

function overlap(plot1, plot2) { // SO MESSY AND ANNOYING BUT WORKS, BLACK BOX THIS FUNCTION
    var xOverlap = false;
    var plot1xs = [];
    for (var i = plot1.x; i < plot1.x + size; i++) plot1xs.push(i);
    var plot2xs = [];
    for (var i = plot2.x; i < plot2.x + size; i++) plot2xs.push(i);
    for (var i = 0; i < size && !xOverlap; i++) xOverlap = plot1xs.includes(plot2xs[i]);

    var yOverlap = false;
    var plot1ys = [];
    for (var i = plot1.y; i < plot1.y + size; i++) plot1ys.push(i);
    var plot2ys = [];
    for (var i = plot2.y; i < plot2.y + size; i++) plot2ys.push(i);
    for (var i = 0; i < size && !yOverlap; i++) yOverlap = plot1ys.includes(plot2ys[i]);

    return (xOverlap && yOverlap);
}


// simply returns a 2D array of data (specified)
function intoArray(lines) {
    var lineArr = lines.split('\n');
    for (var i = 0; i < lineArr.length - 1; i++) lineArr[i] = lineArr[i].split(',');
    return lineArr;
}

// Used to generate csv formatted string of example data, x and y are lengths
function generateTestData(x, y) {
    var buffer = "";
    for (var i = 0; i < y; i++) {
        for (var j = 0; j < x; j++) {
            if (j != 0) buffer += ',';
            buffer += Math.floor(Math.random() * 49);
        }
        buffer += '\n';
    }
    return buffer;
}

// https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function download(data, filename, type) {
    var file = new Blob([data], {
        type: type
    });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}