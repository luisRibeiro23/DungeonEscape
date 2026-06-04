import { getHighScore } from "./storage.js";
import { toggleCheat } from "./cheat.js";
import {
    playSound,
    playUISound,
    toggleMusic,
    toggleSound
} from "./sound.js";

// ======================
// ELEMENTOS
// ======================

const musicBtn = document.getElementById("music-toggle");
const soundBtn = document.getElementById("sound-toggle");
const musicImg = musicBtn.querySelector("img");
const soundImg = soundBtn.querySelector("img");
const menuScreen       = document.getElementById("menu-screen");
const gameContainer    = document.getElementById("game-container");
const startButton      = document.getElementById("start-button");
const highScoreDisplay = document.getElementById("high-score-display");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const menuButtons      = [...difficultyButtons, startButton];

// ======================
// DIFICULDADE
// ======================

let selectedDifficulty = "normal";
let menuFocusedIndex = [...difficultyButtons].findIndex((btn) =>
    btn.classList.contains("selected")
);

if (menuFocusedIndex < 0) {
    menuFocusedIndex = 0;
}

function setMenuFocus(index) {
    if (index < 0) index = 0;
    if (index >= menuButtons.length) index = menuButtons.length - 1;

    menuFocusedIndex = index;
    menuButtons[menuFocusedIndex].focus();
}

function selectDifficultyButton(button) {
    playSound("menu");

    difficultyButtons.forEach((b) => b.classList.remove("selected"));

    button.classList.add("selected");
    selectedDifficulty = button.dataset.difficulty;
}

difficultyButtons.forEach((btn, index) => {

    btn.addEventListener("click", () => {
        selectDifficultyButton(btn);
        setMenuFocus(index);
    });
});

setMenuFocus(menuFocusedIndex);

// ======================
// HIGH SCORE
// ======================

highScoreDisplay.innerHTML =
    `🏆 High Score: ${getHighScore()}`;

// ======================
// PAINEL DE CHEATS
// Ativado por 3 cliques no título
// ======================

const title      = document.querySelector(".game-logo");
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
/*
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
*/

// ======================
// START GAME
// ======================

startButton.addEventListener("click", async () => {

    menuScreen.style.display = "none";

    gameContainer.style.display = "flex";

    const { startGame } = await import("./game.js");

    startGame(selectedDifficulty);
});

window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (event.ctrlKey && !event.altKey && !event.metaKey) {
        switch (key) {
            case "g":
                event.preventDefault();
                toggleCheat("godMode");
                return;
            case "y":
                event.preventDefault();
                toggleCheat("tripleShot");
                return;
            case "s":
                event.preventDefault();
                toggleCheat("skipPhase");
                return;
            case "k":
                event.preventDefault();
                toggleCheat("killAll");
                return;
            case "e":
                event.preventDefault();
                toggleCheat("extraLives");
                return;
        }
    }

    if (
        menuScreen.style.display === "none" ||
        getComputedStyle(menuScreen).display === "none"
    ) {
        return;
    }

    const isMenuKey = ["arrowup", "arrowdown", "arrowleft", "arrowright", "enter", " "];

    if (!isMenuKey.includes(key)) return;

    event.preventDefault();

    if (key === "arrowleft") {
        if (menuFocusedIndex < difficultyButtons.length) {
            const nextIndex =
                (menuFocusedIndex - 1 + difficultyButtons.length) %
                difficultyButtons.length;
            setMenuFocus(nextIndex);
        }
    }

    if (key === "arrowright") {
        if (menuFocusedIndex < difficultyButtons.length) {
            const nextIndex =
                (menuFocusedIndex + 1) % difficultyButtons.length;
            setMenuFocus(nextIndex);
        }
    }

    if (key === "arrowdown") {
        setMenuFocus(Math.min(menuButtons.length - 1, menuFocusedIndex + 1));
    }

    if (key === "arrowup") {
        setMenuFocus(Math.max(0, menuFocusedIndex - 1));
    }

    if (key === "enter" || key === " ") {
        menuButtons[menuFocusedIndex].click();
    }
});

// ======================
// BOTÕES DE SOM E MUSICA
// ======================

musicBtn.addEventListener("click", () => {
    playUISound("menu");
    const enabled = toggleMusic();

    musicImg.src = enabled
        ? "../game/assets/sprites/music.jpeg"
        : "../game/assets/sprites/noMusic.jpeg";
});

soundBtn.addEventListener("click", () => {
    playUISound("menu");
    const enabled = toggleSound();

    soundImg.src = enabled
        ? "../game/assets/sprites/sound.jpeg"
        : "../game/assets/sprites/noSound.jpeg";
});