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
		const shopTextSize = 20;

		// 產生每個道具的按鈕
		this.shopItems = this.items.map(item => {
			const label = `${item.icon} ${item.label} ${item.price} $`;
			this.UIController.createLabel(item.id, 0, 0, label, textColour, shopTextSize, bgColour);
			return this.UIController.labels[item.id];
		});

		// 取得 UI 內的所有 shopItem
		this.listShopItems(this.shopItems, area);
	}

	listShopItems(shopItems, shopArea) {
		if (shopItems.length === 0) return;
		let maxWidth = Math.max(...shopItems.map(label => label.w));
		let maxHeight = Math.max(...shopItems.map(label => label.h));

		let gap = 10;
		let cellWidth = maxWidth + gap;
		let cellHeight = maxHeight + gap;

		// Calculate the max column numbers
		let cols = floor(shopArea.w / cellWidth);
		if (cols < 1) cols = 1;
		let rows = ceil(shopItems.length / cols);

		// Calculate margin center the shopItems
		let totalGridWidth = cols * cellWidth;
		let totalGridHeight = rows * cellHeight;
		let offsetX = shopArea.x + (shopArea.w - totalGridWidth) / 2;
		let offsetY = shopArea.y + (shopArea.h - totalGridHeight) / 2;

		shopItems.forEach((label, i) => {
			let row = floor(i / cols);
			let col = i % cols;
			let centerX = offsetX + col * cellWidth + cellWidth / 2;
			let centerY = offsetY + row * cellHeight + cellHeight / 2;

			label.x = centerX;
			label.y = centerY;
		});
	}

	mousePressed() {
		let logicX = mouseX / this.scaleVal;
		let logicY = mouseY / this.scaleVal;
		let clickedTool = this.checkShopItemClick(this.shopItems, logicX, logicY);
		if (clickedTool) {
			this.handleToolClick(clickedTool);
		}
	}

	checkShopItemClick(shopItems, clickedX, clickedY) {
		for (let tool of shopItems) {
			let halfW = tool.w / 2;
			let halfH = tool.h / 2;
			if (
				clickedX > tool.x - halfW &&
				clickedX < tool.x + halfW &&
				clickedY > tool.y - halfH &&
				clickedY < tool.y + halfH
			) {
				console.log(`Tool ${tool.id} clicked!`);
				this.UIController.updateLabelColour(tool.id, textAfterClick);
				setTimeout(() => {
					this.UIController.updateLabelColour(tool.id, textColour); // return to original colour
				}, 200);
				return tool.id;
			}
		}
		return null;
	}

	handleToolClick(type) {
		this.UIController.updateLabelBgColour(type, colourAfterClick);
		setTimeout(() => this.UIController.updateLabelBgColour(type, bgColour), 200);

		const player = this.gameManager.player?.[0];
		if (!player) return;

		const item = this.items.find(item => item.id === type);
		if (!item) return;

		player.buyTool(type, item.price);
	}
}
