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
        
        // Initialize game objects
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        this.gameObjects = [];
        this.bricks = [];
        
        new InputHandler(this.paddle, this);
        this.start();
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
        if (this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWLEVEL) return;
        if (this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWLEVEL) return;

        this.bricks = buildLevel(this, this.levels[this.currentLevel]);
        this.ball.reset();

        this.gameObjects = [this.ball, this.paddle];
        this.gamestate = GAMESTATE.PLAY;
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
        
        // Update positions of existing elements instead of clearing
        this.gameObjects.forEach(object => object.draw());
        this.bricks.forEach(brick => brick.draw());

        // Update pause menu visibility
        if (this.gamestate === GAMESTATE.PAUSE) {
            this.pauseMenu.style.display = 'block';
        } else {
            this.pauseMenu.style.display = 'none';
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
}