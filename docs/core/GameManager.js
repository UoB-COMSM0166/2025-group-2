import { Score } from '../models/Score.js';
import { Timer } from '../models/Timer.js';
import { GameUIManager } from './GameUIManager.js';

export class GameManager {
	constructor(game, mode, scaleVal) {
		this.boards = null;
		this.players = null;
		this.mode = mode;
		this.game = game;
		this.scaleVal = scaleVal;
		this.uiManager = new GameUIManager(this);
		this.isGameOver = false;

		this.timer = 0;
		this.counter = new Timer(120);
		this.score = new Score();

		this.setup();
	}

	setup() {
		const canvasWidth = width;
		const canvasHeight = height;

		this.uiManager.setupUI(canvasWidth, canvasHeight);

		//Start counter
		this.counter.start();
	}

	update() {
		if (!this.isGameOver) {
			this.checkIsGameOver();
		}

		this.uiManager.ui.drawLabels();

		// If counter is 0, end game
		if (this.counter.getTimeLeft() <= 0) {
			console.log('End of game because counter');
			noLoop();
		}
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
		this.boards.updateScale(newScale);
	}

	checkIsGameOver() {
		if (this.isGameOver) return;

		// if (this.boards.checkFruitOverLine(this.AREAS.dashLine.y1)) {
		// 	this.isGameOver = true;
		// }
	}

	displayCounter() {
		this.ui.createLabel(
			'timer',
			this.AREAS.game.x + this.AREAS.game.w / 2,
			this.AREAS.game.y - 150,
			`Time: ${this.counter.getTimeLeft()}s`,
			textColour,
			50,
			undefined,
			'timer'
		);
	}

	displayScore() {
		// Create score label
		this.ui.createLabel(
			'score',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 60,
			`Score: ${this.score.getScore()}`,
			textColour,
			20,
			undefined,
			'coin'
		);
	}

	displayCoin() {
		this.ui.createLabel(
			'coin',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 30,
			'Coin: 0',
			textColour,
			20,
			undefined,
			'coin'
		);
	}
}
