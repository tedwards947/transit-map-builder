var LINE_WIDTH = 10;
var LINE_ROUNDING_RADIUS = 6;
var CANVAS_WIDTH = 1200;
var CANVAS_HEIGHT = 800;

var NODE_SPACING = 10;
var NUM_NODES = {
    x: 120,
    y: 80
};

var COLORS = {
    'yellow': '#FCCC0A',
    'blue': '#0039A6',
    'red': '#EE352E',
    'orange': '#FF6319',
    'gray': '#808183',
    'purple': '#B933AD'
};

var TOOLS = {
    none: 'none',
    selectMove: 'select-move',
    text: 'text',
    bulldozer: 'bulldozer',
    station: 'station',
    line: 'line',
    sticker: 'sticker'
};

var OBJECT_TYPES = {
    line: 'line',
    textBox: 'textBox',
    station: 'station'
};

var TEXT_EDIT_STYLING = {
    padding: 5,
    borderWidth: 1,
    fontSize: 16
};