import { Board } from '../models/FruitBoard.js';
import { Score } from '../models/Score.js';
import { Timer } from '../models/Timer.js';
import { IncidentManager } from './IncidentManager.js';
import { ToolManager } from './ToolManager.js';
import { UIControllor } from './UIControllor.js';

const bgColour = '#E5C3A6';
const colourAfterClick = '#F4D8C6';
const textColour = '#6B4F3F';
const textAfterClick = '#A3785F';

export class GameManager {
	constructor(scaleVal) {
		this.boards = null;
		this.players = null;
		this.ui = new UIControllor();
		this.AREAS = null;
		this.isGameOver = false;
		this.scaleVal = scaleVal;

		this.timer = 0;
		this.counter = new Timer(120);
		this.score = new Score();
		this.incidentManager = null;
		this.toolManager = null;
		this.shopItems = null;
	}

	setup() {
		const canvasWidth = width;
		const canvasHeight = height;

		//Start counter
		this.counter.start();
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
		if (!this.isGameOver) {
			this.boards.update();
			this.checkIsGameOver(this.AREAS.dashLine.y1);
		}

		if (this.isGameOver) {
			this.ui.drawGameOver(this.AREAS.game.x + this.AREAS.game.w / 2, this.AREAS.game.y - 60);
		}

		this.ui.createDashedLine(this.AREAS.dashLine);
		this.ui.drawLabels();

		this.toolManager.update();
		this.incidentManager.update();

		this.displayScore();
		this.displayCounter();
		this.displayCoin();

		// If counter is 0, end game
		if (this.counter.getTimeLeft() <= 0) {
			console.log('End of game because counter');
			noLoop();
		}

		// this.ui.updateLabelText('score', `Score2: ${this.score.getScore()}`);
	}

	mousePressed() {
		let logicX = mouseX / this.scaleVal;
		let logicY = mouseY / this.scaleVal;
		console.log('mouse clicked and check if it clicks shopitem');
		let clickedTool = this.checkShopItemClick(this.shopItems, logicX, logicY);
		if (clickedTool) {
			console.log(`tool clicked: ${clickedTool}`);
			this.handleToolClick(clickedTool);
		}
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		this.boards.updateScale(newScale);
	}

	checkIsGameOver() {
		if (this.isGameOver) return;

		if (this.boards.checkFruitOverLine(this.AREAS.dashLine.y1)) {
			this.isGameOver = true;
		}
	}

	displayCounter() {
		// fill(0);
		// textSize(16);
		// text(`Timer: ${this.counter.getTimeLeft()}s`, 300, 60);
		this.ui.createLabel(
			'timer',
			this.AREAS.game.x + this.AREAS.game.w / 2,
			this.AREAS.game.y - 150,
			`Time: ${this.counter.getTimeLeft()}s`,
			textColour,
			50,
			undefined,
			'timer'
		);
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

	listShopItems(shopItems, type, shopArea) {
		console.log('starting to list shop items');
		if (shopItems.length === 0) return;
		let maxWidth = Math.max(...shopItems.map(label => label.w));
		let maxHeight = Math.max(...shopItems.map(label => label.h));

		let gap = 10;
		let cellWidth = maxWidth + gap;
		let cellHeight = maxHeight + gap;

		// Calculate the max column numbers
		let cols = floor(shopArea.w / cellWidth);
		if (cols < 1) cols = 1;
		let rows = ceil(shopItems.length / cols);

		// Calculate margin center the shopItems
		let totalGridWidth = cols * cellWidth;
		let totalGridHeight = rows * cellHeight;
		let offsetX = shopArea.x + (shopArea.w - totalGridWidth) / 2;
		let offsetY = shopArea.y + (shopArea.h - totalGridHeight) / 2;

		shopItems.forEach((label, i) => {
			let row = floor(i / cols);
			let col = i % cols;
			let centerX = offsetX + col * cellWidth + cellWidth / 2;
			let centerY = offsetY + row * cellHeight + cellHeight / 2;

			label.x = centerX;
			label.y = centerY;
		});

		console.log('finish listing shop items');
	}

	checkShopItemClick(shopItems, clickedX, clickedY) {
		for (let tool of shopItems) {
			let halfW = tool.w / 2;
			let halfH = tool.h / 2;
			if (
				clickedX > tool.x - halfW &&
				clickedX < tool.x + halfW &&
				clickedY > tool.y - halfH &&
				clickedY < tool.y + halfH
			) {
				console.log(`Tool ${tool.id} clicked!`);
				this.ui.updateLabelColour(tool.id, textAfterClick);
				console.log('textAfterClick :>> ', textAfterClick);
				setTimeout(() => {
					this.ui.updateLabelColour(tool.id, textColour); // return to original colour
				}, 200);
				return tool.id;
			}
		}
		return null;
	}

	handleToolClick(type) {
		this.ui.updateLabelBgColour(type, colourAfterClick);
		setTimeout(() => {
			this.ui.updateLabelBgColour(type, bgColour); // return to orginal colour
		}, 200);
		switch (type) {
			case 'shake':
				this.toolManager.activateTool('shuffle');
				break;
			case 'divine':
				this.toolManager.activateTool('divineSheild');
				break;
			case 'double':
				this.toolManager.activateTool('doubleScore');
				break;
			case 'random':
				this.toolManager.randomTool();
				break;
			case 'rainbow':
				this.toolManager.activateSpecialFruit('rainbowFruit');
				break;
			case 'bomb':
				this.toolManager.activateSpecialFruit('bombFruit');
				break;
			case 'wind':
				this.incidentManager.activateIncident('wind');
				break;
			default:
				console.log(`Unknow type: ${type}`);
		}
	}
}
