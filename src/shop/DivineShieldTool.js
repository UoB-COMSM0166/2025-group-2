export class DivineShieldTool {
	constructor(game, incidentManager) {
		this.game = game;
		this.incidentManager = incidentManager;
		this.shieldTimeLeft = 30;
		this.shieldTimer = null;
		this.shieldActive = false;
	}

	activate() {
		if (this.shieldActive) return;

		this.shieldActive = true;
		this.incidentManager.pauseActiveIncidents();

		this.shieldTimer = setInterval(() => {
			if (this.shieldTimeLeft > 0) {
				this.shieldTimeLeft--;
			} else {
				this.deactivate();
			}
		}, 1000);
	}

	update() {
		if (this.shieldActive) {
			fill(0);
			textSize(20);
			text('Devine Shield Time Left: ' + this.shieldTimeLeft, 240, 30);
		}
	}

	deactivate() {
		this.shieldActive = false;
		clearInterval(this.shieldTimer);
		this.incidentManager.resumePausedIncidents();
	}
}
