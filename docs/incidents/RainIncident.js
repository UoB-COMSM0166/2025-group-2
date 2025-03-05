import { Fruit } from '../models/Fruit.js';
import { Incident } from './Incident.js';

export class RainIncident extends Incident {
	constructor(game, gameArea) {
		super(game, 'Rain', 0); // 传入游戏实例，事件名称，持续时间（秒）
		this.game = game;
		this.scaleVal = this.game.scaleVal;
		this.area = gameArea;
		this.hasDropped = false;
		this.fruitCount = 6; // 掉落水果的数量
		this.fruitSize = 40; // 所有水果大小相同
	}

	enable() {
		super.enable();
		if (!this.hasDropped) {
			this.dropFruitRow();
			this.hasDropped = true;
		}
		this.disable();
	}

	disable() {
		super.disable();
		this.hasDropped = false;
	}

	update() {
		if (!this.active) return;
		super.update();
	}

	dropFruitRow() {
		// 计算容器边界
		const leftWall = this.area.x; // 左墙内侧位置
		const rightWall = this.area.x + this.area.w; // 右墙内侧位置
		const containerWidth = rightWall - leftWall;

		// 计算水果之间的间距
		const spacing = containerWidth / (this.fruitCount + 1);

		// 创建水果并添加到游戏中
		for (let i = 0; i < this.fruitCount; i++) {
			// 计算水果的x坐标（均匀分布）
			const x = leftWall + spacing * (i + 1);

			// 随机水果类型（0到6之间）
			const fruitType = floor(random(4));

			// 创建水果
			const newFruit = new Fruit(fruitType, x, this.area.y, this.fruitSize, this.scaleVal);

			// 确保水果处于下落状态
			newFruit.isFalling = true;

			// 添加到游戏中
			this.game.fruits.push(newFruit);
		}
	}
}
