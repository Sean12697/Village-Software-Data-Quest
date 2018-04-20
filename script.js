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
    var values = [10,12,9,1.8];
    getData(['GoldCsv.csv', 'IronCsv.csv', 'OilCsv.csv', 'WheatCsv.csv'], [], values);
}


function crunchData(strings, values) {
    var arrays = [];
    for (var i = strings.length; i != 0; i--) arrays.push(intoArray(strings.pop()));
    arrays.reverse(); // Due to the nature of popping strings, reverse will put the pulled last back to the front
    console.log("Quantities"); console.log(arrays);
    for (var i = 0; i < arrays.length; i++) for (var j = 0; j < arrays[i].length; j++) for (var k = 0; k < arrays[i][j].length; k++) arrays[i][j][k] *= values[i];
    console.log("Values"); console.log(arrays);
    arr = arrays[0];
    for (var i = 1; i < arrays.length; i++) for (var j = 0; j < arrays[i].length; j++) for (var k = 0; k < arrays[i][j].length; k++) arrays[0][j][k] += arrays[i][j][k];
    console.log("Summed"); console.log(arr);
    afterDataCollected();
}

function afterDataCollected() {
    for (var i = 0; i < arr.length - size; i++) {
        for (var j = 0; j < arr[0].length - size; j++) {
            jsonResults.push({ total: sumOfSize(i, j), x: i, y: j });
        }
    } jsonResults = jsonResults.sort((a, b) => b.total - a.total);

    var topPlots = [];
    for (var i = 0; i < 1000; i++) topPlots.push(jsonResults[i]); // do teams * 5 instead of 100 to ensure we claim
    console.log("Top Plots");
    console.log(topPlots);
    uniquePlots = getUniquePlots(topPlots);
    console.log("Top Unique Plots found in " + (new Date().getTime() - startTime) + "ms!");
    console.log(uniquePlots);
    for (var i = 0; i < 15; i++) console.log('x: ' + (uniquePlots[i].x + 1) + ' y: ' + (uniquePlots[i].y + 1) + ' (' + uniquePlots[i].total + ')');
    drawOnCanvas(uniquePlots);
}

function drawOnCanvas(plots) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.scale(0.5,0.5);
    for (var i = 0; i < plots.length; i++) {
        ctx.fillStyle = randomHex();
        ctx.fillRect(plots[i].x, plots[i].y, size, size);   
    } 
    console.log("Drawn Canvas in " + (new Date().getTime() - startTime) + "ms!");
}

function getUniquePlots(plots) {
    var uniquePlots = [];
    for (var i = 0; i < plots.length; i++) {
        var ovrlp = false; // gpi = greaterPlotIndex
        for (var gpi = i-1; gpi > -1 && !ovrlp; gpi--) if (overlap(plots[i], plots[gpi])) ovrlp = true; 
        if (!ovrlp) uniquePlots.push(plots[i]);
    } return uniquePlots;
}

// https://stackoverflow.com/questions/1152024/best-way-to-generate-a-random-color-in-javascript
function randomHex() {
    return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
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
    var plot1xs = []; for (var i = plot1.x; i < plot1.x + size; i++) plot1xs.push(i);
    var plot2xs = []; for (var i = plot2.x; i < plot2.x + size; i++) plot2xs.push(i);
    for (var i = 0; i < size && !xOverlap; i++) xOverlap = plot1xs.includes(plot2xs[i]);

    var yOverlap = false;
    var plot1ys = []; for (var i = plot1.y; i < plot1.y + size; i++) plot1ys.push(i);
    var plot2ys = []; for (var i = plot2.y; i < plot2.y + size; i++) plot2ys.push(i);
    for (var i = 0; i < size && !yOverlap; i++) yOverlap = plot1ys.includes(plot2ys[i]);

    return (xOverlap && yOverlap);
}

// https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function getData(files, strings, values) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();               
    } else {               
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");               
    }

    xmlhttp.onreadystatechange = function () {               
        if (xmlhttp.readyState == 4) {
          strings.push(xmlhttp.responseText);
          if (files.length == 0) crunchData(strings, values);
          if (files.length != 0) getData(files, strings, values);                
        }               
    }

    xmlhttp.open("GET", files.pop(), true);
    xmlhttp.send();    
}

function intoArray(lines) {
    var lineArr = lines.split('\n');
    for (var i = 0; i < lineArr.length; i++) lineArr[i] = lineArr[i].split(',');
    return lineArr;
}

// Once use snippet
function generateTestData(x,y) {
    var buffer = "";
    for (var i = 0; i < y; i++) {
        for (var j = 0; j < x; j++) {
            if (j != 0) buffer += ',';
            buffer += Math.floor(Math.random()*100);
        } buffer += '\n';
    } return buffer;
}

// https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}