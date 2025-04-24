import { Incident } from './Incident.js';

export class WindIncident extends Incident {
	constructor(game) {
		super(game,"",10);
		this.windSpeed = 0;
		this.noisePos = 0;
		this.windInc = 0.01;
		this.randomwindtimer = null;
		this.paused = false;
	}

	enable() {
		super.enable();
	}

	disable() {
		super.disable();
		this.applyWindToFruits(true);
	}

	pause() {
		if (!this.active || this.paused) return;
		super.pause();
		this.paused = true;
		this.applyWindToFruits(true);
	}

	resume() {
		if (!this.active || this.timeLeft <= 0) return;
		super.resume();
		this.paused = false;
		this.applyWindToFruits();
	}

	update() {
		super.update();

		if (!this.active || this.paused) return;
		if (this.game.currentFruit) {
			this.windSpeed = (noise(this.noisePos) - 0.5) * 60;
			this.noisePos += this.windInc;
			this.applyWindToFruits();
		}
	}

	applyWindToFruits(clearWind = false) {
		const windEffect = clearWind ? 0 : this.windSpeed;

		if (this.game.currentFruit) {
			this.game.currentFruit.applyWind(windEffect);
			if (clearWind && this.game.currentFruit.sprite.velocity) {
				this.game.currentFruit.sprite.velocity.x = 0;
			}
		}
	}
}

