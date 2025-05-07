export class SoundManager {
	constructor() {
		this.sounds = {};
		this.backgroundMusic = null;
		this.gameOverMusic = null;
		this.mergeSound = null;
		this.isMuted = false;
	}

	// preload all sounds effect
	preload() {
		try {
			this.backgroundMusic = loadSound('assets/backgroundMusic.mp3');
			this.gameOverMusic = loadSound('assets/endGame.mp3');
			this.mergeSound = loadSound('assets/merge.mp3');
		} catch (error) {
			console.error('Sound effect preloading failed:', error);
		}
	}

	play(soundName, volume = 1.0) {
		if (this.isMuted) return;

		if (!this.sounds[soundName]) {
			console.warn(`sound effect ${soundName} Does not exist or was not loaded successfully`);
			return;
		}

		this.sounds[soundName].setVolume(volume);
		this.sounds[soundName].play();
	}

	playBackgroundMusic(volume = 0.1) {
		if (this.isMuted) {
			console.error('Background music is muted');
			return;
		}
		if (!this.backgroundMusic) {
			console.error('Background music is not loaded');
			return;
		}
		if (this.backgroundMusic.isPlaying()) {
			return;
		}
		try {
			this.backgroundMusic.setVolume(volume);
			this.backgroundMusic.loop();
		} catch (error) {
			console.error('backgound music start play fialed:', error);
		}
	}

	// stop playing backgroud music
	stopBackgroundMusic() {
		if (this.backgroundMusic && this.backgroundMusic.isPlaying()) {
			this.backgroundMusic.stop();
		}
	}

	// Mute/Unmute
	toggleMute() {
		this.isMuted = !this.isMuted;

		if (this.isMuted) {
			if (this.backgroundMusic && this.backgroundMusic.isPlaying()) {
				this.backgroundMusic.pause();
			}
		} else {
			if (this.backgroundMusic && !this.backgroundMusic.isPlaying()) {
				this.backgroundMusic.play();
			}
		}

		return this.isMuted;
	}

	reset() {
		this.stopBackgroundMusic();
		if (this.gameOverMusic && this.gameOverMusic.isPlaying()) {
			this.gameOverMusic.stop();
		}

		this.playBackgroundMusic();
	}
}
