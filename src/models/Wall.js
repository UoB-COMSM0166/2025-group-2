export class Wall {
	constructor(x, y, width, height, shapeColour='#d5bdaf', strokeColour='#d5bdaf') {
		this.sprite = new Sprite(x, y, width, height, 'static');
		this.sprite.color = color(shapeColour);
		this.sprite.stroke = color(strokeColour);
	}

	remove() {
		this.sprite.remove();
	}

	closeCollider() {
		this.sprite.collider = 'none';
	}
}
