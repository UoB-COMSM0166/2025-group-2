export class Fruit {
	constructor(i, x, y, size) {
		this.i = i
		this.removed = false
		this.sprite = new Sprite(x, y, size, 'd')
		this.t = random(1000)
		this.randomId = int(random(100000))

		this.fruitColors = [
			'#0a9396',
			'#94d2bd',
			'#e9d8a6',
			'#ee9b00',
			'#ca6702',
			'#bb3e03',
			'#ae2012',
			'#9b2226',
		]

		this.sprite.draw = () => {
			push()
			fill(this.fruitColors[this.i % this.fruitColors.length])
			stroke(10)
			ellipse(0, 0, this.sprite.d, this.sprite.d)

			this.drawFace() // 加入表情繪製

			pop()
		}
	}

	drawFace() {
		push()
		let d = this.sprite.d
		let eyeSize = map(d, 0, 100, 2, 6)
		let eyeOffsetX = eyeSize * (this.randomId % 2 == 0 ? 1.5 : 1)
		let eyeOffsetY = eyeSize * (this.randomId % 2 == 0 ? 1.5 : 1)

		// 眼睛座標
		let leftEyeX = -eyeOffsetX
		let rightEyeX = eyeOffsetX
		let eyeY = -eyeOffsetY

		// 畫眼白
		fill(255)
		noStroke()
		ellipse(leftEyeX, eyeY, eyeSize * 2, eyeSize * 2)
		ellipse(rightEyeX, eyeY, eyeSize * 2, eyeSize * 2)

		// 瞳孔跟隨滑鼠移動
		function getPupilOffset(eyeX, eyeY) {
			// 計算滑鼠與眼睛中心的距離
			let dx = mouseX - (this.sprite.x + eyeX)
			let dy = mouseY - (this.sprite.y + eyeY)
			let angle = atan2(dy, dx) // 取得角度
			let maxOffset = eyeSize * 0.4 // 控制瞳孔最大偏移距離

			return createVector(cos(angle) * maxOffset, sin(angle) * maxOffset)
		}

		// 左眼瞳孔
		let leftPupilOffset = getPupilOffset.call(this, leftEyeX, eyeY)
		fill(0)
		ellipse(
			leftEyeX + leftPupilOffset.x,
			eyeY + leftPupilOffset.y,
			eyeSize,
			eyeSize
		)

		// 右眼瞳孔
		let rightPupilOffset = getPupilOffset.call(this, rightEyeX, eyeY)
		ellipse(
			rightEyeX + rightPupilOffset.x,
			eyeY + rightPupilOffset.y,
			eyeSize,
			eyeSize
		)

		// // 畫瞳孔，隨機微移動
		// let panX = map(noise(this.randomId, frameCount / 50, 500), 0, 1, -1, 1)
		// let panY = map(
		// 	noise(this.randomId, 100, frameCount / 50, 500),
		// 	0,
		// 	1,
		// 	-0.2,
		// 	1
		// )
		// fill(0) // 黑色瞳孔
		// ellipse(leftEyeX + panX * eyeSize, eyeY + panY * eyeSize, eyeSize, eyeSize)
		// ellipse(rightEyeX + panX * eyeSize, eyeY + panY * eyeSize, eyeSize, eyeSize)

		// 嘴巴
		let mouthY = eyeY + eyeSize * 2
		let mouthOffset = map(
			noise(frameCount / 20, this.sprite.x, this.sprite.y),
			0,
			1,
			-eyeOffsetX / 4,
			eyeOffsetX / 4
		)
		stroke(0)
		strokeWeight(2)
		line(
			-eyeOffsetX / 2,
			mouthY + mouthOffset,
			eyeOffsetX / 2,
			mouthY - mouthOffset
		)

		pop()
	}

	moveWithMouse() {
		this.sprite.y = 25
		this.sprite.x = constrain(
			mouseX,
			10 + this.sprite.d / 2,
			990 - this.sprite.d / 2
		)
		this.sprite.vel.y = 0
	}

	remove() {
		this.removed = true
		this.sprite.remove()
	}
}
