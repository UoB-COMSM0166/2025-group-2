import { Fruit } from '../models/Fruit.js';

export class BombFruit extends Fruit {
	constructor(x, y, size) {
		super('bomb', x, y, size);
	}
}
