/*
    THIS IS PAPERSCRIPT, this is not JavaScript.

    This file is also implicitly wrapped in a scope, the "project",
        available on document.window as `project`. 

        Read more please http://paperjs.org/tutorials/getting-started/working-with-paper-js/


*/
var stationLayer;
var lineLayer;
var stickerLayer;

var selectedTool = TOOLS.none;
var selectedToolLineNumber = -1;
var selectedStickerNumber = -1;
var selectedStickerColor = '';

var pathfindingGrid = new PF.Grid(CANVAS_WIDTH / NODE_SPACING, CANVAS_HEIGHT / NODE_SPACING);


var nodes = [];

var domElements = {
    canvas: undefined,
    buttons: {},
    textInput: undefined,
    stickers: undefined
};

var lines = [];
var currentLine;
var stations = [];
var textBoxes = [];

var tools = [];


function onMouseMove(event){

    var coords = {
        x: event.point.x,
        y: event.point.y
    };

    switch (selectedTool){
        case TOOLS.none: 

        break;
        case TOOLS.line:
            if (currentLine){
                followMouseAndDrawLine(coords)
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

    if(event.event.which === 1){ //left click
        switch (selectedTool){
            case TOOLS.none: 
                //nada!
            break;
            case TOOLS.selectMove:
                //clear selection if nothing is hit
                if(!project.hitTest(new Point(coords.x, coords.y))){
                    deselectAllItems();
                }
            break;
            case TOOLS.bulldozer: 
                bulldoze(coords);
            break;
            case TOOLS.text: 
                createOrEditTextNode(coords);
            break;
            case TOOLS.station: 
                //create a station? if some rules are met
                createStation(coords);
            break;
            case TOOLS.line:
                //not sure
            break;
        }
    }
    else if(event.event.which === 3){
        switch (selectedTool){
            case TOOLS.selectMove:
                //deselect everything in right click
                deselectAllItems();
            break;
            case TOOLS.line:
                if(event.event.which === 3){
                    onLineRightClick(coords);
                }
            break;
            default:

        }
    }
}


function onShapeMouseLeaveForCursorSetting(event, obj){
    domElements.canvas.className = '';
}
function onShapeMouseEnterForCursorSetting(event, obj){
    //change the cursor of the object based on the tool selected and the object type

    var objectType = obj.type;


    switch(selectedTool){
        case TOOLS.text: 
            domElements.canvas.className = 'text-cursor';

        break;
        case TOOLS.selectMove:
            domElements.canvas.className = 'pointer';

            if (obj.shape.selected === true) {
                domElements.canvas.className = 'move';
            }
        break;
        case TOOLS.line:
            if(obj.type = OBJECT_TYPES.station){
                domElements.canvas.className = 'pointer';
            }
        break;
        case TOOLS.bulldozer:
            domElements.canvas.className = 'crosshair';
        break;
        default:
            domElements.canvas.className = '';
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

function bulldoze(mouseCoords){

    //look for items whose shapes pass a hit test

    //concat all the lines, stations, and textboxes, then loop through them
    _.forEach(_.concat(lines, stations, textBoxes), function (obj){

        //get their shape, do a hit test

        var result = obj.shape.hitTest(new Point(mouseCoords.x, mouseCoords.y));

        if(result){
            switch (obj.type){
                case 'line':
                    deleteLine(obj);
                break;
                case 'station':
                    deleteStation(obj);
                break;
                case 'textbox':
                    deleteTextBox(obj);
                break;
            }

            //reset the cursor to not be teh crosshair kind
            domElements.canvas.className = '';
        }
    });
}

function deleteLine(lineObj){
    var id = lineObj.id;

    _.remove(lines, function(line){
        console.log('loop')
        return id === line.id;
    });

    lineObj.shape.remove();

    delete lineObj;
}
function deleteTextBox(textBoxObj){
    var id = textBoxObj.id;

    _.remove(textBoxes, function(_textbox){
        return id === _textbox.id;
    });

    textBoxObj.shape.remove();

    delete textBoxObj;
}
function deleteStation(stationObj){

    //delete associated lines 

    //find lines and delete them
    _.forEach(lines, function(line){
        var isImpacted =  line.stations.some(function(_station){
            console.log('_station', _station, 'stationObj.id', stationObj.id)
            return _station.id === stationObj.id;
        });

        if(isImpacted){
            deleteLine(line);
        }
    });

    var id = stationObj.id;

    _.remove(stations, function(_station){
        return id === _station.id;
    });

    stationObj.shape.remove();

    delete stationObj;
}

//RENAME THIS METHOD!
function followMouseAndDrawLine(mouseCoords){

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
        currentLine.shape.add(new Point([x, y]));
    });

    roundPath(currentLine.shape, LINE_ROUNDING_RADIUS);

}

function handleStationLineClick(station){
    //check if the user clicked on a station

    //check if the user has already clicked on a line

    //also have the capability to move the line?



    // //convert to nodeCoords
    // var nodeCoords = getNearestNodeCoordinates(mouseCoords);
    // var selectedStation = stations.find(function(station){
    //     return nodeCoords.x === station.nodeCoords.x && nodeCoords.y === station.nodeCoords.y;
    // });

    // if(!selectedStation){
    //     // console.log('no selected station, can\'t do anything')
    //     return;
    // }



    var nodeCoords = station.nodeCoords;

    //what color should it be?
    var colorKey = Object.keys(COLORS)[(+selectedToolLineNumber -1)];
    var color = COLORS[colorKey];


    lineLayer.activate();

    if (currentLine){
        //the user is already drawing a line

        currentLine.nodeCoords.end = nodeCoords;

        //check if this station is already part of the ones associated to this line
        var hasThisStationAlready = currentLine.stations.some(function(_station){
            return (station.id === _station.id);
        });

        if(!hasThisStationAlready){
            currentLine.stations.push(station);
        }

        currentLine = undefined;

    } else {
        //no line already, so make a new

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
            stations: [station]
        };
    
        var line = new Line(linePath, nodeCoords, COLORS.yellow);
    
        lines.push(lineObj);

        currentLine = lineObj;


        linePath.onMouseEnter = function _onLinePathMouseEnter(e){
            onShapeMouseEnterForCursorSetting(e, lineObj);
        };
        linePath.onMouseLeave = function _onLinePathMouseLeave(e){
            onShapeMouseLeaveForCursorSetting(e, lineObj);
        };
    }

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


//CHANGE THIS TO BE instead powered by the moment
function onStationClick(e, station){
    //only perform selection if the select tool is... welll... selected!

    switch (selectedTool){
        case TOOLS.selectMove:
            deselectAllItems();

            station.shape.fullySelected = true;
        
            //change the mouse cursor to be 'move'
            domElements.canvas.className = 'move';
        break;
        case TOOLS.line:
            //only do this if we're left-clicking
            if(e.event.which === 1){
                handleStationLineClick(station);
            }
        break;
    }
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
        return
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

    // console.log('Lines impacted:', impactedLines);


    redrawLines(impactedLines);
}


function redrawLines(linesToRedrawArray){

    _.forEach(linesToRedrawArray, function(line){
        //clear the old path
        line.shape.removeSegments();

        var finder = new PF.JumpPointFinder({
            allowDiagonal: true
        });

        var station0 = line.stations[0];
        var station1 = line.stations[1];

        if(!station0 || !station1){
            //crappy error statement .fix later.

            console.log('0', station0, '1', station1)
            debugger;
            throw 'no station';
        }

        //clone the grid because a grid is destroyed once it's been used to find a path.
        var backupGrid = pathfindingGrid.clone();

        var path = finder.findPath(station0.nodeCoords.x, station0.nodeCoords.y, station1.nodeCoords.x, station1.nodeCoords.y, backupGrid);

        lineLayer.activate();

        _.forEach(path, function(pathPoint){
            var x = pathPoint[0] * NODE_SPACING;
            var y = pathPoint[1] * NODE_SPACING;
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

    // console.log('createStation', 'mouseCoords', mouseCoords, 'nodecoords', nodeCoords);


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

        circle.onMouseEnter = function _onStationMouseEnter(e){
            onShapeMouseEnterForCursorSetting(e, station);
        };

        circle.onMouseLeave = function _onStationMouseLeave(e){
            onShapeMouseLeaveForCursorSetting(e, station);
        };

        // //COMBINE THIS MOFO
        stations.push(station);


    } else {
        //do nothing?
        console.log('can\'t place station');
    }




}

function onTextboxClick(e, textbox){

    if(selectedTool !== TOOLS.selectMove){
        return;
    }

    deselectAllItems();

    //select and move it
    textbox.shape.fullySelected = true;

    //change the cursor to the move cursor
    domElements.canvas.className = 'move';
}

function onTextboxMouseUp(e, textbox){
    textbox.isDragging = false;
}
function onTextboxMouseDown(e, textbox){
    if(textbox.shape.selected){
        textbox.isDragging = true;
    }


    //change the cursor to the move cursor
    domElements.canvas.className = 'move';
    textbox.fullySelected = true;

}

function onTextboxMouseDrag(e, textbox){
    if(textbox.isDragging){

        
        var newMouseCoords = e.point;


        if(newMouseCoords.x === textbox.realCoords.x && newMouseCoords.y === textbox.realCoords.y){
            //short circuit because the position hasn't changed.
            return;
        }

        //just move it

        textbox.realCoords.x = newMouseCoords.x;
        textbox.realCoords.y = newMouseCoords.y;

        textbox.shape.position = new Point(newMouseCoords.x, newMouseCoords.y);
    }
}


function createOrEditTextNode(mouseCoords){
    //hit test?

    //check for a hit on a current textbox. if yes, teh user wants to edit the text
    var hit = textBoxes.find(function(box){
        return box.shape.hitTest(new Point(mouseCoords.x, mouseCoords.y))
    });

    //get existing text, if it exists.
    var existingText = _.get(hit, 'content', '');

    if(hit){
        //override the mouse coords so that the textbox comes up at the right place,
        //directly on top of the text, instead of where the user clicked

        mouseCoords = {
            x: hit.shape.bounds.x,
            y: hit.shape.bounds.y
        };
        // console.log('bounds', );
    }

    showTextBox(mouseCoords, existingText, function onComplete(text, wrapperWidth, wrapperHeight, inputLeft, inputTop){
        textLayer.activate();

        if(hit){
            //hit!
            console.log('hit! updating object');
            hit.content = text;
            hit.shape.content = text;

            return;
        }
        var newXPosition = mouseCoords.x + TEXT_EDIT_STYLING.borderWidth + TEXT_EDIT_STYLING.padding + 14;
        var newYPosition = mouseCoords.y + TEXT_EDIT_STYLING.borderWidth + TEXT_EDIT_STYLING.padding + 2;
        

        var textItemShape = new PointText({
            content: text,
            fontFamily: 'Helvetica',
            fontSize: '16px',
            fontWeight: 'bold',
            position: new Point(newXPosition, newYPosition)
        });


        var textboxObject = new TextBox(textItemShape, {x: newXPosition, y: newYPosition}, text);
    


        textItemShape.onClick = function _textboxOnClick(e){
            onTextboxClick(e, textboxObject);
        };

        textItemShape.onMouseDrag = function _textboxOnMouseDrag(e){
            onTextboxMouseDrag(e, textboxObject);
        };
        textItemShape.onMouseUp = function _textboxOnMouseUp(e){
            onTextboxMouseUp(e, textboxObject);
        };
        textItemShape.onMouseDown = function _textboxOnMouseDown(e){
            onTextboxMouseDown(e, textboxObject);
        };
        textItemShape.onMouseEnter = function _textboxOnMouseEnter(e){
            onShapeMouseEnterForCursorSetting(e, textboxObject);
        };
        textItemShape.onMouseLeave = function _textboxOnMouseLeave(e){
            onShapeMouseLeaveForCursorSetting(e, textboxObject);
        };

        textBoxes.push(textboxObject);
    });
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

    domElements.canvas = document.querySelector('#myCanvas');


    domElements.stickers = Array.prototype.slice.call(document.querySelectorAll('.sticker'));
}

// function reset
function resetUponToolboxSelection(){
    //reset current line
    currentLine = undefined;
    //reset any selected items
    deselectAllItems();

    //remove toolbox selected
    _.forEach(domElements.buttons, function(el){
        el.classList.remove('selected');
    });

    //remove sticker selected
    _.forEach(domElements.stickers, function(el){
        el.classList.remove('selected');
    });

    //remove any canvas classes (for cursor control)
    domElements.canvas.className = '';

    //reset text editing
    hideTextBox();

}
function addEventListeners(){

    //toolbox buttons
    _.forEach(domElements.buttons, function(el){
        el.addEventListener('click', function(e){
            var toolType = e.target.dataset.tool;
            var lineNumber = e.target.dataset.lineNumber;

            resetUponToolboxSelection();

            //check if the user has picked a different tool or at least a different line
            if (toolType !== selectedTool || (toolType === TOOLS.line && lineNumber !== selectedToolLineNumber)){
                selectedTool = toolType;
                e.target.classList.add('selected')
            } else {
                selectedTool = TOOLS.none;
            }

            stationLayer.bringToFront();
            //switch active layer based on toolbox selection
            switch (toolType){
                case TOOLS.station:
                    stationLayer.activate();
                break;
                case TOOLS.text: 
                    textLayer.activate();
                    domElements.canvas.classList.add('text-cursor');
                case TOOLS.line:
                    selectedToolLineNumber = lineNumber
                    lineLayer.activate();
                break;

            }



        });
    });

    console.log('domElements', domElements.stickers)
    //stickers
    _.forEach(domElements.stickers, function(el){
        el.addEventListener('click', function(e){
            var stickerSymbol = e.target.innerText;
            var stickerNumber = e.target.dataset.stickerNumber;
            var stickerColor = e.target.dataset.color;

            resetUponToolboxSelection();

            if (selectedStickerNumber !== stickerNumber) {
                //different sticker selected, select it!

                selectedTool = TOOLS.sticker;
                e.target.classList.add('selected');
                selectedStickerNumber = stickerNumber;
                selectedStickerColor = stickerColor;

            } else{

                //same sticker selected, deselect it!
                selectedTool = TOOLS.none;
                e.target.classList.remove('selected');
                selectedStickerNumber = -1;
                selectedStickerColor = '';
            }

            stickerLayer.bringToFront();

        });
    });
}

function initLayers(){
    stationLayer = new Layer();
    lineLayer = new Layer();
    textLayer = new Layer();
    stickerLayer = new Layer();
    stationLayer.bringToFront();
    textLayer.bringToFront();
    stickerLayer.bringToFront();
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

