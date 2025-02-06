import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import Brick from './brick.js'
import { level1, buildLevel , level2} from './levels.js'

const GAMESTATE = {
    PAUSE: 0,
    PLAY: 1,
    MENU: 2,
    OVER: 3,
    NEWLEVEL: 4
};
export default class Game {
    constructor(gamewidth, gameheight) {
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
        this.gamestate = GAMESTATE.MENU;
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        this.gameObjects = [];
        this.bricks = [];
        this.lives = 2;
        this.levels = [level1, level2];
        this.currentLevel = 0;
        new InputHandler(this.paddle, this);

    }
    start() {
        if (this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWLEVEL) return;  

        this.bricks = buildLevel(this, this.levels[this.currentLevel]);
        this.ball.reset();

        this.gameObjects = [this.ball, this.paddle];
        this.gamestate = GAMESTATE.PLAY
    }
    update(deltaTime) {
        if (this.lives === 0) this.gamestate = GAMESTATE.OVER

        if (this.gamestate === GAMESTATE.PAUSE || this.gamestate === GAMESTATE.MENU || this.gamestate === GAMESTATE.OVER) return;
        if (this.bricks.length === 0) {
            this.currentLevel++;
            this.gamestate = GAMESTATE.NEWLEVEL;
            this.start();
        }

        [...this.gameObjects, ...this.bricks].forEach(object => object.update(deltaTime))
        this.bricks = this.bricks.filter(brick => !brick.delete)
    }
    draw(ctx) {
        [...this.gameObjects, ...this.bricks].forEach(object => object.draw(ctx))
        if (this.gamestate == GAMESTATE.PAUSE) {    
        ctx.rect(0, 0, this.gamewidth, this.gameheight)
        ctx.fillStyle = "rgba(0, 0, 0,0.5)";
        ctx.fill()
        ctx.font = "30px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("PAUSE", this.gamewidth / 2, this.gameheight / 2);
        }

        if (this.gamestate == GAMESTATE.MENU) {    
            ctx.rect(0, 0, this.gamewidth, this.gameheight)
            ctx.fillStyle = "rgba(0, 0, 0,1)";
            ctx.fill()
            ctx.font = "30px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText("PRESS SPACE TO START", this.gamewidth / 2, this.gameheight / 2);
            }

            if (this.gamestate == GAMESTATE.OVER) {    
                ctx.rect(0, 0, this.gamewidth, this.gameheight)
                ctx.fillStyle = "rgba(0, 0, 0,1)";
                ctx.fill()
                ctx.font = "30px Arial";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.fillText("GAME OVER", this.gamewidth / 2, this.gameheight / 2);
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
    