// ======================
// CHEAT SYSTEM
// Gerencia os cheats ativos do jogo
// ======================

export const cheats = {
    godMode:     false,
    tripleShot:  false,
    skipPhase:   false,
    killAll:     false,
    extraLives:  false,
};

// Callbacks registrados pelo game.js

let _onSkipPhase = null;
let _onKillAll   = null;
let _onExtraLives = null;

export function registerCheatCallbacks({ onSkipPhase, onKillAll, onExtraLives }) {
    _onSkipPhase  = onSkipPhase;
    _onKillAll    = onKillAll;
    _onExtraLives = onExtraLives;
}

// ======================
// ATIVA / DESATIVA CHEAT
// ======================

export function toggleCheat(type) {

    switch (type) {

        case "godMode":
            cheats.godMode = !cheats.godMode;
            updateCheatButton("cheat-godmode", cheats.godMode);
            updateCheatHUD();
            break;

        case "tripleShot":
            cheats.tripleShot = !cheats.tripleShot;
            updateCheatButton("cheat-tripleshot", cheats.tripleShot);
            updateCheatHUD();
            break;

        case "skipPhase":
            // Não é toggle — executa uma vez
            if (_onSkipPhase) _onSkipPhase();
            flashCheatButton("cheat-skipphase");
            break;

        case "killAll":
            if (_onKillAll) _onKillAll();
            flashCheatButton("cheat-killall");
            break;

        case "extraLives":
            if (_onExtraLives) _onExtraLives();
            flashCheatButton("cheat-extralives");
            break;
    }
}

// ======================
// VISUAL DOS BOTÕES
// ======================

function updateCheatButton(id, active) {

    const btn = document.getElementById(id);

    if (!btn) return;

    if (active) {
        btn.classList.add("cheat-active");
    } else {
        btn.classList.remove("cheat-active");
    }
}

function flashCheatButton(id) {

    const btn = document.getElementById(id);

    if (!btn) return;

    btn.classList.add("cheat-flash");

    setTimeout(() => btn.classList.remove("cheat-flash"), 600);
}

// ======================
// HUD DE CHEATS ATIVOS
// ======================

function updateCheatHUD() {

    const hud = document.getElementById("cheat-hud");

    if (!hud) return;

    const active = [];

    if (cheats.godMode)    active.push("GOD");
    if (cheats.tripleShot) active.push("3x");

    hud.innerHTML = active.length > 0
        ? active.map(c => `<span class="cheat-hud-tag">${c}</span>`).join("")
        : "";
}