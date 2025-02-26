export function detectCollision(ball, gameObject) {
    let bottomOfBall = ball.position.y + ball.size;
    let topOfBall = ball.position.y;

    let topOfObject = gameObject.position.y;
    let leftSideOfObject = gameObject.position.x;
    let rightSideOfObject = gameObject.position.x + gameObject.width;
    let bottomOfObject = gameObject.position.y + gameObject.height;

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