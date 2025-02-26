import { Fruit } from '../models/Fruit.js';
import { Wall } from '../models/Wall.js';
import { Score } from '../models/Score.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { ToolManager } from './ToolManager.js';
import { IncidentManager } from './IncidentManager.js';

export class Game {
	constructor() {
		this.fruits = [];
		this.timer = 0;
		this.currentFruit = null;
		this.gravity = 15;
		this.walls = [];
		this.score = new Score();

		this.incidentManager = new IncidentManager(this);
		this.toolManager = new ToolManager(this, this.incidentManager);
	}

	setup() {
		new Canvas(500, 600);
		background('#f5ebe0');
		world.gravity.y = this.gravity;

		this.walls = Wall.createDefaultWalls();

		this.currentFruit = new Fruit(0, 300, 25, 30);
		let shuffleButton = createButton('Shake Tool');
		shuffleButton.mousePressed(() => this.toolManager.activateTool('shuffle'));

		let divineButton = createButton('Divine Shield');
		divineButton.mousePressed(() =>
			this.toolManager.activateTool('divineShield')
		);

		let randomToolButton = createButton('Random Tool');
		randomToolButton.mousePressed(() => this.toolManager.randomTool());

		let doubleScoreToolButton = createButton('double Score');
		doubleScoreToolButton.mousePressed(() =>
			this.toolManager.activateTool('doubleScore')
		);

		let windButton = createButton('Wind Incident');
		windButton.mousePressed(() =>
			this.incidentManager.activateIncident('wind')
		);

		let rainbowButton = createButton('rainbow');
		rainbowButton.mousePressed(() =>
			this.toolManager.activateSpecialFruit('rainbowFruit')
		);

		let bombButton = createButton('bomb');
		bombButton.mousePressed(() =>
			this.toolManager.activateSpecialFruit('bombFruit')
		);
	}

	update() {
		background('#f5ebe0');
		this.handleCurrentFruit();
		this.handleMerging();
		this.fruits = this.fruits.filter((fruit) => !fruit.removed);

		this.toolManager.update();
		this.incidentManager.update();

		this.displayScore();
	}

	setCurrentFruit(fruit) {
		if (this.currentFruit) {
			this.currentFruit.remove();
		}
		this.currentFruit = fruit;
		console.log(`Current fruit set to ${fruit.constructor.name}`);
	}

	handleCurrentFruit() {
		if (this.currentFruit) {
			this.currentFruit.moveWithMouse();
		} else {
			this.timer++;
			if (this.timer > 50) {
				const newType = int(random(7));
				this.currentFruit = new Fruit(newType, mouseX, 25, 30 + 20 * newType);
				this.timer = 0;
			}
		}

		if (
			mouseIsPressed &&
			this.currentFruit &&
			!this.isClickingUI(mouseX, mouseY)
		) {
			this.fruits.push(this.currentFruit);
			this.currentFruit = null;
		}
	}

	handleMerging() {
		for (let i = 0; i < this.fruits.length; i++) {
			for (let j = i + 1; j < this.fruits.length; j++) {
				const a = this.fruits[i];
				const b = this.fruits[j];

				if (
					a.i === b.i &&
					checkCollision(a.sprite, b.sprite) &&
					!a.removed &&
					!b.removed
				) {
					const mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) {
						this.fruits.push(mergedFruit);

						if (this.toolManager.tools.doubleScore.doubleScoreActive) {
							console.log(
								'this.toolManager.tools.doubleScore.isActive() :>> ',
								this.toolManager.tools.doubleScore.isdoubleScoreActive
							);
							console.log('adding double score fruit : ', mergedFruit.i*2);
							this.score.addScore(mergedFruit.i * 2);
						} else {
							this.score.addScore(mergedFruit.i);
							console.log('adding standard score fruit : ', mergedFruit.i);
						}
					}
				}
			}
		}
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
