import { Fruit } from './Fruit.js';

export class FruitDisplay {
	constructor(scaleVal) {
		this.fruits = [];
		this.scaleVal = scaleVal;
	}

	setupFruitDisplay(area, isDoubleMode) {
		const fruitsLevel = [];
		let startLevel, endLevel;

		// Determine the fruit level range displayed according to the game mode
		if (isDoubleMode) {
			startLevel = 0;
			endLevel = 8;
		} else {
			startLevel = 2;
			endLevel = 9;
		}

		const totalFruits = endLevel - startLevel + 1;
		const gap = 18;
		let prevX = null;
		let prevY = null;
		let prevSize = null;

		for (let i = 0; i < totalFruits; i++) {
			// Calculate the actual fruit grade
			const actualLevel = startLevel + i;

			// Adjust fruit size according to game mode
			let size = isDoubleMode ? 20 + 8 * actualLevel : 20 + 10 * actualLevel;

			let x, y;

			if (isDoubleMode) {
				// Double mode fruit horizontal arrangement
				y = area.y + area.h / 2;

				if (i === 0) {
					x = area.x + gap + size / 2;
				} else {
					x = prevX + prevSize / 2 + size / 2 + gap;
				}

				prevX = x;
				prevSize = size;
			} else {
				// Single mode fruit vertical arrangement
				x = area.x + area.w / 2;

				if (i === 0) {
					y = area.y + gap + size / 2;
				} else {
					y = prevY + prevSize / 2 + size / 2 + gap;
				}

				prevY = y;
				prevSize = size;
			}

			// Create fruit and set the correct grade
			let fruit = new Fruit(actualLevel, x, y, size, this.scaleVal);
			fruit.doNotFall();
			this.fruits.push(fruit);
		}

		console.log(`Created ${this.fruits.length} display fruits`);
	}

	draw() {
		// Make sure this.fruits exists and is an array
		if (this.fruits && Array.isArray(this.fruits) && this.fruits.length > 0) {
			// Traverse the array and call the draw method for each fruit
			for (let i = 0; i < this.fruits.length; i++) {
				const fruit = this.fruits[i];
				if (fruit && typeof fruit.draw === 'function') {
					fruit.draw();
				} else {
					console.warn(`Fruit at index ${i} does not have a draw method`);
				}
			}
		} else {
			console.warn('No fruits to draw in FruitDisplay');
		}
	}
}
