import { GAMESTATE } from "./game.js";
export default class InputHandler {
    constructor(paddle, game) {
        this.paddle = paddle;
        this.game = game;
        
        // Store bound handlers to be able to remove them
        this.keyDownHandler = this.handleKeyDown.bind(this);
        this.keyUpHandler = this.handleKeyUp.bind(this);
        
        this.initializeControls();
    }

    initializeControls() {
        // Remove existing listeners if any
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        
        // Add new listeners
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    handleKeyDown(event) {
        if (this.game.gamestate === GAMESTATE.PLAY) {
            switch(event.keyCode) {
                case 37: // Left arrow
                    event.preventDefault();
                    this.paddle.moveLeft();
                    break;
                case 39: // Right arrow
                    event.preventDefault();
                    this.paddle.moveRight();
                    break;
            }
        }
        
        if (event.keyCode === 32) { // Space bar
            event.preventDefault();
            if (this.game.gamestate === GAMESTATE.MENU || 
                this.game.gamestate === GAMESTATE.NEWLEVEL) {
                this.game.start();
            }
        }
    }

    handleKeyUp(event) {
        switch(event.keyCode) {
            case 37:
                if(this.paddle.speed < 0) this.paddle.stop();
                break;
            case 39:
                if(this.paddle.speed > 0) this.paddle.stop();
                break;
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    }
}