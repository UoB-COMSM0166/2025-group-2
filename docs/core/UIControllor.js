import { Wall } from '../models/Wall.js';

export class UIControllor {
	constructor() {
		this.labels = {};
		this.buttons = [];
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

	createLabel(id, x, y, text, colour = '#000000', size = 12, bgColour = null, type = null) {
		textSize(size);
		let w = textWidth(text) + 15;
		let h = textAscent() + textDescent() + 10;
		this.labels[id] = { id, x, y, text, colour, size, bgColour, w, h, type };
	}

	getLabels() {
		return this.labels;
	}

	updateLabelText(id, newText) {
		if (this.labels[id]) {
			this.labels[id].text = newText;
			textSize(this.labels[id].size);
			this.labels[id].w = textWidth(newText);
			this.labels[id].h = textAscent() + textDescent();
		}
	}

	updateLabelColour(id, colour) {
		if (this.labels[id]) {
			this.labels[id].colour = colour;
		}
	}

	updateLabelBgColour(id, colour) {
		if (this.labels[id]) {
			this.labels[id].bgColour = colour;
		}
	}

	drawLabels() {
		Object.values(this.labels).forEach(label => {
			push();
			// if has background draw the background rect
			if (label.bgColour) {
				fill(label.bgColour);
				noStroke();
				rectMode(CENTER);
				rect(label.x, label.y, label.w, label.h, 10);
			}

			// draw text
			fill(label.colour);
			textSize(label.size);
			textAlign(CENTER, CENTER);
			text(label.text, label.x, label.y);
			pop();
		});
	}

	createCircle(text) {}
}
