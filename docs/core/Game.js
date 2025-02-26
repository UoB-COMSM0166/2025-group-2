import { GameManager } from './GameManager.js';
import { MenuPage } from '../pages/MenuPage.js';

export class Game {
	constructor() {
		this.currentScene = 'menu';
		this.menuPage = new MenuPage(this);
		this.gameManager = null;
	}

	startGame(mode) {
		console.log(`Starting game in ${mode} mode!`);
		this.currentScene = 'game';
		this.gameManager = new GameManager(this, mode);
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
}
