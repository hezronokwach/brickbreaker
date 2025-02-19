import Game, { GAMESTATE } from "./game.js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function startGame() {
    try {
        console.log('Starting game initialization...');
        const game = new Game(GAME_WIDTH, GAME_HEIGHT);
        console.log('Game initialized');

        let lastTime = 0;
        let rafId;

        function gameLoop(timestamp) {
            if (!lastTime) {
                lastTime = timestamp;
                rafId = requestAnimationFrame(gameLoop);
                return;
            }
            
            const deltaTime = Math.min(timestamp - lastTime, 16.67);
            lastTime = timestamp;
            
            // During pause: Force tiny movement to maintain frame timing
            if (game.gamestate === GAMESTATE.PAUSE) {
                const movement = (deltaTime % 2) * 0.001;
                game.gameContainer.style.transform = `translateZ(0) translateY(${movement}px)`;
            }
            
            // Always render game state
            game.render(deltaTime);
            
            // Only update game logic when not paused
            if (game.gamestate !== GAMESTATE.PAUSE) {
                game.update(deltaTime);
            }

            // Request next frame at end of loop
            rafId = requestAnimationFrame(gameLoop);
        }
        
        // Start game loop
        rafId = requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', startGame);