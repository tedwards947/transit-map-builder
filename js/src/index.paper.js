/*
    THIS IS PAPERSCRIPT, this is not JavaScript.

    This file is also implicitly wrapped in a scope, the "project",
        available on document.window as `project`. 

        Read more please http://paperjs.org/tutorials/getting-started/working-with-paper-js/


*/
var stationLayer;
var lineLayer;

var selectedTool = TOOLS.none;
var selectedToolLineNumber = -1;

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
    var colorKey = Object.keys(COLORS)[(+selectedToolLineNumber -1)];
    var color = COLORS[colorKey];

    console.log('selected station', selectedStation, 'color', color, (+selectedToolLineNumber - 1))

    lineLayer.activate();


    if (currentLine){
        console.log('current line seelected')

        currentLine.nodeCoords.end = nodeCoords;

        //check if this station is already part of the ones associated to this line
        var hasThisStationAlready = currentLine.stations.some(function(station){
            return (selectedStation.id === station.id);
        });

        if(!hasThisStationAlready){
            currentLine.stations.push(selectedStation);
        }

        currentLine = undefined;

    } else {

        var linePath = new Path();
        linePath.strokeColor = color;
        linePath.strokeWidth = LINE_WIDTH;
        
        var lineObj = {
            type: 'line',
            nodeCoords: {
                start: nodeCoords,
                end: undefined
            },
            shape: linePath,
            stations: [selectedStation]
        };
    
        var line = new Line(linePath, nodeCoords, COLORS.yellow);
    
        lines.push(lineObj);

        currentLine = lineObj;
    }
    console.log(currentLine);





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

    deselectAllItems();

    station.shape.fullySelected = true;
}

function onStationMouseUp(e, station){
    station.isDragging = false;
}

function onStationMouseDown(e, station){
    //deal with click/drag movement of station

    if(station.shape.selected){
        station.isDragging = true;
    }

}

function onStationMouseDrag(e, station){

    if(station.isDragging){

        
        var newMouseCoords = e.point;

        var newNodeCoords = getNearestNodeCoordinates(newMouseCoords);

        if(newNodeCoords.x === station.nodeCoords.x && newNodeCoords.y === station.nodeCoords.y){
            //short circuit because the position hasn't changed.
            return;
        }

        if(!isStationTooClose(newNodeCoords, station)){
            moveStation(newNodeCoords, station);
        } 
    }
}

function moveStation(destinationNodeCoords, station){
    //need to move the station to a new position, and recalculate all the line paths!
    if(!station){
        console.log('STATION UNDEFINED')
    }
    station.nodeCoords = destinationNodeCoords;

    var realCoords = getRealCoordinatesFromNodeCoordinates(destinationNodeCoords);
    station.shape.position = new Point([realCoords.x, realCoords.y]);

    //get all impacted lines, and figures out a new path for them between the stations
    var impactedLines = _.filter(lines, function(line){
        
        //find lines which have this station's ID
        return line.stations.some(function(_station){
            return _station.id === station.id;
        });
    });

    console.log('Lines impacted:', impactedLines);


    redrawLines(impactedLines);


}


function redrawLines(linesToRedrawArray){

    _.forEach(linesToRedrawArray, function(line){

        if(!line){
            console.log('LINE UNDEFINED')
        }
        //clear the old path
        line.shape.removeSegments();

        var finder = new PF.JumpPointFinder({
            allowDiagonal: true
        });

        var station0 = line.stations[0];
        var station1 = line.stations[1];

        if(!station0 || !station1){
            console.log('0', station0, '1', station1)
            throw 'no station'
        }

        //clone the grid because a grid is destroyed once it's been used to find a path.
        var backupGrid = pathfindingGrid.clone();

        var path = finder.findPath(station0.nodeCoords.x, station0.nodeCoords.y, station1.nodeCoords.x, station1.nodeCoords.y, backupGrid);

        lineLayer.activate();

        _.forEach(path, function(pathPoint){
            var x = pathPoint[0] * NODE_SPACING;
            var y = pathPoint[1] * NODE_SPACING;
            if(!line){
                console.log('LINE UNDEFINED!!')
            }
            line.shape.add(new Point([x, y]));
        });

        roundPath(line.shape, LINE_ROUNDING_RADIUS);

    });


}


function isStationTooClose(targetNodeCoords, selfStationObject){
    //`selfStation` is if you want this to skip this station

    var IS_TOO_CLOSE_DISTANCE = 4;

    return stations.some(function(station){
        if(selfStationObject){
            //omit this one

            if(selfStationObject.id === station.id){
                return;
            }
        }
        var distance = getDistance(station.nodeCoords, targetNodeCoords).d;
        return distance <= IS_TOO_CLOSE_DISTANCE;
    });
}

function areNodeCoordsWithinBounds(nodeCoords){
    //checks if the node coords are within the bounds of the canvas

    //FINISH
    nodeCoords.x >= 0 && nodeCoords.x <= NUM_NODES.x
    nodeCoords.y >= 0 && nodeCoords.y <= NUM_NODES.y

}

function createStation(mouseCoords){
    var nodeCoords = getNearestNodeCoordinates(mouseCoords);

    console.log('createStation', 'mouseCoords', mouseCoords, 'nodecoords', nodeCoords);


    var isEmpty = !_.get(nodes, [nodeCoords.y, nodeCoords.x]);

    var isTooClose = isStationTooClose(nodeCoords);

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
        };

        circle.onMouseDown = function _onStationMouseDown(e){
            onStationMouseDown(e, station);
        };

        circle.onMouseUp = function _onStationMouseUp(e){
            onStationMouseUp(e, station);
        };
        
        circle.onMouseDrag = function _onStationMouseDrag(e){
            onStationMouseDrag(e, station);
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

function getRealCoordinatesFromNodeCoordinates(coords){
    return {
        x: coords.x * NODE_SPACING,
        y: coords.y * NODE_SPACING
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
    domElements.buttons.text = document.querySelector('#text');
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
            var lineNumber = e.target.dataset.lineNumber;
            
            clearSelectedClass();

            //check if the user has picked a different tool or at least a different line
            if (toolType !== selectedTool || lineNumber !== selectedToolLineNumber){
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
                    selectedToolLineNumber = lineNumber
                    lineLayer.activate();
                break;

            }

            //reset current line
            currentLine = undefined;
            //reset any selected items
            deselectAllItems();

        });
    });
}

function initLayers(){
    stationLayer = new Layer();
    lineLayer = new Layer();
    stationLayer.bringToFront();
    stationLayer.activate();

}
function init() {
    initNodes();
    selectDomElements();
    addEventListeners();

    initLayers();
    
    console.log('init success')

}

init();   


//THE LINES SHOULD LOOK LIKE THESE. UNCOMMENT AND ADMIRE THE BEAUTY of the corners... what's wrong with the ones on the line?
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

