/**
 * Audio manager for 2D Tetris
 * Handles sound effects and background music using Howler.js
 */
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.initialized = false;
        
        // Initialize sounds when the page loads
        this.initialize();
    }
    
    /**
     * Initialize audio system
     */
    initialize() {
        // Set global Howler settings
        Howler.volume(CONFIG.AUDIO.MASTER_VOLUME);
        Howler.autoUnlock = true;
        
        // Try to load sounds (with fallbacks)
        this.loadSounds();
    }
    
    /**
     * Load all game sounds
     */
    loadSounds() {
        try {
            // Load sound effects
            this.sounds = {
                move: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.MOVE],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: move', err)
                }),
                rotate: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.ROTATE],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: rotate', err)
                }),
                drop: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.DROP],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: drop', err)
                }),
                lineClear: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.LINE_CLEAR],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: lineClear', err)
                }),
                singleClear: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.SINGLE_CLEAR],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: singleClear', err)
                }),
                doubleClear: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.DOUBLE_CLEAR],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: doubleClear', err)
                }),
                tripleClear: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.TRIPLE_CLEAR],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: tripleClear', err)
                }),
                tetris: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.TETRIS],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: tetris', err)
                }),
                levelUp: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.LEVEL_UP],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: levelUp', err)
                }),
                gameOver: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.GAME_OVER],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: gameOver', err)
                }),
                lock: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.LOCK],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: lock', err)
                }),
                hold: new Howl({
                    src: ['sounds/' + CONFIG.AUDIO.SOUNDS.HOLD],
                    volume: CONFIG.AUDIO.SOUND_EFFECTS_VOLUME,
                    onloaderror: (id, err) => console.log('Error loading sound: hold', err)
                })
            };
            
            // Load background music
            this.music = new Howl({
                src: ['sounds/' + CONFIG.AUDIO.MUSIC],
                loop: true,
                volume: CONFIG.AUDIO.MUSIC_VOLUME,
                onloaderror: (id, err) => console.log('Error loading background music', err)
            });
            
            this.initialized = true;
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
            this.createDummySounds();
        }
    }
    
    /**
     * Create dummy sounds if loading fails
     */
    createDummySounds() {
        console.log('Using dummy sounds - no audio will play');
        
        // Create dummy sound methods
        const dummySound = {
            play: function() { return this; },
            stop: function() { return this; },
            playing: function() { return false; }
        };
        
        // Set up dummy sound effects
        this.sounds = {
            move: dummySound,
            rotate: dummySound,
            drop: dummySound,
            lineClear: dummySound,
            singleClear: dummySound,
            doubleClear: dummySound,
            tripleClear: dummySound,
            tetris: dummySound,
            levelUp: dummySound,
            gameOver: dummySound,
            lock: dummySound,
            hold: dummySound
        };
        
        // Create dummy music
        this.music = {
            play: function() { return this; },
            stop: function() { return this; },
            playing: function() { return false; }
        };
        
        this.initialized = true;
    }
    
    /**
     * Play a sound effect
     * @param {String} soundName - Name of the sound to play
     */
    play(soundName) {
        if (this.isMuted || !this.initialized || !this.sounds[soundName]) {
            return;
        }
        
        try {
            this.sounds[soundName].play();
        } catch (error) {
            console.error('Error playing sound:', soundName, error);
        }
    }
    
    /**
     * Play background music
     */
    playMusic() {
        if (this.isMuted || !this.initialized || !this.music) {
            return;
        }
        
        try {
            if (!this.music.playing()) {
                this.music.play();
            }
        } catch (error) {
            console.error('Error playing music:', error);
        }
    }
    
    /**
     * Stop background music
     */
    stopMusic() {
        if (!this.initialized || !this.music) {
            return;
        }
        
        try {
            if (this.music.playing()) {
                this.music.stop();
            }
        } catch (error) {
            console.error('Error stopping music:', error);
        }
    }
    
    /**
     * Toggle mute state
     * @returns {Boolean} - New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        try {
            if (this.isMuted) {
                Howler.volume(0);
                this.stopMusic();
            } else {
                Howler.volume(CONFIG.AUDIO.MASTER_VOLUME);
                this.playMusic();
            }
        } catch (error) {
            console.error('Error toggling mute:', error);
        }
        
        return this.isMuted;
    }
    
    /**
     * Update music parameters based on level
     * @param {Number} level - Current game level
     */
    updateMusicForLevel(level) {
        if (this.isMuted || !this.initialized || !this.music) {
            return;
        }
        
        try {
            // Increase music speed based on level
            const rate = 1.0 + (level - 1) * 0.05; // Increase by 5% per level
            this.music.rate(Math.min(1.5, rate)); // Cap at 1.5x speed
        } catch (error) {
            console.error('Error updating music for level:', error);
        }
    }
}
