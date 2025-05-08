import { FaceComponents, FaceMapping } from '../models/Face.js';
export class MenuPage {
	constructor(game) {
		this.game = game;

		// Button configuration
		this.buttonWidth = 200;
		this.buttonHeight = 60;
		this.buttonSpacing = 70;
		this.buttonCornerRadius = 15;
		// Color configuration
		this.buttonColors = {
			normal: color(213, 189, 175), // #d5bdaf - It's the same color as the walls
			hover: color(107, 79, 63), // #6B4F3F - Consistent with the text color
			text: color(255, 255, 255), // white text
		};

		// The same array of colors as the Fruit class
		this.fruitColors = [
			'#b38ebe',
			'#c0c0c0',
			'#ff6f7a',
			'#ffb98a',
			'#ffe08a',
			'#c8e275',
			'#76e6b8',
			'#7ac9e0',
			'#99a7e7',
			'#c9ad95',
		];

		// Game title configuration
		this.titleColor = color(107, 79, 63);

		// Button status
		this.buttons = [
			{
				text: 'Casual Mode',
				action: () => {
					userStartAudio().then(() => {
						this.game.soundManager.playBackgroundMusic();
						this.game.startGame('single');
					});
				},
				bounds: { x: 0, y: 0, w: this.buttonWidth, h: this.buttonHeight },
				isHovered: false,
			},
			{
				text: 'Double Player',
				action: () => {
					userStartAudio().then(() => {
						this.game.soundManager.playBackgroundMusic();
						this.game.startGame('double');
					});
				},
				bounds: { x: 0, y: 0, w: this.buttonWidth, h: this.buttonHeight },
				isHovered: false,
			},
			{
				text: 'Tutorial: ON',
				action: () => this.toggleTutorial(),
				bounds: { x: 0, y: 0, w: this.buttonWidth, h: this.buttonHeight },
				isHovered: false,
			},
			// Add volume button here
			{
				text: 'Sound: ON',
				action: () => this.toggleSound(),
				bounds: { x: 0, y: 0, w: this.buttonWidth, h: this.buttonHeight },
				isHovered: false,
			},
		];

		// Tutorial status
		this.tutorialEnabled = true;

		// Mouse click state
		this.mouseWasPressed = false;

		// Initialize the background fruit
		this.initBackgroundFruits();

		// Add a global click listener to unlock the AudioContext and start background music
		const unlockAudio = () => {
			userStartAudio().then(() => {
				this.game.soundManager.playBackgroundMusic();
			});
			document.body.removeEventListener('click', unlockAudio);
		};
		document.body.addEventListener('click', unlockAudio);
	}

	initBackgroundFruits() {
		// Create a background fruit array
		this.bgFruits = [];

		// Create 20 fruits
		for (let i = 0; i < 20; i++) {
			// Random fruit types (0-9)
			const fruitType = int(random(this.fruitColors.length));

			// Random location, starting at the top of the canvas
			const x = random(width);
			const y = random(-300, -50);

			// Size by type (according to the logic of the original Fruit class)
			const size = 30 + 20 * fruitType;

			// Random ID (for eye changes)
			const randomId = int(random(100000));

			// Create simulated fruit objects
			const fruit = {
				x: x,
				y: y,
				speed: random(1, 3),
				size: size,
				type: fruitType,
				randomId: randomId,
				sprite: { x: x, y: y },
				color: this.fruitColors[fruitType],
			};

			// Adds fruit to the background fruit array
			this.bgFruits.push(fruit);
		}
	}

	display() {
		// Draw background (keep original background)
		background('#f5ebe0');

		// Update and draw the background fruit
		this.updateAndDrawBackgroundFruits();

		// Draw the title of the game
		this.drawTitle();

		// Calculate and draw buttons
		this.updateButtonPositions();
		this.drawButtons();

		// Handling mouse events
		this.handleMouse();
	}

	updateAndDrawBackgroundFruits() {
		// Update and draw each fruit
		for (let i = 0; i < this.bgFruits.length; i++) {
			const fruit = this.bgFruits[i];

			// Update location
			fruit.y += fruit.speed;
			fruit.sprite.y = fruit.y;

			// If the fruit goes beyond the bottom of the canvas, reset to the top
			if (fruit.y > height + fruit.size) {
				fruit.y = random(-200, -50);
				fruit.x = random(width);
			}

			// Paint fruit
			this.drawFruit(fruit);
		}
	}

	drawFruit(fruit) {
		push();
		translate(fruit.x, fruit.y);

		// Draw fruit circles
		stroke(10);
		fill(fruit.color);
		ellipse(0, 0, fruit.size, fruit.size);

		// Fruit emoji
		this.drawFruitFace(fruit);

		pop();
	}

	drawFruitFace(fruit) {
		let d = fruit.size;

		const faceConfig = FaceMapping[fruit.type] || { eye: 0, nose: null, mouth: 0 };

		if (faceConfig.eye !== null) {
			FaceComponents.eyes[faceConfig.eye](d, fruit);
		}
		if (faceConfig.nose !== null) {
			FaceComponents.noses[faceConfig.nose](d, fruit);
		}
		if (faceConfig.mouth !== null) {
			FaceComponents.mouths[faceConfig.mouth](d, fruit);
		}
	}

	drawTitle() {
		push();
		// Draw main headings
		textSize(64);
		stroke(255);
		strokeWeight(4);
		textAlign(CENTER, CENTER);
		fill(this.titleColor);
		text('Crazy Bubble', width / 2, height / 4);

		// subtitle
		textSize(32);
		strokeWeight(2);
		text('Select Game Mode', width / 2, height / 3);
		pop();
	}

	updateButtonPositions() {
		const centerX = width / 2 - this.buttonWidth / 2;
		const startY = height * 0.4;

		this.buttons.forEach((button, index) => {
			button.bounds.x = centerX;
			button.bounds.y = startY + index * this.buttonSpacing;

			// Update hover status
			button.isHovered = this.isMouseOverButton(button);
		});
	}

	drawButtons() {
		// Sets the button text style
		textAlign(CENTER, CENTER);
		textSize(20);

		// Draw each button
		this.buttons.forEach(button => {
			const { x, y, w, h } = button.bounds;

			//Button background
			push();
			fill(button.isHovered ? this.buttonColors.hover : this.buttonColors.normal);
			noStroke();
			rect(x, y, w, h, this.buttonCornerRadius);

			// Button text
			fill(this.buttonColors.text);
			text(button.text, x + w / 2, y + h / 2);
			pop();
		});
	}

	isMouseOverButton(button) {
		const { x, y, w, h } = button.bounds;
		let scaledMouseX = mouseX / this.game.scaleVal;
		let scaledMouseY = mouseY / this.game.scaleVal;

		return scaledMouseX >= x && scaledMouseX <= x + w && scaledMouseY >= y && scaledMouseY <= y + h;
	}

	handleMouse() {
		// Detects hover status - Updated in updateButtonPositions

		// Detect click
		if (mouseIsPressed && !this.mouseWasPressed) {
			this.mouseWasPressed = true;

			// Check each button
			for (const button of this.buttons) {
				if (this.isMouseOverButton(button)) {
					button.action();
					break;
				}
			}
		} else if (!mouseIsPressed) {
			this.mouseWasPressed = false;
		}
	}

	toggleTutorial() {
		this.tutorialEnabled = !this.tutorialEnabled;
		this.buttons[2].text = this.tutorialEnabled ? 'Tutorial: ON' : 'Tutorial: OFF';

		// Updated tutorial preferences for the game
		this.game.setTutorialEnabled(this.tutorialEnabled);
	}

	toggleSound() {
		const isMuted = this.game.soundManager.toggleMute();
		this.buttons[3].text = isMuted ? 'Sound: OFF' : 'Sound: ON';
	}
}
