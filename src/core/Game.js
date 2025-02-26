// This class is to control the play board, player and the whole game webpage.

import { Board } from '../models/Board.js';
import { Player } from '../models/Player.js';
import { UIControllor } from './UIControllor.js';

export class Game {
    constructor(scaleVal) {
        this.board = null;
        this.players = null;
        this.ui = new UIControllor();
        this.AREAS = null;
        this.isGameOver = false;
        this.scaleVal = scaleVal;
        this.mode = "single";
    }

    setup() {
        const canvasWidth = width;
        const canvasHeight = height;

        const gameWidth = canvasWidth * 0.4;
        const gameHeight = canvasHeight * 0.6;
        const shopWidth = canvasWidth * 0.2;
        const shopHeight = canvasHeight * 0.5;
        const displayWidth = canvasWidth * 0.15;
        const displayHeight = canvasHeight * 0.5;
        const gap = canvasWidth * 0.05;
        const totalWidth = displayWidth + gameWidth + shopWidth + gap * 2;
        const leftMargin = (canvasWidth - totalWidth) / 2
        const thickness = 10;

        this.AREAS = {
            game: {x: leftMargin + displayWidth + gap, y: canvasHeight - gameHeight - gap, w: gameWidth, h: gameHeight}, 
            shop: {x: leftMargin + displayWidth + gameWidth + gap * 2, y: canvasHeight - shopHeight - gap, w: shopWidth, h: shopHeight}, 
            display: {x: leftMargin, y: canvasHeight - displayHeight - gap, w: displayWidth, h: displayHeight}, 
            dashLine: {
                x1: leftMargin + displayWidth + gap + thickness / 2,
                y1: canvasHeight - gameHeight - gap + 20,
                x2: leftMargin + displayWidth + gap + gameWidth - thickness / 2,
                y2: canvasHeight - gameHeight - gap + 20,
                dashLength: 15,
                gapLength: 10,
                thickness: 10
            },
        }

        // Creating game walls
        this.ui.createNoneCappedWalls(this.AREAS.game, thickness);
        // Creating shop walls
        this.ui.createFourWalls(this.AREAS.shop, thickness);
        // Creating display area
        this.ui.createFourWalls(this.AREAS.display, thickness);
        // Creating the top dashed line
        this.ui.createDashedLine(this.AREAS.dashLine);
        // Create timer label
        this.ui.createLabel("timer", this.AREAS.game.x + this.AREAS.game.w / 2, this.AREAS.game.y - 150, "Time: 2:00", "#000000", 50);

        // Intialise control board.
        this.board = new Board(this.AREAS.game, this.AREAS.shop, thickness, this.scaleVal);
        this.board.setup();
        // Create the fruits to show in the level
        this.board.createFruitsLevel(this.AREAS.display);
        

        //this.players.setup();
    }

    update() {

        this.ui.createDashedLine(this.AREAS.dashLine);
        

        if (!this.isGameOver) {
            this.board.update();    
            this.checkIsGameOver(this.AREAS.dashLine.y1);
        }

        if (this.isGameOver) {
            this.ui.drawGameOver(this.AREAS.game.x + this.AREAS.game.w / 2, this.AREAS.game.y - 20);
        }
        this.ui.drawLabels();
    }

    updateScale(newScale) {
        this.scaleVal = newScale;
        this.board.updateScale(newScale);
    }

    checkIsGameOver() {
        if (this.isGameOver) return;

        if (this.board.checkFruitOverLine(this.AREAS.dashLine.y1)) {
            this.isGameOver = true;
            console.log("draw game over");
        }
    }

}