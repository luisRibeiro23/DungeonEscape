import { getAudioPreferences, saveAudioPreferences } from "./storage.js?v=1";

export const sounds = {
    attack: new Audio('assets/sprites/sound/sfx/gun-shot.mp3'),
    hit: new Audio('assets/sprites/sound/sfx/hurt.mp3'),
    death: new Audio('assets/sprites/sound/sfx/game-over.mp3'),
    pickup: new Audio('assets/sprites/sound/sfx/power-up.mp3'),
    levelUp: new Audio('assets/sprites/sound/sfx/level-up.mp3'),
    menu: new Audio('assets/sprites/sound/sfx/menu-select.wav')
};

export const musics = {
    game: new Audio('assets/sprites/sound/bgm/main-music.mp3'),
    boss: new Audio('assets/sprites/sound/bgm/boss-theme.mp3'),
    victory: new Audio('assets/sprites/sound/bgm/victory.mp3')
};

let currentMusic = null;
let musicRestoreTimeout = null;
let musicEnabled = true;
let soundEnabled = true;
const musicDefaultVolume = 0.35;
const musicDuckVolume = 0.08;

function loadAudioPreferences() {
    try {
        const prefs = getAudioPreferences();

        musicEnabled = prefs.musicEnabled;
        soundEnabled = prefs.soundEnabled;
    } catch (error) {
        console.warn("Falha ao carregar preferências de áudio:", error);
        musicEnabled = true;
        soundEnabled = true;
    }
}

function saveAudioPreferencesState() {
    try {
        saveAudioPreferences({
            musicEnabled,
            soundEnabled,
        });
    } catch (error) {
        console.warn("Falha ao salvar preferências de áudio:", error);
    }
}

loadAudioPreferences();

function duckMusic(duration = 700) {
    if (!currentMusic) return;

    clearTimeout(musicRestoreTimeout);

    currentMusic.volume = musicDuckVolume;

    musicRestoreTimeout = setTimeout(() => {
        if (currentMusic) {
            currentMusic.volume = musicDefaultVolume;
        }
    }, duration);
}

export function playSound(name) {
    if (!soundEnabled) return;
    const sound = sounds[name];
    if (!sound) return;

    const audio = sound.cloneNode(true);
    audio.volume = name === "levelUp" ? 1 : 0.85;

    if (name === "levelUp") {
        duckMusic(); }
    audio.play().catch(() => {});
}

export function stopMusic() {
    if (!currentMusic) return;
    clearTimeout(musicRestoreTimeout);
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
}

export function playMusic(name) {
    if (!musicEnabled) return;
    const music = musics[name];
    if (!music) return;
    stopMusic();

    music.loop = name !== "victory";
    music.currentTime = 0;
    music.volume = musicDefaultVolume;

    currentMusic = music;

    music.play().catch(() => {});
}

export function toggleMusic() {
    musicEnabled = !musicEnabled;
    saveAudioPreferencesState();
    if (!musicEnabled) {
        stopMusic();
    }
    return musicEnabled;
}

export function toggleSound() {
    soundEnabled = !soundEnabled;
    saveAudioPreferencesState();
    return soundEnabled;
}

export function isMusicEnabled() {
    return musicEnabled;
}

export function isSoundEnabled() {
    return soundEnabled;
}

export function playUISound(name) {
    if (!soundEnabled) return;

    const sound = sounds[name];
    if (!sound) return;

    const audio = sound.cloneNode(true);
    audio.volume = 0.85;

    audio.play().catch(() => {});
}