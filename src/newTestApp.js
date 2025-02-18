import { Game } from './core/Game.js';

let game;

window.setup = function() {
  game = new Game();
  game.setup();
  // 隐藏 loading div
  document.getElementById("loading").style.display = "none";
};

window.draw = function() {
  if (game && !game.isGameOver) {
    game.update();
    game.draw();
  }
};
