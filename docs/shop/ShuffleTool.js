export class ShuffleTool {
	constructor(board, area) {
		this.board = board;
		this.isShaking = false;
		this.shakeDuration = 60;
		this.shakeTimer = 0;
		this.shakeIntensity = 10;
		this.endLine = area.dashLine.y1 + 10;
	}

	activate() {
		if (this.isShaking) return;

		this.isShaking = true;
		this.shakeTimer = this.shakeDuration;

		for (let fruit of this.board.getCurrentFruits()) {
			let forceX = random(-this.shakeIntensity * 3, this.shakeIntensity * 3);
			let forceY = random(-this.shakeIntensity, this.shakeIntensity);
			fruit.sprite.vel.x += forceX;
			fruit.sprite.vel.y += forceY;
			this.limitFruitPosition(fruit);
		}
	}

	update() {
		if (this.isShaking) {
			this.shakeTimer--;
			if (this.shakeTimer <= 0) {
				this.isShaking = false;

				for (let fruit of this.board.getCurrentFruits()) {
					fruit.sprite.vel.x *= 0.9;
					fruit.sprite.vel.y *= 0.9;
				}
			}
			for (let fruit of this.board.getCurrentFruits()) {
				this.limitFruitPosition(fruit);
			}
		}
	}

	limitFruitPosition(fruit) {
		let posY = fruit.getYPosition();
		let fruitD = fruit.sprite.d;
		let fruitTop = posY - fruitD / 2; // the top of the fruit

		// if the top of the fruit exceed the end line
		if (fruitTop < this.endLine) {
			// calculate the distance beyond endLine
			let overlap = this.endLine - fruitTop;

			fruit.sprite.y += overlap;
			// reverse vertical velocity and apply a rebound force
			fruit.sprite.vel.y = Math.abs(fruit.sprite.vel.y) * 0.8;
			if (Math.abs(fruit.sprite.vel.y) < 0.1) {
				fruit.sprite.vel.y = 0;
			}
		}
	}
}
