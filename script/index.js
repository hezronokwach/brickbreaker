import Paddle from './paddle.js';

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
ctx.clearRect(0, 0, canvas.width, canvas.height);

let paddle = new Paddle(GAME_WIDTH, GAME_HEIGHT);
paddle.draw(ctx);