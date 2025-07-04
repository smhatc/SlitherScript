/*-------------- Constants -------------*/

const gameBoardGrid = {columns: 21, rows: 21,};

/*---------- Variables (State) ---------*/

let gameStatus = "idle";
let snake;
let snakeDirection;
let food;
let gameInterval;
let gameSpeedDelay = 250;
let winningScore = 1000;
let foodScore = 25;
let currentScore = 0;

/*----- Cached Element References  -----*/

// UI controls
const uiControls = document.querySelectorAll(".ui-control");

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
                }
        }
}

function handleKeyMove(event) {
        if (gameStatus === "running") {
                switch (event.key) {
                        case "ArrowUp":
                                snakeDirection = "up";
                                break;
                        case "ArrowDown":
                                snakeDirection = "down";
                                break;
                        case "ArrowRight":
                                snakeDirection = "right";
                                break;
                        case "ArrowLeft":
                                snakeDirection = "left";
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
        gameBoard.innerHTML = '';
        render();
}

function init() {
        gameStatus = "running";
        snake =
        [
                {column: 11, row: 11,},
        ];
        snakeDirection = "up";
        food = generateFood();
        message.textContent = "[ Do your best! ]";
        currentScore = 0;
        renderScore();
        // highestScore.textContent = ;
        gameBoard.innerHTML = "";
        render();
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeedDelay);
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

function endGame() {
        
}

function checkCollision() {
        const snakeHead = snake[0];

        if (snakeHead.column < 1 ||
        snakeHead.column > gameBoardGrid.columns ||
        snakeHead.row < 1 ||
        snakeHead.row > gameBoardGrid.rows) {
                endGame();
        }

        for (let i = 1; i < snake.length; i++) {
                if (snakeHead.column === snake[i].column &&
                snakeHead.row === snake[i].row) {
                        endGame();
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
}

/*----------- Event Listeners ----------*/

uiControls.forEach((control) => {
        control.addEventListener("click", handleClick);
});

document.addEventListener("keydown", handleKeyMove);