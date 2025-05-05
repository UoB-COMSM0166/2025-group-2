export class DoubleScoreTool {
	constructor(incidentManager) {
		this.incidentManager = incidentManager;
		this.doubleScoreTimeLeft = 20;
		this.doubleScoreTimer = null;
		this.doubleScoreActive = false;
	}

	activate() {
		//for not calling multiple times
		if (this.doubleScoreActive) {
			this.doubleScoreTimeLeft += 20;
			return;
		}

		this.doubleScoreActive = true;

		this.doubleScoreTimer = setInterval(() => {
			if (this.doubleScoreTimeLeft > 0) {
				this.doubleScoreTimeLeft--;
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

		if (this.doubleScoreActive) {
			fill(0, 128, 0);
			textSize(20);
			const x = this.incidentManager.gameArea.x + this.incidentManager.gameArea.w / 2;
			const y = this.incidentManager.gameArea.y - 125;
			text('Double score Time Left: ' + this.doubleScoreTimeLeft, x, y);
		}
	}

	deactivate() {
		this.doubleScoreActive = false;
		clearInterval(this.doubleScoreTimer);
		this.doubleScoreTimeLeft = 20;
		this.doubleScoreTimer = null;
	}
}
