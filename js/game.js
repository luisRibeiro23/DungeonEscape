import { Player } from "./player.js";
import { keys } from "./input.js";
import { Enemy } from "./enemy.js";
import { Projectile } from "./projectile.js";
import { saveHighScore } from "./storage.js";

// ======================
// CONFIGURAÇÕES DE DIFICULDADE
// ======================

const difficultySettings = {

    easy: {
        enemySpeedMultiplier: 0.7,
        enemyLifeMultiplier: 0.7,
        playerLife: 5
    },

    normal: {
        enemySpeedMultiplier: 1,
        enemyLifeMultiplier: 1,
        playerLife: 3
    },

    hard: {
        enemySpeedMultiplier: 1.4,
        enemyLifeMultiplier: 1.5,
        playerLife: 2
    }
};

// ======================
// FUNÇÃO PRINCIPAL
// Exportada e chamada pelo main.js
// ======================

export function startGame(difficulty = "normal") {

    const settings =
        difficultySettings[difficulty] ||
        difficultySettings.normal;

    // ======================
    // PLAYER
    // ======================

    const player = new Player(settings.playerLife);

    // ======================
    // ARRAYS
    // ======================

    const enemies = [];
    const projectiles = [];

    // ======================
    // HUD
    // ======================

    const lifeElement =
        document.getElementById("life");

    const scoreElement =
        document.getElementById("score");

    const levelElement =
        document.getElementById("level");

    // ======================
    // TELAS
    // ======================

    const gameContainer =
        document.getElementById("game-container");

    const gameArea =
        document.getElementById("game-area");

    const gameOverScreen =
        document.getElementById("game-over-screen");

    const victoryScreen =
        document.getElementById("victory-screen");

    const pauseScreen =
        document.getElementById("pause-screen");

    const restartButton =
        document.getElementById("restart-button");

    const victoryRestartButton =
        document.getElementById("victory-restart-button");

    const resumeButton =
        document.getElementById("resume-button");

    const door =
        document.getElementById("door");

    const finalScoreElement =
        document.getElementById("final-score");

    const victoryScoreElement =
        document.getElementById("victory-score");

    const newRecordElement =
        document.getElementById("new-record");

    // ======================
    // GAME STATE
    // ======================

    let score = 0;

    let level = 1;

    let gameRunning = true;

    let gamePaused = false;

    let playerInvulnerable = false;

    // ======================
    // TIRO
    // ======================

    let canShoot = true;

    const shootCooldown = 300;

    let canDash = true;

    const dashCooldown = 1000;

    // ======================
    // SISTEMA DE FASES
    // ======================

    const phases = {

        1: {
            floor: "slimefloor.png",
            enemies: ["slime"],
            amount: 5
        },

        2: {
            floor: "catacombs.png",
            enemies: ["skeleton"],
            amount: 8
        },

        3: {
            floor: "hell.png",
            enemies: ["demon"],
            amount: 10
        },

        4: {
            floor: "floor.png",
            enemies: ["slime", "skeleton", "demon"],
            amount: 15
        },

        5: {
            floor: "hell.png",
            enemies: ["boss"],
            amount: 1
        }
    };

    // ======================
    // SPAWN ENEMY
    // ======================

    function spawnEnemy(type) {

        let x;
        let y;

        do {

            x = Math.random() * 1200;
            y = Math.random() * 700;

        } while (

            Math.abs(x - player.x) < 200 &&
            Math.abs(y - player.y) < 200
        );

        const enemy = new Enemy(
            type,
            x,
            y,
            settings.enemySpeedMultiplier,
            settings.enemyLifeMultiplier
        );

        enemies.push(enemy);
    }

    // ======================
    // START WAVE
    // ======================

    function startWave() {

        const phase = phases[level];

        gameArea.style.backgroundImage =
            `url("assets/sprites/${phase.floor}")`;

        for (let i = 0; i < phase.amount; i++) {

            const randomType =
                phase.enemies[
                    Math.floor(
                        Math.random() *
                        phase.enemies.length
                    )
                ];

            spawnEnemy(randomType);
        }
    }

    // ======================
    // PRIMEIRA WAVE
    // ======================

    startWave();

    // ======================
    // NEXT LEVEL
    // ======================

    function nextLevel() {

        if (level >= 5) {

            victory();

            return;
        }

        level++;

        levelElement.innerHTML =
            `🏰 Fase: ${level}`;

        door.style.display = "none";

        startWave();
    }

    // ======================
    // VITÓRIA
    // ======================

    function victory() {

        gameRunning = false;

        const isNewRecord =
            saveHighScore(score);

        victoryScoreElement.innerHTML =
            `Pontuação: ${score}`;

        if (isNewRecord) {

            newRecordElement.style.display =
                "block";
        }

        gameContainer.style.display =
            "none";

        victoryScreen.style.display =
            "flex";
    }

    // ======================
    // GAME OVER
    // ======================

    function gameOver() {

        gameRunning = false;

        saveHighScore(score);

        finalScoreElement.innerHTML =
            `Pontuação: ${score}`;

        gameContainer.style.display =
            "none";

        gameOverScreen.style.display =
            "flex";
    }

    // ======================
    // PAUSA
    // ======================

    function togglePause() {

        if (!gameRunning) return;

        gamePaused = !gamePaused;

        pauseScreen.style.display =
            gamePaused ? "flex" : "none";
    }

    // ======================
    // LISTENERS DE TECLADO
    // ======================

    window.addEventListener("keydown", (event) => {

        if (event.code === "Space") {
            shoot();
        }

        if (
            event.code === "Escape" ||
            event.code === "KeyP"
        ) {
            togglePause();
        }

        if (event.code === "ShiftLeft") {
            dash();
        }
    });

    resumeButton.addEventListener("click", () => {
        togglePause();
    });

    restartButton.addEventListener("click", () => {
        location.reload();
    });

    victoryRestartButton.addEventListener("click", () => {
        location.reload();
    });

    // ======================
    // TIRO
    // ======================

    function shoot() {

        if (!canShoot) return;

        if (gamePaused) return;

        canShoot = false;

        const projectile = new Projectile(
            player.x + 16,
            player.y + 16,
            player.lastDirectionX,
            player.lastDirectionY
        );

        projectiles.push(projectile);

        setTimeout(() => {
            canShoot = true;
        }, shootCooldown);
    }

    // ======================
    // DASH
    // ======================

    function dash() {

        if (!canDash) return;

        if (player.isDashing) return;

        if (gamePaused) return;

        canDash = false;

        player.isDashing = true;

        player.speed = 15;

        const smokeInterval = setInterval(() => {
            createSmoke();
        }, 50);

        playerInvulnerable = true;

        player.element.style.opacity = "0.6";

        setTimeout(() => {

            player.speed = player.normalSpeed;

            player.isDashing = false;

            playerInvulnerable = false;

            player.element.style.opacity = "1";

            clearInterval(smokeInterval);

        }, 200);

        setTimeout(() => {
            canDash = true;
        }, dashCooldown);
    }

    // ======================
    // EFEITOS VISUAIS
    // ======================

    function createHitEffect(x, y) {

        const hit =
            document.createElement("div");

        hit.classList.add("hit-effect");

        hit.style.left = x + "px";
        hit.style.top = y + "px";

        gameArea.appendChild(hit);

        setTimeout(() => {
            hit.remove();
        }, 300);
    }

    function createSmoke() {

        const smoke =
            document.createElement("div");

        smoke.classList.add("smoke");

        smoke.style.left = player.x + "px";
        smoke.style.top = player.y + "px";

        gameArea.appendChild(smoke);

        setTimeout(() => {
            smoke.remove();
        }, 500);
    }

    // ======================
    // COLISÃO
    // ======================

    function checkCollision(element1, element2) {

        const rect1 =
            element1.getBoundingClientRect();

        const rect2 =
            element2.getBoundingClientRect();

        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    }

    // ======================
    // UPDATE
    // ======================

    function update() {

        if (!gameRunning) return;

        if (gamePaused) return;

        let dx = 0;
        let dy = 0;

        // MOVIMENTO PLAYER

        if (keys["w"]) dy -= player.speed;
        if (keys["s"]) dy += player.speed;
        if (keys["a"]) dx -= player.speed;
        if (keys["d"]) dx += player.speed;

        player.move(dx, dy);

        // UPDATE ENEMIES

        enemies.forEach((enemy, enemyIndex) => {

            enemy.update(player.x, player.y);

            if (
                checkCollision(
                    player.element,
                    enemy.element
                )
                && !playerInvulnerable
            ) {

                playerInvulnerable = true;

                player.life--;

                lifeElement.innerHTML =
                    `❤️ Vida: ${player.life}`;

                player.element.style.opacity = "0.5";

                setTimeout(() => {

                    playerInvulnerable = false;

                    player.element.style.opacity = "1";

                }, 1000);

                enemy.remove();

                enemies.splice(enemyIndex, 1);

                if (player.life <= 0) {
                    gameOver();
                }
            }
        });

        // UPDATE PROJECTILES

        projectiles.forEach((projectile, projectileIndex) => {

            projectile.update();

            if (
                projectile.x < 0 ||
                projectile.x > window.innerWidth ||
                projectile.y < 0 ||
                projectile.y > window.innerHeight
            ) {

                projectile.remove();

                projectiles.splice(projectileIndex, 1);

                return;
            }

            enemies.forEach((enemy, enemyIndex) => {

                if (
                    checkCollision(
                        projectile.element,
                        enemy.element
                    )
                ) {

                    const dead =
                        enemy.takeDamage(1);

                    createHitEffect(enemy.x, enemy.y);

                    if (dead) {

                        enemy.remove();

                        enemies.splice(enemyIndex, 1);

                        score += 10;

                        scoreElement.innerHTML =
                            `⭐ Score: ${score}`;
                    }

                    projectile.remove();

                    projectiles.splice(projectileIndex, 1);
                }
            });
        });

        // PORTA

        if (enemies.length === 0) {
            door.style.display = "block";
        }

        if (
            door.style.display === "block" &&
            checkCollision(player.element, door)
        ) {
            nextLevel();
        }
    }

    // ======================
    // GAME LOOP
    // ======================

    function gameLoop() {

        update();

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}