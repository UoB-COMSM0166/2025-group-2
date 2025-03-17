import { Timer } from '../models/Timer.js';
import { Player } from '../models/index.js';
import { GameUIManager } from './GameUIManager.js';

export class GameManager {
	constructor(game, mode, scaleVal) {
		this.mode = mode;
		this.game = game;
		this.scaleVal = scaleVal;
		this.uiManager = new GameUIManager(this);
		this.setup();

		this.player = this.createPlayers(mode);
		this.isGameOver = false;

		this.timer = 0;
		this.counter = new Timer(120);
	}

	setup() {
		const canvasWidth = width;
		const canvasHeight = height;

		this.uiManager.setupUI(canvasWidth, canvasHeight);
	}

	update() {
		if (!this.isGameOver) {
			this.checkIsGameOver();
		}
		this.updateScale(this.scaleVal);
		this.uiManager.ui.drawLabels();
		this.uiManager.draw();

		this.player.forEach(player => player.update());

		// If counter is 0, end game
		if (this.counter.getTimeLeft() <= 0 || this.isGameOver) {
			// console.log('End of game because counter');
			noLoop();
		}
	}

	createPlayers(mode) {
		return mode === 'single' ? [new Player(1, this)] : [new Player(1, this), new Player(2, this)];
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		for (const player of this.player) {
			player.boards.updateScale(newScale);
		}
	}

	checkIsGameOver() {
		if (this.isGameOver) return;

		const dashLineY = this.uiManager.AREAS.dashLine1.y1;

		for (const player of this.player) {
			if (player.boards.checkFruitOverLine(dashLineY)) {
				this.isGameOver = true;
				console.log('Game Over: A fruit crossed the dash line!');
				return;
			}
		}
	}

	// Handle keyboard input for double mode
	handleKeyPress(action) {
		if (this.mode !== 'double') return;

		// Determine which player's action needs to be handled
		if (action.startsWith('player1')) {
			const player1 = this.player[0];
			if (player1 && player1.boards) {
				player1.boards.handleKeyboardInput(action);
			}
		} else if (action.startsWith('player2')) {
			const player2 = this.player[1];
			if (player2 && player2.boards) {
				player2.boards.handleKeyboardInput(action);
			}
		}
	}

	// Handle mouse click for single mode
	handleMouseClick() {
		if (this.mode !== 'single') return;

		// In single mode, there's only one player
		const player = this.player[0];
		if (player && player.boards) {
			player.boards.handleMouseClick();
		}
	}
}
