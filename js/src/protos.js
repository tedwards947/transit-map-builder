function Station(shape, nodeCoords){
    this.type = 'station';
    this.shape = shape;
    this.nodeCoords = nodeCoords;
}

function Line(shape, startNodeCoords, color){
    this.type = 'line';
    this.shape = shape;

    this.nodeCoords = {
        start: startNodeCoords,
        end: undefined
    };
}
