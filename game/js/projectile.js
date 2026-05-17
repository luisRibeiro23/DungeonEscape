export class Projectile {

    constructor(x, y, directionX, directionY) {

        this.x = x;
        this.y = y;

        this.speed = 10;

        this.directionX = directionX;
        this.directionY = directionY;

        this.element = document.createElement("div");

        this.element.classList.add("projectile");

        document
            .getElementById("game-area")
            .appendChild(this.element);

        this.updatePosition();
    }

    update() {

        this.x += this.directionX * this.speed;
        this.y += this.directionY * this.speed;

        this.updatePosition();
    }

    updatePosition() {

        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
    }

    remove() {

        this.element.remove();
    }
}