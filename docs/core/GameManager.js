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

	drawWithoutUpdate() {
		// Only draw the UI and game elements without updating them
		if (this.uiManager && this.uiManager.ui) {
			this.uiManager.ui.drawLabels();

			// Only draw UI elements without updating
			push();
			this.uiManager.draw(true); // Pass a parameter to indicate we're in tutorial mode
			pop();
		}

		// Draw players and their boards without physics updates
		if (this.player && this.player.length > 0) {
			push(); // Save the drawing state

			this.player.forEach(player => {
				if (player && player.boards) {
					// Draw the current board state without updates
					player.boards.draw();

					// Ensure fruits don't move during tutorial by setting them to static
					if (player.boards.currentFruit && player.boards.currentFruit.sprite) {
						player.boards.currentFruit.sprite.vel.x = 0;
						player.boards.currentFruit.sprite.vel.y = 0;
						player.boards.currentFruit.sprite.collider = 'static';
					}

					if (player.boards.nextFruit && player.boards.nextFruit.sprite) {
						player.boards.nextFruit.sprite.vel.x = 0;
						player.boards.nextFruit.sprite.vel.y = 0;
						player.boards.nextFruit.sprite.collider = 'static';
					}

					// Ensure no physics updates happen during the tutorial
					if (player.boards.fruits && player.boards.fruits.length > 0) {
						player.boards.fruits.forEach(fruit => {
							if (fruit && fruit.sprite) {
								fruit.sprite.vel.x = 0;
								fruit.sprite.vel.y = 0;
								fruit.sprite.collider = 'static';
							}
						});
					}
				}
			});

			pop(); // Restore the drawing state
		}

		// Freeze the game timer display
		if (this.uiManager && this.uiManager.ui && this.uiManager.ui.labels) {
			// Find the timer label
			const timerLabel = this.uiManager.ui.labels['timer'];
			if (timerLabel) {
				// Always show 120s during tutorial
				this.uiManager.ui.updateLabelText('timer', 'Time: 120s');
			}
		}
	}

	reset() {
		// Reset game state after tutorial
		this.isGameOver = false;
		this.timer = 0;

		// Reset and start the timer
		if (this.counter) {
			this.counter = new Timer(120);
			this.counter.start();
		}

		// Reset players if they exist
		if (this.player && this.player.length > 0) {
			this.player.forEach(player => {
				if (typeof player.reset === 'function') {
					player.reset();
				}
			});
		}

		// Restart the game UI
		this.setup();

		// Reset the board for each player
		if (this.player && this.player.length > 0) {
			this.player.forEach(player => {
				if (player.boards) {
					// Clear existing fruits
					player.boards.fruits = [];

					// Create new fruits
					player.boards.setup();
				}
			});
		}
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
		this.uiManager.shop.updateAllButtonPositions(this.uiManager.AREAS.shop);

		this.player.forEach(player => player.update());

		// If counter is 0, end game
		if(this.mode == 'single'){
			if (this.isGameOver) {
				console.log('End of game because counter or GameisOver is TRUE');
				noLoop();
			}
		}
		else if(this.mode == 'double'){
			if (this.counter.getTimeLeft() <= 0 || this.isGameOver) {
				console.log('End of game because counter or GameisOver is TRUE');
				noLoop();
			}
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

		let highestScore = 0;
		let winner = null;
		const dashLineY = this.uiManager.AREAS.dashLine1.y1;

		if (this.mode == 'double') {
			const player1 = this.player[0];
			const player2 = this.player[1];

			//You can check the value of the max level in player X using ${player2.boards.getMaxFruitLevel()}
			//first checking fruit over line
			if (player1.boards.checkFruitOverLine(dashLineY)) {
				this.isGameOver = true;
				return;
			}

			if (player2.boards.checkFruitOverLine(dashLineY)) {
				this.isGameOver = true;
				return;
			}

			//second check if fruit is biggest
			if (player1.boards.checkFruitIsMaximun()) {
				this.isGameOver = true;
				return;
			}

			if (player2.boards.checkFruitIsMaximun()) {
				this.isGameOver = true;
				return;
			}

			//third check which player has more score at the end
			if (this.counter.getTimeLeft() <= 0) {
				if (player1.score.getScore() == player2.score.getScore()) {
					// in this case the output would be console.log('TIE!');
					return;
				}
				if (player1.score.getScore() > player2.score.getScore()) {
					highestScore = player1.score.getScore();
					winner = player1;
				}
				if (player1.score.getScore() < player2.score.getScore()) {
					highestScore = player2.score.getScore();
					winner = player2;
				}
				// In case no tie, console.log(`Player ${winner.id} wins by highest score! , the score is ${winner.score.getScore()}`);
				this.isGameOver = true;
				return;
			}
		}

		if (this.mode == 'single') {
			for (const player of this.player) {
				if (player.boards.checkFruitOverLine(dashLineY)) {
					this.isGameOver = true;
					return;
				}
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
