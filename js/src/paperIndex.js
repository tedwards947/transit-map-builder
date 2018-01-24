
var stationLayer;
var lineLayer;

var selectedTool = TOOLS.none;
var selectedToolLine = -1;

var pathfindingGrid = new PF.Grid(CANVAS_WIDTH / NODE_SPACING, CANVAS_HEIGHT / NODE_SPACING);


var nodes = [];

var domElements = {
    buttons: {}
};

var lines = [];
var currentLine;
var stations = [];

var tools = [];


function onMouseMove(event){

    var coords = {
        x: event.point.x,
        y: event.point.y
    };

    switch (selectedTool){
        case TOOLS.none: 

        break;
        case TOOLS.line: //generalize this you twat!
            // console.log('item', event.item, 'lastpoint', event.lastPoint, 'middlePoint', event.middlePoint, 'modifiers', event.modifiers)
            // console.log('event', event)

            if (currentLine){
                onLineMouseMove(coords)
            }
        break;
    }
}

function onMouseDown(event){


    //get coords
    var coords = {
        x: event.point.x,
        y: event.point.y
    };

    switch (selectedTool){
        case TOOLS.none: 

        break;
        case TOOLS.bulldozer: 

        break;
        case TOOLS.station: 
            //create a station? if some rules are met
            createStation(coords);

        break;
        case TOOLS.line:
            if(event.event.which === 3){
                onLineRightClick(coords);
            }
            onLineMouseDown(coords)
        break;
    }
}
function onLineRightClick(coords){
    //on line right click
    console.log('onLineRightClick')
    if(currentLine && currentLine.shape){
        currentLine.shape.removeSegments();
        delete currentLine;
    }


    currentLine = undefined;
}


function onLineMouseMove(mouseCoords){
    // console.log('move', currentLine)

    currentLine.shape.removeSegments();
    var finder = new PF.JumpPointFinder({
        allowDiagonal: true
    });

    var nodeCoords = getNearestNodeCoordinates(mouseCoords);

    var backupGrid = pathfindingGrid.clone();


    //added this try catch because .add() throws because x cannot be found on `undefined`, but I can't find anything
    //undefined here.
    //fix this for realsies later!
    var path;
    try{
        path = finder.findPath(currentLine.nodeCoords.start.x, currentLine.nodeCoords.start.y, nodeCoords.x, nodeCoords.y, backupGrid);

    }
    catch (ex){
        //swallow this damn error :(
        return;
    }


    lineLayer.activate();
    path.forEach(function(pathPoint){
        var x = pathPoint[0] * NODE_SPACING;
        var y = pathPoint[1] * NODE_SPACING;

        // myPath.add(new Point([myX, myY]));
        currentLine.shape.add(new Point([x, y]));
    });

    roundPath(currentLine.shape, 10);


    //try to draw a line to the mouse!
}

function onLineMouseDown(mouseCoords){
    //check if the user clicked on a station

    //check if the user has already clicked on a line

    //if the user clicks elsewhere, delete the line

    //also have the capability to move the line?



    //convert to nodeCoords
    var nodeCoords = getNearestNodeCoordinates(mouseCoords);
    var selectedStation = stations.find(function(station){
        return nodeCoords.x === station.nodeCoords.x && nodeCoords.y === station.nodeCoords.y;
    });

    if(!selectedStation){
        console.log('no selected station, can\'t do anything')
        return;
    }


    //what color should it be?
    var colorKey = Object.keys(COLORS)[(+selectedToolLine -1)];
    var color = COLORS[colorKey];

    console.log('selected station', selectedStation, 'color', color, (+selectedToolLine - 1))

    lineLayer.activate();
    var linePath = new Path();
    linePath.strokeColor = color;
    linePath.strokeWidth = LINE_WIDTH;
    // linePath.add(new Point([nodeCoords.x * NODE_SPACING, nodeCoords.y * NODE_SPACING]));

    var lineObj = {
        type: 'line',
        nodeCoords: {
            start: nodeCoords,
            end: undefined
        },
        shape: linePath
    };

    var line = new Line(linePath, nodeCoords, COLORS.yellow);

    lines.push(lineObj);

    currentLine = lineObj;

}

/**
 * @description nodeCoordA is thing in front of the minus, B is after.
 * 
 * @param {object} nodeCoordAa 
 * @param {object} nodeCoordB 
 * 
 */
function getDistance(nodeCoordA, nodeCoordB){

    var x = nodeCoordA.x - nodeCoordB.x;
    var y = nodeCoordA.y - nodeCoordB.y;
    var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return {
        x: x,
        y: y,
        d: d
    };
}

function deselectAllItems(){
    //de selects EVERYTHING!

    project.selectedItems.map(function(item){
        item.fullySelected = false;
    });
}

function onStationClick(e, station){
    //only perform selection if the select tool is... welll... selected!

    if(selectedTool !== TOOLS.selectMove){
        return;
    }
    var wasPreviouslySelected = station.shape.selected;
    deselectAllItems();

    if (!wasPreviouslySelected){
        //only select it if it wasn't already
        station.shape.fullySelected = true;
    }
}


function createStation(mouseCoords){
    var nodeCoords = getNearestNodeCoordinates(mouseCoords);

    console.log('createStation', mouseCoords, 'nodecoords', nodeCoords);


    var isEmpty = !_.get(nodes, [nodeCoords.y, nodeCoords.x]);

    var IS_TOO_CLOSE_DISTANCE = 4;

    var isTooClose = stations.some(function(station){
        var distance = getDistance(station.nodeCoords, nodeCoords).d;
        return distance <= 4;
    });

    //do some logic to see if we can?
    if(isEmpty && !isTooClose){

        //do we still need this?
        _.set(nodes, [nodeCoords.y, nodeCoords.x], 'station');

        var circle = new Path.Circle(new Point([nodeCoords.x * NODE_SPACING, nodeCoords.y * NODE_SPACING]), 10);
        circle.strokeColor = 'black';
        circle.fillColor = 'white';
        circle.strokeWidth = 2;

        stationLayer.addChild(circle);

        var station = new Station(circle, nodeCoords);

        circle.onClick = function _onStationClick(e){
            onStationClick(e, station);
            // var wasPreviouslySelected = e.target.selected;
            // deselectAllItems();

            // if (!wasPreviouslySelected){
            //     //only select it if it wasn't already
            //     circle.fullySelected = true;
            // }

        };

        // //COMBINE THIS MOFO
        stations.push(station);


    } else {
        //do nothing?
        console.log('can\'t place station');
    }




}


function getNearestNodeCoordinates(coords){
    //converts x,y pixel coords into node coords

    return {
        x: Math.round(coords.x / NODE_SPACING),
        y: Math.round(coords.y / NODE_SPACING)
    };
}



function initNodes(){

    var verticalNumber = Math.floor(CANVAS_HEIGHT / NODE_SPACING);
    var horizontalNumber = Math.floor(CANVAS_WIDTH / NODE_SPACING);

    //creates a verticalNumber x horizontalNumber sized array!
    nodes = _.map(Array.apply(null, Array(verticalNumber)), function(){
        return Array.apply(null, Array(horizontalNumber));
    });
}
function selectDomElements(){
    //select elements
    domElements.buttons.selectMove = document.querySelector('#select-move');
    domElements.buttons.bulldozer = document.querySelector('#bulldozer');
    domElements.buttons.station = document.querySelector('#station');
    domElements.buttons.info = document.querySelector('#info');
    domElements.buttons.line1 = document.querySelector('#line-1');
    domElements.buttons.line2 = document.querySelector('#line-2');
    domElements.buttons.line3 = document.querySelector('#line-3');
    domElements.buttons.line4 = document.querySelector('#line-4');
    domElements.buttons.line5 = document.querySelector('#line-5');
    domElements.buttons.line6 = document.querySelector('#line-6');
}
function clearSelectedClass(){
    _.forEach(domElements.buttons, function(el){
        el.classList.remove('selected');
    });
}
function addEventListeners(){
    _.forEach(domElements.buttons, function(el){

        el.addEventListener('click', function(e){
            var toolType = e.target.dataset.tool;
            var lineNumber = e.target.dataset.lineNumber
            
            clearSelectedClass();
            if (toolType !== selectedTool){
                selectedTool = toolType;
                e.target.classList.add('selected')
            } else {
                selectedTool = TOOLS.none;
            }

            stationLayer.bringToFront();
            //switch active layer based on toolbox selection
            switch (toolType){
                case 'station':
                    stationLayer.activate();
                break;
                case 'line':
                    selectedToolLine = lineNumber
                    lineLayer.activate();
                break;

            }

            //reset stuff like current line
            currentLine = undefined;

        });
    });
}

function initLayers(){
    stationLayer = new Layer();
    lineLayer = new Layer();
    stationLayer.bringToFront();
    stationLayer.activate();

    /*layer api
addChild(item)
insertChild(index, item)
addChildren(items)
insertChildren(index, items)
insertAbove(item)
insertBelow(item)
sendToBack()
bringToFront()
appendTop(item)
appendBottom(item)
moveAbove(item)
moveBelow(item)
addTo(owner)
copyTo(owner)
reduce(options)
remove()
replaceWith(item)
removeChildren()
removeChildren(start[, end])
reverseChildren()
    */
}
function init() {
    initNodes();
    selectDomElements();
    addEventListeners();

    initLayers();
    
    console.log('init success')

}

init();   



// //testing line shit
// var myPath = new Path();
// myPath.strokeColor = '#fdf012'; //MTA yellow
// myPath.strokeWidth = 10;


// myPath.add(new Point([100, 100]));
// myPath.add(new Point([200, 200]));
// myPath.add(new Point([500, 200]));
// myPath.add(new Point([500, 500]));
// myPath.add(new Point([400, 500]));
// myPath.add(new Point([300, 400]));
// myPath.add(new Point([400, 300]));



function roundPath(path,radius) {
    var segments = path.segments.slice(0);
    path.segments = [];

    segments.forEach(function(segment, idx, segmentArr){

        var curPoint = segment.point;

        var nextSegment = segmentArr[idx + 1];
        var prevSegment = segmentArr[idx - 1];



        var nextPoint = segmentArr[idx + 1 == segmentArr.length ? 0 : idx + 1].point;
        var prevPoint = segmentArr[idx - 1 < 0 ? segmentArr.length - 1 : idx - 1].point;
        var nextDelta = curPoint - nextPoint;
        var prevDelta = curPoint - prevPoint;


        if(!nextSegment || !prevSegment){
             nextDelta.length = 0;
             prevDelta.length = 0;
        } else {
            nextDelta.length = radius;
            prevDelta.length = radius;
        }
        path.add({
            point: curPoint - prevDelta,
            handleOut: prevDelta / 2
        });
        path.add({
            point: curPoint - nextDelta,
            handleIn: nextDelta / 2
        });
    });

    return path;
}




// roundPath(myPath, 10);

