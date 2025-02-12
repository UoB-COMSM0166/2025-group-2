export class Wall {
	constructor(x, y, width, height) {
		this.sprite = new Sprite(x, y, width, height, 'static');
		this.sprite.color = color('#d5bdaf');
		this.sprite.stroke = color('#d5bdaf');
	}

	remove() {
		this.sprite.remove();
	}

	static createDefaultWalls() {
		return [
			new Wall(250, 595, 500, 10), // bottom of the wall
			new Wall(5, 300, 10, 600), // left side wall
			new Wall(495, 300, 10, 600), // right side wall
		];
	}
}
