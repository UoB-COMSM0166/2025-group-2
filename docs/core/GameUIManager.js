import { NotificationManager } from '../core/NotificationManager.js';
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
		this.notificationManager = new NotificationManager(); // Added notification manager
		this.isDoubleMode = this.gameManager.mode === 'double';
		this.player = this.gameManager.player;

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

	setupAreas(canvasWidth, canvasHeight) {
		const gameWidth = canvasWidth * (this.isDoubleMode ? 0.3 : 0.4);
		const gameHeight = canvasHeight * 0.6;
		const shopWidth = canvasWidth * (this.isDoubleMode ? 0.15 : 0.2);
		const shopHeight = canvasHeight * 0.5;
		const displayWidth = canvasWidth * (this.isDoubleMode ? 0.1 : 0.15);
		const displayHeight = canvasHeight * 0.85;
		const gap = canvasWidth * (this.isDoubleMode ? 0.03 : 0.05);
		const totalWidth =
			displayWidth + gameWidth + (this.isDoubleMode ? gameWidth : 0) + shopWidth + gap * 3;
		const leftMargin = (canvasWidth - totalWidth) / 2;
		const thickness = 10;

		this.AREAS = {
			game1: {
				x: leftMargin + displayWidth + gap,
				y: canvasHeight - gameHeight - gap,
				w: gameWidth,
				h: gameHeight,
			},
			game2: {
				x: leftMargin + displayWidth + gameWidth + shopWidth + gap * 3,
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
			dashLine1: {
				x1: leftMargin + displayWidth + gap + thickness / 2,
				y1: canvasHeight - gameHeight - gap + 20,
				x2: leftMargin + displayWidth + gap + gameWidth - thickness / 2,
				y2: canvasHeight - gameHeight - gap + 20,
				dashLength: 15,
				gapLength: 10,
				thickness: 10,
			},
			dashLine2: {
				x1: leftMargin + displayWidth + gameWidth + shopWidth + gap * 3 + thickness / 2,
				y1: canvasHeight - gameHeight - gap + 20,
				x2: leftMargin + displayWidth + gameWidth * 2 + shopWidth + gap * 3 - thickness / 2,
				y2: canvasHeight - gameHeight - gap + 20,
				dashLength: 15,
				gapLength: 10,
				thickness: 10,
			},
		};
	}

	setupWalls() {
		const thickness = 10;

		this.ui.createNoneCappedWalls(this.AREAS.game1, thickness);
		this.ui.createFourWalls(this.AREAS.shop, thickness);
		this.ui.createFourWalls(this.AREAS.display, thickness);
		this.ui.createDashedLine(this.AREAS.dashLine1);
		if (this.isDoubleMode) {
			this.ui.createDashedLine(this.AREAS.dashLine2);
			this.ui.createNoneCappedWalls(this.AREAS.game2, thickness);
		}
	}

	setupLabels() {
		const textColour = '#6B4F3F';
		if (this.isDoubleMode) {
			this.ui.createLabel(
				'timer',
				this.AREAS.shop.x + this.AREAS.shop.w / 2,
				this.AREAS.shop.y - 300,
				`Time: ${this.counter.getTimeLeft()}s`,
				textColour,
				50
			);
		} else {
			this.ui.createLabel(
				'timer',
				this.AREAS.game1.x + this.AREAS.game1.w / 2,
				this.AREAS.game1.y - 150,
				`Time: ${this.counter.getTimeLeft()}s`,
				textColour,
				50
			);
		}
	}

	// Modified method with tutorial parameter:
	draw(isTutorial = false) {
		this.ui.drawLabels();
		this.fruitDisplay.draw();

		// Only update the counter if we're not in tutorial mode
		if (!isTutorial) {
			this.displayCounter();
		}

		this.ui.createDashedLine(this.AREAS.dashLine1);
		if (this.isDoubleMode) {
			this.ui.createDashedLine(this.AREAS.dashLine2);
		}
		// Draw notification message
		this.notificationManager.update();
	}

	displayCounter() {
		this.ui.updateLabelText('timer', `Time: ${this.counter.getTimeLeft()}s`);
	}

	mousePressed(event) {
		if (this.shop) {
			this.shop.mousePressed(event);
		}
	}
}
