import { checkCollision } from '../utils/CheckCollision.js';
import { Fruit } from './Fruit.js';

const DISTFROMGAME = 40;
const DISTFROMSHOP = 150;

export class Board {
	constructor(gameArea, shopArea, wallWidth, scaleVal) {
		this.gameArea = gameArea; // { x, y, w, h }
		this.shopArea = shopArea; // { x, y, w, h }
		this.wallWidth = wallWidth;
		this.gravity = 15;
		this.fruits = [];
		this.currentFruit = null;
		this.nextFruit = null;
		this.timer = 0;
		this.scaleVal = scaleVal;
	}

	setup() {
		world.gravity.y = this.gravity;

		// Create the first fruit, and put it in the top center of the game area.
		this.currentFruit = new Fruit(
			0,
			this.gameArea.x + this.gameArea.w / 2,
			this.gameArea.y - DISTFROMGAME,
			30,
			this.scaleVal
		);
		let newType = int(random(4));
		this.nextFruit = new Fruit(
			newType,
			this.shopArea.x + this.shopArea.w / 2,
			this.shopArea.y - DISTFROMSHOP,
			30 + 20 * newType,
			this.scaleVal
		);
		this.nextFruit.doNotFall();
	}

	update() {
		// Update current fruit and handle falls
		this.handleCurrentFruit();
		// Detect collisions and mergers between fruits
		this.handleMerging();
		// Filter out fruits that have been marked removed
		this.fruits = this.fruits.filter(fruit => !fruit.removed);
		for (let fruit of this.fruits) {
			fruit.updateState();
		}
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		if (this.currentFruit) {
			this.currentFruit.updateScale(newScale);
		}
		if (this.nextFruit) {
			this.nextFruit.updateScale(newScale);
		}
		for (let fruit of this.fruits) {
			fruit.updateScale(newScale);
		}
	}

	draw() {
		// Draw placed fruit
		for (let fruit of this.fruits) {
			fruit.draw();
		}
	}

	getCurrentFruits() {
		return this.fruits;
	}

	checkFruitOverLine(y) {
		for (const fruit of this.fruits) {
			if (fruit.getState() !== Fruit.STATE.FALLING || fruit.getSafePeriod() > 0) continue;

			const fruitTop = fruit.sprite.y - fruit.sprite.d / 2;
			if (fruitTop <= y) {
				console.log('the fruit is over the dash line');
				return true;
			}
		}
		return false;
	}

	createFruitsLevel(area) {
		let fruitType = 7;
		let fruitsLevel = [];
		let gap = 18;
		let prevY = null;
		let prevSize = null;

		for (let i = 0; i < fruitType; i++) {
			let size = 20 + 10 * i;
			let x = area.x + area.w / 2;
			let y;

			if (i === 0) {
				// the y position of first fruit: from the top add a gap and the radius
				y = area.y + gap + size / 2;
			} else {
				// the y position of the next fruit = the prevY + prevSize / 2 + currentSize / 2 + gap
				y = prevY + prevSize / 2 + size / 2 + gap;
			}
			let fruit = new Fruit(i, x, y, size, this.scaleVal);
			fruit.doNotFall();
			fruitsLevel.push(fruit);
			prevY = y;
			prevSize = size;
		}
		return fruitsLevel;
	}

	handleCurrentFruit() {
		if (this.currentFruit) {
			// allow current fruit move with mouse
			let leftBound = this.gameArea.x + this.wallWidth;
			let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
			this.currentFruit.moveWithMouse(leftBound, rightBound, this.gameArea.y - DISTFROMGAME);
		} else {
			// Timer increments when there is no current fruit
			this.timer++;
			if (this.timer > 10) {
				// Change the next fruit to the current fruit
				this.nextFruit.letFall();
				this.currentFruit = this.nextFruit;
				// Generate new fruit at the top of the game area
				let newType = int(random(4));
				this.nextFruit = new Fruit(
					newType,
					this.shopArea.x + this.shopArea.w / 2,
					this.shopArea.y - DISTFROMSHOP,
					30 + 20 * newType,
					this.scaleVal
				);
				this.nextFruit.doNotFall();
				this.timer = 0;
			}
		}

		// When the mouse is pressed, put the current fruit into the fruits array and clear currentFruit
		if (mouseIsPressed && this.currentFruit) {
			this.currentFruit.sprite.vel.y = this.gravity;
			this.currentFruit.startFalling();
			this.fruits.push(this.currentFruit);
			this.currentFruit = null;
		}
	}

	handleMerging() {
		// Two-level loop traverses all fruits, detects two fruits that meet the merge condition
		for (let i = 0; i < this.fruits.length; i++) {
			for (let j = i + 1; j < this.fruits.length; j++) {
				const a = this.fruits[i];
				const b = this.fruits[j];
				// Suppose a.level denotes the type/grade of fruit
				if (a.level === b.level && checkCollision(a.sprite, b.sprite) && !a.removed && !b.removed) {
					const mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) {
						mergedFruit.updateScale(this.scaleVal);
						this.fruits.push(mergedFruit);
					}
				}
			}
		}
	}
}
