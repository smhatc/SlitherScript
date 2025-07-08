/* -------------------------------------------------- */
// CONSTANTS
/* -------------------------------------------------- */

const foodScore = 25;
const winningScore = 1000;
const gameBoard = { columns: 21, rows: 21, };

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
const instructionsBtnElement = document.querySelector(".header-instructionsbtn");
const instructionsModalCloseBtnElement = document.querySelector(".instructionsmodal-closebtn");
const snakeCtrlsElement = document.querySelector(".footer-snakectrls");
const snakeCtrlsUpBtnElement = document.querySelector(".snakectrls-up");
const snakeCtrlsLeftBtnElement = document.querySelector(".snakectrls-left");
const snakeCtrlsDownBtnElement = document.querySelector(".snakectrls-down");
const snakeCtrlsRightBtnElement = document.querySelector(".snakectrls-right");
const snakeCtrlsShowBtnElement = document.querySelector(".snakectrls-showbtn");
const playBtnElement = document.querySelector(".footer-playbtn");
const restartBtnElement = document.querySelector(".footer-restartbtn");
const pauseBtnElement = document.querySelector(".footer-pausebtn");
const uiControlElements =
        [
                instructionsBtnElement,
                instructionsModalCloseBtnElement,
                snakeCtrlsUpBtnElement,
                snakeCtrlsLeftBtnElement,
                snakeCtrlsDownBtnElement,
                snakeCtrlsRightBtnElement,
                snakeCtrlsShowBtnElement,
                playBtnElement,
                restartBtnElement,
                pauseBtnElement,
        ];
// Game display elements
const instructionsModalElement = document.querySelector(".header-instructionsmodal");
const messageElement = document.querySelector(".header-message");
const highestScoreElement = document.querySelector(".highestscore-container");
const scoreElement = document.querySelector(".score-container");
const gameBoardElement = document.querySelector(".gameboard");

/* -------------------------------------------------- */
// EVENT HANDLER FUNCTIONS
/* -------------------------------------------------- */

// Handler for the UI control elements
function handleClick(event) {
        if (event.target === instructionsBtnElement) {
                handleInstructionsBtn();
        } else if (event.target === instructionsModalCloseBtnElement) {
                handleInstructionsModalCloseBtn();
        } else if (event.target === snakeCtrlsUpBtnElement ||
                event.target === snakeCtrlsLeftBtnElement ||
                event.target === snakeCtrlsDownBtnElement ||
                event.target === snakeCtrlsRightBtnElement) {
                handleBtnMove(event);
        } else if (event.target === snakeCtrlsShowBtnElement) {
                handleSnakeCtrlsToggleBtn();
        } else if (event.target === playBtnElement) {
                handlePlayBtn();
        } else if (event.target === restartBtnElement) {
                handleRestartBtn();
        } else if (event.target === pauseBtnElement) {
                handlePauseBtn();
        }
}

// Shows game instructions modal
function handleInstructionsBtn() {
        instructionsModalElement.showModal();
}

// Closes game instructions modal
function handleInstructionsModalCloseBtn() {
        instructionsModalElement.close();
}

// Shows/hides the on-screen controls
function handleSnakeCtrlsToggleBtn() {
        if (snakeCtrlsElement.style.display === "none") {
                snakeCtrlsElement.style.display = "block";
        } else {
                snakeCtrlsElement.style.display = "none";
        }
}

// Starts or resumes the game
function handlePlayBtn() {
        if (gameStatus === "idle" &&
                !playBtnElement.classList.contains("btn-disabled")) {
                init();
        } else if (gameStatus === "paused" &&
                !playBtnElement.classList.contains("btn-disabled")) {
                resume();
        }
}

// Restarts the game
function handleRestartBtn() {
        if (gameStatus !== "idle" &&
                !restartBtnElement.classList.contains("btn-disabled")) {
                init();
        }
}

// Pauses the game
function handlePauseBtn() {
        if (gameStatus === "running" &&
                !pauseBtnElement.classList.contains("btn-disabled")) {
                pause();
        }
}

// Generic function to be used by both "handleBtnMove" and "handleKeyMove"
function handleMove(moveSource, ctrlsArray) {
        if (gameStatus === "running" && ctrlsArray.includes(moveSource)) {
                if (moveSource === ctrlsArray[0]) {
                        if (snake.length > 1) {
                                if (snakeDirection !== "down") snakeDirection = "up";
                        } else {
                                snakeDirection = "up";
                        }
                } else if (moveSource === ctrlsArray[1]) {
                        if (snake.length > 1) {
                                if (snakeDirection !== "up") snakeDirection = "down";
                        } else {
                                snakeDirection = "down";
                        }
                } else if (moveSource === ctrlsArray[2]) {
                        if (snake.length > 1) {
                                if (snakeDirection !== "right") snakeDirection = "left";
                        } else {
                                snakeDirection = "left";
                        }
                } else if (moveSource === ctrlsArray[3]) {
                        if (snake.length > 1) {
                                if (snakeDirection !== "left") snakeDirection = "right";
                        } else {
                                snakeDirection = "right";
                        }
                }
        }
}

// Changes the snake's direction based on the clicked on-screen button
function handleBtnMove(event) {
        const movementBtns = [snakeCtrlsUpBtnElement, snakeCtrlsDownBtnElement, snakeCtrlsLeftBtnElement, snakeCtrlsRightBtnElement,];
        handleMove(event.target, movementBtns);
}

// Changes the snake's direction based on the pressed key
function handleKeyMove(event) {
        const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',];
        event.preventDefault();
        handleMove(event.key, movementKeys);
}

/* -------------------------------------------------- */
// GAME STATE CONTROL FUNCTIONS
/* -------------------------------------------------- */

// Initializes the game's state
function init() {
        // Reset the game state
        gameStatus = "running";
        snake =
                [
                        { column: 11, row: 11, },
                ];
        snakeDirection = "up";
        food = generateFood();
        gameSpeedDelay = 250;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeedDelay);
        updateHighestScore();
        currentScore = 0;
        // Reset the DOM elements
        messageElement.classList.remove("header-message-win", "header-message-loss", "header-message-paused");
        messageElement.textContent = `[ You need ${winningScore} points to win. Do your best! ]`;
        gameBoardElement.classList.remove("gameboard-win");
        gameBoardElement.classList.remove("gameboard-loss");
        gameBoardElement.classList.remove("gameboard-paused");
        gameBoardElement.innerHTML = "";
        playBtnElement.classList.add("btn-disabled");
        playBtnElement.textContent = "RESUME";
        restartBtnElement.classList.remove("btn-disabled");
        pauseBtnElement.classList.remove("btn-disabled");
        // Display to the screen
        render();
}

// Temporarily stops the game
function pause() {
        gameStatus = "paused";
        clearInterval(gameInterval);
        messageElement.classList.add("header-message-paused");
        messageElement.textContent = `[ Game is paused. Click "RESUME" to jump back in! ]`;
        gameBoardElement.classList.add("gameboard-paused");
        playBtnElement.classList.remove("btn-disabled");
        pauseBtnElement.classList.add("btn-disabled");
}

// Resumes the game from a paused state
function resume() {
        gameStatus = "running";
        gameInterval = setInterval(gameLoop, gameSpeedDelay);
        messageElement.classList.remove("header-message-paused");
        messageElement.textContent = `[ You need ${winningScore} points to win. Do your best! ]`;
        gameBoardElement.classList.remove("gameboard-paused");
        playBtnElement.classList.add("btn-disabled");
        pauseBtnElement.classList.remove("btn-disabled");
}

// The main game loop
function gameLoop() {
        moveSnake();
        checkWin();
        checkCollision();
        gameBoardElement.innerHTML = '';
        render();
}

/* -------------------------------------------------- */
// GAME LOGIC FUNCTIONS
/* -------------------------------------------------- */

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

// Moves the snake
function moveSnake() {
        const snakeHead = { ...snake[0] };
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

// Creates food elements at random locations across the game board
function generateFood() {
        let column = Math.floor(Math.random() * gameBoard.columns + 1);
        let row = Math.floor(Math.random() * gameBoard.rows + 1);
        while (snake.some((segment) => segment.column === column && segment.row === row)) {
                column = Math.floor(Math.random() * gameBoard.columns + 1);
                row = Math.floor(Math.random() * gameBoard.rows + 1);
        }
        return { column, row };
}

// Increases the snake's speed each time it consumes food
function increaseSpeed() {
        if (gameSpeedDelay > 50) {
                gameSpeedDelay -= 5;
        }
}

// Updates the highest score at the start of each game
function updateHighestScore() {
        if (currentScore > highestScore) {
                highestScore = currentScore;
        }
}

// Updates the current score each time the snake consumes food
function updateScore() {
        currentScore += foodScore;
        renderScore();
}

// Checks if the player has reached the points required to win the game
function checkWin() {
        if (currentScore >= winningScore) {
                endGame();
        }
}

// Checks if the player has collided with a wall or the snake's body
function checkCollision() {
        const snakeHead = snake[0];
        let whichCollision = "";
        // Check if the snake has run into a wall
        if (snakeHead.column < 1 ||
                snakeHead.column > gameBoard.columns ||
                snakeHead.row < 1 ||
                snakeHead.row > gameBoard.rows) {
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

// Ends the game (win or loss) and takes specific actions depending on the reason
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

/* -------------------------------------------------- */
// RENDER FUNCTIONS
/* -------------------------------------------------- */

// Displays the highest score to the player
function renderHighestScore() {
        highestScoreElement.textContent = highestScore.toString().padStart(4, "0");
}

// Displays the current score to the player
function renderScore() {
        scoreElement.textContent = currentScore.toString().padStart(4, "0");
}

// Displays the snake to the player
function renderSnake() {
        snake.forEach((segment) => {
                const snakeElement = createGameElement("div", "gameboard-snake");
                setGameElementPosition(snakeElement, segment);
                gameBoardElement.appendChild(snakeElement);
        });
}

// Displays the food elements to the player
function renderFood() {
        const foodElement = createGameElement("div", "gameboard-food");
        setGameElementPosition(foodElement, food);
        gameBoardElement.appendChild(foodElement);
}

// Meta function to call all other render functions
function render() {
        renderHighestScore();
        renderScore();
        renderSnake();
        renderFood();
}

/* -------------------------------------------------- */
// EVENT LISTENERS
/* -------------------------------------------------- */

// On-screen button event listeners
uiControlElements.forEach((control) => {
        control.addEventListener("click", handleClick);
});

// Keyboard press event listeners
document.addEventListener("keydown", handleKeyMove);