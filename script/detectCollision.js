export function detectCollision(ball, gameObject, deltaTime) {
    let ballNextX = ball.position.x + ball.speed.x * (deltaTime / 16.67);
    let ballNextY = ball.position.y + ball.speed.y * (deltaTime / 16.67);

    let leftOfBall = ballNextX;
    let rightOfBall = ballNextX + ball.size;
    let topOfBall = ballNextY;
    let bottomOfBall = ballNextY + ball.size;

    let gameObjectLeft = gameObject.position.x;
    let gameObjectRight = gameObject.position.x + gameObject.width;
    let gameObjectTop = gameObject.position.y;
    let gameObjectBottom = gameObject.position.y + gameObject.height;

    let collisionTimeX = null;
    let collisionTimeY = null;

    // Check X collision
    if (rightOfBall >= gameObjectLeft && leftOfBall <= gameObjectRight) {
        if (ball.speed.y > 0 && bottomOfBall >= gameObjectTop && topOfBall <= gameObjectTop) {
            collisionTimeY = (gameObjectTop - bottomOfBall) / ball.speed.y;
        } else if (ball.speed.y < 0 && topOfBall <= gameObjectBottom && bottomOfBall >= gameObjectBottom) {
            collisionTimeY = (gameObjectBottom - topOfBall) / ball.speed.y;
        }
    }

    // Check Y collision
    if (bottomOfBall >= gameObjectTop && topOfBall <= gameObjectBottom) {
        if (ball.speed.x > 0 && rightOfBall >= gameObjectLeft && leftOfBall <= gameObjectLeft) {
            collisionTimeX = (gameObjectLeft - rightOfBall) / ball.speed.x;
        } else if (ball.speed.x < 0 && leftOfBall <= gameObjectRight && rightOfBall >= gameObjectRight) {
            collisionTimeX = (gameObjectRight - leftOfBall) / ball.speed.x;
        }
    }

    // Determine which collision happens first
    if (collisionTimeX !== null && collisionTimeY !== null) {
        if (collisionTimeX < collisionTimeY) {
            ball.speed.x = -ball.speed.x;
            return true;
        } else {
            ball.speed.y = -ball.speed.y;
            return true;
        }
    } else if (collisionTimeX !== null) {
        ball.speed.x = -ball.speed.x;
        return true;
    } else if (collisionTimeY !== null) {
        ball.speed.y = -ball.speed.y;
        return true;
    }

    return false;
}
