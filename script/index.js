import Game from "./game.js";

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
            
            game.update(deltaTime);
            game.draw();
            
            requestAnimationFrame(gameLoop);
        }
        
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', startGame);