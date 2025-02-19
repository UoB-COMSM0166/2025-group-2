import { Fruit } from '../models/Fruit.js';
import { Wall } from '../models/Wall.js';
import { checkCollision } from '../utils/CheckCollision.js';
import { ToolManager } from './ToolManager.js';

let windInc = 0.01; // how quickly wind changes speed (try changing)

let windSpeed = 0; // speed, which will = angle of bend
let noisePos = 0; // "position" in the Perlin noise

let windActive = true;

export class Game {
	constructor() {
		this.fruits = [];
		this.timer = 0;
		this.currentFruit = null;
		this.gravity = 15;
		this.walls = [];

		this.toolManager = new ToolManager(this);
		this.windActive = true;
		this.shieldtimeleft = 30;
		this.shieldtimer = null;
		this.shieldopen = false;
		this.randomwindtimer = null;
	}

	setup() {
		new Canvas(500, 600);
		background('#f5ebe0');
		world.gravity.y = this.gravity;
		

		this.walls = Wall.createDefaultWalls();
		//devine shield button
		/*let devineshieldbutton = createButton('Devine Shield');
		devineshieldbutton.position(650, 200);
		devineshieldbutton.mousePressed(divineShield(this));*/
		this.currentFruit = new Fruit(0, 300, 25, 30);
		let shuffleButton = createButton('Shake Tool');
		shuffleButton.mousePressed(() => this.toolManager.activateTool('shuffle'));

		let defineButton = createButton('defind shield');
		defineButton.mousePressed(() =>
			this.toolManager.activateTool('devineShield')
		);

		let randomToolButton = createButton('Random Tool');
		randomToolButton.mousePressed(() => this.toolManager.randomTool());

		let doubleScoreToolButton = createButton('double Score');
		doubleScoreToolButton.mousePressed(() =>
			this.toolManager.activateTool('doubleScore')
		);
		this.init();
		let shieldButton = createButton('Devine Shield');
		shieldButton.position(650, 200);
		shieldButton.mousePressed(this.windshield.bind(this));
		this.randomwind();
	}

	/**
	 * The init function is used to test if these modules are imported correctly.
	 * You can check by clicking F12 and checking the console
	 * When you want to test your own code, remove it from init()
	 * and move them to the proper place.
	 */
	init() {
		//shuffle(this);
		//doubleScore(this);
		//mysteryTool(this);
		divineShield(this);
	}

	update() {
		background('#f5ebe0');
		this.handleCurrentFruit();
		this.handleMerging();
		this.fruits = this.fruits.filter((fruit) => !fruit.removed);

		this.toolManager.update();
		if (windActive && this.currentFruit) {
			windSpeed = (noise(noisePos) -0.5) * 60;
			noisePos += windInc;

			// 讓所有水果受風影響
			this.currentFruit.applyWind(windSpeed);
		}

		// 檢查水果是否落地
		for (let fruit of this.fruits) {
			if (fruit.isFalling && fruit.sprite.vel.y === 0) {
				// 如果速度為0，代表落地
				fruit.isFalling = false; // 停止受風影響
			}
		}

        if(this.shieldopen === true){
			fill(0);
		    textSize(20);
		    text('Devine Shield Time Left:' + this.shieldtimeleft,240,30);	

		}


	}

	handleCurrentFruit() {
		if (this.currentFruit) {
			this.currentFruit.moveWithMouse();
		} else {
			this.timer++;
			if (this.timer > 50) {
				const newType = int(random(7));
				this.currentFruit = new Fruit(newType, mouseX, 25, 30 + 20 * newType);
				this.timer = 0;
			}
		}

		if (
			mouseIsPressed &&
			this.currentFruit &&
			!this.isClickingUI(mouseX, mouseY)
		) {
			this.fruits.push(this.currentFruit);
			this.currentFruit = null;
		}
	}

	handleMerging() {
		for (let i = 0; i < this.fruits.length; i++) {
			for (let j = i + 1; j < this.fruits.length; j++) {
				const a = this.fruits[i];
				const b = this.fruits[j];

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

	isClickingUI(mx, my) {
		let uiButtons = selectAll('button');
		for (let btn of uiButtons) {
			let bx = btn.position().x;
			let by = btn.position().y;
			let bw = btn.width;
			let bh = btn.height;

			if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
				return true;
			}
		}
		return false;
	}
	windshield() {
		windActive = false;
		this.shieldopen = true;
		console.log('Wind is now ' + (windActive ? 'ON' : 'OFF'));

		if(windActive === false){
			this.shieldtimeleft = 30;
			if(this.shieldtimer){
				clearInterval(this.shieldtimer);
			}

			this.shieldtimer = setInterval (
				()=>{
					if(this.shieldtimeleft >0){
						this.shieldtimeleft --;
					}
					else{
						windActive = true;
						this.shieldopen = false;
						clearInterval(this.shieldtimer);
						console.log('Wind is on');
					}
				}, 1000
			);
		}
		else{
			clearInterval(this.shieldtimer);
		}
	}

	randomwind(){
		if(this.randomwindtimer) clearInterval(this.randomwindtimer);
		if(this.shieldopen = false){
		this.randomwindtimer = setInterval(
			()=>{
				let affecttime = Math.floor(Math.random()* 15) + 5;
				setTimeout(
					()=> {
						windActive = !windActive;
					},affecttime *1000

				);
			}, 30000
		);
	    }
    }
}
