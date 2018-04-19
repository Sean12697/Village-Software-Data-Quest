window.addEventListener('load', init);

var arr;
var jsonResults = [];
const size = 10;

function init() {
    // download(generateTestData(100, 100), 'test.csv', 'text/plain');
    getData('test.csv');
}

function afterDataCollected() {
    console.log(arr);
    // console.log(sumOfSize(0,0));
    for (var i = 0; i < arr.length - size; i++) {
        for (var j = 0; j < arr[0].length - size; j++) {
            jsonResults.push({ total: sumOfSize(i, j), x: i, y: j });
        }
    } jsonResults = jsonResults.sort((a, b) => b.total - a.total);
    console.log(jsonResults);
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

// https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function getData(name) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();               
    } else {               
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");               
    }

    xmlhttp.onreadystatechange = function () {               
        if (xmlhttp.readyState == 4) {                   
          var lines = xmlhttp.responseText;
          intoArray(lines);                
        }               
    }

    xmlhttp.open("GET", name, true);
    xmlhttp.send();    
}

function intoArray(lines) {
    var lineArr = lines.split('\n');
    for (var i = 0; i < lineArr.length; i++) lineArr[i] = lineArr[i].split(',');
    arr = lineArr;
    afterDataCollected();
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