import { ToolManager } from '../core/ToolManager.js';
import { Board, Shop, Timer } from '../models/index.js';

export class Player {
	constructor(id, mode) {
		this.id = id;
		this.mode = mode;
		this.score = 0;
		this.timer = new Timer();
		this.coins = 20;
		this.shop = new Shop(this);
		this.board = new Board(this, id, mode);
		this.nextHint = null;

		this.shop.setupShopUI();
		this.tool = new ToolManager(this.board, this.board.incidentManager);
	}

	update() {
		this.board.update();
	}

	reset() {
		this.score = 0;
		this.timer.reset();
		this.coins = 0;
		this.board.clear();
	}

	addScore(amount) {
		this.score += amount;
	}

	addCoins(amount) {
		this.coins += amount;
		console.log('amount :>> ', amount);
		console.log('this.coins :>> ', this.coins);
	}

	buyItem(itemName) {
		let effect = this.shop.purchaseItem(itemName);
		if (effect) {
			const specialFruits = ['bombTool', 'rainbowTool']; // 定義特殊水果
			if (specialFruits.includes(effect)) {
				this.tool.activateSpecialFruit(effect);
			} else {
				this.tool.activateTool(effect);
			}
		}
	}
}
