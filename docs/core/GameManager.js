import { Button, Player } from '../models/index.js';
import { Timer } from '../models/Timer.js';
import { GameUIManager } from './GameUIManager.js';
import { TutorialManager } from './TutorialManager.js';

const endGameTextY = 80;

export class GameManager {
	constructor(game, mode, scaleVal) {
		this.mode = mode;
		this.game = game;
		this.scaleVal = scaleVal;
		this.uiManager = new GameUIManager(this);
		this.highestSingleScore = 0;
		this.tutorialManager = null;
		this.isTutorialMode = false;

		this.setup();

		this.player = this.createPlayers(mode);
		this.isGameOver = false;
	}

	startTutorial() {
		if (this.game.tutorialEnabled) {
			this.isTutorialMode = true;
			this.tutorialManager = new TutorialManager(this.game, this);

			if (this.uiManager?.counter) {
				this.uiManager.counter.stop();
			}
		} else {
			this.isTutorialMode = false;
			this.uiManager?.counter?.start();
			this.player.forEach(player => player.boards?.incidentBegin());
		}
	}

	startActualGameAfterTutorial() {
		this.isTutorialMode = false;
		this.uiManager.counter = new Timer(120);
		this.uiManager.counter.start();

		this.player.forEach(player => {
			player.boards.nextFruit.sprite.visible = true;
			if (player.boards?.incidentManager) {
				player.boards.incidentBegin();
			}
		});

		// Make sure the Store indicator is displayed and updated after the tutorial ends
		if (this.uiManager && this.uiManager.shop) {
			// Force all button positions and indicators to update once
			this.uiManager.shop.setupShopUI(this.uiManager.AREAS.shop);
			//this.uiManager.shop.updateAllButtonPositions(this.uiManager.AREAS.shop);
		}
	}

	updateTutorial() {
		if (this.isTutorialMode && this.tutorialManager) {
			this.drawWithoutUpdate(); // Draw the UI and game elements without updating them
			this.tutorialManager.update();
		}
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
						player.boards.nextFruit.sprite.visible = false;
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
	}

	reset() {
		const soundManager = this.game.soundManager;
		if (soundManager.gameOverMusic && soundManager.gameOverMusic.isPlaying()) {
			soundManager.gameOverMusic.stop();
		}

		if (this.playAgainButton) {
			this.playAgainButton.remove();
			this.playAgainButton = null;
		}
		if (this.exitButton) {
			this.exitButton.remove();
			this.exitButton = null;
		}

		// Reset game state after tutorial
		this.isGameOver = false;

		// Reset and start the timer
		if (this.uiManager?.counter) {
			this.uiManager.counter.reset();
		}

		if (this.uiManager?.shop) {
			this.uiManager.shop.resetIndicators(this.uiManager.AREAS.shop);
			this.uiManager.shop.setupShopUI(this.uiManager.AREAS.shop);
		}

		if (this.player && this.player.length > 0) {
			this.player.forEach(player => {
				if (typeof player.reset === 'function') {
					player.reset();
				}

				if (player.coin) {
					player.coin.reset(); // Make sure this method exists
					player.updateCoin?.(); // If there is a visual update method
				}

				// Safely remove fruits from the game
				if (player.boards) {
					// Remove fruits visually and physically
					player.boards.fruits.forEach(fruit => {
						fruit.remove?.(); // Safe method to remove sprites
					});
					player.boards.fruits = [];

					// Remove current and next fruit if they exist
					player.boards.currentFruit?.remove?.();
					player.boards.nextFruit?.remove?.();
					player.boards.currentFruit = null;
					player.boards.nextFruit = null;

					// Create new fruits as if starting a new game
					player.boards.setup();
				}
			});
		}
		this.uiManager.setupLabels(); // Add this at the end
	}

	setup() {
		const canvasWidth = width;
		const canvasHeight = height;

		this.uiManager.setupUI(canvasWidth, canvasHeight);

		this.exitDuringGameButton = new Button(
			'Exit',
			() => {
				this.goToMainMenu();
			},
			{
				x: 110,
				y: 10,
				getScaleVal: () => this.scaleVal,
				bgColor: '#EF9A9A',
				textColor: '#B71C1C',
				hoverBg: '#FFCDD2',
				hoverText: '#C62828',
			}
		);
	}

	update() {
		if (!this.isGameOver) {
			this.checkIsGameOver();
			this.updateLeadingPlayer();
		}
		this.updateScale(this.scaleVal);
		this.uiManager.ui.drawLabels();
		this.uiManager.draw();

		this.player.forEach(player => player.update());

		let shouldEndGame = false;

		if (this.mode === 'single') {
			shouldEndGame = this.isGameOver;
		} else if (this.mode === 'double') {
			const timeLeft = this.uiManager.counter.getTimeLeft();
			shouldEndGame = timeLeft <= 0 || this.isGameOver;
		}

		if (shouldEndGame) {
			if (!this.isGameOver) {
				this.checkIsGameOver();
			}

			if (this.isGameOver) {
				const soundManager = this.game.soundManager;

				if (soundManager.gameOverMusic && !soundManager.isMuted) {
					soundManager.stopBackgroundMusic();

					soundManager.gameOverMusic.play();
					soundManager.gameOverMusic.onended(() => {
						soundManager.playBackgroundMusic();
					});
				}

				if (this.uiManager.counter && this.uiManager.counter.stop) {
					this.uiManager.ui.removeLabel('timer');
					this.uiManager.counter.stop();
				}
				noLoop();
			}
		}

		// Redraw game end messages on top of everything else
		if (this.isGameOver && this.mode === 'double') {
			this.redrawGameEndMessages();
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
		if (this.uiManager) {
			this.uiManager.updateScale(newScale);
		}
	}

	goToMainMenu() {
		const soundManager = this.game.soundManager;
		if (soundManager.gameOverMusic && soundManager.gameOverMusic.isPlaying()) {
			soundManager.gameOverMusic.stop();
		}

		location.reload();
	}

	cleanup() {
		this.playAgainButton?.remove();
		this.exitButton?.remove();
		this.exitDuringGameButton?.remove();
		this.uiManager?.ui?.clearLabels?.();

		if (this.player && this.player.length > 0) {
			this.player.forEach(player => {
				if (typeof player.reset === 'function') {
					player.reset();
				}

				if (player.coin) {
					player.coin.reset(); // Make sure this method exists
					player.updateCoin?.(); // If there is a visual update method
				}

				// Safely remove fruits from the game
				if (player.boards) {
					// Remove fruits visually and physically
					player.boards.fruits.forEach(fruit => {
						fruit.remove?.(); // Safe method to remove sprites
					});
					player.boards.fruits = [];

					// Remove current and next fruit if they exist
					player.boards.currentFruit?.remove?.();
					player.boards.nextFruit?.remove?.();
					player.boards.currentFruit = null;
					player.boards.nextFruit = null;
				}
			});
		}
	}

	checkIsGameOver() {
		if (this.isGameOver) return;

		const dashLineY = this.uiManager.AREAS.dashLine1.y1;
		let highestScore = 0;
		let winner = null;

		if (this.mode == 'double') {
			const player1 = this.player[0];
			const player2 = this.player[1];

			this.endMessage1 = 'Player 1 Wins';
			this.endMessage2 = 'Player 2 Wins';

			//You can check the value of the max level in player X using ${player2.boards.getMaxFruitLevel()}
			//first checking fruit over line
			if (player1.boards.checkFruitOverLine(dashLineY)) {
				// Stop all incidents for both players
				player1.boards.incidentManager?.stopAllIncidents();
				player2.boards.incidentManager?.stopAllIncidents();

				this.uiManager.ui.drawEndGameOverlay(this.endMessage2);

				this.uiManager.ui.drawCrossLine(
					player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
					endGameTextY
				);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			if (player2.boards.checkFruitOverLine(dashLineY)) {
				// Stop all incidents for both players to prevent warning overlap
				player1.boards.incidentManager?.stopAllIncidents();
				player2.boards.incidentManager?.stopAllIncidents();

				this.uiManager.ui.drawEndGameOverlay(this.endMessage1);

				this.uiManager.ui.drawCrossLine(
					player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
					endGameTextY
				);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			//second check if fruit is biggest
			if (player1.boards.checkFruitIsMaximun()) {
				// Stop all incidents for both players to prevent warning overlap
				player1.boards.incidentManager?.stopAllIncidents();
				player2.boards.incidentManager?.stopAllIncidents();

				this.uiManager.ui.drawEndGameOverlay(this.endMessage1);

				this.uiManager.ui.drawMaximum(
					player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
					endGameTextY
				);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			if (player2.boards.checkFruitIsMaximun()) {
				// Stop all incidents for both players to prevent warning overlap
				player1.boards.incidentManager?.stopAllIncidents();
				player2.boards.incidentManager?.stopAllIncidents();

				this.uiManager.ui.drawEndGameOverlay(this.endMessage2);

				this.uiManager.ui.drawMaximum(
					player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
					endGameTextY
				);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			//third check which player has more score at the end
			if (this.uiManager.counter.getTimeLeft() == 0) {
				this.uiManager.ui.removeLabel('timer');
				// Stop all incidents for both players to prevent warning overlap
				player1.boards.incidentManager?.stopAllIncidents();
				player2.boards.incidentManager?.stopAllIncidents();

				if (player1.score.getScore() == player2.score.getScore()) {
					this.uiManager.ui.drawEndGameOverlay("It's a Tie!", true);

					this.uiManager.ui.drawTie(
						player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
						endGameTextY
					);
					this.uiManager.ui.drawTie(
						player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
						endGameTextY
					);

					this.isGameOver = true;
					this.showEndGameButtons();
					return;
				}

				if (player1.score.getScore() > player2.score.getScore()) {
					highestScore = player1.score.getScore();
					winner = player1;

					// First draw the overlay
					this.uiManager.ui.drawEndGameOverlay(this.endMessage1);

					this.uiManager.ui.drawWinner(
						player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
						endGameTextY
					);
					this.uiManager.ui.drawLoser(
						player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
						endGameTextY
					);
					this.isGameOver = true;
					this.showEndGameButtons();

					return;
				}

				if (player1.score.getScore() < player2.score.getScore()) {
					highestScore = player2.score.getScore();
					winner = player2;

					this.uiManager.ui.drawEndGameOverlay(this.endMessage2);

					this.uiManager.ui.drawWinner(
						player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
						endGameTextY
					);
					this.uiManager.ui.drawLoser(
						player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
						endGameTextY
					);

					this.isGameOver = true;
					this.showEndGameButtons();

					return;
				}
			}
		}

		if (this.mode == 'single') {
			for (const player of this.player) {
				if (player.boards.checkFruitOverLine(dashLineY)) {
					const currentScore = player.score.getScore();

					// Check if this score exceeds the recorded highest score
					if (currentScore > this.highestSingleScore) {
						this.highestSingleScore = currentScore;
						this.uiManager.ui.updateLabelText(
							'highest_score',
							`Highest Score: ${this.highestSingleScore}`
						);
					}

					this.isGameOver = true;

					// Stop all incidents to prevent warning messages
					if (player.boards.incidentManager) {
						player.boards.incidentManager.stopAllIncidents();
					}

					const soundManager = this.game.soundManager;
					if (this.isGameOver && soundManager.gameOverMusic && !soundManager.isMuted) {
						soundManager.gameOverMusic.play();
					}

					// Calculate the center of the game area
					const gameAreaCenter = player.boards.gameArea.x + player.boards.gameArea.w / 2;

					this.uiManager.ui.drawEndGameSingleOverlay(
						'GAME OVER',
						currentScore,
						this.highestSingleScore,
						gameAreaCenter
					);
					this.showEndGameButtons(true, gameAreaCenter);
					return;
				}
			}
		}
	}

	showEndGameButtons(single = false, gameAreaCenter = null) {
		let temp = 0;
		const centerX = gameAreaCenter || width / 2;
		const buttonY = height - 80;

		if (single == true) {
			temp = -50;
		}

		this.playAgainButton = new Button(
			'Play Again',
			() => {
				this.playAgainButton.remove();
				this.exitButton.remove();
				this.reset();
				loop();
			},
			{
				x: centerX - 100,
				y: buttonY - 600 + temp,
				getScaleVal: () => this.scaleVal,
				bgColor: '#A5D6A7',
				textColor: '#1B5E20',
				hoverBg: '#C8E6C9',
				hoverText: '#2E7D32',
			}
		);

		this.exitButton = new Button(
			'Exit',
			() => {
				this.goToMainMenu();
			},
			{
				x: centerX + 40,
				y: buttonY - 600 + temp,
				getScaleVal: () => this.scaleVal,
				bgColor: '#EF9A9A',
				textColor: '#B71C1C',
				hoverBg: '#FFCDD2',
				hoverText: '#C62828',
			}
		);
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

	redrawGameEndMessages() {
		if (!this.isGameOver || this.mode !== 'double') return;

		// We need to determine which end condition triggered the game over
		// and redraw the appropriate messages on top
		const player1 = this.player[0];
		const player2 = this.player[1];
		const dashLineY = this.uiManager.AREAS.dashLine1.y1;

		// Check for crossed line
		if (player1.boards.checkFruitOverLine(dashLineY)) {
			this.uiManager.ui.drawCrossLine(
				player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
				endGameTextY
			);
			return;
		}

		if (player2.boards.checkFruitOverLine(dashLineY)) {
			this.uiManager.ui.drawCrossLine(
				player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
				endGameTextY
			);
			return;
		}

		// Check for maximum fruit
		if (player1.boards.checkFruitIsMaximun()) {
			this.uiManager.ui.drawMaximum(
				player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
				endGameTextY
			);
			return;
		}

		if (player2.boards.checkFruitIsMaximun()) {
			this.uiManager.ui.drawMaximum(
				player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
				endGameTextY
			);
			return;
		}

		// Check for time-based end
		if (this.uiManager.counter.getTimeLeft() <= 0) {
			if (player1.score.getScore() === player2.score.getScore()) {
				this.uiManager.ui.drawTie(
					player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
					endGameTextY
				);
				this.uiManager.ui.drawTie(
					player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
					endGameTextY
				);
				return;
			}

			if (player1.score.getScore() > player2.score.getScore()) {
				this.uiManager.ui.drawWinner(
					player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
					endGameTextY
				);
				this.uiManager.ui.drawLoser(
					player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
					endGameTextY
				);
				return;
			}

			if (player1.score.getScore() < player2.score.getScore()) {
				this.uiManager.ui.drawWinner(
					player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
					endGameTextY
				);
				this.uiManager.ui.drawLoser(
					player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
					endGameTextY
				);
				return;
			}
		}
	}

	updateLeadingPlayer() {
		if (this.mode !== 'double' || this.isGameOver) return;

		const player1 = this.player[0];
		const player2 = this.player[1];

		// Get the current scores of both players
		const score1 = player1.score.getScore();
		const score2 = player2.score.getScore();

		// Make the leading player's score label flash (optional effect)
		const pulseEffect = frameCount % 40 < 20; // Flashes every 2/3 seconds

		if (score1 > score2 && pulseEffect) {
			this.uiManager.ui.updateLabelColour(`score_1`, '#FF5733');
		} else if (score1 > score2) {
			this.uiManager.ui.updateLabelColour(`score_1`, '#6B4F3F'); // Restore original color
		}

		if (score2 > score1 && pulseEffect) {
			this.uiManager.ui.updateLabelColour(`score_2`, '#3366FF');
		} else if (score2 > score1) {
			this.uiManager.ui.updateLabelColour(`score_2`, '#6B4F3F'); // Restore original color
		}
	}
}
