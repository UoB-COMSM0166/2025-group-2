import { MenuPage } from '../pages/MenuPage.js';
import { GameManager } from './GameManager.js';

export class Game {
	constructor() {
		this.currentScene = 'menu';
		this.menuPage = new MenuPage(this);
		this.gameManager = null;
		this.backButton = null;
	}

	startGame(mode) {
		console.log(`Starting game in ${mode} mode!`);
		this.currentScene = 'game';
		this.gameManager = new GameManager(this, mode);

		this.menuPage.hideButtons();

		// this.createBackButton();
	}

	setup() {
		new Canvas(windowWidth, windowHeight);
		background('#f5ebe0');
	}

	draw() {
		background('#f5ebe0');
		if (this.currentScene === 'menu') {
			this.menuPage.display();
		} else if (this.currentScene === 'game') {
			this.gameManager.update();
		}
	}

	createBackButton() {
		this.backButton = createButton('Back to Menu');
		this.backButton.position(20, 20); // 設定按鈕位置（左上角）
		this.backButton.mousePressed(() => this.backToMenu());
	}

	// backToMenu() {
	// 	this.currentScene = 'menu'; // 切換回選單
	// 	if (this.gameManager) {
	// 		this.gameManager.cleanup(); // 讓 GameManager 進行額外清理（例如計時器）
	// 	}
	// 	this.gameManager = null; // **清除遊戲管理器**

	// 	// **移除返回按鈕**
	// 	if (this.backButton) {
	// 		this.backButton.remove();
	// 		this.backButton = null;
	// 	}

	// 	// **顯示選單按鈕**
	// 	this.menuPage.showButtons();
	// }
}
