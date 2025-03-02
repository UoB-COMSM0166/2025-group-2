import { Timer } from '../models/Timer.js';
import { Player } from '../models/index.js';
import { GameUIManager } from './GameUIManager.js';

export class GameManager {
	constructor(game, mode, scaleVal) {
		// this.boards = null;
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
		if (this.counter.getTimeLeft() <= 0) {
			// console.log('End of game because counter');
			// noLoop();
		}
	}

	createPlayers(mode) {
		return mode === 'single' ? [new Player(1, this)] : [new Player(1, this), new Player(2, this)];
	}

	mousePressed() {
		let logicX = mouseX / this.scaleVal;
		let logicY = mouseY / this.scaleVal;
		console.log('mouse clicked and check if it clicks shopitem');
		let clickedTool = this.checkShopItemClick(this.shopItems, logicX, logicY);
		if (clickedTool) {
			console.log(`tool clicked: ${clickedTool}`);
			this.handleToolClick(clickedTool);
		}
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		// this.boards.updateScale(newScale);
	}

	checkIsGameOver() {
		if (this.isGameOver) return;

		// if (this.boards.checkFruitOverLine(this.AREAS.dashLine.y1)) {
		// 	this.isGameOver = true;
		// }
	}
}
