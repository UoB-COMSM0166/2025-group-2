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

		this.fruits = [];
		this.timer = 0;
		this.counter = new Timer(120);
		this.currentFruit = null;
		this.gravity = 15;
		this.walls = [];
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
			50
		);

		// Intialise control board.
		this.board = new Board(this.AREAS.game, this.AREAS.shop, thickness, this.scaleVal);
		this.board.setup();
		// Create the fruits to show in the level
		this.board.createFruitsLevel(this.AREAS.display);

		// Create tool buttons
		let shuffleButton = createButton('Shake Tool');
		shuffleButton.mousePressed(() => this.toolManager.activateTool('shuffle'));

		let divineButton = createButton('Divine Shield');
		divineButton.mousePressed(() => this.toolManager.activateTool('divineShield'));

		let randomToolButton = createButton('Random Tool');
		randomToolButton.mousePressed(() => this.toolManager.randomTool());

		let doubleScoreToolButton = createButton('double Score');
		doubleScoreToolButton.mousePressed(() => this.toolManager.activateTool('doubleScore'));

		let windButton = createButton('Wind Incident');
		windButton.mousePressed(() => this.incidentManager.activateIncident('wind'));

		let fogButton = createButton('Fog Incident');
		fogButton.mousePressed(() => this.incidentManager.activateIncident('fog'));

		let freezeButton = createButton('Freeze Incident');
		freezeButton.mousePressed(() => this.incidentManager.activateIncident('freeze'));

		let rainbowButton = createButton('rainbow');
		rainbowButton.mousePressed(() => this.toolManager.activateSpecialFruit('rainbowFruit'));

		let bombButton = createButton('bomb');
		bombButton.mousePressed(() => this.toolManager.activateSpecialFruit('bombFruit'));

		let fireButton = createButton('Fire Incident');
		fireButton.mousePressed(() => this.incidentManager.activateIncident('fire'));
	}

	update() {
		background('#f5ebe0');
		this.handleCurrentFruit();
		this.handleMerging();
		this.fruits = this.fruits.filter(fruit => !fruit.removed);
		if (!this.isGameOver) {
			this.board.update();
			this.checkIsGameOver(this.AREAS.dashLine.y1);
		}

		if (this.isGameOver) {
			this.ui.drawGameOver(this.AREAS.game.x + this.AREAS.game.w / 2, this.AREAS.game.y - 20);
		}

		this.ui.createDashedLine(this.AREAS.dashLine);
		this.ui.drawLabels();

		this.toolManager.update();
		this.incidentManager.update();

		this.displayScore();
		this.displayCounter();

		//check for collisions with bomb fruits
		this.fruits.forEach(fruit => {
			//check if the fruit is in fog
			if (
				this.incidentManager.incidents.fog.active &&
				fruit.sprite.y > 200 &&
				!this.incidentManager.incidents.fog.paused &&
				!this.incidentManager.incidents.fog.disabled
			) {
				fruit.isInFog = true;
				fruit.setColor(66, 84, 84);
			} else {
				// Si quieres restaurar el color original de la fruta cuando no está bajo la niebla
				fruit.isInFog = false; // Marcar como dentro de la niebla
			}
			if (fruit instanceof BombFruit) {
				fruit.checkCollision(this);
			}
		});

		// If counter is 0, end game
		if (this.counter.getTimeLeft() <= 0) {
			console.log('End of game because counter');
			noLoop();
		}
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		this.board.updateScale(newScale);
	}

	checkIsGameOver() {
		if (this.isGameOver) return;

		if (mouseIsPressed && this.currentFruit && !this.isClickingUI(mouseX, mouseY)) {
			this.fruits.push(this.currentFruit);
			this.currentFruit = null;
		}
	}

	handleMerging() {
		for (let i = 0; i < this.fruits.length; i++) {
			for (let j = i + 1; j < this.fruits.length; j++) {
				const a = this.fruits[i];
				const b = this.fruits[j];
				if (a instanceof BombFruit || b instanceof BombFruit) {
					if (checkCollision(a.sprite, b.sprite)) {
						const mergedFruit = BombFruit.merge(a, b);
					}
				}
				if (a.isFrozen || b.isFrozen) {
					continue; //skip merging if fruit is frozen
				}
				if (
					(a.i === -1 || b.i === -1) &&
					checkCollision(a.sprite, b.sprite) &&
					!a.removed &&
					!b.removed
				) {
					let mergedFruit = RainbowFruit.universalMerge(a, b);
					if (mergedFruit) {
						this.fruits.push(mergedFruit);

						if (this.toolManager.tools.doubleScore.doubleScoreActive && a.fireAffected === false && b.fireAffected === false) {
							this.score.addScore(mergedFruit.i * 2);
						}
						else if(a.fireAffected || b.fireAffected){
							this.score.minusScore(mergedFruit.i);
						}
						else {
							this.score.addScore(mergedFruit.i);
						}
					}
				}
				if (a.i === b.i && checkCollision(a.sprite, b.sprite) && !a.removed && !b.removed) {
					const mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) {
						this.fruits.push(mergedFruit);

						if (this.toolManager.tools.doubleScore.isDoubleScoreActive && a.fireAffected === false && b.fireAffected === false) {
							console.log(
								'this.toolManager.tools.doubleScore.isActive() :>> ',
								this.toolManager.tools.doubleScore.isDoubleScoreActive
							);
							this.score.addScore(mergedFruit.i * 2);
						}
						else if(a.fireAffected || b.fireAffected){
							this.score.minusScore(mergedFruit.i);
						}
						else {
							this.score.addScore(mergedFruit.i);
						}
					}
				}
			}
		if (this.board.checkFruitOverLine(this.AREAS.dashLine.y1)) {
			this.isGameOver = true;
			console.log('draw game over');
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
}
