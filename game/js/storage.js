// ======================
// STORAGE
// Responsável por salvar e carregar
// dados do jogo no localStorage/sessionStorage
// ======================

const HIGH_SCORE_KEY = "dungeonEscapeHighScore";
const AUDIO_PREFS_KEY = "dungeonEscapeAudioPreferences";

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

export function getAudioPreferences() {
    try {
        const saved = localStorage.getItem(AUDIO_PREFS_KEY);

        if (!saved) {
            return {
                musicEnabled: true,
                soundEnabled: true,
            };
        }

        const prefs = JSON.parse(saved);

        return {
            musicEnabled: typeof prefs.musicEnabled === "boolean"
                ? prefs.musicEnabled
                : true,
            soundEnabled: typeof prefs.soundEnabled === "boolean"
                ? prefs.soundEnabled
                : true,
        };
    } catch (error) {
        console.warn("Falha ao carregar preferências de áudio:", error);
        return {
            musicEnabled: true,
            soundEnabled: true,
        };
    }
}

export function saveAudioPreferences(preferences) {
    try {
        localStorage.setItem(
            AUDIO_PREFS_KEY,
            JSON.stringify({
                musicEnabled: preferences.musicEnabled,
                soundEnabled: preferences.soundEnabled,
            })
        );
    } catch (error) {
        console.warn("Falha ao salvar preferências de áudio:", error);
    }
}
