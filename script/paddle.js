export default class Paddle{
    constructor(game){
        this.gamewidth = game.gamewidth;
        this.width =150;
        this.height = 20;
        this.maxspeed= 7;
        this.speed =0;
        this.position={
            x: game.gamewidth/2 - this.width/2,
            y: game.gameheight -this.height -10
        };
    }

    draw(ctx){
        ctx.fillStyle = '#0ff';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    update(deltaTime){
        this.position.x += this.speed;
        if(this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > this.gamewidth ) 
            this.position.x = this.gamewidth - this.width
    }
    moveLeft(){
        this.speed = -this.maxspeed;
    }
    moveRight(){
        this.speed = this.maxspeed;

    }
    stop(){
        this.speed = 0;
    }

}