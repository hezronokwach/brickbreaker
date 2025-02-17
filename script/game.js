import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import Brick from './brick.js';
import { level1, buildLevel,level2 } from './levels.js';

export const GAMESTATE = {
    PAUSE: 0,
    PLAY: 1,
    MENU: 2, // start menu
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
    color: #E63946;
    font-family: 'Press Start 2P', cursive;
    z-index: 1000;
    background: #1D3557;
    padding: 20px;
    border: 2px solid #457B9D;
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
`;

const buttonStyles = `
    font-family: 'Press Start 2P', cursive;
    padding: 15px 30px;
    margin: 10px;
    cursor: pointer;
    background: #A8DADC;
    color: #1D3557;
    border: 2px solid #457B9D;
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
        this.levels = [level1]; // Add level2 to levels array
        this.currentLevel = 0;

        // Get DOM elements
        this.initializeDOM();
        
        // Initialize empty arrays first
        this.gameObjects = [];
        this.bricks = [];
        
        // Create paddle and ball
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        
        this.inputHandler = new InputHandler(this.paddle, this);
        this.start();

        this.activeGameOverScreen = null; // Track active screen

        this.initializeKeyboardControls();

        this.balls = [this.ball]; // Store all active balls
        this.powerUps = []; // Store active power-ups
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
        if (this.gamestate !== GAMESTATE.MENU && 
            this.gamestate !== GAMESTATE.NEWLEVEL) return;

        // Clear existing bricks
        this.bricks.forEach(brick => {
            if (brick.element) brick.element.remove();
        });
        
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
        if (this.gamestate !== GAMESTATE.PLAY) return;

        // Update paddle
        this.paddle.update(deltaTime);
        
        // Update and filter balls
        let ballsToRemove = [];
        this.balls.forEach(ball => {
            if (!ball.update(deltaTime)) {
                ballsToRemove.push(ball);
            }
        });

        // Remove lost balls
        this.balls = this.balls.filter(ball => !ballsToRemove.includes(ball));

        // Check if all balls are lost
        if (this.balls.length === 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gamestate = GAMESTATE.OVER;
            } else {
                // Create new ball only if player still has lives
                this.ball = new Ball(this);
                this.balls = [this.ball];
            }
        }

        // Check for level completion
        if (this.bricks.length === 0) {
            this.currentLevel++;
            if (this.currentLevel >= this.levels.length) {
                this.gamestate = GAMESTATE.WIN;
            } else {
                // Show level transition
                this.gamestate = GAMESTATE.NEWLEVEL;
                this.start();
            }
        }

        // Update bricks and powerups
        this.bricks.forEach(brick => brick.update(deltaTime));
        this.bricks = this.bricks.filter(brick => !brick.delete);

        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update(deltaTime);
            return !powerUp.delete;
        });

        // Update timer and scoreboard
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
                    <h1 style="font-size: 2em; margin-bottom: 20px; color: #E63946;">GAME OVER</h1>
                    <p style="margin: 15px 0; color: #F1FAEE;">Final Score: ${this.score}</p>
                    <p style="margin: 15px 0; color: #F1FAEE;">Time: ${Math.floor(this.time)}s</p>
                    <button id="restartButton" style="${buttonStyles}">
                        PLAY AGAIN
                    </button>
                `;
                
                this.gameContainer.appendChild(gameOverScreen);
                this.activeGameOverScreen = gameOverScreen;
                
                // Add button hover effects
                const restartButton = gameOverScreen.querySelector('#restartButton');
                restartButton.addEventListener('mouseover', () => {
                    restartButton.style.background = '#457B9D';
                    restartButton.style.color = '#F1FAEE';
                    restartButton.style.transform = 'scale(1.05)';
                });
                restartButton.addEventListener('mouseout', () => {
                    restartButton.style.background = '#A8DADC';
                    restartButton.style.color = '#1D3557';
                    restartButton.style.transform = 'scale(1)';
                });
                
                // Show screen with fade in
                requestAnimationFrame(() => {
                    gameOverScreen.style.opacity = '1';
                });
                
                restartButton.onclick = () => {
                    this.restart();
                    gameOverScreen.remove();
                    this.activeGameOverScreen = null;
                };
            }
        } else {
            if (this.activeGameOverScreen) {
                this.activeGameOverScreen.remove();
                this.activeGameOverScreen = null;
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

        if (this.gamestate === GAMESTATE.WIN) {
            if (!this.activeWinScreen) {
                const winScreen = document.createElement('div');
                winScreen.className = 'win-screen';
                winScreen.style.cssText = overlayStyles;
                
                const minutes = Math.floor(this.time / 60);
                const seconds = Math.floor(this.time % 60);
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                winScreen.innerHTML = `
                    <h1 style="font-size: 2em; margin-bottom: 20px;">CONGRATULATIONS!</h1>
                    <p style="margin: 15px 0;">YOU HAVE WON!</p>
                    <p style="margin: 15px 0;">Final Score: ${this.score}</p>
                    <p style="margin: 15px 0;">Time: ${timeString}</p>
                    <button id="restartButton" style="${buttonStyles}">
                        PLAY AGAIN
                    </button>
                `;
                
                this.gameContainer.appendChild(winScreen);
                this.activeWinScreen = winScreen;
                
                const restartButton = winScreen.querySelector('#restartButton');
                restartButton.addEventListener('mouseover', () => {
                    restartButton.style.background = '#555';
                });
                restartButton.addEventListener('mouseout', () => {
                    restartButton.style.background = '#333';
                });
                restartButton.onclick = () => this.restart();
            }
        } else if (this.activeWinScreen) {
            this.activeWinScreen.remove();
            this.activeWinScreen = null;
        }

        this.balls.forEach(ball => ball.draw());
        this.powerUps.forEach(powerUp => powerUp.draw());
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
        if (this.gamestate === GAMESTATE.PLAY) {
            this.gamestate = GAMESTATE.PAUSE;
            this.createPauseScreen();
        } else if (this.gamestate === GAMESTATE.PAUSE) {
            this.gamestate = GAMESTATE.PLAY;
            if (this.activePauseScreen) {
                this.hideOverlay(this.activePauseScreen);
                this.activePauseScreen = null;
            }
        }
    }

    createPauseScreen() {
        if (this.activePauseScreen) return;
        
        const pauseScreen = document.createElement('div');
        pauseScreen.className = 'pause-screen';
        pauseScreen.style.cssText = overlayStyles;
        
        pauseScreen.innerHTML = `
            <h1 style="font-size: 2em; margin-bottom: 20px;">PAUSED</h1>
            <p style="margin: 15px 0;">Score: ${this.score}</p>
            <button id="pauseContinueButton" style="${buttonStyles}">CONTINUE</button>
            <button id="pauseRestartButton" style="${buttonStyles}">RESTART</button>
        `;
        
        this.gameContainer.appendChild(pauseScreen);
        this.activePauseScreen = pauseScreen;
    
        // Add event listeners
        pauseScreen.querySelector('#pauseContinueButton').onclick = () => {
            this.gamestate = GAMESTATE.PLAY;
            this.hideOverlay(this.activePauseScreen);
            this.activePauseScreen = null;
        };
        
        pauseScreen.querySelector('#pauseRestartButton').onclick = () => {
            this.restart();
        };
    
        requestAnimationFrame(() => {
            pauseScreen.style.opacity = '1';
        });
    }
    
    addScore(points) {
        this.score += points;
        this.updateScoreboard();
    }

    clearGameObjects() {
        // Remove all game elements from DOM
        this.balls.forEach(ball => ball.element && ball.element.remove());
        this.bricks.forEach(brick => brick.element && brick.element.remove());
        this.powerUps.forEach(powerUp => powerUp.element && powerUp.element.remove());
        this.paddle.element && this.paddle.element.remove();

        // Clear arrays
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        this.gameObjects = [];
    }

    restart() {
        // Clear all screens first
        if (this.activeGameOverScreen) {
            this.activeGameOverScreen.remove();
            this.activeGameOverScreen = null;
        }
        if (this.activePauseScreen) {
            this.activePauseScreen.remove();
            this.activePauseScreen = null;
        }
        
        // Clear all game objects
        this.clearGameObjects();
        
        // Reset game state
        this.lives = 2;
        this.score = 0;
        this.time = 0;
        this.currentLevel = 0;
        this.gamestate = GAMESTATE.MENU;
        
        // Create new game objects
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        this.balls = [this.ball];
        
        // Reset input handler
        if (this.inputHandler) {
            this.inputHandler.destroy();
        }
        this.inputHandler = new InputHandler(this.paddle, this);
        
        // Start fresh
        this.start();
        this.updateScoreboard();
    }

    initializeKeyboardControls() {
        // Remove existing listener if any
        if (this.escKeyHandler) {
            document.removeEventListener('keydown', this.escKeyHandler);
        }
        
        // Create new handler
        this.escKeyHandler = (event) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                event.preventDefault();
                this.pause();
            }
        };
        
        // Add new listener
        document.addEventListener('keydown', this.escKeyHandler);
    }

    showLevelTransition() {
        const levelScreen = document.createElement('div');
        levelScreen.className = 'level-screen';
        levelScreen.style.cssText = overlayStyles;
        
        levelScreen.innerHTML = `
            <h1 style="font-size: 2em; margin-bottom: 20px;">LEVEL ${this.currentLevel + 1}</h1>
            <p style="margin: 15px 0;">Get Ready!</p>
        `;
        
        this.gameContainer.appendChild(levelScreen);
        setTimeout(() => levelScreen.remove(), 2000);
    }

    showOverlay(element) {
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    hideOverlay(element) {
        element.style.opacity = '0';
        element.addEventListener('transitionend', () => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, { once: true });
    }
}