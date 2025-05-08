export class DivineShieldTool {
	constructor(incidentManager) {
		this.incidentManager = incidentManager;
		this.shieldTimeLeft = 0;
		this.shieldTimer = null;
		this.shieldActive = false;
	}

	activate() {
		if (this.shieldActive) {
			this.shieldTimeLeft += 10;
			return;
		}

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
		// Check if game is over before displaying
		if (
			this.incidentManager.game.player &&
			this.incidentManager.game.player.gameManager &&
			this.incidentManager.game.player.gameManager.isGameOver
		) {
			return;
		}

		//show the time left of divine shield
		if (this.shieldActive) {
			textAlign(CENTER, CENTER);
			fill(35, 71, 148);
			textSize(20);
			text(
				'Divine Shield Time Left: ' + this.shieldTimeLeft,
				this.incidentManager.gameArea.x + this.incidentManager.gameArea.w / 2,
				this.incidentManager.gameArea.y - 150
			);
		}
	}

	deactivate() {
		this.shieldActive = false;
		clearInterval(this.shieldTimer);
		this.incidentManager.resumePausedIncidents();
		this.shieldTimeLeft = 0;
		this.shieldTimer = null;
	}
}
