export class DivineShieldTool {
	constructor(incidentManager) {
		this.incidentManager = incidentManager;
		this.shieldTimeLeft = 0;
		this.shieldTimer = null;
		this.shieldActive = false;
	}

	activate() {
		if (this.shieldActive) return;

		this.shieldTimeLeft = 10; //divine shield lasting time
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
		//show the time left of divine shield
		if (this.shieldActive) {
			fill(0);
			textSize(20);
			text('Divine Shield Time Left: ' + this.shieldTimeLeft, 240, 60);
		}
	}

	deactivate() {
		this.shieldActive = false;
		clearInterval(this.shieldTimer);
		this.incidentManager.resumePausedIncidents();
	}
}
