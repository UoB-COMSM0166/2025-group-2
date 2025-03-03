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
		this.boards = new FruitBoard(this, this.area.game, this.area.shop, this.scaleVal);
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
		this.uiControllor.createLabel(
			'score',
			this.area.shop.x + this.area.shop.w / 2,
			this.area.shop.y - 60,
			`Score: ${this.score.getScore()}`,
			'#6B4F3F',
			20
		);
	}

	updateScore() {
		this.uiControllor.updateLabelText('score', `Score: ${this.score.getScore()}`);
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
