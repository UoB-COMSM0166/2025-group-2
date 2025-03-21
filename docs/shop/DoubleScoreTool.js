export class DoubleScoreTool {
	constructor() {
		this.doubleScoreTimeLeft = 20;
		this.doubleScoreTimer = null;
		this.doubleScoreActive = false;
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
		if (this.doubleScoreActive) {
			fill(0);
			textSize(20);
			text('Double score Time Left: ' + this.doubleScoreTimeLeft, 240, 30);
		}
	}

	deactivate() {
		this.doubleScoreActive = false;
		clearInterval(this.doubleScoreTimer);
		this.doubleScoreTimeLeft = 20;
		this.doubleScoreTimer = null;
	}
}
