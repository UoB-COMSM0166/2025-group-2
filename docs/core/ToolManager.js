import {
	ShuffleTool,
	DivineShieldTool,
	DoubleScoreTool,
	RainbowFruit,
	BombFruit,
} from '../shop/index.js';
export class ToolManager {
	constructor(game, incidentManager) {
		this.game = game;
		this.incidentManager = incidentManager;

		this.tools = {
			shuffle: new ShuffleTool(game),
			divineShield: new DivineShieldTool(game, this.incidentManager),
			doubleScore: new DoubleScoreTool(game),
		};

		this.specialFruits = {
			rainbowFruit: () => this.createSpecialFruit(RainbowFruit),
			bombFruit: () => this.createSpecialFruit(BombFruit),
		};
	}

	update() {
		for (let key in this.tools) {
			if (this.tools[key].update) {
				this.tools[key].update();
			}
		}
	}

	activateTool(toolName) {
		if (this.tools[toolName]) {
			this.tools[toolName].activate();
			console.log(`${toolName} active`);
		} else {
			console.error(`Tool "${toolName}" not found!`);
		}
	}

	createSpecialFruit(FruitClass) {
		const x = width / 2;
		const y = 50;
		const randomLevel = Math.floor(random(0, 3));
		const size = 30 + 20 * randomLevel;

		return new FruitClass(randomLevel, x, y, size);
	}

	activateSpecialFruit(fruitName) {
		if (this.specialFruits[fruitName]) {
			const fruit = this.specialFruits[fruitName]();
			this.game.setCurrentFruit(fruit); // set to current fruit
			// but maybe should ne the next one
			console.log(`${fruitName} activated with size  ${fruit.sprite.d}`);
		} else {
			console.error(`Special Fruit "${fruitName}" not found!`);
		}
	}

	randomTool() {
		const allKeys = [
			...Object.keys(this.tools),
			...Object.keys(this.specialFruits),
		];
		if (allKeys.length === 0) {
			return;
		}

		const randomKey = random(allKeys);
		if (this.tools[randomKey]) {
			this.activateTool(randomKey);
		} else if (this.specialFruits[randomKey]) {
			this.activateSpecialFruit(randomKey);
		}
	}
}
