export class Fruit {
	static fruitColors = [
		'#e63232',
		'#f8961e',
		'#7fc96b',
		'#43aa8b',
		'#2d92d1 ',
		'#f6aeae',
		'#277da1',
		'#3b498e',
		'#ffd043',
		'#66418a',
	];
	static maxFruitLevel = this.fruitColors.length - 1;
	constructor(i, x, y, size) {
		this.i = i;
		this.removed = false;
		this.sprite = new Sprite(x, y, size, 'd');
		this.t = random(1000);
		this.randomId = int(random(100000));
		this.isFalling = true;
		this.isFrozen = false;

		//modified to account for frozen state caused by Freeze Incident
		this.sprite.draw = () => {
			push();

			if (this.isFrozen) {
				fill('#ADD8E6');
				stroke(10);
				ellipse(0, 0, this.sprite.d, this.sprite.d);

				//ice crack patterns
				stroke(255);
				strokeWeight(2);
				line(-this.sprite.d / 4, -this.sprite.d / 4, this.sprite.d / 4, this.sprite.d / 4);
				line(-this.sprite.d / 4, this.sprite.d / 4, this.sprite.d / 4, -this.sprite.d / 4);
			} else {
				fill(Fruit.fruitColors[this.i % Fruit.fruitColors.length]);
				stroke(10);
				ellipse(0, 0, this.sprite.d, this.sprite.d);

				this.drawFace();
			}

			pop();
		};
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

		// Draw Eyeball (Sclera)
		fill(255);
		noStroke();
		ellipse(leftEyeX, eyeY, eyeSize * 2, eyeSize * 2);
		ellipse(rightEyeX, eyeY, eyeSize * 2, eyeSize * 2);

		// Pupil Follows Mouse Movement
		function getPupilOffset(eyeX, eyeY) {
			let dx = mouseX - (this.sprite.x + eyeX);
			let dy = mouseY - (this.sprite.y + eyeY);
			let angle = atan2(dy, dx);
			let maxOffset = eyeSize * 0.4;

			return createVector(cos(angle) * maxOffset, sin(angle) * maxOffset);
		}

		// Left Eye Pupil
		let leftPupilOffset = getPupilOffset.call(this, leftEyeX, eyeY);
		fill(0);
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
		strokeWeight(2);
		line(-eyeOffsetX / 2, mouthY + mouthOffset, eyeOffsetX / 2, mouthY - mouthOffset);

		pop();
	}

	moveWithMouse() {
		this.sprite.y = 45;
		this.sprite.x = constrain(mouseX, 10 + this.sprite.d / 2, 490 - this.sprite.d / 2);
		this.sprite.vel.y = 0;
	}

	remove() {
		this.removed = true;
		this.sprite.remove();
	}

	static merge(a, b) {
		if (a.i === b.i && a.i < Fruit.maxFruitLevel) {
			const newType = a.i + 1;
			const newX = (a.sprite.x + b.sprite.x) / 2;
			const newY = (a.sprite.y + b.sprite.y) / 2;
			const newSize = 30 + 20 * newType;

			a.remove();
			b.remove();
			return new Fruit(newType, newX, newY, newSize);
		}

		return null;
	}

	applyWind(windSpeed) {
		if (!this.isFalling) return;

		let stiffness = map(this.sprite.d, 30, 200, 1, 0.1); // 大水果抗風力較強
		let windForce = windSpeed * stiffness * 0.05; // 調整風的影響力
		this.sprite.vel.x += windForce;
	}
}
