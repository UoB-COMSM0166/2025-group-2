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
		const buttonWidth = area.w - 3 * padding;

		this.shopItems = this.items.map(item => {
			const labelHTML = `
			<div style="display: flex; justify-content: space-between;">
				<span>${item.icon} ${item.label}</span>
				<span>${item.price} $</span>
			</div>
		`;

			const btn = new Button(labelHTML, () => this.handleToolClick(item.id), {
				getScaleVal: () => this.gameManager.scaleVal,
				bgColor: bgColour,
				textColor: textColour,
				hoverBg: colourAfterClick,
				hoverText: textAfterClick,
				htmlMode: true,
				width: buttonWidth,
			});
			return btn;
		});

		this.listShopItems(this.shopItems, area, padding);
	}

	listShopItems(shopButtons, shopArea, padding) {
		if (shopButtons.length === 0) return;

		const firstBtn = shopButtons[0];
		const buttonHeight = firstBtn.button.elt.offsetHeight;
		const buttonGap = 10;
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

	handleToolClick(type) {
		const player = this.gameManager.player?.[0];
		if (!player) return;

		const item = this.items.find(item => item.id === type);
		if (!item) return;

		player.buyTool(type, item);
	}
}
