export class Projectile {

    // owner: "player" | "enemy"
    // type:  "default" | "bone" | "boss-bullet"

    constructor(x, y, directionX, directionY, owner = "player", type = "default") {

        this.x = x;
        this.y = y;

        this.owner = owner;
        this.type  = type;

        this.directionX = directionX;
        this.directionY = directionY;

        // Velocidade por tipo

        if (type === "bone") {
            this.speed = 5;
        } else if (type === "boss-bullet") {
            this.speed = 6;
        } else {
            this.speed = 10;
        }

        // ======================
        // ELEMENTO DOM
        // ======================

        this.element =
            document.createElement("div");

        this.element.classList.add("projectile");
        this.element.classList.add(`projectile-${type}`);

        if (owner === "enemy") {
            this.element.classList.add("projectile-enemy");
        }

        document
            .getElementById("game-area")
            .appendChild(this.element);

        this.updatePosition();
    }

    update() {

        this.x += this.directionX * this.speed;
        this.y += this.directionY * this.speed;

        // Rotaciona o sprite na direção do movimento

        if (
            this.type === "bone" ||
            this.type === "default"
        ) {

            const angle =
                Math.atan2(this.directionY, this.directionX)
                * (180 / Math.PI);

            this.element.style.transform =
                `rotate(${angle}deg)`;
        }

        this.updatePosition();
    }

    updatePosition() {

        this.element.style.left = this.x + "px";
        this.element.style.top  = this.y + "px";
    }

    remove() {

        this.element.remove();
    }
}