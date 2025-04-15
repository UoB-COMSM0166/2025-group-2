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

		this.gravity = 20;
		this.fruits = [];
		this.currentFruit = null;
		this.nextFruit = null;
		this.fallingFruit = null;

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
		this.generateNextFruit();
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
		if (this.fallingFruit && (!this.fallingFruit.sprite || this.fallingFruit.removed)) {
			console.log('检测到无效的fallingFruit，重置状态');
			this.fallingFruit = null;
		}

		if (this.isSingleMode) {
			this.handleCurrentFruitMouse();
		} else {
			this.handleCurrentFruitKeyboard();
		}

		this.updateFallingFruit();

		this.handleMerging();

		this.fruits = this.fruits.filter(fruit => !fruit.removed);

		for (let fruit of this.fruits) {
			fruit.updateState();
		}

		this.incidentManager.game = this;

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

		this.incidentManager.update();

		this.checkFruitOverLine(this.dashLineY);

		this.constrainFruits();
	}

	constrainFruits() {
		for (const fruit of this.fruits) {
			if (fruit.sprite) {
				// Limit fruit to left and right boundaries
				const minX = this.gameArea.x + this.wallWidth + fruit.sprite.d / 2;
				const maxX = this.gameArea.x + this.gameArea.w - this.wallWidth - fruit.sprite.d / 2;

				if (fruit.sprite.x < minX) {
					fruit.sprite.x = minX;
					fruit.sprite.vel.x = 0;
				} else if (fruit.sprite.x > maxX) {
					fruit.sprite.x = maxX;
					fruit.sprite.vel.x = 0;
				}
			}
		}

		// Also deal with falling fruit
		if (this.fallingFruit && this.fallingFruit.sprite) {
			const minX = this.gameArea.x + this.wallWidth + this.fallingFruit.sprite.d / 2;
			const maxX =
				this.gameArea.x + this.gameArea.w - this.wallWidth - this.fallingFruit.sprite.d / 2;

			if (this.fallingFruit.sprite.x < minX) {
				this.fallingFruit.sprite.x = minX;
				this.fallingFruit.sprite.vel.x = 0;
			} else if (this.fallingFruit.sprite.x > maxX) {
				this.fallingFruit.sprite.x = maxX;
				//this.fallingFruit.sprite.vel.x = 0;
			}
		}
	}

	updateFallingFruit() {
		if (!this.fallingFruit) return;

		if (!this.fallingFruit.sprite || this.fallingFruit.removed) {
			console.log('fallingFruit无效，重置状态');
			this.fallingFruit = null;
			return;
		}

		if (this.fallingFruit) {
			// Check if the falling fruit has stabilized
			const isStable = Math.abs(this.fallingFruit.sprite.vel.y) < 0.5;

			// If the fruit is stable or in contact with other fruits, add it to the fruits list
			if (isStable) {
				console.log('下落的水果已稳定，加入水果列表');
				this.fruits.push(this.fallingFruit);
				this.fallingFruit = null;

				// If there is currently no fruit under control, set the next fruit
				if (!this.currentFruit) {
					this.setNextFruitToCurrent();
				}
			}
			// If the fruit has passed the warning line but is not stable, check whether the next fruit can be generated in advance
			else if (
				this.fallingFruit.sprite.y > this.dashLineY + this.fallingFruit.sprite.d / 2 &&
				!this.currentFruit
			) {
				console.log('下落的水果已过线，提前准备下一个水果');
				this.setNextFruitToCurrent();
			}
		}
	}

	// Set the next fruit as the current fruit
	setNextFruitToCurrent() {
		if (!this.nextFruit) return;

		this.currentFruit = this.nextFruit;
		this.currentFruit.board = this;

		// Set fruit location
		const topY = this.gameArea.y;
		const dashLineY = this.dashLineY || topY + 130;
		const currentFruitPosition = (topY + dashLineY) / 2;

		if (this.isSingleMode) {
			// Single player mode: fruit follows mouse
			let leftBound = this.gameArea.x + this.wallWidth;
			let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
			let scaledMouseX = mouseX / this.scaleVal;

			// Limited to within game boundaries
			let newX = constrain(
				scaledMouseX,
				leftBound + this.currentFruit.sprite.d / 2,
				rightBound - this.currentFruit.sprite.d / 2
			);

			this.currentFruit.sprite.x = newX;
			this.currentFruit.sprite.y = currentFruitPosition;
		} else {
			// Double mode: Fruit in the center of the game area
			this.currentFruit.sprite.x = this.gameArea.x + this.gameArea.w / 2;
			this.currentFruit.sprite.y = currentFruitPosition;
		}

		// Make sure the fruit is not affected by gravity
		this.currentFruit.sprite.vel.y = 0;

		// Create new next fruit
		this.generateNextFruit();
	}

	generateNextFruit() {
		let newType = this.getNextFruitLevel();
		let nextFruitX, nextFruitY;

		if (this.isSingleMode) {
			nextFruitX = this.shopArea.x + this.shopArea.w / 2;
			nextFruitY = this.shopArea.y - DISTFROMSHOP;
		} else if (this.id === 1) {
			nextFruitX = this.nextFruitArea.x + this.nextFruitArea.w / 2;
			nextFruitY = this.nextFruitArea.y + this.nextFruitArea.h / 2;
		} else {
			nextFruitX = this.nextFruitArea.x + this.nextFruitArea.w / 2;
			nextFruitY = this.nextFruitArea.y + this.nextFruitArea.h / 2;
		}

		this.nextFruit = new Fruit(newType, nextFruitX, nextFruitY, 30 + 20 * newType, this.scaleVal);

		this.nextFruit.board = this;
		this.nextFruit.doNotFall(); // Make sure nextFruit doesn't fall.
		this.timer = 0;
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
		if (this.currentFruit) {
			this.currentFruit.updateScale(newScale);
		}
		if (this.nextFruit) {
			this.nextFruit.updateScale(newScale);
		}
		if (this.fallingFruit) {
			this.fallingFruit.updateScale(newScale);
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

		// Draw falling fruit
		if (this.fallingFruit && this.fallingFruit.sprite) {
			this.fallingFruit.draw();
		} else if (this.fallingFruit) {
			// If fallingFruit exists but its sprite does not, clear it
			console.log('在draw中发现无效的fallingFruit，重置状态');
			this.fallingFruit = null;
		}
	}

	getCurrentFruits() {
		return this.fruits;
	}

	setCurrentFruit(fruit) {
		if (!fruit?.sprite) return;

		if (this.currentFruit) {
			this.currentFruit.remove();
		}

		this.currentFruit = fruit;
		fruit.board = this;
	}

	// Handle mouse controls (for single mode) - just track position, not dropping
	handleCurrentFruitMouse() {
		// If there is no current fruit, check if it should be set
		if (!this.currentFruit && !this.fallingFruit) {
			if (this.nextFruit) {
				this.setNextFruitToCurrent();
			}
			return;
		}

		// If there is a current fruit, let it follow the mouse
		if (this.currentFruit && this.currentFruit.sprite) {
			const topY = this.gameArea.y;
			const dashLineY = this.dashLineY || topY + 130;
			const currentFruitPosition = (topY + dashLineY) / 2;

			let leftBound = this.gameArea.x + this.wallWidth;
			let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;

			// Allow the current fruit to follow the mouse
			this.currentFruit.moveWithMouse(leftBound, rightBound, currentFruitPosition);

			// Make sure the current fruit does not fall
			this.currentFruit.sprite.vel.y = 0;
		}
	}

	// Handle mouse click for single mode (drop fruit)
	handleMouseClick() {
		console.log('Mouse clicked');

		// Check if it is within the game protection period
		if (millis() - this.gameStartTime < this.GAME_START_PROTECTION) {
			console.log('游戏刚开始，忽略点击');
			return;
		}

		// If there is already falling fruit, ignore the click
		if (this.fallingFruit) {
			if (!this.fallingFruit.sprite || this.fallingFruit.removed) {
				console.log('发现无效的fallingFruit，重置状态');
				this.fallingFruit = null;
			} else {
				console.log('已有水果正在下落，忽略点击');
				return;
			}
		}

		// If there is no current fruit, ignore the click
		if (!this.currentFruit) {
			console.log('没有当前水果可投放');
			return;
		}

		// Check that the mouse is within a valid drop zone
		let leftBound = this.gameArea.x + this.wallWidth;
		let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
		let currentMouseX = mouseX / this.scaleVal;

		if (currentMouseX >= leftBound && currentMouseX <= rightBound) {
			this.dropCurrentFruit();
			console.log('通过鼠标点击投放水果');
		}
	}

	// Handle keyboard controls (for double mode)
	handleCurrentFruitKeyboard() {
		// If there is no current fruit, check if it should be set
		if (!this.currentFruit && !this.fallingFruit) {
			if (this.nextFruit) {
				this.setNextFruitToCurrent();
			}
			return;
		}

		// If there is current fruit, make sure it is at the correct height
		if (this.currentFruit && this.currentFruit.sprite) {
			const topY = this.gameArea.y;
			const dashLineY = this.dashLineY || topY + 130;

			//Keep the fruit at the correct height above the warning line
			this.currentFruit.sprite.y = (topY + dashLineY) / 2;

			// Check for wind event activation
			const windIncident = this.incidentManager.incidents.Wind;
			if (!windIncident || !windIncident.active || windIncident.paused) {
				// If there is no wind event, make sure the fruit does not fall
				this.currentFruit.sprite.vel.y = 0;

				// Gradually reduce horizontal speed to stop fruit moving horizontally
				if (Math.abs(this.currentFruit.sprite.vel.x) > 0.01) {
					this.currentFruit.sprite.vel.x *= 0.9;
				} else {
					this.currentFruit.sprite.vel.x = 0;
				}
			} else {
				// If there is a wind event, only fix vertical speed, allow horizontal speed to remain
				this.currentFruit.sprite.vel.y = 0;

				// Make sure the fruit doesn't go beyond the border.
				this.constrainCurrentFruit();
			}

			// Make sure the fruit doesn't fall.
			this.currentFruit.sprite.vel.y = 0;
		}
	}

	// New method: Make sure currentFruit is within bounds
	constrainCurrentFruit() {
		if (!this.currentFruit || !this.currentFruit.sprite) return;

		const leftBound = this.gameArea.x + this.wallWidth;
		const rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;

		// If the fruit goes beyond the left boundary, correct position and reverse some speed
		if (this.currentFruit.sprite.x < leftBound + this.currentFruit.sprite.d / 2) {
			this.currentFruit.sprite.x = leftBound + this.currentFruit.sprite.d / 2;
			this.currentFruit.sprite.vel.x = Math.abs(this.currentFruit.sprite.vel.x) * 0.5;
		}
		// If the fruit goes beyond the right boundary, correct position and reverse some speed
		else if (this.currentFruit.sprite.x > rightBound - this.currentFruit.sprite.d / 2) {
			this.currentFruit.sprite.x = rightBound - this.currentFruit.sprite.d / 2;
			this.currentFruit.sprite.vel.x = -Math.abs(this.currentFruit.sprite.vel.x) * 0.5;
		}
	}

	// Handle keyboard input for the current fruit
	handleKeyboardInput(action) {
		// If there is already falling fruit, ignore drop operation
		if (this.fallingFruit && (action === 'player1-drop' || action === 'player2-drop')) {
			console.log('已有水果正在下落，忽略投放操作');
			return;
		}

		if (!this.currentFruit || !this.currentFruit.sprite) return;

		const windIncident = this.incidentManager.incidents.Wind;
		const isWindActive = windIncident && windIncident.active && !windIncident.paused;

		const moveSpeed = isWindActive ? KEYBOARD_MOVE_SPEED * 1.5 : KEYBOARD_MOVE_SPEED;

		let leftBound = this.gameArea.x + this.wallWidth;
		let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;

		switch (action) {
			case 'player1-left':
				if (this.id === 1) {
					this.moveCurrentFruitLeft(leftBound, moveSpeed);
					console.log(`Player 1 fruit moved left: ${this.currentFruit.sprite.x}`);
				}
				break;
			case 'player1-right':
				if (this.id === 1) {
					this.moveCurrentFruitRight(rightBound, moveSpeed);
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
					this.moveCurrentFruitLeft(leftBound, moveSpeed);
					console.log(`Player 2 fruit moved left: ${this.currentFruit.sprite.x}`);
				}
				break;
			case 'player2-right':
				if (this.id === 2) {
					this.moveCurrentFruitRight(rightBound, moveSpeed);
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
	moveCurrentFruitLeft(leftBound, speed = 0) {
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

		this.currentFruit.sprite.vel.x = -speed * 0.5;
	}

	// Move the current fruit right
	moveCurrentFruitRight(rightBound, speed = 0) {
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
		this.currentFruit.sprite.vel.x = speed * 0.5;
	}

	// Drop the current fruit
	dropCurrentFruit() {
		if (!this.currentFruit) return;

		// Set the current fruit to falling
		this.fallingFruit = this.currentFruit;
		this.currentFruit = null;

		// Make sure the fruit attributes are correct
		this.fallingFruit.board = this;

		// Start falling fruit.
		this.fallingFruit.startFalling();
		console.log('水果开始下落');
	}

	handleMerging() {
		if (this.fallingFruit) {
			for (let i = 0; i < this.fruits.length; i++) {
				const stableFruit = this.fruits[i];

				// Check if fruit collides
				if (!checkCollision(this.fallingFruit.sprite, stableFruit.sprite)) continue;

				// Skip frozen fruit
				if (this.fallingFruit.isFrozen || stableFruit.isFrozen) continue;

				// Bombs, fruit explosions.
				if (this.fallingFruit instanceof BombFruit || stableFruit instanceof BombFruit) {
					if (this.fallingFruit instanceof BombFruit) this.fallingFruit.explode(this);
					if (stableFruit instanceof BombFruit) stableFruit.explode(this);
					continue;
				}

				// Rainbow Fruit Merge
				if (this.fallingFruit instanceof RainbowFruit || stableFruit instanceof RainbowFruit) {
					let mergedFruit = RainbowFruit.universalMerge(this.fallingFruit, stableFruit);
					if (mergedFruit) {
						// Processing of combined fruit
						this.processMergedFruit(mergedFruit);
						this.fallingFruit = null;
						return;
					}
				}

				// Common fruit merge
				if (this.fallingFruit.level === stableFruit.level) {
					//In double mode, merging is not allowed if it is a 9-level fruit (index 8)
					if (!this.isSingleMode && this.fallingFruit.level === 8) {
						continue;
					}

					let mergedFruit = Fruit.merge(this.fallingFruit, stableFruit);
					if (mergedFruit) {
						// Processing of combined fruit
						this.processMergedFruit(mergedFruit);
						this.fallingFruit = null;
						return;
					}
				}
			}
		}

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
					if (mergedFruit) {
						this.processMergedFruit(mergedFruit);
					}
				}

				// normal fruit merging
				if (a.level === b.level) {
					// 双人模式下，如果是9级水果（索引8），不允许合并
					if (!this.isSingleMode && a.level === 8) {
						continue;
					}

					let mergedFruit = Fruit.merge(a, b);
					if (mergedFruit) {
						this.processMergedFruit(mergedFruit);
					}
				}
			}
		}
	}

	processMergedFruit(mergedFruit) {
		mergedFruit.board = this;

		mergedFruit.sprite.vel.y = 2;

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
		// Track fruit that has crossed the line but is still moving
		if (!this.warningFruits) {
			this.warningFruits = [];
		}

		// 检查新越线的水果
		for (const fruit of this.fruits) {
			// 跳过雨水果的判断，让它们有时间下落
			if (fruit.isRainFruit && Math.abs(fruit.sprite.vel.y) >= 0.2) {
				continue;
			}

			// 检查水果顶部是否超过警戒线
			const fruitTop = fruit.sprite.y - fruit.sprite.d / 2;

			// 如果水果顶部超过警戒线
			if (fruitTop <= y) {
				// 先检查这个水果是否已经在警告列表中
				const isAlreadyWarning = this.warningFruits.some(wf => wf.fruit === fruit);

				if (!isAlreadyWarning) {
					// 判断水果运动状态
					const isMoving =
						Math.abs(fruit.sprite.vel.y) >= 0.2 || Math.abs(fruit.sprite.vel.x) >= 0.2;

					if (isMoving) {
						// 水果正在移动，给它机会滑落，添加到警告列表中
						this.warningFruits.push({
							fruit: fruit,
							warningTime: millis(),
							// 给水果1.5秒的时间滑落
							grace: 1500,
						});
						continue;
					} else {
						// 水果稳定且越线，直接结束游戏
						this.endGame();
						return true;
					}
				}
			}
		}

		// 检查警告列表中的水果
		if (this.warningFruits.length > 0) {
			const currentTime = millis();

			// 过滤出需要保留的警告水果
			const remainingWarnings = [];

			for (const warning of this.warningFruits) {
				// 如果水果已被移除，跳过
				if (!warning.fruit || warning.fruit.removed) {
					continue;
				}

				// 判断水果是否滑落到安全位置
				const fruitTop = warning.fruit.sprite.y - warning.fruit.sprite.d / 2;

				if (fruitTop > y) {
					// 水果已经滑落到安全位置，从警告列表移除
					continue;
				}

				// 计算水果是否还在移动
				const isMoving =
					Math.abs(warning.fruit.sprite.vel.y) >= 0.1 ||
					Math.abs(warning.fruit.sprite.vel.x) >= 0.1;

				// 判断宽限期是否到期
				const timeElapsed = currentTime - warning.warningTime;

				if (timeElapsed >= warning.grace) {
					// 宽限期到期，判断水果状态
					if (!isMoving) {
						// 水果稳定且仍在警戒线上方，游戏结束
						this.endGame();
						return true;
					} else {
						// 水果仍在移动，再给一次机会，刷新计时器
						warning.warningTime = currentTime;
						remainingWarnings.push(warning);
					}
				} else {
					// 宽限期未到，继续等待
					remainingWarnings.push(warning);
				}
			}

			// 更新警告列表
			this.warningFruits = remainingWarnings;
		}

		return false;
	}

	// 新添加的辅助方法：结束游戏
	endGame() {
		this.uiControllor.drawGameOver(this.gameArea.x + this.gameArea.w / 2, this.gameArea.y - 60);
		console.log('水果越线，游戏结束');

		// 确保游戏管理器知道游戏已结束
		if (this.player && this.player.gameManager) {
			this.player.gameManager.isGameOver = true;
		}
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
