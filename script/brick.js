import { detectCollision } from "./detectCollision.js";
export default class Brick {
    constructor(game, position) {
        this.image = document.getElementById('imageBrick');
        this.position = position
        this.width = 80;
        this.height = 24;
        this.game = game;
        this.points = 10;

        this.delete = false;
    }
    update() {
        if (detectCollision(this.game.ball, this)) {
            this.game.ball.speed.y = -this.game.ball.speed.y;
            this.delete = true;
            this.game.addScore(this.points)
        }
    }
    draw(ctx) {
        ctx.drawImage(
            this.image, this.position.x, this.position.y, this.width, this.height
        )

    }
}