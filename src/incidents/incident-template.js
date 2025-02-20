import { Incident } from './Incident.js';

export class TestIncident extends Incident {
	constructor(game) {
		super(game, 15); // the duration(seconds) for this incedent left
		this.game = game;
	}

	enable() {
		super.enable();
	}

	disable() {
		super.disable();
	}

	update() {
		if (!this.active) return;
	}
}
