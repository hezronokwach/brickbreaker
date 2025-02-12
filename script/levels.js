import Brick  from "./brick.js";

export const level1 = [
    [0, 1, 'M', 1, 0, 0, 'E', 1, 1, 0], // M = multiball, E = extra life
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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

