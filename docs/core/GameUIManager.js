import { FruitDisplay, Score, Timer } from '../models/index.js';
import { Shop } from '../shop/index.js';
import { UIControllor } from './UIControllor.js';

export class GameUIManager {
	constructor(gameManager) {
		this.gameManager = gameManager;
		this.ui = new UIControllor();
		this.AREAS = null;
		this.shopItems = null;
		this.timer = 0;
		this.counter = new Timer(120);
		this.score = new Score();

		this.fruitDisplay = new FruitDisplay(gameManager.scaleVal);
		this.shop = new Shop(this.ui, gameManager);

		window.addEventListener('click', event => this.mousePressed(event));
	}

	setupUI(canvasWidth, canvasHeight) {
		this.setupAreas(canvasWidth, canvasHeight);

		this.setupWalls();

		this.fruitDisplay.setupFruitDisplay(this.AREAS.display);
		this.shop.setupShopUI(this.AREAS.shop);

		this.setupLabels();
		this.counter.start();
	}

	// **設定遊戲區域**
	setupAreas(canvasWidth, canvasHeight) {
		const gameWidth = canvasWidth * 0.4;
		const gameHeight = canvasHeight * 0.6;
		const shopWidth = canvasWidth * 0.2;
		const shopHeight = canvasHeight * 0.5;
		const displayWidth = canvasWidth * 0.15;
		const displayHeight = canvasHeight * 0.5;
		const gap = canvasWidth * 0.05;
		const totalWidth = displayWidth + gameWidth + shopWidth + gap * 2;
		const leftMargin = (canvasWidth - totalWidth) / 2;
		const thickness = 10;

		this.AREAS = {
			game: {
				x: leftMargin + displayWidth + gap,
				y: canvasHeight - gameHeight - gap,
				w: gameWidth,
				h: gameHeight,
			},
			shop: {
				x: leftMargin + displayWidth + gameWidth + gap * 2,
				y: canvasHeight - shopHeight - gap,
				w: shopWidth,
				h: shopHeight,
			},
			display: {
				x: leftMargin,
				y: canvasHeight - displayHeight - gap,
				w: displayWidth,
				h: displayHeight,
			},
			dashLine: {
				x1: leftMargin + displayWidth + gap + thickness / 2,
				y1: canvasHeight - gameHeight - gap + 20,
				x2: leftMargin + displayWidth + gap + gameWidth - thickness / 2,
				y2: canvasHeight - gameHeight - gap + 20,
				dashLength: 15,
				gapLength: 10,
				thickness: 10,
			},
		};
	}

	// **設置遊戲牆**
	setupWalls() {
		const thickness = 10;
		this.ui.createNoneCappedWalls(this.AREAS.game, thickness);
		this.ui.createFourWalls(this.AREAS.shop, thickness);
		this.ui.createFourWalls(this.AREAS.display, thickness);
		this.ui.createDashedLine(this.AREAS.dashLine);
	}

	// **設置 UI Labels**
	setupLabels() {
		const textColour = '#6B4F3F';
		this.ui.createLabel(
			'timer',
			this.AREAS.game.x + this.AREAS.game.w / 2,
			this.AREAS.game.y - 150,
			`Time: ${this.counter.getTimeLeft()}s`,
			textColour,
			50
		);

		this.ui.createLabel(
			'score',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 60,
			`Score: ${this.score.getScore()}`,
			textColour,
			20
		);

		this.ui.createLabel(
			'coin',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 30,
			'Coin: 0',
			textColour,
			20
		);
	}

	draw() {
		this.ui.drawLabels();
		this.fruitDisplay.draw();
		this.displayCoin();
		this.displayScore();
		this.displayCounter();
		this.ui.createDashedLine(this.AREAS.dashLine);
	}

	displayCounter() {
		this.ui.updateLabelText('timer', `Time: ${this.counter.getTimeLeft()}s`);
	}

	displayScore() {
		this.ui.updateLabelText('score', `Score: ${this.score.getScore()}`);
	}

	displayCoin() {
		this.ui.updateLabelText('coin', `Coin: 0`);
	}

	mousePressed(event) {
		if (this.shop) {
			this.shop.mousePressed(event);
		}
	}
}
