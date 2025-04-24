import { MenuPage } from '../pages/MenuPage.js';
import { GameManager } from './GameManager.js';

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
		this.gameManager = new GameManager(this, mode, this.scaleVal);

		this.gameManager.startTutorialIfNeeded();
		this.currentScene = this.gameManager.isTutorialMode ? 'tutorial' : 'game';

		// Call the mode change callback to notify app.js that the game mode has changed
		if (window.onModeChange) {
			window.onModeChange();
		}
	}

	setup() {
		this.menuPage.display();
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
