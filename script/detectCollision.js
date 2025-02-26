export function detectCollision(ball, gameObject, deltaTime) {
    let ballNextX = ball.position.x + ball.speed.x * (deltaTime / 16.67);
    let ballNextY = ball.position.y + ball.speed.y * (deltaTime / 16.67);

    let leftOfBall = ballNextX;
    let rightOfBall = ballNextX + ball.size;
    let bottomOfBall = ball.position.y + ball.size;
    let topOfBall = ball.position.y;

    let topOfObject = gameObject.position.y;
    let leftSideOfObject = gameObject.position.x;
    let rightSideOfObject = gameObject.position.x + gameObject.width;
    let bottomOfObject = gameObject.position.y + gameObject.height;

    let collisionTimeX = null;
    let collisionTimeY = null;

    // check collision on x-axis
    if (rightOfBall >= leftSideOfObject && leftOfBall <= rightSideOfObject) {
        if (ball.speed.y > 0 && bottomOfBall >= topOfObject && topOfBall <= topOfObject) {
            collisionTimeY = (topOfObject - bottomOfBall) / ball.speed.y;
        } else if (ball.speed.y < 0 && topOfBall <= bottomOfObject && bottomOfBall >= bottomOfBall) {
            collisionTimeY = (bottomOfObject - topOfBall) / ball.speed.y;
        }
    }

    if (
        bottomOfBall >= topOfObject &&
        topOfBall <= bottomOfObject &&
        ball.position.x + ball.size >= leftSideOfObject &&
        ball.position.x <= rightSideOfObject
    ) {
        let ballComingFromTop = ball.speed.y > 0;
        let ballComingFromBottom = ball.speed.y < 0;

        if (ballComingFromTop && ballComingFromBottom <= bottomOfObject) {
            ball.speed.y = -ball.speed.y;
        } else if (ballComingFromBottom && topOfBall >= topOfObject) {
            ball.speed.y = -ball.speed.y;
        } else {
            ball.speed.x = -ball.speed.x;
        }
        return true;
    }
    return false;
}