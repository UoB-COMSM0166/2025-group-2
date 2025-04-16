import { Button } from '../models/index.js';

const bgColour = '#E5C3A6';
const colourAfterClick = '#F4D8C6';
const textColour = '#6B4F3F';
const textAfterClick = '#A3785F';

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

		// Save button color settings to toggle between checked/unchecked states
		this.normalBgColor = '#E5C3A6';
		this.selectedBgColor = '#D5A682'; // Darker background when selected
		this.normalTextColor = '#6B4F3F';
		this.selectedTextColor = '#3D2E25'; // Darker text when selected

		this.items = [
			{ id: 'shuffle', label: 'Shuffle', price: 10, effect: 'shuffle', icon: '🔀' },
			{ id: 'divineShield', label: 'Divine Shield', price: 15, effect: 'divineShield', icon: '🛡️' },
			{ id: 'doubleScore', label: 'Double Score', price: 20, effect: 'doubleScore', icon: '✨' },
			{ id: 'bombTool', label: 'Bomb', price: 30, effect: 'bombTool', icon: '💣' },
			{ id: 'rainbowTool', label: 'Rainbow', price: 25, effect: 'rainbowTool', icon: '🌈' },
			{ id: 'random', label: 'Random', price: 5, effect: 'randomTool', icon: '❓' },
		];
	}

	setupShopUI(area) {
		const padding = 10;
		const buttonWidth = area.w - 2 * padding;

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
			this.initSelectionIndicators(area);
			this.updateButtonStyles();
		}
	}

	// Initialize player selection indicators
	initSelectionIndicators(area) {
		// Create a selection indicator for Player 1
		this.player1Indicator = document.createElement('div');
		this.player1Indicator.innerHTML = 'P1 ◀';
		this.player1Indicator.style.position = 'absolute';
		this.player1Indicator.style.color = '#FF5252';
		this.player1Indicator.style.fontWeight = 'bold';
		this.player1Indicator.style.fontSize = '16px';
		this.player1Indicator.style.pointerEvents = 'none'; // Prevent interference clicks
		document.body.appendChild(this.player1Indicator);

		//
		this.player2Indicator = document.createElement('div');
		this.player2Indicator.innerHTML = '▶ P2';
		this.player2Indicator.style.position = 'absolute';
		this.player2Indicator.style.color = '#2196F3';
		this.player2Indicator.style.fontWeight = 'bold';
		this.player2Indicator.style.fontSize = '16px';
		this.player2Indicator.style.pointerEvents = 'none';
		document.body.appendChild(this.player2Indicator);

		// Update indicator position
		this.updateIndicatorPositions();
	}

	updateIndicatorPositions() {
		if (!this.isDoubleMode || !this.player1Indicator || !this.player2Indicator) return;

		const canvas = document.querySelector('canvas');
		if (!canvas) return;
		const canvasRect = canvas.getBoundingClientRect();
		const scale = this.gameManager.scaleVal || 1;

		// Gets the position of the currently selected button
		const player1Button = this.shopItems[this.player1Selection];
		const player2Button = this.shopItems[this.player2Selection];

		if (player1Button && player1Button.button) {
			const btnRect = player1Button.button.elt.getBoundingClientRect();
			this.player1Indicator.style.left = btnRect.left - 40 + 'px';
			this.player1Indicator.style.top = btnRect.top + btnRect.height / 2 - 8 + 'px';
			this.player1Indicator.style.transform = `scale(${scale})`;
		}

		if (player2Button && player2Button.button) {
			const btnRect = player2Button.button.elt.getBoundingClientRect();
			this.player2Indicator.style.left = btnRect.right + 5 + 'px';
			this.player2Indicator.style.top = btnRect.top + btnRect.height / 2 - 8 + 'px';
			this.player2Indicator.style.transform = `scale(${scale})`;
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

		this.updateIndicatorPositions();
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

		if (this.isDoubleMode) {
			this.updateIndicatorPositions();
		}
	}

	// Player 1 Browse Store Items
	player1Browse(direction) {
		if (!this.isDoubleMode) return;

		// Browse items up/down
		if (direction === 'next') {
			this.player1Selection = (this.player1Selection + 1) % this.shopItems.length;
		} else {
			this.player1Selection =
				(this.player1Selection - 1 + this.shopItems.length) % this.shopItems.length;
		}

		this.updateButtonStyles();
	}

	player2Browse(direction) {
		if (!this.isDoubleMode) return;

		if (direction === 'next') {
			this.player2Selection = (this.player2Selection + 1) % this.shopItems.length;
		} else {
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
