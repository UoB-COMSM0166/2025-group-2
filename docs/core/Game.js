import { MenuPage } from '../pages/MenuPage.js';
import { GameManager } from './GameManager.js';

export class Game {
	constructor(scaleVal) {
		this.currentScene = 'menu';
		this.menuPage = new MenuPage(this);
		this.gameManager = null;
		this.scaleVal = scaleVal;
	}

	startGame(mode) {
		console.log(`Starting game in ${mode} mode!`);
		this.currentScene = 'game';
		this.gameManager = new GameManager(this, mode, this.scaleVal);
		this.menuPage.hideButtons();
	}

	setup() {
		if (this.currentScene === 'menu') {
			this.menuPage.display();
		} else if (this.currentScene === 'game') {
			this.gameManager.update();
		}
	}

	draw() {
		background('#f5ebe0');
		if (this.currentScene === 'menu') {
			this.menuPage.display();
		} else if (this.currentScene === 'game') {
			this.gameManager.update();
		}
	}

	// createBackButton() {
	// 	this.backButton = createButton('Back to Menu');
	// 	this.backButton.position(20, 20); // 設定按鈕位置（左上角）
	// 	this.backButton.mousePressed(() => this.backToMenu());
	// }

	updateScale(newScale) {
		this.scaleVal = newScale;
		this.gameManager.updateScale(this.scaleVal);
	}
}
