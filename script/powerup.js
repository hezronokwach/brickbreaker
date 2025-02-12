export default class PowerUp {
    constructor(game, position, type) {
        this.game = game;
        this.position = position;
        this.width = 30;
        this.height = 30;
        this.speed = { x: 0, y: 2 }; // Falls downward
        this.type = type;
        this.element = document.createElement('div');
        this.element.className = `power-up power-up-${type}`;
        this.setupElement();
    }

    setupElement() {
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.game.gameContainer.appendChild(this.element);
    }

    draw() {
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }

    update() {
        this.position.y += this.speed.y;
        
        // Check paddle collision
        if (this.collidesWithPaddle()) {
            this.activate();
            this.element.remove();
            return true;
        }

        // Remove if falls below screen
        if (this.position.y > this.game.gameheight) {
            this.element.remove();
            return true;
        }

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
        // Create two new balls
        for (let i = 0; i < 2; i++) {
            const newBall = new this.game.ball.constructor(this.game);
            newBall.position = { ...this.game.ball.position };
            newBall.speed = {
                x: this.game.ball.speed.x * (i ? 1 : -1),
                y: this.game.ball.speed.y
            };
            this.game.balls.push(newBall);
        }
    }
}