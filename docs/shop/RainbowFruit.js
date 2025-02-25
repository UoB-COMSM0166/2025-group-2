import { Fruit } from '../models/Fruit.js';
import { checkCollision } from '../utils/CheckCollision.js';

export class RainbowFruit extends Fruit {
  constructor(x, y, size) {
    // Call parent constructor with -1 to indicate a special fruit type
    super(-1, x, y, size);
    this.isRainbow = true; // Mark this fruit as RainbowFruit

    // Override sprite.draw method to create a rainbow effect
    this.sprite.draw = () => {
      push();
      // Define an array of rainbow colors
      const rainbowColors = [
        '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'
      ];
      
      // Calculate the spacing between concentric circles based on diameter
      let layerStep = this.sprite.d / rainbowColors.length;
      
      // Draw multiple concentric circles to create a rainbow gradient effect
      for (let i = 0; i < rainbowColors.length; i++) {
        fill(rainbowColors[i]);
        noStroke();
        ellipse(0, 0, this.sprite.d - i * layerStep, this.sprite.d - i * layerStep);
      }
      
      // Call the custom method to draw a special face
      this.drawFaceRainbow();
      pop();
    };

    // Start checking for collisions to trigger universal merge logic
    this.startUniversalMergeCheck();
  }
  
  // Custom method: Draw the special face for RainbowFruit
  drawFaceRainbow() {
    push();
    fill(0);
    noStroke();
    ellipse(-this.sprite.d * 0.15, -this.sprite.d * 0.1, this.sprite.d * 0.1, this.sprite.d * 0.1);
    ellipse(this.sprite.d * 0.15, -this.sprite.d * 0.1, this.sprite.d * 0.1, this.sprite.d * 0.1);
    noFill();
    stroke(0);
    strokeWeight(2);
    arc(0, this.sprite.d * 0.05, this.sprite.d * 0.5, this.sprite.d * 0.4, 0, PI);
    pop();
  }
  
  // Static method: Implement the universal merge logic for RainbowFruit
  static universalMerge(a, b) {
    if (a.isRainbow || b.isRainbow) {
      let normalFruitLevel;
      if (a.isRainbow && !b.isRainbow) {
        normalFruitLevel = b.i;
      } else if (b.isRainbow && !a.isRainbow) {
        normalFruitLevel = a.i;
      } else {
        normalFruitLevel = 0;
      }
      let newType = normalFruitLevel + 1;
      let newX = (a.sprite.x + b.sprite.x) / 2;
      let newY = (a.sprite.y + b.sprite.y) / 2;
      let newSize = 30 + 20 * newType;
      a.remove();
      b.remove();
      return new Fruit(newType, newX, newY, newSize);
    }
    return null;
  }
  
  // Start periodic collision checking to trigger universal merge logic
  startUniversalMergeCheck() {
    const self = this;
    this.mergeCheckInterval = setInterval(() => {
      if (self.removed) {
        clearInterval(self.mergeCheckInterval);
        return;
      }
      if (window.game && window.game.fruits) {
        for (let fruit of window.game.fruits) {
          if (fruit === self || fruit.removed) continue;
          if (checkCollision(self.sprite, fruit.sprite)) {
            let newFruit = RainbowFruit.universalMerge(self, fruit);
            if (newFruit) {
              window.game.fruits.push(newFruit);
            }
            break; // Stop checking after first merge to avoid multiple merges
          }
        }
      }
    }, 50);
  }

  /**
   * Function to simulate purchasing a RainbowFruit.
   * When called, it creates a RainbowFruit instance and sets it as the game's current fruit.
   * This function replaces the need for `shop/index.js`
   *
   * @param {Object} game - The game instance (Game object)
   */
  static buyRainbowFruit(game) {
    let x = width / 2; // Center of the canvas
    let y = 25;        // Near the top of the canvas
    let size = 40;     // Define an appropriate size for RainbowFruit
    let rainbow = new RainbowFruit(x, y, size);
    game.currentFruit = rainbow;
  }
}

