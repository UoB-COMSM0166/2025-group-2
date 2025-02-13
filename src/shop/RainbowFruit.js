import { Fruit } from '../models/Fruit.js';

export class RainbowFruit extends Fruit {
	constructor(x, y, size) {
		super('RainbowFruit', x, y, size);
	}
}
