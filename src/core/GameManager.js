import { Fruit } from '../models/Fruit.js'
import { checkCollision } from './Utils.js'
import { Wall } from '../models/Wall.js'
import { FruitTypes } from '../models/fruits/index.js'

export class Game {
	constructor() {
		this.fruits = []
		this.timer = 0
		this.currentFruit = null
		this.gravity = 15
		this.walls = []
	}

	setup() {
		new Canvas(1000, 600)
		background('#f5ebe0')
		world.gravity.y = this.gravity
		// const randomIndex = Math.floor(Math.random() * FruitTypes.length)
		// const fruit = new FruitTypes[randomIndex](100, 100, 50)
		// fruit.draw()

		// 建立牆壁
		this.walls = Wall.createDefaultWalls()

		this.currentFruit = new Fruit(0, 300, 25, 30)
	}

	update() {
		background('#f5ebe0')
		this.walls.forEach((wall) => wall.display())
		this.handleCurrentFruit()
		this.handleMerging()
		this.fruits = this.fruits.filter((fruit) => !fruit.removed)
	}

	handleCurrentFruit() {
		if (this.currentFruit) {
			this.currentFruit.moveWithMouse()
		} else {
			this.timer++
			if (this.timer > 50) {
				const newType = int(random(4))
				this.currentFruit = new Fruit(newType, mouseX, 25, 30 + 20 * newType)
				this.timer = 0
			}
		}

		if (mouseIsPressed && this.currentFruit) {
			this.fruits.push(this.currentFruit)
			this.currentFruit = null
		}
	}

	handleMerging() {
		for (let i = 0; i < this.fruits.length; i++) {
			for (let j = i + 1; j < this.fruits.length; j++) {
				const a = this.fruits[i]
				const b = this.fruits[j]

				if (
					a.i === b.i &&
					checkCollision(a.sprite, b.sprite) &&
					!a.removed &&
					!b.removed
				) {
					const newX = (a.sprite.x + b.sprite.x) / 2
					const newY = (a.sprite.y + b.sprite.y) / 2
					const newType = a.i + 1

					this.fruits.push(new Fruit(newType, newX, newY, 30 + 20 * newType))
					a.remove()
					b.remove()
				}
			}
		}
	}
}
