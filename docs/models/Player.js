import { ToolManager } from '../core/ToolManager.js';
import { FruitBoard, Score } from '../models/index.js';

export class Player {
	constructor(id, gameManager) {
		this.id = id;
		this.gameManager = gameManager;
		this.mode = this.gameManager.mode;
		this.score = new Score();
		this.coins = 100;
		this.scaleVal = gameManager.scaleVal;
		this.uiManager = gameManager.uiManager;
		this.uiControllor = this.uiManager.ui;
		this.area = this.uiManager.AREAS;
		this.boards = null;
		this.toolManager = null;

		this.setup();
	}

	setup() {
		this.displayScore();
		const gameArea =
			this.gameManager.mode === 'single'
				? this.area.game1
				: this.id === 1
				? this.area.game1
				: this.area.game2;

		this.boards = new FruitBoard(this, gameArea, this.area.shop, this.area.display, this.scaleVal);
		// this.boards = new FruitBoard(this, this.area.game, this.area.shop, this.scaleVal);
		this.toolManager = new ToolManager(this, this.area);
		this.boards.setup();
	}

	update() {
		this.updateScore();
		this.boards.update();
		this.toolManager.update();
	}

	reset() {
		// this.score = 0;
		// this.timer.reset();
		// this.coins = 0;
		// this.boards.clear();
	}

	updateScale(newScale) {
		this.scaleVal = newScale;

		// 更新 Board 的縮放比例
		if (this.boards) {
			this.boards.updateScale(newScale);
		}
	}

	displayScore() {
		const scorePositionX =
			this.id === 1
				? this.area.game1.x + this.area.game1.w / 2
				: this.area.game2.x + this.area.game2.w / 2; // Player 2's score on the right

		this.uiControllor.createLabel(
			`score_${this.id}`,
			scorePositionX,
			this.area.game1.y - 60,
			`P${this.id} Score: ${this.score.getScore()}`,
			'#6B4F3F',
			20
		);

	}

	updateScore() {
		this.uiControllor.updateLabelText(
			`score_${this.id}`,
			`P${this.id} Score: ${this.score.getScore()}`
		);
	}

	displayCoin() {
		this.uiControllor.updateLabelText('coin', `Coin: 0`);
	}

	showGameOver() {
		this.uiControllor.drawGameOver(
			this.boards.AREAS.game.x + this.boards.AREAS.game.w / 2,
			this.boards.AREAS.game.y - 60
		);
	}

	buyTool(toolType, price) {
		if (this.coins >= price) {
			this.coins -= price;
			console.log(`Player ${this.id} bought ${toolType}, remaining coins: ${this.coins}`);

			this.toolManager.activate(toolType);
		} else {
			console.log('Not enough coins!');
		}
	}
}
