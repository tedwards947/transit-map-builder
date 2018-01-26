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

function TextBox(shape, realCoords, content){
    this.type = 'textbox',
    this.shape = shape;

    this.realCoords = realCoords;
    this.content = content;

    this.isDragging = false;
}