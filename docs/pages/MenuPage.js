export class MenuPage {
	constructor(game) {
		this.game = game;

		this.singlePlayerButton = createButton('Single Player');
		this.singlePlayerButton.mousePressed(() => this.game.startGame('single'));

		this.doublePlayerButton = createButton('Double Player');
		this.doublePlayerButton.mousePressed(() => this.game.startGame('double'));
	}

	display() {
		background('#f5ebe0');
		textSize(32);
		textAlign(CENTER, CENTER);
		fill(0);
		text('Select Game Mode', width / 2, height / 3);

		this.singlePlayerButton.position(width / 2 - 50, height / 2);
		this.doublePlayerButton.position(width / 2 - 50, height / 2 + 50);

		this.singlePlayerButton.show();
		this.doublePlayerButton.show();
	}

	hideButtons() {
		this.singlePlayerButton.hide();
		this.doublePlayerButton.hide();
	}

	showButtons() {
		this.singlePlayerButton.show();
		this.doublePlayerButton.show();
	}
}
