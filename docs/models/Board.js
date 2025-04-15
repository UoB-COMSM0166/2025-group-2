import { IncidentManager } from '../core/IncidentManager.js';
import { BombFruit, RainbowFruit } from '../shop/index.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Fruit } from './index.js';

const DISTFROMGAME = 40;
const DISTFROMSHOP = 150;
const KEYBOARD_MOVE_SPEED = 5;
const WAIT_TIMEOUT = 120; // Add wait timeout frames

export class Board {
	constructor(player, area, scaleVal) {
		this.shopArea = area.shop; // { x, y, w, h }
		this.displayArea = area.display; // { x, y, w, h }
		this.leftBoardArea = area.game1; // { x, y, w, h }

		this.gravity = 30;
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

		this.isWaitingForFruitToDrop = false;
		this.lastDroppedFruit = null;
		this.waitTimer = 0; // Add Wait Timer
		this.dashLineY = this.isSingleMode
			? area.dashLine1.y1
			: this.id === 1
			? area.dashLine1.y1
			: area.dashLine2.y1;

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
		// this.incidentBegin();

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
		console.log('incident start');
		this.incidentManager.startIncident();
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

		this.currentFruit.board = this;

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

		this.nextFruit.board = this;
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

		if (this.isWaitingForFruitToDrop) {
			// Increase wait timer to prevent permanent wait
			this.waitTimer++;

			// Check whether lastDropped Fruit is valid
			const fruitExists =
				this.lastDroppedFruit &&
				!this.lastDroppedFruit.removed &&
				this.fruits.includes(this.lastDroppedFruit);

			// Modify here-use the bottom position of the whole fruit instead of the top to judge
			if (!fruitExists) {
				// 如果水果不存在了（可能被合并或移除）
				console.log('重置等待状态: 水果不存在');
				this.isWaitingForFruitToDrop = false;
				this.lastDroppedFruit = null;
				this.waitTimer = 0;
			} else if (this.waitTimer > WAIT_TIMEOUT) {
				// 如果等待时间过长，强制重置
				console.log('重置等待状态: 等待超时');
				this.isWaitingForFruitToDrop = false;
				this.lastDroppedFruit = null;
				this.waitTimer = 0;
			}
			// 使用最严格的条件：水果完全通过dashline
			else if (
				this.lastDroppedFruit.sprite.y - this.lastDroppedFruit.sprite.d / 2 >
				this.dashLineY + 20
			) {
				console.log('重置等待状态: 水果已完全通过dashLine');
				this.isWaitingForFruitToDrop = false;
				this.lastDroppedFruit = null;
				this.waitTimer = 0;
			}
		}

		// Modify the incident code to ensure that the event gets the latest fruits array
		this.incidentManager.game = this; // Ensure incidentManager references the latest Board

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

		// Check if any fruit crosses the line (make sure the end-of-game logic works)
		this.checkFruitOverLine(this.dashLineY);
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

		fruit.board = this;
	}

	// Handle mouse controls (for single mode) - just track position, not dropping
	handleCurrentFruitMouse() {
		// If waiting on a fruit cross line, do not process mouse movement
		if (this.isWaitingForFruitToDrop) return;

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
		// If in wait state, ignore click
		if (this.isWaitingForFruitToDrop) {
			console.log('正在等待上一个水果通过dashline，忽略点击');
			return;
		}
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
		// If waiting on a fruit line, do not process keyboard input
		if (this.isWaitingForFruitToDrop) return;

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
		// If in wait state, ignore keyboard input
		if (this.isWaitingForFruitToDrop && (action === 'player1-drop' || action === 'player2-drop')) {
			console.log('正在等待上一个水果通过dashline，忽略投放操作');
			return;
		}

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

		this.isWaitingForFruitToDrop = true;
		this.lastDroppedFruit = this.currentFruit;
		this.waitTimer = 0; // Reset wait timer

		// Set reference back to Board for fruit
		this.currentFruit.board = this;

		this.currentFruit.startFalling();
		this.fruits.push(this.currentFruit);
		this.currentFruit = null;
	}

	// Handle switching to the next fruit
	handleNextFruit() {
		// If you currently have fruit, do nothing
		if (this.currentFruit) return;

		// If you are waiting for the last fruit to cross the line, do nothing
		if (this.isWaitingForFruitToDrop) {
			// Check if the previous fruit is no longer in the array (removed or merged)
			if (!this.lastDroppedFruit || !this.fruits.includes(this.lastDroppedFruit)) {
				console.log('上一个水果已不存在，允许生成新水果');
				this.isWaitingForFruitToDrop = false;
				this.lastDroppedFruit = null;
				this.waitTimer = 0;
			}
			// Check whether the previous fruit has passed the dashline
			else if (
				this.lastDroppedFruit.sprite.y - this.lastDroppedFruit.sprite.d / 4 >
				this.dashLineY
			) {
				console.log('上一个水果已完全通过dashline，允许生成新水果');
				this.isWaitingForFruitToDrop = false;
				this.lastDroppedFruit = null;
				this.waitTimer = 0;
			}
			// Force reset if wait time is too long
			else if (this.waitTimer > WAIT_TIMEOUT) {
				// Increase wait time, give more time via dashline
				console.log('等待超时，强制允许生成新水果');
				this.isWaitingForFruitToDrop = false;
				this.lastDroppedFruit = null;
				this.waitTimer = 0;
			}

			// If you are still waiting, return directly and no new fruit will be generated.
			if (this.isWaitingForFruitToDrop) {
				return;
			}
		}

		// Timer increments when there is no current fruit
		this.timer++;
		if (this.timer > 10) {
			// Change the next fruit to the current fruit
			this.currentFruit = this.nextFruit;

			if (this.currentFruit) {
				this.currentFruit.board = this;

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
			this.nextFruit.board = this;
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

				// Check if waiting fruit is involved
				const involvesWaitingFruit =
					this.isWaitingForFruitToDrop &&
					(this.lastDroppedFruit === a || this.lastDroppedFruit === b);

				// bomb fruit explpsion
				if (a instanceof BombFruit || b instanceof BombFruit) {
					if (a instanceof BombFruit) a.explode(this);
					if (b instanceof BombFruit) b.explode(this);

					// If the exploding fruit is waiting, reset waiting status
					if (involvesWaitingFruit) {
						this.isWaitingForFruitToDrop = false;
						this.lastDroppedFruit = null;
						this.waitTimer = 0;
					}
					continue;
				}

				// rainbow fruit merging
				if (a instanceof RainbowFruit || b instanceof RainbowFruit) {
					let mergedFruit = RainbowFruit.universalMerge(a, b);
					if (mergedFruit) {
						// Update reference if merge involves fruit in waiting
						if (involvesWaitingFruit) {
							this.lastDroppedFruit = mergedFruit;
							mergedFruit.board = this;

							// Check whether the combined fruit has crossed the line
							if (mergedFruit.sprite.y - mergedFruit.sprite.d / 2 > this.dashLineY + 20) {
								this.isWaitingForFruitToDrop = false;
								this.lastDroppedFruit = null;
								this.waitTimer = 0;
								console.log('合并后的水果已过线，重置等待状态');
							}
						}
						this.processMergedFruit(mergedFruit);
					}
				}

				// normal fruit merging
				if (a.level === b.level) {
					// In two-person mode, merging is not allowed if it is a 9th grade fruit (index 8)
					if (!this.isSingleMode && a.level === 8) {
						continue;
					}

					let mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) {
						// If the merger involves fruit in waiting
						if (involvesWaitingFruit) {
							console.log('合并了等待中的水果，更新引用');
							this.lastDroppedFruit = mergedFruit;
							mergedFruit.board = this;

							// Check whether the combined fruit has crossed the line
							if (mergedFruit.sprite.y - mergedFruit.sprite.d / 2 > this.dashLineY + 20) {
								this.isWaitingForFruitToDrop = false;
								this.lastDroppedFruit = null;
								this.waitTimer = 0;
								console.log('合并后的水果已过线，重置等待状态');
							}
						}
						this.processMergedFruit(mergedFruit);
					}
				}
			}
		}
	}

	processMergedFruit(mergedFruit) {
		mergedFruit.board = this;

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
		// First, check whether all non-safe fruits cross the line
		for (const fruit of this.fruits) {
			// Ignore only the fruit that is waiting and the fruit that is safe
			if (
				(fruit === this.lastDroppedFruit && this.isWaitingForFruitToDrop) ||
				fruit.getSafePeriod() > 0
			) {
				continue;
			}

			const fruitTop = fruit.sprite.y - fruit.sprite.d / 2;
			if (fruitTop <= y) {
				this.uiControllor.drawGameOver(this.gameArea.x + this.gameArea.w / 2, this.gameArea.y - 60);
				console.log('水果越线，游戏结束');

				// Make sure gameManager knows the game is over
				if (this.player && this.player.gameManager) {
					this.player.gameManager.isGameOver = true;
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
		let max = this.isSingleMode ? 9 : 8; //Maximum level 10 (index 9) for single mode and 9 (index 8) for double mode
		let maxLevel = this.getMaxFruitLevel();

		if (maxLevel != max) {
			return false;
		}

		return true;
	}
}
