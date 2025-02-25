export class Score {
	constructor() {
		this.score = 0;
	}

	addScore(score) {
		this.score += score;
	}

	getScore() {
		return this.score;
	}

	reset() {
		this.score = 0;
	}
}
