import { Player } from "./player.js";
import { keys } from "./input.js";
import { Enemy } from "./enemy.js";
import { Projectile } from "./projectile.js";
import { PowerUp, tryDropPowerUp, powerupTypes } from "./powerup.js";
import { saveHighScore } from "./storage.js";
import { phases, TOTAL_PHASES } from "./level.js";

// ======================
// CONFIGURAÇÕES DE DIFICULDADE
// ======================

const difficultySettings = {

    easy: {
        enemySpeedMultiplier: 0.7,
        enemyLifeMultiplier:  0.7,
        playerLife:           5,
        durationMultiplier:   0.8,
        spawnMultiplier:      1.4,
    },

    normal: {
        enemySpeedMultiplier: 1,
        enemyLifeMultiplier:  1,
        playerLife:           3,
        durationMultiplier:   1,
        spawnMultiplier:      1,
    },

    hard: {
        enemySpeedMultiplier: 1.4,
        enemyLifeMultiplier:  1.5,
        playerLife:           2,
        durationMultiplier:   1.4,
        spawnMultiplier:      0.65,
    }
};

// ======================
// FUNÇÃO PRINCIPAL
// ======================

export function startGame(difficulty = "normal") {

    const settings =
        difficultySettings[difficulty] ||
        difficultySettings.normal;

    // ======================
    // PLAYER
    // ======================

    const player = new Player(settings.playerLife);

    // Active power-ups no player

    const activePowerUps = {
        "triple-shot": false,
        "shield":      false,
        "speed":       false,
    };

    // ======================
    // ARRAYS
    // ======================

    const enemies     = [];
    const projectiles = [];
    const powerups    = [];

    // ======================
    // HUD
    // ======================

    const lifeElement  = document.getElementById("life");
    const scoreElement = document.getElementById("score");
    const levelElement = document.getElementById("level");
    const timerElement = document.getElementById("timer");

    // ======================
    // TELAS
    // ======================

    const gameContainer        = document.getElementById("game-container");
    const gameArea             = document.getElementById("game-area");
    const gameOverScreen       = document.getElementById("game-over-screen");
    const victoryScreen        = document.getElementById("victory-screen");
    const pauseScreen          = document.getElementById("pause-screen");
    const restartButton        = document.getElementById("restart-button");
    const victoryRestartButton = document.getElementById("victory-restart-button");
    const resumeButton         = document.getElementById("resume-button");
    const door                 = document.getElementById("door");
    const finalScoreElement    = document.getElementById("final-score");
    const victoryScoreElement  = document.getElementById("victory-score");
    const newRecordElement     = document.getElementById("new-record");

    // ======================
    // GAME STATE
    // ======================

    let score    = 0;
    let level    = 1;

    let gameRunning       = true;
    let gamePaused        = false;
    let playerInvulnerable = false;

    let waveActive     = false;
    let spawnTimeout   = null;
    let timerInterval  = null;
    let timeRemaining  = 0;

    let canShoot       = true;
    const shootCooldown = 300;

    let canDash        = true;
    const dashCooldown  = 1000;

    // ======================
    // EFEITO DE INVOCAÇÃO
    // ======================

    function createSummonEffect(x, y, onComplete) {

        const effect = document.createElement("div");

        effect.classList.add("summon-effect");

        effect.style.left = x + "px";
        effect.style.top  = y + "px";

        gameArea.appendChild(effect);

        setTimeout(() => {

            effect.remove();

            onComplete();

        }, 800);
    }

    // ======================
    // SPAWN ENEMY
    // ======================

    function spawnEnemy(type) {

        let x, y;

        do {

            x = Math.random() * (gameArea.clientWidth  - 100) + 50;
            y = Math.random() * (gameArea.clientHeight - 100) + 50;

        } while (
            Math.abs(x - player.x) < 200 ||
            Math.abs(y - player.y) < 200
        );

        createSummonEffect(x, y, () => {

            if (!gameRunning) return;

            const enemy = new Enemy(
                type, x, y,
                settings.enemySpeedMultiplier,
                settings.enemyLifeMultiplier
            );

            enemies.push(enemy);
        });
    }

    // ======================
    // SPAWN SLIME MINI
    // Chamado ao matar um slime normal
    // ======================

    function spawnSlimeMini(x, y) {

        for (let i = 0; i < 2; i++) {

            const offsetX = i === 0 ? -20 : 20;

            const mini = new Enemy(
                "slime-mini",
                x + offsetX,
                y,
                settings.enemySpeedMultiplier,
                settings.enemyLifeMultiplier
            );

            enemies.push(mini);
        }
    }

    // ======================
    // SPAWN PROJÉTIL INIMIGO
    // Callback passado pro enemy.update()
    // ======================

    function spawnEnemyProjectile(x, y, dirX, dirY, type) {

        const proj = new Projectile(
            x, y, dirX, dirY,
            "enemy",
            type
        );

        projectiles.push(proj);
    }

    // ======================
    // BOSS SUMMON
    // Invoca 2 inimigos aleatórios perto do boss
    // ======================

    function bossSummon() {

        const summonTypes = ["slime", "skeleton", "demon"];

        for (let i = 0; i < 2; i++) {

            const type =
                summonTypes[
                    Math.floor(Math.random() * summonTypes.length)
                ];

            spawnEnemy(type);
        }
    }

    // ======================
    // APLICAR POWER-UP
    // ======================

    function applyPowerUp(type) {

        const config = powerupTypes[type];

        activePowerUps[type] = true;

        // Atualiza visual do HUD de power-up

        showPowerUpHUD(type, config.duration);

        // Efeito específico

        if (type === "speed") {
            player.normalSpeed = 9;
            player.speed       = 9;
        }

        if (type === "shield") {
            playerInvulnerable = true;
            player.element.classList.add("shield-active");
        }

        // Remove após duração

        setTimeout(() => {

            activePowerUps[type] = false;

            if (type === "speed") {
                player.normalSpeed = 5;
                if (!player.isDashing) player.speed = 5;
            }

            if (type === "shield") {
                playerInvulnerable = false;
                player.element.classList.remove("shield-active");
            }

        }, config.duration);
    }

    // ======================
    // HUD DE POWER-UP
    // ======================

    function showPowerUpHUD(type, duration) {

        const existing =
            document.getElementById(`powerup-hud-${type}`);

        if (existing) existing.remove();

        const hud = document.createElement("div");

        hud.id = `powerup-hud-${type}`;

        hud.classList.add("powerup-hud-item");

        hud.innerHTML = `
            <span>${powerupTypes[type].label}</span>
            <div class="powerup-hud-bar">
                <div class="powerup-hud-fill"
                     style="--duration: ${duration}ms;
                            --color: ${powerupTypes[type].color}">
                </div>
            </div>
        `;

        document
            .getElementById("powerup-hud")
            .appendChild(hud);

        setTimeout(() => hud.remove(), duration + 100);
    }

    // ======================
    // WAVE COM SPAWN DINÂMICO
    // ======================

    function startWave() {

        const phase = phases[level];

        gameArea.style.backgroundImage =
            `url("assets/sprites/${phase.floor}")`;

        const duration = Math.floor(
            phase.duration * settings.durationMultiplier
        );

        const initialInterval = Math.floor(
            phase.spawnInterval * settings.spawnMultiplier
        );

        const minInterval = Math.floor(
            phase.spawnIntervalMin * settings.spawnMultiplier
        );

        timeRemaining = duration;
        waveActive    = true;

        door.style.display = "none";

        updateTimerDisplay();

        timerInterval = setInterval(() => {

            if (gamePaused) return;

            timeRemaining -= 1000;

            updateTimerDisplay();

            if (timeRemaining <= 10000 && timerElement) {
                timerElement.classList.add("urgent");
            }

            if (timeRemaining <= 0) {

                waveActive = false;

                clearInterval(timerInterval);
                clearTimeout(spawnTimeout);

                if (timerElement) {
                    timerElement.innerHTML = "⏱️ 0s";
                    timerElement.classList.remove("urgent");
                }
            }

        }, 1000);

        scheduleNextSpawn(phase, initialInterval, minInterval, duration);
    }

    function scheduleNextSpawn(phase, currentInterval, minInterval, totalDuration) {

        if (!waveActive) return;

        spawnTimeout = setTimeout(() => {

            if (!gameRunning || !waveActive) return;

            const randomType =
                phase.enemies[
                    Math.floor(Math.random() * phase.enemies.length)
                ];

            spawnEnemy(randomType);

            const progress = 1 - (timeRemaining / totalDuration);

            const nextInterval = Math.max(
                minInterval,
                Math.floor(
                    currentInterval -
                    (currentInterval - minInterval) * progress * 0.3
                )
            );

            scheduleNextSpawn(phase, nextInterval, minInterval, totalDuration);

        }, currentInterval);
    }

    function updateTimerDisplay() {

        if (!timerElement) return;

        const seconds = Math.max(0, Math.ceil(timeRemaining / 1000));

        timerElement.innerHTML = `⏱️ ${seconds}s`;
    }

    // ======================
    // PRIMEIRA WAVE
    // ======================

    startWave();

    // ======================
    // NEXT LEVEL
    // ======================

    function nextLevel() {

        clearTimeout(spawnTimeout);
        clearInterval(timerInterval);

        if (level >= TOTAL_PHASES) {

            victory();
            return;
        }

        level++;

        levelElement.innerHTML = `🏰 Fase: ${level}`;

        door.style.display = "none";

        startWave();
    }

    // ======================
    // VITÓRIA
    // ======================

    function victory() {

        gameRunning = false;

        const isNewRecord = saveHighScore(score);

        victoryScoreElement.innerHTML = `Pontuação: ${score}`;

        if (isNewRecord) {
            newRecordElement.style.display = "block";
        }

        gameContainer.style.display = "none";
        victoryScreen.style.display = "flex";
    }

    // ======================
    // GAME OVER
    // ======================

    function gameOver() {

        gameRunning = false;

        clearTimeout(spawnTimeout);
        clearInterval(timerInterval);

        saveHighScore(score);

        finalScoreElement.innerHTML = `Pontuação: ${score}`;

        gameContainer.style.display  = "none";
        gameOverScreen.style.display = "flex";
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
    // LISTENERS
    // ======================

    window.addEventListener("keydown", (event) => {

        if (event.code === "Space")   shoot();

        if (
            event.code === "Escape" ||
            event.code === "KeyP"
        ) togglePause();

        if (event.code === "ShiftLeft") dash();
    });

    resumeButton.addEventListener("click",         () => togglePause());
    restartButton.addEventListener("click",        () => location.reload());
    victoryRestartButton.addEventListener("click", () => location.reload());

    // ======================
    // TIRO DO PLAYER
    // ======================

    function shoot() {

        if (!canShoot || gamePaused) return;

        canShoot = false;

        const cx = player.x + 16;
        const cy = player.y + 16;

        if (activePowerUps["triple-shot"]) {

            // Tiro triplo: central + dois angulados

            const angle =
                Math.atan2(
                    player.lastDirectionY,
                    player.lastDirectionX
                );

            const spread = 0.3;

            [0, -spread, spread].forEach((offset) => {

                const a = angle + offset;

                projectiles.push(
                    new Projectile(
                        cx, cy,
                        Math.cos(a),
                        Math.sin(a),
                        "player",
                        "default"
                    )
                );
            });

        } else {

            projectiles.push(
                new Projectile(
                    cx, cy,
                    player.lastDirectionX,
                    player.lastDirectionY,
                    "player",
                    "default"
                )
            );
        }

        setTimeout(() => { canShoot = true; }, shootCooldown);
    }

    // ======================
    // DASH
    // ======================

    function dash() {

        if (!canDash || player.isDashing || gamePaused) return;

        canDash = false;

        player.isDashing = true;
        player.speed     = 15;

        const smokeInterval = setInterval(() => createSmoke(), 50);

        playerInvulnerable = true;

        player.element.style.opacity = "0.6";

        setTimeout(() => {

            player.speed     = player.normalSpeed;
            player.isDashing = false;

            // Não remove invulnerabilidade se escudo ativo

            if (!activePowerUps["shield"]) {
                playerInvulnerable = false;
            }

            player.element.style.opacity = "1";

            clearInterval(smokeInterval);

        }, 200);

        setTimeout(() => { canDash = true; }, dashCooldown);
    }

    // ======================
    // EFEITOS VISUAIS
    // ======================

    function createHitEffect(x, y) {

        const hit = document.createElement("div");

        hit.classList.add("hit-effect");

        hit.style.left = x + "px";
        hit.style.top  = y + "px";

        gameArea.appendChild(hit);

        setTimeout(() => hit.remove(), 300);
    }

    function createSmoke() {

        const smoke = document.createElement("div");

        smoke.classList.add("smoke");

        smoke.style.left = player.x + "px";
        smoke.style.top  = player.y + "px";

        gameArea.appendChild(smoke);

        setTimeout(() => smoke.remove(), 500);
    }

    // ======================
    // COLISÃO
    // ======================

    function checkCollision(el1, el2) {

        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();

        return !(
            r1.right  < r2.left  ||
            r1.left   > r2.right ||
            r1.bottom < r2.top   ||
            r1.top    > r2.bottom
        );
    }

    // ======================
    // UPDATE
    // ======================

    function update() {

        if (!gameRunning || gamePaused) return;

        const now = performance.now();

        let dx = 0;
        let dy = 0;

        if (keys["w"]) dy -= player.speed;
        if (keys["s"]) dy += player.speed;
        if (keys["a"]) dx -= player.speed;
        if (keys["d"]) dx += player.speed;

        player.move(dx, dy);

        // ======================
        // UPDATE ENEMIES
        // ======================

        enemies.forEach((enemy, enemyIndex) => {

            enemy.update(
                player.x,
                player.y,
                now,
                spawnEnemyProjectile,
                bossSummon
            );

            // Colisão player-enemy

            if (
                checkCollision(player.element, enemy.element)
                && !playerInvulnerable
            ) {

                playerInvulnerable = true;

                player.life--;

                lifeElement.innerHTML =
                    `❤️ Vida: ${player.life}`;

                player.element.style.opacity = "0.5";

                setTimeout(() => {

                    if (!activePowerUps["shield"]) {
                        playerInvulnerable = false;
                    }

                    player.element.style.opacity = "1";

                }, 1000);

                enemy.remove();

                enemies.splice(enemyIndex, 1);

                if (player.life <= 0) gameOver();
            }
        });

        // ======================
        // UPDATE PROJECTILES
        // ======================

        projectiles.forEach((projectile, projIndex) => {

            projectile.update();

            // Remove se saiu da tela

            if (
                projectile.x < 0 ||
                projectile.x > window.innerWidth ||
                projectile.y < 0 ||
                projectile.y > window.innerHeight
            ) {

                projectile.remove();
                projectiles.splice(projIndex, 1);
                return;
            }

            // Projétil do PLAYER acerta inimigo

            if (projectile.owner === "player") {

                enemies.forEach((enemy, enemyIndex) => {

                    if (checkCollision(projectile.element, enemy.element)) {

                        const dead = enemy.takeDamage(1);

                        createHitEffect(enemy.x, enemy.y);

                        if (dead) {

                            // Slime se divide

                            if (enemy.type === "slime") {
                                spawnSlimeMini(enemy.x, enemy.y);
                            }

                            // Tenta dropar power-up

                            const drop = tryDropPowerUp(
                                enemy.type,
                                enemy.x,
                                enemy.y
                            );

                            if (drop) powerups.push(drop);

                            enemy.remove();
                            enemies.splice(enemyIndex, 1);

                            score += 10;

                            scoreElement.innerHTML =
                                `⭐ Score: ${score}`;
                        }

                        projectile.remove();
                        projectiles.splice(projIndex, 1);
                    }
                });

            // Projétil do INIMIGO acerta player

            } else if (projectile.owner === "enemy") {

                if (
                    checkCollision(projectile.element, player.element)
                    && !playerInvulnerable
                ) {

                    playerInvulnerable = true;

                    player.life--;

                    lifeElement.innerHTML =
                        `❤️ Vida: ${player.life}`;

                    player.element.style.opacity = "0.5";

                    setTimeout(() => {

                        if (!activePowerUps["shield"]) {
                            playerInvulnerable = false;
                        }

                        player.element.style.opacity = "1";

                    }, 1000);

                    projectile.remove();
                    projectiles.splice(projIndex, 1);

                    if (player.life <= 0) gameOver();
                }
            }
        });

        // ======================
        // UPDATE POWER-UPS
        // ======================

        powerups.forEach((powerup, powerupIndex) => {

            if (checkCollision(player.element, powerup.element)) {

                applyPowerUp(powerup.type);

                powerup.remove();

                powerups.splice(powerupIndex, 1);
            }
        });

        // ======================
        // PORTA
        // ======================

        if (!waveActive && enemies.length === 0) {
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