import { Fruit } from '../models/Fruit.js';
import { Incident } from './Incident.js';

export class RainIncident extends Incident {
	constructor(game, gameArea) {
		super(game, 'Rain', 0); // Pass in game instance, event name, duration (seconds)
		this.game = game;
		this.scaleVal = this.game.scaleVal;
		this.area = gameArea;
		this.hasDropped = false;
		this.fruitCount = 6; // The amount of fruit dropped
		this.dashLineY = this.game.endLine.y1;
	}

	enable() {
		super.enable();
		if (!this.hasDropped) {
			this.dropFruitRow();
			this.hasDropped = true;
		}
		this.disable();
	}

	disable() {
		super.disable();
		this.hasDropped = false;
	}

	update() {
		if (!this.active) return;
		super.update();
	}

	dropFruitRow() {
		// Compute container boundary
		const leftWall = this.area.x; // Left wall inside position
		const rightWall = this.area.x + this.area.w; // Right wall inside position
		const containerWidth = rightWall - leftWall;

		// Calculate the spacing between fruits
		const spacing = containerWidth / (this.fruitCount + 1);

		// Create fruits and add them to the game
		for (let i = 0; i < this.fruitCount; i++) {
			// Calculate the X-coordinate of the fruit (uniform distribution)
			const x = leftWall + spacing * (i + 1);
			const y = this.game.isSindleMode
				? this.area.y
				: this.area.y + (this.dashLineY - this.area.y) / 2; // Top wall inside position

			// Random fruit type (between 0 and 6)
			const fruitType = this.game.mode === 'single' ? 2 + floor(random(2)) : floor(random(4));

			// Create fruit
			const newFruit = new Fruit(fruitType, x, y, 30 + 20 * fruitType, this.scaleVal);

			// Make sure the fruit is in a falling state
			newFruit.isFalling = true;

			// Added to the game
			this.game.fruits.push(newFruit);
		}
	}
}
