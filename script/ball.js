export default class Ball {
    constructor(game) {
        this.game = game;
        this.size = 16;
        this.element = document.createElement('div');
        this.element.className = 'ball';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.game.gameContainer.appendChild(this.element);
        this.reset();
    }

    reset() {
        this.speed = { x: 4, y: -2 };
        this.position = {
            x: this.game.gamewidth / 2 - this.size / 2,
            y: this.game.gameheight - 100
        };
        this.draw(); // Draw immediately after reset
    }

    draw() {
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }

    update(deltaTime) {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        // Wall collision
        if (this.position.x + this.size > this.game.gamewidth || this.position.x < 0) {
            this.speed.x = -this.speed.x;
        }
        if (this.position.y < 0) {
            this.speed.y = -this.speed.y;
        }

        // Bottom collision
        if (this.position.y + this.size > this.game.gameheight) {
            this.game.lives--;
            this.reset();
        }

        // Paddle collision
        if (this.game.paddle.collidesWith(this)) {
            this.speed.y = -this.speed.y;
            this.position.y = this.game.paddle.position.y - this.size;
        }
    }
}