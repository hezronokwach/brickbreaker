class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        
        // Load all sounds
        this.loadSounds();
    }

    loadSounds() {
        // Sound effects
        this.loadSound('brickHit', 'assets/sounds/brick_hit.mp3');
        this.loadSound('powerUp', 'assets/sounds/power_up.mp3');
        this.loadSound('gameStart', 'assets/sounds/game_start.mp3');
        this.loadSound('gameOver', 'assets/sounds/game_over.mp3');
        this.loadSound('levelComplete', 'assets/sounds/level_complete.mp3');
        //this.loadSound('ballbounce', 'assets/sounds/ball3.mp3');


        // Background music
        this.music = new Audio('assets/sounds/background_music.mp3');
        this.music.loop = true;
        this.music.volume = 0.5;
    }

    loadSound(name, path) {
        this.sounds[name] = new Audio(path);
        // Add error handling for missing sound files
        this.sounds[name].onerror = () => {
            console.warn(`Failed to load sound: ${name}`);
            // Create silent audio to prevent errors
            this.sounds[name] = {
                play: () => Promise.resolve(),
                pause: () => {},
                currentTime: 0
            };
        };
    }

    playSound(name) {
        if (this.isMuted || !this.sounds[name]) return;
        
        const sound = this.sounds[name];
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.warn(`Error playing sound ${name}:`, error);
        });
    }

    startMusic() {
        if (this.isMuted) return;
        
        this.music.play().catch(error => {
            console.warn('Error playing background music:', error);
        });
    }

    stopMusic() {
        this.music.pause();
        this.music.currentTime = 0;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
        
        return this.isMuted;
    }
}

export default new SoundManager();