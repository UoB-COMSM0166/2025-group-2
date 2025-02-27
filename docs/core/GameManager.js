import { Player } from '../models/index.js';

export class GameManager {
	constructor(game, mode) {
		this.game = game;
		this.mode = mode;
		this.player = this.createPlayers(mode);
		this.running = true;
		// 球的大小
		// this.tip = new tip();
	}

	update() {
		if (this.running) {
			this.player.forEach(player => player.update());
		}
	}

	createPlayers(mode) {
		return mode === 'single'
			? [new Player(1, this.mode)]
			: [new Player(1, this.mode), new Player(2, this.mode)];
	}

	// pause() {
	// 	this.running = !this.running; // 切換遊戲狀態
	// }

	// back() {
	// 	this.game.backToMenu();
	// 	this.cleanup();
	// }

	// cleanup() {
	// 	this.running = false;
	// 	this.players = [];
	// }
}
