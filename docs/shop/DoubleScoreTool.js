export class DoubleScoreTool {
	constructor(game) {
		this.game = game;
		this.doubleScoreTimeLeft = 20;
		this.doubleScoreTimer = null;
		this.doubleScoreActive = false;
	}

	activate() {
		//for not calling multiple times
		if(this.doubleScoreActive) return;

		this.doubleScoreActive = true;
		console.log('this.active :>> ', this.doubleScoreActive);
		console.log('Double Score activated!');
		this.doubleScoreTimer = setInterval(() => {
			if (this.doubleScoreTimeLeft > 0) {
				this.doubleScoreTimeLeft--;
				//console.log('Double Score activated! :', this.doubleScoreTimeLeft);
				//console.log(this.doubleScoreTimeLeft);

			} else {
				this.deactivate();
				console.log('Double Score Deactivated!');
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
