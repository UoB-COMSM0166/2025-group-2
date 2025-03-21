import {
	BombFruit,
	DivineShieldTool,
	DoubleScoreTool,
	RainbowFruit,
	ShuffleTool,
} from '../shop/index.js';
export class ToolManager {
	constructor(player, area) {
		this.player = player;
		this.area = area;
		this.board = this.player.boards;
		this.scaleVal = this.player.scaleVal;

		this.tools = {
			shuffle: new ShuffleTool(this.board, this.area),
			divineShield: new DivineShieldTool(this.board.incidentManager),
			doubleScore: new DoubleScoreTool(),
		};

		this.specialFruits = {
			rainbowTool: () =>
				new RainbowFruit(this.board.gameArea.x + this.board.gameArea.w / 2, 50, this.scaleVal),
			bombTool: () =>
				new BombFruit(this.board.gameArea.x + this.board.gameArea.w / 2, 50, this.scaleVal),
		};
	}

	update() {
		for (let key in this.tools) {
			if (this.tools[key].update) {
				this.tools[key].update();
			}
		}
	}

	activate(toolName) {
		if (toolName === 'random') {
			this.randomTool();
			return;
		}

		if (this.tools[toolName]) {
			this.activateTool(toolName);
			return;
		}

		if (this.specialFruits[toolName]) {
			this.activateSpecialFruit(toolName);
			return;
		}
	}

	activateTool(toolName) {
		if (this.tools[toolName]) {
			this.tools[toolName].activate();
		}
	}

	activateSpecialFruit(fruitName) {
		const fruit = this.specialFruits[fruitName]?.();
		if (!fruit?.sprite) return;

		this.board.setCurrentFruit(fruit);
	}

	randomTool() {
		const allKeys = [...Object.keys(this.tools), ...Object.keys(this.specialFruits)];
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
