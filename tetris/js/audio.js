/**
 * Audio manager for Tetris game
 * Uses either Web Audio API directly via the DirectSound system
 * for maximum compatibility across browsers
 */
class AudioManager {
    constructor(config) {
        this.config = config;
        this.sounds = {};
        this.music = null;
        this.musicEnabled = false;
        this.soundsEnabled = true;
        
        // Reference to our sound generator
        this.soundGenerator = null;
        
        // Set up audio context if available
        this.initialized = false;
        
        // Initialize sound system
        this.initSounds();
    }
    
    /**
     * Initialize sounds
     */
    initSounds() {
        // Use the DirectSound system for all sound effects
        // This is a more reliable approach that works in all browsers
        if (window.DirectSound) {
            this.soundGenerator = window.DirectSound;
            console.log('Direct Sound system detected and ready');
        } else {
            console.warn('DirectSound not available, no sound effects will play');
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} sound - Name of the sound effect to play
     */
    play(sound) {
        if (!this.soundsEnabled) return;
        
        try {
            if (this.soundGenerator) {
                this.soundGenerator.play(sound);
            }
        } catch (error) {
            console.error(`Error playing sound ${sound}:`, error);
        }
    }
    
    /**
     * Play sound for line clear based on number of lines
     * @param {number} lines - Number of lines cleared
     */
    playLineClear(lines) {
        if (!this.soundsEnabled) return;
        
        try {
            if (this.soundGenerator) {
                this.soundGenerator.playLineClear(lines);
            }
        } catch (error) {
            console.error(`Error playing line clear sound:`, error);
        }
    }
    
    /**
     * Play background music
     * For backward compatibility with the game engine
     */
    playMusic() {
        try {
            // Do NOT try to auto-play music as it will be blocked by browser policies
            // Just update internal state for compatibility with game engine
            // User will need to click the music button to actually start music
            this.musicEnabled = true;
            console.log('Music enabled (but not auto-playing due to browser restrictions)');
        } catch (error) {
            console.error('Error updating music state:', error);
        }
    }
    
    /**
     * Stop background music
     * For backward compatibility with the game engine
     */
    stopMusic() {
        try {
            const music = document.getElementById('background-music');
            if (!music) return;
            
            music.pause();
            this.musicEnabled = false;
            
            console.log('Background music stopped');
        } catch (error) {
            console.error('Error stopping music:', error);
        }
    }
    
    /**
     * Toggle background music on/off
     * @returns {boolean} - New state of music
     */
    toggleMusic() {
        try {
            const music = document.getElementById('background-music');
            if (!music) return false;
            
            this.musicEnabled = !this.musicEnabled;
            
            if (this.musicEnabled) {
                music.play().catch(error => {
                    console.error('Error starting music (probably due to autoplay restrictions):', error);
                    // We'll need user interaction to play music in modern browsers
                    this.musicEnabled = false;
                });
            } else {
                music.pause();
            }
            
            return this.musicEnabled;
        } catch (error) {
            console.error('Error toggling music:', error);
            return false;
        }
    }
    
    /**
     * Toggle sound effects on/off
     * @returns {boolean} - New state of sound effects
     */
    toggleSounds() {
        this.soundsEnabled = !this.soundsEnabled;
        if (this.soundGenerator) {
            this.soundGenerator.toggleMute();
        }
        return this.soundsEnabled;
    }
}

// Export
window.AudioManager = AudioManager;
