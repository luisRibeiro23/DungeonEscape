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
const musicDefaultVolume = 0.35;
const musicDuckVolume = 0.08;

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
    const sound = sounds[name];
    if (!sound) return;

    const audio = sound.cloneNode(true);
    audio.volume = name === "levelUp" ? 1 : 0.85;

    if (name === "levelUp") {
        duckMusic();
    }

    audio.play().catch(() => {
        // Ignore play errors from user interaction restrictions.
    });
}

export function stopMusic() {
    if (!currentMusic) return;
    clearTimeout(musicRestoreTimeout);
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
}

export function playMusic(name) {
    const music = musics[name];
    if (!music) return;

    stopMusic();

    music.loop = name !== "victory";
    music.currentTime = 0;
    music.volume = musicDefaultVolume;

    currentMusic = music;
    music.play().catch(() => {
        // Ignore play errors from user interaction restrictions.
    });
}
