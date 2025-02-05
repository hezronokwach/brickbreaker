export default class Ball{
    constructor(gamewidth, gameheight){
        this.image = document.getElementById('imageBall');
        this.speed = {x:2, y:2};
        this.position = {x:10, y:10};
        this.size = 16;
        this.gamewidth = gamewidth; 
        this.gameheight = gameheight;
    }
    draw(ctx){
        ctx.drawImage(this.image,this.position.x,this.position.y,this.size,this.size);
    }
    update(deltaTime){
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        if(this.position.x + this.size > this.gamewidth || this.position.x < 0){
            this.speed.x = -this.speed.x;
        }
        if(this.position.y + this.size > this.gameheight || this.position.y < 0){
            this.speed.y = -this.speed.y;
        }
    }
}