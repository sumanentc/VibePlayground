/**
 * In-browser sound effect generator for Tetris
 * Generates arcade-style sound effects without requiring external files
 */
class SoundGenerator {
    constructor() {
        // Initialize audio context
        this.audioContext = null;
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('Audio context created successfully');
        } catch (e) {
            console.error('Web Audio API not supported in this browser', e);
        }
        
        // Sound cache to avoid regenerating the same sounds
        this.soundCache = {};
    }
    
    /**
     * Generate and play a tone
     * @param {string} soundType - Type of sound to generate ('move', 'rotate', etc.)
     */
    play(soundType) {
        if (!this.audioContext) return;
        
        try {
            // Check if sound is already generated and cached
            if (this.soundCache[soundType]) {
                this.playCachedSound(soundType);
                return;
            }
            
            // Generate the sound based on type
            switch(soundType) {
                case 'move':
                    this.generateTone(200, 0.1, 0.1, 'square');
                    break;
                case 'rotate':
                    this.generateTone(300, 0.1, 0.15, 'square');
                    break;
                case 'drop':
                    this.generateTone(120, 0.15, 0.2, 'triangle');
                    break;
                case 'lineClear':
                case 'singleClear':
                    this.generateSweep(200, 400, 0.3, 0.3);
                    break;
                case 'doubleClear':
                    this.generateSweep(200, 500, 0.3, 0.4);
                    break;
                case 'tripleClear':
                    this.generateSweep(200, 600, 0.3, 0.5);
                    break;
                case 'tetris':
                    this.generateSweep(200, 800, 0.5, 0.6);
                    break;
                case 'levelUp':
                    this.generateArpeggio([300, 400, 500, 600], 0.1, 0.6);
                    break;
                case 'gameOver':
                    this.generateDescendingTones([400, 300, 200, 100], 0.15, 0.5);
                    break;
                case 'lock':
                    this.generateTone(250, 0.1, 0.2, 'sawtooth');
                    break;
                case 'hold':
                    this.generateTone(350, 0.1, 0.15, 'sine');
                    break;
                default:
                    this.generateTone(200, 0.1, 0.2, 'square');
            }
        } catch (error) {
            console.error(`Error generating sound: ${soundType}`, error);
        }
    }
    
    /**
     * Play a cached sound
     * @param {string} soundType - Type of sound to play
     */
    playCachedSound(soundType) {
        if (!this.soundCache[soundType]) return;
        
        // Create new source from cached buffer
        const source = this.audioContext.createBufferSource();
        source.buffer = this.soundCache[soundType];
        source.connect(this.audioContext.destination);
        source.start(0);
    }
    
    /**
     * Generate a simple tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} attackTime - Attack time in seconds
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     */
    generateTone(frequency, attackTime, duration, type = 'square') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Set oscillator parameters
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // Set envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Play sound
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    /**
     * Generate a frequency sweep (for line clears)
     * @param {number} startFreq - Starting frequency in Hz
     * @param {number} endFreq - Ending frequency in Hz
     * @param {number} attackTime - Attack time in seconds
     * @param {number} duration - Duration in seconds
     */
    generateSweep(startFreq, endFreq, attackTime, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Set oscillator parameters
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
        
        // Set envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Play sound
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    /**
     * Generate an arpeggio (for level up)
     * @param {Array<number>} frequencies - Array of frequencies to play in sequence
     * @param {number} noteTime - Duration of each note
     * @param {number} totalDuration - Total duration of the arpeggio
     */
    generateArpeggio(frequencies, noteTime, totalDuration) {
        if (!this.audioContext) return;
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.generateTone(freq, 0.01, noteTime, 'square');
            }, index * (totalDuration / frequencies.length) * 1000);
        });
    }
    
    /**
     * Generate descending tones (for game over)
     * @param {Array<number>} frequencies - Array of frequencies to play in sequence (high to low)
     * @param {number} noteTime - Duration of each note
     * @param {number} totalDuration - Total duration of the sequence
     */
    generateDescendingTones(frequencies, noteTime, totalDuration) {
        if (!this.audioContext) return;
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.generateTone(freq, 0.01, noteTime, 'sawtooth');
            }, index * (totalDuration / frequencies.length) * 1000);
        });
    }
    
    /**
     * Initialize the audio context with user interaction
     * This needs to be called in response to a user action (click, keypress, etc.)
     */
    initWithUserAction() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            console.log('Audio context resumed through user action');
        } else if (!this.audioContext) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                console.log('Audio context created through user action');
            } catch (e) {
                console.error('Web Audio API not supported in this browser', e);
            }
        }
    }
}
