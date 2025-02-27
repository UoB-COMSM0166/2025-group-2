import { IncidentManager } from '../core/IncidentManager.js';
import { ToolManager } from '../core/ToolManager.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Fruit, Wall } from './index.js';

export class Board {
	constructor(player, id, mode) {
		this.player = player;
		this.id = id;
		this.mode = mode;
		this.walls = Wall.createDefaultWalls(mode);
		this.timer = 0;
		this.gravity = 15;
		this.fruits = [];
		this.currentFruit = null;

		this.incidentManager = new IncidentManager();
		this.toolManager = new ToolManager();

		world.gravity.y = this.gravity;
		this.currentFruit = new Fruit(0, 300, 25, 30);
	}

	update() {
		this.handleCurrentFruit();
		this.handleMerging();
		this.fruits = this.fruits.filter(fruit => !fruit.removed);

		this.toolManager.update();
		this.incidentManager.update();
	}

	setCurrentFruit(fruit) {
		if (this.currentFruit) {
			this.currentFruit.remove();
		}
		this.currentFruit = fruit;
	}

	handleCurrentFruit() {
		if (this.currentFruit) {
			this.currentFruit.moveWithMouse();
		} else {
			this.timer++;
			if (this.timer > 50) {
				const newType = int(random(4));
				this.currentFruit = new Fruit(newType, mouseX, 25, 30 + 20 * newType);
				this.timer = 0;
			}
		}

		if (mouseIsPressed && this.currentFruit && !this.isClickingUI(mouseX, mouseY)) {
			this.fruits.push(this.currentFruit);
			this.currentFruit = null;
		}
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
}
