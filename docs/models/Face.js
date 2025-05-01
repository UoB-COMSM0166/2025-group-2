export const FaceComponents = {
	eyes: [
		// basic eye 0
		(d, fruit) => {
			let eyeSize = map(d, 0, 100, 2, 6);
			let eyeOffsetX = eyeSize * (fruit.randomId % 2 == 0 ? 1.5 : 1);
			let eyeOffsetY = eyeSize * (fruit.randomId % 2 == 0 ? 1.5 : 1);

			let leftEyeX = -eyeOffsetX;
			let rightEyeX = eyeOffsetX;
			let eyeY = -eyeOffsetY;

			fill(255);
			noStroke();
			ellipse(leftEyeX, eyeY, eyeSize * 2, eyeSize * 2);
			ellipse(rightEyeX, eyeY, eyeSize * 2, eyeSize * 2);

			function getPupilOffset(eyeX, eyeY) {
				if (mouseX !== undefined && mouseY !== undefined) {
					let scaledMouseX = mouseX / fruit.scaleVal;
					let scaledMouseY = mouseY / fruit.scaleVal;
					let dx = scaledMouseX - (fruit.sprite.x + eyeX);
					let dy = scaledMouseY - (fruit.sprite.y + eyeY);
					let angle = atan2(dy, dx);
					let maxOffset = eyeSize * 0.4;
					return createVector(cos(angle) * maxOffset, sin(angle) * maxOffset);
				} else {
					return createVector(0, 0);
				}
			}

			let leftPupilOffset = getPupilOffset.call(fruit, leftEyeX, eyeY);
			let rightPupilOffset = getPupilOffset.call(fruit, rightEyeX, eyeY);

			fill(0);
			ellipse(leftEyeX + leftPupilOffset.x, eyeY + leftPupilOffset.y, eyeSize, eyeSize);
			ellipse(rightEyeX + rightPupilOffset.x, eyeY + rightPupilOffset.y, eyeSize, eyeSize);
		},
		// small eye 1
		(d, fruit) => {
			let eyeSize = d * 0.12;
			let pupilSize = eyeSize * 0.5;
			let eyeOffset = d * 0.2;

			noStroke();

			fill(255);
			ellipse(-eyeOffset, -eyeOffset, eyeSize);
			ellipse(eyeOffset, -eyeOffset, eyeSize);

			fill(0);
			ellipse(-eyeOffset, -eyeOffset, pupilSize);
			ellipse(eyeOffset, -eyeOffset, pupilSize);
		},
		// 2
		(d, fruit) => {
			let eyeSize = d * 0.25;
			let eyeOffsetX = d * 0.2;
			let eyeOffsetY = d * 0.2;

			let blinkScale = (frameCount + (fruit.randomId || 0) * 5) % 80 < 10 ? 0.1 : 1;

			let drawSingleEye = (x, y) => {
				push();
				translate(x, y);
				scale(1, blinkScale);

				fill(255);
				noStroke();
				ellipse(0, 0, eyeSize, eyeSize * 0.5);

				fill(255, 200);
				arc(0, 0, eyeSize * 1.1, eyeSize * 1.1, PI, 0, CHORD);

				fill(0);
				ellipse(0, 0, eyeSize * 0.3, eyeSize * 0.4);

				pop();
			};

			drawSingleEye(-eyeOffsetX, -eyeOffsetY);
			drawSingleEye(eyeOffsetX, -eyeOffsetY);
		},
		// 3
		(d, fruit) => {
			let eyeSize = d * 0.1;
			let eyeOffsetX = eyeSize * 2;
			let eyeOffsetY = eyeSize * 1.5;

			let leftEyeX = -eyeOffsetX;
			let leftEyeY = -eyeOffsetY;
			let rightEyeX = eyeOffsetX;
			let rightEyeY = -eyeOffsetY;

			let eyeAngle = atan2(leftEyeY - rightEyeY, leftEyeX - rightEyeX);

			const drawEye = (x, y, blink = 1) => {
				push();
				translate(x, y);
				rotate(eyeAngle);
				scale(1, blink);

				// draw eyes
				fill(255);
				noStroke();
				ellipse(0, 0, eyeSize * 2);

				// draw pupil
				fill(0);
				ellipse(0, 0, eyeSize * 1.2);

				pop();
			};

			let blink = (frameCount + (fruit.randomId || 0) * 5) % 80 < 10 ? 0.1 : 1;

			drawEye(leftEyeX, leftEyeY, 1);
			drawEye(rightEyeX, rightEyeY, blink);
		},
		// 4
		(d, fruit) => {
			noStroke();
			fill(0);

			let eyeSize = d * 0.18;
			let eyeOffsetX = d * 0.3;
			let eyeOffsetY = d * 0.1;
			let eyelashOffsetY = eyeSize * 0.5;

			const drawEyeWithLashes = (offsetX, offsetY) => {
				push();
				translate(offsetX, offsetY);

				// draw eyes
				ellipse(0, 0, eyeSize);

				// draw eyelashes
				stroke(0);
				strokeWeight(eyeSize * 0.1);
				noFill();
				translate(0, -eyelashOffsetY);

				let lashLengthX = eyeSize * 0.25;
				let lashLengthY = eyeSize * 0.3;

				line(-lashLengthX, 0, -lashLengthX * 1.2, -lashLengthY);
				line(0, -lashLengthX * 0.5, 0, -lashLengthY * 1.5);
				line(lashLengthX, 0, lashLengthX * 1.2, -lashLengthY);

				pop();
			};

			drawEyeWithLashes(-eyeOffsetX, -eyeOffsetY);
			drawEyeWithLashes(eyeOffsetX, -eyeOffsetY);
		},
		// eyes[5] left and right different size
		(d, fruit) => {
			let eyeSize = d * 0.06;
			let eyeOffsetX = d * 0.15;
			let eyeOffsetY = 0;

			noFill();
			stroke(0);
			strokeWeight(d * 0.12);

			ellipse(-eyeOffsetX, eyeOffsetY, eyeSize, eyeSize);
			ellipse(eyeOffsetX, eyeOffsetY, eyeSize * 0.5, eyeSize * 0.5);
		},
	],
	noses: [
		(d, fruit) => {
			let noseSize = d * 0.05;
			fill(0);
			noStroke();
			ellipse(0, 0, noseSize, noseSize);
		},
		(d, fruit) => {
			let noseWidth = d * 0.1;
			let noseHeight = d * 0.15;
			let offsetY = -d * 0.05;

			push();
			translate(0, offsetY);
			fill(0);
			noStroke();
			triangle(0, 0, noseWidth, noseHeight * 0.8, 0, noseHeight);
			pop();
		},
	],
	mouths: [
		(d, fruit) => {
			let mouthWidth = d * 0.4;
			let mouthY = d * 0.15;

			let mouthOffset = map(
				noise(frameCount / 20, fruit.sprite?.x || 0, fruit.sprite?.y || 0),
				0,
				1,
				-mouthWidth / 4,
				mouthWidth / 4
			);

			stroke(0);
			strokeWeight(2);
			line(-mouthWidth / 2 + mouthOffset, mouthY, mouthWidth / 2 + mouthOffset, mouthY);
		},
		// mouths[1] surprise
		(d, fruit) => {
			let mouthY = d * 0.15;
			push();
			translate(0, mouthY);
			noFill();
			stroke(0);
			strokeWeight(2);
			let size = d * 0.15 + sin(frameCount / 20) * d * 0.05;
			ellipse(0, 0, size, size);
			pop();
		},
		// mouths[2] smile
		(d, fruit) => {
			noFill();
			stroke(0);
			strokeWeight(d * 0.03);

			let w = d * 0.3;
			let h = d * 0.2;
			let offsetY = d * 0.15;

			push();
			translate(0, offsetY);
			beginShape();
			curveVertex(-w * 0.7, -h * 0.3);
			curveVertex(-w * 0.7, 0);
			curveVertex(-w * 0.7, h * 0.5);
			curveVertex(0, h * 0.7);
			curveVertex(w * 0.7, h * 0.5);
			curveVertex(w * 0.7, 0);
			curveVertex(w * 0.7, -h * 0.3);
			endShape();
			pop();
		},
		// mouths[3] smile v shape
		(d, fruit) => {
			noFill();
			stroke(0);
			strokeWeight(d * 0.04);

			let w = d * 0.5;
			let h = d * 0.1;
			let offsetY = d * 0.2;

			push();
			translate(0, offsetY);
			beginShape();
			vertex(-w / 2, 0);
			vertex(0, h);
			vertex(w / 2, 0);
			endShape();
			pop();
		},
		// mouths[4] sad v shape opposite
		(d, fruit) => {
			noFill();
			stroke(0);
			strokeWeight(d * 0.04);

			let w = d * 0.5;
			let h = d * 0.1;
			let offsetY = d * 0.2;

			push();
			translate(0, offsetY);
			beginShape();
			vertex(-w / 2, h);
			vertex(0, 0);
			vertex(w / 2, h);
			endShape();
			pop();
		},
	],
};

export const FaceMapping = [
	{ eye: 3, nose: null, mouth: 0 }, // level 0
	{ eye: 4, nose: 0, mouth: 4 }, // level 1
	{ eye: 0, nose: null, mouth: 0 }, // level 2
	{ eye: 5, nose: null, mouth: 1 }, // level 3
	{ eye: 2, nose: 1, mouth: 4 }, // level 4
	{ eye: 0, nose: 0, mouth: 1 }, // level 5
	{ eye: 4, nose: null, mouth: 2 }, // level 6
	{ eye: 3, nose: 0, mouth: 3 }, // level 7
	{ eye: 2, nose: null, mouth: 1 }, // level 8
	{ eye: 1, nose: 1, mouth: 3 }, // level 9
];
