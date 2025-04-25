export class KeyGuide {
	constructor(scaleVal = 1) {
		this.scaleVal = scaleVal;
		this.highlightKeys = new Set();
	}

	setupKeyGuide(displayArea) {
		const baseY = displayArea.y + displayArea.h / 2 - 70 * this.scaleVal;

		this.leftX = displayArea.x - 150;
		this.rightX = displayArea.x + displayArea.w + 50;
		this.baseY = baseY;
	}

	drawKey(x, y, label) {
		let size = 60 * this.scaleVal;

		const isHighlighted = this.highlightKeys.has(label);

		push();
		if (isHighlighted) {
			fill('#ffff80');
			stroke('#ffcc00');
			strokeWeight(3);
		} else {
			fill(255);
			stroke(0);
		}
		rect(x, y, size, size, 5 * this.scaleVal);
		fill(0);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(28 * this.scaleVal);
		text(label, x + size / 2, y + size / 2);
		pop();
	}

	drawLeftPlayerKeys(baseX, baseY) {
		const spacing = 75 * this.scaleVal;
		let layout = [
			[-1, 0, 'Q'],
			[0, 0, 'W'],
			[1, 0, 'E'],
			[-1, 1, 'A'],
			[0, 1, 'S'],
			[1, 1, 'D'],
		];
		layout.forEach(([dx, dy, label]) => {
			let x = baseX + dx * spacing;
			let y = baseY + dy * spacing;
			this.drawKey(x, y, label);
		});
	}

	drawRightPlayerKeys(baseX, baseY) {
		const spacing = 75 * this.scaleVal;

		let layout = [
			[0, 0, '.'], // buy
			[0, 1, '?'], // next
			[0, 3, '↑'], // up
			[1, 2, '←'], // left
			[1, 3, '↓'], // down
			[1, 4, '→'], // right
		];

		layout.forEach(([dy, dx, label]) => {
			const x = baseX + dx * spacing;
			const y = baseY + dy * spacing;
			this.drawKey(x, y, label);
		});
	}

	draw() {
		if (this.leftX == null || this.rightX == null || this.baseY == null) return;

		this.drawLeftPlayerKeys(this.leftX, this.baseY);
		this.drawRightPlayerKeys(this.rightX, this.baseY);
	}

	setHighlight(labels) {
		this.highlightKeys = new Set(labels);
	}

	clearHighlight() {
		this.highlightKeys.clear();
	}
}
