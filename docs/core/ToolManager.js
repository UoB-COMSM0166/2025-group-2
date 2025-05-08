import {
	BombFruit,
	DivineShieldTool,
	DoubleScoreTool,
	RainbowFruit,
	ShuffleTool,
} from '../shop/index.js';

/**
 * Manages tools and special fruits for a player in the game.
 */
export class ToolManager {
	/**
	 * Creates an instance of ToolManager.
	 * @param {Object} player - The player object associated with the tools.
	 * @param {Object} area - The game area where tools are used.
	 */
	constructor(player, area) {
		this.player = player;
		this.area = area;
		this.board = this.player.boards;
		this.scaleVal = this.player.scaleVal;

		this.tools = {
			shuffle: new ShuffleTool(this.board, this.area),
			divineShield: new DivineShieldTool(this.board.incidentManager),
			doubleScore: new DoubleScoreTool(this.board.incidentManager),
		};

		this.specialFruits = {
			rainbowTool: () =>
				new RainbowFruit(this.board.gameArea.x + this.board.gameArea.w / 2, 50, this.scaleVal),
			bombTool: () =>
				new BombFruit(this.board.gameArea.x + this.board.gameArea.w / 2, 50, this.scaleVal),
		};
	}

	/**
	 * Updates all tools by calling their update methods, if available.
	 */
	update() {
		// Iterate through tools and call their update methods
		for (let key in this.tools) {
			if (this.tools[key].update) {
				this.tools[key].update();
			}
		}
	}

	/**
	 * Activates a tool, special fruit, or incident based on the provided name.
	 * @param {string} toolName - The name of the tool, special fruit, or incident to activate.
	 */
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

		if (toolName === 'Wind' || toolName === 'Rain') {
			const opponent =
				this.player.id === 1
					? this.player.gameManager.player[1]
					: this.player.gameManager.player[0];
			const board = opponent.boards;
			if (toolName === 'Wind') board.incidentManager.activateIncident('Wind', true);
			if (toolName === 'Rain') board.incidentManager.activateIncident('Rain');
			return;
		}
	}

	/**
	 * Activates a specific tool by name.
	 * @param {string} toolName - The name of the tool to activate.
	 */
	activateTool(toolName) {
		if (this.tools[toolName]) {
			this.tools[toolName].activate();
		}
	}

	/**
	 * Activates a special fruit by name.
	 * @param {string} fruitName - The name of the special fruit to activate.
	 */
	activateSpecialFruit(fruitName) {
		const fruit = this.specialFruits[fruitName]?.();
		if (!fruit?.sprite) return;

		this.board.setCurrentFruit(fruit);
	}

	/**
	 * Activates a random tool or special fruit.
	 */
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

	/**
	 * Resets all tools by deactivating them.
	 */
	reset() {
		// Reset all tools
		Object.values(this.tools).forEach(tool => {
			if (tool.deactivate) {
				tool.deactivate();
			}
		});
	}
}
