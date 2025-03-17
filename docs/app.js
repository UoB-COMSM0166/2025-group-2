import { Game } from './core/Game.js';

let game,
	canvas,
	scaleVal = 1;

// Track pressed keys for continuous movement
const keysPressed = {
	a: false,
	A: false,
	d: false,
	D: false,
	ArrowLeft: false,
	ArrowRight: false,
};

// Use window.setup because in index.html file use type module to allow import and export file.
window.setup = function () {
	canvas = createCanvas(1500, 1000);
	windowResized();
	game = new Game(scaleVal);
	game.setup();
	document.getElementById('loading').style.display = 'none';
};

window.draw = function () {
	background('#f5ebe0');
	game.draw();

	// Handle continuous key movement in draw loop
	if (game && game.gameManager && game.gameManager.mode === 'double') {
		// Player 1 continuous movement
		if (keysPressed['a'] || keysPressed['A']) {
			game.gameManager.handleKeyPress('player1-left');
		}
		if (keysPressed['d'] || keysPressed['D']) {
			game.gameManager.handleKeyPress('player1-right');
		}

		// Player 2 continuous movement
		if (keysPressed['ArrowLeft']) {
			game.gameManager.handleKeyPress('player2-left');
		}
		if (keysPressed['ArrowRight']) {
			game.gameManager.handleKeyPress('player2-right');
		}
	}
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

// Track when keys are pressed down
window.keyPressed = function () {
	// Start tracking this key as pressed
	keysPressed[key] = true;

	if (keyCode === LEFT_ARROW) keysPressed['ArrowLeft'] = true;
	if (keyCode === RIGHT_ARROW) keysPressed['ArrowRight'] = true;

	if (game && game.gameManager) {
		// Handle drop keys only on initial press
		if (game.gameManager.mode === 'double') {
			// Player 1 drop
			if (key === 's' || key === 'S') {
				game.gameManager.handleKeyPress('player1-drop');
			}

			// Player 2 drop
			if (keyCode === DOWN_ARROW) {
				game.gameManager.handleKeyPress('player2-drop');
			}
		}
	}

	return false; // Prevent default browser behavior
};

// Track when keys are released
window.keyReleased = function () {
	// Stop tracking this key as pressed
	keysPressed[key] = false;

	if (keyCode === LEFT_ARROW) keysPressed['ArrowLeft'] = false;
	if (keyCode === RIGHT_ARROW) keysPressed['ArrowRight'] = false;

	return false; // Prevent default browser behavior
};

// Handle mouse click for single mode
window.mouseClicked = function () {
	if (game && game.gameManager && game.gameManager.mode === 'single') {
		// Tell player to drop fruit on click
		game.gameManager.handleMouseClick();
	}
	return false;
};
