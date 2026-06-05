import { Player } from "./player.js";
import { keys } from "./input.js";
import { Enemy } from "./enemy.js";
import { Projectile } from "./projectile.js";
import { PowerUp, tryDropPowerUp, powerupTypes } from "./powerup.js";
import { saveHighScore } from "./storage.js?v=1";
import { phases, TOTAL_PHASES } from "./level.js";
import { cheats, registerCheatCallbacks } from "./cheat.js";
import { playSound, playMusic, stopMusic } from "./sound.js";

// ======================
// DIFICULDADE
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

    const player = new Player(settings.playerLife);

    const activePowerUps = {
        "triple-shot": false,
        "shield":      false,
        "speed":       false,
        "heart":       false,
    };

    const enemies     = [];
    const projectiles = [];
    const powerups    = [];

    // HUD

    const lifeElement  = document.getElementById("life");
    const scoreElement = document.getElementById("score");
    const levelElement = document.getElementById("level");
    const timerElement = document.getElementById("timer");

    // Boss HUD

    const bossHud    = document.getElementById("boss-hud");
    const bossHudBar = document.getElementById("boss-hud-bar");
    const bossHudHp  = document.getElementById("boss-hud-hp");

    // Telas

    const gameContainer        = document.getElementById("game-container");
    const pauseButton          = document.getElementById("pause-button");
    const gameArea             = document.getElementById("game-area");
    const gameOverScreen       = document.getElementById("game-over-screen");
    const victoryScreen        = document.getElementById("victory-screen");
    const pauseScreen          = document.getElementById("pause-screen");
    const cutsceneScreen       = document.getElementById("cutscene-screen");
    const creditsScreen        = document.getElementById("credits-screen");
    const restartButton        = document.getElementById("restart-button");
    const victoryRestartButton = document.getElementById("victory-restart-button");
    const resumeButton         = document.getElementById("resume-button");
    const creditsButton        = document.getElementById("credits-button");
    const door                 = document.getElementById("door");
    const instructionsOverlay  = document.getElementById("instructions-overlay");
    const finalScoreElement    = document.getElementById("final-score");
    const victoryScoreElement  = document.getElementById("victory-score");
    const newRecordElement     = document.getElementById("new-record");

    // State

    let score              = 0;
    let level              = 1;
    let gameRunning        = true;
    let gamePaused         = false;
    let playerInvulnerable = false;
    let waveActive         = false;
    let spawnTimeout       = null;
    let timerInterval      = null;
    let timeRemaining      = 0;
    let canShoot           = true;
    const shootCooldown    = 300;
    let canDash            = true;
    const dashCooldown     = 1000;
    let bossRef            = null;

    // ======================
    // REGISTRA CALLBACKS DOS CHEATS
    // ======================

    registerCheatCallbacks({

        onSkipPhase: () => {

            if (!gameRunning || gamePaused) return;

            [...enemies].forEach((e) => {
                e.remove();
            });

            enemies.length = 0;

            waveActive = false;

            clearTimeout(spawnTimeout);
            clearInterval(timerInterval);

            if (timerElement) {
                timerElement.innerHTML = "⏱️ 0s";
                timerElement.classList.remove("urgent");
            }

            if (level >= TOTAL_PHASES) {
                victory();
                return;
            }

            nextLevel();
        },

        onKillAll: () => {

            if (!gameRunning || gamePaused) return;

            [...enemies].forEach((e) => {
                e.remove();
                score += 10;
            });

            enemies.length = 0;

            scoreElement.innerHTML = `⭐ Score: ${score}`;

            hideBossHud();
        },

        onExtraLives: () => {

            if (!gameRunning) return;

            player.life = Math.min(player.life + 5, 20);

            lifeElement.innerHTML =
                `❤️ Vida: ${player.life}`;
        }
    });

    // ======================
    // BARRA DE VIDA DO BOSS
    // ======================

    function showBossHud(boss) {

        bossRef = boss;

        bossHud.style.display = "flex";

        updateBossHud();
    }

    function hideBossHud() {

        bossHud.style.display = "none";

        bossRef = null;
    }

    function updateBossHud() {

        if (!bossRef) return;

        const pct =
            Math.max(0, bossRef.life / bossRef.maxLife * 100);

        bossHudBar.style.width = pct + "%";

        bossHudHp.innerHTML =
            `${Math.max(0, bossRef.life)} / ${bossRef.maxLife}`;

        if (bossRef.phase2) {
            bossHudBar.style.background =
                "linear-gradient(90deg, #6600cc, #aa44ff, #6600cc)";
        }
    }

    // ======================
    // CUTSCENE + CRÉDITOS
    // ======================

    function playCutscene(onComplete) {

        gameContainer.style.display = "none";

        cutsceneScreen.style.display = "flex";

        const lines = [
            document.getElementById("cutscene-line-1"),
            document.getElementById("cutscene-line-2"),
            document.getElementById("cutscene-line-3"),
            document.getElementById("cutscene-line-4"),
        ];

        lines.forEach((line, i) => {

            setTimeout(() => {

                line.style.animation =
                    `cutsceneLineIn 1.2s ease forwards`;

            }, i * 1800);
        });

        setTimeout(onComplete, lines.length * 1800 + 2000);
    }

    function playCredits(onComplete) {

        cutsceneScreen.style.display = "none";

        creditsScreen.style.display = "flex";

        creditsButton.addEventListener("click", () => {

            creditsScreen.style.display = "none";

            onComplete();

        }, { once: true });
    }

    // ======================
    // VITÓRIA
    // ======================

    function victory() {

        gameRunning = false;

        clearTimeout(spawnTimeout);
        clearInterval(timerInterval);

        stopMusic();
        playMusic("victory");

        const isNewRecord = saveHighScore(score);

        playCutscene(() => {

            playCredits(() => {

                victoryScoreElement.innerHTML =
                    `Pontuação: ${score}`;

                if (isNewRecord) {
                    newRecordElement.style.display = "block";
                }

                victoryScreen.style.display = "flex";
            });
        });
    }

    // ======================
    // MORTE DO BOSS
    // ======================

    function killBoss(boss, index) {
        boss.element.classList.remove("enemy-boss");
        boss.element.classList.add("boss-dying");

        hideBossHud();

        setTimeout(() => {

            boss.element.remove();

            enemies.splice(index, 1);

            score += 100;

            scoreElement.innerHTML = `⭐ Score: ${score}`;

            waveActive = false;

            victory();

        }, 1500);
    }

    // ======================
    // GAME OVER
    // ======================

    function gameOver() {

        gameRunning = false;

        clearTimeout(spawnTimeout);
        clearInterval(timerInterval);

        hideBossHud();
        stopMusic();
        playSound("death");

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

        if (
            instructionsOverlay &&
            instructionsOverlay.style.display !== "none" &&
            getComputedStyle(instructionsOverlay).display !== "none"
        ) {
            instructionsOverlay.style.display = "none";
            return;
        }

        gamePaused = !gamePaused;

        pauseScreen.style.display =
            gamePaused ? "flex" : "none";
    }

    // ======================
    // SPAWN
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

            if (type === "boss") {
            showBossHud(enemy);
            playMusic("boss");
        }
        });
    }

    function spawnSlimeMini(x, y) {

        for (let i = 0; i < 2; i++) {

            enemies.push(new Enemy(
                "slime-mini",
                x + (i === 0 ? -20 : 20),
                y,
                settings.enemySpeedMultiplier,
                settings.enemyLifeMultiplier
            ));
        }
    }

    function spawnEnemyProjectile(x, y, dirX, dirY, type) {

        projectiles.push(
            new Projectile(x, y, dirX, dirY, "enemy", type)
        );
    }

    function bossSummon() {

        const types = ["slime", "skeleton", "demon"];

        for (let i = 0; i < 2; i++) {
            spawnEnemy(
                types[Math.floor(Math.random() * types.length)]
            );
        }
    }

    // ======================
    // POWER-UPS
    // ======================

    function applyPowerUp(type) {

        const config = powerupTypes[type];

        activePowerUps[type] = true;

        showPowerUpHUD(type, config.duration);

        if (type === "speed") {
            player.normalSpeed = 9;
            player.speed       = 9;
        }

        if (type === "shield") {
            playerInvulnerable = true;
            player.element.classList.add("shield-active");
        }

        if (type === "heart") {
            player.life = Math.min(player.life + 1, 20);
            lifeElement.innerHTML = `❤️ Vida: ${player.life}`;
            activePowerUps[type] = false;
        }

        if (type !== "heart") {
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
    }

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
                     style="--duration:${duration}ms;
                            --color:${powerupTypes[type].color}">
                </div>
            </div>`;

        document.getElementById("powerup-hud").appendChild(hud);

        setTimeout(() => hud.remove(), duration + 100);
    }

    // ======================
    // WAVE
    // ======================

    function getWaveDuration(level, difficulty) {
        const levelIndex = Math.max(1, level);

        switch (difficulty) {
            case "easy":
                return (45 + (levelIndex - 1) * 30) * 1000;
            case "hard":
                return (90 + (levelIndex - 1) * 60) * 1000;
            default:
                return (60 + (levelIndex - 1) * 45) * 1000;
        }
    }

    function getSpawnCount(level, difficulty) {
        const levelIndex = Math.max(1, level);

        switch (difficulty) {
            case "easy":
                return 7 + (levelIndex - 1) * 7;
            case "hard":
                return 15 + (levelIndex - 1) * 12;
            default:
                return 12 + (levelIndex - 1) * 10;
        }
    }

    function startWave() {

        const phase = phases[level];

        if (phase.enemies.includes("boss")) {
            spawnEnemy("boss");
            waveActive = true;
            return;
        }

        gameArea.style.backgroundImage =
            `url("assets/sprites/${phase.floor}")`;

        const duration = getWaveDuration(level, difficulty);
        const spawnCount = getSpawnCount(level, difficulty);

        const initialInterval = Math.floor(
            phase.spawnInterval * settings.spawnMultiplier
        );

        const minInterval = Math.floor(
            phase.spawnIntervalMin * settings.spawnMultiplier
        );

        timeRemaining = duration;
        waveActive    = true;
        let remainingSpawns = spawnCount;

        door.style.display = "none";

        if (timerElement) {
            timerElement.classList.remove("urgent");
        }

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

                gameOver();
            }

        }, 1000);

        function scheduleNextSpawn(phase, currentInterval, minInterval, totalDuration) {

            if (!waveActive || remainingSpawns <= 0) {
                if (remainingSpawns <= 0) {
                    waveActive = false;
                }
                return;
            }

            spawnTimeout = setTimeout(() => {

                if (!gameRunning || !waveActive) return;
                if (remainingSpawns <= 0) {
                    waveActive = false;
                    return;
                }

                const type =
                    phase.enemies[
                        Math.floor(Math.random() * phase.enemies.length)
                    ];

                spawnEnemy(type);
                remainingSpawns -= 1;

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

        scheduleNextSpawn(phase, initialInterval, minInterval, duration);
    }

    function updateTimerDisplay() {

        if (!timerElement) return;

        const s = Math.max(0, Math.ceil(timeRemaining / 1000));

        timerElement.innerHTML = `⏱️ ${s}s`;

        if (timeRemaining > 10000) {
            timerElement.classList.remove("urgent");
        }
    }

    startWave();
    playMusic("game");

    // ======================
    // NEXT LEVEL
    // ======================

    function nextLevel() {

        clearTimeout(spawnTimeout);
        clearInterval(timerInterval);

        hideBossHud();

        if (level >= TOTAL_PHASES) {
            victory();
            return;
        }

        level++;

        levelElement.innerHTML = `🏰 Fase: ${level}`;

        playSound("levelUp");
        door.style.display = "none";

        startWave();
    }

    // ======================
    // LISTENERS
    // ======================

    window.addEventListener("keydown", (event) => {

        if (event.code === "Space")     shoot();
        if (event.code === "ShiftLeft") dash();

        if (
            event.code === "Escape" ||
            event.code === "KeyP"
        ) togglePause();
    });

    pauseButton?.addEventListener("click", () => togglePause());
    resumeButton.addEventListener("click",         () => togglePause());
    restartButton.addEventListener("click",        () => location.reload());
    victoryRestartButton.addEventListener("click", () => location.reload());

    // ======================
    // TIRO
    // ======================

    function shoot() {

        if (!canShoot || gamePaused) return;

        canShoot = false;

        const cx = player.x + 16;
        const cy = player.y + 16;

        // Triple shot: cheat OU power-up ativo

        if (cheats.godMode || cheats.tripleShot || activePowerUps["triple-shot"]) {

            const angle = Math.atan2(
                player.lastDirectionY,
                player.lastDirectionX
            );

            [0, -0.3, 0.3].forEach((offset) => {

                const a = angle + offset;

                projectiles.push(new Projectile(
                    cx, cy,
                    Math.cos(a), Math.sin(a),
                    "player", "default"
                ));
            });

        } else {

            projectiles.push(new Projectile(
                cx, cy,
                player.lastDirectionX,
                player.lastDirectionY,
                "player", "default"
            ));
        }

        playSound("attack");

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

            if (!activePowerUps["shield"] && !cheats.godMode) {
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

        let dx = 0, dy = 0;

        if (keys["w"] || keys["arrowup"]) dy -= player.speed;
        if (keys["s"] || keys["arrowdown"]) dy += player.speed;
        if (keys["a"] || keys["arrowleft"]) dx -= player.speed;
        if (keys["d"] || keys["arrowright"]) dx += player.speed;

        player.move(dx, dy);

        // UPDATE ENEMIES

        enemies.forEach((enemy, i) => {

            enemy.update(
                player.x, player.y, now,
                spawnEnemyProjectile,
                bossSummon
            );

            if (enemy.type === "boss") updateBossHud();

            // God mode — não toma dano por contato

            if (cheats.godMode) return;

            if (
                checkCollision(player.element, enemy.element)
                && !playerInvulnerable
            ) {

                playerInvulnerable = true;

                player.life--;
                playSound("hit");

                lifeElement.innerHTML = `❤️ Vida: ${player.life}`;

                player.element.style.opacity = "0.5";

                setTimeout(() => {

                    if (!activePowerUps["shield"]) {
                        playerInvulnerable = false;
                    }

                    player.element.style.opacity = "1";

                }, 1000);

                enemy.remove();
                enemies.splice(i, 1);

                if (player.life <= 0) gameOver();
            }
        });

        // UPDATE PROJECTILES

        projectiles.forEach((proj, pi) => {

            proj.update();

            if (
                proj.x < 0 || proj.x > window.innerWidth ||
                proj.y < 0 || proj.y > window.innerHeight
            ) {
                proj.remove();
                projectiles.splice(pi, 1);
                return;
            }

            if (proj.owner === "player") {

                enemies.forEach((enemy, ei) => {

                    if (checkCollision(proj.element, enemy.element)) {

                        const dead = enemy.takeDamage(1);

                        createHitEffect(enemy.x, enemy.y);

                        if (dead) {

                            if (enemy.type === "boss") {
                                proj.remove();
                                projectiles.splice(pi, 1);
                                killBoss(enemy, ei);
                                return;
                            }

                            if (enemy.type === "slime") {
                                spawnSlimeMini(enemy.x, enemy.y);
                            }

                            const drop = tryDropPowerUp(
                                enemy.type, enemy.x, enemy.y
                            );

                            if (drop) powerups.push(drop);

                            enemy.remove();
                            enemies.splice(ei, 1);

                            score += 10;
                            scoreElement.innerHTML = `⭐ Score: ${score}`;
                        }

                        proj.remove();
                        projectiles.splice(pi, 1);
                    }
                });

            } else if (proj.owner === "enemy") {

                // God mode — ignora projéteis inimigos

                if (cheats.godMode) return;

                if (
                    checkCollision(proj.element, player.element)
                    && !playerInvulnerable
                ) {

                    playerInvulnerable = true;

                    player.life--;
                    playSound("hit");

                    lifeElement.innerHTML = `❤️ Vida: ${player.life}`;

                    player.element.style.opacity = "0.5";

                    setTimeout(() => {

                        if (!activePowerUps["shield"]) {
                            playerInvulnerable = false;
                        }

                        player.element.style.opacity = "1";

                    }, 1000);

                    proj.remove();
                    projectiles.splice(pi, 1);

                    if (player.life <= 0) gameOver();
                }
            }
        });

        // UPDATE POWER-UPS

        powerups.forEach((pu, pi) => {

            if (checkCollision(player.element, pu.element)) {

                applyPowerUp(pu.type);
                playSound("pickup");

                pu.remove();
                powerups.splice(pi, 1);
            }
        });

        // PORTA

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