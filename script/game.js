// Import necessary modules and classes
import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import { level1, buildLevel, level2 } from './levels.js';

// Define game states as constants for better readability and maintainability
export const GAMESTATE = {
    WELCOME: 0,    // Welcome screen state
    PAUSE: 1,      // Paused state
    PLAY: 2,       // Playing state
    MENU: 3,       // Main menu state
    OVER: 4,       // Game over state
    NEWLEVEL: 5,   // Transition to a new level
    WIN: 6         // Game won state
};

// Define styles for overlays (e.g., welcome screen, pause menu)
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

// Define styles for buttons used in overlays
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

// Main Game class
export default class Game {
    constructor(gamewidth, gameheight) {
        this.gamewidth = gamewidth;  // Width of the game canvas
        this.gameheight = gameheight; // Height of the game canvas
        this.gamestate = GAMESTATE.WELCOME; // Initial game state

        // Frame timing variables for FPS calculation
        this.lastTime = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;

        // Bind the game loop to the current instance
        this.animationFrame = null;
        this.boundGameLoop = this.gameLoop.bind(this);

        // Initialize DOM elements and game objects
        this.initializeDOM();
        this.createGameObjects();

        // Create the welcome screen
        this.createWelcomeScreen();

        // Start the game loop
        requestAnimationFrame(this.boundGameLoop);
    }

    // Create the welcome screen with instructions and a start button
    createWelcomeScreen() {
        if (this.activeWelcomeScreen) return; // Avoid creating multiple welcome screens

        const welcomeScreen = document.createElement('div');
        welcomeScreen.className = 'welcome-screen';
        welcomeScreen.style.cssText = overlayStyles;

        // Welcome screen content
        welcomeScreen.innerHTML = `
            <h1 style="font-size: 2em; margin-bottom: 20px; color: #2A9D8F;">BRICK BREAKER</h1>
            <div style="margin: 20px 0; color: #F1FAEE; font-size: 0.8em;">
                <p style="margin: 10px 0;">Use ← → to move paddle</p>
                <p style="margin: 10px 0;">Press ↑ to launch ball</p>
                <p style="margin: 10px 0;">Press ESC to pause</p>
            </div>
            <button id="startGameButton" style="${buttonStyles}">
                START GAME
            </button>
        `;

        // Append the welcome screen to the game container
        this.gameContainer.appendChild(welcomeScreen);
        this.activeWelcomeScreen = welcomeScreen;

        // Add event listener to the start button
        welcomeScreen.querySelector('#startGameButton').onclick = () => {
            welcomeScreen.remove(); // Remove the welcome screen
            this.activeWelcomeScreen = null;
            this.gamestate = GAMESTATE.MENU; // Transition to the menu state
            this.start(); // Start the game
        };
    }

    // Main game loop
    gameLoop(timestamp) {
        const deltaTime = this.lastTime ? timestamp - this.lastTime : 0; // Calculate time since last frame
        this.lastTime = timestamp;

        this.render(); // Render the game

        if (this.gamestate === GAMESTATE.PLAY) {
            this.update(deltaTime); // Update game logic if in PLAY state
        }

        // Request the next frame
        this.animationFrame = requestAnimationFrame(this.boundGameLoop);
    }

    // Initialize DOM elements
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

        // Create a container for bricks
        this.brickContainer = document.createElement('div');
        this.brickContainer.className = 'brick-container';
        this.gameContainer.appendChild(this.brickContainer);
    }

    // Create game objects (paddle, ball, bricks, etc.)
    createGameObjects() {
        this.lives = 2; // Initial number of lives
        this.score = 0; // Initial score
        this.time = 0; // Initial game time
        this.levels = [level1, level2]; // Array of levels
        this.currentLevel = 0; // Current level index

        this.gameObjects = []; // Array to store game objects
        this.bricks = []; // Array to store bricks

        // Initialize paddle and ball
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);

        // Initialize input handler for paddle controls
        this.inputHandler = new InputHandler(this.paddle, this);
        this.start(); // Start the game

        this.activeGameOverScreen = null; // Track if the game over screen is active

        this.initializeKeyboardControls(); // Set up keyboard controls

        this.balls = [this.ball]; // Array to store balls (currently only one ball)
        this.powerUps = []; // Array to store power-ups

        // Frame timing variables
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
    }

    // Start or restart the game
    start() {
        if (this.gamestate !== GAMESTATE.MENU &&
            this.gamestate !== GAMESTATE.NEWLEVEL) return;

        // Clear existing bricks
        this.bricks.forEach(brick => {
            if (brick.element) brick.element.remove();
        });

        // Build the current level
        this.bricks = buildLevel(this, this.levels[this.currentLevel]);

        // Clear existing balls
        this.balls.forEach(ball => ball.element && ball.element.remove());

        // Create a new ball
        this.ball = new Ball(this, true);
        this.balls = [this.ball];

        // Set game objects
        this.gameObjects = [this.ball, this.paddle];

        // Transition to PLAY state
        this.gamestate = GAMESTATE.PLAY;

        // Update the scoreboard
        this.updateScoreboard();
    }

    // Update game logic
    update(deltaTime) {
        if (this.gamestate !== GAMESTATE.PLAY) return;

        // Cap deltaTime to prevent large jumps in game logic
        const cappedDeltaTime = Math.min(deltaTime, 16.67);

        // Update paddle position
        this.paddle.update(cappedDeltaTime);

        // Update balls and remove any that are out of bounds
        let ballsToRemove = [];
        this.balls.forEach(ball => {
            if (!ball.update(cappedDeltaTime)) {
                ballsToRemove.push(ball);
            }
        });
        this.balls = this.balls.filter(ball => !ballsToRemove.includes(ball));

        // Handle ball loss
        if (this.balls.length === 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gamestate = GAMESTATE.OVER; // Game over if no lives left
            } else {
                // Create a new ball if lives remain
                this.ball = new Ball(this, true);
                this.balls = [this.ball];
            }
        }

        // Check if all bricks are destroyed
        if (this.bricks.length === 0) {
            this.currentLevel++;
            if (this.currentLevel >= this.levels.length) {
                this.gamestate = GAMESTATE.WIN; // Game won if all levels are completed
            } else {
                // Transition to the next level
                this.gamestate = GAMESTATE.NEWLEVEL;
                this.showLevelTransition();
                setTimeout(() => {
                    if (this.gamestate === GAMESTATE.NEWLEVEL) {
                        this.start();
                    }
                }, 1000);
            }
        }

        // Update bricks and remove any that are destroyed
        this.bricks.forEach(brick => brick.update(deltaTime));
        this.bricks = this.bricks.filter(brick => !brick.delete);

        // Update power-ups and remove any that are expired
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update(deltaTime);
            return !powerUp.delete;
        });

        // Update game time and scoreboard
        this.time += deltaTime / 1000;
        this.updateScoreboard();
    }

    // Update the scoreboard with current time, score, and lives
    updateScoreboard() {
        if (this.timerElement) {
            let hours = Math.floor(this.time / 3600);
            let minutes = Math.floor(this.time / 60) % 60;
            let seconds = Math.floor(this.time) % 60;

            let formattedTime =
                (hours > 0 ? hours.toString().padStart(2, '0') + ':' : '') +
                minutes.toString().padStart(2, '0') + ':' +
                seconds.toString().padStart(2, '0');

            this.timerElement.textContent = formattedTime;
        }
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        if (this.livesElement) {
            this.livesElement.textContent = this.lives;
        }
    }

    // Render game objects
    render() {
        this.paddle.draw(); // Draw the paddle
        this.balls.forEach(ball => ball.draw()); // Draw all balls
        this.bricks.forEach(brick => brick.draw()); // Draw all bricks
        this.powerUps.forEach(powerUp => powerUp.draw()); // Draw all power-ups

        // Handle menu states (e.g., welcome, pause, game over, win)
        this.handleMenuState();
    }

    // Handle menu states and display appropriate screens
    handleMenuState() {
        switch (this.gamestate) {
            case GAMESTATE.WELCOME:
                if (!this.activeWelcomeScreen) {
                    this.createWelcomeScreen();
                }
                break;

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

    // Pause or resume the game
    pause() {
        if (this.gamestate === GAMESTATE.PAUSE) {
            // Resume the game
            this.gamestate = GAMESTATE.PLAY;
            this.lastTime = performance.now();
            if (this.activePauseScreen) {
                this.activePauseScreen.remove();
                this.activePauseScreen = null;
            }
        } else {
            // Pause the game
            this.gamestate = GAMESTATE.PAUSE;
            this.createPauseMenu();
        }
    }

    // Create the pause menu
    createPauseMenu() {
        if (this.activePauseScreen) return;

        const pauseScreen = document.createElement('div');
        pauseScreen.className = 'pause-screen';
        pauseScreen.style.cssText = overlayStyles;

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

        // Add event listeners to pause menu buttons
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

    // Create the game over menu
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

        // Add event listener to the restart button
        gameOverScreen.querySelector('#restartButton').onclick = () => {
            this.restart();
            gameOverScreen.remove();
            this.activeGameOverScreen = null;
        };
    }

    // Create the win menu
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

        // Add event listener to the play again button
        winScreen.querySelector('#playAgainButton').onclick = () => {
            this.restart();
            winScreen.remove();
            this.activeWinScreen = null;
        };
    }

    // Add points to the score
    addScore(points) {
        this.score += points;
        this.updateScoreboard();
    }

    // Clear all game objects
    clearGameObjects() {
        this.balls.forEach(ball => ball.element && ball.element.remove());
        this.bricks.forEach(brick => brick.element && brick.element.remove());
        this.powerUps.forEach(powerUp => powerUp.element && powerUp.element.remove());
        this.paddle.element && this.paddle.element.remove();

        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        this.gameObjects = [];
    }

    // Restart the game
    restart() {
        if (this.activeGameOverScreen) {
            this.activeGameOverScreen.remove();
            this.activeGameOverScreen = null;
        }
        if (this.activePauseScreen) {
            this.activePauseScreen.remove();
            this.activePauseScreen = null;
        }

        this.clearGameObjects(); // Clear all game objects

        // Reset game state
        this.lives = 2;
        this.score = 0;
        this.time = 0;
        this.currentLevel = 0;
        this.gamestate = GAMESTATE.MENU;

        // Reinitialize paddle and ball
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        this.ball.isStuck = true;
        this.balls = [this.ball];

        // Reinitialize input handler
        if (this.inputHandler) {
            this.inputHandler.destroy();
        }
        this.inputHandler = new InputHandler(this.paddle, this);

        this.start(); // Start the game
        this.updateScoreboard(); // Update the scoreboard
    }

    // Initialize keyboard controls (e.g., ESC to pause)
    initializeKeyboardControls() {
        if (this.escKeyHandler) {
            document.removeEventListener('keydown', this.escKeyHandler);
        }

        this.escKeyHandler = (event) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                event.preventDefault();
                this.pause(); // Pause the game on ESC key press
            }
        };

        document.addEventListener('keydown', this.escKeyHandler);
    }

    // Show a level transition screen
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