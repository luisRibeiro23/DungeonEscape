import { getHighScore } from "./storage.js";
import { toggleCheat } from "./cheat.js";

// ======================
// ELEMENTOS
// ======================

const menuScreen       = document.getElementById("menu-screen");
const gameContainer    = document.getElementById("game-container");
const startButton      = document.getElementById("start-button");
const highScoreDisplay = document.getElementById("high-score-display");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

// ======================
// DIFICULDADE
// ======================

let selectedDifficulty = "normal";

difficultyButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        difficultyButtons.forEach((b) =>
            b.classList.remove("selected")
        );

        btn.classList.add("selected");

        selectedDifficulty = btn.dataset.difficulty;
    });
});

// ======================
// HIGH SCORE
// ======================

highScoreDisplay.innerHTML =
    `🏆 High Score: ${getHighScore()}`;

// ======================
// PAINEL DE CHEATS
// Ativado por 3 cliques no título
// ======================

const title      = document.querySelector("#menu-screen h1");
const cheatPanel = document.getElementById("cheat-panel");

let clickCount  = 0;
let clickTimer  = null;

title.style.cursor = "pointer";

title.addEventListener("click", () => {

    clickCount++;

    clearTimeout(clickTimer);

    // Reseta contador após 1.5s sem clicar

    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 1500);

    if (clickCount >= 3) {

        clickCount = 0;

        const visible =
            cheatPanel.style.display === "flex";

        cheatPanel.style.display =
            visible ? "none" : "flex";

        // Pequeno shake no título como feedback

        title.classList.add("title-shake");

        setTimeout(() =>
            title.classList.remove("title-shake"),
        400);
    }
});

// ======================
// BOTÕES DE CHEAT
// ======================

document
    .getElementById("cheat-godmode")
    .addEventListener("click", () => toggleCheat("godMode"));

document
    .getElementById("cheat-tripleshot")
    .addEventListener("click", () => toggleCheat("tripleShot"));

document
    .getElementById("cheat-skipphase")
    .addEventListener("click", () => toggleCheat("skipPhase"));

document
    .getElementById("cheat-killall")
    .addEventListener("click", () => toggleCheat("killAll"));

document
    .getElementById("cheat-extralives")
    .addEventListener("click", () => toggleCheat("extraLives"));

// ======================
// START GAME
// ======================

startButton.addEventListener("click", async () => {

    menuScreen.style.display = "none";

    gameContainer.style.display = "flex";

    const { startGame } = await import("./game.js");

    startGame(selectedDifficulty);
});