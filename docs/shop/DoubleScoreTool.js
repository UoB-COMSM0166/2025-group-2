export class DoubleScoreTool {
	constructor(area) {
		this.doubleScoreTimeLeft = 20;
		this.doubleScoreTimer = null;
		this.doubleScoreActive = false;
		this.gameArea = area;
	}

	activate() {
		//for not calling multiple times
		if (this.doubleScoreActive) return;

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
		const game1Area = this.gameArea.game1;
		const game2Area = this.gameArea.game2 ?? null;
		if (this.doubleScoreActive) {
			if (game2Area == null) {
				fill('#6B4F3F');
				textSize(20);
				text(
					'Double score Time Left: ' + this.doubleScoreTimeLeft,
					game1Area.x + game1Area.w / 2,
					game1Area.y - 60
				);
			} else {
				console.log('game1Area :>> ', game1Area);
			}
		}
	}

	deactivate() {
		this.doubleScoreActive = false;
		clearInterval(this.doubleScoreTimer);
		this.doubleScoreTimeLeft = 20;
		this.doubleScoreTimer = null;
	}
}
