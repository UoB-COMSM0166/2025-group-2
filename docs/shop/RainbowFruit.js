import { Fruit } from '../models/Fruit.js';

export class RainbowFruit extends Fruit {
	constructor(x, y, scaleVal) {
		const fixedSize = 40;
		super(-1, x, y, fixedSize, scaleVal); // set up -1 as special fruit type
		this.isRainbow = true; // extra mark RainbowFruit

		// Customize the drawing method to create a rainbow gradient effect.
		this.sprite.draw = () => {
			push();
			const rainbowColors = [
				'#FF0000',
				'#FF7F00',
				'#FFFF00',
				'#00FF00',
				'#0000FF',
				'#4B0082',
				'#9400D3',
			];
			let layerStep = this.sprite.d / rainbowColors.length;
			for (let i = 0; i < rainbowColors.length; i++) {
				fill(rainbowColors[i]);
				noStroke();
				ellipse(0, 0, this.sprite.d - i * layerStep, this.sprite.d - i * layerStep);
			}
			this.drawFaceRainbow();
			pop();
		};
	}

	drawFaceRainbow() {
		push();
		fill(0);
		noStroke();
		ellipse(-this.sprite.d * 0.15, -this.sprite.d * 0.1, this.sprite.d * 0.1, this.sprite.d * 0.1);
		ellipse(this.sprite.d * 0.15, -this.sprite.d * 0.1, this.sprite.d * 0.1, this.sprite.d * 0.1);
		noFill();
		stroke(0);
		strokeWeight(2);
		arc(0, this.sprite.d * 0.05, this.sprite.d * 0.5, this.sprite.d * 0.4, 0, PI);
		pop();
	}

	/**
	 ** * Custom merge method **
	 * - Copied the merge method in Fruit.js and modified the logic
	 * - RainbowFruit does not require the same grade to merge
	 */
	static universalMerge(a, b) {
		if (a.isRainbow || b.isRainbow) {
			let rainbowFruit = a.isRainbow ? a : b;
			let normalFruit = a.isRainbow ? b : a; // Find non-rainbowfruit

			const minDistance = rainbowFruit.sprite.d / 2 + normalFruit.sprite.d / 2;

			const actualDistance = dist(
				rainbowFruit.sprite.x,
				rainbowFruit.sprite.y,
				normalFruit.sprite.x,
				normalFruit.sprite.y
			);

			if (actualDistance < minDistance) {
				let newType = normalFruit.level + 1;
				if (normalFruit.level >= 9) {
					newType = 9;
				}
				let newX = (a.sprite.x + b.sprite.x) / 2;
				let newY = (a.sprite.y + b.sprite.y) / 2;
				let newSize = 30 + 20 * newType;

				a.remove();
				b.remove();
				return new Fruit(newType, newX, newY, newSize);
			}
		}
		return null;
	}
}
