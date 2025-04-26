import { Button, Player } from '../models/index.js';
import { Timer } from '../models/Timer.js';
import { GameUIManager } from './GameUIManager.js';
import { TutorialManager } from './TutorialManager.js';

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
		if (gameOverMusic && gameOverMusic.isPlaying()) {
			gameOverMusic.stop();
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

		if (this.player && this.player.length > 0) {
			this.player.forEach(player => {
				if (typeof player.reset === 'function') {
					player.reset();
				}

				if (player.coin) {
					player.coin.reset(); // Asegúrate que este método existe
					player.updateCoin?.(); // Si hay un método visual de actualización
				}

				// Eliminar frutas del juego de forma segura
				if (player.boards) {
					// Eliminar frutas visual y físicamente
					player.boards.fruits.forEach(fruit => {
						fruit.remove?.(); // método seguro de eliminación de sprites
					});
					player.boards.fruits = [];

					// Eliminar current y next fruit si existen
					player.boards.currentFruit?.remove?.();
					player.boards.nextFruit?.remove?.();
					player.boards.currentFruit = null;
					player.boards.nextFruit = null;

					// Crear frutas nuevas como si fuera el comienzo
					player.boards.setup();
				}
			});
		}
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
		}
		this.updateScale(this.scaleVal);
		this.uiManager.ui.drawLabels();
		this.uiManager.draw();
		this.uiManager.shop.updateAllButtonPositions(this.uiManager.AREAS.shop);

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
				if (gameOverMusic && !gameOverMusic.isPlaying()) {
					gameOverMusic.loop();
				}
				if (this.uiManager.counter && this.uiManager.counter.stop) {
					this.uiManager.counter.stop();
				}
				noLoop();
			}
		}

		// ✅ Esto siempre va después de todo
		if (this.isGameOver && this.endMessage) {
			this.uiManager.ui.drawEndGameOverlay(this.endMessage);
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
	goToMainMenu() {
		if (gameOverMusic && gameOverMusic.isPlaying()) {
			gameOverMusic.stop();
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
					player.coin.reset(); // Asegúrate que este método existe
					player.updateCoin?.(); // Si hay un método visual de actualización
				}

				// Eliminar frutas del juego de forma segura
				if (player.boards) {
					// Eliminar frutas visual y físicamente
					player.boards.fruits.forEach(fruit => {
						fruit.remove?.(); // método seguro de eliminación de sprites
					});
					player.boards.fruits = [];

					// Eliminar current y next fruit si existen
					player.boards.currentFruit?.remove?.();
					player.boards.nextFruit?.remove?.();
					player.boards.currentFruit = null;
					player.boards.nextFruit = null;

					// Crear frutas nuevas como si fuera el comienzo
					//player.boards.setup();
				}
			});
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

			this.endMessage1 = 'Player 1 Wins';
			this.endMessage2 = 'Player 2 Wins';

			//You can check the value of the max level in player X using ${player2.boards.getMaxFruitLevel()}
			//first checking fruit over line
			if (player1.boards.checkFruitOverLine(dashLineY)) {
				this.uiManager.ui.drawCrossLine(
					player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
					60
				);
				//this.uiManager.ui.drawWinner(player2.boards.gameArea.x + player2.boards.gameArea.w / 2, 60);
				//this.uiManager.ui.drawGameOver(width / 2, height / 2 - 200);

				this.uiManager.ui.drawEndGameOverlay(this.endMessage2);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			if (player2.boards.checkFruitOverLine(dashLineY)) {
				this.uiManager.ui.drawCrossLine(
					player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
					60
				);
				//this.uiManager.ui.drawWinner(player1.boards.gameArea.x + player1.boards.gameArea.w / 2, 60);
				//this.uiManager.ui.drawGameOver(width / 2, height / 2 - 200);

				this.uiManager.ui.drawEndGameOverlay(this.endMessage1);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			//second check if fruit is biggest
			if (player1.boards.checkFruitIsMaximun()) {
				this.uiManager.ui.drawMaximum(
					player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
					60
				);

				//this.uiManager.ui.drawWinner(	player1.boards.gameArea.x + player1.boards.gameArea.w / 2,110);
				//this.uiManager.ui.drawLoser(player2.boards.gameArea.x + player2.boards.gameArea.w / 2, 110);

				this.uiManager.ui.drawEndGameOverlay(this.endMessage1);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			if (player2.boards.checkFruitIsMaximun()) {
				this.uiManager.ui.drawMaximum(
					player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
					60
				);
				//this.uiManager.ui.drawWinner(player2.boards.gameArea.x + player2.boards.gameArea.w / 2,110);
				//this.uiManager.ui.drawLoser(player1.boards.gameArea.x + player1.boards.gameArea.w / 2, 110);

				this.uiManager.ui.drawEndGameOverlay(this.endMessage2);

				this.isGameOver = true;
				this.showEndGameButtons();

				return;
			}

			//third check which player has more score at the end
			if (this.uiManager.counter.getTimeLeft() <= 0) {
				if (player1.score.getScore() == player2.score.getScore()) {
					this.uiManager.ui.drawTie(player1.boards.gameArea.x + player1.boards.gameArea.w / 2, 60);
					this.uiManager.ui.drawTie(player2.boards.gameArea.x + player2.boards.gameArea.w / 2, 60);

					this.uiManager.ui.drawEndGameOverlay("It's a Tie!", true);

					this.isGameOver = true;
					this.showEndGameButtons();
					return;
				}

				if (player1.score.getScore() > player2.score.getScore()) {
					highestScore = player1.score.getScore();
					winner = player1;
					this.uiManager.ui.drawWinner(
						player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
						60
					);
					this.uiManager.ui.drawLoser(
						player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
						60
					);
					winner = player1;
					this.uiManager.ui.drawEndGameOverlay(this.endMessage1);

					this.isGameOver = true;
					this.showEndGameButtons();

					return;
				}

				if (player1.score.getScore() < player2.score.getScore()) {
					highestScore = player2.score.getScore();
					winner = player2;
					this.uiManager.ui.drawWinner(
						player2.boards.gameArea.x + player2.boards.gameArea.w / 2,
						60
					);
					this.uiManager.ui.drawLoser(
						player1.boards.gameArea.x + player1.boards.gameArea.w / 2,
						60
					);

					this.uiManager.ui.drawEndGameOverlay(this.endMessage2);

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

					// Verifica si este score supera al highest registrado
					if (currentScore > this.highestSingleScore) {
						this.highestSingleScore = currentScore;
						this.uiManager.ui.updateLabelText(
							'highest_score',
							`Highest Score: ${this.highestSingleScore}`
						);
					}
					console.log('Current score:', currentScore);

					console.log('Highest single score:', this.highestSingleScore);

					this.uiManager.ui.drawCrossLine(
						player.boards.gameArea.x + player.boards.gameArea.w / 2,
						60
					);
					this.isGameOver = true;
					if (this.isGameOver && gameOverMusic && !gameOverMusic.isPlaying()) {
						gameOverMusic.loop();
					}

					this.uiManager.ui.drawEndGameSingleOverlay(
						'GAME OVER',
						currentScore,
						this.highestSingleScore
					);
					this.showEndGameButtons(true);
					return;
				}
			}
		}
	}

	showEndGameButtons(single = false) {
		let temp = 0;
		const centerX = width / 2;
		const buttonY = height - 80;

		if (single == true) {
			temp = -50;
		}

		this.playAgainButton = new Button(
			'Play Again',
			() => {
				this.playAgainButton.remove(); // 👈 Elimina el botón
				this.exitButton.remove();
				this.reset();
				loop(); // Reinicia el draw loop
			},
			{
				x: centerX - 110,
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
				x: centerX + 30,
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
}
