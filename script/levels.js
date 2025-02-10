import Brick  from "./brick.js";

export function buildLevel(game,level){
    let bricks = [];
    level.forEach((row, rowIndex) => {
        
        row.forEach((brick, brickIndex) => {
            if(brick === 1){
                let position = {
                    x: 80 * brickIndex,
                    y: 75 + 24 * rowIndex
                }
                bricks.push(new Brick(game, position))
            }
        })
    })
    return bricks
   
}

export const level1 = [
    // Simple single row (Beginner)
    [0,1,1,1,1,1,1,1,1,0]
];

export const level2 = [
    // Two rows with gaps (Easy)
    [0,1,1,0,1,1,0,1,1,0],
    [1,0,1,1,0,0,1,1,0,1]
];

export const level3 = [
    // Three rows alternating (Medium)
    [1,1,1,1,1,1,1,1,1,1],
    [0,1,0,1,0,1,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

export const level4 = [
    // Four rows pyramid (Hard)
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1]
];

export const level5 = [
    // Five rows complex pattern (Expert)
    [1,0,1,0,1,1,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,1,1,0,1,0,1]
];

