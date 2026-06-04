// ======================
// LEVEL
// Define as configurações de cada fase:
// piso, inimigos, duração e spawn dinâmico
// ======================

export const phases = {

    1: {
        floor: "pantano.png",
        enemies: ["slime"],
        duration: 30000,
        spawnInterval: 4000,
        spawnIntervalMin: 1500,
    },

    2: {
        floor: "catacumba.png",
        enemies: ["skeleton"],
        duration: 40000,
        spawnInterval: 3500,
        spawnIntervalMin: 1200,
    },

    3: {
        floor: "inferno.png",
        enemies: ["demon"],
        duration: 45000,
        spawnInterval: 3000,
        spawnIntervalMin: 1000,
    },

    4: {
        floor: "mista.png",
        enemies: ["slime", "skeleton", "demon"],
        duration: 55000,
        spawnInterval: 2500,
        spawnIntervalMin: 800,
    },

    5: {
        floor: "bossRoom.png",
        enemies: ["boss"],
        duration: 60000,
        spawnInterval: 8000,
        spawnIntervalMin: 5000,
    }
};

export const TOTAL_PHASES = Object.keys(phases).length;