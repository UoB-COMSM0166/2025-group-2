export class Wall {
    constructor(x, y, width, height) {
      this.sprite = new Sprite(x, y, width, height, 'static');
      this.sprite.color = color('#d5bdaf');
      this.sprite.stroke = color('#d5bdaf');
    }
  
    remove() {
      this.sprite.remove();
    }

    draw() {
      push();
      this.sprite.draw();
      strokeWeight(20);
      pop();
    }

    setShapeColour(colour) {
        this.sprite.color = color(colour);
    }

    setStrokeColour(colour) {
      this.sprite.stroke = color(colour);
    }

    closeCollider() {
      this.sprite.collider = 'none';
    }

    setStrokeWeight(number) {
      strokeWeight(number);
    }

    addText(text) {
      this.sprite.text = text;
    }
  }
  