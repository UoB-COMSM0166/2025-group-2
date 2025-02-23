// This class is to control the play board, player and the whole game webpage.

import { Board } from '../models/Board.js';
import { Player } from '../models/Player.js';
import { Wall } from '../models/NewWall.js';

const GAMEWIDTH = 500;
const GAMEHEIGHT = 600;
const SHOPWIDTH = 300;
const SHOPHEIGHT = 500;
const WALLTHICKNESS = 10;
const LEVELPICWIDTH = 200;
const LEVELHEIGHT = 500;
const GAP = 50; 
const CANVASWIDTH = (GAMEWIDTH + SHOPWIDTH + LEVELPICWIDTH) * 2;
const CANVASHEIGHT = 800;
const MAINX = CANVASWIDTH / 2 - GAMEWIDTH / 2;

const AREAS = {
    GAME: {x: MAINX, y: CANVASHEIGHT - GAMEHEIGHT, w: GAMEWIDTH, h: GAMEHEIGHT}, // main game area
    SHOP: {x: MAINX+GAMEWIDTH+GAP, y: CANVASHEIGHT - SHOPHEIGHT, w: SHOPWIDTH, h: SHOPHEIGHT}, // shop area
    scoreWall: {x: MAINX+GAMEWIDTH+GAP+SHOPWIDTH/2, y: CANVASHEIGHT - SHOPHEIGHT - 80, w: SHOPWIDTH/2, h: 30}, // state area: timerWall, scoreWall, coinWall
    coinWall: {x: MAINX+GAMEWIDTH+GAP+SHOPWIDTH/2, y: CANVASHEIGHT - SHOPHEIGHT - 40, w: SHOPWIDTH/2, h: 30},
    timerWall: {x: MAINX+GAMEWIDTH/2, y: CANVASHEIGHT - GAMEHEIGHT - 130, w: SHOPWIDTH/2, h: 30},
    LEVELPIC: {x: MAINX-LEVELPICWIDTH-GAP, y: CANVASHEIGHT - LEVELHEIGHT, w: LEVELPICWIDTH, h: LEVELHEIGHT}, // plave to show the level order.
};

export class Game {
    constructor() {
        this.board = null;
        this.players = null;
        this.gameWalls = [];
        this.shopWalls = [];
        this.topLines = [];
        this.levelPicWalls = [];
        this.fruitsLevel = [];
        this.isGameOver = false;
        this.mode = "single";
        this.scoreWall = null;
        this.coinWall = null;
        this.timerWall = null;
        this.score = 0;
        this.coin = 0;
        this.time = 0;
    }

    setup() {
        let canvas = createCanvas(CANVASWIDTH, 800);
        canvas.style('display', 'block');
        //canvas.style('border', '2px solid black');
        canvas.style('margin', '20px auto 0px');

        // Creating game walls
        this.gameWalls = this.createThreeWalls(AREAS.GAME);
        // Creating the top of the game area
        this.topLines = this.drawDashRect(AREAS.GAME.x, AREAS.GAME.x + AREAS.GAME.w, AREAS.GAME.y + 30, 25, WALLTHICKNESS, 15);
        // Creating shop walls
        this.shopWalls = this.createFourWalls(AREAS.SHOP);
        // Creating the area to show the fruit orders
        this.levelPicWalls = this.createFourWalls(AREAS.LEVELPIC);


        // Creating scoreWall area
        this.scoreWall = new Wall(AREAS.scoreWall.x, AREAS.scoreWall.y, AREAS.scoreWall.w, AREAS.scoreWall.h);
        this.scoreWall.setShapeColour('#f2e2d0');
        this.scoreWall.addText('Score: ' + this.score);
        
        // Creating coinWall area
        this.coinWall = new Wall(AREAS.coinWall.x, AREAS.coinWall.y, AREAS.coinWall.w, AREAS.coinWall.h);
        this.coinWall.setShapeColour('#f2e2d0');
        this.coinWall.addText('Coin: ' + this.coin);

        // Creating the timerWall area
        this.timerWall = new Wall(AREAS.timerWall.x, AREAS.timerWall.y, AREAS.timerWall.w, AREAS.timerWall.h);
        this.timerWall.setShapeColour('#f2e2d0');
        this.timerWall.addText('Time: ' + this.time);


        // Intialise control board.
        this.board = new Board(AREAS.GAME, AREAS.SHOP, WALLTHICKNESS);
        this.board.setup();
        // Create the fruits to show in the level
        this.fruitsLevel = this.board.createFruitsLevel(AREAS.LEVELPIC);
        

        //this.players.setup();
    }

    update() {
        this.board.update();     
    }

    draw() {
        background('#f5ebe0');

        for (let wall of this.gameWalls) {
            wall.draw();
        }

        for (let wall of this.shopWalls) {
            wall.draw();
        }

        for (let dash of this.topLines) {
            dash.draw();
        }

        // Call Board's drawing method
        this.board.draw();
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