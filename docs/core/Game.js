import { Timer } from '../models/Timer.js';
import { MenuPage } from '../pages/MenuPage.js';
import { GameManager } from './GameManager.js';
import { TutorialManager } from './TutorialManager.js';

export class Game {
	constructor(scaleVal) {
		this.currentScene = 'menu';
		this.menuPage = new MenuPage(this);
		this.gameManager = null;
		this.scaleVal = scaleVal;
		this.tutorialManager = null;
		this.isTutorialMode = false;
		this.tutorialEnabled = true; // Default: tutorial enabled
	}

	// Set tutorial preference
	setTutorialEnabled(enabled) {
		this.tutorialEnabled = enabled;
	}

	startGame(mode) {
		console.log(`Starting game in ${mode} mode!`);

		// Check if tutorial should be shown
		if (this.tutorialEnabled) {
			this.currentScene = 'tutorial';
			this.isTutorialMode = true;
		} else {
			// Skip tutorial and go straight to the game
			this.currentScene = 'game';
			this.isTutorialMode = false;
		}

		this.menuPage.hideButtons();

		// Initialize GameManager
		this.gameManager = new GameManager(this, mode, this.scaleVal);

		if (this.isTutorialMode) {
			// Make sure the counter is stopped during tutorial
			if (this.gameManager && this.gameManager.counter) {
				this.gameManager.counter.stop();
			}

			// Also stop the uiManager counter
			if (this.gameManager && this.gameManager.uiManager && this.gameManager.uiManager.counter) {
				this.gameManager.uiManager.counter.stop();
			}

			// Create tutorial manager with the game manager instance
			try {
				this.tutorialManager = new TutorialManager(this, this.gameManager);
			} catch (error) {
				console.error('Error creating tutorial manager:', error);
				// Fall back to starting the game directly if tutorial fails
				this.currentScene = 'game';
				this.isTutorialMode = false;
			}
		} else {
			// Start the counter immediately if tutorial is skipped
			if (this.gameManager.counter) {
				this.gameManager.counter.start();
			}
			if (this.gameManager.uiManager && this.gameManager.uiManager.counter) {
				this.gameManager.uiManager.counter.start();
			}

			// Start incident manager right away
			if (this.gameManager && this.gameManager.player && this.gameManager.player.length > 0) {
				this.gameManager.player.forEach(player => {
					if (player.boards && player.boards.incidentManager) {
						player.boards.incidentBegin();
					}
				});
			}
		}

		// Call the mode change callback to notify app.js that the game mode has changed
		if (window.onModeChange) {
			window.onModeChange();
		}
	}

	// Method to start the actual game after tutorial ends
	startActualGame() {
		console.log('Starting actual gameplay after tutorial');
		this.currentScene = 'game';
		this.isTutorialMode = false;

		try {
			// Reset anything needed after tutorial
			if (this.gameManager) {
				this.gameManager.reset();

				// Start the timer after tutorial ends - wrapped in try/catch
				try {
					if (this.gameManager.counter) {
						// Reset and start the counter to ensure it starts from the beginning
						this.gameManager.counter = new Timer(120);
						this.gameManager.counter.start();
					}

					// Also reset and start the uiManager counter
					if (this.gameManager.uiManager && this.gameManager.uiManager.counter) {
						this.gameManager.uiManager.counter = new Timer(120);
						this.gameManager.uiManager.counter.start();
					}
				} catch (e) {
					console.error('Error resetting timers:', e);
					// Create new timers as fallback
					this.gameManager.counter = new Timer(120);
					this.gameManager.counter.start();
					if (this.gameManager.uiManager) {
						this.gameManager.uiManager.counter = new Timer(120);
						this.gameManager.uiManager.counter.start();
					}
				}
			}

			// Also start the incident manager's timer
			if (this.gameManager && this.gameManager.player && this.gameManager.player.length > 0) {
				this.gameManager.player.forEach(player => {
					if (player.boards && player.boards.incidentManager) {
						try {
							player.boards.incidentBegin();
						} catch (e) {
							console.error('Error starting incidents:', e);
						}
					}
				});
			}
		} catch (e) {
			console.error('Error in startActualGame:', e);
		}
	}

	setup() {
		if (this.currentScene === 'menu') {
			this.menuPage.display();
		} else if (this.currentScene === 'tutorial') {
			// Draw the game in the background but don't update it
			if (this.gameManager) {
				this.gameManager.drawWithoutUpdate();
			}
			if (this.tutorialManager) {
				this.tutorialManager.update();
			}
		} else if (this.currentScene === 'game') {
			if (this.gameManager) {
				this.gameManager.update();
			}
		}
	}

	draw() {
		background('#f5ebe0');
		if (this.currentScene === 'menu') {
			this.menuPage.display();
		} else if (this.currentScene === 'tutorial') {
			// Draw the game in the background but don't update it
			if (this.gameManager) {
				this.gameManager.drawWithoutUpdate();
			}
			if (this.tutorialManager) {
				this.tutorialManager.update();
			}
		} else if (this.currentScene === 'game') {
			if (this.gameManager) {
				this.gameManager.update();
			}
		}
	}

	// createBackButton() {
	// 	this.backButton = createButton('Back to Menu');
	// 	this.backButton.position(20, 20); // 設定按鈕位置（左上角）
	// 	this.backButton.mousePressed(() => this.backToMenu());
	// }

	updateScale(newScale) {
		this.scaleVal = newScale;
		if (this.gameManager) {
			this.gameManager.updateScale(this.scaleVal);
		}
	}
}
