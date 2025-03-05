import { Incident } from './Incident.js';

export class FogIncident extends Incident {
	constructor(game) {
		super(game, 10);
		this.paused = false;
		this.fogLayer = null;
	}

	enable() {
		super.enable();
		// create fog cape
		this.fogLayer = createGraphics(width, height);
		this.fogLayer.fill(0);
		this.fogLayer.noStroke();
	}

	disable() {
		super.disable();
		this.applyFogToBoard(true);
	}

	pause() {
		if (!this.active || this.paused) return;
		super.pause();
		this.paused = true;
		this.applyFogToBoard(true);
	}

	resume() {
		if (!this.active || this.timeLeft <= 0) return;
		super.resume();
		this.paused = false;
		this.applyFogToBoard(true);
	}

	update() {
		super.update();

		if (!this.active || this.paused) return;

		this.applyFogToBoard(true);
	}

	applyFogToBoard(applyFog) {
		if (applyFog) {
			if (this.fogLayer) {
				this.fogLayer.clear();
				this.fogLayer.fill(66, 84, 84);
				this.fogLayer.rect(0, 200, this.fogLayer.width, this.fogLayer.height);
				image(this.fogLayer, 0, 0); //Make sure the fog is over other things
			}
		}
	}
}
