import { detectCollision } from "./detectCollision.js";
import PowerUp from "./powerup.js";
import SoundManager from './sounds.js';

export default class Brick {
    constructor(game, position, type = "normal") {
        this.game = game;
        this.position = position;
        this.width = 80;
        this.height = 24;
        this.delete = false;
        this.points = 10;
        this.element = document.createElement('div');
        this.element.className = 'brick';
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.game.brickContainer.appendChild(this.element); // Append to brick container
        this.type = type;
        this.element.classList.add(`brick-${type}`);
        if (type === 'multiball' || type === 'extralife') {
            this.points = 20;
        }
    }

    draw() {
        // Remove deltaTime dependency
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    update() {
        if (this.game.balls.some(ball => detectCollision(ball, this))) {
            // Handle collision with any ball
            const collidingBall = this.game.balls.find(ball => detectCollision(ball, this));
            collidingBall.speed.y = -collidingBall.speed.y;
            
            // Play brick hit sound
            SoundManager.playSound('brickHit');

            if (this.type !== 'normal') {
                // Create power-up
                const powerUp = new PowerUp(
                    this.game,
                    {
                        x: this.position.x + this.width/2,
                        y: this.position.y
                    },
                    this.type === 'multiball' ? 'multiball' : 'extralife'
                );
                this.game.powerUps.push(powerUp);
                // Play power-up spawn sound
                SoundManager.playSound('powerUp');
            }

            this.delete = true;
            this.element.remove();
            this.game.addScore(this.points);
        }
    }
}