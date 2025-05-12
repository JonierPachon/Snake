const gameBoard = document.querySelector(".game__board");
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
let speedSnakeDefault = 75;
let speedSnakePressingKeys = 0;
let speedSnake = speedSnakeDefault;
let isFastSnake = false;
let gameOver = true;

let thresholdWidth = 500; // limit of the screen
let thresholdHeight = 500; // limit of the screen

//

document.addEventListener("DOMContentLoaded", function () {
  let level = document.querySelector(".level");
  level.addEventListener("change", function () {
    switch (level.value) {
      case "easy":
        speedSnake = speedSnakeDefault = 110;
        break;
      case "medium":
        speedSnake = speedSnakeDefault = 75;
        break;
      case "hard":
        speedSnake = speedSnakeDefault = 50;
        break;
    }
  });

  // This code disables the arrows for selecting between the options: easy, medium, and hard.
  document.addEventListener("keydown", function (event) {
    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft"
    ) {
      event.preventDefault(); // Prevent the default action
    }
  });
});

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
  while (
    snake.some((snakePart) => snakePart.x === foodX && snakePart.y === foodY)
  ) {
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameWidth - unitSize);
  }

  //   if (snake.some((snakePart) => snakePart.x === foodX && snakePart.y === foodY)) {
  //     createFood();
  //   }
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

function changeDirectionByKey(keyCode) {
  const goingLeft = xVelocity == -unitSize;
  const goingUp = yVelocity == -unitSize;
  const goingRight = xVelocity == unitSize;
  const goingDown = yVelocity == unitSize;

  if (isFastSnake) return;

  switch (keyCode) {
    case 37:
      if (!goingRight) snakeLeft();
      break;
    case 38:
      if (!goingDown) snakeUp();
      break;
    case 39:
      if (!goingLeft) snakeRight();
      break;
    case 40:
      if (!goingUp) snakeDown();
      break;
  }

  pressingKeys();
}

function changeDirection(event) {
  changeDirectionByKey(event.keyCode);
}

function snakeDirection(button) {
  const keyMap = {
    leftBtn: 37,
    upBtn: 38,
    rightBtn: 39,
    downBtn: 40,
  };
  changeDirectionByKey(keyMap[button.id]);
}

//

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

function checkGameOver() {
  for (let i = 1; i < snake.length; i += 1) {
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
