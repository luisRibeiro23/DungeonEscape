import { Player } from "./player.js";
import { keys } from "./input.js";
import { Enemy } from "./enemy.js";
import { Projectile } from "./projectile.js";
import { PowerUp, tryDropPowerUp, powerupTypes } from "./powerup.js";
import { saveHighScore } from "./storage.js?v=1";
import { phases, TOTAL_PHASES } from "./level.js";
import { cheats, registerCheatCallbacks } from "./cheat.js";
import { playSound, playMusic, stopMusic } from "./sound.js";
import { applyMapEffect, clearMapEffects } from "./mapEffects.js";

// ======================
// DIFICULDADE
// ======================

const difficultySettings = {

    easy: {
        enemySpeedMultiplier: 0.7,
        enemyLifeMultiplier:  0.7,
        playerLife:           5,
        durationMultiplier:   0.8,
        spawnMultiplier:      1.2,
        fireballSlowDuration: 2000,
    },

    normal: {
        enemySpeedMultiplier: 1,
        enemyLifeMultiplier:  1,
        playerLife:           3,
        durationMultiplier:   1,
        spawnMultiplier:      1,
        fireballSlowDuration: 3500,
    },

    hard: {
        enemySpeedMultiplier: 1.4,
        enemyLifeMultiplier:  1.5,
        playerLife:           2,
        durationMultiplier:   1.4,
        spawnMultiplier:      0.65,
        fireballSlowDuration: 5000, 
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
    // Guarda timeouts de expiração por tipo para que possamos
    // cancelar e reaplicar corretamente quando o player coletar
    // o mesmo power-up em sequência.
    const powerupTimeouts = {};

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
    let spawnTimeoutStart  = 0;
    let spawnTimeoutDelay  = 0;
    let spawnTimeoutAction = null;
    let timerInterval      = null;
    let timeRemaining      = 0;
    let canShoot           = true;
    const shootCooldown    = 300;
    let canDash            = true;
    const dashCooldown     = 1000;
    let bossRef            = null;
    let pendingSummons     = 0;
    let summonGeneration   = 0;
    let playerSlowed = false;
    const pausedSummonCompletions = [];
    let pulses = [];

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
            clearPendingSummons();

            clearSpawnTimeout();
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

        cutsceneScreen.innerHTML = `
            <div class="esc-layer" id="esc-bg"></div>
            <div class="esc-layer" id="esc-midwall"></div>
            <div class="esc-layer" id="esc-floor"></div>
            <div class="esc-layer" id="esc-ceiling"></div>

            <div class="esc-torch-wrap esc-torch-left">
                <div class="esc-torch"><div class="esc-flame"></div></div>
                <div class="esc-glow"></div>
            </div>

            <div class="esc-torch-wrap esc-torch-right">
                <div class="esc-torch"><div class="esc-flame"></div></div>
                <div class="esc-glow"></div>
            </div>

            <div id="esc-exit-light"></div>
            <div id="esc-vignette"></div>

            <div id="esc-runner-shadow"></div>
            <div id="esc-runner">
                <svg width="38" height="60" viewBox="0 0 38 60" fill="none">
                    <circle cx="19" cy="8" r="7" fill="#111"/>
                    <rect x="15" y="14" width="8" height="18" rx="3" fill="#111"/>
                    <path id="esc-cape" d="M15 16 Q8 28 10 38" stroke="#1a1a1a" stroke-width="5" stroke-linecap="round" fill="none"/>
                    <line id="esc-arm-f" x1="23" y1="18" x2="30" y2="26" stroke="#111" stroke-width="4" stroke-linecap="round"/>
                    <line id="esc-arm-b" x1="15" y1="18" x2="8"  y2="26" stroke="#111" stroke-width="4" stroke-linecap="round"/>
                    <line id="esc-leg-f" x1="20" y1="32" x2="26" y2="48" stroke="#111" stroke-width="5" stroke-linecap="round"/>
                    <line id="esc-leg-b" x1="18" y1="32" x2="12" y2="48" stroke="#111" stroke-width="5" stroke-linecap="round"/>
                </svg>
            </div>

            <div id="esc-phrases">
                <p class="esc-phrase" id="esc-p1">O boss caiu...</p>
                <p class="esc-phrase" id="esc-p2">A dungeon desmorona.</p>
                <p class="esc-phrase" id="esc-p3">Corra. Não olhe para trás.</p>
                <p class="esc-phrase esc-final" id="esc-p4">VOCÊ ESCAPOU</p>
            </div>
        `;

        const legF   = document.getElementById("esc-leg-f");
        const legB   = document.getElementById("esc-leg-b");
        const armF   = document.getElementById("esc-arm-f");
        const armB   = document.getElementById("esc-arm-b");
        const cape   = document.getElementById("esc-cape");
        const runner = document.getElementById("esc-runner");
        const shadow = document.getElementById("esc-runner-shadow");

        let frame = 0;
        let rafId = null;

        function animateRunner() {

            frame++;

            const s = Math.sin(frame * 0.28);
            const c = Math.cos(frame * 0.28);

            legF.setAttribute("x2", 20 + s * 10);
            legF.setAttribute("y2", 48 + Math.abs(s) * -6);
            legB.setAttribute("x2", 18 - s * 10);
            legB.setAttribute("y2", 48 + Math.abs(c) * -6);
            armF.setAttribute("x2", 23 - s * 7);
            armF.setAttribute("y2", 26 + c * 4);
            armB.setAttribute("x2", 15 + s * 7);
            armB.setAttribute("y2", 26 - c * 4);
            cape.setAttribute(
                "d",
                `M15 16 Q${8 + s * 3} 28 ${10 + s * 2} 38`
            );

            runner.style.transform =
                `translateY(${Math.abs(s) * -4}px)`;
            shadow.style.transform =
                `scaleX(${1 + Math.abs(s) * 0.15}) scaleY(${1 - Math.abs(s) * 0.2})`;

            rafId = requestAnimationFrame(animateRunner);
        }

        animateRunner();

        const sequence = [
            { id: "esc-p1", show: 400,  hide: 2400  },
            { id: "esc-p2", show: 2800, hide: 5000  },
            { id: "esc-p3", show: 5400, hide: 7800  },
            { id: "esc-p4", show: 8200, hide: 11000 },
        ];

        sequence.forEach(({ id, show, hide }) => {

            const el = document.getElementById(id);

            setTimeout(() => el?.classList.add("esc-show"), show);

            setTimeout(() => {

                if (!el) return;

                el.classList.remove("esc-show");
                el.classList.add("esc-hide");

            }, hide);
        });

        setTimeout(() => {

            cancelAnimationFrame(rafId);
            onComplete();

        }, 12000);
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

        clearSpawnTimeout();
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

        clearSpawnTimeout();
        clearMapEffects();
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

        if (gamePaused) {
            pauseSpawnTimeout();
        } else {
            resumeSpawnTimeout();
            resumeSummonCompletions();
        }
    }

    // ======================
    // SPAWN
    // ======================

    function clearSpawnTimeout() {

        clearTimeout(spawnTimeout);

        spawnTimeout       = null;
        spawnTimeoutStart  = 0;
        spawnTimeoutDelay  = 0;
        spawnTimeoutAction = null;
    }

    function setSpawnTimeout(action, delay) {

        clearTimeout(spawnTimeout);

        spawnTimeoutAction = action;
        spawnTimeoutDelay  = delay;
        spawnTimeoutStart  = performance.now();

        spawnTimeout = setTimeout(() => {

            spawnTimeout       = null;
            spawnTimeoutStart  = 0;
            spawnTimeoutDelay  = 0;
            spawnTimeoutAction = null;

            action();

        }, delay);
    }

    function pauseSpawnTimeout() {

        if (!spawnTimeout || !spawnTimeoutAction) return;

        const elapsed = performance.now() - spawnTimeoutStart;

        spawnTimeoutDelay =
            Math.max(0, spawnTimeoutDelay - elapsed);

        clearTimeout(spawnTimeout);

        spawnTimeout = null;
    }

    function resumeSpawnTimeout() {

        if (!spawnTimeoutAction || spawnTimeout) return;

        setSpawnTimeout(spawnTimeoutAction, spawnTimeoutDelay);
    }

    function resumeSummonCompletions() {

        while (pausedSummonCompletions.length > 0) {
            const completeSummon = pausedSummonCompletions.shift();

            completeSummon();
        }
    }

    function clearPendingSummons() {

        pendingSummons = 0;
        pausedSummonCompletions.length = 0;
        summonGeneration++;

        document
            .querySelectorAll(".summon-effect")
            .forEach((effect) => effect.remove());
    }

    function createSummonEffect(x, y, onComplete) {

        const generation = summonGeneration;
        let completed = false;
        pendingSummons++;

        const effect = document.createElement("div");

        effect.classList.add("summon-effect");
        effect.style.left = x + "px";
        effect.style.top  = y + "px";

        gameArea.appendChild(effect);

        const completeSummon = () => {

            if (completed) return;

            completed = true;

            effect.remove();

            pendingSummons = Math.max(0, pendingSummons - 1);

            if (generation !== summonGeneration || !gameRunning) return;

            onComplete();

        };

        setTimeout(() => {

            if (gamePaused) {
                pausedSummonCompletions.push(completeSummon);
                return;
            }

            completeSummon();

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

        for (let i = 0; i < 1; i++) {
            spawnEnemy(
                types[Math.floor(Math.random() * types.length)]
            );
        }
    }

    function bossFireball(startX, startY) {
        const dx = player.x - startX;
        const dy = player.y - startY;

        const dist = Math.sqrt(dx * dx + dy * dy);

        spawnEnemyProjectile(
            startX,
            startY,
            dx / dist,
            dy / dist,
            "fireball"
        );
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
            // Se já houver um timeout para este tipo, cancele-o
            // para que a nova coleta reinicie a duração.
            if (powerupTimeouts[type]) {
                clearTimeout(powerupTimeouts[type]);
            }

            powerupTimeouts[type] = setTimeout(() => {

                activePowerUps[type] = false;

                if (type === "speed") {
                    player.normalSpeed = 5;
                    if (!player.isDashing) player.speed = 5;
                }

                if (type === "shield") {
                    playerInvulnerable = false;
                    player.element.classList.remove("shield-active");
                }

                // Limpe a referência ao timeout expirado
                delete powerupTimeouts[type];

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

        clearPendingSummons();

        const phase = phases[level];

        gameArea.style.backgroundImage =
            `url("assets/sprites/maps/${phase.floor}")`;
        applyMapEffect(phase.floor); 

        if (phase.enemies.includes("boss")) {
            spawnEnemy("boss");
            waveActive = true;
            return;
        }

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
                clearSpawnTimeout();

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

            setSpawnTimeout(() => {

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

    function resetPowerUps() {
        // Remove os itens do chão
        powerups.forEach(pu => pu.remove());
        powerups.length = 0; 
    }

    function nextLevel() {
        resetPowerUps();

        clearSpawnTimeout();
        clearInterval(timerInterval);
        clearPendingSummons();

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

        // Triple shot: cheat tripleShot OU power-up ativo

        if (cheats.tripleShot || activePowerUps["triple-shot"]) {

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

    function applySlowEffect(duration) {

        if (playerSlowed) return;

        playerSlowed = true;

        const originalSpeed =
            player.normalSpeed;

        player.normalSpeed = 2.5;

        if (!player.isDashing) {
            player.speed = 2.5;
        }

        player.element.classList.add("cursed");

        setTimeout(() => {

            player.normalSpeed = 5;

            if (!player.isDashing) {
                player.speed = 5;
            }

            player.element.classList.remove("cursed");

            playerSlowed = false;

        }, duration);
    }

    function spawnPulse(x, y) {
        const el = document.createElement("div");
        el.classList.add("boss-pulse");
        el.style.left = x + "px";
        el.style.top  = y + "px";
        document.getElementById("game-area").appendChild(el);

        pulses.push({
            x, y,
            radius: 0,
            maxRadius: 450,
            speed: 6,
            element: el,
            done: false
        });
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

    const PLAYER_SPRITE_SIZES = {
        default: {
            north: { width: 619, height: 809 },
            south: { width: 522, height: 809 },
            east:  { width: 771, height: 811 },
            west:  { width: 771, height: 809 }
        },
        skin1: {
            north: { width: 832, height: 1289 },
            south: { width: 832, height: 1289 },
            east:  { width: 832, height: 1289 },
            west:  { width: 832, height: 1288 }
        },
        skin2: {
            north: { width: 624, height: 1180 },
            south: { width: 429, height: 781 },
            east:  { width: 652, height: 1183 },
            west:  { width: 652, height: 1183 }
        },
        skin3: {
            north: { width: 472, height: 1024 },
            south: { width: 260, height: 513 },
            east:  { width: 328, height: 496 },
            west:  { width: 362, height: 503 }
        }
    };

    const ENEMY_SPRITE_SIZES = {
        slime:        { width: 587, height: 425 },
        "slime-mini": { width: 587, height: 425 },
        skeleton:     { width: 894, height: 894 },
        demon:        { width: 226, height: 234 },
        boss:         { width: 234, height: 234 }
    };

    const ENEMY_ALPHA_OFFSETS = {
        slime:        { top: 0.11, bottom: 0.10, left: 0.06, right: 0.08 },
        "slime-mini": { top: 0.11, bottom: 0.10, left: 0.06, right: 0.08 },
        skeleton:     { top: 0.12, bottom: 0.12, left: 0.28, right: 0.28 },
        demon:        { top: 0.00, bottom: 0.00, left: 0.02, right: 0.02 },
        boss:         { top: 0.11, bottom: 0.05, left: 0.22, right: 0.21 }
    };

    function getSpriteSize(entity) {
        if (entity === player) {
            const character = PLAYER_SPRITE_SIZES[player.character] ||
                PLAYER_SPRITE_SIZES.default;

            return character[player.direction] || character.south;
        }

        if (entity && entity.type) {
            return ENEMY_SPRITE_SIZES[entity.type] || null;
        }

        return null;
    }

    function getRenderedSpriteRect(rect, entity) {
        const spriteSize = getSpriteSize(entity);

        if (!spriteSize) {
            return {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom
            };
        }

        const spriteRatio = spriteSize.width / spriteSize.height;
        const elementRatio = rect.width / rect.height;

        let width = rect.width;
        let height = rect.height;

        if (spriteRatio > elementRatio) {
            height = width / spriteRatio;
        } else {
            width = height * spriteRatio;
        }

        const left = rect.left + (rect.width - width) / 2;
        const top = rect.top + (rect.height - height) / 2;

        return {
            left,
            top,
            right: left + width,
            bottom: top + height
        };
    }

    function applyCollisionOffsets(rect, entity) {
        const offsets = entity && entity.type
            ? ENEMY_ALPHA_OFFSETS[entity.type]
            : null;

        if (!offsets) return rect;

        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;

        return {
            left: rect.left + width * offsets.left,
            top: rect.top + height * offsets.top,
            right: rect.right - width * offsets.right,
            bottom: rect.bottom - height * offsets.bottom
        };
    }

    // Dano por contato: usa a área visível do sprite e conta toque de extremidades.
    function isTouching(a, b, contactTolerance = 1) {

        if (a.element && b.element) {
            const A = applyCollisionOffsets(
                getRenderedSpriteRect(a.element.getBoundingClientRect(), a),
                a
            );

            const B = applyCollisionOffsets(
                getRenderedSpriteRect(b.element.getBoundingClientRect(), b),
                b
            );

            return !(
                A.right  < B.left   - contactTolerance ||
                A.left   > B.right  + contactTolerance ||
                A.bottom < B.top    - contactTolerance ||
                A.top    > B.bottom + contactTolerance
            );
        }

        return !(
            a.x + a.width  < b.x ||
            a.x            > b.x + b.width ||
            a.y + a.height < b.y ||
            a.y            > b.y + b.height
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
                player.x,
                player.y,
                now,
                spawnEnemyProjectile,
                bossFireball,
                bossSummon,
                spawnPulse
            );
            if (enemy.type === "boss") updateBossHud();

            // God mode — não toma dano por contato

            if (cheats.godMode) return;

            if (
                isTouching(player, enemy)
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

                if (enemy.type !== "boss") {
                    enemy.remove();
                    enemies.splice(i, 1);
                }

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
                    if (proj.type === "fireball") {
                        applySlowEffect(settings.fireballSlowDuration);
                    }
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


        pulses.forEach((pulse, i) => {
            pulse.radius += pulse.speed;

            // Atualiza visual via CSS
            pulse.element.style.width  = pulse.radius * 2 + "px";
            pulse.element.style.height = pulse.radius * 2 + "px";
            pulse.element.style.marginLeft = -pulse.radius + "px";
            pulse.element.style.marginTop  = -pulse.radius + "px";
            pulse.element.style.opacity = 1 - (pulse.radius / pulse.maxRadius);

            // Colisão com o player
            const dx = player.x - pulse.x;
            const dy = player.y - pulse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= pulse.radius && !pulse.hit) {
                pulse.hit = true;
                player.life--;
                lifeElement.innerHTML = `❤️ Vida: ${player.life}`;
                applySlowEffect(settings.fireballSlowDuration);
                playSound("hit"); 
                if (player.life <= 0) gameOver();
            }

            // Remove quando terminar
            if (pulse.radius >= pulse.maxRadius) {
                pulse.element.remove();
                pulses.splice(i, 1);
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

        if (!waveActive && enemies.length === 0 && pendingSummons === 0) {
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
