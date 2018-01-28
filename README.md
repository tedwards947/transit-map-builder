
![Transit Map Builder Logo](https://raw.githubusercontent.com/tedwards947/transit-map-builder/master/logo.png)

# Transit Map Builder

*Just started, don't do anything pls or even read it!* 

Run this locally using python's `http-serve`

## Development 
* This Project uses <a href="https://github.com/paperjs/paper.js">Paper.js</a> for graphics and <a href="https://github.com/qiao/PathFinding.js/">pathfinding.js</a> for pathfinding used in line drawing. Please read up on them a bit. 
* <a href="http://paperjs.org/tutorials/getting-started/working-with-paper-js/">Read about Paper.js and its basic API</a>
* Try to use SVG or CSS for graphics instead of images
    

## Todos
* Add build system to compile javascript
* change the line initiation from being a canvas mousedown to the station mousedown
* add line moving
* add text editing
* add a way to show parallel lines

## Known issues
* Sometimes when moving a station, an associated line won't follow
* Sometimes when deleting a station, associated lines won't be deleted