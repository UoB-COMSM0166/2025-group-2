import { Fruit } from './Fruit.js';

export class FruitDisplay {
	constructor(scaleVal) {
		this.fruits = [];
		this.scaleVal = scaleVal;
	}

	setupFruitDisplay(area) {
		const fruitsLevel = [];
		let prevY = null;
		let prevSize = null;
		const totalFruits = 10;
		const gap = 18;

		for (let i = 0; i < totalFruits; i++) {
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
	}

	draw() {
		this.fruits.forEach(fruit => fruit.draw());
	}
}
