import { Incident } from './Incident.js';
import { Fruit } from '../models/Fruit.js';

export class FireIncident extends Incident {
	constructor(game) {
		super(game,"",30); // the duration(seconds) for this incedent left
		this.chance = 0.5;
	}

	enable() {
		super.enable();
		this.affectFruits();
	}

	affectFruits(){
		this.game.fruits.forEach(fruit =>{
			if(Math.random() < this.chance){
				fruit.fireAffected = true;
				fruit.sprite.draw = () => {
					push();
					fill(Fruit.fruitColors[fruit.i % Fruit.fruitColors.length]);
					stroke(10);
					ellipse(0, 0, fruit.sprite.d, fruit.sprite.d);
					fruit.drawFace();

					fill(255, 165, 0, 150);
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
		this.game.fruits.forEach(fruit =>{
			if (!fruit || !fruit.sprite) return;
			fruit.fireAffected = false;
			fruit.sprite.draw = () => {
				push();
				fill(Fruit.fruitColors[fruit.i % Fruit.fruitColors.length]);
				stroke(10);
				ellipse(0, 0, fruit.sprite.d, fruit.sprite.d);
				fruit.drawFace();
				pop();
		  };
		});
	}

	pause() {
		if (!this.active || this.paused) return;
		super.pause();
		this.paused = true;
		this.game.fruits.forEach(fruit => {
			if (fruit.fireAffected) {
					fruit.fireAffected = false;
			}
	});
	}

	resume() {
		if (!this.active || this.timeLeft <= 0) return;
		super.resume();
		this.paused = false;
		this.game.fruits.forEach(fruit => {
			if (fruit.firePaused) {
					fruit.fireAffected = true;
			}
	});
	}

	update() {
		if (this.active) {
			fill(0);
			textSize(20);
			text('Fire effect Time Left: ' + this.timeLeft, 10, 50);
		}
		super.update();
		if (!this.active || this.paused) return;
	}
}
