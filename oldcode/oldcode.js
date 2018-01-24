// Create a new path once, when the script is executed:
var myPath = new Path();
myPath.strokeColor = 'black';
myPath.strokeWidth = 10;

// debug
// myPath.add(new Point([0,0]))
// function onMouseMove(event) {

//     myPath.removeSegment(1)
//     myPath.add(event.point);
// }
function onMouseMove(event) {
    var myX = Math.floor(event.point.x / 10);
    var myY = Math.floor(event.point.y / 10);
    // // myPath.removeSegment(1)
    // // myPath.add(event.point);

    doPathfinding(0, 0, myX, myY);
}

function onMouseDown(event) {
    //get point at moment


    var myX = Math.floor(event.point.x / 10);
    var myY = Math.floor(event.point.y / 10);

    // console.log(myX, myY);
    console.log('node!', grid.nodes[myY][myX])
    //get grid point
    grid.nodes[myY][myX].walkable = !grid.nodes[myY][myX].walkable;
    drawPoints();

}

var circleStorage = [];


//draw grid points
function drawPoints(){

    _.forEach(grid.nodes, function(row, rowIdx){
        _.forEach(row, function(pt, ptIdx){
            // console.log('pt.circle', pt.circle)
            // console.log('pt', _.get(grid, ['nodes', rowIdx, ptIdx, 'circle']))

            var circle = _.get(circleStorage, [rowIdx, ptIdx]);

            if(circle){

                // console.log('circle already exists');
                // console.log('circle', pt);
            } else {
                var myX = pt.x * 10;
                var myY = pt.y * 10;
                var circle = new Path.Circle(new Point(myX, myY), 2)

                _.set(circleStorage, [rowIdx, ptIdx], circle);

            }
            if(pt.walkable){
                circle.fillColor= 'green';
            } else {
                circle.fillColor = 'red'
            }
        });
    });
}


function doPathfinding(fromX, fromY, toX, toY){
    myPath.removeSegments();
    var gridBackup = grid.clone();

    var finder = new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true
    });

    var finderPath = finder.findPath(0, 0, toX, toY, grid);

    if(finderPath.length === 0){

    } else {
        try {

            var smoothedPath = PF.Util.smoothenPath(grid, finderPath);
        }
        catch (ex){
            console.log('EXCEPTION')
            console.log('grid', grid);
            console.log('finderPath', finderPath);
            console.log('exception', ex);
        }
    
    
        //draw path!
        smoothedPath.forEach(function(pathPoint){
            var myX = pathPoint[0] * 10;
            var myY = pathPoint[1] * 10;
    
            myPath.add(new Point([myX, myY]));
        });
        // myPath.smooth({
        //     type: ''
        // });
    }


    grid = gridBackup;




}   

drawPoints();
// doPathfinding();

// doPathfinding(0,0, 70, 70);