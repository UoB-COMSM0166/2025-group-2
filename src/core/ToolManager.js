import {
	ShuffleTool,
	DivineShieldTool,
	DoubleScoreTool,
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

	randomTool() {
		const toolKeys = Object.keys(this.tools);
		if (toolKeys.length === 0) {
			return;
		}

		const randomKey = random(toolKeys);
		this.activateTool(randomKey);
	}
}
