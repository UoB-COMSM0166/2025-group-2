import { Fruit } from '../models/Fruit.js';

export class BombFruit extends Fruit {
	constructor(x, y, scaleVal) {
		const fixedSize = 60;
		super(-1, x, y, fixedSize, scaleVal);
		this.explosionRadius = 150;

		this.sprite.draw = () => {
			push();
			fill('#808080');
			stroke(10);
			ellipse(0, 0, this.sprite.d, this.sprite.d);

			this.drawFace();

			pop();
		};
	}

	//overriding drawFace() method to draw bomb icon for bomb fruit instead
	drawFace() {
		push();
		const d = this.sprite.d;

		//creating size of bomb icon, making it smaller than the actual sprite
		const bombSize = d * 0.3;

		//bomb circular body
		fill('#000000'); //black body
		noStroke();
		ellipse(0, bombSize * 0.3, bombSize, bombSize);

		//bomb rectangular head connecting fuse to body
		fill('#000000'); //black head
		rect(-bombSize * 0.02, -bombSize * 0.2, bombSize * 0.4, bombSize * 0.2, bombSize * 0.04);

		//bomb fuse
		stroke('#A9A9A9'); //grey fuse line
		strokeWeight(bombSize * 0.1);
		noFill();
		//curve the fuse line
		bezier(
			-bombSize * 0,
			-bombSize * 0.3,
			-bombSize * 0,
			-bombSize * 0.6,
			bombSize * 0.3,
			-bombSize * 0.5,
			bombSize * 0.3,
			-bombSize * 0.6
		);

		//orange tip to the grey fuse line to represent a lit fuse
		push();
		translate(-bombSize * 0.2, -bombSize * 0.6);
		noStroke();
		//orange outer glow
		fill(255, 165, 0, 200); //making it semi-transparent
		ellipse(bombSize * 0.5, -bombSize * 0.005, bombSize * 0.4, bombSize * 0.4);
		//orange inner glow that is brighter
		fill(255, 69, 0);
		ellipse(bombSize * 0.5, -bombSize * 0.005, bombSize * 0.2, bombSize * 0.2);
		pop();

		pop();
	}

	//override merge method to prevent merging
	static merge(a, b) {
		if (a.i === b.i && a.i < Fruit.maxFruitLevel) {
			const newX = (a.sprite.x + b.sprite.x) / 2;
			const newY = (a.sprite.y + b.sprite.y) / 2;

			//removing merged fruit
			a.remove();
			b.remove();

			//return null since no new fruit will be created
			return null;
		}

		return null;
	}

	//method for handling explosion
	explode(game) {
		const explosionX = this.sprite.x;
		const explosionY = this.sprite.y;

		//removing fruits within explosion radius
		game.fruits = game.fruits.filter(fruit => {
			const distance = dist(explosionX, explosionY, fruit.sprite.x, fruit.sprite.y);
			if (distance <= this.explosionRadius) {
				fruit.remove();
				return false; //exclude from new array
			}
			return true; //keep in new array
		});

		this.remove();
	}

	//method to check for collisions and trigger explosion
	checkCollision(game) {
		for (let fruit of game.fruits) {
			if (fruit != this && this.sprite.overlaps(fruit.sprite)) {
				this.explode(game);
				break;
			}
		}
	}
}
