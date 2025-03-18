export class MenuPage {
	constructor(game) {
		this.game = game;

		this.singlePlayerButton = createButton('Single Player');
		this.singlePlayerButton.mousePressed(() => this.game.startGame('single'));

		this.doublePlayerButton = createButton('Double Player');
		this.doublePlayerButton.mousePressed(() => this.game.startGame('double'));

		// Create tutorial toggle
		this.tutorialEnabled = true; // Default: tutorial enabled
		this.tutorialToggle = createButton('Tutorial: ON');
		this.tutorialToggle.mousePressed(() => this.toggleTutorial());
	}

	display() {
		background('#f5ebe0');
		textSize(32);
		textAlign(CENTER, CENTER);
		fill(0);
		text('Select Game Mode', width / 2, height / 3);

		this.singlePlayerButton.position(width / 2 - 50, height / 2);
		this.doublePlayerButton.position(width / 2 - 50, height / 2 + 50);
		this.tutorialToggle.position(width / 2 - 50, height / 2 + 100);

		this.singlePlayerButton.show();
		this.doublePlayerButton.show();
		this.tutorialToggle.show();
	}

	hideButtons() {
		this.singlePlayerButton.hide();
		this.doublePlayerButton.hide();
		this.tutorialToggle.hide();
	}

	showButtons() {
		this.singlePlayerButton.show();
		this.doublePlayerButton.show();
		this.tutorialToggle.show();
	}

	// Toggle tutorial state and update button text
	toggleTutorial() {
		this.tutorialEnabled = !this.tutorialEnabled;
		this.tutorialToggle.html(this.tutorialEnabled ? 'Tutorial: ON' : 'Tutorial: OFF');

		// Update the game's tutorial preference
		this.game.setTutorialEnabled(this.tutorialEnabled);
	}
}
