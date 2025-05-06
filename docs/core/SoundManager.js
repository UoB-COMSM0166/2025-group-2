// 在 core file creat SoundManager.js
export class SoundManager {
	constructor() {
		this.sounds = {};
		this.backgroundMusic = null;
		this.isMuted = false;
	}

	// preload all sounds effect
	preload() {
		// Make sure the sound file exists in the correct path
		this.merge = loadSound('./soundsplus/merge.mp3');

		try {
			console.log('Loading background music...');
			this.backgroundMusic = loadSound('./sounds/backgroundMusic.mp3');
			console.log('Background music loaded successfully');
		} catch (error) {
			console.error('Sound effect preloading failed:', error);
		}
	}

	// Play a specific sound effect
	play(soundName, volume = 1.0) {
		if (this.isMuted) return;

		// Added check to prevent accessing non-existent sound effects
		if (!this.sounds[soundName]) {
			console.warn(`sound effect ${soundName} Does not exist or was not loaded successfully`);
			return;
		}

		this.sounds[soundName].setVolume(volume);
		this.sounds[soundName].play();
	}

	// play background music（loop）
	playBackgroundMusic(volume = 0.1) {
		console.log('try to play background music');
		if (this.isMuted || !this.backgroundMusic) {
			console.log('Background music is muted or not loaded');
			return;
		}
		// If background music is already playing, it will not be started again
		if (this.backgroundMusic.isPlaying()) {
			console.log('Background music is already playing');
			return;
		}
		try {
			console.log('setting volume');
			this.backgroundMusic.setVolume(volume);
			// Start looping background music
			this.backgroundMusic.loop();
			console.log('backgound music start play');
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
}
