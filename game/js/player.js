export class Player {

    constructor(life = 32222) {

        this.element =
            document.getElementById("player");

        this.life = life;

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

        // ======================
        // ANIMAÇÃO DE FRAMES
        // ======================

        // Frame atual: 0 = base, 1 = alternativo
        this.animFrame = 0;

        // Contador de passos para controlar
        // a velocidade da animação
        this.stepCounter = 0;

        // A cada quantos frames de jogo
        // troca o sprite (8 = animação suave)
        this.animSpeed = 8;

        // Se o player está se movendo
        this.isMoving = false;

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

        // ======================
        // ANIMAÇÃO DE CAMINHADA
        // ======================

        this.isMoving = (dx !== 0 || dy !== 0);

        if (this.isMoving) {

            this.stepCounter++;

            // Troca o frame a cada animSpeed ticks
            if (this.stepCounter >= this.animSpeed) {

                this.stepCounter = 0;

                // Alterna entre frame 0 e 1
                this.animFrame =
                    this.animFrame === 0 ? 1 : 0;
            }

        } else {

            // Parado: volta pro frame base e reseta
            this.animFrame = 0;
            this.stepCounter = 0;
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

        // Frame 0 = sprite base  (player-south.png)
        // Frame 1 = sprite alt   (player-south-1.png)

        const frameSuffix =
            this.animFrame === 0
                ? ""
                : "-1";

        this.element.style.backgroundImage =
            `url("assets/sprites/player/player-${this.direction}${frameSuffix}.png")`;
    }
}
