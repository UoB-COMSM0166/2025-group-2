import { Fruit } from '../models/Fruit.js';
import { Wall } from '../models/Wall.js';
import { checkCollision } from '../utils/CheckCollision.js';
import {
	RainbowFruit,
	BombFruit,
	shuffle,
	doubleScore,
	mysteryTool,
	divineShield,
} from '../shop/index.js';

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
		this.init();
	}

	/**
	 * The init function is used to test if these modules are imported correctly.
	 * You can check by clicking F12 and checking the console
	 * When you want to test your own code, remove it from init()
	 * and move them to the proper place.
	 */
	init() {
		shuffle(this);
		doubleScore(this);
		mysteryTool(this);
		divineShield(this);
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
}
