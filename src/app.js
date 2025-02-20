import { Game } from './core/GameManager.js';
import { RainbowFruit } from './shop/RainbowFruit.js';

//declaring as global object to allow bomb fruit method to access
window.game = new Game();

function setup() {
  game.setup();
  window.game = game;
}

function draw() {
  game.update();
}


// When "R" key is pressed, simulate purchasing a RainbowFruit
function keyPressed() {
  game.keyPressed();
}


window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

