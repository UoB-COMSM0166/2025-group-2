import { Button } from '../models/index.js';

export class Shop {
	constructor(UIController, gameManager) {
		this.gameManager = gameManager;
		this.UIController = UIController;
		this.scaleVal = gameManager.scaleVal;
		this.shopItems = [];
		this.isDoubleMode = gameManager.mode === 'double';

		// Add selection system for two-person mode
		this.player1Selection = 0;
		this.player2Selection = 0;

		this.useGameIndicators = true;

		// Save button color settings to toggle between checked/unchecked states
		this.normalBgColor = '#E5C3A6';
		this.selectedBgColor = '#D5A682'; // Darker background when selected
		this.normalTextColor = '#6B4F3F';
		this.selectedTextColor = '#3D2E25'; // Darker text when selected

		if (this.gameManager.mode == 'single') {
			this.items = [
				{ id: 'random', label: 'Random', price: 5, effect: 'randomTool', icon: '❓' },
				{ id: 'shuffle', label: 'Shuffle', price: 10, effect: 'shuffle', icon: '🔀' },
				{
					id: 'divineShield',
					label: 'Divine Shield',
					price: 15,
					effect: 'divineShield',
					icon: '🛡️',
				},
				{ id: 'doubleScore', label: 'Double Score', price: 20, effect: 'doubleScore', icon: '✨' },
				{ id: 'rainbowTool', label: 'Rainbow', price: 1, effect: 'rainbowTool', icon: '🌈' },
				{ id: 'bombTool', label: 'Bomb', price: 1, effect: 'bombTool', icon: '💣' },
			];
		} else if (this.gameManager.mode == 'double') {
			this.items = [
				{ id: 'random', label: 'Random', price: 5, effect: 'randomTool', icon: '❓' },
				{ id: 'shuffle', label: 'Shuffle', price: 10, effect: 'shuffle', icon: '🔀' },
				{
					id: 'divineShield',
					label: 'Divine Shield',
					price: 15,
					effect: 'divineShield',
					icon: '🛡️',
				},
				{ id: 'doubleScore', label: 'Double Score', price: 20, effect: 'doubleScore', icon: '✨' },
				{ id: 'rainbowTool', label: 'Rainbow', price: 1, effect: 'rainbowTool', icon: '🌈' },
				{ id: 'bombTool', label: 'Bomb', price: 1, effect: 'bombTool', icon: '💣' },

				{ id: 'Wind', label: 'Strong Wind', price: 10, effect: 'Wind', icon: '💨' },
				{ id: 'Rain', label: 'Heavy Rain', price: 10, effect: 'Rain', icon: '🌧️' },
			];
		}

		this.lastAffordabilityCheck = 0;
		this.affordabilityCheckInterval = 250;

		this.affordabilityStatus = {
			player1: {},
			player2: {},
		};
	}

	setupShopUI(area) {
		const padding = 20;

		const buttonWidth = area.w - padding * 2;

		this.shopArea = area;
		this.buttonWidth = buttonWidth;

		this.shopItems = this.items.map((item, index) => {
			// Create a label with a player selection indicator
			const labelHTML = `
					<div style="display: flex; justify-content: space-between;">
							<span>${item.icon} ${item.label}</span>
							<span>${item.price} $</span>
					</div>
			`;

			const btn = new Button(labelHTML, () => this.handleToolClick(item.id), {
				getScaleVal: () => this.gameManager.scaleVal,
				id: item.id,
				bgColor: this.normalBgColor,
				textColor: this.normalTextColor,
				hoverBg: this.isDoubleMode ? this.normalBgColor : '#F4D8C6',
				hoverText: this.isDoubleMode ? this.normalTextColor : '#A3785F',
				htmlMode: true,
				width: buttonWidth,
			});

			// Save original position information for later addition of selection indicators
			btn.itemIndex = index;
			btn.item = item;
			return btn;
		});

		this.listShopItems(this.shopItems, area, padding);

		// If it is two-person mode, initialize the selection indicator
		if (this.isDoubleMode) {
			this.updateButtonStyles();
		}
	}

	drawAffordabilityIndicators() {
		// 首先检查是否有商店区域信息
		if (!this.shopArea) return;

		// 更新可购买状态
		this.updateAffordabilityStatus();

		push();

		// 设置文本样式
		textSize(16);
		textStyle(BOLD);
		textAlign(CENTER, CENTER);
		strokeWeight(1.5);

		// 遍历所有商店项目
		this.shopItems.forEach((btn, index) => {
			if (!btn || !btn.item) return;

			const itemId = btn.item.id;

			// 使用按钮的垂直位置，但水平位置相对于shopArea
			const btnX = btn.x;
			const btnY = btn.y;
			const btnHeight = btn.button.height;
			const btnWidth = this.buttonWidth || btn.button.width;

			const leftIndicatorX = btnX - 10; // 左侧指示器X坐标
			const rightIndicatorX = btnX + btnWidth + 10; // 右侧指示器X坐标
			const indicatorY = btnY + btnHeight + 15;

			if (this.isDoubleMode) {
				// 双人模式

				// 玩家1状态（左侧）
				const player1CanAfford = this.affordabilityStatus.player1[itemId] || false;
				fill(player1CanAfford ? '#4CAF50' : '#F44336'); // 绿色或红色
				stroke(255); // 白色描边增加可见性
				// 在商店区域左侧放置玩家1指示器
				text(player1CanAfford ? '✓' : '✗', leftIndicatorX, indicatorY);

				// 玩家2状态（右侧）
				const player2CanAfford = this.affordabilityStatus.player2[itemId] || false;
				fill(player2CanAfford ? '#4CAF50' : '#F44336');
				stroke(255);
				// 在商店区域右侧放置玩家2指示器
				text(player2CanAfford ? '✓' : '✗', rightIndicatorX, indicatorY);
			} else {
				console.log('placing price indicator');
				// 单人模式
				const playerCanAfford = this.affordabilityStatus.player1[itemId] || false;
				fill(playerCanAfford ? '#4CAF50' : '#F44336');
				stroke(255);
				// 在商店区域右侧放置指示器
				text(playerCanAfford ? '✓' : '✗', rightIndicatorX, indicatorY);
			}
		});

		pop();
	}

	updateAffordabilityStatus() {
		// 检查是否需要更新（基于时间间隔）
		const currentTime = millis();
		if (currentTime - this.lastAffordabilityCheck < this.affordabilityCheckInterval) {
			return; // 如果间隔太短，跳过更新
		}

		this.lastAffordabilityCheck = currentTime;

		// 获取玩家信息
		const players = this.gameManager.player;
		if (!players || !players.length) return;

		// 确保affordabilityStatus对象已初始化
		if (!this.affordabilityStatus) {
			this.affordabilityStatus = {
				player1: {},
				player2: {},
			};
		}

		// 更新每个物品的可购买状态
		this.items.forEach(item => {
			// 玩家1（单人或双人模式）
			if (players[0] && players[0].coin) {
				// 显式检查是否是单人模式，以确保在单人模式下也更新状态
				const canAfford = players[0].coin.canAfford(item.price);
				this.affordabilityStatus.player1[item.id] = canAfford;
			}

			// 玩家2（仅双人模式）
			if (this.isDoubleMode && players.length > 1 && players[1] && players[1].coin) {
				this.affordabilityStatus.player2[item.id] = players[1].coin.canAfford(item.price);
			}
		});
	}

	// Update button style to reflect current selection
	updateButtonStyles() {
		this.shopItems.forEach((btn, index) => {
			// Determines if this button is selected
			const isSelectedByP1 = index === this.player1Selection;
			const isSelectedByP2 = index === this.player2Selection;

			// Update Button Style
			if (isSelectedByP1 || isSelectedByP2) {
				btn.setStyle({
					bgColor: this.selectedBgColor,
					textColor: this.selectedTextColor,
				});
			} else {
				btn.setStyle({
					bgColor: this.normalBgColor,
					textColor: this.normalTextColor,
				});
			}
		});
	}

	drawSelectionIndicators() {
		if (!this.isDoubleMode || this.gameManager.isTutorialMode) return;

		push();
		textSize(15);
		textStyle(BOLD);

		// Draw Player 1 indicator (left)
		if (this.player1Selection >= 0 && this.player1Selection < this.shopItems.length) {
			const selectedButton = this.shopItems[this.player1Selection];
			if (selectedButton) {
				// Set to right alignment, ensuring that text is right aligned to the specified position
				textAlign(LEFT, TOP);

				// Place the indicator near the edge of the store area, leaving only 2 pixels apart
				//const xPos = this.shopArea.x - 2;
				const xPos = selectedButton.x - 2;

				// Make sure the y position is aligned with the button centerline
				//const yPos = selectedButton.y + 20;
				const yPos = selectedButton.y - 15;

				// First draw a small background shadow to enhance visibility
				fill(0, 0, 0, 80);
				noStroke();
				text('P1 ▼', xPos + 1, yPos + 1);

				fill('#FF5252'); // red
				stroke('#FFFFFF'); // White stroke
				strokeWeight(0.5); // fine stroke
				// Draw P1 indicator
				text('P1 ▼', xPos, yPos);
			}
		}

		// Draw Player 2's indicator (right)
		if (this.player2Selection >= 0 && this.player2Selection < this.shopItems.length) {
			const selectedButton = this.shopItems[this.player2Selection];
			if (selectedButton) {
				textAlign(RIGHT, TOP);

				// const xPos = this.shopArea.x + this.shopArea.w + 2;
				const xPos = selectedButton.x + selectedButton.button.width + 2;

				// const yPos = selectedButton.y + 20;
				const yPos = selectedButton.y - 15;

				fill(0, 0, 0, 80);
				noStroke();
				text('P2 ▼', xPos + 1, yPos + 1);

				fill('#2196F3'); // blue
				stroke('#FFFFFF');
				strokeWeight(0.5);
				text('P2 ▼', xPos, yPos);
			}
		}
		pop();
	}

	resetIndicators(area) {
		this.player1Selection = 0;
		this.player2Selection = 0;

		// Update Button Style
		this.updateButtonStyles();
	}

	listShopItems(shopButtons, shopArea, padding) {
		if (shopButtons.length === 0) return;

		const firstBtn = shopButtons[0];
		const buttonHeight = firstBtn.button.elt.offsetHeight;
		const buttonGap = 15;
		const totalHeight = shopButtons.length * (buttonHeight + buttonGap) - buttonGap;

		const startY = shopArea.y + (shopArea.h - totalHeight) / 2;
		const x = shopArea.x + padding;

		shopButtons.forEach((btn, i) => {
			const y = startY + i * (buttonHeight + buttonGap);
			btn.setPosition(x, y);
		});
	}

	// Player 1 Browse Store Items
	player1Browse(direction) {
		if (!this.isDoubleMode) return;

		// Browse items up/down
		if (direction === 'next') {
			this.player1Selection = (this.player1Selection + 1) % this.shopItems.length;
		} else if (direction === 'prev') {
			this.player1Selection =
				(this.player1Selection - 1 + this.shopItems.length) % this.shopItems.length;
		}

		this.updateButtonStyles();
	}

	player2Browse(direction) {
		if (!this.isDoubleMode) return;

		if (direction === 'next') {
			this.player2Selection = (this.player2Selection + 1) % this.shopItems.length;
		} else if (direction === 'prev') {
			this.player2Selection =
				(this.player2Selection - 1 + this.shopItems.length) % this.shopItems.length;
		}

		this.updateButtonStyles();
	}

	// Player 1 buys the currently selected item
	player1Buy() {
		if (!this.isDoubleMode) return;

		const selectedItem = this.items[this.player1Selection];
		if (selectedItem) {
			const player = this.gameManager.player?.[0];
			if (player) {
				// Check if the player has enough gold coins
				if (player.coin.canAfford(selectedItem.price)) {
					player.buyTool(selectedItem.id, selectedItem);
					// Note: The player.buyTool method internally reduces player coins and updates the UI
				} else {
					// Display prompt message (if insufficient coins)
					this.gameManager.uiManager.notificationManager.addNotification(
						`Player 1 needs ${selectedItem.price} coins to buy ${selectedItem.label}`
					);
				}
			}
		}
	}

	player2Buy() {
		if (!this.isDoubleMode) return;

		const selectedItem = this.items[this.player2Selection];
		if (selectedItem) {
			const player = this.gameManager.player?.[1];
			if (player) {
				// Check if the player has enough gold coins
				if (player.coin.canAfford(selectedItem.price)) {
					player.buyTool(selectedItem.id, selectedItem);
				} else {
					this.gameManager.uiManager.notificationManager.addNotification(
						`Player 2 needs ${selectedItem.price} coins to buy ${selectedItem.label}`
					);
				}
			}
		}
	}

	handleToolClick(type) {
		if (this.isDoubleMode) {
			return; // Go back directly, do nothing
		}

		const player = this.gameManager.player?.[0];
		if (!player) return;

		const item = this.items.find(item => item.id === type);
		if (!item) return;

		player.buyTool(type, item);
	}

	draw() {
		// 首先更新可购买状态
		this.updateAffordabilityStatus();
		this.drawAffordabilityIndicators();

		// 根据游戏模式绘制不同的指示器
		if (this.isDoubleMode) {
			// 双人模式下绘制选择指示器
			this.drawSelectionIndicators();
		}
	}
}
