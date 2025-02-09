export default class Paddle {
    constructor(game) {
        this.game = game;
        this.width = 150;
        this.height = 20;
        this.maxspeed = 7;
        this.speed = 0;
        this.position = {
            x: game.gamewidth / 2 - this.width / 2,
            y: game.gameheight - this.height - 10
        };
        this.element = document.createElement('div');
        this.element.className = 'paddle';
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.game.gameContainer.appendChild(this.element); // Use this.game.gameContainer
    }

    draw() {
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }

    update(deltaTime) {
        this.position.x += this.speed;
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > this.game.gamewidth) {
            this.position.x = this.game.gamewidth - this.width;
        }
    }

    moveLeft() {
        this.speed = -this.maxspeed;
    }

    moveRight() {
        this.speed = this.maxspeed;
    }

    stop() {
        this.speed = 0;
    }

    collidesWith(ball) {
        return (
            ball.position.x + ball.size > this.position.x &&
            ball.position.x < this.position.x + this.width &&
            ball.position.y + ball.size > this.position.y &&
            ball.position.y < this.position.y + this.height
        );
    }
}