import { Fruit } from '../models/Fruit.js';
import { Wall } from '../models/Wall.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { ToolManager } from './ToolManager.js';
import { IncidentManager } from './IncidentManager.js';
import { RainbowFruit } from '../shop/RainbowFruit.js';

export class Game {
	constructor() {
		this.fruits = [];
		this.timer = 0;
		this.currentFruit = null;
		this.gravity = 15;
		this.walls = [];
		this.nextFruit = null;

		this.incidentManager = new IncidentManager(this);
		this.toolManager = new ToolManager(this, this.incidentManager);
	}

	setup() {
		new Canvas(800, 600);
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
		let newType = int(random(7));
		this.nextFruit = new Fruit(newType, 600, 100, 30 + 20 * newType);
		this.nextFruit.doNotFall();
		//this.init();
	}


	update() {
		background('#f5ebe0');
		this.handleCurrentFruit();
		this.handleMerging();
		this.fruits = this.fruits.filter((fruit) => !fruit.removed);

		this.toolManager.update();
		this.incidentManager.update();
	}

	handleCurrentFruit() {
		if (this.currentFruit) {
			this.currentFruit.moveWithMouse();
		} else {
			this.timer++;
			if (this.timer > 50) {
				
				
				const newType = int(random(7));
				this.currentFruit = this.nextFruit;
				this.currentFruit.letFall();
				this.nextFruit = new Fruit(newType, 600, 100, 30 + 20 * newType);
				this.nextFruit.doNotFall();
					
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

				if ((a.i === -1 || b.i === -1 )&&
					checkCollision(a.sprite, b.sprite) &&
					!a.removed &&
					!b.removed) {
						let mergedFruit = RainbowFruit.universalMerge(a, b);
						if (mergedFruit) {
							this.fruits.push(mergedFruit);
						}
				}
				if (a.i === b.i &&
					checkCollision(a.sprite, b.sprite) &&
					!a.removed &&
					!b.removed
				) {
					const mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) {
						this.fruits.push(mergedFruit);
					}
				}
			}
		}
	}

	keyPressed() {
		if (key === 'r' || key === 'R') {
			
			if (this.nextFruit) {
				this.nextFruit.remove();
				this.nextFruit = null;
			}
			this.nextFruit = RainbowFruit.buyRainbowFruit();
			this.nextFruit.doNotFall();
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
}

