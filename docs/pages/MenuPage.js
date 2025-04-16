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
			'#e63232',
			'#f8961e',
			'#7fc96b',
			'#43aa8b',
			'#2d92d1',
			'#f6aeae',
			'#277da1',
			'#3b498e',
			'#ffd043',
			'#66418a',
		];

		// Game title configuration
		this.titleColor = color(107, 79, 63);

		// Button status
		this.buttons = [
			{
				text: 'Casual Mode',
				action: () => this.game.startGame('single'),
				bounds: { x: 0, y: 0, w: this.buttonWidth, h: this.buttonHeight },
				isHovered: false,
			},
			{
				text: 'Double Player',
				action: () => this.game.startGame('double'),
				bounds: { x: 0, y: 0, w: this.buttonWidth, h: this.buttonHeight },
				isHovered: false,
			},
			{
				text: 'Tutorial: ON',
				action: () => this.toggleTutorial(),
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
		let eyeSize = map(d, 0, 100, 2, 6);
		let eyeOffsetX = eyeSize * (fruit.randomId % 2 == 0 ? 1.5 : 1);
		let eyeOffsetY = eyeSize * (fruit.randomId % 2 == 0 ? 1.5 : 1);

		// Eye coordinate
		let leftEyeX = -eyeOffsetX;
		let rightEyeX = eyeOffsetX;
		let eyeY = -eyeOffsetY;

		// The white of the eye
		fill(255);
		noStroke();
		ellipse(leftEyeX, eyeY, eyeSize * 2, eyeSize * 2);
		ellipse(rightEyeX, eyeY, eyeSize * 2, eyeSize * 2);

		// Eyeball (simplified version, no mouse)
		fill(0);
		ellipse(leftEyeX, eyeY, eyeSize, eyeSize);
		ellipse(rightEyeX, eyeY, eyeSize, eyeSize);

		// mouth
		let mouthY = eyeY + eyeSize * 2;
		let mouthOffset = map(
			noise(frameCount / 20, fruit.x, fruit.y),
			0,
			1,
			-eyeOffsetX / 4,
			eyeOffsetX / 4
		);

		stroke(0);
		strokeWeight(2);
		line(-eyeOffsetX / 2, mouthY + mouthOffset, eyeOffsetX / 2, mouthY - mouthOffset);
	}

	drawTitle() {
		push();
		// Draw main headings
		textSize(64);
		textAlign(CENTER, CENTER);
		fill(this.titleColor);
		text('Crazy Bubble', width / 2, height / 4);

		// subtitle
		textSize(32);
		text('Select Game Mode', width / 2, height / 3);
		pop();
	}

	updateButtonPositions() {
		const centerX = width / 2 - this.buttonWidth / 2;
		const startY = height / 2;

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
}
