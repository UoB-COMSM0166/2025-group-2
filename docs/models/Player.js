import { UIControllor } from '../core/UIControllor.js';
import { FruitBoard, Score } from '../models/index.js';
import { Shop } from '../shop/index.js';

export class Player {
	constructor(id, gameManager) {
		console.log('gameManager :>> ', gameManager);
		this.id = id;
		this.game = gameManager;
		this.mode = this.game.mode;
		this.score = new Score();
		this.coins = 20;
		console.log('this.score instance of Score:', this.score instanceof Score);
		console.log('this.score :>> ', this.score);
		this.shop = new Shop(this);
		this.scaleVal = gameManager.scaleVal;
		this.uiManager = gameManager.uiManager;
		this.area = this.uiManager.AREAS;
		console.log(gameManager);
		// this.board = new Board(this, id, mode, this.scaleVal);
		this.boards = new FruitBoard(this, this.area.game, this.area.shop, this.scaleVal);
		this.boards.setup();
		this.nextHint = null;

		this.ui = new UIControllor();
		this.setup();
		// this.shop.setupShopUI();
		// this.tool = new ToolManager(this.board, this.board.incidentManager);
	}

	setup() {
		this.displayScore();
	}

	update() {
		this.updateScore();
		this.boards.update();
		// this.tool.update();
		this.ui.drawLabels();

		// this.toolManager.update();
		// this.incidentManager.update();
	}

	reset() {
		// this.score = 0;
		// this.timer.reset();
		// this.coins = 0;
		// this.boards.clear();
	}

	buyItem(itemName) {
		let effect = this.shop.purchaseItem(itemName);
		if (effect) {
			const specialFruits = ['bombTool', 'rainbowTool']; // 定義特殊水果
			if (specialFruits.includes(effect)) {
				this.tool.activateSpecialFruit(effect);
			} else {
				this.tool.activateTool(effect);
			}
		}
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		console.log(`Player ${this.id} scale updated to ${this.scaleVal}`);

		// 更新 Board 的縮放比例
		if (this.boards) {
			this.boards.updateScale(newScale);
		}
	}

	displayScore() {
		this.ui.createLabel(
			'score',
			this.area.shop.x + this.area.shop.w / 2,
			this.area.shop.y - 60,
			`Score: ${this.score.getScore()}`,
			'#6B4F3F',
			20,
			undefined,
			'score'
		);
	}

	updateScore() {
		this.ui.updateLabelText('score', `Score: ${this.score.getScore()}`);
	}

	displayCoin() {
		this.ui.updateLabelText('coin', `Coin: 0`);
	}

	showGameOver() {
		this.ui.drawGameOver(
			this.boards.AREAS.game.x + this.boards.AREAS.game.w / 2,
			this.boards.AREAS.game.y - 60
		);
	}
}
