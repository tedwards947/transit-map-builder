
![Transit Map Builder Logo](https://raw.githubusercontent.com/tedwards947/transit-map-builder/master/logo.png)

# Transit Map Builder

Run this locally using a local file server:
* Python's `http-serve`
* Node's `http-server` (install with `npm install http-server -g`)

**See it running live at <a href="http://jscript.guru/transitmapbuilder">jscript.guru/transitmapbuilder</a>**

## Development 
* This Project uses <a href="https://github.com/paperjs/paper.js">Paper.js</a> for graphics and <a href="https://github.com/qiao/PathFinding.js/">pathfinding.js</a> for pathfinding used in line drawing. Please read up on them a bit. 
* <a href="http://paperjs.org/tutorials/getting-started/working-with-paper-js/">Paper.js and its basic API</a>
* Try to use SVG or CSS for graphics outside of the canvas instead of images
* Read CODE_OF_CONDUCT.md
    

## Todos
* Add build system to compile and bundle javascript
  * Perhaps use <a href="https://github.com/aprowe/paper-loader">paper-loader</a> with webpack? 
* change the line initiation from being a canvas mousedown to the station mousedown
* add line moving
* add text editing
* add a way to show parallel lines
* clean up the code, DRY it up a bit, move it to new files based on functionality
* add event listeners to stickers

## Known issues
* Sometimes when moving a station, an associated line won't follow
* Sometimes when deleting a station, associated lines won't be deleted