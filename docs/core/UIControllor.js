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
		stroke(colour + '80');
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

	drawMaximum(x, y) {
		push();
		textAlign(CENTER, CENTER);
		textSize(48);
		// Add white stroke to make the text stand out against dark backgrounds
		strokeWeight(4);
		stroke(255); // White stroke
		fill('#ff0000');
		text('You reached the max level!', x, y);
		pop();
	}

	drawEndGameOverlay(message, isTie = false) {
		push();
		// Dark background
		fill(0, 0, 0, 180);
		noStroke();
		rect(0, 0, width, height);

		// Central panel
		const panelWidth = 250;
		const panelHeight = 250;
		const panelX = width / 2 - panelWidth / 2;
		const panelY = height / 2 - panelHeight / 2 - 250;

		fill(255);
		stroke(80);
		strokeWeight(2);
		rect(panelX, panelY, panelWidth, panelHeight, 20);

		// Result emoji
		textAlign(CENTER, CENTER);
		textSize(70);
		text(isTie ? '⚖️' : '🏆', width / 2, panelY + 140);

		// Result text
		fill('#6B4F3F');
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(35);
		text(message, width / 2, height / 2 - 310);

		pop();
	}

	drawEndGameSingleOverlay(message, score, highestScore, gameAreaCenter) {
		push();
		// Dark background
		fill(0, 0, 0, 200);
		noStroke();
		rect(0, 0, width, height);

		// Central panel
		const panelWidth = 250;
		const panelHeight = 250;

		const panelX = gameAreaCenter - panelWidth / 2;
		const panelY = height / 2 - panelHeight / 2 - 300;

		fill(255);
		stroke(80);
		strokeWeight(2);
		rect(panelX, panelY, panelWidth, panelHeight, 20);

		// Result text
		fill('#6B4F3F');
		noStroke();
		textAlign(CENTER, CENTER);

		textSize(35);
		text(message, gameAreaCenter, height / 2 - 390);

		// Display result
		fill('#6B4F3F');
		noStroke();
		textAlign(CENTER, CENTER);

		if (score >= highestScore) {
			textSize(35);
			text(`New Record!`, gameAreaCenter, panelY + 75);
			text(`${score}`, gameAreaCenter, panelY + 175);
			textSize(50);
			text('🏆', gameAreaCenter, panelY + 125);
		} else {
			textSize(30);
			text(`Your Score: ${score}`, gameAreaCenter, panelY + 120);
		}

		pop();
	}

	drawCrossLine(x, y) {
		push();
		textAlign(CENTER, CENTER);
		textSize(48);
		// Add white stroke to make the text stand out against dark backgrounds
		strokeWeight(4);
		stroke(255); // White stroke
		fill('#ff0000');
		text('You crossed the line!', x, y);
		pop();
	}

	drawTie(x, y) {
		push();
		textAlign(CENTER, CENTER);
		textSize(48);
		// Add white stroke to make the text stand out against dark backgrounds
		strokeWeight(4);
		stroke(255); // White stroke
		fill('#ff0000');
		text('IT IS A TIE!', x, y);
		pop();
	}

	drawWinner(x, y) {
		push();
		textAlign(CENTER, CENTER);
		textSize(48);
		strokeWeight(4);
		stroke(255); // White stroke
		fill('#ff0000');
		text('YOU WIN!', x, y);
		pop();
	}

	drawLoser(x, y) {
		push();
		textAlign(CENTER, CENTER);
		textSize(48);
		// Add white stroke to make the text stand out against dark backgrounds
		strokeWeight(4);
		strokeWeight(4);
		stroke(255); // White stroke
		fill('#ff0000');
		text('YOU LOSE!', x, y);
		pop();
	}

	createLabel(id, x, y, text, colour = '#000000', size = 12, bgColour = null, textAlign = CENTER) {
		textSize(size);
		let w = textWidth(text) + 15;
		let h = textAscent() + textDescent() + 10;
		this.labels[id] = { id, x, y, text, colour, size, bgColour, w, h, textAlign };
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

	updateLabelPosition(id, x, y) {
		if (this.labels[id]) {
			this.labels[id].x = x;
			if (y !== undefined) {
				this.labels[id].y = y;
			}
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
			textAlign(label.textAlign || CENTER, CENTER);
			text(label.text, label.x, label.y);
			pop();
		});
	}

	clearLabels() {
		this.labels = {};
	}

	drawNextFruitBox(area) {
		push();
		noFill();
		stroke('#aaa');
		strokeWeight(2);
		rect(area.x, area.y, area.w, area.h, 10);

		noStroke();
		fill('#6B4F3F');
		textSize(18);
		textAlign(LEFT, BOTTOM);
		text('Next', area.x, area.y - 8);
		pop();
	}
	removeLabel(id) {
		delete this.labels[id];
	}
}
