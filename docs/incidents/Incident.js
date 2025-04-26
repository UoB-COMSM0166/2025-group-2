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
		const nextFruitArea = this.game.nextFruitArea;
		const labelX = nextFruitArea.x + nextFruitArea.w * 2 + 50;
		const labelY = nextFruitArea.y + 40;
		const gameArea = this.game.gameArea;


		if (this.active) {
			fill('#6B4F3F');
			textSize(20);
			if (!isDoubleMode) {
				text(
					`${this.name} Effect Time Left: ${this.timeLeft}`,
					gameArea.x + gameArea.w / 2,
					gameArea.y - 30
				);
			} else {
				text(`${this.name} Effect Time Left: ${this.timeLeft}`, labelX , labelY);
			}
		}
	}
}
