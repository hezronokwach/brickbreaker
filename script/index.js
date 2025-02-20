import Game from "./game.js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function startGame() {
    try {
        console.log('Starting game initialization...');
        new Game(GAME_WIDTH, GAME_HEIGHT);
        console.log('Game initialized');
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

document.addEventListener('DOMContentLoaded', startGame);