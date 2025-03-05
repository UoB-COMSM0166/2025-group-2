import { IncidentManager } from '../core/IncidentManager.js';
import { BombFruit, RainbowFruit } from '../shop/index.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Fruit } from './index.js';

const DISTFROMGAME = 40;
const DISTFROMSHOP = 150;

export class Board {
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

		this.incidentManager = new IncidentManager(this, this.gameArea);
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
				? this.shopArea.x + this.shopArea.w / 2
				: this.displayArea.x + this.displayArea.w / 2;

		const nextFruitY =
			this.mode === 'single' || this.id === 2
				? this.shopArea.y - DISTFROMSHOP
				: this.displayArea.y - DISTFROMSHOP;

		this.nextFruit = new Fruit(newType, nextFruitX, nextFruitY, 30 + 20 * newType, this.scaleVal);
		this.nextFruit.doNotFall();

		this.toolManager = this.player.toolManager;

		// incident button have to remove after Jimmy do the random effect
		// start here
		let buttons = [
			{ label: 'Wind Incident', type: 'Wind' },
			{ label: 'Fog Incident', type: 'Fog' },
			{ label: 'Freeze Incident', type: 'Freeze' },
			{ label: 'Fire Incident', type: 'Fire' },
			{ label: 'Rain Incident', type: 'Rain' },
		];

		let startY = 100;
		let spacing = 50;

		buttons.forEach((btn, index) => {
			let button = createButton(btn.label);
			button.position(50, startY + index * spacing);
			button.mousePressed(() => this.incidentManager.activateIncident(btn.type));
		});

		// end here
	}

	update() {
		this.handleCurrentFruit();
		this.handleMerging();

		this.fruits = this.fruits.filter(fruit => !fruit.removed);
		this.fruits.forEach(fruit => {
			//check if the fruit is in fog
			if (this.incidentManager.incidents.Fog.active && fruit.sprite.y > 200) {
				fruit.isInFog = true;
				fruit.setColor(66, 84, 84);
			} else {
				// Si quieres restaurar el color original de la fruta cuando no está bajo la niebla
				fruit.isInFog = false; // Marcar como dentro de la niebla
			}
			if (fruit instanceof BombFruit) {
				fruit.checkCollision(this);
			}
		});

		for (let fruit of this.fruits) {
			fruit.updateState();
		}
		this.incidentManager.update();
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

		if (this.currentFruit && this.currentFruit?.sprite) {
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
					let mergedFruit = RainbowFruit.universalMerge(a, b);
					if (mergedFruit) this.processMergedFruit(mergedFruit);
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

	processMergedFruit(mergedFruit) {
		this.fruits.push(mergedFruit);

		let scoreLevel = mergedFruit.level;

		if (mergedFruit.fireAffected) {
			this.score.minusScore(scoreLevel);
			return;
		}

		let scoreMultiplier = this.toolManager.tools.doubleScore.doubleScoreActive ? 2 : 1;

		// 如果 `mergedFruit` 被火焰影響，則扣分
		if (mergedFruit.fireAffected) {
			this.score.minusScore(scoreLevel);
		} else {
			this.score.addScore(scoreLevel * scoreMultiplier);
		}
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
