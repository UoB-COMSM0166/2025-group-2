import { Fruit } from '../models/Fruit.js';
import { Incident } from './Incident.js';

export class RainIncident extends Incident {
  constructor(game) {
    super(game, 'rain', 10); // 传入游戏实例，事件名称，持续时间（秒）
    this.game = game;
    this.warningDuration = 2; // 警告持续2秒
    this.warningStartTime = 0;
    this.isWarning = false;
    this.hasDropped = false;
    this.fruitCount = 6; // 掉落水果的数量
    this.fruitSize = 40; // 所有水果大小相同
  }

  enable() {
    super.enable();
    this.isWarning = true;
    this.hasDropped = false;
    this.warningStartTime = millis();
  }

  disable() {
    super.disable();
    this.isWarning = false;
    this.hasDropped = false;
  }

  update() {
    if (!this.active) return;
    
    // 显示事件状态
    fill(0);
    textSize(16);
    text('Rain Incident: ' + this.timeLeft + 's', 10, 80);
    
    // 处理警告阶段
    if (this.isWarning) {
      // 检查警告是否结束
      if (millis() - this.warningStartTime > this.warningDuration * 1000) {
        this.isWarning = false;
        if (!this.hasDropped) {
          this.dropFruitRow();
          this.hasDropped = true;
        }
      } else {
        this.showWarning();
      }
    }
  }

  showWarning() {
    // 创建闪烁警告效果
    let flashRate = 300; // 闪烁频率（毫秒）
    let showWarning = floor(millis() / flashRate) % 2 === 0;
    
    if (showWarning) {
      push();
      textAlign(CENTER);
      textSize(24);
      fill(255, 0, 0);
      text("Fruit Rain Coming!", width / 2, height / 2);
      pop();
    }
  }

  dropFruitRow() {
    // 计算容器边界
    const leftWall = 15; // 左墙内侧位置
    const rightWall = 485; // 右墙内侧位置
    const containerWidth = rightWall - leftWall;
    
    // 计算水果之间的间距
    const spacing = containerWidth / (this.fruitCount + 1);
    
    // 创建水果并添加到游戏中
    for (let i = 0; i < this.fruitCount; i++) {
      // 计算水果的x坐标（均匀分布）
      const x = leftWall + spacing * (i + 1);
      
      // 随机水果类型（0到6之间）
      const fruitType = floor(random(7));
      
      // 创建水果
      const newFruit = new Fruit(fruitType, x, 10, this.fruitSize);
      
      // 确保水果处于下落状态
      newFruit.isFalling = true;
      
      // 添加到游戏中
      this.game.fruits.push(newFruit);
    }
  }
}
