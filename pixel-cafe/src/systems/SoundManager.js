const AUDIO_FILES = {
  click: 'assets/audio/click.mp3',
  serve: 'assets/audio/serve.mp3',
  coin: 'assets/audio/coin.mp3',
  success: 'assets/audio/success.mp3',
  error: 'assets/audio/error.mp3',
  ambience: 'assets/audio/ambience.mp3',
};

export class SoundManager {
  constructor() {
    this.sounds = {};
    this.ambienceRequested = false;
    this.loadAll();
  }

  static preload() {
    // Audio is checked lazily so missing files never fail Phaser loading.
  }

  async loadAll() {
    await Promise.all(Object.entries(AUDIO_FILES).map(([key, path]) => this.tryLoad(key, path)));
  }

  async tryLoad(key, path) {
    try {
      const response = await fetch(path, { method: 'HEAD' });

      if (!response.ok) {
        return;
      }

      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds[key] = audio;

      if (key === 'ambience' && this.ambienceRequested) {
        this.startAmbience();
      }
    } catch (_error) {
      // Missing or blocked audio should leave the game silent, not broken.
    }
  }

  play(key, config = {}) {
    const source = this.sounds[key];

    if (!source) {
      return;
    }

    const audio = source.cloneNode();
    audio.volume = config.volume ?? 0.5;
    audio.loop = Boolean(config.loop);
    audio.play().catch(() => {});
  }

  startAmbience() {
    this.ambienceRequested = true;
    const ambience = this.sounds.ambience;

    if (!ambience || this.ambiencePlaying) {
      return;
    }

    this.ambiencePlaying = ambience.cloneNode();
    this.ambiencePlaying.volume = 0.18;
    this.ambiencePlaying.loop = true;
    this.ambiencePlaying.play().catch(() => {});
  }
}
