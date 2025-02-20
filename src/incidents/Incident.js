export class Incident {
	constructor(game, duration = 10) {
		this.game = game;
		this.active = false;
		this.duration = duration;
		this.timeLeft = duration;
		this.timer = null;
	}

	enable() {
		if (this.active) return;
		this.active = true;
		this.timeLeft = this.duration;

		this.timer = setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
			} else {
				this.disable();
			}
		}, 1000);
	}

	disable() {
		if (!this.active) return;
		this.active = false;
		clearInterval(this.timer);
	}

	pause() {
		if (!this.active) return;
		clearInterval(this.timer);
	}

	resume() {
		if (!this.active || this.timeLeft <= 0) return;

		this.timer = setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
			} else {
				this.disable();
			}
		}, 1000);
	}

	update() {}
}
