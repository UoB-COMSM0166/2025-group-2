export class Score {
	constructor() {
		this.score = 0;
	}

	addScore(score) {
		this.score += score;
	}

	getScore() {
		return this.score || 0;
	}

	reset() {
		this.score = 0;
	}

	minusScore(score){
		this.score -= score;
	}
}
