import { Fruit } from '../models/NewFruit.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Wall } from '../models/NewWall.js';
import {
  shuffle,
  doubleScore,
  mysteryTool,
  divineShield,
} from '../shop/index.js';

const DISTFROMGAME = 20;
const DISTFROMSHOP = 150;

export class Board {
  constructor(gameArea, shopArea, wallWidth) {
    this.gameArea = gameArea;  // { x, y, w, h }
    this.shopArea = shopArea;  // { x, y, w, h }
    this.wallWidth = wallWidth;
    this.gravity = 15;
    this.fruits = [];
    this.currentFruit = null;
    this.nextFruit = null;
    this.timer = 0;
  }

  setup() {
    world.gravity.y = this.gravity;

    // Create the first fruit, and put it in the top center of the game area.
    this.currentFruit = new Fruit(0, this.gameArea.x + this.gameArea.w / 2, this.gameArea.y - DISTFROMGAME , 30);
    let newType = int(random(4));
    this.nextFruit = new Fruit(newType, this.shopArea.x + this.shopArea.w / 2, this.shopArea.y - DISTFROMSHOP, 30 + 20 * newType);
    this.nextFruit.doNotFall();
  }

  update() {
    // Update current fruit and handle falls
    this.handleCurrentFruit();
    // Detect collisions and mergers between fruits
    this.handleMerging();
    // Filter out fruits that have been marked removed
    this.fruits = this.fruits.filter(fruit => !fruit.removed);
    
  }

  draw() {
    // Draw placed fruit
    for (let fruit of this.fruits) {
      fruit.draw();
    }
    
    // Draw the fruit of the current operation

  }

  createFruitsLevel(area) {
    let fruitType = 7;
    let fruitsLevel = []
    let gap = 18;
    let yFromTop = 0;
    let prevY = null;
    let prevSize = null;

    for (let i = 0; i < fruitType; i++) {
      let size = 20 + 10 * i
      let x = area.x + area.w / 2;
      let y;

      if (i === 0) {
        // the y position of first fruit: from the top add a gap and the radius
        y = area.y + gap + size / 2;
      } else {
        // the y position of the next fruit = the prevY + prevSize / 2 + currentSize / 2 + gap
        y = prevY + prevSize / 2 + size / 2 + gap;
      }
      let fruit = new Fruit(i, x, y, size);
      fruit.doNotFall();
      fruitsLevel.push(fruit);
      prevY = y;
      prevSize = size;
    }
    return fruitsLevel;
 }

  handleCurrentFruit() {
    if (this.currentFruit) {
      // allow current fruit move with mouse
      let leftBound = this.gameArea.x + this.wallWidth;
      let rightBound = this.gameArea.x + this.gameArea.w - this.wallWidth;
      this.currentFruit.moveWithMouse(leftBound, rightBound);
    } else {
      // Timer increments when there is no current fruit
      this.timer++;
      if (this.timer > 50) {
        let newType = int(random(4));
        // Generate new fruit at the top of the game area
        this.nextFruit.letFall();
        this.currentFruit = this.nextFruit;
        this.nextFruit = new Fruit(newType, this.shopArea.x + this.shopArea.w / 2, this.shopArea.y - DISTFROMSHOP, 30 + 20 * newType);
        this.nextFruit.doNotFall();
        this.timer = 0;
      }
    }

    // When the mouse is pressed, put the current fruit into the fruits array and clear currentFruit
    if (mouseIsPressed && this.currentFruit) {
      this.currentFruit.sprite.vel.y = this.gravity;
      this.fruits.push(this.currentFruit);
      this.currentFruit = null;
    }
  }

  handleMerging() {
    // Two-level loop traverses all fruits, detects two fruits that meet the merge condition
    for (let i = 0; i < this.fruits.length; i++) {
      for (let j = i + 1; j < this.fruits.length; j++) {
        const a = this.fruits[i];
        const b = this.fruits[j];
        // Suppose a.level denotes the type/grade of fruit
        if (
          a.level === b.level &&
          checkCollision(a.sprite, b.sprite) &&
          !a.removed &&
          !b.removed
        ) {
          const mergedFruit = Fruit.merge(a, b);
          if (mergedFruit) {
            this.fruits.push(mergedFruit);
          }
        }
      }
    }
  }
}
