import { Game } from './core/GameManager.js';

//declaring as global object to allow bomb fruit method to access
window.game = new Game();

function setup() {
  game.setup();
  window.game = game;
}

function draw() {
  game.update();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    game.incidentManager.activateIncident('rain');
  }
}


window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

