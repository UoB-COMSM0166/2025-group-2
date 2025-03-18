import { IncidentManager } from '../core/IncidentManager.js';
import { BombFruit, RainbowFruit } from '../shop/index.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Fruit } from './index.js';

const DISTFROMGAME = 40;
const DISTFROMSHOP = 150;
const KEYBOARD_MOVE_SPEED = 5;

export class Board {
	constructor(player, area, scaleVal) {
		this.shopArea = area.shop; // { x, y, w, h }
		this.displayArea = area.display; // { x, y, w, h }

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
		this.isSingleMode = this.player.mode === 'single';
		this.gameArea = this.mode === 'single' ? area.game1 : this.id === 1 ? area.game1 : area.game2;
		this.endLine =
			this.mode === 'single' ? area.dashLine1 : this.id === 1 ? area.dashLine1 : area.dashLine2;

		this.incidentManager = new IncidentManager(this, this.gameArea, this.endLine);
		// this.incidentBegin();

		// Record game start time to prevent accidental clicks
		this.gameStartTime = millis();
		this.GAME_START_PROTECTION = 500;
	}

	incidentBegin() {
		console.log('incident start');
		this.incidentManager.startIncident();
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
			this.isSingleMode || this.id === 2
				? this.shopArea.x + this.shopArea.w / 2
				: this.displayArea.x + this.displayArea.w / 2;

		const nextFruitY =
			this.isSingleMode || this.id === 2
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

		// Debug log to verify fruit positioning
		console.log(
			`Player ${this.id} initial fruit position: x=${this.currentFruit.sprite.x}, y=${this.currentFruit.sprite.y}`
		);
	}

	update() {
		if (this.isSingleMode) {
			this.handleCurrentFruitMouse();
		} else {
			this.handleCurrentFruitKeyboard();
		}

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

	// Handle mouse controls (for single mode) - just track position, not dropping
	handleCurrentFruitMouse() {
		if (this.currentFruit && this.currentFruit?.sprite) {
			let leftBound = this.gameArea.x + this.wallWidth;
			let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;

			// Allow current fruit to move with mouse
			this.currentFruit.moveWithMouse(leftBound, rightBound, this.gameArea.y - DISTFROMGAME);
			this.currentFruit.letFall();
		} else {
			this.handleNextFruit();
		}
	}

	// Handle mouse click for single mode (drop fruit)
	handleMouseClick() {
		// Check if it is within the game protection period
		if (millis() - this.gameStartTime < this.GAME_START_PROTECTION) {
			console.log('Game just started, ignore click');
			return;
		}

		if (!this.currentFruit) return;

		let leftBound = this.gameArea.x + this.wallWidth;
		let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
		let currentMouseX = mouseX / this.scaleVal;

		// Check if mouse is in valid drop area
		if (currentMouseX >= leftBound && currentMouseX <= rightBound) {
			this.dropCurrentFruit();
			console.log('Fruit dropped via mouse click');
		}
	}

	// Handle keyboard controls (for double mode)
	handleCurrentFruitKeyboard() {
		if (this.currentFruit && this.currentFruit?.sprite) {
			// Keep the fruit at the correct height above the dash line
			this.currentFruit.sprite.y = this.gameArea.y - DISTFROMGAME;
			this.currentFruit.letFall();

			// Force velocity to zero to prevent unwanted movement
			this.currentFruit.sprite.vel.y = 0;
		} else {
			this.handleNextFruit();
		}
	}

	// Handle keyboard input for the current fruit
	handleKeyboardInput(action) {
		if (!this.currentFruit || !this.currentFruit?.sprite) return;

		let leftBound = this.gameArea.x + this.wallWidth;
		let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;

		console.log(`Player ${this.id} received action: ${action}`);

		switch (action) {
			case 'player1-left':
				if (this.id === 1) {
					this.moveCurrentFruitLeft(leftBound);
					console.log(`Player 1 fruit moved left: ${this.currentFruit.sprite.x}`);
				}
				break;
			case 'player1-right':
				if (this.id === 1) {
					this.moveCurrentFruitRight(rightBound);
					console.log(`Player 1 fruit moved right: ${this.currentFruit.sprite.x}`);
				}
				break;
			case 'player1-drop':
				if (this.id === 1) {
					this.dropCurrentFruit();
					console.log('Player 1 fruit dropped');
				}
				break;
			case 'player2-left':
				if (this.id === 2) {
					this.moveCurrentFruitLeft(leftBound);
					console.log(`Player 2 fruit moved left: ${this.currentFruit.sprite.x}`);
				}
				break;
			case 'player2-right':
				if (this.id === 2) {
					this.moveCurrentFruitRight(rightBound);
					console.log(`Player 2 fruit moved right: ${this.currentFruit.sprite.x}`);
				}
				break;
			case 'player2-drop':
				if (this.id === 2) {
					this.dropCurrentFruit();
					console.log('Player 2 fruit dropped');
				}
				break;
		}
	}

	// Move the current fruit left
	moveCurrentFruitLeft(leftBound) {
		if (!this.currentFruit) return;

		const newX = this.currentFruit.sprite.x - KEYBOARD_MOVE_SPEED;
		// Make sure the fruit stays within bounds
		this.currentFruit.sprite.x = constrain(
			newX,
			leftBound + this.currentFruit.sprite.d / 2,
			this.currentFruit.sprite.x
		);

		// Reset vertical velocity to prevent gravity from affecting it until dropped
		this.currentFruit.sprite.vel.y = 0;
	}

	// Move the current fruit right
	moveCurrentFruitRight(rightBound) {
		if (!this.currentFruit) return;

		const newX = this.currentFruit.sprite.x + KEYBOARD_MOVE_SPEED;
		// Make sure the fruit stays within bounds
		this.currentFruit.sprite.x = constrain(
			newX,
			this.currentFruit.sprite.x,
			rightBound - this.currentFruit.sprite.d / 2
		);

		// Reset vertical velocity to prevent gravity from affecting it until dropped
		this.currentFruit.sprite.vel.y = 0;
	}

	// Drop the current fruit
	dropCurrentFruit() {
		if (!this.currentFruit) return;

		this.currentFruit.sprite.vel.y = this.gravity;
		this.currentFruit.startFalling();
		this.fruits.push(this.currentFruit);
		this.currentFruit = null;
	}

	// Handle switching to the next fruit
	handleNextFruit() {
		// Timer increments when there is no current fruit
		this.timer++;
		if (this.timer > 10) {
			// Change the next fruit to the current fruit
			this.currentFruit = this.nextFruit;

			if (this.currentFruit) {
				if (this.isSingleMode) {
					// In single player mode, immediately place the fruit at the current mouse position
					let leftBound = this.gameArea.x + this.wallWidth;
					let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
					let scaledMouseX = mouseX / this.scaleVal;

					// Limited to within game boundaries
					let newX = constrain(
						scaledMouseX,
						leftBound + this.currentFruit.sprite.d / 2,
						rightBound - this.currentFruit.sprite.d / 2
					);

					// Set Position Match Mouse Now
					this.currentFruit.sprite.x = newX;
					this.currentFruit.sprite.y = this.gameArea.y - DISTFROMGAME;
				} else {
					// In two-player mode, place in the center of the game area
					this.currentFruit.sprite.x = this.gameArea.x + this.gameArea.w / 2;
					this.currentFruit.sprite.y = this.gameArea.y - DISTFROMGAME;
				}
			}

			// Generate new fruit at the top of the shop area
			let newType = int(random(5));

			const nextFruitX =
				this.isSingleMode || this.id === 2
					? this.shopArea.x + this.shopArea.w / 2 // Default to shop for single mode & Player 2
					: this.displayArea.x + this.displayArea.w / 2; // Player 1 places nextFruit above display

			const nextFruitY =
				this.isSingleMode || this.id === 2
					? this.shopArea.y - DISTFROMSHOP // Default for single mode & Player 2
					: this.displayArea.y - DISTFROMSHOP; // Player 1 places it above display

			this.nextFruit = new Fruit(newType, nextFruitX, nextFruitY, 30 + 20 * newType, this.scaleVal);
			this.nextFruit.doNotFall();
			this.timer = 0;
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
