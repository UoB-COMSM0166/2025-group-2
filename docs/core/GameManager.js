import { Fruit } from '../models/Fruit.js';
import { Score } from '../models/Score.js';
import { Timer } from '../models/Timer.js';
import { Wall } from '../models/Wall.js';
import { BombFruit, RainbowFruit } from '../shop/index.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { IncidentManager } from './IncidentManager.js';
import { ToolManager } from './ToolManager.js';
import { Board } from '../models/FruitBoard.js';
import { UIControllor } from './UIControllor.js';

export class Game {
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

		this.incidentManager = new IncidentManager(this);
		this.toolManager = new ToolManager(this, this.incidentManager);
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
		this.ui.createLabel(
			'timer',
			this.AREAS.game.x + this.AREAS.game.w / 2,
			this.AREAS.game.y - 150,
			'Time: 2:00',
			'#000000',
			50,
			undefined,
			'timer'
		);

		// Create score label
		this.ui.createLabel(
			'score',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 60,
			`Score: ${this.score.getScore()}`,
			'#000000',
			20,
			undefined,
			'coin'
		);

		// Create coin label
		this.ui.createLabel(
			'coin',
			this.AREAS.shop.x + this.AREAS.shop.w / 2,
			this.AREAS.shop.y - 30,
			'Coin: 0',
			'#000000',
			20,
			undefined,
			'coin'
		);

		const shopTextSize = 25;

		// Intialise fruit play board.
		this.board = new Board(this.AREAS.game, this.AREAS.shop, thickness, this.scaleVal);
		this.board.setup();
		// Create the fruits to show in the level
		this.board.createFruitsLevel(this.AREAS.display);

		// Create tool buttons
		this.ui.createLabel('shake', 0, 0, '🫨Shake Tool', undefined, shopTextSize, '#ccc', 'shopItem');
		//shuffleButton.mousePressed(() => this.toolManager.activateTool('shuffle'));

		this.ui.createLabel(
			'divine',
			0,
			0,
			'🛡️Divine Shield',
			undefined,
			shopTextSize,
			'#ccc',
			'shopItem'
		);
		//divineButton.mousePressed(() => this.toolManager.activateTool('divineShield'));

		this.ui.createLabel(
			'random',
			0,
			0,
			'🗃️Random Tool',
			undefined,
			shopTextSize,
			'#ccc',
			'shopItem'
		);
		//randomToolButton.mousePressed(() => this.toolManager.randomTool());

		this.ui.createLabel(
			'double',
			0,
			0,
			'💰Double Score',
			undefined,
			shopTextSize,
			'#ccc',
			'shopItem'
		);
		//doubleScoreToolButton.mousePressed(() => this.toolManager.activateTool('doubleScore'));

		this.ui.createLabel(
			'wind',
			0,
			0,
			'🌪️Wind Incident',
			undefined,
			shopTextSize,
			'#ccc',
			'shopItem'
		);
		//windButton.mousePressed(() => this.incidentManager.activateIncident('wind'));

		this.ui.createLabel('rainbow', 0, 0, '🌈Rainbow', undefined, shopTextSize, '#ccc', 'shopItem');
		//rainbowButton.mousePressed(() => this.toolManager.activateSpecialFruit('rainbowFruit'));

		this.ui.createLabel('bomb', 0, 0, '💣Bomb', undefined, shopTextSize, '#ccc', 'shopItem');
		//bombButton.mousePressed(() => this.toolManager.activateSpecialFruit('bombFruit'));

		// List all the shopButtons in shop area.
		this.listShopItems(this.ui.getLabels(), 'shopItem', this.AREAS.shop);
	}

	update() {
		if (!this.isGameOver) {
			this.board.update();
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
		
		// If counter is 0, end game
		if (this.counter.getTimeLeft() <= 0) {
			console.log('End of game because counter');
			noLoop();
        }
	}


		this.ui.updateLabelText('score', `Score: ${this.score.getScore()}`);
		/*
		if (mouseIsPressed) {
			let logicX = mouseX / this.scaleVal;
			let logicY = mouseY / this.scaleVal;
			console.log('mouse clicked and check if it clicks shopitem');
			let clickedTool = this.checkShopItemClick(this.ui.getLabels(), logicX, logicY);
			if (clickedTool) {
				console.log(`tool clicked: ${clickedTool}`);
				this.handleToolClick(clickedTool);
			}
		}
			*/
	}

	mousePressed() {
		let logicX = mouseX / this.scaleVal;
		let logicY = mouseY / this.scaleVal;
		console.log('mouse clicked and check if it clicks shopitem');
		let clickedTool = this.checkShopItemClick(this.ui.getLabels(), logicX, logicY);
		if (clickedTool) {
			console.log(`tool clicked: ${clickedTool}`);
			this.handleToolClick(clickedTool);
		}
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		this.board.updateScale(newScale);
	}

	checkIsGameOver() {
		if (this.isGameOver) return;

		if (this.board.checkFruitOverLine(this.AREAS.dashLine.y1)) {
			this.isGameOver = true;
		}
	}

	displayCounter() {
		fill(0);
		textSize(16);
		text(`Timer: ${this.counter.getTimeLeft()}s`, 300, 60);
	}

	displayScore() {
		fill(0);
		textSize(16);
		text(`Score: ${this.score.getScore()}`, 10, 30);
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

	listShopItems(labelList, type, shopArea) {
		console.log('starting to list shop items');
		let shopItemList = Object.values(labelList).filter(label => label.type === type);
		if (shopItemList.length === 0) return;
		let maxWidth = Math.max(...shopItemList.map(label => label.w));
		let maxHeight = Math.max(...shopItemList.map(label => label.h));

		let gap = 10;
		let cellWidth = maxWidth + gap;
		let cellHeight = maxHeight + gap;

		// Calculate the max column numbers
		let cols = floor(shopArea.w / cellWidth);
		if (cols < 1) cols = 1;
		let rows = ceil(shopItemList.length / cols);

		// Calculate margin center the shopItems
		let totalGridWidth = cols * cellWidth;
		let totalGridHeight = rows * cellHeight;
		let offsetX = shopArea.x + (shopArea.w - totalGridWidth) / 2;
		let offsetY = shopArea.y + (shopArea.h - totalGridHeight) / 2;

		shopItemList.forEach((label, i) => {
			let row = floor(i / cols);
			let col = i % cols;
			let centerX = offsetX + col * cellWidth + cellWidth / 2;
			let centerY = offsetY + row * cellHeight + cellHeight / 2;

			label.x = centerX;
			label.y = centerY;
		});

		console.log('finish listing shop items');
	}

	checkShopItemClick(labelList, clickedX, clickedY) {
		let shopItemList = Object.values(labelList).filter(label => label.type === 'shopItem');
		for (let tool of shopItemList) {
			let halfW = tool.w / 2;
			let halfH = tool.h / 2;
			if (
				clickedX > tool.x - halfW &&
				clickedX < tool.x + halfW &&
				clickedY > tool.y - halfH &&
				clickedY < tool.y + halfH
			) {
				return tool.id;
			}
		}
		return null;
	}

	handleToolClick(type) {
		switch (type) {
			case 'shake':
				console.log('shuffle active');
				this.toolManager.activateTool('shuffle');
				break;
			case 'divine':
				console.log('divine sheild active');
				this.toolManager.activateTool('divineSheild');
				break;
			case 'double':
				console.log('double score active');
				this.toolManager.activateTool('doubleScore');
				break;
			case 'random':
				console.log('random tool active');
				this.toolManager.randomTool();
				break;
			case 'rainbow':
				console.log('rainbow tool active');
				this.toolManager.activateSpecialFruit('rainbowFruit');
				break;
			case 'bomb':
				console.log('bomb tool active');
				this.toolManager.activateSpecialFruit('bombFruit');
				break;
			case 'wind':
				console.log('wind effect active');
				this.incidentManager.activateIncident('wind');
				break;
			default:
				console.log(`Unknow type: ${type}`);
		}
	}
}
