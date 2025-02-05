import Paddle from './paddle.js';
import InputHandler from './input.js';

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
let paddle = new Paddle(GAME_WIDTH, GAME_HEIGHT);
new InputHandler(paddle)
paddle.draw(ctx);
let lastTime = 0;

function gameLoop(time){
    let deltaTime = time - lastTime;
    lastTime = time;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    paddle.update(deltaTime);
    paddle.draw(ctx);
    requestAnimationFrame(gameLoop);
}
gameLoop();