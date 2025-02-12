import { Game } from './core/GameManager.js';

const game = new Game();

function setup() {
	game.setup();
}

function draw() {
	game.update();
}

window.setup = setup;
window.draw = draw;
