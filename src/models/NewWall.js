export class Wall {
    constructor(x, y, width, height) {
      this.sprite = new Sprite(x, y, width, height);
      this.sprite.shapeColor = color('#d5bdaf');
    }
  
    remove() {
      this.sprite.remove();
    }

    draw() {
      this.sprite.draw();
    }

    setShapeColour(colour) {
        this.sprite.shapeColor = colour;
    }

    setStrockColour(colour) {
      this.sprite.stroke = colour;
    }
  }
  