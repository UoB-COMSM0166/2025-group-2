import { ToolManager } from '../core/ToolManager.js';
import { Coin } from '../models/Coin.js';
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
		this.coin = new Coin(0);
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
		this.displayCoin();
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
	reset() {
		// Reset player score and coins
		this.score.reset();
		this.coins = 100; // Reset to starting coins

		// Reset board state
		if (this.boards) {
			// Clear existing fruits
			this.boards.fruits = [];
			if (this.boards.currentFruit) {
				this.boards.currentFruit.remove();
				this.boards.currentFruit = null;
			}
			if (this.boards.nextFruit) {
				this.boards.nextFruit.remove();
				this.boards.nextFruit = null;
			}

			// Reset timer
			this.boards.timer = 0;
		}

		// Reset tool manager state
		if (this.toolManager) {
			// Reset all tools
			Object.values(this.toolManager.tools).forEach(tool => {
				if (tool.deactivate) {
					tool.deactivate();
				}
			});
		}
	}

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
	 * Display player's coins Display Player's coins
	 *
	 *
	 */
	displayCoin() {
		// Add a small offset to the Coin tag to avoid overlapping with Score
		const offsetX = 200; // Shift 200 pixels to the right
		const coinPositionX =
			this.id === 1
				? this.area.game1.x + this.area.game1.w / 2 + offsetX
				: this.area.game2.x + this.area.game2.w / 2 + offsetX;

		// The Y coordinate can be left unchanged at -60, or another offsetY adjustment can be made
		const coinPositionY = this.area.game1.y - 60;

		this.uiControllor.createLabel(
			`coin_${this.id}`,
			coinPositionX,
			coinPositionY,
			`P${this.id} Coin: ${this.coin.getCoin()}`,
			'#6B4F3F',
			20
		);
	}

	updateCoin() {
		this.uiControllor.updateLabelText(
			`coin_${this.id}`,
			`P${this.id} Coin: ${this.coin.getCoin()}`
		);
	}

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
	 * Player buys a tool
	 *
	 * @param {string} toolType -  Tool type
	 * @param {number} price -  Tool price
	 */
	buyTool(toolType, item) {
		// Always use the coin system, regardless of mode.
		if (this.coin.canAfford(item.price)) {
			if (this.coin.spendCoin(item.price)) {
				this.updateCoin();
				this.toolManager.activate(toolType);
				this.gameManager.uiManager.notificationManager.addNotification(
					`Player ${this.id} has bought ${item.label} ${item.effect} (${item.icon})`
				);
				return true;
			}
		} else {
			this.gameManager.uiManager.notificationManager.addNotification(
				`Player ${this.id} does not have enough coins to buy ${item.label} (${item.icon})`
			);
			return false;
		}
	}
}
