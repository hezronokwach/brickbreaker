import Brick from "./brick.js";

export const level1 = [
    // Level 1 - Introduction to power-ups
    [0,0,0,0,0,1,0,0,0,0],
    //[0, 1, 0, 'M', 1, 1, 0, 'E', 1, 0],
    // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [1, 0, 1, 1, 'E', 1, 1, 1, 0, 1],
    // [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
    // ['M', 1, 1, 1, 1, 1, 1, 1, 1, 'E'],
    // [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
];

export const level2 = [
    // Level 2 - More challenging pattern
    [1, 1, 1, 1, 'M', 'M', 1, 1, 1, 1],
    // [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    // ['E', 1, 0, 1, 'M', 'M', 1, 0, 1, 'E'],
    // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [0, 'M', 1, 1, 'E', 'E', 1, 1, 'M', 0],
    // [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export function buildLevel(game, level) {
    let bricks = [];
    level.forEach((row, rowIndex) => {
        row.forEach((brick, brickIndex) => {
            if (brick) {
                let position = {
                    x: 80 * brickIndex,
                    y: 75 + 24 * rowIndex
                };
                let type = 'normal';
                if (brick === 'M') type = 'multiball';
                if (brick === 'E') type = 'extralife';
                bricks.push(new Brick(game, position, type));
            }
        });
    });
    return bricks;
}