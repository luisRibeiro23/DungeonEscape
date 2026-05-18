// ======================
// STORAGE
// Responsável por salvar e carregar
// dados do jogo no localStorage
// ======================

const HIGH_SCORE_KEY = "dungeonEscapeHighScore";

export function getHighScore() {

    const saved =
        localStorage.getItem(HIGH_SCORE_KEY);

    return saved ? parseInt(saved) : 0;
}

export function saveHighScore(score) {

    const current = getHighScore();

    if (score > current) {

        localStorage.setItem(
            HIGH_SCORE_KEY,
            score.toString()
        );

        return true; // novo recorde!
    }

    return false;
}