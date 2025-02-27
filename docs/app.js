import { Game } from './core/GameManager.js';

let game,
	canvas,
	scaleVal = 1;

// Use window.setup because in index.html file use type module to allow import and export file.
window.setup = function () {
	canvas = createCanvas(1200, 1000);
	windowResized();
	game = new Game(scaleVal);
	game.setup();
	document.getElementById('loading').style.display = 'none';
};

window.draw = function () {
	background('#f5ebe0');
	game.update();
};

window.windowResized = function () {
	let scaleX = windowWidth / width;
	let scaleY = windowHeight / height;
	scaleVal = min(scaleX, scaleY);
	canvas.elt.style.transform = `scale(${scaleVal})`;

	let scaledWidth = width * scaleVal;
	let leftOffset = (windowWidth - scaledWidth) / 2;
	canvas.elt.style.position = 'absolute';
	canvas.elt.style.left = leftOffset + 'px';
	canvas.elt.style.top = '0px';
	if (game) {
		game.updateScale(scaleVal);
	}
};
