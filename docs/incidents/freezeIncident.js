import { Incident } from './Incident.js';

export class FreezeIncident extends Incident {
	constructor(game) {
		super(game, 10); // the duration(seconds) for this incedent left
		this.game = game;
		this.frozenFruits = [];
	}

	enable() {
		super.enable();
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
	}

	update() {
		if (!this.active) return;
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
