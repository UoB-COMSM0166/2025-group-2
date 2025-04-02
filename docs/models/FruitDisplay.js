import { Fruit } from './Fruit.js';

export class FruitDisplay {
	constructor(scaleVal) {
		this.fruits = [];
		this.scaleVal = scaleVal;
	}

	setupFruitDisplay(area, isDoubleMode) {
		const fruitsLevel = [];
		const totalFruits = 10;
		const gap = 18;
		let prevX = null;
		let prevY = null;
		let prevSize = null;

		for (let i = 0; i < totalFruits; i++) {
			let size = isDoubleMode ? 20 + 8 * i : 20 + 10 * i;

			let x, y;

			if (isDoubleMode) {
				y = area.y + area.h / 2;

				if (i === 0) {
					x = area.x + gap + size / 2;
				} else {
					x = prevX + prevSize / 2 + size / 2 + gap;
				}
			} else {
				x = area.x + area.w / 2;

				if (i === 0) {
					y = area.y + gap + size / 2;
				} else {
					y = prevY + prevSize / 2 + size / 2 + gap;
				}
			}

			let fruit = new Fruit(i, x, y, size, this.scaleVal);
			fruit.doNotFall();
			fruitsLevel.push(fruit);

			if (isDoubleMode) {
				prevX = x;
				prevSize = size;
			} else {
				prevY = y;
				prevSize = size;
			}
		}
	}

	draw() {
		this.fruits.forEach(fruit => fruit.draw());
	}
}
