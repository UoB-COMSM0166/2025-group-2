export class MenuPage {
	constructor(game) {
		this.game = game;
	}

	display() {
		background('#f5ebe0');
		textSize(32);
		textAlign(CENTER, CENTER);
		fill(0);
		text('Select Game Mode', width / 2, height / 3);

		let singlePlayerButton = createButton('Single Player');
		singlePlayerButton.position(width / 2 - 50, height / 2);
		singlePlayerButton.mousePressed(() => this.game.startGame('single'));

		let doublePlayerButton = createButton('Double Player');
		doublePlayerButton.position(width / 2 - 50, height / 2 + 50);
		doublePlayerButton.mousePressed(() => this.game.startGame('double'));
	}
}
