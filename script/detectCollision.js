export function detectCollision(ball, gameObject){
    let bottomBall = ball.position.y + ball.size
    let topOfBall = ball.position.y

    let topOfObject = gameObject.position.y
    let leftSideObject = gameObject.position.x
    let rightSideObject = gameObject.position.x + gameObject.width
    let bottomOfObject = gameObject.position.y + gameObject.height
    if (bottomBall >= topOfObject 
        && topOfBall <= bottomOfObject

        && ball.position.x >= leftSideObject
        && ball.position.x + ball.size <= rightSideObject
    ){
        return true
    } else {    
        return false
    }
}