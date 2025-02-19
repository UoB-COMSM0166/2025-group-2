export class ShuffleTool {
	constructor(game) {
		this.game = game;
		this.isShaking = false;
		this.shakeDuration = 60;
		this.shakeTimer = 0;
		this.shakeIntensity = 10;
	}

	activate() {
		if (this.isShaking) return;

		this.isShaking = true;
		this.shakeTimer = this.shakeDuration;

		for (let fruit of this.game.fruits) {
			let forceX = random(-this.shakeIntensity * 3, this.shakeIntensity * 3);
			let forceY = random(-this.shakeIntensity, this.shakeIntensity);
			fruit.sprite.vel.x += forceX;
			fruit.sprite.vel.y += forceY;
		}
	}

	update() {
		if (this.isShaking) {
			this.shakeTimer--;
			if (this.shakeTimer <= 0) {
				this.isShaking = false;

				for (let fruit of this.game.fruits) {
					fruit.sprite.vel.x *= 0.9;
					fruit.sprite.vel.y *= 0.9;
				}
			}
		}
	}
}
