import { Fruit } from '../models/Fruit.js';

export class BombFruit extends Fruit {
	constructor(i, x, y, size) {
		const fixedSize = 60;
		super(i, x, y, fixedSize);
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

		this.remove;
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

	// constructor(i, x, y, size) {
	// 	const fixedSize = 60;
	// 	super(i, x, y, fixedSize);

	// 	this.sprite.draw = () => {
	// 		push();
	// 		fill('#808080');
	// 		stroke(10);
	// 		ellipse(0, 0, this.sprite.d, this.sprite.d);

	// 		this.drawFace();

	// 		pop();
	// 	};
	// }

	// //overriding drawFace() method to draw bomb icon for bomb fruit instead
	// drawFace() {
	// 	push();
	// 	const d = this.sprite.d;

	// 	//creating size of bomb icon, making it smaller than the actual sprite
	// 	const bombSize = d * 0.3;

	// 	//bomb circular body
	// 	fill('#000000'); //black body
	// 	noStroke();
	// 	ellipse(0, bombSize * 0.3, bombSize, bombSize);

	// 	//bomb rectangular head connecting fuse to body
	// 	fill('#000000'); //black head
	// 	rect(-bombSize * 0.02, -bombSize * 0.2, bombSize * 0.4, bombSize * 0.2, bombSize * 0.04);

	// 	//bomb fuse
	// 	stroke('#A9A9A9'); //grey fuse line
	// 	strokeWeight(bombSize * 0.1);
	// 	noFill();
	// 	//curve the fuse line
	// 	bezier(
	// 		-bombSize * 0,
	// 		-bombSize * 0.3,
	// 		-bombSize * 0,
	// 		-bombSize * 0.6,
	// 		bombSize * 0.3,
	// 		-bombSize * 0.5,
	// 		bombSize * 0.3,
	// 		-bombSize * 0.6
	// 	);

	// 	//orange tip to the grey fuse line to represent a lit fuse
	// 	push();
	// 	translate(-bombSize * 0.2, -bombSize * 0.6);
	// 	noStroke();
	// 	//orange outer glow
	// 	fill(255, 165, 0, 200); //making it semi-transparent
	// 	ellipse(bombSize * 0.5, -bombSize * 0.005, bombSize * 0.4, bombSize * 0.4);
	// 	//orange inner glow that is brighter
	// 	fill(255, 69, 0);
	// 	ellipse(bombSize * 0.5, -bombSize * 0.005, bombSize * 0.2, bombSize * 0.2);
	// 	pop();

	// 	pop();
	// }

	// //override update method to check for collisions
	// update() {
	// 	super.update();

	// 	//checking for collision with other fruits in playing field
	// 	for (let i = 0; i < window.game.fruits.length; i++) {
	// 		const otherFruit = window.game.fruits[i];

	// 		//ignore if fruit found is itself or fruits that are already removed
	// 		if (otherFruit === this || otherFruit.removed) {
	// 			continue;
	// 		}

	// 		//checking for collision and stopping run after first collision
	// 		if (this.checkCollision(otherFruit)) {
	// 			this.explodeOnContact();
	// 			break;
	// 		}
	// 	}
	// }

	// //method to check for collision with other fruits
	// checkCollision(otherFruit) {
	// 	const distance = dist(this.sprite.x, this.sprite.y, otherFruit.sprite.x, otherFruit.sprite.y);
	// 	const combinedRadius = this.sprite.d / 2 + otherFruit.sprite.d / 2;

	// 	return distance <= combinedRadius;
	// }

	// //method to handle explosion right after collision
	// explodeOnContact() {
	// 	const x = this.sprite.x;
	// 	const y = this.sprite.y;

	// 	//remove bomb fruit on collision
	// 	this.remove();

	// 	window.game.fruits.splice(window.game.fruits.indexOf(this), 1);

	// 	//run explosion method after removal
	// 	this.explode(x, y);
	// }

	// //overriding merge method to change to explosion instead with no new fruit created
	// static merge(a, b) {
	// 	if (a.i === b.i && a.i < Fruit.maxFruitLevel) {
	// 		const newX = (a.sprite.x + b.sprite.x) / 2;
	// 		const newY = (a.sprite.y + b.sprite.y) / 2;

	// 		//removing merged fruit
	// 		a.remove();
	// 		b.remove();

	// 		//activate explosion with 100ms delay as effects
	// 		setTimeout(() => {
	// 			this.explode(newX, newY);
	// 		}, 100);

	// 		//return null since no new fruit will be created
	// 		return null;
	// 	}

	// 	return null;
	// }

	// //method for explosion
	// explode(x, y) {
	// 	/*
	// 	number of different sizes	= 7
	// 	size of different fruits 	= 30 + 20 * size_number_from_0_to_6
	// 	smallest fruit size 		= 30 + 20 * 0
	// 								= 30
	// 	biggest fruit size	 		= 30 + 20 * 6
	// 	*/

	// 	//assume explosion diameter is 180 (radius is 90 from centre of selected fruit)
	// 	//explosion area set to radius of 90 from centre of fruit, with total explosion area of 180 in diameter
	// 	//diameter of 180 -> size of biggest fruit (diameter 150) + size of smallest fruit (diameter of 30)
	// 	//OR AT LEAST IT WAS SUPPOSED TO BE WHAT WAS DESCRIBED ABOVE????
	// 	//BUT THE COORDINATES AND DISTANCES ARE A LITTLE MORE DIFFERENT THAN EXPECTED -- TO BE DEEP-DIVED LATER AFTER VERSION 1 IS COMPLETED
	// 	const explodeRadius = 150; //distance 150 set temporarily -- seemed reasonable during version 1 testing

	// 	//explosion visual effect duration of 1000ms = 1s
	// 	const explodeDuration = 320;

	// 	//start time of explosion visual effect
	// 	const explodeStartTime = millis();

	// 	//drawing explosion
	// 	const drawingExplosion = () => {
	// 		//elapsed time since explosion effect started
	// 		const elapsedTime = millis() - explodeStartTime;

	// 		if (elapsedTime < explodeDuration) {
	// 			//calculating radius of explosion expansion
	// 			const currentRadius = map(elapsedTime, 0, explodeDuration, 0, explodeRadius);

	// 			//multiple layers of explosion effect
	// 			push();
	// 			noStroke();

	// 			//orange outer glow
	// 			fill(255, 165, 0, map(elapsedTime, 0, explodeDuration, 200, 0));
	// 			ellipse(x, y, currentRadius * 1.7, currentRadius * 1.7);

	// 			//orange inner glow that is brighter
	// 			fill(255, 69, 0, map(elapsedTime, 0, explodeDuration, 150, 0));
	// 			ellipse(x, y, currentRadius * 1.2, currentRadius * 1.2);

	// 			//inner white core of explosion
	// 			fill(255, 255, 255, map(elapsedTime, 0, explodeDuration, 100, 0));
	// 			ellipse(x, y, currentRadius * 0.9, currentRadius * 0.9);

	// 			pop();

	// 			//request next frame for continuous animation
	// 			requestAnimationFrame(drawingExplosion);
	// 		} else {
	// 			// console.log(`Explosion at (${x}, ${y}) with radius ${explodeRadius}`);

	// 			//finding fruits within explosion radius
	// 			for (let indx = window.game.fruits.length - 1; indx >= 0; indx--) {
	// 				const fruit = window.game.fruits[indx];
	// 				const fruitX = fruit.sprite.x;
	// 				const fruitY = fruit.sprite.y;
	// 				const distance = dist(x, y, fruitX, fruitY);

	// 				// console.log(`Fruit at (${fruitX}, ${fruitY}), distance: ${distance}`);

	// 				if (distance <= explodeRadius) {
	// 					// console.log(`Removing fruit at (${fruitX}, ${fruitY})`);
	// 					fruit.remove();
	// 					window.game.fruits.splice(indx, 1);
	// 				}
	// 			}
	// 		}
	// 	};

	// 	drawingExplosion();
	// }
}
