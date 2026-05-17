export class Enemy {

    constructor(type, x, y) {

        this.type = type;

        this.x = x;
        this.y = y;

        this.width = 48;
        this.height = 48;

        this.speed = 1;

        this.life = 1;

        // ======================
        // CONFIGURAÇÕES
        // ======================

        if (type === "slime") {

            this.speed = 1;

            this.life = 1;

            this.width = 40;
            this.height = 40;
        }

        if (type === "skeleton") {

            this.speed = 2;

            this.life = 2;
        }

        if (type === "demon") {

            this.speed = 1.5;

            this.life = 4;

            this.width = 64;
            this.height = 64;
        }

        if (type === "boss") {

            this.speed = 0.8;

            this.life = 30;

            this.width = 160;
            this.height = 160;
        }

        // ======================
        // ELEMENTO DOM
        // ======================

        this.element =
            document.createElement("div");

        this.element.classList.add("enemy");

        this.element.style.width =
            this.width + "px";

        this.element.style.height =
            this.height + "px";

        this.element.style.backgroundImage =
            `url("../assets/sprites/enemies/${type}.png")`;

        document
            .getElementById("game-area")
            .appendChild(this.element);

        this.updatePosition();
    }

    // ======================
    // UPDATE
    // ======================

    update(playerX, playerY) {

        const dx =
            playerX - this.x;

        const dy =
            playerY - this.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {

            this.x +=
                (dx / distance) *
                this.speed;

            this.y +=
                (dy / distance) *
                this.speed;
        }

        this.updatePosition();
    }

    // ======================
    // POSITION
    // ======================

    updatePosition() {

        this.element.style.left =
            this.x + "px";

        this.element.style.top =
            this.y + "px";
    }

    // ======================
    // DAMAGE
    // ======================

    takeDamage(amount) {

        this.life -= amount;

        // FLASH VERMELHO

        this.element.style.filter =
            "brightness(2)";

        setTimeout(() => {

            this.element.style.filter =
                "none";

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