import { ToolManager } from '../core/ToolManager.js';
import { Board, Score } from '../models/index.js';

/**
 * @param {number} id - Player ID: 1 or 2
 * @param {object} gameManager - Game manager
 */
export class Player {
	constructor(id, gameManager) {
		this.id = id;
		this.gameManager = gameManager;
		this.mode = this.gameManager.mode;
		this.score = new Score();
		this.coins = 100; // 我先預設100，Jin 做的時候請重置為0
		this.scaleVal = gameManager.scaleVal;
		this.uiManager = gameManager.uiManager;
		this.uiControllor = this.uiManager.ui;
		this.area = this.uiManager.AREAS;
		this.boards = null;
		this.toolManager = null;

		this.setup();
	}

	/**
	 * Setup player's game environment
	 */
	setup() {
		this.displayScore();

		this.boards = new Board(this, this.area, this.scaleVal);
		this.toolManager = new ToolManager(this, this.area);
		this.boards.setup();
	}

	update() {
		this.updateScore();
		this.boards.update();
		this.toolManager.update();
	}

	/**
	 * Reset player state
	 * Gerold I think you might need the reset function to clear everything
	 * feel free to change the name or whICH file you want to put just an advice
	 */
	reset() {}

	updateScale(newScale) {
		this.scaleVal = newScale;

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

	/**
	 * 顯示玩家的金幣數量 (Display player's coins)
	 * Jin 這裡請參考displayscore跟updateScore 改寫
	 *
	 */
	displayCoin() {
		this.uiControllor.updateLabelText('coin', `Coin: 0`);
	}

	updateCoin() {}

	/**
	 * Show game over screen
	 * Gerold here is the code for showing RED GAME OVER
	 *
	 */
	showGameOver() {
		this.uiControllor.drawGameOver(
			this.boards.AREAS.game.x + this.boards.AREAS.game.w / 2,
			this.boards.AREAS.game.y - 60
		);
	}

	/**
	 * 玩家購買道具 (Player buys a tool)
	 * Jin
	 * @param {string} toolType - 道具類型 (Tool type)
	 * @param {number} price - 道具價格 (Tool price)
	 */
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
