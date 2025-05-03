import { Button } from '../models/index.js';
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
		this.scaleVal = gameManager.scaleVal; // Get current scale value
		this.canvasElt = document.querySelector('canvas'); // Get canvas element reference
		this.skipButton = null;

		// Listen for window resize events to update button scaling
		window.addEventListener('resize', () => {
			if (this.isActive && this.skipButton) {
				this.skipButton.updatePosition();
			}
		});

		// Create skip button
		//this.createSkipButton();

		// Setup click listener for tutorial progression
		this.setupClickListener();

		// Define all tutorial steps
		if (this.mode === 'single') {
			this.tutorialSteps = [
				{
					text: "Welcome to the Crazy Bubble! \nYour goal is to merge bubbles of the same size to create larger bubbles and earn points. \nDon't let bubbles stack up past the red line!",
					highlight: null,
				},
				{
					text: 'Move your mouse to position the bubble. Click to drop the bubble. \nTry to drop bubbles on top of other bubbles of the same size to merge them!',
					highlight: null,
				},
				{
					text: 'Random incidents will occur throughout gameplay that will create challenges for you!',
					highlight: null,
				},
				{
					text: 'The shop contains special tools that you can purchase with coins earned by merging bubbles.',
					highlight: this.gameManager.uiManager.AREAS.shop,
				},
				{
					text: "Shuffle: Shakes all bubbles to help rearrange them when you're stuck.",
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
					text: 'Bomb: Creates an explosive bubble that clears nearby bubbles when it collides.',
					highlight: 'bombTool',
				},
				{
					text: 'Rainbow: Creates a special bubble that can merge with any other bubble.',
					highlight: 'rainbowTool',
				},
				{
					text: 'Random: Gives you a random tool or special bubble for a lower price.',
					highlight: 'random',
				},
				{
					text: 'Get ready! The game will start when you click.',
					highlight: null,
				},
			];
		} else if (this.mode === 'double') {
			this.tutorialSteps = [
				{
					text: 'Welcome to the Crazy Bubble Two-Player Mode!',
					highlight: null,
				},
				{
					text: 'Players must merge bubbles in their own area.\n Avoid stacking bubbles beyond the red line — that ends the game!\n\nWin Conditions: \n1. First player to achieve biggest bubble size wins! \nOR  \n2.  If time runs out, the player with highest score wins!',
					highlight: null,
				},
				{
					title: 'How to play',
					highlight: null,
					split: true,
					left: ['Left Side Player 1:', '- A / D: Move bubble left / right', '- S: Drop bubble'],
					right: ['Right Side Player 2:', '- ← / →: Move bubble left / right', '- ↓: Drop bubble'],
					highlightKeys: ['A', 'D', 'S', '←', '→', '↓'],
				},
				{
					text: 'Random incidents will occur throughout gameplay that will create challenges for you!',
					highlight: null,
				},
				{
					text: 'The shop contains special tools that you can purchase with coins earned by merging bubbles.',
					highlight: this.gameManager.uiManager.AREAS.shop,
				},
				{
					title: 'Shop Controls',
					left: ['Left Side Player 1:', '- W and Q to browse', '- E to buy'],
					right: ['Right Side Player 2:', "- ⭡and '/' to browse", "- '.' to buy"],
					highlight: this.gameManager.uiManager.AREAS.shop,
					split: true,
					highlightKeys: ['Q', 'W', 'E', '↑', '.', '?'],
				},
				{
					text: "Shuffle: Shakes all bubbles to help rearrange them when you're stuck.",
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
					text: 'Bomb: Creates an explosive bubble that clears nearby bubbles when it collides.',
					highlight: 'bombTool',
				},
				{
					text: 'Rainbow: Creates a special bubble that can merge with any other bubble.',
					highlight: 'rainbowTool',
				},
				{
					text: 'Random: Gives you a random tool or special bubble for a lower price.',
					highlight: 'random',
				},
				{
					text: 'Strong Wind: Cause a wind on your opponent side.',
					highlight: 'Wind',
				},
				{
					text: 'Heavy Rain: Cause a rain on your opponent side.',
					highlight: 'Rain',
				},
				{
					text: 'Get ready! The game will start when you click.',
					highlight: null,
				},
			];
		}

		// Freeze all bubbles in place at construction time
		this.freezeAllFruits();
	}

	// Create the skip button for tutorial
	createSkipButton(tutorialBoxX, tutorialBoxY, boxWidth, boxHeight) {
		if (this.skipButton) {
			const buttonX =
				this.mode === 'single' ? tutorialBoxX + boxWidth / 4 : tutorialBoxX + boxWidth / 4 + 40;
			const buttonY = tutorialBoxY + boxHeight / 2 - 50;
			this.skipButton.setPosition(buttonX, buttonY);
			return;
		}
		const buttonX =
			this.mode === 'single' ? tutorialBoxX + boxWidth / 4 : tutorialBoxX + boxWidth / 4 + 40;
		const buttonY = tutorialBoxY + boxHeight / 2 - 50;

		this.skipButton = new Button(
			'Skip',
			() => {
				this.skipTutorial();
			},
			{
				x: buttonX,
				y: buttonY,
				getScaleVal: () => this.gameManager.scaleVal,
				bgColor: '#E5C3A6',
				textColor: '#6B4F3F',
				hoverBg: '#F4D8C6',
				hoverText: '#A3785F',
			}
		);
	}

	// Skip the tutorial and go directly to gameplay
	skipTutorial() {
		// Hide the skip button
		if (this.skipButton) {
			this.skipButton.remove();
			this.skipButton = null;
		}

		// End the tutorial
		this.endTutorial();
	}

	// Make sure all bubbles are frozen and don't move
	freezeAllFruits() {
		if (this.gameManager && this.gameManager.player) {
			this.gameManager.player.forEach(player => {
				if (player.boards) {
					// Freeze current bubble
					if (player.boards.currentFruit && player.boards.currentFruit.sprite) {
						player.boards.currentFruit.sprite.vel.x = 0;
						player.boards.currentFruit.sprite.vel.y = 0;
						player.boards.currentFruit.sprite.collider = 'static';
					}

					// Freeze next bubble
					if (player.boards.nextFruit && player.boards.nextFruit.sprite) {
						player.boards.nextFruit.sprite.vel.x = 0;
						player.boards.nextFruit.sprite.vel.y = 0;
						player.boards.nextFruit.sprite.collider = 'static';
					}

					// Freeze all other bubbles
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

	setupClickListener() {
		// Store the original mouseClicked function
		this.originalMouseClicked = window.mouseClicked;

		// Override mouseClicked to handle tutorial progression
		window.mouseClicked = () => {
			if (this.isActive) {
				// Ignore clicks during the initial protection period
				if (this.initialClickProtection) {
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
			// Re-freeze all bubbles after each step to ensure they don't move
			this.freezeAllFruits();
		}
	}

	endTutorial() {
		this.isActive = false;

		// Remove the skip button if it exists
		if (this.skipButton) {
			this.skipButton.remove();
			this.skipButton = null;
		}

		this.restoreOriginalClickHandler();

		// Tell the game to start after tutorial - with proper error handling
		if (this.gameManager && typeof this.gameManager.startActualGameAfterTutorial === 'function') {
			this.game.currentScene = 'game';
			this.gameManager.startActualGameAfterTutorial();
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
			const btn = shopItems.find(item => item.options.id === element);
			if (btn) {
				fill(0, 0, 0, 0); // Transparent fill
				stroke(255, 255, 0);
				strokeWeight(3);
				rectMode(CORNER);
				rect(btn.x - 5, btn.y - 10, btn.button.width + 10, btn.button.height + 20 + 30, 10);
			}
		}
		// If we have an area object to highlight
		else if (element && element.x !== undefined) {
			fill(0, 0, 0, 0); // Transparent fill
			stroke(255, 255, 0);
			strokeWeight(3);
			rectMode(CORNER);
			// Make the highlight area a bit larger than the area
			rect(element.x - 5, element.y - 10, element.w + 10, element.h + 20, 10);
		}
		pop();
	}

	drawTutorialBox() {
		push();
		// Position the tutorial box
		let boxX = width / 2;
		let boxY = this.mode === 'single' ? 150 : 117;
		let boxWidth = this.mode === 'single' ? 600 : 850;
		let boxHeight = this.mode === 'single' ? 270 : 220;

		// Draw background
		fill(53, 47, 42, 255);
		stroke(255);
		strokeWeight(2);
		rectMode(CENTER);
		rect(boxX, boxY, boxWidth, boxHeight, 15);

		// Get current step text
		let currentStepData = this.tutorialSteps[this.currentStep];

		const lineHeight = 28;
		const isSplit = currentStepData?.split;
		const title = currentStepData?.title;

		if (isSplit && Array.isArray(currentStepData.left) && Array.isArray(currentStepData.right)) {
			let linesLeft = currentStepData.left;
			let linesRight = currentStepData.right;
			let maxLines = Math.max(linesLeft.length, linesRight.length);

			let baseY = boxY;
			if (title) {
				// Draw title above
				textSize(24);
				fill(255);
				noStroke();
				textAlign(CENTER, CENTER);
				text(title, boxX, boxY - 70);
				baseY = boxY;
			}
			textSize(20);
			fill(255);
			textAlign(LEFT, CENTER);
			noStroke();

			let totalTextHeight = maxLines * lineHeight;
			let startY = baseY - totalTextHeight / 2 + lineHeight / 2;
			let padding = 40;
			let leftX = boxX - boxWidth / 2 + padding;
			let rightX = boxX + padding;

			for (let i = 0; i < linesLeft.length; i++) {
				text(linesLeft[i], leftX, startY + i * lineHeight);
			}
			for (let i = 0; i < linesRight.length; i++) {
				text(linesRight[i], rightX, startY + i * lineHeight);
			}
		} else {
			let message = currentStepData?.text ?? 'Welcome to the game!';
			let paragraphs = message.split('\n');
			let lines = [];

			textSize(20);
			fill(255);
			textAlign(CENTER, CENTER);
			noStroke();

			for (let paragraph of paragraphs) {
				let words = paragraph.split(' ');
				let currentLine = words[0] || '';
				for (let i = 1; i < words.length; i++) {
					let testLine = currentLine + ' ' + words[i];
					if (textWidth(testLine) > boxWidth - 60) {
						lines.push(currentLine);
						currentLine = words[i];
					} else {
						currentLine = testLine;
					}
				}
				if (currentLine) lines.push(currentLine);
			}

			let totalTextHeight = lines.length * lineHeight;
			let startY = boxY - totalTextHeight / 2 + lineHeight / 2;

			for (let i = 0; i < lines.length; i++) {
				text(lines[i], boxX, startY + i * lineHeight);
			}
		}

		// Draw "click to continue" instruction
		textSize(16);
		fill(200);
		textAlign(CENTER, CENTER);
		text('Click anywhere to continue', boxX, boxY + boxHeight / 2 - 20);
		pop();

		this.createSkipButton(boxX, boxY, boxWidth, boxHeight);
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
		/*
		// Update skip button position when scaling may have changed
		if (this.skipButton) {
			this.skipButton.updatePosition();
		}*/

		// Ensure all bubbles stay frozen during tutorial
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

		if (this.mode === 'double') {
			if (currentStepData.highlightKeys) {
				this.gameManager.uiManager.keyGuide.setHighlight(currentStepData.highlightKeys);
			} else {
				this.gameManager.uiManager.keyGuide.clearHighlight();
			}
		}

		// Draw the tutorial text box (on top of everything)
		this.drawTutorialBox();
		if (this.mode === 'double') {
			this.gameManager.uiManager.keyGuide.draw();
		}

		// Update the hasDrawnFirstStep flag
		this.hasDrawnFirstStep = true;
	}
}
