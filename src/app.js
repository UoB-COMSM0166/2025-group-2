import { Game } from './core/GameManager.js';
import { RainbowFruit } from './shop/RainbowFruit.js';

const game = new Game();

function setup() {
  game.setup();
  window.game = game;
}

function draw() {
  game.update();
}

// When "R" key is pressed, simulate purchasing a RainbowFruit
function keyPressed() {
  if (key === 'r' || key === 'R') {
    RainbowFruit.buyRainbowFruit(game);
  }
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

