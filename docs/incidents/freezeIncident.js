import { Incident } from './Incident.js';

export class FreezeIncident extends Incident {
	constructor(game) {
		super(game, '', 10); // the duration(seconds) for this incident left
		this.game = game;
		this.frozenFruits = [];
		this.paused = false;
	}

	enable() {
		super.enable();
		this.paused = false;
		this.frozenFruits = this.selectRandomFruits(5);
		this.frozenFruits.forEach(fruit => {
			fruit.isFrozen = true;
		});
	}

	disable() {
		super.disable();
		this.frozenFruits.forEach(fruit => {
			fruit.isFrozen = false;
		});
		this.frozenFruits = [];
		this.shieldActive = false;
	}

	pause() {
		if (this.active && !this.paused) {
			this.paused = true;
			//unfreezing fruits when paused
			this.frozenFruits.forEach(fruit => {
				fruit.isFrozen = false;
			});
		}
	}

	resume() {
		if (this.active && this.paused) {
			this.paused = false;
			//refreezing fruits when resumed
			this.frozenFruits.forEach(fruit => {
				fruit.isFroze = true;
			});
		}
	}

	update() {
		super.update();

		//only update if incident is active and not paused
		if (!this.active || this.paused) {
			return;
		}
	}

	selectRandomFruits(count) {
		const availableFruits = this.game.fruits.filter(fruit => !fruit.isFrozen);
		const selectedFruits = [];
		for (let i = 0; i < Math.min(count, availableFruits.length); i++) {
			const randomIndex = Math.floor(Math.random() * availableFruits.length);
			selectedFruits.push(availableFruits[randomIndex]);
			availableFruits.splice(randomIndex, 1); //to avoid selecting same fruit twice
		}
		return selectedFruits;
	}
}
