import { MenuPage } from '../pages/MenuPage.js';
import { GameManager } from './GameManager.js';
import { SoundManager } from './SoundManager.js';

export class Game {
	constructor(scaleVal) {
		this.currentScene = 'menu';
		this.menuPage = new MenuPage(this);
		this.gameManager = null;
		this.scaleVal = scaleVal;
		this.tutorialManager = null;
		this.isTutorialMode = false;
		this.tutorialEnabled = true; // Default: tutorial enabled
		this.soundManager = new SoundManager(); // Add sound management
	}

	// Set tutorial preference
	setTutorialEnabled(enabled) {
		this.tutorialEnabled = enabled;
	}

	startGame(mode) {
		// start background music
		this.soundManager.playBackgroundMusic();

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

		this.gameManager.startTutorial();
		this.currentScene = this.gameManager.isTutorialMode ? 'tutorial' : 'game';

		// Call the mode change callback to notify app.js that the game mode has changed
		if (window.onModeChange) {
			window.onModeChange();
		}
	}

	setup() {
		this.menuPage.display();

		this.soundManager.preload();
	}

	draw() {
		background('#f5ebe0');
		if (!this.gameManager) {
			this.menuPage.display();
			return;
		}

		if (this.gameManager.isTutorialMode) {
			this.gameManager.updateTutorial();
		} else {
			this.gameManager.update();
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
