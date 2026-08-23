const game = document.getElementById("game");
const player = document.getElementById("player");

const startMenu = document.getElementById("startMenu");
const playBtn = document.getElementById("playBtn");

const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const bestScore = document.getElementById("bestScore");
const restartBtn = document.getElementById("restartBtn");

const scoreDisplay = document.getElementById("score");
const menuHighScore = document.getElementById("menuHighScore");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");


/* =========================
   GAME VARIABLES
========================= */

let playerX = 175;
const playerSpeed = 6;

let score = 0;
let gameOver = false;
let gameStarted = false;

let highScore =
    Number(localStorage.getItem("carDodgeHighScore")) || 0;

let audioContext;


/* =========================
   HIGH SCORE
========================= */

menuHighScore.textContent =
    "🏆 High Score: " + highScore;


/* =========================
   SOUND SYSTEM
========================= */

function initSound() {

    if (!audioContext) {
        audioContext =
            new (window.AudioContext ||
            window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


function playSound(type) {

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);


    if (type === "score") {

        oscillator.frequency.value = 700;

        gain.gain.setValueAtTime(
            0.12,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.15
        );

    }


    if (type === "crash") {

        oscillator.frequency.value = 120;

        gain.gain.setValueAtTime(
            0.2,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.4
        );

    }


    if (type === "click") {

        oscillator.frequency.value = 450;

        gain.gain.setValueAtTime(
            0.1,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.1
        );

    }


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.4
    );
}


/* =========================
   PLAYER MOVEMENT
========================= */

function movePlayer(direction) {

    if (!gameStarted || gameOver) return;

    playerX += direction * playerSpeed;


    if (playerX < 0) {
        playerX = 0;
    }


    if (playerX > 350) {
        playerX = 350;
    }


    player.style.left =
        playerX + "px";
}


/* KEYBOARD CONTROLS */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "ArrowLeft") {
            movePlayer(-1);
        }

        if (event.key === "ArrowRight") {
            movePlayer(1);
        }

    }
);


/* =========================
   MOBILE CONTROLS
========================= */

leftBtn.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();

        movePlayer(-1);

    },
    { passive: false }
);


rightBtn.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();

        movePlayer(1);

    },
    { passive: false }
);


/* Also allow mouse click */

leftBtn.addEventListener(
    "click",
    function() {
        movePlayer(-1);
    }
);


rightBtn.addEventListener(
    "click",
    function() {
        movePlayer(1);
    }
);


/* =========================
   ENEMY CARS
========================= */

const enemies = [];

const enemyColors = [
    "#1976d2",
    "#f4c20d",
    "#22a447"
];


for (let i = 0; i < 3; i++) {

    const enemy =
        document.createElement("div");


    enemy.style.width = "50px";
    enemy.style.height = "90px";

    enemy.style.background =
        enemyColors[i];

    enemy.style.position =
        "absolute";


    enemy.style.top =
        (-100 - i * 250) + "px";


    enemy.style.left =
        (50 + i * 120) + "px";


    enemy.style.border =
        "3px solid #222";


    enemy.style.borderRadius =
        "14px 14px 10px 10px";


    enemy.style.boxShadow =
        "0 0 10px rgba(0,0,0,0.5)";


    /* Premium enemy design */

    enemy.innerHTML = `

        <div class="enemy-window"></div>

        <div
            class="enemy-headlight"
            style="left:5px;">
        </div>

        <div
            class="enemy-headlight"
            style="right:5px;">
        </div>

        <div
            class="enemy-taillight"
            style="left:6px;">
        </div>

        <div
            class="enemy-taillight"
            style="right:6px;">
        </div>

        <div class="enemy-wheel enemy-wheel-left"></div>

        <div class="enemy-wheel enemy-wheel-right"></div>

    `;


    game.appendChild(enemy);


    enemies.push({
        element: enemy,
        y: -100 - i * 250
    });

}


/* =========================
   COLLISION
========================= */

function checkCollision(enemy) {

    const playerRect =
        player.getBoundingClientRect();

    const enemyRect =
        enemy.element.getBoundingClientRect();


    if (
        playerRect.left < enemyRect.right &&
        playerRect.right > enemyRect.left &&
        playerRect.top < enemyRect.bottom &&
        playerRect.bottom > enemyRect.top
    ) {

        endGame();

    }

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    if (gameOver) return;

    gameOver = true;

    playSound("crash");


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "carDodgeHighScore",
            highScore
        );

    }


    finalScore.textContent =
        "Score: " + score;


    bestScore.textContent =
        "🏆 Best: " + highScore;


    gameOverScreen.style.display =
        "block";

}


/* =========================
   ENEMY MOVEMENT
========================= */

function moveEnemies() {

    if (!gameStarted || gameOver) return;


    enemies.forEach(function(enemy) {

        /* Difficulty */

        const enemySpeed =
            4 + Math.floor(score / 5);


        enemy.y += enemySpeed;


        enemy.element.style.top =
            enemy.y + "px";


        checkCollision(enemy);


        /* Enemy passed */

        if (enemy.y > 620) {

            enemy.y = -100;


            enemy.element.style.left =
                Math.floor(
                    Math.random() * 350
                ) + "px";


            score++;


            scoreDisplay.textContent =
                "Score: " + score;


            playSound("score");

        }

    });


    requestAnimationFrame(moveEnemies);

}


/* =========================
   START GAME
========================= */

playBtn.addEventListener(
    "click",
    function() {

        initSound();

        playSound("click");

        startMenu.style.display =
            "none";

        game.style.display =
            "block";

        gameStarted = true;

        gameOver = false;

        moveEnemies();

    }
);


/* =========================
   RESTART
========================= */

restartBtn.addEventListener(
    "click",
    function() {

        initSound();

        playSound("click");

        location.reload();

    }
);