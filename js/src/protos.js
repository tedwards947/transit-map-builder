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
    this.stations = [];

    this.nodeCoords = {
        start: startNodeCoords,
        end: undefined
    };

    this.id = Math.random();
}

function TextBox(shape, realCoords, content){
    this.type = 'textbox',
    this.shape = shape;

    this.realCoords = realCoords;
    this.content = content;

    this.isDragging = false;

    this.id = Math.random();
}