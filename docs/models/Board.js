import { IncidentManager } from '../core/IncidentManager.js';
import { ToolManager } from '../core/ToolManager.js';
import { UIControllor } from '../core/UIControllor.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Fruit } from './index.js';

export class Board {
	constructor(player, id, mode, scaleVal) {
		this.player = player;
		this.id = id;
		this.mode = mode;
		this.AREAS = null;
		this.scaleVal = scaleVal;

		this.timer = 0;
		this.gravity = 15;
		this.fruits = [];
		this.currentFruit = null;

		this.incidentManager = new IncidentManager();
		this.toolManager = new ToolManager();
		this.ui = new UIControllor();

		world.gravity.y = this.gravity;
		this.currentFruit = new Fruit(0, 300, 25, 30);
	}

	setup() {
		const canvasWidth = width;
		const canvasHeight = height;

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

		// Creating game walls
		this.ui.createNoneCappedWalls(this.AREAS.game, thickness);
		// Creating shop walls
		this.ui.createFourWalls(this.AREAS.shop, thickness);
		// Creating display area
		this.ui.createFourWalls(this.AREAS.display, thickness);
		// Creating the top dashed line
		this.ui.createDashedLine(this.AREAS.dashLine);
		// Create timer label

		const shopTextSize = 25;

		// Intialise fruit play board.
		this.boards = new Board(this.AREAS.game, this.AREAS.shop, thickness, this.scaleVal);
		this.boards.setup();
		// Create the fruits to show in the level
		this.boards.createFruitsLevel(this.AREAS.display);

		this.incidentManager = new IncidentManager(this);
		this.toolManager = new ToolManager(this, this.boards, this.incidentManager);

		// Create tool buttons
		this.ui.createLabel('shake', 0, 0, '🫨Shuffle', textColour, shopTextSize, bgColour, 'shopItem');
		//shuffleButton.mousePressed(() => this.toolManager.activateTool('shuffle'));

		this.ui.createLabel('divine', 0, 0, '🛡️Divine', textColour, shopTextSize, bgColour, 'shopItem');
		//divineButton.mousePressed(() => this.toolManager.activateTool('divineShield'));

		this.ui.createLabel('random', 0, 0, '🗃️Random', textColour, shopTextSize, bgColour, 'shopItem');
		//randomToolButton.mousePressed(() => this.toolManager.randomTool());

		this.ui.createLabel(
			'double',
			0,
			0,
			'💰Double Score',
			textColour,
			shopTextSize,
			bgColour,
			'shopItem'
		);
		//doubleScoreToolButton.mousePressed(() => this.toolManager.activateTool('doubleScore'));

		this.ui.createLabel('wind', 0, 0, '🌪️Wind', textColour, shopTextSize, bgColour, 'shopItem');
		//windButton.mousePressed(() => this.incidentManager.activateIncident('wind'));

		this.ui.createLabel(
			'rainbow',
			0,
			0,
			'🌈Rainbow',
			textColour,
			shopTextSize,
			bgColour,
			'shopItem'
		);
		//rainbowButton.mousePressed(() => this.toolManager.activateSpecialFruit('rainbowFruit'));

		this.ui.createLabel('bomb', 0, 0, '💣Bomb', textColour, shopTextSize, bgColour, 'shopItem');
		//bombButton.mousePressed(() => this.toolManager.activateSpecialFruit('bombFruit'));

		this.shopItems = Object.values(this.ui.getLabels()).filter(label => label.type === 'shopItem');
		// List all the shopButtons in shop area.
		this.listShopItems(this.shopItems, 'shopItem', this.AREAS.shop);
	}

	update() {
		// this.ui.createDashedLine(this.AREAS.dashLine);
		this.ui.drawLabels();

		this.displayScore();
		this.displayCoin();

		this.handleCurrentFruit();
		this.handleMerging();
		this.fruits = this.fruits.filter(fruit => !fruit.removed);

		this.toolManager.update();
		this.incidentManager.update();
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		console.log(`Board ${this.id} scale updated to ${this.scaleVal}`);
	}

	setCurrentFruit(fruit) {
		if (this.currentFruit) {
			this.currentFruit.remove();
		}
		this.currentFruit = fruit;
	}

	handleCurrentFruit() {
		// let leftBound = this.gameArea.x + this.wallWidth;
		// let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
		// let topBound = this.gameArea.y + this.gameArea.h;
		// let currentMouseX = mouseX / this.scaleVal;
		// let currentMouseY = mouseY / this.scaleVal;
		// if (this.currentFruit) {
		// 	// allow current fruit move with mouse
		// 	this.currentFruit.moveWithMouse(leftBound, rightBound, this.gameArea.y - DISTFROMGAME);
		// 	this.currentFruit.letFall();
		// } else {
		// 	// Timer increments when there is no current fruit
		// 	this.timer++;
		// 	if (this.timer > 10) {
		// 		// Change the next fruit to the current fruit
		// 		this.currentFruit = this.nextFruit;
		// 		// Generate new fruit at the top of the shop area
		// 		let newType = int(random(5));
		// 		this.nextFruit = new Fruit(
		// 			newType,
		// 			this.shopArea.x + this.shopArea.w / 2,
		// 			this.shopArea.y - DISTFROMSHOP,
		// 			30 + 20 * newType,
		// 			this.scaleVal
		// 		);
		// 		this.nextFruit.doNotFall();
		// 		this.timer = 0;
		// 	}
		// }
		// // When the mouse is pressed, put the current fruit into the fruits array and clear currentFruit
		// if (
		// 	mouseIsPressed &&
		// 	this.currentFruit &&
		// 	this.currentFruit.getXPosition() < rightBound &&
		// 	this.currentFruit.getXPosition() > leftBound &&
		// 	currentMouseX < rightBound &&
		// 	currentMouseX > leftBound &&
		// 	currentMouseY < topBound
		// ) {
		// 	this.currentFruit.sprite.vel.y = this.gravity;
		// 	this.currentFruit.startFalling();
		// 	this.fruits.push(this.currentFruit);
		// 	this.currentFruit = null;
		// }
	}

	handleMerging() {
		if (!this.fruits?.length) return;
		for (let i = 0; i < this.fruits.length; i++) {
			for (let j = i + 1; j < this.fruits.length; j++) {
				const a = this.fruits[i];
				const b = this.fruits[j];

				if (a.i === b.i && checkCollision(a.sprite, b.sprite) && !a.removed && !b.removed) {
					const mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) {
						mergedFruit.updateScale(this.scaleVal);
						this.fruits.push(mergedFruit);
						this.player.addScore(mergedFruit.i);
						this.player.addCoins(mergedFruit.i);
					}
				}
			}
		}
	}

	isClickingUI(mx, my) {
		let uiButtons = selectAll('button');
		for (let btn of uiButtons) {
			let bx = btn.position().x;
			let by = btn.position().y;
			let bw = btn.width;
			let bh = btn.height;

			if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
				return true;
			}
		}
		return false;
	}

	reset() {
		this.fruits = [];
		this.toolManager.reset();
		this.incidentManager.reset();
	}

	displayScore() {
		// fill(0);
		// textSize(16);
		// text(`Score: ${this.score.getScore()}`, 10, 30);
		// Create score label
		this.ui.createLabel(
			'score',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 60,
			`Score: ${this.score.getScore()}`,
			textColour,
			20,
			undefined,
			'coin'
		);
	}

	displayCoin() {
		this.ui.createLabel(
			'coin',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 30,
			'Coin: 0',
			textColour,
			20,
			undefined,
			'coin'
		);
	}
}
