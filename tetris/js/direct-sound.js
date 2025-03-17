/**
 * Super simple sound system for Tetris
 * Uses the most basic Audio API approach for maximum browser compatibility
 */
const DirectSound = {
    // Is sound system initialized
    initialized: false,
    
    // Is sound muted
    muted: false,
    
    // Audio context
    context: null,
    
    /**
     * Initialize the sound system
     */
    init: function() {
        if (this.initialized) return;
        
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            this.initialized = true;
            console.log('DirectSound system initialized');
            
            // Play a test sound
            this.play('move');
        } catch (e) {
            console.error('Web Audio API not supported in this browser', e);
        }
    },
    
    /**
     * Play a sound effect
     * @param {string} name - Name of the sound effect to play
     */
    play: function(name) {
        if (this.muted || !this.initialized || !this.context) return;
        
        try {
            let frequency, duration, type;
            
            // Set parameters based on sound name
            switch(name) {
                case 'move':
                    frequency = 200;
                    duration = 0.1;
                    type = 'square';
                    break;
                case 'rotate':
                    frequency = 300;
                    duration = 0.1;
                    type = 'square';
                    break;
                case 'drop':
                    frequency = 120;
                    duration = 0.15;
                    type = 'triangle';
                    break;
                case 'lineClear':
                case 'singleClear':
                    this.playSweep(200, 400, 0.3);
                    return;
                case 'doubleClear':
                    this.playSweep(200, 500, 0.3);
                    return;
                case 'tripleClear':
                    this.playSweep(200, 600, 0.4);
                    return;
                case 'tetris':
                    this.playSweep(200, 800, 0.5);
                    return;
                case 'levelUp':
                    this.playArpeggio([300, 400, 500, 600], 0.1, 0.5);
                    return;
                case 'gameOver':
                    this.playArpeggio([400, 300, 200, 100], 0.15, 0.6);
                    return;
                case 'lock':
                    frequency = 250;
                    duration = 0.1;
                    type = 'sawtooth';
                    break;
                case 'hold':
                    frequency = 350;
                    duration = 0.1;
                    type = 'sine';
                    break;
                default:
                    frequency = 200;
                    duration = 0.1;
                    type = 'square';
            }
            
            // Play a simple tone
            this.playTone(frequency, duration, type);
            
        } catch (error) {
            console.error(`Error playing sound '${name}':`, error);
        }
    },
    
    /**
     * Play a simple tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     */
    playTone: function(frequency, duration, type) {
        if (!this.context) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.type = type || 'square';
            oscillator.frequency.value = frequency;
            oscillator.connect(gainNode);
            
            gainNode.connect(this.context.destination);
            gainNode.gain.value = 0.3; // Lower volume
            
            oscillator.start();
            oscillator.stop(this.context.currentTime + duration);
        } catch (e) {
            console.error('Error playing tone:', e);
        }
    },
    
    /**
     * Play a frequency sweep
     * @param {number} startFreq - Start frequency
     * @param {number} endFreq - End frequency
     * @param {number} duration - Duration in seconds
     */
    playSweep: function(startFreq, endFreq, duration) {
        if (!this.context) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(startFreq, this.context.currentTime);
            oscillator.frequency.linearRampToValueAtTime(endFreq, this.context.currentTime + duration);
            
            gainNode.gain.setValueAtTime(0.01, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.context.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.01, this.context.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start();
            oscillator.stop(this.context.currentTime + duration);
        } catch (e) {
            console.error('Error playing sweep:', e);
        }
    },
    
    /**
     * Play an arpeggio (sequence of notes)
     * @param {Array<number>} frequencies - Array of frequencies
     * @param {number} noteTime - Duration of each note
     * @param {number} totalTime - Total duration
     */
    playArpeggio: function(frequencies, noteTime, totalTime) {
        if (!this.context) return;
        
        try {
            frequencies.forEach((freq, i) => {
                setTimeout(() => {
                    this.playTone(freq, noteTime, 'square');
                }, i * (totalTime * 1000 / frequencies.length));
            });
        } catch (e) {
            console.error('Error playing arpeggio:', e);
        }
    },
    
    /**
     * Play line clear sound based on number of lines
     * @param {number} lines - Number of lines cleared
     */
    playLineClear: function(lines) {
        if (this.muted || !this.initialized) return;
        
        try {
            switch(lines) {
                case 1:
                    this.play('singleClear');
                    break;
                case 2:
                    this.play('doubleClear');
                    break;
                case 3:
                    this.play('tripleClear');
                    break;
                case 4:
                    this.play('tetris');
                    break;
                default:
                    this.play('lineClear');
            }
        } catch (error) {
            console.error(`Error playing line clear sound for ${lines} lines`, error);
        }
    },
    
    /**
     * Toggle mute state
     * @returns {boolean} - New mute state
     */
    toggleMute: function() {
        this.muted = !this.muted;
        return this.muted;
    }
};

// Make it globally accessible
window.DirectSound = DirectSound;
