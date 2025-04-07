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
		this.isDoubleMode = this.mode === 'double';

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
		this.coins = 0; // Reset to starting coins

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
		if (this.isDoubleMode) {
			const scorePositionX =
				this.id === 1
					? this.area.next1.x + this.area.next1.w + 20
					: this.area.next2.x + this.area.next2.w + 20; // Player 2's score on the right

			this.scoreLabelX = scorePositionX;

			// Pre-calculate the width of the fractional text
			textSize(35);
			const scoreText = `P${this.id} Score: ${this.score.getScore()}`;
			this.scoreTextWidth = textWidth(scoreText);

			this.uiControllor.createLabel(
				`score_${this.id}`,
				scorePositionX,
				this.area.game1.y - 20,
				scoreText,
				'#6B4F3F',
				35,
				null,
				LEFT // Use left justification
			);
		} else {
			this.uiControllor.createLabel(
				`score`,
				this.area.shop.x + this.area.shop.w / 2,
				this.area.shop.y - 70,
				`Score: ${this.score.getScore()}`,
				'#6B4F3F',
				35
			);
		}
	}

	updateScore() {
		if (this.isDoubleMode) {
			// Update score text
			const scoreText = `P${this.id} Score: ${this.score.getScore()}`;
			this.uiControllor.updateLabelText(`score_${this.id}`, scoreText);

			// Recalculate fractional text width
			textSize(35);
			this.scoreTextWidth = textWidth(scoreText);

			// Update coin label position based on new fractional text width
			const padding = 30;
			const coinPositionX = this.scoreLabelX + this.scoreTextWidth + padding;

			// Update Coin Tag Position with Newly Added Method
			this.uiControllor.updateLabelPosition(`coin_${this.id}`, coinPositionX);
		} else {
			this.uiControllor.updateLabelText(`score`, `Score: ${this.score.getScore()}`);
		}
	}

	displayCoin() {
		if (this.isDoubleMode) {
			// Make sure the coin label is on the right side of the score, with sufficient spacing
			// Fixed distance between score and coin
			const padding = 30;
			const coinPositionX = this.scoreLabelX + this.scoreTextWidth + padding;
			const coinPositionY = this.area.game1.y - 20;

			this.uiControllor.createLabel(
				`coin_${this.id}`,
				coinPositionX,
				coinPositionY,
				`Coin: ${this.coin.getCoin()}`,
				'#6B4F3F',
				35,
				null,
				LEFT
			);
		} else {
			this.uiControllor.createLabel(
				`coin`,
				this.area.shop.x + this.area.shop.w / 2,
				this.area.shop.y - 30,
				`Coin: ${this.coin.getCoin()}`,
				'#6B4F3F',
				35
			);
		}
	}

	updateCoin() {
		if (this.isDoubleMode) {
			this.uiControllor.updateLabelText(`coin_${this.id}`, `Coin: ${this.coin.getCoin()}`);
		} else {
			this.uiControllor.updateLabelText(`coin`, `Coin: ${this.coin.getCoin()}`);
		}
	}

	/**
	 * Player buys a tool
	 *
	 * @param {string} toolType -  Tool type
	 * @param {Object} item -  Tool details
	 */
	buyTool(toolType, item) {
		// Always use the coin system, regardless of mode.
		if (this.coin.canAfford(item.price)) {
			if (this.coin.spendCoin(item.price)) {
				this.updateCoin();
				this.toolManager.activate(toolType);
				this.gameManager.uiManager.notificationManager.addNotification(
					`Player ${this.id} has bought ${item.label} Tool (${item.icon})`
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
