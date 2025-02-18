// This class is to control the play board, player and the whole game webpage.

import { Board } from '../models/Board.js';
import { Player } from '../models/Player.js';

const GAMEWIDTH = 500;
const GAMEHEIGHT = 600;
const SHOPWIDTH = 300;
const SHOPHEIGHT = 500;
const GAP = 50;
const CANVASWIDTH = (GAMEWIDTH + SHOPWIDTH) * 2;
const CANVASHEIGHT = 800;
const MAINX = (CANVASWIDTH - GAMEWIDTH - SHOPWIDTH) / 2;

const AREAS = {
    GAME: {x: MAINX, y: CANVASHEIGHT - GAMEHEIGHT, w: GAMEWIDTH, h: GAMEHEIGHT}, // main game area
    SHOP: {x: MAINX+GAMEWIDTH+GAP, y: CANVASHEIGHT - SHOPHEIGHT, w: SHOPWIDTH, h: SHOPHEIGHT}, // shop area
    PREVIEW: {x: 50, y: 660, w: 400, h: 30}, // next fruit preview
    STATUS: {x: 500, y: 660, w: 150, h: 30} // state area: timer, score, coin
};

export class Game {
    constructor() {
        this.board = null;
        this.Player = [];
        this.isGameOver = false;
        this.mode = "single";
    }

    setup() {
        let canvas = createCanvas(CANVASWIDTH, 800);
        document.body.style.backgroundColor = '#f5ebe0';
        canvas.style('display', 'block');
        canvas.style('border', '2px solid black');
        canvas.style('margin', '20px auto 0px');
        

        this.board = new Board(AREAS.GAME, AREAS.SHOP);
        this.board.setup();

        this.Player.push(new Player("Player1"));
    }

    update() {
        this.board.update();
    }

    draw() {
        // Draw the entire canvas background
        background('#f5ebe0');

        // Call Board's drawing method
        this.board.draw();
    }
}