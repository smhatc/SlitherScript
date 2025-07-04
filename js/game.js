/*-------------- Constants -------------*/

const gameBoardGrid = {columns: 21, rows: 21,};
const winningScore = 1000;
const foodScore = 25;

/*---------- Variables (State) ---------*/

let gameStatus = "idle";
let snake;
let snakeDirection;
let food;
let gameSpeedDelay;
let gameInterval;
let currentScore;

/*----- Cached Element References  -----*/

// UI controls
const uiControls = document.querySelectorAll(".ui-control");
const instructionsBtn = document.querySelector(".header-instructionsbtn");
const playBtn = document.querySelector(".footer-playbtn");
const restartBtn = document.querySelector(".footer-restartbtn");
const pauseBtn = document.querySelector(".footer-pausebtn");

// Game display elements
const message = document.querySelector(".header-message");
const score = document.querySelector(".score-container");
const highestScore = document.querySelector(".highestscore-container");
const gameBoard = document.querySelector(".gameboard");

/*-------------- Functions -------------*/

/* -------------------------------------------------- */
// EVENT HANDLER FUNCTIONS
/* -------------------------------------------------- */

function handleClick(event) {
        if (event.target.classList.contains("footer-playbtn")) {
                if (gameStatus === "idle") {
                        init();
                        playBtn.classList.add("btn-disabled");
                        restartBtn.classList.remove("btn-disabled");
                        pauseBtn.classList.remove("btn-disabled");
                } else if (gameStatus === "paused") {
                        // Add resume logic here
                        return;
                }
        } else if (event.target.classList.contains("footer-restartbtn")) {
                if (gameStatus !== "idle") {
                        init();
                }
        } else if (event.target.classList.contains("footer-pausebtn")) {
                if (gameStatus === "running") {
                        // Add save game status logic here
                        pauseBtn.classList.add("btn-disabled");
                        playBtn.textContent = "RESUME";
                        playBtn.classList.remove("btn-disabled");
                        return;
                }
        }
}

function handleKeyMove(event) {
        const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (gameStatus === "running" && movementKeys.includes(event.key)) {
                event.preventDefault();
                switch (event.key) {
                        case movementKeys[0]:
                                snakeDirection = "up";
                                break;
                        case movementKeys[1]:
                                snakeDirection = "down";
                                break;
                        case movementKeys[2]:
                                snakeDirection = "left";
                                break;
                        case movementKeys[3]:
                                snakeDirection = "right";
                                break;
                }
        }
}

/* -------------------------------------------------- */
// GAME LOGIC FUNCTIONS
/* -------------------------------------------------- */

function generateFood() {
        const column = Math.floor(Math.random() * gameBoardGrid.columns + 1);
        const row = Math.floor(Math.random() * gameBoardGrid.rows + 1);
        return {column, row};
        
}

function gameLoop() {
        moveSnake();
        checkWin();
        checkCollision();
        gameBoard.innerHTML = '';
        render();
}

function init() {
        // JavaScript variables reset
        gameStatus = "running";
        snake =
        [
                {column: 11, row: 11,},
        ];
        snakeDirection = "up";
        food = generateFood();
        gameSpeedDelay = 250;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeedDelay);
        currentScore = 0;

        // DOM elements reset
        message.classList.remove("header-message-win", "header-message-loss");
        message.textContent = `[ You need ${winningScore} points to win. Do your best! ]`;
        // highestScore.textContent = ;
        gameBoard.innerHTML = "";
        gameBoard.classList.remove("gameboard-win");
        gameBoard.classList.remove("gameboard-loss");

        // Function calls
        render();
}

// Creates the snake or food cubes
function createGameElement(element, elementClass) {
        const createdElement = document.createElement(element);
        createdElement.classList.add(elementClass);
        return createdElement;
}

// Sets the position of the element created by "createGameElement" on the board
function setGameElementPosition(element, position) {
        element.style.gridColumn = position.column;
        element.style.gridRow = position.row;
}

function increaseSpeed() {
        if (gameSpeedDelay > 50) {
                gameSpeedDelay -= 5;
        }
}

function increaseScore() {
        currentScore += foodScore;
        renderScore();
}

function endGame(reason) {
        clearInterval(gameInterval);
        gameStatus = "over";
        if (reason === "wall") {
                message.classList.add("header-message-loss");
                message.textContent = `[ Oops! You've run into a wall. Click "RESTART" to play again. ]`;
                gameBoard.classList.add("gameboard-loss");
        } else if (reason === "snake") {
                message.classList.add("header-message-loss");
                message.textContent = `[ Oops! You've run into yourself. Click "RESTART" to play again. ]`;
                gameBoard.classList.add("gameboard-loss");
        } else {
                message.classList.add("header-message-win");
                message.textContent = `[ Congratulations, you've won! Click "RESTART" to play again. ]`;
                gameBoard.classList.add("gameboard-win");
        }
}

function checkWin() {
        if (currentScore >= winningScore) {
                endGame();
        }
}

function checkCollision() {
        const snakeHead = snake[0];
        let whichCollision = "";

        // Check if the snake has into a wall
        if (snakeHead.column < 1 ||
        snakeHead.column > gameBoardGrid.columns ||
        snakeHead.row < 1 ||
        snakeHead.row > gameBoardGrid.rows) {
                whichCollision = "wall";
                endGame(whichCollision);
        }

        // Check if the snake has run into itself
        for (let i = 1; i < snake.length; i++) {
                if (snakeHead.column === snake[i].column &&
                snakeHead.row === snake[i].row) {
                        whichCollision = "snake";
                        endGame(whichCollision);
                }
        }
}

function moveSnake() {
        const snakeHead = {...snake[0]};
        switch (snakeDirection) {
                case "up":
                        snakeHead.row--;
                        break;
                case "down":
                        snakeHead.row++;
                        break;
                case "right":
                        snakeHead.column++;
                        break;
                case "left":
                        snakeHead.column--;
                        break;
        }
        snake.unshift(snakeHead);
        if (snakeHead.column === food.column && snakeHead.row === food.row) {
                food = generateFood();
                increaseSpeed();
                increaseScore();
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeedDelay);
        } else {
                snake.pop();
        }
}

/* -------------------------------------------------- */
// RENDER FUNCTIONS
/* -------------------------------------------------- */

function renderScore() {
        score.textContent = currentScore.toString().padStart(4, "0");
}

function renderSnake() {
        snake.forEach((segment) => {
                const snakeElement = createGameElement("div", "gameboard-snake");
                setGameElementPosition(snakeElement, segment);
                gameBoard.appendChild(snakeElement);
        });
}

function renderFood() {
        const foodElement = createGameElement("div", "gameboard-food");
        setGameElementPosition(foodElement, food);
        gameBoard.appendChild(foodElement);
}

function render() {
        renderFood();
        renderSnake();
        renderScore();
}

/*----------- Event Listeners ----------*/

uiControls.forEach((control) => {
        control.addEventListener("click", handleClick);
});

document.addEventListener("keydown", handleKeyMove);