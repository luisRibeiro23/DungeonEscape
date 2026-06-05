// ======================
// POWERUP
// Power-ups que dropam dos inimigos
// e podem ser coletados pelo player
// ======================

// Tipos disponíveis e seus efeitos

export const powerupTypes = {

    "triple-shot": {
        label: "3x",
        color: "#00cfff",
        duration: 8000,
        dropChance: 0.15
    },

    "shield": {
        label: "🛡",
        color: "#ffe066",
        duration: 5000,
        dropChance: 0.1
    },

    "speed": {
        label: "⚡",
        color: "#a0ff60",
        duration: 6000,
        dropChance: 0.12
    },

    "heart": {
        label: "❤️",
        color: "#ff5c7a",
        duration: 2500,
        dropChance: 0.1
    }
};

export class PowerUp {

    constructor(type, x, y) {

        this.type = type;
        this.x    = x;
        this.y    = y;

        this.width  = 28;
        this.height = 28;

        const config = powerupTypes[type];

        // ======================
        // ELEMENTO DOM
        // ======================

        this.element =
            document.createElement("div");

        this.element.classList.add("powerup");
        this.element.classList.add(`powerup-${type}`);

        this.element.style.setProperty(
            "--powerup-color", config.color
        );

        this.element.innerHTML =
            `<span>${config.label}</span>`;

        document
            .getElementById("game-area")
            .appendChild(this.element);

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

// ======================
// TENTA DROPAR UM POWER-UP
// Chamado ao matar um inimigo
// Retorna o tipo dropado ou null
// ======================

export function tryDropPowerUp(enemyType, x, y) {

    // Boss sempre dropa power-up

    if (enemyType === "boss") {

        const types = Object.keys(powerupTypes);

        const type =
            types[Math.floor(Math.random() * types.length)];

        return new PowerUp(type, x, y);
    }

    // Outros inimigos: chance aleatória por tipo

    const possibleDrops = [];

    for (const [type, config] of Object.entries(powerupTypes)) {

        if (Math.random() < config.dropChance) {
            possibleDrops.push(type);
        }
    }

    if (possibleDrops.length === 0) {
        return null;
    }

    const type = possibleDrops[
        Math.floor(Math.random() * possibleDrops.length)
    ];

    return new PowerUp(type, x, y);
}