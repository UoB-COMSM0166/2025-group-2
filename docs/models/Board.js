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
		this.leftBoardArea = area.game1; // { x, y, w, h }

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

		// Set fruit level range according to game mode
		if (this.isSingleMode) {
			this.minFruitLevel = 2;
			this.maxFruitLevel = 9;

			this.nextFruitMinLevel = this.minFruitLevel;
			this.nextFruitMaxLevel = this.nextFruitMinLevel + 2;
		} else {
			this.minFruitLevel = 0;
			this.maxFruitLevel = 8;

			this.nextFruitMinLevel = this.minFruitLevel;
			this.nextFruitMaxLevel = this.nextFruitMinLevel + 3;
		}

		this.incidentManager = new IncidentManager(this, this.gameArea, this.endLine);

		// Record game start time to prevent accidental clicks
		this.gameStartTime = millis();
		this.GAME_START_PROTECTION = 500;

		if (this.isSingleMode) {
			this.nextFruitArea = this.shopArea;
		} else if (this.id === 1) {
			this.nextFruitArea = area.next1;
		} else {
			this.nextFruitArea = area.next2;
		}
	}

	getNextFruitLevel() {
		// Randomly choose between nextFruitMinLevel to nextFruitMaxLevel
		const levelRange = this.nextFruitMaxLevel - this.nextFruitMinLevel;
		return this.nextFruitMinLevel + int(random(levelRange + 1));
	}

	// Start random incident
	incidentBegin() {
		if (!this.player.gameManager.isGameOver) {
			this.incidentManager.startIncident();
		}
	}

	setup() {
		world.gravity.y = this.gravity;
		const topY = this.gameArea.y;
		const dashLineY = this.dashLineY || topY + 130;

		// Create the first fruit, and put it in the top center of the game area.
		const initialLevel = this.minFruitLevel;
		this.currentFruit = new Fruit(
			initialLevel,
			this.gameArea.x + this.gameArea.w / 2,
			(topY + dashLineY) / 2,
			30 + 20 * initialLevel,
			this.scaleVal
		);
		// Create the next fruit, also using grades within the allowed range
		const nextLevel = this.getNextFruitLevel();
		let nextFruitX, nextFruitY;

		if (this.isSingleMode) {
			nextFruitX = this.shopArea.x + this.shopArea.w / 2;
			nextFruitY = this.shopArea.y - DISTFROMSHOP;
		} else {
			nextFruitX = this.nextFruitArea.x + this.nextFruitArea.w / 2;
			nextFruitY = this.nextFruitArea.y + this.nextFruitArea.h / 2;
		}

		this.nextFruit = new Fruit(
			nextLevel,
			nextFruitX,
			nextFruitY,
			30 + 20 * nextLevel,
			this.scaleVal
		);
		this.nextFruit.doNotFall();

		this.toolManager = this.player.toolManager;
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
			const fog = this.incidentManager.incidents.Fog;
			const fruitTop = fruit.sprite.y - fruit.sprite.d / 2;

			if (fog.active && !fog.paused && fruitTop > this.endLine.y1) {
				fruit.isInFog = true;
				fruit.setColor(66, 84, 84);
			} else {
				fruit.isInFog = false;
				fruit.color = null;
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
		const topY = this.gameArea.y;
		const dashLineY = this.dashLineY || topY + 130;
		const currentFruitPosition = (topY + dashLineY) / 2;
		if (this.currentFruit && this.currentFruit?.sprite) {
			let leftBound = this.gameArea.x + this.wallWidth;
			let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;

			// Allow current fruit to move with mouse
			this.currentFruit.moveWithMouse(leftBound, rightBound, currentFruitPosition);
			this.currentFruit.letFall();
		} else {
			this.handleNextFruit();
		}
	}

	// Handle mouse click for single mode (drop fruit)
	handleMouseClick() {
		// Check if it is within the game protection period
		if (millis() - this.gameStartTime < this.GAME_START_PROTECTION) {
			return;
		}

		if (!this.currentFruit) return;

		let leftBound = this.gameArea.x + this.wallWidth;
		let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
		let currentMouseX = mouseX / this.scaleVal;

		// Check if mouse is in valid drop area
		if (currentMouseX >= leftBound && currentMouseX <= rightBound) {
			this.dropCurrentFruit();
		}
	}

	// Handle keyboard controls (for double mode)
	handleCurrentFruitKeyboard() {
		const topY = this.gameArea.y;
		const dashLineY = this.dashLineY || topY + 130;
		if (this.currentFruit && this.currentFruit?.sprite) {
			// Keep the fruit at the correct height above the dash line
			this.currentFruit.sprite.y = (topY + dashLineY) / 2;
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

		switch (action) {
			case 'player1-left':
				if (this.id === 1) {
					this.moveCurrentFruitLeft(leftBound);
				}
				break;
			case 'player1-right':
				if (this.id === 1) {
					this.moveCurrentFruitRight(rightBound);
				}
				break;
			case 'player1-drop':
				if (this.id === 1) {
					this.dropCurrentFruit();
				}
				break;
			case 'player2-left':
				if (this.id === 2) {
					this.moveCurrentFruitLeft(leftBound);
				}
				break;
			case 'player2-right':
				if (this.id === 2) {
					this.moveCurrentFruitRight(rightBound);
				}
				break;
			case 'player2-drop':
				if (this.id === 2) {
					this.dropCurrentFruit();
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

		this.currentFruit.letFall();
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
				const topY = this.gameArea.y;
				const dashLineY = this.dashLineY || topY + 130;
				const currentFruitPosition = (topY + dashLineY) / 2;
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
					this.currentFruit.sprite.y = currentFruitPosition;
				} else {
					// In two-player mode, place in the center of the game area
					this.currentFruit.sprite.x = this.gameArea.x + this.gameArea.w / 2;
					this.currentFruit.sprite.y = currentFruitPosition;
				}
			}

			// Generate new fruit at the top of the shop area
			let newType = this.getNextFruitLevel();
			let nextFruitX, nextFruitY;

			if (this.isSingleMode) {
				// Single-player mode → above the shop area
				nextFruitX = this.shopArea.x + this.shopArea.w / 2;
				nextFruitY = this.shopArea.y - DISTFROMSHOP;
			} else if (this.id === 1) {
				// Two-player mode P1 → use the next1 area
				nextFruitX = this.nextFruitArea.x + this.nextFruitArea.w / 2;
				nextFruitY = this.nextFruitArea.y + this.nextFruitArea.h / 2;
			} else {
				// Two-player mode P2 → use the next2 area
				nextFruitX = this.nextFruitArea.x + this.nextFruitArea.w / 2;
				nextFruitY = this.nextFruitArea.y + this.nextFruitArea.h / 2;
			}

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
					// In two-person mode, merging is not allowed if it is a 9th grade fruit (index 8)
					if (!this.isSingleMode && a.level === 8) {
						continue;
					}

					let mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) this.processMergedFruit(mergedFruit);
				}
			}
		}
	}

	processMergedFruit(mergedFruit) {
		this.fruits.push(mergedFruit);

		if (typeof mergeSound !== 'undefined') {
			mergeSound.play();
		}

		let scoreLevel = mergedFruit.level;

		if (mergedFruit.fireAffected) {
			this.score.minusScore(scoreLevel);
			return;
		}

		let scoreMultiplier = this.toolManager.tools.doubleScore.doubleScoreActive ? 2 : 1;

		// minus score if the mergedFruit is on fire
		if (mergedFruit.fireAffected) {
			this.score.minusScore(scoreLevel);
		} else {
			this.score.addScore(scoreLevel * scoreMultiplier);

			// Add coin bonus
			// Different gold rewards are offered depending on the level of the fruit
			if (scoreLevel >= 2) {
				// Reward gold starting with Level 2 fruit

				let coinReward;

				// Custom gold reward rules - can be adjusted for game balance

				switch (scoreLevel) {
					case 3:
						coinReward = 1;
						break;
					case 4:
						coinReward = 1;
						break;
					case 5:
						coinReward = 2;
						break;
					case 6:
						coinReward = 2;
						break;
					case 7:
						coinReward = 3;
						break;
					default:
						coinReward = scoreLevel * 2;
				}
				this.player.coin.addCoin(coinReward);
				this.player.updateCoin();
			}
		}
	}

	checkFruitOverLine(y) {
		for (const fruit of this.fruits) {
			if (fruit.getState() !== Fruit.STATE.FALLING || fruit.getSafePeriod() > 0) continue;

			const fruitTop = fruit.sprite.y - fruit.sprite.d / 2;
			if (fruitTop <= y) {
				if (this.mode == 'single') {
					this.uiControllor.drawGameOver(
						this.gameArea.x + this.gameArea.w / 2,
						this.gameArea.y - 60
					);
				}
				return true;
			}
		}
		return false;
	}

	getMaxFruitLevel() {
		let maxLevel = 0;
		// We check all the fruits and check the highest level
		this.fruits.forEach(fruit => {
			if (fruit.level > maxLevel) {
				maxLevel = fruit.level;
			}
		});

		// You can also verify currentFruit y nextFruit if neccessary
		if (this.currentFruit && this.currentFruit.level > maxLevel) {
			maxLevel = this.currentFruit.level;
		}
		if (this.nextFruit && this.nextFruit.level > maxLevel) {
			maxLevel = this.nextFruit.level;
		}
		return maxLevel;
	}

	checkFruitIsMaximun() {
		//define max level
		let max = 8;
		let maxLevel = this.getMaxFruitLevel();

		if (maxLevel != max) {
			return false;
		}

		return true;
	}

	reset() {
		// Clear fruits
		this.fruits.forEach(fruit => fruit.remove?.());
		this.fruits = [];

		// Remove current and next fruits
		this.currentFruit?.remove?.();
		this.nextFruit?.remove?.();
		this.currentFruit = null;
		this.nextFruit = null;

		// Reset gravity
		world.gravity.y = this.gravity;

		// Reset timer
		this.timer = 0;

		// Stop all incidents
		this.incidentManager?.reset();

		// Re-setup board (new fruits etc.)
		this.setup();
	}
}
