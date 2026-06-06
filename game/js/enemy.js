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

            this.width = 106;
            this.height = 90;
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

        if (type === "boss") {

            this.speed  = 1.5;
            this.life   = 30;

            this.width  = 400;
            this.height = 420;

            this.fireballCooldown = 4000;
            this.fireballTimer = null;

            this.summonCooldown = 8000;
            this.summonTimer    = null;

            this.phase2  = false;
            this.maxLife = 30;

            this.pulseCooldown = 6000;
            this.pulseTimer    = null;
        }

        // Aplica multiplicadores de dificuldade

        this.speed = this.speed * speedMult;

        this.life = Math.ceil(this.life * lifeMult);

        if (type === "boss") {
            this.maxLife = this.life;
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

        // slime-mini usa o mesmo sprite do slime

        const spriteType =
            type === "slime-mini" ? "slime" : type;

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

    update(playerX, playerY, now, onShoot, onFireball, onSummon, onPulse) {

        const dx = playerX - this.x;
        const dy = playerY - this.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        // ======================
        // MOVIMENTO POR TIPO
        // ======================

        if (this.type === "demon") {

            this.updateDemon(dx, dy, distance, now);

        } else if (this.type === "boss") {

            this.updateBoss(
                dx,
                dy,
                distance,
                now,
                onFireball,
                onSummon,
                onPulse 
            )

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

    updateBoss(dx, dy, distance, now, onFireball, onSummon, onPulse) {

        if (this.fireballTimer === null)
            this.fireballTimer = now;

        if (this.summonTimer === null)
            this.summonTimer = now;

        // Fase 2: mais rápido e atira mais quando < 50% vida

        if (
            !this.phase2 &&
            this.life <= this.maxLife * 0.5
        ) {
            this.phase2 = true;
            this.meteorCooldown = 5000;
            this.element.classList.add("boss-phase2");
        }

        const speedBoost = this.phase2 ? 1.5 : 1;

        if (distance > 0) {

            this.x += (dx / distance) * this.speed * speedBoost;
            this.y += (dy / distance) * this.speed * speedBoost;
        }

        // Bola de fogo

        if (now - this.fireballTimer >= this.fireballCooldown) {
            this.fireballTimer = now;

            if (onFireball) {
                onFireball(
                    this.x + this.width / 2,
                    this.y + this.height / 2
                );
            }
        }

        // Invoca inimigos aleatórios

        if (now - this.summonTimer >= this.summonCooldown) {

            this.summonTimer = now;

            if (onSummon) onSummon();
        }

        if (now - this.pulseTimer >= this.pulseCooldown) {
            this.pulseTimer = now;
            if (onPulse) onPulse(
                this.x + this.width  / 2,
                this.y + this.height / 2
            );
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