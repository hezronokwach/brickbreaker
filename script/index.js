import Game, { GAMESTATE } from "./game.js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function startGame() {
    try {
        console.log('Starting game initialization...');
        const game = new Game(GAME_WIDTH, GAME_HEIGHT);
        console.log('Game initialized');

        let lastTime = 0;

        function gameLoop(timestamp) {
            requestAnimationFrame(gameLoop);
            
            if (!lastTime) {
                lastTime = timestamp;
                return;
            }
            
            const deltaTime = Math.min(timestamp - lastTime, 16.67);
            lastTime = timestamp;
            
            // Always render game state to maintain frame markers
            game.render(deltaTime);
            
            // Only update game logic when not paused
            if (game.gamestate !== GAMESTATE.PAUSE) {
                game.update(deltaTime);
            }
        }
        
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', startGame);