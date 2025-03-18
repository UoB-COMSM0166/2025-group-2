// TutorialManager.js
// This manages the tutorial flow before actual gameplay begins
export class TutorialManager {
	constructor(game, gameManager) {
		this.game = game;
		this.gameManager = gameManager;
		this.currentStep = 0; // Start with the first step
		this.isActive = true;
		this.mode = gameManager.mode;
		this.hasDrawnFirstStep = false; // Flag to ensure first step is shown
		this.initialClickProtection = true; // Protect against initial auto-click
		this.clickProtectionTimer = 20; // Wait some frames before allowing clicks

		// Pause the game's counter
		if (this.gameManager.counter) {
			this.gameManager.counter.stop();
		}

		// Setup click listener for tutorial progression
		this.setupClickListener();

		// Define all tutorial steps
		this.tutorialSteps = [
			{
				text: this.getObjectivesText(),
				highlight: null,
			},
			{
				text: this.getControlsText(),
				highlight: null,
			},
			{
				text: 'Random incidents will occur throughout gameplay that will create challenges for you!',
				highlight: null,
			},
			{
				text: 'The shop contains special tools that you can purchase with coins earned by merging fruits.',
				highlight: this.gameManager.uiManager.AREAS.shop,
			},
			{
				text: "Shuffle: Shakes all fruits to help rearrange them when you're stuck.",
				highlight: 'shuffle',
			},
			{
				text: 'Divine Shield: Protects you from incidents for a short period of time.',
				highlight: 'divineShield',
			},
			{
				text: 'Double Score: Doubles your score for each merge for a limited time.',
				highlight: 'doubleScore',
			},
			{
				text: 'Bomb: Creates an explosive fruit that clears nearby fruits when it collides.',
				highlight: 'bombTool',
			},
			{
				text: 'Rainbow: Creates a special fruit that can merge with any other fruit.',
				highlight: 'rainbowTool',
			},
			{
				text: 'Random: Gives you a random tool or special fruit for a lower price.',
				highlight: 'random',
			},
			{
				text: 'Get ready! The game will start when you click.',
				highlight: null,
			},
		];

		// Freeze all fruits in place at construction time
		this.freezeAllFruits();
	}

	// Make sure all fruits are frozen and don't move
	freezeAllFruits() {
		if (this.gameManager && this.gameManager.player) {
			this.gameManager.player.forEach(player => {
				if (player.boards) {
					// Freeze current fruit
					if (player.boards.currentFruit && player.boards.currentFruit.sprite) {
						player.boards.currentFruit.sprite.vel.x = 0;
						player.boards.currentFruit.sprite.vel.y = 0;
						player.boards.currentFruit.sprite.collider = 'static';
					}

					// Freeze next fruit
					if (player.boards.nextFruit && player.boards.nextFruit.sprite) {
						player.boards.nextFruit.sprite.vel.x = 0;
						player.boards.nextFruit.sprite.vel.y = 0;
						player.boards.nextFruit.sprite.collider = 'static';
					}

					// Freeze all other fruits
					if (player.boards.fruits) {
						player.boards.fruits.forEach(fruit => {
							if (fruit && fruit.sprite) {
								fruit.sprite.vel.x = 0;
								fruit.sprite.vel.y = 0;
								fruit.sprite.collider = 'static';
							}
						});
					}
				}
			});
		}
	}

	getObjectivesText() {
		if (this.mode === 'single') {
			return "Welcome to Suika Game! \nYour goal is to merge fruits of the same size to create larger fruits and earn points. \nDon't let fruits stack up past the red line!";
		} else {
			return 'Welcome to Two-Player Mode! \nPlayers must merge fruits in their own area. You lose if you stack fruits past the red line! \nWin Conditions: \n1. First player to achieve biggest fruit size wins! \nOR  \n2. Player with highest score after time limit wins!';
		}
	}

	getControlsText() {
		if (this.mode === 'single') {
			return 'Move your mouse to position the fruit. Click to drop the fruit. \nTry to drop fruits on top of other fruits of the same size to merge them!';
		} else {
			return 'Player 1: Use  A/D  keys to move and  S  to drop. \nPlayer 2: Use  LEFT/RIGHT  arrow keys to move and  DOWN  arrow to drop. \nMerge fruits of the same size to score points!';
		}
	}

	setupClickListener() {
		// Store the original mouseClicked function
		this.originalMouseClicked = window.mouseClicked;

		// Override mouseClicked to handle tutorial progression
		window.mouseClicked = () => {
			if (this.isActive) {
				// Ignore clicks during the initial protection period
				if (this.initialClickProtection) {
					console.log('Click ignored due to initial protection');
					return false;
				}

				// Only proceed if we've already shown the first step
				if (this.hasDrawnFirstStep) {
					this.nextStep();
				} else {
					this.hasDrawnFirstStep = true;
				}
				return false; // Prevent default behavior
			} else {
				// Restore original behavior when tutorial is done
				return this.originalMouseClicked ? this.originalMouseClicked() : false;
			}
		};
	}

	restoreOriginalClickHandler() {
		try {
			window.mouseClicked = this.originalMouseClicked;
		} catch (e) {
			console.log('Error restoring click handler:', e);
			// Provide a fallback click handler if necessary
			window.mouseClicked = function () {
				return false;
			};
		}
	}

	nextStep() {
		this.currentStep++;
		if (this.currentStep >= this.tutorialSteps.length) {
			this.endTutorial();
		} else {
			// Re-freeze all fruits after each step to ensure they don't move
			this.freezeAllFruits();
		}
	}

	endTutorial() {
		this.isActive = false;
		this.restoreOriginalClickHandler();

		// Tell the game to start after tutorial
		try {
			if (this.game && typeof this.game.startActualGame === 'function') {
				this.game.startActualGame();
			}
		} catch (e) {
			console.log('Error starting actual game:', e);
			// Fallback to starting the game directly
			if (this.game) {
				this.game.currentScene = 'game';
				this.game.isTutorialMode = false;
			}
		}
	}

	highlightElement(element) {
		// Create a semi-transparent overlay
		push();
		fill(0, 0, 0, 150);
		noStroke();
		rect(0, 0, width, height);

		// If we have a string ID to highlight (for shop items)
		if (typeof element === 'string') {
			const shopItems = this.gameManager.uiManager.shop.shopItems;
			const item = shopItems.find(item => item.id === element);

			if (item) {
				// Cut out the highlighted element
				fill(0, 0, 0, 0); // Transparent fill
				stroke(255, 255, 0);
				strokeWeight(3);
				rectMode(CENTER);
				// Make the highlight area a bit larger than the item
				rect(item.x, item.y, item.w + 20, item.h + 20, 10);
			}
		}
		// If we have an area object to highlight
		else if (element && element.x !== undefined) {
			fill(0, 0, 0, 0); // Transparent fill
			stroke(255, 255, 0);
			strokeWeight(3);
			rectMode(CORNER);
			// Make the highlight area a bit larger than the area
			rect(element.x - 10, element.y - 10, element.w + 20, element.h + 20, 10);
		}
		pop();
	}

	drawTutorialBox() {
		push();
		// Position the tutorial box
		let boxX = width / 2;
		let boxY = 138;
		let boxWidth = min(850, width * 0.9);
		let boxHeight = 250;

		// Draw background
		fill(53, 47, 42, 255);
		stroke(255);
		strokeWeight(2);
		rectMode(CENTER);
		rect(boxX, boxY, boxWidth, boxHeight, 15);

		// Get current step text
		let currentStepData = this.tutorialSteps[this.currentStep];
		let message = currentStepData ? currentStepData.text : 'Welcome to the game!';

		// Text styling
		fill(255);
		noStroke();
		textSize(20);
		textAlign(CENTER, CENTER);

		// First split by manual line breaks
		let paragraphs = message.split('\n');
		let lines = [];

		// Then process each paragraph for word wrapping
		for (let paragraph of paragraphs) {
			// Split text into lines for manual wrapping
			let words = paragraph.split(' ');
			let currentLine = words[0] || '';

			for (let i = 1; i < words.length; i++) {
				let testLine = currentLine + ' ' + words[i];
				let testWidth = textWidth(testLine);

				if (testWidth > boxWidth - 60) {
					lines.push(currentLine);
					currentLine = words[i];
				} else {
					currentLine = testLine;
				}
			}
			if (currentLine) lines.push(currentLine);
		}

		// Draw each line of text
		let lineHeight = 28;
		let totalTextHeight = lines.length * lineHeight;
		let startY = boxY - totalTextHeight / 2 + lineHeight / 2;

		for (let i = 0; i < lines.length; i++) {
			text(lines[i], boxX, startY + i * lineHeight);
		}

		// Draw "click to continue" instruction
		textSize(16);
		fill(200);
		text('Click anywhere to continue', boxX, boxY + boxHeight / 2 - 25);
		pop();
	}

	update() {
		if (!this.isActive) return;

		// Update click protection timer
		if (this.initialClickProtection) {
			this.clickProtectionTimer--;
			if (this.clickProtectionTimer <= 0) {
				this.initialClickProtection = false;
			}
		}

		// Ensure all fruits stay frozen during tutorial
		this.freezeAllFruits();

		const currentStepData = this.tutorialSteps[this.currentStep];

		// Highlight the element if specified
		if (currentStepData && currentStepData.highlight) {
			this.highlightElement(currentStepData.highlight);
		} else {
			// Just darken the screen without highlighting
			push();
			fill(0, 0, 0, 150);
			noStroke();
			rect(0, 0, width, height);
			pop();
		}

		// Draw the tutorial text box (on top of everything)
		this.drawTutorialBox();

		// Update the hasDrawnFirstStep flag
		this.hasDrawnFirstStep = true;
	}
}
