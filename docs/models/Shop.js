export class Shop {
	constructor(player) {
		this.player = player;
		this.items = {
			shuffle: { price: 10, effect: 'shuffle' },
			divineShield: { price: 15, effect: 'divineShield' },
			doubleScore: { price: 20, effect: 'doubleScore' },
			bombTool: { price: 30, effect: 'bombTool' },
			rainbowTool: { price: 25, effect: 'rainbowTool' },
			random: { price: 5, effect: 'randomTool' },
		};

		this.shopContainer = null;
	}

	setupShopUI() {
		this.shopContainer = createDiv();
		this.shopContainer.style('position', 'absolute');
		this.shopContainer.style('right', '150px'); // 放在畫面右側
		this.shopContainer.style('top', '50px');
		this.shopContainer.style('width', '80px');
		this.shopContainer.style('display', 'flex');
		this.shopContainer.style('flex-direction', 'column');
		this.shopContainer.style('align-items', 'center');
		this.shopContainer.style('padding', '10px');
		this.shopContainer.style('border-radius', '10px');

		// 創建商店圖示
		let shopIcon = createButton('🛒');
		shopIcon.style('width', '50px');
		shopIcon.style('height', '50px');
		shopIcon.style('border-radius', '50%');
		shopIcon.style('border', 'none');
		shopIcon.style('background', '#ddd');
		shopIcon.style('font-size', '24px');
		shopIcon.style('cursor', 'pointer');
		shopIcon.parent(this.shopContainer);

		const itemIcons = {
			shuffle: '🔀',
			doubleScore: '✨',
			divineShield: '🛡️',
			bombTool: '💣',
			rainbowTool: '🌈',
			randomTool: '❓',
		};

		// 產生每個道具的按鈕
		Object.keys(this.items).forEach(itemName => {
			let item = this.items[itemName];

			// 創建容器 (按鈕 + 名稱)
			let itemContainer = createDiv();
			itemContainer.style('display', 'flex');
			itemContainer.style('align-items', 'center');
			itemContainer.style('justify-content', 'flex-start');
			itemContainer.style('white-space', 'nowrap');
			itemContainer.style('width', '100%');
			itemContainer.style('margin', '5px');
			itemContainer.parent(this.shopContainer);

			// 創建道具按鈕
			let btn = createButton(itemIcons[itemName] || '❓');
			btn.style('width', '100px');
			btn.style('height', '50px');
			btn.style('border', 'none');
			btn.style('background', 'none');
			btn.style('font-size', '24px');
			btn.style('cursor', 'pointer');

			// 綁定點擊事件
			btn.mousePressed(() => {
				let effect = this.purchaseItem(itemName);
				if (effect) {
					this.player.buyItem(effect);
				}
			});

			btn.parent(itemContainer);

			// 創建標籤，顯示道具名稱
			let label = createSpan(` ${itemName.replace(/([A-Z])/g, ' $1')} ${item.price} $`);
			label.style('font-size', '14px');
			label.style('color', '#333');
			label.style('margin-left', '10px'); // 確保名稱在按鈕右邊
			label.style('cursor', 'default');
			label.parent(itemContainer);
		});
	}

	purchaseItem(itemName) {
		if (!this.items[itemName]) {
			console.log('Item not found in shop.');
			return false;
		}

		let item = this.items[itemName];

		if (this.player.coins >= item.price) {
			this.player.coins -= item.price; // 扣除金幣
			console.log('this.player.coins :>> ', this.player.coins);
			return item.effect; // 回傳購買的道具效果
		} else {
			console.log(`Purchased ${itemName} for ${item.price} coins.`);
			console.log('Not enough coins.');
			return false;
		}
	}
}
