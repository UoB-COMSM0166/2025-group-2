let clearButton;
let currentColour;
let colourPicker;
let bgCoolorPicker;
let eraserButton;
let backgroundColour;
let isEraserMode = false;

function setup() {
  createCanvas(400, 400);
  background(255);
  
//   //create background colour picker
//   bgColourPicker = createColorPicker('#FFFFFF');
//   bgColourPicker.position(60,20);
  
//   //create label for background colour picker
//   let bgLabel = createElement('span', 'Background: ');
//   bgLabel.position(60, 0);
  
  //create label for brush colour picker
  let brushLabel = createElement('span', 'Brush: ');
  brushLabel.position(0, 0);
  
  //adding clear canvas button
  clearButton = createButton('Clear Canvas');
  clearButton.position(303, 0); //set button on top right corner
  clearButton.mousePressed(clearCanvas);
  
  //adding eraser toggle button
  eraserButton = createButton('Eraser');
  eraserButton.position(200, 0);
  eraserButton.mousePressed(toggleEraser);
  
  //allowing user to change brush colour
  colourPicker = createColorPicker('#000000');
  colourPicker.position(0, 20);
  
  //initial colour
  currentColour = color(0);
  // backgroundColour = bgColourPicker.color();
  
  // //initial background colour
  // background(backgroundColour);
}

//function for drawing when mouse is pressed
function draw() {
  //updating colour of brush
  currentColour = colourPicker.color();
  // backgroundColour = bgColourPicker.color();
  
  if(mouseIsPressed){
    //left click for drawing
    if(mouseButton === LEFT){
      if(!isEraserMode){
        stroke(currentColour);
      }else{
        stroke(255);
      }
      fill(currentColour); 
      strokeWeight(5);
      line(pmouseX, pmouseY, mouseX, mouseY); //size of pen
    }
  }
  
  if(isEraserMode){
    eraserButton.style('background-color', '#aaffaa');
  }else{
    eraserButton.style('background-color', '#ffffff')
  }
}

//function to clear canvas
function clearCanvas(){
  // backgroundColour = bgColourPicker.color();
  // background(backgroundColour);
  
  background(255);
}

//function to toggle eraser mode
function toggleEraser(){
  isEraserMode = !isEraserMode;
}

document.onccontextmenu = function(){
  return false;
}