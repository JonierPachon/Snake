const gameBoard = document.querySelector(".gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector(".game__score-text");
const resetBtn = document.querySelector("#resetBtn");
const pauseGameBtn = document.querySelector("#pauseBtn");
let gameWidth = gameBoard.width;
let gameHeight = gameBoard.height;
const boardBackground = "white";
const snakeColor = "lightgreen";
const snakeBorder = "darkgreen";
const foodColor = "red";
let unitSize = 25;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let running = false;
let score = 0;
let snake = [
  { x: unitSize * 4, y: 0 },
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize, y: 0 },
  { x: 0, y: 0 },
];
let gameLoopTimeout; // holds the reference to the timeout
// let pauseBtnWasPressed = true;
const speedSnakeDefault = 75;
const speedSnakePressingKeys = 0;
let speedSnake = speedSnakeDefault;
let isFastSnake = false;
let gameOver = true;

let thresholdWidth = 550; // limit of the screen
let thresholdHeight = 550; // limit of the screen

window.addEventListener("resize", adjustGameForScreenSize);
window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
pauseGameBtn.addEventListener("click", pauseGame);

gameStart();

function gameStart() {
  if (
    window.innerWidth < thresholdWidth ||
    window.innerHeight < thresholdHeight
  ) {
    adjustGameForScreenSize();
  }
  clearTimeout(gameLoopTimeout); // Stop previous loop
  gameOver = false;
  running = true;
  scoreText.textContent = score;
  createFood();
  nextTick();
}

function nextTick() {
  if (isFastSnake) {
    // When the snake moves faster, this isFastSnake allows it to advance one unit size without moving twice.
    speedSnake = speedSnakeDefault;
    isFastSnake = false;
  }
  if (running) {
    gameLoopTimeout = setTimeout(() => {
      clearBoard();
      drawFood();
      moveSnake();
      drawSnake();
      checkGameOver();
      nextTick();
    }, speedSnake);
  } else {
    displayGameOver();
  }
}

// Adaptive mobile display
function adjustGameForScreenSize() {
  if (
    window.innerWidth < thresholdWidth ||
    window.innerHeight < thresholdHeight
  ) {
    screenResize(340, 17);
  } else {
    screenResize(500, 25);
  }
  //
  function screenResize(newScreen, unitSizeResize) {
    gameWidth = gameBoard.width = newScreen;
    gameHeight = gameBoard.height = newScreen;

    if (xVelocity === -unitSize) {
      xVelocity = -unitSizeResize;
    } else if (xVelocity === unitSize) {
      xVelocity = unitSizeResize;
    }

    if (yVelocity === -unitSize) {
      yVelocity = -unitSizeResize;
    } else if (yVelocity === unitSize) {
      yVelocity = unitSizeResize;
    }

    snake.forEach((snakePart) => {
      snakePart.x = (snakePart.x / unitSize) * unitSizeResize;
      snakePart.y = (snakePart.y / unitSize) * unitSizeResize;
    });
    foodX = (foodX / unitSize) * unitSizeResize;
    foodY = (foodY / unitSize) * unitSizeResize;

    unitSize = unitSizeResize;

    if (!gameOver) {
      clearTimeout(gameLoopTimeout);
      nextTick();
    } else {
      drawSnake();
      drawFood();
      displayGameOver();
    }
  }
}

function clearBoard() {
  ctx.fillStyle = boardBackground;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
}
function createFood() {
  function randomFood(min, max) {
    const randNum =
      Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    return randNum;
  }
  foodX = randomFood(0, gameWidth - unitSize);
  foodY = randomFood(0, gameWidth - unitSize);
}
function drawFood() {
  ctx.fillStyle = foodColor;
  ctx.fillRect(foodX, foodY, unitSize, unitSize);
}
function moveSnake() {
  // 1. Calculating new head
  let head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };

  // 2. Applying wrap-around
  if (head.x < 0) {
    head.x = gameWidth - unitSize;
  } else if (head.x >= gameWidth) {
    head.x = 0;
  }

  if (head.y < 0) {
    head.y = gameHeight - unitSize;
  } else if (head.y >= gameHeight) {
    head.y = 0;
  }

  // 3. Checking if food is eaten
  if (head.x === foodX && head.y === foodY) {
    score += 1;
    scoreText.textContent = score;
    createFood();
    // Keeping the tail to grow the snake
  } else {
    snake.pop(); // Removing tail
  }

  // 4. Adding new head
  snake.unshift(head);
}

function drawSnake() {
  ctx.fillStyle = snakeColor;
  ctx.strokeStyle = snakeBorder;
  snake.forEach((snakePart) => {
    ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
    ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
  });
}

// movements of the snake ...

function pressingKeys() {
  isFastSnake = true;
  speedSnake = speedSnakePressingKeys;
}
function snakeLeft() {
  xVelocity = -unitSize;
  yVelocity = 0;
}

function snakeRight() {
  xVelocity = unitSize;
  yVelocity = 0;
}
function snakeUp() {
  yVelocity = -unitSize;
  xVelocity = 0;
}
function snakeDown() {
  yVelocity = unitSize;
  xVelocity = 0;
}

function snakeDirection(arrow) {
  //
  const goingLeft = xVelocity == -unitSize;
  const goingUp = yVelocity == -unitSize;
  const goingRight = xVelocity == unitSize;
  const goingDown = yVelocity == unitSize;

  if (!isFastSnake) {
    switch (true) {
      case arrow.id === "leftBtn" && !goingRight:
        snakeLeft();
        pressingKeys();

        break;
      case arrow.id === "rightBtn" && !goingLeft:
        snakeRight();
        pressingKeys();
        break;
      case arrow.id === "upBtn" && !goingDown:
        snakeUp();
        pressingKeys();
        break;
      case arrow.id === "downBtn" && !goingUp:
        snakeDown();
        pressingKeys();
        break;
    }
  }
}

function changeDirection(event) {
  const keyPressed = event.keyCode;
  const LEFT = 37;
  const UP = 38;
  const RIGHT = 39;
  const DOWN = 40;

  const goingLeft = xVelocity == -unitSize;
  const goingUp = yVelocity == -unitSize;
  const goingRight = xVelocity == unitSize;
  const goingDown = yVelocity == unitSize;

  if (!isFastSnake) {
    switch (true) {
      // When the user quickly presses down and left while the snake is moving to the right, the snake will collide with itself. The isFastSnake variable prevents this by utilizing the pressingKeys() method.
      case keyPressed === LEFT && !goingRight:
        snakeLeft();
        pressingKeys();
        break;
      case keyPressed === RIGHT && !goingLeft:
        snakeRight();
        pressingKeys();
        break;
      case keyPressed === UP && !goingDown:
        snakeUp();
        pressingKeys();
        break;
      case keyPressed === DOWN && !goingUp:
        snakeDown();
        pressingKeys();
        break;
    }
  }
}
function checkGameOver() {
  for (i = 1; i < snake.length; i += 1) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      running = false;
    }
  }
}
function displayGameOver() {
  ctx.font = "50px MV Boli";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
  running = false;
  gameOver = true;
}

function pauseGame(answer) {
  switch (true) {
    case gameOver === true:
      break;
    case answer.value === "yes":
      clearTimeout(gameLoopTimeout);
      running = false;
      pauseGameBtn.textContent = "▶";
      answer.value = "no";
      break;
    case answer.value === "no":
      answer.value = "yes";
      pauseGameBtn.textContent = "||";
      //
      running = true;
      nextTick();
      break;
  }
}
function resetGame() {
  speedSnake = speedSnakeDefault;
  isFastSnake = false;
  score = 0;
  xVelocity = unitSize;
  yVelocity = 0;

  snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 },
  ];
  gameStart();
}
