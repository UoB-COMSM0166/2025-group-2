export class Timer {
	constructor(duration) {
		this.duration = duration;
		this.startTime = null;
		this.running = false;
	}

	start() {
		this.startTime = millis();
		this.running = true;
	}

	getTimeLeft() {
		if (!this.running) return this.duration;
		const elapsed = (millis() - this.startTime) / 1000;
		return Math.max(0, (this.duration - elapsed).toFixed(0));
		//return Math.max(0, Math.ceil(this.duration - elapsed));
	}

	addTime(seconds) {
		this.startTime -= seconds * 1000;
	}

	reset() {
		this.startTime = millis();
		this.running = true;
	}

	stop() {
		this.running = false;
		//this.startTime = millis() - this.duration * 1000; // asegura que getTimeLeft() dé 0
	}
}
