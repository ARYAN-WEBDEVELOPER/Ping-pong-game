let canvas = document.getElementById("table");
let draw_ = canvas.getContext("2d");

const hitSound = document.getElementById("hitSound");
const scoreSound = document.getElementById("scoreSound");
const wallSound = document.getElementById("wallSound");

const gameOverDiv = document.getElementById("gameOver");
const winnerText = document.getElementById("winnerText");
const restartBtn = document.getElementById("restartBtn");

let isGameOver = false;

const WIN_SCORE = 5;

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    velX: 5,
    velY: 5,
    Color: "green"
};

const User = {
    x: 0,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    Color: "red"
};

const CPU = {
    x: canvas.width - 10,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    Color: "red"
};

const separator = {
    x: (canvas.width - 2) / 2,
    y: 0,
    width: 2,
    height: 10,
    Color: "white"
};

function drawRectangle(x, y, w, h, color) {
    draw_.fillStyle = color;
    draw_.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    draw_.fillStyle = color;
    draw_.beginPath();
    draw_.arc(x, y, r, 0, Math.PI * 2, false);
    draw_.closePath();
    draw_.fill();
}

function drawScore(text, x, y) {
    draw_.fillStyle = "white";
    draw_.font = "40px Arial";
    draw_.fillText(text, x, y);
}

function drawSeparator() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRectangle(separator.x, separator.y + i, separator.width, separator.height, separator.Color);
    }
}

function collision(ball, paddle) {
    return (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    );
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velX = -ball.velX;
    ball.velY = 5;
}

function checkGameOver() {
    if (User.score === WIN_SCORE || CPU.score === WIN_SCORE) {
        isGameOver = true;
        gameOverDiv.style.display = "block";
        winnerText.textContent = User.score === WIN_SCORE ? "You Win!" : "CPU Wins!";
    }
}

function update() {
    if (isGameOver) return;

    ball.x += ball.velX;
    ball.y += ball.velY;

    // CPU AI
    CPU.y += (ball.y - (CPU.y + CPU.height / 2)) * 0.1;

    // Wall bounce
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        wallSound.play();
        ball.velY = -ball.velY;
    }

    // Left miss
    if (ball.x - ball.radius < 0) {
        scoreSound.play();
        CPU.score++;
        resetBall();
        checkGameOver();
    }

    // Right miss
    if (ball.x + ball.radius > canvas.width) {
        scoreSound.play();
        User.score++;
        resetBall();
        checkGameOver();
    }

    // Paddle collision
    let player = (ball.x < canvas.width / 2) ? User : CPU;
    if (collision(ball, player)) {
        hitSound.play();

        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;

        ball.velX = direction * ball.speed * Math.cos(angleRad);
        ball.velY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.3;
    }
}

function render() {
    drawRectangle(0, 0, canvas.width, canvas.height, "black");
    drawScore(User.score, canvas.width / 4, canvas.height / 5);
    drawScore(CPU.score, 3 * canvas.width / 4, canvas.height / 5);
    drawSeparator();
    drawRectangle(User.x, User.y, User.width, User.height, User.Color);
    drawRectangle(CPU.x, CPU.y, CPU.width, CPU.height, CPU.Color);
    drawCircle(ball.x, ball.y, ball.radius, ball.Color);
}

function gameLoop() {
    update();
    render();
}

setInterval(gameLoop, 1000 / 60);

// Mouse control
canvas.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect();
    User.y = e.clientY - rect.top - User.height / 2;
});

// Touch control (mobile)
canvas.addEventListener("touchmove", (e) => {
    let rect = canvas.getBoundingClientRect();
    let touch = e.touches[0];
    User.y = touch.clientY - rect.top - User.height / 2;
});

// Restart button
restartBtn.addEventListener("click", () => {
    User.score = 0;
    CPU.score = 0;
    isGameOver = false;
    gameOverDiv.style.display = "none";
    resetBall();
});
