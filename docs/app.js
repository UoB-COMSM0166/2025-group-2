import { Game } from './core/Game.js';

let game;

function setup() {
	game = new Game();
	game.setup();
	window.game = game;
}

function draw() {
	game.draw();
}

window.setup = setup;
window.draw = draw;
