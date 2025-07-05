/* -------------------------------------------------- */
// CONSTANTS
/* -------------------------------------------------- */

const gameBoardGrid = {columns: 21, rows: 21,};
const winningScore = 1000;
const foodScore = 25;

/* -------------------------------------------------- */
// VARIABLES (STATE)
/* -------------------------------------------------- */

let gameStatus = "idle";
let snake;
let snakeDirection;
let food;
let gameSpeedDelay;
let gameInterval;
let highestScore = 0;
let currentScore = 0;

/* -------------------------------------------------- */
// CACHED ELEMENT REFERENCES
/* -------------------------------------------------- */

// UI controls
const uiControlElements = document.querySelectorAll(".ui-control");
const instructionsBtnElement = document.querySelector(".header-instructionsbtn");
const playBtnElement = document.querySelector(".footer-playbtn");
const restartBtnElement = document.querySelector(".footer-restartbtn");
const pauseBtnElement = document.querySelector(".footer-pausebtn");

// Game display elements
const messageElement = document.querySelector(".header-message");
const highestScoreElement = document.querySelector(".highestscore-container");
const scoreElement = document.querySelector(".score-container");
const gameBoardElement = document.querySelector(".gameboard");

/* -------------------------------------------------- */
// EVENT HANDLER FUNCTIONS
/* -------------------------------------------------- */

function handleClick(event) {
        if (event.target.classList.contains("footer-playbtn")) {
                handlePlayBtn();
        } else if (event.target.classList.contains("footer-restartbtn")) {
                handleRestartBtn();
        } else if (event.target.classList.contains("footer-pausebtn")) {
                handlePauseBtn();
        }
}

function handlePlayBtn() {
        if (gameStatus === "idle" &&
        !playBtnElement.classList.contains("btn-disabled")) {
                init();
                playBtnElement.textContent = "RESUME";
                playBtnElement.classList.add("btn-disabled");
                restartBtnElement.classList.remove("btn-disabled");
                pauseBtnElement.classList.remove("btn-disabled");
        } else if (gameStatus === "paused" &&
        !playBtnElement.classList.contains("btn-disabled")) {
                gameStatus = "running";
                gameInterval = setInterval(gameLoop, gameSpeedDelay);
                playBtnElement.classList.add("btn-disabled");
                pauseBtnElement.classList.remove("btn-disabled");
                messageElement.classList.remove("header-message-paused");
                messageElement.textContent = `[ You need ${winningScore} points to win. Do your best! ]`;
                gameBoardElement.classList.remove("gameboard-paused");
        }
}

function handleRestartBtn() {
        if (gameStatus !== "idle" &&
        !restartBtnElement.classList.contains("btn-disabled")) {
                init();
                playBtnElement.classList.add("btn-disabled");
                pauseBtnElement.classList.remove("btn-disabled");
                messageElement.classList.remove("header-message-paused");
        }
}

function handlePauseBtn() {
        if (gameStatus === "running" &&
        !pauseBtnElement.classList.contains("btn-disabled")) {
                gameStatus = "paused";
                clearInterval(gameInterval);
                pauseBtnElement.classList.add("btn-disabled");
                playBtnElement.classList.remove("btn-disabled");
                messageElement.classList.add("header-message-paused");
                messageElement.textContent = `[ Game is paused. Click "RESUME" to jump back in! ]`;
                gameBoardElement.classList.add("gameboard-paused");
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
        gameBoardElement.innerHTML = '';
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
        updateHighestScore();
        currentScore = 0;

        // DOM elements reset
        messageElement.classList.remove("header-message-win", "header-message-loss");
        messageElement.textContent = `[ You need ${winningScore} points to win. Do your best! ]`;
        gameBoardElement.innerHTML = "";
        gameBoardElement.classList.remove("gameboard-win");
        gameBoardElement.classList.remove("gameboard-loss");
        gameBoardElement.classList.remove("gameboard-paused");

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

function updateScore() {
        currentScore += foodScore;
        renderScore();
}

function updateHighestScore() {
        if (currentScore > highestScore) {
                highestScore = currentScore;
        }
}

function endGame(reason) {
        clearInterval(gameInterval);
        pauseBtnElement.classList.add("btn-disabled");
        gameStatus = "over";
        if (reason === "wall") {
                messageElement.classList.add("header-message-loss");
                messageElement.textContent = `[ Oops! You've run into a wall. Click "RESTART" to play again. ]`;
                gameBoardElement.classList.add("gameboard-loss");
        } else if (reason === "snake") {
                messageElement.classList.add("header-message-loss");
                messageElement.textContent = `[ Oops! You've run into yourself. Click "RESTART" to play again. ]`;
                gameBoardElement.classList.add("gameboard-loss");
        } else {
                messageElement.classList.add("header-message-win");
                messageElement.textContent = `[ Congratulations, you've won! Click "RESTART" to play again. ]`;
                gameBoardElement.classList.add("gameboard-win");
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
                updateScore();
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeedDelay);
        } else {
                snake.pop();
        }
}

/* -------------------------------------------------- */
// RENDER FUNCTIONS
/* -------------------------------------------------- */

function renderHighestScore() {
        highestScoreElement.textContent = highestScore.toString().padStart(4, "0");
}

function renderScore() {
        scoreElement.textContent = currentScore.toString().padStart(4, "0");
}

function renderSnake() {
        snake.forEach((segment) => {
                const snakeElement = createGameElement("div", "gameboard-snake");
                setGameElementPosition(snakeElement, segment);
                gameBoardElement.appendChild(snakeElement);
        });
}

function renderFood() {
        const foodElement = createGameElement("div", "gameboard-food");
        setGameElementPosition(foodElement, food);
        gameBoardElement.appendChild(foodElement);
}

function render() {
        renderFood();
        renderSnake();
        renderScore();
        renderHighestScore();
}

/* -------------------------------------------------- */
// EVENT LISTENERS
/* -------------------------------------------------- */

uiControlElements.forEach((control) => {
        control.addEventListener("click", handleClick);
});

document.addEventListener("keydown", handleKeyMove);