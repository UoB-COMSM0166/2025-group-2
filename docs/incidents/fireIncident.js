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
		this.affectFruits();
	}

	affectFruits() {
		//determine if the fruit is on fire
		this.game.fruits.forEach(fruit => {
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
			fruit.fireAffected = false;
			fruit.sprite.draw = () => {
				//redraw the fruit when the fire is off
				push();
				fill(Fruit.fruitColors[fruit.level % Fruit.fruitColors.length]);
				stroke(10);
				ellipse(0, 0, fruit.sprite.d, fruit.sprite.d);
				fruit.drawFace();
				pop();
			};
		});
	}

	pause() {
		if (!this.active || this.paused) return;
		this.paused = true;
		this.game.fruits.forEach(fruit => {
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
