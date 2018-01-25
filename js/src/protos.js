function Station(shape, nodeCoords){
    this.type = 'station';
    this.shape = shape;
    this.nodeCoords = nodeCoords;

    this.isDragging = false;

    //todo prolly something better
    this.id = Math.random();
}

function Line(shape, startNodeCoords, color){
    this.type = 'line';
    this.shape = shape;

    this.nodeCoords = {
        start: startNodeCoords,
        end: undefined
    };
}
