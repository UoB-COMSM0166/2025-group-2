export class Fruit {
	static fruitColors = [
		'#e63232',
		'#f8961e',
		'#7fc96b',
		'#43aa8b',
		'#2d92d1',
		'#f6aeae',
		'#277da1',
	];

	static STATE = {
		WAITING: 0, // in the nextfruit position
		FALLING: 1, // current falling fruit
		LANDED: 2, // fruit already landed
	};

	static maxFruitLevel = this.fruitColors.length - 1;

	constructor(level, x, y, size, scaleVal) {
		this.state = Fruit.STATE.WAITING;
		this.safePeriod = 80;
		this.level = level;
		this.removed = false;
		this.initialY = y;
		this.sprite = new Sprite(x, y, size, 'd');
		this.t = random(1000);
		this.randomId = int(random(100000));
		this.isFalling = true;
		this.fireAffected = false;
		this.isFrozen = false;

		//modified to account for frozen state caused by Freeze Incident
		this.sprite.draw = () => {
			push();
			switch (true) {
				case this.isInFog:
					stroke(66, 84, 84);
					fill(this.color);
					break;
				case this.isFrozen:
					stroke(10);
					fill('#ADD8E6');
					break;
				default:
					stroke(10);
					fill(Fruit.fruitColors[this.i % Fruit.fruitColors.length]); // 正常顏色
			}


			ellipse(0, 0, this.sprite.d, this.sprite.d);

			if (this.isFrozen) {
				//ice crack patterns
				stroke(255);
				strokeWeight(2);
				line(-this.sprite.d / 4, -this.sprite.d / 4, this.sprite.d / 4, this.sprite.d / 4);
				line(-this.sprite.d / 4, this.sprite.d / 4, this.sprite.d / 4, -this.sprite.d / 4);
			} else {
				this.drawFace();
			}

			pop();
		};
	}

	// Method to change color of fruit itself
	setColor(r, g, b) {
		this.color = color(r, g, b);
	}

	startFalling() {
		this.state = Fruit.STATE.FALLING;
	}

	getState() {
		return this.state;
	}

	getSafePeriod() {
		return this.safePeriod;
	}

	getXPosition() {
		return this.sprite.x;
	}

	getYPosition() {
		return this.sprite.y;
	}

	updateState() {
		if (this.state === Fruit.STATE.FALLING) {
			if (this.safePeriod > 0) this.safePeriod--;
		}
	}

	drawFace() {
		push();
		let d = this.sprite.d;
		let eyeSize = map(d, 0, 100, 2, 6);
		let eyeOffsetX = eyeSize * (this.randomId % 2 == 0 ? 1.5 : 1);
		let eyeOffsetY = eyeSize * (this.randomId % 2 == 0 ? 1.5 : 1);

		// Eye Coordinates
		let leftEyeX = -eyeOffsetX;
		let rightEyeX = eyeOffsetX;
		let eyeY = -eyeOffsetY;

		// Changing color of Sclera
		if (this.isInFog) {
			fill(66, 84, 84); // Gris para el borde en la niebla
		} else {
			fill(255); // Color original del borde
		}

		noStroke();
		ellipse(leftEyeX, eyeY, eyeSize * 2, eyeSize * 2);
		ellipse(rightEyeX, eyeY, eyeSize * 2, eyeSize * 2);

		// Pupil Follows Mouse Movement
		function getPupilOffset(eyeX, eyeY) {
			let scaledMouseX = mouseX / this.scaleVal;
			let scaledMouseY = mouseY / this.scaleVal;
			let dx = scaledMouseX - (this.sprite.x + eyeX);
			let dy = scaledMouseY - (this.sprite.y + eyeY);
			let angle = atan2(dy, dx);
			let maxOffset = eyeSize * 0.4;

			return createVector(cos(angle) * maxOffset, sin(angle) * maxOffset);
		}

		// Left Eye Pupil
		let leftPupilOffset = getPupilOffset.call(this, leftEyeX, eyeY);

		//changing color of pupils
		if (this.isInFog) {
			fill(66, 84, 84);
		} else {
			fill(0);
		}

		ellipse(leftEyeX + leftPupilOffset.x, eyeY + leftPupilOffset.y, eyeSize, eyeSize);

		// Right Eye Pupil
		let rightPupilOffset = getPupilOffset.call(this, rightEyeX, eyeY);
		ellipse(rightEyeX + rightPupilOffset.x, eyeY + rightPupilOffset.y, eyeSize, eyeSize);

		// Mouth
		let mouthY = eyeY + eyeSize * 2;
		let mouthOffset = map(
			noise(frameCount / 20, this.sprite.x, this.sprite.y),
			0,
			1,
			-eyeOffsetX / 4,
			eyeOffsetX / 4
		);

		stroke(0);

		//changing color of mouth
		if (this.isInFog) {
			stroke(66, 84, 84);
		} else {
			stroke(0);
		}

		strokeWeight(2);
		line(-eyeOffsetX / 2, mouthY + mouthOffset, eyeOffsetX / 2, mouthY - mouthOffset);

		pop();
	}

	updateScale(newScale) {
		this.scaleVal = newScale;
	}

	moveWithMouse(leftBound, rightBound, y) {
		let scaledMouseX = mouseX / this.scaleVal;
		this.sprite.y = y;
		this.sprite.x = constrain(
			scaledMouseX,
			leftBound + this.sprite.d / 2,
			rightBound - this.sprite.d / 2
		);
		this.sprite.vel.y = 0;
	}

	remove() {
		this.removed = true;
		this.sprite.remove();
	}

	static merge(a, b) {
		if (a.level === b.level && a.level < Fruit.maxFruitLevel) {
			const newType = a.level + 1;
			const newX = (a.sprite.x + b.sprite.x) / 2;
			const newY = (a.sprite.y + b.sprite.y) / 2;
			const newSize = 30 + 20 * newType;

			a.remove();
			b.remove();
			return new Fruit(newType, newX, newY, newSize, this.scaleVal);
		}

		return null;
	}

	doNotFall() {
		this.sprite.collider = 'static';
	}

	letFall() {
		this.sprite.collider = 'd';
	}

	applyWind(windSpeed) {
		if (this.state !== STATE.FALLING) return;

		let stiffness = map(this.sprite.d, 30, 200, 1, 0.1); // bigger fruit has larger stifness
		let windForce = windSpeed * stiffness * 0.05; // apply wind effect
		this.sprite.vel.x += windForce;
	}
}
