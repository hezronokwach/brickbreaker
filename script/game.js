import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import Brick from './brick.js'
import {level1, buildLevel} from './levels.js'

export default class Game{
    constructor(gamewidth, gameheight){
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
    }
    start(){
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        let bricks = buildLevel(this, level1);       


        this.gameObjects = [this.ball, this.paddle,...bricks];
        new InputHandler(this.paddle);
    }    
    update(deltaTime){
       this.gameObjects.forEach(object => object.update(deltaTime))
    }
    draw(ctx){
        this.gameObjects.forEach(object => object.draw(ctx))

    }
}