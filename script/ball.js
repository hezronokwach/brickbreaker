export default class Ball {
    constructor(game) {
        this.game = game;
        this.size = 16;
        this.element = document.createElement('div');
        this.element.className = 'ball';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.game.gameContainer.appendChild(this.element);
        // Adjust base speed for smoother movement
        this.baseSpeed = { x: 0.35, y: -0.15 }; 
        this.reset();
    }

    reset() {
        const speedMultiplier = 1 + (this.game.currentLevel * 0.2);
        this.speed = {
            x: this.baseSpeed.x * speedMultiplier,
            y: this.baseSpeed.y * speedMultiplier
        };
        
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
        // Apply deltaTime to movement for consistent speed
        this.position.x += this.speed.x * deltaTime;
        this.position.y += this.speed.y * deltaTime;

        // Wall collisions
        if (this.position.x < 0 || this.position.x + this.size > this.game.gamewidth) {
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

        this.draw();
    }
}