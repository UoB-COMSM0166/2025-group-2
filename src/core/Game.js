// This class is to control the play board, player and the whole game webpage.

import { Board } from '../models/Board.js';
import { Player } from '../models/Player.js';
import { UIControllor } from './UIControllor.js';
import { Wall } from '../models/NewWall.js';

const WALLTHICKNESS = 10;

export class Game {
    constructor() {
        this.board = null;
        this.players = null;
        this.ui = new UIControllor();
        this.AREAS = null;
        this.isGameOver = false;


        this.gameWalls = [];
        this.shopWalls = [];
        this.topLines = [];
        this.levelPicWalls = [];
        this.fruitsLevel = [];
        this.mode = "single";
        this.scoreLabel = null;
        this.coinLabel = null;
        this.timerLabel = null;
        this.score = 0;
        this.coin = 0;
        this.time = 0;
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

        this.AREAS = {
            game: {x: leftMargin + displayWidth + gap, y: canvasHeight - gameHeight - gap, w: gameWidth, h: gameHeight}, 
            shop: {x: leftMargin + displayWidth + gameWidth + gap * 2, y: canvasHeight - shopHeight - gap, w: shopWidth, h: shopHeight}, 
            display: {x: leftMargin, y: canvasHeight - displayHeight - gap, w: displayWidth, h: displayHeight}, 
            //scoreLabel: {x: MAINX + gameWidth + GAP + shopWidth/2, y: (canvasHeight - shopHeight - 80) / 2, w: shopWidth/2, h: 30}, 
            //coinLabel: {x: MAINX + gameWidth + GAP + shopWidth/2, y: (canvasHeight - shopHeight - 40) / 2, w: shopWidth/2, h: 30},
            //timerLabel: {x: MAINX + gameWidth / 2, y: (canvasHeight - gameHeight - 130) / 2, w: shopWidth / 2, h: 30},
        }

        // Creating game walls
        this.gameWalls = this.createThreeWalls(this.AREAS.game);
        // Creating the top of the game area
        this.topLines = this.drawDashRect(this.AREAS.game.x, this.AREAS.game.x + this.AREAS.game.w, this.AREAS.game.y + 30, 25, WALLTHICKNESS, 15);
        // Creating shop walls
        this.shopWalls = this.createFourWalls(this.AREAS.shop);
        // Creating the area to show the fruit orders
        this.levelPicWalls = this.createFourWalls(this.AREAS.display);


        // Intialise control board.
        this.board = new Board(this.AREAS.game, this.AREAS.shop, WALLTHICKNESS);
        this.board.setup();
        // Create the fruits to show in the level
        this.fruitsLevel = this.board.createFruitsLevel(this.AREAS.display);
        

        //this.players.setup();
    }

    update() {
        this.board.update();     
    }

    createThreeWalls(gameArea) {
        return [
            // left
            new Wall(gameArea.x, gameArea.y + gameArea.h / 2, WALLTHICKNESS, gameArea.h),
            // right
            new Wall(gameArea.x + gameArea.w, gameArea.y + gameArea.h / 2, WALLTHICKNESS, gameArea.h),
            // bottom
            new Wall(gameArea.x + gameArea.w / 2, gameArea.y + gameArea.h - 5, gameArea.w - 10, WALLTHICKNESS)
        ];
    }
    
    createFourWalls(gameArea) {
        return [
            // left
            new Wall(gameArea.x, gameArea.y + gameArea.h / 2, WALLTHICKNESS, gameArea.h),
            // right
            new Wall(gameArea.x + gameArea.w, gameArea.y + gameArea.h / 2, WALLTHICKNESS, gameArea.h),
            // top
            new Wall(gameArea.x + gameArea.w / 2, gameArea.y + 5, gameArea.w - 10, WALLTHICKNESS),
            // bottom
            new Wall(gameArea.x + gameArea.w / 2, gameArea.y + gameArea.h - 5, gameArea.w - 10, WALLTHICKNESS)
        ];
    }

    drawDashRect(leftBound, rightBound, y, dashLength, h, gap) {
        let dashes = [];
        let totalLength = rightBound - leftBound;
        let dashNumbers = (totalLength + gap) / (dashLength + gap);
        let usedWidth = dashNumbers * dashLength + (dashNumbers - 1) * gap;
        let offset = (totalLength - usedWidth) / 2;
        
        for (let i = 0; i < dashNumbers; i++) {
            let centerX = leftBound + offset + i * (dashLength + gap) + dashLength / 2;
            let dash = new Wall(centerX, y, dashLength, h);
            dash.setShapeColour('#ff0000');
            dash.setStrokeColour('#ff0000');
            dash.closeCollider();
            dashes.push(dash);
        }
        return dashes;
    }

}