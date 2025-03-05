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
}
