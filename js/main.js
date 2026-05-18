import { getHighScore } from "./storage.js";

// ======================
// ELEMENTOS
// ======================

const menuScreen =
    document.getElementById("menu-screen");

const gameContainer =
    document.getElementById("game-container");

const startButton =
    document.getElementById("start-button");

const highScoreDisplay =
    document.getElementById("high-score-display");

const difficultyButtons =
    document.querySelectorAll(".difficulty-btn");

// ======================
// DIFICULDADE SELECIONADA
// ======================

let selectedDifficulty = "normal";

// Atualiza visual dos botões de dificuldade

difficultyButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        difficultyButtons.forEach((b) =>
            b.classList.remove("selected")
        );

        btn.classList.add("selected");

        selectedDifficulty =
            btn.dataset.difficulty;
    });
});

// ======================
// EXIBIR HIGH SCORE
// ======================

highScoreDisplay.innerHTML =
    `🏆 High Score: ${getHighScore()}`;

// ======================
// START GAME
// ======================

startButton.addEventListener("click", async () => {

    menuScreen.style.display = "none";

    gameContainer.style.display = "flex";

    // Passa a dificuldade via módulo dinâmico

    const { startGame } =
        await import("./game.js");

    startGame(selectedDifficulty);
});