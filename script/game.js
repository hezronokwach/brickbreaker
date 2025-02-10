import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import Brick from './brick.js';
import { level1, buildLevel, level2 } from './levels.js';

export const GAMESTATE = {
    PAUSE: 0,
    PLAY: 1,
    MENU: 2,
    OVER: 3,
    NEWLEVEL: 4,
    WIN: 5
};

// Add shared styles at class level
const overlayStyles = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    font-family: 'Press Start 2P', cursive;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.9);
    padding: 20px;
    border: 2px solid #666;
    border-radius: 10px;
`;

const buttonStyles = `
    font-family: 'Press Start 2P', cursive;
    padding: 15px 30px;
    margin: 10px;
    cursor: pointer;
    background: #333;
    color: white;
    border: 2px solid #666;
    border-radius: 5px;
    transition: all 0.3s;
`;

export default class Game {
    constructor(gamewidth, gameheight) {
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
        this.gamestate = GAMESTATE.MENU;
        
        // Initialize game state
        this.lives = 2;
        this.score = 0;
        this.time = 0;
        this.levels = [level1, level2];
        this.currentLevel = 0;

        // Get DOM elements
        this.initializeDOM();
        
        // Initialize empty arrays first
        this.gameObjects = [];
        this.bricks = [];
        
        // Create paddle and ball
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        
        new InputHandler(this.paddle, this);
        this.start();

        this.activeGameOverScreen = null; // Track active screen
    }

    initializeDOM() {
        this.gameContainer = document.getElementById('gameContainer');
        this.scoreboard = document.getElementById('scoreboard');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');

        if (!this.gameContainer) {
            throw new Error('Game container not found!');
        }
    }

    start() {
        // Remove duplicate condition
        if (this.gamestate !== GAMESTATE.MENU && 
            this.gamestate !== GAMESTATE.NEWLEVEL) return;

        // Reset/build level
        this.bricks = buildLevel(this, this.levels[this.currentLevel]);
        this.ball.reset();
        
        // Update game objects array
        this.gameObjects = [this.ball, this.paddle];
        
        // Change state to PLAY
        this.gamestate = GAMESTATE.PLAY;
        
        // Update display
        this.updateScoreboard();
    }

    update(deltaTime) {
        if (this.lives === 0) this.gamestate = GAMESTATE.OVER;

        if (this.gamestate === GAMESTATE.PAUSE || this.gamestate === GAMESTATE.MENU || this.gamestate === GAMESTATE.OVER) return;

        if (this.bricks.length === 0) {
            this.currentLevel++;
            if (this.currentLevel >= this.levels.length) {
                this.gamestate = GAMESTATE.WIN;
                return;
            }
            this.gamestate = GAMESTATE.NEWLEVEL;
            this.start();
        }

        [...this.gameObjects, ...this.bricks].forEach(object => object.update(deltaTime));
        this.bricks = this.bricks.filter(brick => !brick.delete);

        // Update timer
        this.time += deltaTime / 1000;
        this.updateScoreboard();
    }

    draw() {
        if (!this.gameContainer) return;
        
        // Draw game objects
        this.gameObjects.forEach(object => object.draw());
        this.bricks.forEach(brick => brick.draw());

        // Handle game over screen
        if (this.gamestate === GAMESTATE.OVER) {
            if (!this.activeGameOverScreen) {
                const gameOverScreen = document.createElement('div');
                gameOverScreen.className = 'game-over-screen';
                gameOverScreen.style.cssText = overlayStyles;
                
                gameOverScreen.innerHTML = `
                    <h1 style="font-size: 2em; margin-bottom: 20px;">GAME OVER</h1>
                    <p style="margin: 15px 0;">Final Score: ${this.score}</p>
                    <button id="restartButton" style="${buttonStyles}">
                        RESTART GAME
                    </button>
                `;
                
                this.gameContainer.appendChild(gameOverScreen);
                this.activeGameOverScreen = gameOverScreen;
                
                const restartButton = gameOverScreen.querySelector('#restartButton');
                restartButton.addEventListener('mouseover', () => {
                    restartButton.style.background = '#555';
                });
                restartButton.addEventListener('mouseout', () => {
                    restartButton.style.background = '#333';
                });
                restartButton.onclick = () => this.restart();
            }
        } else {
            if (this.activeGameOverScreen) {
                this.activeGameOverScreen.remove();
                this.activeGameOverScreen = null;
                this.gameContainer.style.background = 'white';
            }
        }

        // Handle pause screen
        if (this.gamestate === GAMESTATE.PAUSE) {
            if (!this.activePauseScreen) {
                const pauseScreen = document.createElement('div');
                pauseScreen.className = 'pause-screen';
                pauseScreen.style.cssText = overlayStyles;
                
                pauseScreen.innerHTML = `
                    <h1 style="font-size: 2em; margin-bottom: 20px;">PAUSED</h1>
                    <p style="margin: 15px 0;">Score: ${this.score}</p>
                    <p style="margin: 15px 0;">Press ESC to continue</p>
                    <button id="pauseContinueButton" style="${buttonStyles}">
                        CONTINUE
                    </button>
                    <button id="pauseRestartButton" style="${buttonStyles}">
                        RESTART
                    </button>
                `;
                
                this.gameContainer.appendChild(pauseScreen);
                this.activePauseScreen = pauseScreen;

                const buttons = pauseScreen.querySelectorAll('button');
                buttons.forEach(button => {
                    button.addEventListener('mouseover', () => {
                        button.style.background = '#555';
                    });
                    button.addEventListener('mouseout', () => {
                        button.style.background = '#333';
                    });
                });
                
                pauseScreen.querySelector('#pauseContinueButton').onclick = () => {
                    this.gamestate = GAMESTATE.PLAY;
                    this.activePauseScreen.remove();
                    this.activePauseScreen = null;
                };
                
                pauseScreen.querySelector('#pauseRestartButton').onclick = () => {
                    this.restart();
                    this.activePauseScreen.remove();
                    this.activePauseScreen = null;
                };
            }
        } else if (this.activePauseScreen) {
            this.activePauseScreen.remove();
            this.activePauseScreen = null;
        }

    }

    updateScoreboard() {
        if (this.timerElement) {
            this.timerElement.textContent = Math.floor(this.time);
        }
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        if (this.livesElement) {
            this.livesElement.textContent = this.lives;
        }
    }

    pause() {
        if (this.gamestate === GAMESTATE.PAUSE) {
            this.gamestate = GAMESTATE.PLAY;
        } else {
            this.gamestate = GAMESTATE.PAUSE;
        }
    }

    addScore(points) {
        this.score += points;
        this.updateScoreboard();
    }

    restart() {
        if (this.activeGameOverScreen) {
            this.activeGameOverScreen.remove();
            this.activeGameOverScreen = null;
        }
        this.lives = 2;
        this.score = 0;
        this.time = 0;
        this.currentLevel = 0;
        this.gamestate = GAMESTATE.MENU;
        this.start();
        this.updateScoreboard();
    }
}