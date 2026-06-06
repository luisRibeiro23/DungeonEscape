import { toggleCheat } from "./cheat.js";
import {
    playSound,
    playUISound,
    toggleMusic,
    toggleSound,
    isMusicEnabled,
    isSoundEnabled
} from "./sound.js";
import {
    getHighScore,
    saveCharacter,
    getCharacter
} from "./storage.js?v=1";

// ======================
// ELEMENTOS
// ======================

const musicBtn = document.getElementById("music-toggle");
const soundBtn = document.getElementById("sound-toggle");
const musicImg = musicBtn?.querySelector("img");
const soundImg = soundBtn?.querySelector("img");
const helpButtonMain = document.getElementById("help-button-main");
const helpButtonPause = document.getElementById("help-button-pause");
const instructionsOverlay = document.getElementById("instructions-overlay");
const instructionsClose = document.getElementById("instructions-close");
const pauseMusicBtn = document.getElementById("pause-music-toggle");
const pauseSoundBtn = document.getElementById("pause-sound-toggle");
const pauseMusicImg = pauseMusicBtn?.querySelector("img");
const pauseSoundImg = pauseSoundBtn?.querySelector("img");
const menuScreen       = document.getElementById("menu-screen");
const gameContainer    = document.getElementById("game-container");
const startButton      = document.getElementById("start-button");
const highScoreDisplay = document.getElementById("high-score-display");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const menuButtons      = [...difficultyButtons, startButton];
let instructionsCloseTimeout = null;

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

const highScore = getHighScore();

highScoreDisplay.innerHTML =
    `🏆 High Score: ${highScore}`;

document
    .querySelectorAll(".character-card")
    .forEach(card => {

        const required =
            Number(card.dataset.requiredScore || 0);

        if (highScore < required) {

            card.classList.add("locked");

            const status =
                document.createElement("p");

            status.textContent =
                `🔒 ${required} pts`;

            card.appendChild(status);
        }
    });

const selectedCharacter = getCharacter();

document
    .querySelectorAll(".character-card")
    .forEach(card => {

        if (card.dataset.skin === selectedCharacter) {
            card.classList.add("selected");
        }
    }); 

document
    .querySelectorAll("button")
    .forEach(button => {

        button.addEventListener("click", () => {
            playUISound("menu");
        });
    });

// ======================
// SKIN SELECTION
// ======================

const characterButton =
    document.getElementById("character-button");

const characterOverlay =
    document.getElementById("character-overlay");

const characterClose =
    document.getElementById("character-close");

const characterCards = [
    ...document.querySelectorAll(".character-card")
];

let selectedCharacterIndex =
    characterCards.findIndex(card =>
        card.classList.contains("selected")
    );

if (selectedCharacterIndex < 0) {
    selectedCharacterIndex = 0;
}

function focusCharacter(index) {

    if (index < 0)
        index = characterCards.length - 1;

    if (index >= characterCards.length)
        index = 0;

    selectedCharacterIndex = index;

    characterCards.forEach(card =>
        card.classList.remove("keyboard-focus")
    );

    characterCards[index].classList.add("keyboard-focus");

    characterCards[index].scrollIntoView({
        block: "nearest",
        inline: "nearest"
    });
}

function selectCharacter(card) {

    if (card.classList.contains("locked"))
        return;

    characterCards.forEach(c =>
        c.classList.remove("selected")
    );

    card.classList.add("selected");
    saveCharacter(card.dataset.skin);
    console.log("Salvo:", card.dataset.skin);
}

characterButton.addEventListener("click", () => {
    playUISound("menu");
    characterOverlay.style.display = "flex";
    focusCharacter(selectedCharacterIndex);
});

characterClose.addEventListener("click", () => {
    playUISound("menu");
    characterOverlay.style.display = "none";
});

// ======================
// SOM e MÚSICA
// ======================

function updateAudioButtons() {
    const musicEnabled = isMusicEnabled();
    const soundEnabled = isSoundEnabled();

    const musicSrc = musicEnabled
        ? "../game/assets/sprites/icons/music.jpeg"
        : "../game/assets/sprites/icons/noMusic.jpeg";

    const soundSrc = soundEnabled
        ? "../game/assets/sprites/icons/sound.jpeg"
        : "../game/assets/sprites/icons/noSound.jpeg";

    if (musicImg) musicImg.src = musicSrc;
    if (soundImg) soundImg.src = soundSrc;
    if (pauseMusicImg) pauseMusicImg.src = musicSrc;
    if (pauseSoundImg) pauseSoundImg.src = soundSrc;
}

musicBtn?.addEventListener("click", () => {
    playUISound("menu");
    toggleMusic();
    updateAudioButtons();
});

soundBtn?.addEventListener("click", () => {
    playUISound("menu");
    toggleSound();
    updateAudioButtons();
});

pauseMusicBtn?.addEventListener("click", () => {
    playUISound("menu");
    toggleMusic();
    updateAudioButtons();
});

pauseSoundBtn?.addEventListener("click", () => {
    playUISound("menu");
    toggleSound();
    updateAudioButtons();
});

updateAudioButtons();

// ======================
// INSTRUÇÕES
// ======================

function showInstructions() {
    if (instructionsOverlay) {
        clearTimeout(instructionsCloseTimeout);
        instructionsOverlay.style.display = "flex";
        void instructionsOverlay.offsetWidth;
        instructionsOverlay.classList.add("is-open");
    }
}

function hideInstructions() {
    if (instructionsOverlay) {
        instructionsOverlay.classList.remove("is-open");

        instructionsCloseTimeout = setTimeout(() => {
            if (!instructionsOverlay.classList.contains("is-open")) {
                instructionsOverlay.style.display = "none";
            }
        }, 260);
    }
}

helpButtonMain?.addEventListener("click", showInstructions);
helpButtonPause?.addEventListener("click", showInstructions);
instructionsClose?.addEventListener("click", hideInstructions);
instructionsOverlay?.addEventListener("click", (event) => {
    if (event.target === instructionsOverlay) {
        hideInstructions();
    }
});

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

document
    .querySelectorAll(".character-card")
    .forEach((card, index) => {

        card.addEventListener("click", () => {

            selectCharacter(card);

            selectedCharacterIndex = index;

            focusCharacter(selectedCharacterIndex);
        });
    });

// ======================
// KEYDOWN
// ======================

window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    const characterMenuOpen =
    getComputedStyle(characterOverlay).display !== "none";

    if (characterMenuOpen) {

        if (key === "arrowleft") {
            event.preventDefault();
            playUISound("menu");
            selectedCharacterIndex--;
            if (selectedCharacterIndex < 0) {
                selectedCharacterIndex = characterCards.length - 1;
            }
            focusCharacter(selectedCharacterIndex);
            return;
        }

        if (key === "arrowright") {
            event.preventDefault();
            playUISound("menu");
            selectedCharacterIndex++;
            if (selectedCharacterIndex >= characterCards.length) {
                selectedCharacterIndex = 0;
            }
            focusCharacter(selectedCharacterIndex);
            return;
        }

        if (key === "enter") {
            event.preventDefault();
            playUISound("menu");
            selectCharacter(
                characterCards[selectedCharacterIndex]
            );
            return;
        }

        if (key === "escape") {
            event.preventDefault();
            characterOverlay.style.display = "none";
            return;
        }
    }

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
