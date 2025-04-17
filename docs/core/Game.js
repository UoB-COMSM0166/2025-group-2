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
		// Check if tutorial should be shown
		if (this.tutorialEnabled) {
			this.currentScene = 'tutorial';
			this.isTutorialMode = true;
		} else {
			// Skip tutorial and go straight to the game
			this.currentScene = 'game';
			this.isTutorialMode = false;
		}

		// Initialize GameManager
		this.gameManager = new GameManager(this, mode, this.scaleVal);

		if (this.isTutorialMode) {
			// Make sure the counter is stopped during tutorial

			if (this.gameManager && this.gameManager.uiManager && this.gameManager.uiManager.counter) {
				this.gameManager.uiManager.counter.stop();
			}

			// Create tutorial manager with the game manager instance
			try {
				this.tutorialManager = new TutorialManager(this, this.gameManager);
			} catch (error) {
				// Fall back to starting the game directly if tutorial fails
				this.currentScene = 'game';
				this.isTutorialMode = false;
			}
		} else {
			// Start the counter immediately if tutorial is skipped
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
		this.currentScene = 'game';
		this.isTutorialMode = false;

		try {
			// Reset anything needed after tutorial
			if (this.gameManager) {
				// Start the timer after tutorial ends - wrapped in try/catch
				try {
					// Also reset and start the uiManager counter
					if (this.gameManager.uiManager && this.gameManager.uiManager.counter) {
						this.gameManager.uiManager.counter = new Timer(120);
						this.gameManager.uiManager.counter.start();
					}
				} catch (e) {
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

	updateScale(newScale) {
		this.scaleVal = newScale;
		if (this.gameManager) {
			this.gameManager.updateScale(this.scaleVal);
		}
	}

	backToMenu() {
		if (this.gameManager) {
			this.gameManager.cleanup();
			this.gameManager = null;
		}
		this.currentScene = 'menu';
	}
}
