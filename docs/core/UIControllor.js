import { Wall } from '../models/Wall.js';

export class UIControllor {
	constructor() {
		this.labels = {};
	}
	createNoneCappedWalls(area, w) {
		// left
		new Wall(area.x, area.y + area.h / 2, w, area.h);
		// right
		new Wall(area.x + area.w, area.y + area.h / 2, w, area.h);
		// bottom
		new Wall(area.x + area.w / 2, area.y + area.h - w / 2, area.w - w, w);
	}

	createFourWalls(area, w) {
		// left
		new Wall(area.x, area.y + area.h / 2, w, area.h);
		// right
		new Wall(area.x + area.w, area.y + area.h / 2, w, area.h);
		// bottom
		new Wall(area.x + area.w / 2, area.y + area.h - w / 2, area.w - w, w);
		// top
		new Wall(area.x + area.w / 2, area.y + w / 2, area.w - w, w);
	}

	createDashedLine(dashLine, colour = '#ff0000', thickness = 8) {
		push();
		stroke(colour);
		strokeWeight(thickness);
		drawingContext.setLineDash([dashLine.dashLength, dashLine.gapLength]);
		line(dashLine.x1, dashLine.y1, dashLine.x2, dashLine.y2);
		pop();
	}

	drawGameOver(x, y) {
		push();
		textAlign(CENTER, CENTER);
		textSize(48);
		fill('#ff0000');
		text('GAME OVER', x, y);
		pop();
	}

	createLabel(id, x, y, text, colour, size) {
		this.labels[id] = { x, y, text, colour, size };
	}

	updateLabel(id, newText) {
		if (this.labels[id]) {
			this.labels[id].text = newText;
		}
	}

	drawLabels() {
		Object.values(this.labels).forEach(label => {
			push();
			fill(label.colour);
			textSize(label.size);
			textAlign(CENTER);
			text(label.text, label.x, label.y);
			pop();
		});
	}

	createCircle(text) {}
}
