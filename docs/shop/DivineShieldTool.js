export class DivineShieldTool {
	constructor(board, area) {
		this.incidentManager = board.incidentManager;
		this.shieldTimeLeft = 0;
		this.shieldTimer = null;
		this.shieldActive = false;
		this.gameArea = area;
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
		const game1Area = this.gameArea.game1;
		const game2Area = this.gameArea.game2 ?? null;
		if (this.shieldActive) {
			if (game2Area == null) {
				fill('#6B4F3F');
				textSize(20);
				text(
					'Divine Shield Time Left: ' + this.shieldTimeLeft,
					game1Area.x + game1Area.w / 2,
					game1Area.y - 90
				);
			} else {
				console.log('game1Area :>> ', game1Area);
			}
		}
	}

	deactivate() {
		this.shieldActive = false;
		clearInterval(this.shieldTimer);
		this.incidentManager.resumePausedIncidents();
	}
}
