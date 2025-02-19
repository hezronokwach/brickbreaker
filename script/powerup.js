import { detectCollision } from "./detectCollision.js";
import Ball from "./ball.js";
export default class PowerUp {
    constructor(game, position, type) {
        this.game = game;
        this.position = position;
        this.width = 30;
        this.height = 30;
        this.speed = { x: 0, y: 2 }; // Falls downward
        this.type = type;
        this.delete = false;
        this.element = document.createElement('div');
        this.element.className = `power-up power-up-${type}`;
        this.setupElement();
    }

    setupElement() {
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.game.gameContainer.appendChild(this.element);
    }

    draw(deltaTime) {
        const movement = deltaTime ? (this.speed.y * (deltaTime / 16.67)) : 0;
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y + movement}px)`;
    }

    update(deltaTime) {
        const speedY = this.speed.y * (deltaTime / 16.67);
        this.position.y += speedY;

        
        // Check paddle collision
        if (this.collidesWithPaddle()) {
            this.activate();
            this.delete = true;
            this.element.remove();
            return true;
        }

        // Remove if falls below screen
        if (this.position.y > this.game.gameheight) {
            this.delete = true;
            this.element.remove();
            return true;
        }

        this.draw();
        return false;
    }

    collidesWithPaddle() {
        return (
            this.position.x < this.game.paddle.position.x + this.game.paddle.width &&
            this.position.x + this.width > this.game.paddle.position.x &&
            this.position.y + this.height > this.game.paddle.position.y
        );
    }

    activate() {
        switch(this.type) {
            case 'multiball':
                this.activateMultiBall();
                break;
            case 'extralife':
                this.game.lives++;
                break;
        }
    }

    activateMultiBall() {
        const currentBall = this.game.balls[0];
        if (!currentBall) return;

        // Create two new balls with different angles
        for (let i = 0; i < 2; i++) {
            const newBall = new Ball(this.game);
            newBall.position = { 
                x: currentBall.position.x,
                y: currentBall.position.y 
            };
            // Give different angles to the new balls
            newBall.speed = {
                x: currentBall.speed.x * (i === 0 ? -0.8 : 1.2),
                y: currentBall.speed.y
            };
            this.game.balls.push(newBall);
        }
    }
}