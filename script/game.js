import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import { level1, buildLevel,level2 } from './levels.js';

export const GAMESTATE = {
    PAUSE: 0,
    PLAY: 1,
    MENU: 2, // start menu
    OVER: 3,
    NEWLEVEL: 4,
    WIN: 5
};


// Update overlayStyles to remove transitions
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
    opacity: 1;
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
        
        // Frame timing
        this.lastTime = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        
        // Bind game loop
        this.animationFrame = null;
        this.boundGameLoop = this.gameLoop.bind(this);
        
        // Initialize game objects
        this.initializeDOM();
        this.createGameObjects();
        
        // Start game loop
        requestAnimationFrame(this.boundGameLoop);
    }

    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = this.lastTime ? timestamp - this.lastTime : 0;
        this.lastTime = timestamp;

        // Track FPS
        this.frameCount++;
        if (timestamp - this.lastFPSUpdate > 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = timestamp;
            console.log('FPS:', this.currentFPS);
        }

        // Always render, regardless of state
        this.render();

        // Only update game logic if not paused
        if (this.gamestate === GAMESTATE.PLAY) {
            this.update(deltaTime);
        }

        // Continue the loop
        this.animationFrame = requestAnimationFrame(this.boundGameLoop);
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

    createGameObjects() {
        // Initialize game state
        this.lives = 2;
        this.score = 0;
        this.time = 0;
        this.levels = [level1, level2]; // Add level2 to levels array
        this.currentLevel = 0;
        
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

        // Add FPS tracking
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
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
    
        // Cap deltaTime to ensure a maximum frame time of 16.67ms
        const cappedDeltaTime = Math.min(deltaTime, 16.67);
    
        // Update paddle
        this.paddle.update(cappedDeltaTime);
    
        // Update balls
        let ballsToRemove = [];
        this.balls.forEach(ball => {
            if (!ball.update(cappedDeltaTime)) {
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
                this.gamestate = GAMESTATE.NEWLEVEL;
                // Show level transition screen
                this.showLevelTransition();
                // Start next level after a delay
                setTimeout(() => {
                    if (this.gamestate === GAMESTATE.NEWLEVEL) {
                        this.start();
                    }
                }, 1000);
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

    render() {
        // Always render game objects
        this.paddle.draw();
        this.balls.forEach(ball => ball.draw());
        this.bricks.forEach(brick => brick.draw());
        this.powerUps.forEach(powerUp => powerUp.draw());        
        
        this.handleMenuState();
    }

    handleMenuState() {
        // Menu handling based on state
        switch(this.gamestate) {
            case GAMESTATE.PAUSE:
                if (!this.activePauseScreen) {
                    this.createPauseMenu();
                }
                break;
    
            case GAMESTATE.OVER:
                if (!this.activeGameOverScreen) {
                    this.createGameOverMenu();
                }
                break;
    
            case GAMESTATE.WIN:
                if (!this.activeWinScreen) {
                    this.createWinMenu();
                }
                break;
        }
    }
        
    
    pause() {
        if (this.gamestate === GAMESTATE.PAUSE) {
            // Resume game
            this.gamestate = GAMESTATE.PLAY;
            this.lastTime = performance.now(); // Reset time to prevent large delta
            if (this.activePauseScreen) {
                this.activePauseScreen.remove();
                this.activePauseScreen = null;
            }
        } else {
            // Pause game
            this.gamestate = GAMESTATE.PAUSE;
            this.createPauseMenu();
        }
    }

createPauseMenu() {
    if (this.activePauseScreen) return;

    const pauseScreen = document.createElement('div');
    pauseScreen.className = 'pause-screen';
    pauseScreen.style.cssText = overlayStyles;
    
    // Add frame counter element
    pauseScreen.innerHTML = `
        <h1 class="pulse" style="font-size: 2em; margin-bottom: 20px;">PAUSED</h1>
        <p style="margin: 15px 0;">Score: ${this.score}</p>
        <button id="pauseContinueButton" style="${buttonStyles}">
            CONTINUE
        </button>
        <button id="pauseRestartButton" style="${buttonStyles}">
            RESTART
        </button>
    `;
    
    this.gameContainer.appendChild(pauseScreen);
    this.activePauseScreen = pauseScreen;

    // Store counter element reference
    this.pauseCounterElement = pauseScreen.querySelector('#pauseFrameCounter');

    // Add button handlersf
    pauseScreen.querySelector('#pauseContinueButton').onclick = () => {
        this.gamestate = GAMESTATE.PLAY;
        pauseScreen.remove();
        this.activePauseScreen = null;
    };
    
    pauseScreen.querySelector('#pauseRestartButton').onclick = () => {
        this.restart();
        pauseScreen.remove();
        this.activePauseScreen = null;
    };
}

createGameOverMenu() {
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
    
    gameOverScreen.querySelector('#restartButton').onclick = () => {
        this.restart();
        gameOverScreen.remove();
        this.activeGameOverScreen = null;
    };
}

createWinMenu() {
    const winScreen = document.createElement('div');
    winScreen.className = 'win-screen';
    winScreen.style.cssText = overlayStyles;
    
    winScreen.innerHTML = `
        <h1 style="font-size: 2em; margin-bottom: 20px; color: #2A9D8F;">YOU WIN!</h1>
        <p style="margin: 15px 0; color: #F1FAEE;">Final Score: ${this.score}</p>
        <p style="margin: 15px 0; color: #F1FAEE;">Time: ${Math.floor(this.time)}s</p>
        <button id="playAgainButton" style="${buttonStyles}">
            PLAY AGAIN
        </button>
    `;
    
    this.gameContainer.appendChild(winScreen);
    this.activeWinScreen = winScreen;
    
    winScreen.querySelector('#playAgainButton').onclick = () => {
        this.restart();
        winScreen.remove();
        this.activeWinScreen = null;
    };
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
        setTimeout(() => levelScreen.remove(), 1000);
    }

}