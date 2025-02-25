import SoundManager from './sounds.js';

export default class Ball {
    constructor(game, startStuck = true) {
        this.game = game;
        this.size = 16;
        this.element = document.createElement('div');
        this.element.className = 'ball';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.game.gameContainer.appendChild(this.element);
        this.isStuck = startStuck;  // Allow control of initial stuck state
        this.initialSpeed = { x: 6, y: -4 }; // Set initial speed
        this.reset();
    }

    reset() {
        this.speed = { ...this.initialSpeed }; // Reset to initial speed
        this.isStuck = true; // Reset to stuck state
        this.updatePosition(); // Update initial position
        this.draw(); // Draw immediately after reset
    }

    updatePosition() {
        if (this.isStuck) {
            // Position ball on paddle
            const paddleCenter = this.game.paddle.position.x + (this.game.paddle.width / 2);
            this.position = {
                x: paddleCenter - (this.size / 2),
                y: this.game.paddle.position.y - this.size
            };
        }
    }

    draw() {
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    release() {
        if (this.isStuck) {
            // Set initial speed
            this.speed = { ...this.initialSpeed };
            this.isStuck = false;
            SoundManager.playSound('gameStart');
        }
    }

    update(deltaTime) {
        if (this.isStuck) {
            this.updatePosition();
            return true;
        }

        // Update speed calculations
        const speedX = this.speed.x * (deltaTime / 16.67); // Normalize to 60fps
        const speedY = this.speed.y * (deltaTime / 16.67);

        this.position.x += speedX;
        this.position.y += speedY;

        // Wall collisions
        if (this.position.x + this.size > this.game.gamewidth || this.position.x < 0) {
            this.speed.x = -this.speed.x;
            this.position.x = Math.max(0, Math.min(this.position.x, this.game.gamewidth - this.size));
            SoundManager.playSound('brickHit');
        }
        
        if (this.position.y < 0) {
            this.speed.y = -this.speed.y;
            this.position.y = 0;
            SoundManager.playSound('brickHit');
        }

        // Paddle collision
        if (this.game.paddle.collidesWith(this)) {
            // Ensure upward movement and maintain consistent speed
            this.speed.y = -Math.abs(this.speed.y); // Ensure upward movement
            this.position.y = this.game.paddle.position.y - this.size; // Prevent sticking
            
            SoundManager.playSound('paddleHit');
        }

        // Bottom wall collision - remove ball
        if (this.position.y + this.size > this.game.gameheight) {
            this.element.remove(); // Remove DOM element
            SoundManager.playSound('gameOver');
            return false; // Signal ball should be removed
        }

        this.draw();
        return true;
    }
}