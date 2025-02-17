import Game, {GAMESTATE} from "./game.js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function startGame() {
    try {
        console.log('Starting game initialization...');
        const game = new Game(GAME_WIDTH, GAME_HEIGHT);
        console.log('Game initialized');
        
        let lastTime = 0;
        function gameLoop(time) {
            let deltaTime = time - lastTime;
            lastTime = time;
            
            // Always draw even when paused
            game.draw();
            
            // Only update game logic when not paused
            if (game.gamestate !== GAMESTATE.PAUSE) {
                game.update(deltaTime);
            }
            
            requestAnimationFrame(gameLoop);
        }
        
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', startGame);