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
        this.speed = { x: 6, y: -4 }; // Adjusted speed
        this.position = {
            x: this.game.gamewidth / 2 - this.size / 2,
            y: this.game.gameheight - 100
        };
        this.draw(); // Draw immediately after reset
    }

    draw() {
        // Replace direct style assignments with transform
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    update(deltaTime) {
        const speedX = this.speed.x * (deltaTime / 16.67);
        const speedY = this.speed.y * (deltaTime / 16.67);

        this.position.x += speedX;
        this.position.y += speedY;

        // Wall collisions
        if (this.position.x + this.size > this.game.gamewidth || this.position.x < 0) {
            this.speed.x = -this.speed.x;
            this.position.x = Math.max(0, Math.min(this.position.x, this.game.gamewidth - this.size));
        }
        
        if (this.position.y < 0) {
            this.speed.y = -this.speed.y;
            this.position.y = 0;
        }

        // Paddle collision
        if (this.game.paddle.collidesWith(this)) {
            this.speed.y = -Math.abs(this.speed.y); // Ensure upward movement
            this.position.y = this.game.paddle.position.y - this.size; // Prevent sticking
        }

        // Bottom wall collision - remove ball
        if (this.position.y + this.size > this.game.gameheight) {
            this.element.remove(); // Remove DOM element
            return false; // Signal ball should be removed
        }

        this.draw();
        return true;
    }
}