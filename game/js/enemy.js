export class Enemy {

    constructor(type, x, y, speedMult = 1, lifeMult = 1) {

        this.type = type;

        this.x = x;
        this.y = y;

        this.width = 48;
        this.height = 48;

        this.speed = 1;

        this.life = 1;

        // ======================
        // CONFIGURAÇÕES POR TIPO
        // ======================

        if (type === "slime") {

            this.speed = 1;
            this.life = 1;

            this.width = 100;
            this.height = 85;
        }

        if (type === "slime-mini") {

            this.speed = 1.5;
            this.life = 1;

            this.width = 73;
            this.height = 75;
        }

        if (type === "skeleton") {

            this.speed = 2;
            this.life = 2;

            this.width = 166;
            this.height = 172;

            this.shootCooldown = 2500;
            this.shootTimer    = 0;
            this.shootRange    = 350;
        }

        if (type === "demon") {

            this.speed = 1.5;
            this.life  = 4;

            this.width  = 175;
            this.height = 175;

            this.dashCooldown = 3000;
            this.dashTimer    = 0;
            this.isDashing    = false;
            this.dashSpeed    = 8;
            this.dashDuration = 300;
            this.dashDirX     = 0;
            this.dashDirY     = 0;
        }

        if (type === "boss1") {
            this.speed = 1;
            this.life = 25;

            this.width = 250;
            this.height = 260;
        }

        if (type === "boss2") {
            this.speed = 1.3;
            this.life = 40;

            this.width = 300;
            this.height = 320;
        }

        if (type === "boss3") {
            this.speed = 1.6;
            this.life = 60;

            this.width = 350;
            this.height = 370;
        }

        if (type === "bossFinal") {
            this.speed = 2;
            this.life = 80;

            this.width = 400;
            this.height = 420;
        }

        // Aplica multiplicadores de dificuldade

        this.speed = this.speed * speedMult;

        this.life = Math.ceil(this.life * lifeMult);

        if (
            type === "boss1" ||
            type === "boss2" ||
            type === "boss3" ||
            type === "bossFinal"
        ) {
            this.maxLife = this.life;

            this.shootCooldown  = 2000;
            this.shootTimer     = 0;

            this.summonCooldown = 8000;
            this.summonTimer    = 0;

            this.phase2 = false;
        }

        // ======================
        // ELEMENTO DOM
        // ======================

        this.element =
            document.createElement("div");

        this.element.classList.add("enemy");
        this.element.classList.add(`enemy-${type}`);

        this.element.style.width  = this.width  + "px";
        this.element.style.height = this.height + "px";

        this.element.style.backgroundSize = "contain";

        let spriteType = type;

        // slime-mini usa sprite do slime
        if (type === "slime-mini") spriteType = "slime";

        // bosses personalizados
        if (type === "boss1") spriteType = "slimerei";
        if (type === "boss2") spriteType = "bossEsqueleto";
        if (type === "boss3") spriteType = "bossDemon";
        if (type === "bossFinal") spriteType = "boss";

        this.element.style.backgroundImage =
            `url("assets/sprites/enemies/${spriteType}.png")`;

        document
            .getElementById("game-area")
            .appendChild(this.element);

        this.updatePosition();
    }

    // ======================
    // UPDATE
    // ======================

    update(playerX, playerY, now, onShoot, onSummon) {

        const dx = playerX - this.x;
        const dy = playerY - this.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        // ======================
        // MOVIMENTO POR TIPO
        // ======================

        if (this.type === "demon") {

            this.updateDemon(dx, dy, distance, now);

        } else if (
            this.type === "boss1" ||
            this.type === "boss2" ||
            this.type === "boss3" ||
            this.type === "bossFinal") {

            this.updateBoss(
                dx, dy, distance, now,
                onShoot, onSummon
            );

        } else {

            // Movimento padrão — persegue o player

            if (distance > 0) {

                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        }

        // SKELETON — atira no player se estiver no range

        if (this.type === "skeleton") {

            if (!this.shootTimer) this.shootTimer = now;

            if (
                now - this.shootTimer >= this.shootCooldown &&
                distance < this.shootRange
            ) {

                this.shootTimer = now;

                if (onShoot && distance > 0) {

                    onShoot(
                        this.x + this.width  / 2,
                        this.y + this.height / 2,
                        dx / distance,
                        dy / distance,
                        "bone"
                    );
                }
            }
        }

        this.updatePosition();
    }

    // ======================
    // DEMON DASH
    // ======================

    updateDemon(dx, dy, distance, now) {

        if (!this.dashTimer) this.dashTimer = now;

        if (this.isDashing) {

            this.x += this.dashDirX * this.dashSpeed;
            this.y += this.dashDirY * this.dashSpeed;

        } else {

            if (distance > 0) {

                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }

            if (now - this.dashTimer >= this.dashCooldown) {

                this.dashTimer = now;
                this.isDashing = true;

                if (distance > 0) {
                    this.dashDirX = dx / distance;
                    this.dashDirY = dy / distance;
                }

                this.element.classList.add("demon-dashing");

                setTimeout(() => {

                    this.isDashing = false;

                    this.element.classList.remove("demon-dashing");

                }, this.dashDuration);
            }
        }
    }

    // ======================
    // BOSS
    // ======================

    updateBoss(dx, dy, distance, now, onShoot, onSummon) {

        if (!this.shootTimer)  this.shootTimer  = now;
        if (!this.summonTimer) this.summonTimer = now;

        // Fase 2: mais rápido e atira mais quando < 50% vida

        if (
            !this.phase2 &&
            this.life <= this.maxLife * 0.5
        ) {
            this.phase2 = true;
            this.shootCooldown = 1200;
            this.element.classList.add("boss-phase2");
        }

        const speedBoost = this.phase2 ? 1.5 : 1;

        if (distance > 0) {

            this.x += (dx / distance) * this.speed * speedBoost;
            this.y += (dy / distance) * this.speed * speedBoost;
        }

        // Atira em 8 direções

        if (now - this.shootTimer >= this.shootCooldown) {

            this.shootTimer = now;

            if (onShoot) {

                const dirs = [
                    [ 1,  0], [-1,  0],
                    [ 0,  1], [ 0, -1],
                    [ 0.707,  0.707],
                    [-0.707,  0.707],
                    [ 0.707, -0.707],
                    [-0.707, -0.707]
                ];

                dirs.forEach(([dirX, dirY]) => {

                    onShoot(
                        this.x + this.width  / 2,
                        this.y + this.height / 2,
                        dirX,
                        dirY,
                        "boss-bullet"
                    );
                });
            }
        }

        // Invoca inimigos aleatórios

        if (now - this.summonTimer >= this.summonCooldown) {

            this.summonTimer = now;

            if (onSummon) onSummon();
        }
    }

    // ======================
    // POSITION
    // ======================

    updatePosition() {

        this.element.style.left = this.x + "px";
        this.element.style.top  = this.y + "px";
    }

    // ======================
    // DAMAGE
    // ======================

    takeDamage(amount) {

        this.life -= amount;

        this.element.style.filter = "brightness(2)";

        setTimeout(() => {

            if (!this.isDashing) {
                this.element.style.filter = "none";
            }

        }, 100);

        return this.life <= 0;
    }

    // ======================
    // REMOVE
    // ======================

    remove() {

        this.element.remove();
    }
}