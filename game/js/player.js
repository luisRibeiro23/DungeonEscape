export class Player {

    constructor() {

        this.element =
            document.getElementById("player");

        this.life = 3;

        this.x = 100;
        this.y = 100;

        this.lastDirectionX = 1;
        this.lastDirectionY = 0;

        this.width = 48;
        this.height = 48;

        this.normalSpeed = 5;

        this.speed = this.normalSpeed;

        this.isDashing = false;

        this.direction = "south";

        this.gameArea =
            document.getElementById("game-area");

        // SPRITE INICIAL

        this.updateSprite();

        this.updatePosition();
    }

    move(dx, dy) {

        const gameWidth =
            this.gameArea.clientWidth;

        const gameHeight =
            this.gameArea.clientHeight;

        let newX = this.x + dx;
        let newY = this.y + dy;

        // ======================
        // LIMITES
        // ======================

        if (newX < 0) {
            newX = 0;
        }

        if (
            newX + this.width >
            gameWidth
        ) {

            newX =
                gameWidth - this.width;
        }

        if (newY < 0) {
            newY = 0;
        }

        if (
            newY + this.height >
            gameHeight
        ) {

            newY =
                gameHeight - this.height;
        }

        // ======================
        // DIREÇÃO DO TIRO
        // ======================

        if (dx !== 0 || dy !== 0) {

            const length =
                Math.sqrt(dx * dx + dy * dy);

            this.lastDirectionX =
                dx / length;

            this.lastDirectionY =
                dy / length;
        }

        // ======================
        // DIREÇÃO SPRITE
        // ======================

        if (dx > 0) {

            this.direction = "east";
        }

        else if (dx < 0) {

            this.direction = "west";
        }

        else if (dy > 0) {

            this.direction = "south";
        }

        else if (dy < 0) {

            this.direction = "north";
        }

        this.updateSprite();

        // ======================
        // POSIÇÃO
        // ======================

        this.x = newX;
        this.y = newY;

        this.updatePosition();
    }

    // ======================
    // UPDATE POSITION
    // ======================

    updatePosition() {

        this.element.style.left =
            this.x + "px";

        this.element.style.top =
            this.y + "px";
    }

    // ======================
    // UPDATE SPRITE
    // ======================

    updateSprite() {

        this.element.style.backgroundImage =

            `url("assets/sprites/player/player-${this.direction}.png")`;
    }
}