import { Game } from './core/Game.js';

let game, canvas, scaleVal = 1

window.setup  = function() {
  canvas = createCanvas(1200, 1000);
  windowResized();
  game = new Game();
  game.setup();
  document.getElementById("loading").style.display = "none";
}

window.draw = function() {
  background('#f5ebe0');
  game.update();
}


window.windowResized = function() {
  let scaleX = windowWidth / width;
  let scaleY = windowHeight / height;
  scaleVal = min(scaleX, scaleY);
  canvas.elt.style.transform = `scale(${scaleVal})`;

  let scaledWidth = width * scaleVal;
  let leftOffset = (windowWidth - scaledWidth) / 2;
  canvas.elt.style.position = 'absolute';
  canvas.elt.style.left = leftOffset + 'px';
  canvas.elt.style.top = '0px';
}



