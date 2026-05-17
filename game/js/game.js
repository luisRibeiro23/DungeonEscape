import { Player } from "./player.js";
import { keys } from "./input.js";
import { Enemy } from "./enemy.js";
import { Projectile } from "./projectile.js";

// ======================
// PLAYER
// ======================

const player = new Player();

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

const restartButton =
    document.getElementById("restart-button");

const door =
    document.getElementById("door");

// ======================
// GAME STATE
// ======================

let score = 0;

let level = 1;

let gameRunning = true;

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

        enemies: [
            "slime"
        ],

        amount: 5
    },

    2: {

        floor: "catacombs.png",

        enemies: [
            "skeleton"
        ],

        amount: 8
    },

    3: {

        floor: "hell.png",

        enemies: [
            "demon"
        ],

        amount: 10
    },

    4: {

        floor: "floor.png",

        enemies: [
            "slime",
            "skeleton",
            "demon"
        ],

        amount: 15
    },

    5: {

        floor: "hell.png",

        enemies: [
            "boss"
        ],

        amount: 1
    }
};

// ======================
// SPAWN ENEMY
// ======================

function spawnEnemy(type) {

    let x;
    let y;

    // EVITA SPAWN EM CIMA PLAYER

    do {

        x = Math.random() * 1200;
        y = Math.random() * 700;

    } while (

        Math.abs(x - player.x) < 200 &&

        Math.abs(y - player.y) < 200
    );

    const enemy =
        new Enemy(type, x, y);

    enemies.push(enemy);
}

// ======================
// START WAVE
// ======================

function startWave() {

    const phase =
        phases[level];

    // TROCAR FUNDO

    gameArea.style.backgroundImage =
        `url("assets/sprites/${phase.floor}")`;

    // SPAWN DOS INIMIGOS

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

    // VITÓRIA

    if (level >= 5) {

        alert("VOCÊ VENCEU!");

        location.reload();

        return;
    }

    level++;

    levelElement.innerHTML =
        `🏰 Fase: ${level}`;

    // ESCONDER PORTA

    door.style.display = "none";

    // NOVA FASE

    startWave();
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
// TIRO
// ======================

window.addEventListener("keydown", (event) => {

    if (event.code === "Space") {

        shoot();
    }
});

function shoot() {

    if (!canShoot) return;

    canShoot = false;

    const projectile =
        new Projectile(

            player.x + 16,
            player.y + 16,

            player.lastDirectionX,
            player.lastDirectionY
        );

    projectiles.push(projectile);

    // COOLDOWN

    setTimeout(() => {

        canShoot = true;

    }, shootCooldown);
}

window.addEventListener("keydown", (event) =>{

    if(event.code === "ShiftLeft"){
        dash();
    }
});

// ======================
// GAME OVER
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

function dash(){
    if(!canDash) return;

    if(player.isDashing) return;

    canDash = false;

    player.isDashing = true;

    //Velocidade do dash

    player.speed = 15;

    const smokeInterval = setInterval(() => {
        createSmoke();
    },50);

    //invulnerabilidade durante o dash por enquanto 

    player.playerInvulnerable = true;

    //efeito

    player.element.style.opacity = "0.6";

    //termina dash

    setTimeout(() =>{

        player.speed =
            player.normalSpeed;
        player.isDashing = false;

        playerInvulnerable = false;

        player.element.style.opacity = "1";

        clearInterval(smokeInterval);

    },200);

    //cooldow

    setTimeout(() => {
        canDash = true;
    },dashCooldown);
}

function createSmoke() {

    const smoke =
        document.createElement("div");

    smoke.classList.add("smoke");

    smoke.style.left =
        player.x + "px";

    smoke.style.top =
        player.y + "px";

    gameArea.appendChild(smoke);

    // REMOVER

    setTimeout(() => {

        smoke.remove();

    }, 500);
}

function gameOver() {

    gameRunning = false;

    gameContainer.style.display =
        "none";

    gameOverScreen.style.display =
        "flex";
}

// ======================
// RESTART
// ======================

restartButton.addEventListener("click", () => {

    location.reload();
});

// ======================
// UPDATE
// ======================

function update() {

    if (!gameRunning) return;

    let dx = 0;
    let dy = 0;

    // ======================
    // MOVIMENTO PLAYER
    // ======================

    if (keys["w"]) {
        dy -= player.speed;
    }

    if (keys["s"]) {
        dy += player.speed;
    }

    if (keys["a"]) {
        dx -= player.speed;
    }

    if (keys["d"]) {
        dx += player.speed;
    }

    player.move(dx, dy);

    // ======================
    // UPDATE ENEMIES
    // ======================

    enemies.forEach((enemy, enemyIndex) => {

        enemy.update(player.x, player.y);

        // PLAYER HIT

        if (

            checkCollision(
                player.element,
                enemy.element
            )

            &&

            !playerInvulnerable
        )

        {

            playerInvulnerable = true;

            player.life--;

            lifeElement.innerHTML =
                `❤️ Vida: ${player.life}`;

            // EFEITO HIT

            player.element.style.opacity = "0.5";

            setTimeout(() => {

                playerInvulnerable = false;

                player.element.style.opacity = "1";

            }, 1000);

            // REMOVE ENEMY

            enemy.remove();

            enemies.splice(enemyIndex, 1);

            // GAME OVER

            if (player.life <= 0) {

                gameOver();
            }
        }
    });

    // ======================
    // UPDATE PROJECTILES
    // ======================

    projectiles.forEach((projectile, projectileIndex) => {

        projectile.update();

        // REMOVER PROJÉTIL FORA DA TELA

        if (

            projectile.x < 0 ||
            projectile.x > window.innerWidth ||

            projectile.y < 0 ||
            projectile.y > window.innerHeight
        ) {

            projectile.remove();

            projectiles.splice(
                projectileIndex,
                1
            );

            return;
        }

        // COLISÃO PROJÉTIL

        enemies.forEach((enemy, enemyIndex) => {

            if (
                checkCollision(
                    projectile.element,
                    enemy.element
                )
            ) {

                // DANO

                const dead =
                    enemy.takeDamage(1);

                    createHitEffect(
                        enemy.x,
                        enemy.y
                    );

                // REMOVE ENEMY

                if (dead) {

                    enemy.remove();

                    enemies.splice(
                        enemyIndex,
                        1
                    );

                    // SCORE

                    score += 10;

                    scoreElement.innerHTML =
                        `⭐ Score: ${score}`;
                }

                // REMOVE PROJÉTIL

                projectile.remove();

                projectiles.splice(
                    projectileIndex,
                    1
                );
            }
        });
    });

    // ======================
    // PORTA
    // ======================

    // MOSTRAR PORTA

    if (enemies.length === 0) {

        door.style.display = "block";
    }

    // ENTRAR NA PORTA

    if (

        door.style.display === "block"

        &&

        checkCollision(
            player.element,
            door
        )
    )

    {

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