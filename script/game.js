import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';

export default class Game{
    constructor(gamewidth, gameheight){
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
    }
    start(){
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        new InputHandler(this.paddle);
    }    
    update(deltaTime){
        this.paddle.update(deltaTime);
       this.ball.update(deltaTime);
    }
    draw(ctx){
        this.paddle.draw(ctx);
        this.ball.draw(ctx);
    }
}