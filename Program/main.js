/* current work:
     Attack phase :enemy attack
        complete system to decide next choice of move
*/ 
/**
 * @typedef {Object} Circle
 * @property {Number} getwidth
 */
/* this program is designed so that it can be transplanted to another graphics library, 
 and the only thing that would require changing is the various graphics interface functions
*/
// currently being refactored to use ArrPoint and RawPoint classes for coordinates
const colors = {
    boardBlue: "#003366",
    holeGrey: "#6D6D6D",
};
// these are used for grid labels
var numbers = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
var letters = ["", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

// placeholders for player grid, enedY grid and cursor datastructures
let pGrid =[];
let eGrid = [];
let cursor,eAttack; 

// used for iteration through player ship placement
let sI =0;

// used for iteration through enemy ship placement
let eI =0;
let pturn = true;

/* these are used for the game loop. 
    each epoch is a different set of steps, and epoch is also relevant to functions such as mouseOrchestrator
*/ 
// !!-refactor starts here --!!
let epoch ="setup"
let steps = {
    setup:()=>{
        drawFrame();
        drawLegend(30);
        drawLegend(getHeight() / 2 + 15);
        pGrid = initStore(pGrid)
        eGrid = initStore(eGrid)
        drawGrid(60,eGrid);
        drawGrid(420,pGrid);
        initDimensions()
        cursor =  new Cursor();
        mouseMoveMethod((e)=>{
            let point = new RawPoint(e.getX(),e.getY())
            // console.log(point)
            cursor.updatePos(point)
        })
        mouseDownMethod(clickOrchestrator)
        epoch = "pInit"
        game()
    },
    pInit:()=>{
        genValidityPoints(pGrid,true)
        // console.log("hehe")
    },
    eInit:()=>{
        cpuPlaceCoordinator()
        eAttack = new Attack;
    },
    mainloop:()=>{
        console.log("hehe")
    }
}
//contains objects with information for each ship, such as name, length etc
let shipTemplates = [
    {name:"destroyer",len:2,pGen:false,eGen:false},
    {name:"cruiser",len:3,pGen:false,eGen:false},
    {name:"submarine",len:3,pGen:false,eGen:false},
    {name:"battleship",len:4,pGen:false,eGen:false},
    {name:"carrier",len:5,pGen:false,eGen:false}
]
let pShips = [null,null,null,null,null]
let eShips = [null,null,null,null,null]
// contains various dimensions related to each grid
let dimensions = {
    "enemy":{
    },
    "player":{
    }
}
function start() {
    // initalizes the game loop
    keyDownMethod(kbListener)
    game()
    // steps["setup"]()
    // pGrid[5][5].occupied = true;
    // cAttack = new Attack();

}
/**
 * Codehs graphics interface for rectangles
 */
function drawRect(point,width, height, color, layer) {
    let rect = new Rectangle(width, height);
    rect.setPosition(point.x,point.y);
    rect.setColor(color);
    rect.layer = layer;
    add(rect);
    return rect
}

/**
 * draws the grid via drawing each row and iterating y
 */
function drawGrid(y,grid) {
    let cury = y;
    for (var i = 0; i < 10; i++) {
        drawGridline(75, cury, i,grid);
        cury += 30;
    }
}
// must be further adjusted to use grid.point values
/**
 * draws the individual rows
 */
function drawGridline(x,y,column,grid) {
    let curx = x
    let cury = y
    let cur= new RawPoint(x,y)
    let cent = new RawPoint(x,y+15)
    // let centY = y + 15;
    for (var i = 0; i < 10; i++) {
        cent.x = cur.x+15
        drawRect(cur, 30, 30, colors.boardBlue, 0);
        let circ = drawCircle(cent, colors.holeGrey, 2, column, i);
        grid[i][column].point = new RawPoint(cent.x,cent.y)
        grid[i][column].circ = circ
        cur.x += 30;
        
    }
}

/**
 * codehs graphics interface for circles
 * @param {Number} x the x position to set the circle to
 * @param {Number} y the y position to set the circle to
 * @param {String} color the color to set the circle to, formatted "#------"
 * @param {Number} layer the graphics layer to set the circle to
 * @returns {Circle} circle the codehs graphics object "circle"
*/
function drawCircle(point, color, layer) {
    let circle = new Circle(5);
    circle.setPosition(point.x,point.y);
    circle.setColor(color);
    circle.layer = layer;
    add(circle);
    return circle;
}
// refactored
/**
 * function to initalize the black borders surronding the grids
 */
function drawFrame() {
    setSize(420, 750);
    drawRect({x:0,y:0}, 45, getHeight(), Color.black, 0);
    drawRect({x:0, y:0}, getWidth(), 30, Color.black, 0);
    drawRect({x:getWidth() - 45,y:0}, 45, getHeight(), Color.black, 0);
    drawRect({x:0, y:getHeight() - 30}, getWidth(), 30, Color.black, 0);
    drawRect({x:30, y:getHeight() / 2 - 15}, getWidth(), 30, Color.black, 0);
}
// refactored
/**
 * labels each grid's columns and rows with numbers and letters
 */
function drawLegend(y) {
    let x = 45;
    let x1 = x;
    let y2 = y;
    for (var i = 0; i <= 10; i++) {
        drawRect({x:x1, y:y}, 30, 30, colors.boardBlue, 0);
        addText(x1 + 7.5, y + 22.5, numbers[i], Color.red, 1);
        if (i != 0) {
            drawRect({x:x, y:y2}, 30, 30, colors.boardBlue, 0);
            addText(x + 15, y2 + 20, letters[i], Color.red, 1);
        }
        x1 += 30;
        y2 += 30;
    }
}
// refactored
/**
 * The Cell Class
 * contains data relevant to each individual tile
 */
class Cell{
    constructor(){
        this.targeted = false;
        this.occupied = false;
        this.point = null;
        this.canPlace = true;
        this.circ = null;
        this.ship = null;
    }
}
// refactored
/**
 * 
 * Cursor class
 * contains data regarding the cursor's position, and the method updatePos(), which updates its position within the grid 
 */
class Cursor{
    constructor(){
        this.graphic = drawCircle({x:0,y:0},"darkgrey",3) 
        this.graphic.setPosition(pGrid[0][0].point.x,pGrid[0][0].point.y)
        this.grid = ""
        this.point = new ArrPoint(0,0)
    }
    updatePos(point){
        // console.log("ehhehe")
        if( (point.x > dimensions.player.minX && point.x < dimensions.player.maxX) && (point.y > dimensions.player.minY && point.y < dimensions.player.maxY)){
            // console.log("player")
            // run position calculation
            let x = point.x-dimensions.player.minX
            let y = point.y-dimensions.player.minY
            x = Math.floor(x/=dimensions.player.xStep)
            y = Math.floor(y/=dimensions.player.yStep)

            // move cursor
            this.graphic.setPosition(pGrid[x][y].point.x,pGrid[x][y].point.y)
            
            // this.graphic.setPosition(getWidth(),getHeight())

            // update values
            this.point.x = x;
            this.point.y = y;
            this.grid = "player"
        }
        else if ( (point.x > dimensions.enemy.minX && point.x < dimensions.enemy.maxX) && (point.y > dimensions.enemy.minY && point.y < dimensions.enemy.maxY)){
            // console.log("enemy")
            // run position calculation
            let x = point.x-dimensions.enemy.minX
            let y = point.y-dimensions.enemy.minY
            x = Math.floor(x/=dimensions.enemy.xStep)
            y = Math.floor(y/=dimensions.enemy.yStep)
            
            // move cursor
            this.graphic.setPosition(eGrid[x][y].point.x,eGrid[x][y].point.y)

            // update values
            this.point.x = x;
            this.point.y = y;
            this.grid = "enemy"
        }
    }
    
}

/**
 * Ship class
 * used for each individual ship, it contains data such as the origin x, and method endpoints, which can hide or show valid endpoints
 */
class Ship{
		constructor(point,temp,valid){
			this.point = new ArrPoint(point.x,point.y);
            this.sunk = false;
			this.name = temp.name;
			this.len = temp.len;
            this.dir = null
			this.ends = {};
			this.endsArr=[]
            // console.log(point)
			for(let dir of valid){
            // current endpoint
            switch(dir){
                case"left":
                    // this.ends.left = {x:x-(this.len-1),y:y,d:"left"};
                    this.ends.left = {point:new ArrPoint(point.x-(this.len-1),point.y),d:"left"}
                    break;
                case"right":
                    // this.ends.right = {x:x+(this.len-1),y:y,d:"right"};
                    this.ends.right = {point: new ArrPoint(point.x+(this.len-1),point.y),d:"right"}
                    break;
                case"up":
                    // this.ends.up = {x:x,y:y-(this.len-1),d:"up"};
                    this.ends.up = {point: new ArrPoint(point.x,point.y-(this.len-1)),d:"up"}
                    break;
                case"down":
                    // this.ends.down = {x:x,y:y+(this.len-1),d:"dir"};
                    this.ends.down = {point: new ArrPoint(point.x,point.y+(this.len-1)),d:"down"}
                    break;
            }
            }
		}
		endpoints(bool){
		    if(bool){
    			for(let dir of Object.values(this.ends)){
    				let circ = drawCircle(pGrid[dir.point.x][dir.point.y].point, "cyan", 2, 0, 1);
    				this.endsArr.push(circ)
                    // console.log(dir)
    			}
		    }
		    else{
		        for(let circ of this.endsArr){
		            remove(circ)
		        }
		    }
		}
        logCells(dir){
            let cells = [];
            let dX =0;
            let dY =0;
            switch(dir){
                case"left":
                    dX = -1;
                    break;
                case"right":
                    dX = 1;
                    break;
                case"up":
                    dY = -1;
                    break;
                case"down":
                    dY = 1;
                    break;
            }
            let x = this.x
            let y = this.y
            // console.log(this.len)
            for(let i = 0; i < this.len; i++){
                cells.push({"x":x,"y":y})
                x+=dX;
                y+=dY;
            }
            this.cells = cells;
        }
}
// refactored
/**
 * function to fill the previously defined grid arrays with sub arrays and Cell datastructures
 */
function initStore(arr){
    for (let i = 0; i <10; i++){
        arr.push([])
    }
    for (let i = 0; i <10; i++){
        for (let I = 0; I <10; I++){
            let cell = new Cell;
            arr[i].push(cell)
        }
    }
    return arr

}
/** codehs graphics interface for text
 */
function addText(x, y, cont, color) {
    let text = new Text(cont, "15pt Courier New");
    text.setPosition(x, y);
    text.setColor(color);
    add(text);
}
/** 
 * defines the dimensions datastructure, based on data from coresponding grids
 */
function initDimensions(){
    let eMinX = eGrid[0][0].point.x - 15
    let eMinY = eGrid[0][0].point.y - 15
    let eMaxX = eGrid[9][9].point.x + 15
    let eMaxY = eGrid[9][9].point.y + 15
    let eXRange = eMaxX-eMinX;
    let eYRange = eMaxY-eMinY;
    let eXStep = eXRange/10;
    let eYStep = eYRange/10;

    let pMinX = pGrid[0][0].point.x - 15
    let pMinY = pGrid[0][0].point.y - 15
    let pMaxX = pGrid[9][9].point.x + 15
    let pMaxY = pGrid[9][9].point.y + 15
    let pXRange = pMaxX-pMinX;
    let pYRange = pMaxY-pMinY;
    let pXStep = pXRange/10;
    let pYStep = pYRange/10;

    dimensions.player = {
        "minX": pMinX,
        "minY": pMinY,
        "maxX": pMaxX,
        "maxY": pMaxY,
        "xStep":pXStep,
        "yStep":pYStep
    }

    dimensions.enemy = {
        "minX": eMinX,
        "minY": eMinY,
        "maxX": eMaxX,
        "maxY": eMaxY,
        "xStep":eXStep,
        "yStep":eYStep
    }

}
// refactored
/**
 * function which calls the current step at the end of an epoch
 */
function game(){
    steps[epoch]()
}
function drawShip(point,len,dir,grid,ship,side,hide){
    // pShips[sI].dir = dir;
    switch(side){
        case"enemy":
            eShips[eI].dir = dir;
            break;
        case "player":
            pShips[sI].dir = dir;
            break;
        default:break;
    }
    let iters; // placeholder for iteration datastructure
    // change in x and y for each relative position none,left,right,up,down
    let invalidate = [{x:0,y:0},{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:1}]
    // subfunction to draw individual tiles
    let drawShipTile = (x,y)=>{
        let rect = drawRect({x:0,y:0},20,20,"grey",0)
        rect.debug = true;
        rect.setAnchor({vertical:0.5,horizontal:0.5})
        rect.debug = false;
        rect.setPosition(grid[x][y].point.x,grid[x][y].point.y)
        grid[x][y].occupied = true;
        grid[x][y].ship = ship
        // invalidate self and neighboors
        for(let move of invalidate){
            let nX = x+move.x
            let nY = y+move.y
            // console.log(`change: ${move.y} current:${y}, result ${nY}`)
            if((nX >=0 && nX <=9) && (nY >=0 && nY <=9)){
                // console.log(`invalidated ${nX},${nY}`)
                grid[nX][nY].canPlace = false;

            }
        }
        if(hide){remove(rect)}

    }
    // subfunction to fill gap between squares
    let drawShipGap = (x,y)=>{
        let nX = grid[x][y].point.x + iters.dX;
        let nY = grid[x][y].point.y + iters.dY;
        let rect = drawRect({x:0,y:0},20,10,"grey",0)
        rect.debug = true;
        rect.setAnchor({vertical:0.5,horizontal:0.5})
        rect.debug = false;
        rect.setRotation(iters.r)
        rect.setPosition(nX,nY)
        if(hide){remove(rect)}
    }
    /* defines the iteration array
        each simple object is made up of:
        x: change in index X
        y: change in index Y
        dX: change in physical x
        dY: change in physical y
        r: change in rotation
    */
    switch(dir){
        case "left":
            iters = {x:-1,y:0,dX:-15,dY:0,r:90};
            break;
        case "right":
            iters = {x:1,y:0,dX:15,dY:0,r:90};
            break;
        case "up":
            iters = {x:0,y:-1,dX:0,dY:-15,r:0};
            break;
        case "down":
            iters = {x:0,y:1,dX:0,dY:15,r:0};
            break;
        default:
            break;  
    }
    let i = 0;
    let cX = point.x;
    let cY = point.y;
    while(true){
        drawShipTile(cX,cY) // draws ship sqaure
        if(i < len-1){
            drawShipGap(cX,cY) // fills gap between current and next square
        }
        cX += iters.x;
        cY += iters.y;
        
        if(i == len-1){
            break;
        }
        i++
    }
}
// refactored
/**
 * function to manage user mouse input based on current epoch
 */
function clickOrchestrator(e){
    switch(epoch){
        case"pInit":
            placeCoordinator();
            break;
        case"mainloop":
            if(pturn){playerAttack()};
            break;
        default:
            break;
    }
}
/** 
 * player placement functions
 * the function placeCoordinator manages the placement of ships, running through the placement of each ship
 * the function singleCoordinator manages the placment of individual ships
*/
function placeCoordinator(){
    if(cursor.grid == "player"){
        // frozen version of the coords
        let fX = cursor.point.x
        let fY = cursor.point.y
        let point = new ArrPoint(fX,fY)
        if(sI < shipTemplates.length){
            if(pGrid[point.x][point.y].canPlace){
                if(!shipTemplates[sI].pGen){
                    let valid = checkValidCardinals(point,shipTemplates[sI].len,pGrid)
                    // console.log("FAH")
                    // console.log(valid)
                    if(valid.length > 0){
                        genValidityPoints(pGrid,false)
                        singleCoordinator(point,valid)
                    }
                }
                else{
                    singleCoordinator(point)
                    if(sI < shipTemplates.length){genValidityPoints(pGrid,true)}
                    else if(sI == shipTemplates.length){
                        epoch = "eInit";
                        game();
                    }
                }
            }
        }
    }
    

}
function singleCoordinator(point,valid){
		if(!shipTemplates[sI].pGen){
			let ship = new Ship(point,shipTemplates[sI],valid) 
			ship.endpoints(true)
			pShips[sI] = ship
			shipTemplates[sI].pGen = true;
		}
		else{
            let obj = pShips[sI]
			for(let [key,val] of Object.entries(pShips[sI].ends)){
                // console.log(val)
                
				let tP = val.point
				let tY = val.point.y

                // console.log("here")
				if((tP.x == point.x)&&(tP.y ==point.y)){
                    // console.log("1")
					drawShip(obj.point,obj.len,key,pGrid,pShips[sI],"player");
                    // console.log("2")
					pShips[sI].endpoints(false)
                    // console.log("3")
                    pShips[sI].logCells(key)
                    // console.log("4")
					sI++;
					break;
				}
			}
		}
}
// checks if the points in each cardinal direction along a given length are safe
/* this is the finished, Array based version, and accompanying test function to validate results */
function testArr(x,y,distance,grid){
    let arr = checkValidCardinals(x,y,distance,grid)
    for( let dir of arr){
        switch(dir){
            case "right":
                drawCircle(grid[x+distance-1][y].x, grid[x+distance-1][y].y, "red", 2, 0, 1);
                break;
            case "left":
                drawCircle(grid[x-distance+1][y].x, grid[x-distance+1][y].y, "red", 2, 0, 1);
                break;
            case "up":
                drawCircle(grid[x][y-distance+1].x, grid[x][y-distance+1].y, "red", 2, 0, 1);
                break;
            case "down":
                drawCircle(grid[x][y+distance-1].x, grid[x][y+distance-1].y, "red", 2, 0, 1);
                break;
            default:
                break;
            
        }
    }
}
// refactored
function checkValidCardinals(point,distance,grid){
    // string refers to the direction
    let arr = [];
    let iterCheck = (xIter,yIter,str)=>{
        let xi = point.x;
        let yi = point.y;
        let i = 0;
        while (true){
            i++
            xi += xIter;
            yi += yIter;
            // console.log( `iteraton: ${i} xi val ${xi} yi val ${yi}`)
            if ((xi < 0 || xi > 9) || (yi < 0 || yi > 9) || !grid[xi][yi].canPlace){
                console.log(`direction failed, xi:${xi}, yi:${yi}, distance; ${distance}`)
                return;
            }
            if(i == distance-1){
                arr.push(str);
                break
            }
            
        }
    }

    // checks right
    iterCheck(1,0,"right")

    //checks left
    iterCheck(-1,0,"left")

    //checks up
    iterCheck(0,-1,"up")

    // checks down
    iterCheck(0,1,"down")
    
    return arr;
}
// refactored
/*currently generates a visual representation of all tiles that a ship can be placed on in a given grid */
/* final version may differ in some way, with a more data oriented approach*/
function genValidityPoints(grid,show){
    if(show){
        for(let i = 0; i<=9; i++){
            // console.log(i)
            for(let I = 0; I <=9; I++){
                if (grid[i][I].canPlace){grid[i][I].circ.setColor("cyan")}else{grid[i][I].circ.setColor(colors.holeGrey)}
            }
        }
    } 
    else {
        for(let i = 0; i<=9; i++){
            // console.log(i)
            for(let I = 0; I <=9; I++){
                grid[i][I].circ.setColor(colors.holeGrey)
            }
        }
    }
}
// coordinates placement of ships for the cpu
function cpuPlaceCoordinator(){
    let hX = Randomizer.nextInt(0,9) // x value to hit
    let hY = Randomizer.nextInt(0,9) // y value to hit
    let h = new ArrPoint(Randomizer.nextInt(0,9),Randomizer.nextInt(0,9)) // point to try and place at
    if(eGrid[h.x][h.y].canPlace){
        let valid = checkValidCardinals(h,shipTemplates[eI].len,eGrid);
        if(valid.length >0){
            let ship = new Ship(h,shipTemplates[eI],valid)
            eShips[eI] = ship 
            cpuSingleCoordinator(h,valid)
        }
        else{
            cpuPlaceCoordinator()
        }
    }
    else{
        cpuPlaceCoordinator()
    }
}
// picks a random direction to place the enemy ship
function cpuSingleCoordinator(point,valid){
    let index = Randomizer.nextInt(0,valid.length-1)
    drawShip(point,eShips[eI].len,valid[index],eGrid,eShips[eI],"enemy",true)
    eI++
    if(eI < eShips.length){
        cpuPlaceCoordinator()
    }
    else if (eI = eShips.length-1){
        epoch = "mainloop"
        game()
    }
}
// description of main "attack phase" game loop
/*
    enemy setup function changes epoch to "main", and calls game, triggering the start of main sequence 
    sequence is as follows:
    1) player input is called, and is verified via try..catch untill a new, valid attack is made
    2) evaluation function is called, checking if any enemy ships have been sunk, and if the game is won
        | if any enemy ships are sunk, declare as such and reveal them to the player
        | if the player has won, terminate the main sequence and procede to the completion
        | otherwise, procede to enemy attack
    3) enemy attack is called, with current relevant context
        | this is arguably the most complex part, featuring a multistep, complex procedure to target ships as a whole instead of random spots 
        | will use try...catch format for safe value checks, etc
        | once the cpu makes a valid hit and updates procedure, it procedes to evaluation
    4) evaluation is called to check player ships, and whether or not the game is lost
        | if any player ships are sunk, declare as suchm
        | if the player has lost, declare as such and terminate main sequence
        | otherwise, trigger a repeat of the sequence
    the main play sequence will loop indefinitely untill either the player or enemy wins the game
*/
// the cpu algorithim is as follows
/*
    1) random tile attacks with validation via standard try.. catch through cell.targeted values
        | once the cpu makes a sucessful hit, it triggers phase 2
    2) cardinal verification: over the course of 4 turns, the cpu determines the orientation of the ship with regards to where it was hit;
        | the process(currently without any directional bias), is as follows:
        | check an adjacent tile
        |   regardless of hits, set the value of that cell to "targeted"
        |    once the first hit is made, immediately check the tile directly opposite to it, i.e. checking the left tile after getting a hit on the right;
        |        if the opposite tile is a hit, mark the two perpindicular tiles as targeted, i.e. setting top and bottom tiles to targeted after getting a left right hit combo
        | based on the data, 4 different hit patterns are made:
        | horizontal centered: when both left and rightare hits, the ship is on the horizontal axis, but the positon within the ship is unknown
        |   this will follow a pattern wherein the tiles in one direction are checked, and the procedure will double back if the max length isn't exceded
        | horizontal offset: when only one horizontal adjacent is a hit, the ship is known to be on the horizontal axis, and that the centerpoint is the end of the ship
        |   this will follow a pattern where the procedure will only go in one direction, without doubling back
        |vertical centered: when both top an bottom are hit, the ship is known to be on the vertical axis, but the positon within the ship is unknown
        |   this will follow a pattern similar to horizontal centered, where the procedure will check in one direction, then double back if the max length isn't exceded
        | vertical offset: when only one vertical adjacent is hit, the centerpoint is known to be the end of the ship
        | similarly to horizontal offset, the procedure will only go in one direction
        |
    3) based on the cardinal pattern, the procedure will progress along the length of the ship, hitting tiles
        | regardless of which pattern, the procedure will always mark the two cells adjacent to a succesfull hit targeted, based on which axis.
        |    i.e. invalidating top and bottom cells in horizontal patterns, and left and right in verticals
    4) once the procedure has verified that the ship has been "sunk", it resets to default random behavior
        | while the procedure is unable to interface with the [Ship class function to check if it's been sunk] 
        | or evaluation function to literally confirm that the ship has been sunk, the procedure uses this scheme to confirm it has hit the entire ship:
        | a. at least 2 tiles have been hit
        | b. the cells aligned on the same axis as the ship that are one tile before and one tile after are either out of bounds or empty
        | so, by using this scheme, the procedure can determine that an arrangement such as [o][x][x][o] is a complete ship, and that it can return to random targeting
        | this recogniton pattern also works with out of bounds values and previosly targeted tiles, which means that the procedure will actually check the tile before hitting it, 
        | effectivily giving it a sense of knowledge similar to what a human player can acess with respect to the rules and game state
        | TL;DR because the procedure knows that ships can't touch, it prechecks if the tile is "touching" another ship, via cell.targeted, allowing it to be more effective with turns
*/
/*class Attack{
    constructor(){
        this.phase = "random"
    }
    randHit(){
        while(true){
            let hx = Randomizer.nextInt(0,9)
            let hy = Randomizer.nextInt(0,9)
            let cell = pGrid[hx][hy]
            if(!cell.targeted){
                cell.targeted = true;
                if(cell.occupied){
                    cell.circ.setColor("red")
                    this.phase = "eval"
                    this.eval = new EvalStruct(hx,hy)
                }else{
                    cell.circ.setColor("white")
                }
                break;
            }
        }
    }
    evalLoop(){
        let cell = pGrid[this.eval.nHit.x][this.eval.nHit.y]
        if(cell.targeted){
            switch(this.eval.state){
                case"uptarget":
                    this.eval.state = "downcheck"
            }
        }
    }
    hitController(){
        switch(this.phase){
            case"random":
                this.randHit()
                this.hitController()
                break;
            case"eval":
                this.evalLoop()
                
        }
    }
}
*/
// currently set to specifically attack the player (not generic)
class Attack{
    constructor(){
        this.nhit = "rand"; 
        this.nextDir = "up"
        this.nextFailDir= "left"
        this.nextSuccessDir = "down"
        this.depth = 0;
    }
    call(){
        // switch(this.nhit){
        //     case"rand":
        //         randGen();
        //         break;
        //     case"eval":
        //         check
        //         break;
        // }
        this.randGen();
    }
    randGen(){
        let rX = Randomizer.nextInt(0,9)
        let rY = Randomizer.nextInt(0,9)
        let rP = new ArrPoint(rX,rY)
        let cell = pGrid[rP.x][rP.y]
        let targeted = cell.targeted
        if (targeted){
            console.log(`attempted to hit previously targeted cell : ${rP.x},${rP.y},trying again`)
            this.randGen()
        } else{
            hitCell(rP,pGrid);
            pturn = true;
        }
    }
    // // out of scope
    // check(dir,sDir,fDir){

    // }
    // // out of scope
    // evalCheck(dir,sDir,fDir,depth,state){
    //     if(state){
    //         switch(depth){
    //             case 0:
    //                 switch (dir){
    //                     case"up":
    //                         this.nextDir = "down"
    //                         this.nextSuccessDir = "STATE IS VMIDDLE";
    //                         this.nextFailDir = "STATE IS BOTTOM";
    //                         this.depth++
    //                         break;
    //                     case"left":
    //                         this.nextDir = "right"
    //                         this.nextSuccessDir = "STATE IS VMIDDLE";
    //                         this.nextFailDir = "STATE IS BOTTOM";
    //                         this.depth++
    //                         break;

    //                 }
                
    //         }
    //     }
    // }
}
class EvalStruct{
    constructor(x,y){
       this. originPoint = new ArrPoint(x,y) 
    }
}
/**
 * represents a 2d array point
 * @classdesc Useful for storing x & y values while differenciating between raw coordinates and indices 
 */
class ArrPoint{
    /**
     * create a new array point
     * @param {Number} x the x index
     * @param {Number} y the y index
     */
    constructor(x,y){
        this.x = x
        this.y = y
    }
}
/**
 * represents a raw Coordinate point
 * @classdesc Useful for storing x & y values while differenciating between raw coordinates and indices 
 */
class RawPoint{
    /**
     * create a new array point
     * @param {Number} x the x value
     * @param {Number} y the y value
     */
    constructor(x,y){
        this.x = x
        this.y = y
    }
}
function playerAttack(){
   if(cursor.grid == "enemy"){
       let point = cursor.point;
       if(!eGrid[point.x][point.y].targeted){
           let hit = hitCell(point,eGrid);
           if(hit){
               console.log("hit")
               evaluate(eShips,eGrid,"enemy");
               pturn = false;
            } else {
                console.log("miss")
            }
            eAttack.call();
       }
   }
   else{
       console.log("attack failed, try again")
   }
}
function evaluate(arr,grid,gridStr){
    let sunks = 0;
    for(let ship of arr){
        if(!ship.sunk){
            console.log(`checking ${ship.name}`)
            let iter;
            const origin = ship.point;
            const length = ship.len;
            let hits = 0;
            switch(ship.dir){
                case "up":
                    iter = {x:0,y:-1}
                    break;
                case"down":
                    iter = {x:0,y:1}
                    break;
                case"left":
                    iter = {x:-1,y:0}
                    break;
                case"right":
                    iter = {x:1,y:0};
                    break;
                default: break;
            }
            let i = 0;
            let xI = origin.x;
            let yI = origin.y;
            while(true){
                let cell = grid[xI][yI];
                if(cell.targeted && cell.occupied){hits++}
                //  safeguard
                i++
                xI+= iter.x
                yI+= iter.y
                if(i >= length){break}
            }
            if(hits == length){
                console.log(`you sunk my ${ship.name}`)
                ship.sunk = true;
                sunks++
            }
            console.log(hits)
        }else{sunks++}
        if(sunks == arr.length){
            console.log(`the ${gridStr} lost`)
            reset()
        }

    }
}
function hitCell(p,grid){
    console.log("made a hit")
    const state = grid[p.x][p.y].occupied
    grid[p.x][p.y].targeted = true;
    grid[p.x][p.y].circ.setColor(state ? "red": "white")
    return state;
}
function kbListener(e){
    switch(e.key){
        case"r":
            reset();
            break;
        default:
            break
    }
}
function reset(){
    // resets the screen
    removeAll()
    // resets datastructures and variables
    pShips = [null,null,null,null,null]
    eShips = [null,null,null,null,null]
    eGrid = []
    pGrid = []
    sI = 0;
    eI = 0;
    epoch = "setup"
    for (let item of shipTemplates){
        item.pGen = false
        item.eGen = false
    }
    game();
}