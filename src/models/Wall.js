export class Wall {
	constructor(x, y, width, height) {
		this.sprite = new Sprite(x, y, width, height, 'static') // 使用 p5.play 的 Sprite 來建立牆壁
		this.sprite.color = color('#d5bdaf') // 設定牆壁顏色
		this.sprite.stroke = color('#d5bdaf') // 設定邊框顏色
	}

	display() {
		// 如果未來需要更多自訂的繪製邏輯，可以在這裡擴展
	}

	remove() {
		this.sprite.remove() // 移除牆壁的 Sprite
	}

	static createDefaultWalls() {
		return [
			new Wall(500, 595, 1000, 10), // 底部牆壁
			new Wall(5, 300, 10, 600), // 左牆
			new Wall(995, 300, 10, 600), // 右牆
		]
	}
}
