console.log("MAIN FUNCIONANDO");

const menuScreen = document.getElementById("menu-screen");
const gameContainer = document.getElementById("game-container");
const startButton = document.getElementById("start-button");

startButton.addEventListener("click", async () => {

    console.log("BOTAO CLICADO");

    menuScreen.style.display = "none";
    gameContainer.style.display = "flex";

    await import("./game.js");

});