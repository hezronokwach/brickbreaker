import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import Brick from './brick.js'

export default class Game{
    constructor(gamewidth, gameheight){
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
    }
    start(){
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        this.gameObjects = [this.ball, this.paddle];
        new InputHandler(this.paddle);
    }    
    update(deltaTime){
       this.gameObjects.forEach(object => object.update(deltaTime))
    }
    draw(ctx){
        this.gameObjects.forEach(object => object.draw(ctx))

    }
}