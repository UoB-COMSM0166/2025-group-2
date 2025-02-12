import { Fruit } from '../models/Fruit.js';
import { Wall } from '../models/Wall.js';
import { checkCollision } from '../utils/CheckCollision.js';

export class Game {
	constructor() {
		this.fruits = [];
		this.timer = 0;
		this.currentFruit = null;
		this.gravity = 15;
		this.walls = [];
	}

	setup() {
		new Canvas(500, 600);
		background('#f5ebe0');
		world.gravity.y = this.gravity;

		this.walls = Wall.createDefaultWalls();

		this.currentFruit = new Fruit(0, 300, 25, 30);
	}

	update() {
		background('#f5ebe0');
		this.handleCurrentFruit();
		this.handleMerging();
		this.fruits = this.fruits.filter((fruit) => !fruit.removed);
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

		if (mouseIsPressed && this.currentFruit) {
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
					}
				}
			}
		}
	}
}
