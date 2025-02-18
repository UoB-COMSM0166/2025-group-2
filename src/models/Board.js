import { Fruit } from '../models/Fruit.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { Wall } from '../models/NewWall.js';
import {
  shuffle,
  doubleScore,
  mysteryTool,
  divineShield,
} from '../shop/index.js';

const WALLWIDTH = 10;

export class Board {
  constructor(gameArea, shopArea) {
    this.gameArea = gameArea;  // { x, y, w, h }
    this.shopArea = shopArea;  // { x, y, w, h }
    this.gameWalls = [];
    this.shopWalls = [];
    this.gravity = 15;
    this.fruits = [];
    this.currentFruit = null;
    this.timer = 0;
  }

  setup() {
    // Creating game walls
    this.gameWalls = this.createThreeWalls(this.gameArea);
    this.shopWalls = this.createFourWalls(this.shopArea);

    // Create the first fruit, and put it in the top center of the game area.
    this.currentFruit = new Fruit(0, this.gameArea.x + this.gameArea.w / 2, this.gameArea.y + 25, 30);
    // 调用一些测试函数（以后移到合适位置）
  }

  update() {
    // 更新当前水果和处理落下
    this.handleCurrentFruit();
    // 检测水果之间的碰撞和合并
    this.handleMerging();
    // 过滤掉已被标记为 removed 的水果
    this.fruits = this.fruits.filter(fruit => !fruit.removed);
  }

  draw() {

    for (let wall of this.gameWalls) {
      wall.draw();
    }

    for (let wall of this.shopWalls) {
      wall.draw();
    }

    // 绘制已放置的水果
    for (let fruit of this.fruits) {
      fruit.draw();
    }
    
    // 绘制当前操作的水果

  }

  createThreeWalls(gameArea) {
    return [
      // left
      new Wall(gameArea.x, gameArea.y + gameArea.h / 2, WALLWIDTH, gameArea.h),
      // right
      new Wall(gameArea.x + gameArea.w, gameArea.y + gameArea.h / 2, WALLWIDTH, gameArea.h),
      // bottom
      new Wall(gameArea.x + gameArea.w / 2, gameArea.y + gameArea.h - 5, gameArea.w - 10, WALLWIDTH)
    ];
  }

  createFourWalls(gameArea) {
    return [
      // left
      new Wall(gameArea.x, gameArea.y + gameArea.h / 2, WALLWIDTH, gameArea.h),
      // right
      new Wall(gameArea.x + gameArea.w, gameArea.y + gameArea.h / 2, WALLWIDTH, gameArea.h),
      // top
      new Wall(gameArea.x + gameArea.w / 2, gameArea.y + 5, gameArea.w - 10, WALLWIDTH),
      // bottom
      new Wall(gameArea.x + gameArea.w / 2, gameArea.y + gameArea.h - 5, gameArea.w - 10, WALLWIDTH)
    ];
  }

  handleCurrentFruit() {
    if (this.currentFruit) {
      // 允许当前水果跟随鼠标移动
      this.currentFruit.moveWithMouse();
    } else {
      // 没有当前水果时，计时器累加
      this.timer++;
      if (this.timer > 50) {
        const newType = int(random(7));
        // 在游戏区域顶部生成新水果
        this.currentFruit = new Fruit(newType, this.gameArea.x + this.gameArea.w / 2, this.gameArea.y + 25, 30 + 20 * newType);
        this.timer = 0;
      }
    }

    // 当鼠标按下时，将当前水果放入 fruits 数组，并清空 currentFruit
    if (mouseIsPressed && this.currentFruit) {
      this.fruits.push(this.currentFruit);
      this.currentFruit = null;
    }
  }

  handleMerging() {
    // 两层循环遍历所有水果，检测满足合并条件的两个水果
    for (let i = 0; i < this.fruits.length; i++) {
      for (let j = i + 1; j < this.fruits.length; j++) {
        const a = this.fruits[i];
        const b = this.fruits[j];
        // 假设 a.i 表示水果的类型/级别
        if (
          a.i === b.i &&
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
