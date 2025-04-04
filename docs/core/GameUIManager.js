import { NotificationManager } from '../core/NotificationManager.js';
import { FruitDisplay, KeyGuide, Score, Timer } from '../models/index.js';
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
	}

	setupUI(canvasWidth, canvasHeight) {
		this.setupAreas(canvasWidth, canvasHeight);

		this.setupWalls();

		this.fruitDisplay.setupFruitDisplay(this.AREAS.display, this.isDoubleMode);
		this.shop.setupShopUI(this.AREAS.shop);

		this.setupLabels();
		this.counter.start();

		if (this.isDoubleMode) {
			this.keyGuide = new KeyGuide(this.gameManager.scaleVal * 1.5);
			this.keyGuide.setupKeyGuide(this.AREAS.display);
		}
	}

	setupAreas(canvasWidth, canvasHeight) {
		if (this.isDoubleMode) {
			this.AREAS = this.createDoubleAreas(canvasWidth, canvasHeight);
		} else {
			this.AREAS = this.createSingleAreas(canvasWidth, canvasHeight);
		}
	}

	createSingleAreas(canvasWidth, canvasHeight) {
		const gameWidth = canvasWidth * 0.4;
		const gameHeight = canvasHeight * 0.6;
		const shopWidth = canvasWidth * 0.2;
		const shopHeight = canvasHeight * 0.5;
		const displayWidth = canvasWidth * 0.15;
		const displayHeight = canvasHeight * 0.85;
		const gap = canvasWidth * 0.05;
		const totalWidth = displayWidth + gameWidth + shopWidth + gap * 3;
		const leftMargin = (canvasWidth - totalWidth) / 2;
		const thickness = 10;

		return {
			game1: {
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
			dashLine1: {
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

	createDoubleAreas(canvasWidth, canvasHeight) {
		const gameWidth = canvasWidth * 0.38;
		const gameHeight = canvasHeight * 0.65;
		const shopWidth = canvasWidth * 0.15;
		const shopHeight = canvasHeight * 0.5;
		const displayWidth = canvasWidth * 0.5;
		const displayHeight = canvasHeight * 0.1;
		const gapX = canvasWidth * 0.01;
		const gapY = canvasWidth * 0.01;
		const totalWidth = gameWidth * 2 + shopWidth + gapX * 2;
		const leftMargin = (canvasWidth - totalWidth) / 2;
		const bottomY = canvasHeight - displayHeight;
		const thickness = 10;

		return {
			game1: {
				x: leftMargin,
				y: bottomY - gameHeight - gapY,
				w: gameWidth,
				h: gameHeight,
			},
			game2: {
				x: leftMargin + gameWidth + shopWidth + gapX * 2,
				y: bottomY - gameHeight - gapY,
				w: gameWidth,
				h: gameHeight,
			},
			shop: {
				x: leftMargin + gameWidth + gapX,
				y: bottomY - shopHeight - gapY,
				w: shopWidth,
				h: shopHeight,
			},
			display: {
				x: (canvasWidth - displayWidth) / 2,
				y: bottomY,
				w: displayWidth,
				h: displayHeight,
			},
			dashLine1: {
				x1: leftMargin + thickness / 2,
				y1: bottomY - gameHeight - gapY + 130,
				x2: leftMargin + gameWidth - thickness / 2,
				y2: bottomY - gameHeight - gapY + 130,
				dashLength: 15,
				gapLength: 10,
				thickness: 10,
			},
			dashLine2: {
				x1: leftMargin + gameWidth + shopWidth + gapX * 2 + thickness / 2,
				y1: bottomY - gameHeight - gapY + 130,
				x2: leftMargin + gameWidth * 2 + shopWidth + gapX * 2 - thickness / 2,
				y2: bottomY - gameHeight - gapY + 130,
				dashLength: 15,
				gapLength: 10,
				thickness: 10,
			},
			next1: {
				x: leftMargin,
				y: bottomY - gameHeight - gapY - 120,
				w: 120,
				h: 120,
			},
			next2: {
				x: leftMargin + gameWidth + shopWidth + gapX * 2,
				y: bottomY - gameHeight - gapY - 120,
				w: 120,
				h: 120,
			},
		};
	}

	setupWalls() {
		const thickness = 5;

		if (this.isDoubleMode) {
			this.ui.createFourWalls(this.AREAS.game1, thickness);
			this.ui.createFourWalls(this.AREAS.game2, thickness);
			this.ui.createDashedLine(this.AREAS.dashLine2);
		} else {
			this.ui.createNoneCappedWalls(this.AREAS.game1, thickness);
		}
		this.ui.createFourWalls(this.AREAS.shop, thickness);
		this.ui.createFourWalls(this.AREAS.display, thickness);
		this.ui.createDashedLine(this.AREAS.dashLine1);
	}

	setupLabels() {
		const textColour = '#6B4F3F';
		const formattedTime = this.formatTime(this.counter.getTimeLeft());
		if (this.isDoubleMode) {
			this.ui.createLabel(
				'timer',
				this.AREAS.shop.x + this.AREAS.shop.w / 2,
				50,
				`Time: ${formattedTime}`,
				textColour,
				40
			);
		} else {
			this.ui.createLabel(
				'timer',
				this.AREAS.game1.x + this.AREAS.game1.w / 2,
				this.AREAS.game1.y - 150,
				`Time: ${formattedTime}`,
				textColour,
				50
			);
		}
	}

	formatTime(seconds) {
		const mins = floor(seconds / 60);
		const secs = seconds % 60;
		return `${nf(mins, 2)}:${nf(secs, 2)}`;
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
			this.ui.drawNextFruitBox(this.AREAS.next1);
			this.ui.drawNextFruitBox(this.AREAS.next2);
			this.keyGuide.draw();
		}
		// Draw notification message
		this.notificationManager.update();
	}

	displayCounter() {
		const formattedTime = this.formatTime(this.counter.getTimeLeft());
		this.ui.updateLabelText('timer', `Time: ${formattedTime}`);
	}
}
