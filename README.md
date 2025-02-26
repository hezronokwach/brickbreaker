# Brick Breaker Game

## Overview

This is a classic Arkanoid (Brick Breaker) game implemented using JavaScript, HTML, and CSS. The game features multiple levels, power-ups, a scoring system, and touch-friendly controls.

## Features

- **Welcome Screen:** A user-friendly welcome screen with instructions and a start button.
- **Multiple Levels:** The game includes multiple levels with varying brick layouts.
- **Power-ups:** Special bricks spawn power-ups that enhance gameplay.
- **Scoring System:** Points are awarded for breaking bricks, with a score displayed during gameplay.
- **Sound Effects:** Sound effects enhance the gaming experience.
- **Keyboard Controls:** Control the paddle using the left and right arrow keys.
- **Sticky Ball:** The ball starts stuck to the paddle and is released with the up arrow key.
- **Pause Functionality:** Press the ESC key to pause the game.

## Controls

- **Left Arrow:** Move the paddle to the left.
- **Right Arrow:** Move the paddle to the right.
- **Up Arrow:** Release the ball from the paddle.
- **ESC:** Pause the game.

## How to Play

1. Open `index.html` in your web browser.
2. Click the "Start Game" button on the welcome screen.
3. Use the left and right arrow keys to control the paddle.
4. Press the up arrow key to release the ball.
5. Break all the bricks to advance to the next level.
6. Avoid letting the ball fall below the paddle, or you will lose a life.
7. If you lose all lives, the game is over.

## File Structure

- `index.html`: The main HTML file that sets up the game layout.
- `style.css`: CSS file for styling the game elements.
- `script/`: Directory containing JavaScript files.
  - `script/index.js`: Entry point for the game.
  - `script/game.js`: Core game logic and state management.
  - `script/ball.js`: Ball object and its behavior.
  - `script/brick.js`: Brick object and collision detection.
  - `script/paddle.js`: Paddle object and player controls.
  - `script/input.js`: Handles keyboard input.
  - `script/levels.js`: Defines the levels and brick layouts.
  - `script/powerup.js`: Power-up logic and effects.
  - `script/sounds.js`: Sound manager for loading and playing sound effects.
  - `script/detectCollision.js`: Collision detection logic.
- `assets/`: Directory containing game assets.
  - `assets/ball3.png`: Image for the ball.
  - `assets/brick.jpg`: Image for the bricks.
  - `assets/sounds/`: Directory containing sound effects.

## Dependencies

- No external libraries or frameworks are required.

## Sound Assets

- Placeholder sound files are included in the `assets/sounds/` directory. Replace these with your own sound effects for a complete audio experience.

## Customization

- Modify the `levels.js` file to create new levels with different brick layouts.
- Adjust the game settings in `game.js` to change the difficulty and gameplay.
- Customize the appearance of the game by modifying the CSS in `style.css`.

## Credits

- This game was created with vanilla JavaScript, HTML, and CSS.

## Contributors

- Hezron Okwach-[github](https://github.com/hezronokwach)
- Philip Ochieng-[github](https://github.com/Philip38-hub)
- Joel Amos-[github](https://github.com/Murzuqisah)
