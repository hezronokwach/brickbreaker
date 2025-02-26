import { detectCollision } from "./detectCollision.js";
import PowerUp from "./powerup.js";

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
        this.game.brickContainer.appendChild(this.element);
        this.type = type;
        this.element.classList.add(`brick-${type}`);

        if (type === 'multiball' || type === 'extralife') {
            this.points = 20;
        }
    }

    draw() {
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    update(deltaTime) {
        for (let ball of this.game.balls) {
            if (detectCollision(ball, this, deltaTime)) {
                if (!this.delete) {
                    this.delete = true;
                    this.element.remove();
                    this.game.addScore(this.points);

                    if (this.type !== 'normal') {
                        const powerUp = new PowerUp(
                            this.game,
                            {
                                x: this.position.x + this.width / 2,
                                y: this.position.y
                            },
                            this.type === 'multiball' ? 'multiball' : 'extralife'
                        );
                        this.game.powerUps.push(powerUp);
                    }
                }
                break;
            }
        }
    }
}
