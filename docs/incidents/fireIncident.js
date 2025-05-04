import { Fruit } from '../models/Fruit.js';
import { Incident } from './Incident.js';

export class FireIncident extends Incident {
	constructor(game) {
		super(game, '', 10); // the duration(seconds) for this incident left
		this.chance = 0.35; //chance of the fruit on fire
		this.paused = false;
	}

	enable() {
		super.enable();
		this.paused = false;
		this.affectFruits();
	}
	// Check if the fruit is of a special type (independent of direct reference)
	isSpecialFruit(fruit) {
		if (fruit.level < 0 || fruit.level >= Fruit.fruitColors.length) return true;

		return false;
	}

	affectFruits() {
		//determine if the fruit is on fire
		this.game.fruits.forEach(fruit => {
			// Skip special fruit types（Rainbow或Bomb)
			if (this.isSpecialFruit(fruit)) {
				return;
			}

			// Skip fruits with invalid level values
			if (fruit.level < 0 || fruit.level >= Fruit.fruitColors.length) {
				return;
			}

			if (Math.random() < this.chance) {
				fruit.fireAffected = true;
				fruit.sprite.draw = () => {
					//redraw the fruit
					push();
					fill(Fruit.fruitColors[fruit.level % Fruit.fruitColors.length]);
					stroke(10);
					ellipse(0, 0, fruit.sprite.d, fruit.sprite.d);
					fruit.drawFace();

					//draw the flame
					fill(255, 165, 0, 180);
					noStroke();
					for (let i = 0; i < 5; i++) {
						let flameX = random(-fruit.sprite.d / 3, fruit.sprite.d / 3);
						let flameY = random(-fruit.sprite.d / 2, -fruit.sprite.d / 4);
						ellipse(flameX, flameY, random(10, 20), random(15, 25));
					}

					pop();
				};
			}
		});
	}

	disable() {
		super.disable();
		this.game.fruits.forEach(fruit => {
			if (!fruit || !fruit.sprite) return;

			// Only process regular fruits affected by fire
			if (!this.isSpecialFruit(fruit)) {
				fruit.fireAffected = false;
				fruit.firePaused = false;
				fruit.resetDraw();
			}
		});
	}

	pause() {
		if (!this.active || this.paused) return;
		this.paused = true;
		this.game.fruits.forEach(fruit => {
			// Skip special fruit types
			if (this.isSpecialFruit(fruit)) {
				return;
			}

			if (fruit.fireAffected) {
				fruit.firePaused = true;
				fruit.fireAffected = false;
				fruit.sprite.draw = () => {
					//redraw the fruit when the fire is pause
					push();
					fill(Fruit.fruitColors[fruit.level % Fruit.fruitColors.length]);
					stroke(10);
					ellipse(0, 0, fruit.sprite.d, fruit.sprite.d);
					fruit.drawFace();
					pop();
				};
			}
		});
	}

	resume() {
		if (!this.active || this.timeLeft <= 0) return;
		this.paused = false;
		this.game.fruits.forEach(fruit => {
			// Skip special fruit types
			if (this.isSpecialFruit(fruit)) {
				return;
			}
			if (fruit.firePaused) {
				fruit.firePaused = false;
				fruit.sprite.draw = () => {
					//redraw the fruit
					push();
					fill(Fruit.fruitColors[fruit.level % Fruit.fruitColors.length]);
					stroke(10);
					ellipse(0, 0, fruit.sprite.d, fruit.sprite.d);
					fruit.drawFace();

					//redraw the flame
					fill(255, 165, 0, 180);
					noStroke();
					for (let i = 0; i < 5; i++) {
						let flameX = random(-fruit.sprite.d / 3, fruit.sprite.d / 3);
						let flameY = random(-fruit.sprite.d / 2, -fruit.sprite.d / 4);
						ellipse(flameX, flameY, random(10, 20), random(15, 25));
					}

					pop();
				};
			}
		});
	}

	update() {
		super.update();
		if (!this.active || this.paused) return;
	}
}
