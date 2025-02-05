import { detectCollision } from "./detectCollision.js";
export default class Ball {
    constructor(game) {
        this.image = document.getElementById('imageBall');
        this.speed = { x: 4, y: -2 };
        this.position = { x: 10, y: 400 };
        this.size = 16;
        this.gamewidth = game.gamewidth;
        this.gameheight = game.gameheight;
        this.game = game;
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }
    update(deltaTime) {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        //wall on the left or right side
        if (this.position.x + this.size > this.gamewidth || this.position.x < 0) {
            this.speed.x = -this.speed.x;
        }
        //wall on the top or bottom side
        if (this.position.y + this.size > this.gameheight || this.position.y < 0) {
            this.speed.y = -this.speed.y;
        }

        //paddle hit
        let bottomBall = this.position.y + this.size
        let topPaddle = this.game.paddle.position.y
        let leftSidePaddle = this.game.paddle.position.x
        let rightSidePaddle = this.game.paddle.position.x + this.game.paddle.width
        if (detectCollision(this, this.game.paddle)) {
            this.speed.y = -this.speed.y;
            this.position.y = this.game.paddle.position.y - this.size
        }
    }
}