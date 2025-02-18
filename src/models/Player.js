export class Player {
    constructor(name) {
      this.name = name;
      this.score = 0;
      this.coins = 0;
      // 可扩展 inventory、level 等属性
    }
  
    addScore(amount) {
      this.score += amount;
    }
  
    addCoins(amount) {
      this.coins += amount;
    }
  
    // 购买物品、使用道具等方法可在此添加
  }
  