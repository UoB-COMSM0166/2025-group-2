import { IncidentManager } from '../core/IncidentManager.js';
import { BombFruit, RainbowFruit } from '../shop/index.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Fruit } from './index.js';

const DISTFROMGAME = 40;
const DISTFROMSHOP = 150;

export class FruitBoard {
	constructor(player, gameArea, shopArea, displayArea, scaleVal) {
		this.gameArea = gameArea; // { x, y, w, h }
		this.shopArea = shopArea; // { x, y, w, h }
		this.displayArea = displayArea; // { x, y, w, h }
		this.gravity = 15;
		this.fruits = [];
		this.currentFruit = null;
		this.nextFruit = null;
		this.timer = 0;
		this.scaleVal = scaleVal;
		this.wallWidth = 10;
		this.player = player;
		this.score = this.player.score;
		this.toolManager = null;
		this.uiControllor = this.player.uiControllor;
		this.mode = this.player.mode;
		this.id = this.player.id;
		this.incidentManager = new IncidentManager(this);

		let windButton = createButton('Wind Incident');
		windButton.mousePressed(() => this.incidentManager.activateIncident('wind'));

		let fogButton = createButton('Fog Incident');
		fogButton.mousePressed(() => this.incidentManager.activateIncident('fog'));

		let freezeButton = createButton('Freeze Incident');
		freezeButton.mousePressed(() => this.incidentManager.activateIncident('freeze'));

		let fireButton = createButton('Fire Incident');
		fireButton.mousePressed(() => this.incidentManager.activateIncident('fire'));

		let rainButton = createButton('Rain Incident');
		rainButton.mousePressed(() => this.incidentManager.activateIncident('rain'));
	}

	setup() {
		world.gravity.y = this.gravity;

		// Create the first fruit, and put it in the top center of the game area.
		this.currentFruit = new Fruit(
			0,
			this.gameArea.x + this.gameArea.w / 2,
			this.gameArea.y - DISTFROMGAME,
			30,
			this.scaleVal
		);
		let newType = int(random(4));

		const nextFruitX =
			this.mode === 'single' || this.id === 2
				? this.shopArea.x + this.shopArea.w / 2 // Default to shop for single mode & Player 2
				: this.displayArea.x + this.displayArea.w / 2; // Player 1 places nextFruit above display

		const nextFruitY =
			this.mode === 'single' || this.id === 2
				? this.shopArea.y - DISTFROMSHOP // Default for single mode & Player 2
				: this.displayArea.y - DISTFROMSHOP; // Player 1 places it above display

		this.nextFruit = new Fruit(newType, nextFruitX, nextFruitY, 30 + 20 * newType, this.scaleVal);
		this.nextFruit.doNotFall();

		this.toolManager = this.player.toolManager;
	}

	update() {
		// Update current fruit and handle falls
		this.handleCurrentFruit();
		// Detect collisions and mergers between fruits
		this.handleMerging();
		// Filter out fruits that have been marked removed
		this.fruits = this.fruits.filter(fruit => !fruit.removed);
		for (let fruit of this.fruits) {
			fruit.updateState();
		}
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		if (this.currentFruit) {
			this.currentFruit.updateScale(newScale);
		}
		if (this.nextFruit) {
			this.nextFruit.updateScale(newScale);
		}
		for (let fruit of this.fruits) {
			fruit.updateScale(newScale);
		}
	}

	draw() {
		// Draw placed fruit
		for (let fruit of this.fruits) {
			fruit.draw();
		}
	}

	getCurrentFruits() {
		return this.fruits;
	}

	setCurrentFruit(fruit) {
		if (!fruit?.sprite) return;

		this.currentFruit?.remove?.();

		this.currentFruit = fruit;
	}

	handleCurrentFruit() {
		let leftBound = this.gameArea.x + this.wallWidth;
		let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
		let topBound = this.gameArea.y + this.gameArea.h;
		let currentMouseX = mouseX / this.scaleVal;
		let currentMouseY = mouseY / this.scaleVal;

		if (this.currentFruit && this.currentFruit.sprite) {
			// allow current fruit move with mouse
			this.currentFruit.moveWithMouse(leftBound, rightBound, this.gameArea.y - DISTFROMGAME);
			this.currentFruit.letFall();
		} else {
			// Timer increments when there is no current fruit
			this.timer++;
			if (this.timer > 10) {
				// Change the next fruit to the current fruit
				this.currentFruit = this.nextFruit;
				// Generate new fruit at the top of the shop area
				let newType = int(random(5));

				const nextFruitX =
					this.mode === 'single' || this.id === 2
						? this.shopArea.x + this.shopArea.w / 2 // Default to shop for single mode & Player 2
						: this.displayArea.x + this.displayArea.w / 2; // Player 1 places nextFruit above display

				const nextFruitY =
					this.mode === 'single' || this.id === 2
						? this.shopArea.y - DISTFROMSHOP // Default for single mode & Player 2
						: this.displayArea.y - DISTFROMSHOP; // Player 1 places it above display
				this.nextFruit = new Fruit(
					newType,
					nextFruitX,
					nextFruitY,
					30 + 20 * newType,
					this.scaleVal
				);
				this.nextFruit.doNotFall();
				this.timer = 0;
			}
		}
		// When the mouse is pressed, put the current fruit into the fruits array and clear currentFruit
		if (
			mouseIsPressed &&
			this.currentFruit &&
			this.currentFruit.getXPosition() < rightBound &&
			this.currentFruit.getXPosition() > leftBound &&
			currentMouseX < rightBound &&
			currentMouseX > leftBound &&
			currentMouseY < topBound
		) {
			this.currentFruit.sprite.vel.y = this.gravity;
			this.currentFruit.startFalling();
			this.fruits.push(this.currentFruit);
			this.currentFruit = null;
		}
	}

	handleMerging() {
		for (let i = 0; i < this.fruits.length; i++) {
			for (let j = i + 1; j < this.fruits.length; j++) {
				const a = this.fruits[i];
				const b = this.fruits[j];

				// Check if the fruits are colliding
				if (!checkCollision(a.sprite, b.sprite)) continue;

				// Skip merging if either fruit is frozen
				if (a.isFrozen || b.isFrozen) continue;

				// bomb fruit explpsion
				if (a instanceof BombFruit || b instanceof BombFruit) {
					if (a instanceof BombFruit) a.explode(this);
					if (b instanceof BombFruit) b.explode(this);
					continue;
				}

				// rainbow fruit merging
				if (a instanceof RainbowFruit || b instanceof RainbowFruit) {
					let normalFruit = a instanceof RainbowFruit ? b : a;
					let mergedFruit = RainbowFruit.universalMerge(a, b);
					if (mergedFruit) this.processMergedFruit(mergedFruit, normalFruit.level);
					continue;
				}

				// normal fruit merging
				if (a.level === b.level) {
					let mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) this.processMergedFruit(mergedFruit);
				}
			}
		}
	}

	processMergedFruit(mergedFruit, originalFruitLevel) {
		this.fruits.push(mergedFruit);

		/**
    if (this.toolManager.tools.doubleScore.doubleScoreActive && a.fireAffected === false && b.fireAffected === false) {
			this.score.addScore(mergedFruit.i * 2);
		}
		else if(a.fireAffected || b.fireAffected){
			this.score.minusScore(mergedFruit.i);
		}
		else {
			this.score.addScore(mergedFruit.i);
		}
 *
 */
		let scoreMultiplier = this.toolManager.tools.doubleScore.doubleScoreActive ? 2 : 1;
		let scoreLevel = originalFruitLevel !== undefined ? originalFruitLevel : mergedFruit.level;

		this.score.addScore(scoreLevel * scoreMultiplier);
	}

	checkFruitOverLine(y) {
		for (const fruit of this.fruits) {
			if (fruit.getState() !== Fruit.STATE.FALLING || fruit.getSafePeriod() > 0) continue;

			const fruitTop = fruit.sprite.y - fruit.sprite.d / 2;
			if (fruitTop <= y) {
				this.uiControllor.drawGameOver(this.gameArea.x + this.gameArea.w / 2, this.gameArea.y - 60);
				return true;
			}
		}
		return false;
	}
}
