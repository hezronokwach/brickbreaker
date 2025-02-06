import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import Brick from './brick.js'
import { level1, buildLevel } from './levels.js'

const GAMESTATE = {
    PAUSE: 0,
    PLAY: 1,
    MENU: 2,
    OVER: 3
};
export default class Game {
    constructor(gamewidth, gameheight) {
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
    }
    start() {
        this.gamestate = GAMESTATE.PLAY
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        let bricks = buildLevel(this, level1);


        this.gameObjects = [this.ball, this.paddle, ...bricks];
        new InputHandler(this.paddle, this);
    }
    update(deltaTime) {
        if (this.gamestate == GAMESTATE.PAUSE) return;

        this.gameObjects.forEach(object => object.update(deltaTime))
        this.gameObjects = this.gameObjects.filter(object => !object.delete)
    }
    draw(ctx) {
        this.gameObjects.forEach(object => object.draw(ctx))
        if (this.gamestate == GAMESTATE.PAUSE) {    
        ctx.rect(0, 0, this.gamewidth, this.gameheight)
        ctx.fillStyle = "rgba(0, 0, 0,0.5)";
        ctx.fill()
        ctx.font = "30px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("PAUSE", this.gamewidth / 2, this.gameheight / 2);
        }

    }
    pause() {
        if (this.gamestate == GAMESTATE.PAUSE) {
            this.gamestate = GAMESTATE.PLAY;
        }
        else {
            this.gamestate = GAMESTATE.PAUSE;
        }
    }
} 
    