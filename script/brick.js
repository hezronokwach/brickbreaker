import { detectCollision } from "./detectCollision.js";

export default class Brick {
    constructor(game, position) {
        this.game = game;
        this.position = position;
        this.width = 80;
        this.height = 24;
        this.delete = false;
        this.element = document.createElement('div');
        this.element.className = 'brick';
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.game.gameContainer.appendChild(this.element); // Use this.game.gameContainer
    }

    draw() {
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }

    update() {
        if (detectCollision(this.game.ball, this)) {
            this.game.ball.speed.y = -this.game.ball.speed.y;
            this.delete = true;
            this.element.remove();
        }
    }
}