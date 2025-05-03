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
				{ id: 'shuffle', label: 'Shuffle', price: 10, effect: 'shuffle', icon: '🔀' },
				{
					id: 'divineShield',
					label: 'Divine Shield',
					price: 15,
					effect: 'divineShield',
					icon: '🛡️',
				},
				{ id: 'doubleScore', label: 'Double Score', price: 20, effect: 'doubleScore', icon: '✨' },
				{ id: 'bombTool', label: 'Bomb', price: 30, effect: 'bombTool', icon: '💣' },
				{ id: 'rainbowTool', label: 'Rainbow', price: 25, effect: 'rainbowTool', icon: '🌈' },
				{ id: 'random', label: 'Random', price: 5, effect: 'randomTool', icon: '❓' },
			];
		} else if (this.gameManager.mode == 'double') {
			this.items = [
				{ id: 'shuffle', label: 'Shuffle', price: 10, effect: 'shuffle', icon: '🔀' },
				{
					id: 'divineShield',
					label: 'Divine Shield',
					price: 15,
					effect: 'divineShield',
					icon: '🛡️',
				},
				{ id: 'doubleScore', label: 'Double Score', price: 20, effect: 'doubleScore', icon: '✨' },
				{ id: 'bombTool', label: 'Bomb', price: 30, effect: 'bombTool', icon: '💣' },
				{ id: 'rainbowTool', label: 'Rainbow', price: 25, effect: 'rainbowTool', icon: '🌈' },
				{ id: 'random', label: 'Random', price: 5, effect: 'randomTool', icon: '❓' },
				{ id: 'Wind', label: 'Strong Wind', price: 10, effect: 'Wind', icon: '💨' },
				{ id: 'Rain', label: 'Heavy Rain', price: 10, effect: 'Rain', icon: '🌧️' },
			];
		}
	}

	setupShopUI(area) {
		const padding = 10;
		const buttonWidth = area.w - 2 * padding;

		this.shopArea = area;

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
				hoverBg: '#F4D8C6',
				hoverText: '#A3785F',
				htmlMode: true,
				width: buttonWidth,
			});

			// Save original position information for later addition of selection indicators
			btn.itemIndex = index;
			return btn;
		});

		this.listShopItems(this.shopItems, area, padding);

		// If it is two-person mode, initialize the selection indicator
		if (this.isDoubleMode) {
			this.updateButtonStyles();
		}
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

	updateAllButtonPositions(shopArea) {
		const padding = 10;
		this.listShopItems(this.shopItems, shopArea, padding);
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
		const player = this.gameManager.player?.[0];
		if (!player) return;

		const item = this.items.find(item => item.id === type);
		if (!item) return;

		player.buyTool(type, item);
	}
}
