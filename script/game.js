import Paddle from './paddle.js';
import InputHandler from './input.js';
import Ball from './ball.js';
import { level1, buildLevel, level2 } from './levels.js';

export const GAMESTATE = {
    WELCOME: 0,
    PAUSE: 1,
    PLAY: 2,
    MENU: 3,
    OVER: 4,
    NEWLEVEL: 5,
    WIN: 6
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
        this.gamestate = GAMESTATE.WELCOME;

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

        // Create welcome screen
        this.createWelcomeScreen();

        // Start game loop
        requestAnimationFrame(this.boundGameLoop);
    }

    createWelcomeScreen() {
        if (this.activeWelcomeScreen) return;

        const welcomeScreen = document.createElement('div');
        welcomeScreen.className = 'welcome-screen';
        welcomeScreen.style.cssText = overlayStyles;

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

        this.gameContainer.appendChild(welcomeScreen);
        this.activeWelcomeScreen = welcomeScreen;

        welcomeScreen.querySelector('#startGameButton').onclick = () => {
            welcomeScreen.remove();
            this.activeWelcomeScreen = null;
            this.gamestate = GAMESTATE.MENU;
            this.start();
        };
    }

    gameLoop(timestamp) {
        const deltaTime = this.lastTime ? timestamp - this.lastTime : 0;
        this.lastTime = timestamp;

        this.render();

        if (this.gamestate === GAMESTATE.PLAY) {
            this.update(deltaTime);
        }

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

        this.brickContainer = document.createElement('div');
        this.brickContainer.className = 'brick-container';
        this.gameContainer.appendChild(this.brickContainer);
    }

    createGameObjects() {
        // Initialize game state
        this.lives = 2;
        this.score = 0;
        this.time = 0;
        this.levels = [level1, level2];
        this.currentLevel = 0;

        this.gameObjects = [];
        this.bricks = [];

        this.paddle = new Paddle(this);
        this.ball = new Ball(this);

        this.inputHandler = new InputHandler(this.paddle, this);
        this.start();

        this.activeGameOverScreen = null;

        this.initializeKeyboardControls();

        this.balls = [this.ball];
        this.powerUps = [];

        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
    }

    start() {
        if (this.gamestate !== GAMESTATE.MENU &&
            this.gamestate !== GAMESTATE.NEWLEVEL) return;

        this.bricks.forEach(brick => {
            if (brick.element) brick.element.remove();
        });

        this.bricks = buildLevel(this, this.levels[this.currentLevel]);

        this.balls.forEach(ball => ball.element && ball.element.remove());

        this.ball = new Ball(this, true);
        this.balls = [this.ball];

        this.gameObjects = [this.ball, this.paddle];

        this.gamestate = GAMESTATE.PLAY;

        this.updateScoreboard();
    }

    update(deltaTime) {
        if (this.gamestate !== GAMESTATE.PLAY) return;

        const cappedDeltaTime = Math.min(deltaTime, 16.67);

        this.paddle.update(cappedDeltaTime);

        let ballsToRemove = [];
        this.balls.forEach(ball => {
            if (!ball.update(cappedDeltaTime)) {
                ballsToRemove.push(ball);
            }
        });

        this.balls = this.balls.filter(ball => !ballsToRemove.includes(ball));

        if (this.balls.length === 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gamestate = GAMESTATE.OVER;
            } else {
                this.ball = new Ball(this, true);
                this.balls = [this.ball];
            }
        }

        if (this.bricks.length === 0) {
            this.currentLevel++;
            if (this.currentLevel >= this.levels.length) {
                this.gamestate = GAMESTATE.WIN;
            } else {
                this.gamestate = GAMESTATE.NEWLEVEL;
                this.showLevelTransition();
                setTimeout(() => {
                    if (this.gamestate === GAMESTATE.NEWLEVEL) {
                        this.start();
                    }
                }, 1000);
            }
        }

        this.bricks.forEach(brick => brick.update(deltaTime));
        this.bricks = this.bricks.filter(brick => !brick.delete);

        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update(deltaTime);
            return !powerUp.delete;
        });

        this.time += deltaTime / 1000;
        this.updateScoreboard();
    }



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

    render() {
        this.paddle.draw();
        this.balls.forEach(ball => ball.draw());
        this.bricks.forEach(brick => brick.draw());
        this.powerUps.forEach(powerUp => powerUp.draw());

        this.handleMenuState();
    }

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


    pause() {
        if (this.gamestate === GAMESTATE.PAUSE) {
            // Resume game
            this.gamestate = GAMESTATE.PLAY;
            this.lastTime = performance.now();
            if (this.activePauseScreen) {
                this.activePauseScreen.remove();
                this.activePauseScreen = null;
            }
        } else {
            this.gamestate = GAMESTATE.PAUSE;
            this.createPauseMenu();
        }
    }

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

        this.pauseCounterElement = pauseScreen.querySelector('#pauseFrameCounter');

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
        this.balls.forEach(ball => ball.element && ball.element.remove());
        this.bricks.forEach(brick => brick.element && brick.element.remove());
        this.powerUps.forEach(powerUp => powerUp.element && powerUp.element.remove());
        this.paddle.element && this.paddle.element.remove();

        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        this.gameObjects = [];
    }

    restart() {
        if (this.activeGameOverScreen) {
            this.activeGameOverScreen.remove();
            this.activeGameOverScreen = null;
        }
        if (this.activePauseScreen) {
            this.activePauseScreen.remove();
            this.activePauseScreen = null;
        }

        this.clearGameObjects();

        this.lives = 2;
        this.score = 0;
        this.time = 0;
        this.currentLevel = 0;
        this.gamestate = GAMESTATE.MENU;

        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        this.ball.isStuck = true;
        this.balls = [this.ball];

        if (this.inputHandler) {
            this.inputHandler.destroy();
        }
        this.inputHandler = new InputHandler(this.paddle, this);

        this.start();
        this.updateScoreboard();
    }

    initializeKeyboardControls() {
        if (this.escKeyHandler) {
            document.removeEventListener('keydown', this.escKeyHandler);
        }

        this.escKeyHandler = (event) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                event.preventDefault();
                this.pause();
            }
        };

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