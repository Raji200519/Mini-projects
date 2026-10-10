const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const bestDisplay = document.getElementById("best");
const message = document.getElementById("message");
const startButton = document.getElementById("startButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let bird;
let pipes;
let score = 0;
let best = 0;
let running = false;
let gameOver = false;
let animationId = null;

const gravity = 0.35;
const flapPower = -6.5;
const pipeWidth = 65;
const pipeGap = 165;
const pipeSpeed = 2.5;

// Load the saved best score
try {
    best = Number(localStorage.getItem("flappyBest")) || 0;
} catch (error) {
    best = 0;
}

bestDisplay.textContent = best;

// Reset the game
function resetGame() {
    bird = {
        x: 90,
        y: 280,
        size: 30,
        velocity: 0
    };

    pipes = [
        { x: 300, top: 100, passed: false },
        { x: 520, top: 250, passed: false }
    ];

    score = 0;
    scoreDisplay.textContent = score;
    gameOver = false;
}

// Draw the sky and clouds
function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#4FC3F7");
    sky.addColorStop(1, "#D9F7FF");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

    drawCloud(70, 90);
    drawCloud(290, 160);
    drawCloud(190, 40);

    // Ground
    ctx.fillStyle = "#78C850";
    ctx.fillRect(0, HEIGHT - 25, WIDTH, 25);

    ctx.fillStyle = "#429B36";
    ctx.fillRect(0, HEIGHT - 25, WIDTH, 5);
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 22, 0, Math.PI * 2);
    ctx.arc(x + 42, y, 17, 0, Math.PI * 2);
    ctx.fill();
}

// Draw the bird
function drawBird() {
    ctx.save();

    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.min(Math.PI / 4, bird.velocity * 0.06));

    // Body
    ctx.fillStyle = "#FFD43B";
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = "#FFAA00";
    ctx.beginPath();
    ctx.ellipse(-5, 4, 9, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(9, -6, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(11, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FF7043";
    ctx.beginPath();
    ctx.moveTo(17, -1);
    ctx.lineTo(28, 3);
    ctx.lineTo(17, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Draw the pipes
function drawPipes() {
    pipes.forEach(pipe => {
        const bottomY = pipe.top + pipeGap;

        // Top pipe
        ctx.fillStyle = "#22C55E";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);

        // Top pipe cap
        ctx.fillStyle = "#15803D";
        ctx.fillRect(pipe.x - 5, pipe.top - 18, pipeWidth + 10, 18);

        // Bottom pipe
        ctx.fillStyle = "#22C55E";
        ctx.fillRect(
            pipe.x,
            bottomY,
            pipeWidth,
            HEIGHT - 25 - bottomY
        );

        // Bottom pipe cap
        ctx.fillStyle = "#15803D";
        ctx.fillRect(pipe.x - 5, bottomY, pipeWidth + 10, 18);
    });
}

// Move pipes and update score
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
        }
    });

    // Add another pipe after the previous one
    const lastPipe = pipes[pipes.length - 1];

    if (lastPipe.x < WIDTH - 220) {
        const top = 60 + Math.random() * 260;

        pipes.push({
            x: WIDTH,
            top: top,
            passed: false
        });
    }

    // Remove pipes that leave the screen
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

// Check collisions
function checkCollision() {
    const radius = 12;

    // Ground and ceiling
    if (
        bird.y + radius >= HEIGHT - 25 ||
        bird.y - radius <= 0
    ) {
        return true;
    }

    // Pipes
    for (const pipe of pipes) {
        const insidePipeX =
            bird.x + radius > pipe.x &&
            bird.x - radius < pipe.x + pipeWidth;

        const outsideGap =
            bird.y - radius < pipe.top ||
            bird.y + radius > pipe.top + pipeGap;

        if (insidePipeX && outsideGap) {
            return true;
        }
    }

    return false;
}

// One frame of the game
function update() {
    if (!running) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    updatePipes();

    if (checkCollision()) {
        endGame();
        return;
    }

    drawBackground();
    drawPipes();
    drawBird();

    animationId = requestAnimationFrame(update);
}

// Make the bird fly upward
function flap() {
    if (!running) return;

    bird.velocity = flapPower;
}

// Start or restart the game
function startGame() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    resetGame();

    running = true;
    message.textContent = "Keep flying!";

    startButton.textContent = "RESTART GAME";

    drawBackground();
    drawPipes();
    drawBird();

    update();
}

// End the game
function endGame() {
    running = false;
    gameOver = true;

    if (score > best) {
        best = score;
        bestDisplay.textContent = best;

        try {
            localStorage.setItem("flappyBest", best);
        } catch (error) {
            // Game still works if storage is unavailable
        }
    }

    drawBackground();
    drawPipes();
    drawBird();

    // Game-over message
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(35, 220, 330, 140);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Arial";
    ctx.fillText("GAME OVER!", WIDTH / 2, 270);

    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, WIDTH / 2, 310);

    message.textContent = "Oops! Try again!";
    startButton.textContent = "PLAY AGAIN";
}

// Button, keyboard and mouse/touch controls
startButton.addEventListener("click", startGame);

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();

        if (event.repeat) return;

        if (!running && !gameOver) {
            startGame();
        } else {
            flap();
        }
    }
});

canvas.addEventListener("pointerdown", function(event) {
    event.preventDefault();

    if (!running && !gameOver) {
        startGame();
    } else {
        flap();
    }
});

// Draw the initial screen
resetGame();
drawBackground();
drawPipes();
drawBird();