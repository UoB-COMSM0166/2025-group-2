export default class Avocado {
	constructor(x, y, size) {
		this.x = x // 酪梨的 X 座標
		this.y = y // 酪梨的 Y 座標
		this.size = size // 酪梨的大小
	}

	draw() {
		// 酪梨外皮
		noStroke()
		fill(60, 40, 20) // 深棕色外皮
		ellipse(this.x, this.y, this.size, this.size * 1.4)

		// 酪梨果肉
		fill(173, 255, 47) // 淺綠色果肉
		ellipse(this.x, this.y, this.size * 0.85, this.size * 1.2)

		// 酪梨果核
		fill(160, 82, 45) // 棕色果核
		ellipse(this.x, this.y + this.size * 0.1, this.size * 0.4, this.size * 0.4)

		// 高光效果
		fill(255, 255, 255, 80) // 半透明白色
		ellipse(this.x - this.size * 0.1, this.y, this.size * 0.15, this.size * 0.1)
	}
}
