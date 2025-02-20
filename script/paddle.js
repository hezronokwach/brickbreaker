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
        // Remove deltaTime dependency
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    update(deltaTime) {
        // Update speed calculations
        const speed = this.speed * (deltaTime / 16.67); // Normalize to 60fps
        this.position.x += speed;

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
        let paddleTopY = this.position.y;
        let paddleLeftX = this.position.x;
        let paddleRightX = this.position.x + this.width;
        let ballBottomY = ball.position.y + ball.size;
        let ballLeftX = ball.position.x;
        let ballRightX = ball.position.x + ball.size;

        return (
            ballBottomY >= paddleTopY &&
            ballBottomY <= paddleTopY + this.height &&
            ballRightX >= paddleLeftX &&
            ballLeftX <= paddleRightX
        );
    }
}