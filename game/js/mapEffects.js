let effectsLayer = null;

// Remove todos os efeitos ativos
export function clearMapEffects() {
    if (effectsLayer) {
        effectsLayer.innerHTML = "";
    }
}

// Aplica o efeito correto para o mapa da fase
export function applyMapEffect(floor) {

    // Garante que a layer existe dentro do game-area
    if (!effectsLayer) {
        effectsLayer = document.createElement("div");
        effectsLayer.id = "map-effects-layer";
        document.getElementById("game-area").appendChild(effectsLayer);
    }

    clearMapEffects();

    if (floor === "pantano.png")   applySwampEffect();
    if (floor === "catacumba.png") applyCataEffect();
    if (floor === "inferno.png")   applyInfernoEffect();
    if (floor === "mista.png")     applyMistaEffect();
    if (floor === "bossRoom.png")  applyBossRoomEffect();
}

// ======================
// PÂNTANO
// ======================

function applySwampEffect() {

    // Névoa rasteira
    const fog1 = el("div", "swamp-fog");
    const fog2 = el("div", "swamp-fog-2");
    effectsLayer.append(fog1, fog2);

    // Wisps flutuantes em posições aleatórias
    const wispPositions = [
        { x: 15, y: 60 }, { x: 30, y: 40 }, { x: 55, y: 70 },
        { x: 70, y: 50 }, { x: 85, y: 65 }, { x: 45, y: 35 },
        { x: 20, y: 80 }, { x: 75, y: 75 }
    ];

    wispPositions.forEach((pos, i) => {
        const wisp = el("div", "swamp-wisp");
        wisp.style.left    = pos.x + "%";
        wisp.style.top     = pos.y + "%";
        wisp.style.setProperty("--duration", (5 + Math.random() * 4) + "s");
        wisp.style.setProperty("--delay",    -(Math.random() * 6)    + "s");
        wisp.style.setProperty("--dx",  (rand(-30, 30))  + "px");
        wisp.style.setProperty("--dy",  (rand(-40, -15)) + "px");
        wisp.style.setProperty("--dx2", (rand(-20, 20))  + "px");
        wisp.style.setProperty("--dy2", (rand(-70, -40)) + "px");
        effectsLayer.appendChild(wisp);
    });
}

// ======================
// CATACUMBA
// ======================

function applyCataEffect() {

    // Vinheta escura nas bordas
    effectsLayer.appendChild(el("div", "cata-vignette"));

    // Poeira caindo — 20 partículas em X aleatório
    for (let i = 0; i < 20; i++) {
        const dust = el("div", "cata-dust");
        dust.style.left = rand(0, 100) + "%";
        dust.style.setProperty("--duration", (3 + Math.random() * 4) + "s");
        dust.style.setProperty("--delay",    -(Math.random() * 5)    + "s");
        dust.style.setProperty("--drift",    rand(-30, 30)           + "px");
        effectsLayer.appendChild(dust);
    }

    // Brilho das tochas (posições aproximadas no sprite)
    const torches = [
        { x: 12, y: 10 }, { x: 88, y: 10 },
        { x: 8,  y: 42 }, { x: 92, y: 42 },
        { x: 22, y: 85 }, { x: 78, y: 85 },
    ];

    torches.forEach((t, i) => {
        const glow = el("div", "cata-torch-glow");
        glow.style.left   = t.x + "%";
        glow.style.top    = t.y + "%";
        glow.style.width  = "80px";
        glow.style.height = "80px";
        glow.style.transform = "translate(-50%, -50%)";
        glow.style.setProperty("--speed", (0.3 + Math.random() * 0.3) + "s");
        glow.style.setProperty("--delay", -(Math.random() * 0.4)      + "s");
        effectsLayer.appendChild(glow);
    });
}

// ======================
// INFERNO
// ======================

function applyInfernoEffect() {

    effectsLayer.appendChild(el("div", "heat-shimmer"));
    effectsLayer.appendChild(el("div", "inferno-glow"));

    // Brasas subindo pelas bordas
    for (let i = 0; i < 25; i++) {
        const ember = el("div", "ember");

        const size = rand(3, 7);
        ember.style.width  = size + "px";
        ember.style.height = size + "px";

        // Concentra nas bordas laterais e inferior
        const side = Math.random();
        if (side < 0.4) {
            ember.style.left   = rand(0, 12) + "%";
            ember.style.bottom = rand(0, 60) + "%";
        } else if (side < 0.8) {
            ember.style.left   = rand(88, 100) + "%";
            ember.style.bottom = rand(0, 60) + "%";
        } else {
            ember.style.left   = rand(10, 90) + "%";
            ember.style.bottom = "5%";
        }

        ember.style.setProperty("--duration", (2 + Math.random() * 3) + "s");
        ember.style.setProperty("--delay",    -(Math.random() * 4)     + "s");
        ember.style.setProperty("--drift",    rand(-25, 25)            + "px");
        ember.style.setProperty("--drift2",   rand(-15, 15)            + "px");
        effectsLayer.appendChild(ember);
    }
}

// ======================
// MISTA
// ======================

function applyMistaEffect() {

    // Pétalas roxas caindo
    for (let i = 0; i < 18; i++) {
        const petal = el("div", "petal");
        petal.style.left = rand(0, 100) + "%";
        petal.style.setProperty("--duration", (4 + Math.random() * 4) + "s");
        petal.style.setProperty("--delay",    -(Math.random() * 6)    + "s");
        petal.style.setProperty("--sway",     rand(-40, 40)           + "px");
        petal.style.setProperty("--sway2",    rand(-30, 30)           + "px");
        effectsLayer.appendChild(petal);
    }

    // Brilho das velas roxas (posições aproximadas no sprite)
    const candles = [
        { x: 30, y: 5  }, { x: 60, y: 5  },
        { x: 8,  y: 65 }, { x: 92, y: 65 },
        { x: 35, y: 95 }, { x: 65, y: 95 },
    ];

    candles.forEach((c, i) => {
        const glow = el("div", "candle-glow");
        glow.style.left   = c.x + "%";
        glow.style.top    = c.y + "%";
        glow.style.width  = "60px";
        glow.style.height = "60px";
        glow.style.transform = "translate(-50%, -50%)";
        glow.style.setProperty("--speed", (0.4 + Math.random() * 0.4) + "s");
        glow.style.setProperty("--delay", -(Math.random() * 0.5)      + "s");
        effectsLayer.appendChild(glow);
    });
}

// ======================
// BOSS ROOM
// ======================

function applyBossRoomEffect() {

    effectsLayer.appendChild(el("div", "boss-vignette"));
    effectsLayer.appendChild(el("div", "boss-mist"));
    effectsLayer.appendChild(el("div", "boss-circle-glow"));
    effectsLayer.appendChild(el("div", "boss-circle-glow-inner"));

    // Partículas orbitando o círculo mágico
    for (let i = 0; i < 8; i++) {
        const rune = el("div", "boss-rune-particle");
        const startDeg = (360 / 8) * i;
        const radius   = i % 2 === 0 ? 110 : 60;
        rune.style.left = "50%";
        rune.style.top  = "50%";
        rune.style.setProperty("--start",    startDeg + "deg");
        rune.style.setProperty("--radius",   radius   + "px");
        rune.style.setProperty("--duration", (6 + (i % 3) * 2) + "s");
        rune.style.setProperty("--delay",    -(i * 1.2)         + "s");
        effectsLayer.appendChild(rune);
    }
}

// ======================
// UTILS
// ======================

function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.classList.add(className);
    return e;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}