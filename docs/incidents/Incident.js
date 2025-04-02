export class Incident {
	constructor(game, name, duration = 10) {
		this.game = game;
		this.name = name;
		this.active = false;
		this.duration = duration;
		this.timeLeft = duration;
		this.timer = null;
		this.manager = null;
	}

	enable() {
		if (this.active) return;
		this.active = true;
		this.timer = setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
			} else {
				this.manager.deactivateIncident(this.name);
			}
		}, 1000);
	}

	disable() {
		if (!this.active) return;
		this.active = false;
		clearInterval(this.timer);
		this.timeLeft = this.duration;
	}

	pause() {
		if (!this.active) return;
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

	update() {
		const isDoubleMode = this.game.mode === 'double';
		const gameId = this.game.id;
		const gameArea = this.game.nextFruitArea;
		const labelX = gameArea.x + gameArea.w * 2;
		const labelY = gameArea.y + 20;
		if (this.active) {
			if (!isDoubleMode) {
				fill('#6B4F3F');
				textSize(20);
				textAlign(RIGHT, TOP);
				text(`${this.name} Effect Time Left: ${this.timeLeft}`, 240, 90);
			} else {
				fill('#6B4F3F');
				textSize(20);
				text(`${this.name} Effect Time Left: ${this.timeLeft}`, labelX, labelY);
			}
		}
	}
}
