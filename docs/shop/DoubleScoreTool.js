export class DoubleScoreTool {
	constructor(game) {
		this.game = game;
		this.duration = 5000;
		this.timer = null;
	}

	activate() {
		this.startTime = millis();
		console.log('Double Score activated!');
	}

	update() {
		if (this.startTime !== null && millis() > this.startTime + this.duration) {
			this.startTime = null;
			console.log('Double Score effect ended.');
		}
	}

	isActive() {
		return this.startTime !== null;
	}
}
