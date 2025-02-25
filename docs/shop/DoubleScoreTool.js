export class DoubleScoreTool {
	constructor(game) {
		this.game = game;
		this.doubleScoreTimeLeft = 10;
		this.doubleScoreTimer = null;
		this.doubleScoreActive = false;
	}

	activate() {
		this.isDoubleScoreActive = true;
		console.log('this.active :>> ', this.active);
		console.log('Double Score activated!');
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
			text('Double socre Time Left: ' + this.doubleScoreTimeLeft, 240, 30);
		}
	}

	deactivate() {
		this.doubleScoreActive = false;
		clearInterval(this.doubleScoreTimer);
	}
}
