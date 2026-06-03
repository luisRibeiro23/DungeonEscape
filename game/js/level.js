// ======================
// LEVEL
// Define as configurações de cada fase:
// piso, inimigos, duração e spawn dinâmico
// ======================

export const phases = {

    1: {
        floor: "slimefloor.png",
        enemies: ["slime"],

        // Duração total da fase em ms
        duration: 30000,

        // Intervalo inicial entre spawns em ms
        spawnInterval: 4000,

        // Intervalo mínimo (mais rápido possível)
        spawnIntervalMin: 1500,
    },

    2: {
        floor: "catacombs.png",
        enemies: ["skeleton"],

        duration: 40000,
        spawnInterval: 3500,
        spawnIntervalMin: 1200,
    },

    3: {
        floor: "hell.png",
        enemies: ["demon"],

        duration: 45000,
        spawnInterval: 3000,
        spawnIntervalMin: 1000,
    },

    4: {
        floor: "floor.png",
        enemies: ["slime", "skeleton", "demon"],

        duration: 55000,
        spawnInterval: 2500,
        spawnIntervalMin: 800,
    },

    5: {
        floor: "hell.png",
        enemies: ["boss"],

        duration: 60000,
        spawnInterval: 8000,
        spawnIntervalMin: 5000,
    }
};

export const TOTAL_PHASES = Object.keys(phases).length;