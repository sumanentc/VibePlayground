// Simple script to generate sound files for Tetris
const fs = require('fs');

// Function to create a simple tone file (raw PCM data)
function generateTone(filename, frequency, duration, volume = 0.5, sampleRate = 44100) {
    console.log(`Generating ${filename} with frequency ${frequency}Hz for ${duration}s`);
    
    // Calculate total samples
    const totalSamples = Math.floor(duration * sampleRate);
    
    // Create buffer for stereo 16-bit PCM
    const buffer = Buffer.alloc(totalSamples * 4); // 2 bytes per sample, 2 channels
    
    // Generate simple sine wave
    for (let i = 0; i < totalSamples; i++) {
        // Calculate sine value for this sample
        const t = i / sampleRate;
        
        // Apply ADSR envelope
        let envelopeValue = 1.0;
        const attackTime = 0.01; // 10ms - quick attack for responsive feedback
        const decayTime = 0.05; // 50ms
        const sustainLevel = 0.7;
        const releaseTime = 0.15; // 150ms
        
        if (t < attackTime) {
            envelopeValue = t / attackTime; // Linear attack
        } else if (t < attackTime + decayTime) {
            envelopeValue = 1.0 - (1.0 - sustainLevel) * (t - attackTime) / decayTime;
        } else if (t < duration - releaseTime) {
            envelopeValue = sustainLevel;
        } else {
            envelopeValue = sustainLevel * (1.0 - (t - (duration - releaseTime)) / releaseTime);
        }
        
        // Calculate the basic tone value
        let value = Math.sin(2 * Math.PI * frequency * t);
        
        // Add harmonics for richness (different for each sound type)
        if (filename.includes('move')) {
            // Left/right movement - quick arcade bleep with slight pitch up
            value = Math.sin(2 * Math.PI * (frequency + t * 80) * t); // Rising pitch
            value += 0.3 * Math.sin(2 * Math.PI * frequency * 2 * t); // Higher harmonic
        } else if (filename.includes('rotate')) {
            // Rotation sound - arcade-style "blip" with harmonics
            value = Math.sin(2 * Math.PI * frequency * t);
            value += 0.4 * Math.sin(2 * Math.PI * frequency * 1.5 * t); // Perfect fifth
            value += 0.2 * Math.sin(2 * Math.PI * frequency * 2 * t); // Octave
            
            // Add slight pitch bend
            const pitchBend = 50; // Hz
            value += 0.3 * Math.sin(2 * Math.PI * (frequency + pitchBend * t) * t);
        } else if (filename.includes('drop')) {
            // Add sub-bass and slight distortion
            value += 0.4 * Math.sin(2 * Math.PI * frequency * 0.5 * t);
            value = Math.tanh(value * 1.2) * 0.8; // Soft clipping for subtle distortion
        } else if (filename.includes('lock')) {
            // Add sub-bass and slight distortion
            value += 0.4 * Math.sin(2 * Math.PI * frequency * 0.5 * t);
            value = Math.tanh(value * 1.2) * 0.8; // Soft clipping for subtle distortion
        } else if (filename.includes('clear')) {
            // Add chord-like harmonics
            value += 0.3 * Math.sin(2 * Math.PI * frequency * 1.25 * t); // Major third
            value += 0.2 * Math.sin(2 * Math.PI * frequency * 1.5 * t);  // Perfect fifth
        } else if (filename.includes('level_up')) {
            // Level up - ascending arpeggio with echo
            const time = t % (duration / 4);
            const step = Math.floor(t / (duration / 4));
            const freqMultiplier = [1, 1.25, 1.5, 2][step];
            value = Math.sin(2 * Math.PI * frequency * freqMultiplier * time);
            
            // Add echo
            if (t > 0.1) {
                value += 0.3 * Math.sin(2 * Math.PI * frequency * freqMultiplier * (time - 0.1));
            }
        } else if (filename.includes('game_over')) {
            // Game over - sad descending pattern
            const time = t % (duration / 3);
            const step = Math.floor(t / (duration / 3));
            const freqMultiplier = [1, 0.75, 0.5][step];
            value = Math.sin(2 * Math.PI * frequency * freqMultiplier * time);
            // Add minor chord
            value += 0.4 * Math.sin(2 * Math.PI * frequency * freqMultiplier * 1.2 * time);
            value += 0.3 * Math.sin(2 * Math.PI * frequency * freqMultiplier * 1.5 * time);
        } else if (filename.includes('hold')) {
            // Hold sound - quick up-down sweep
            value = Math.sin(2 * Math.PI * (frequency + 100 * Math.sin(Math.PI * t / duration)) * t);
        }
        
        // Apply the envelope
        value *= envelopeValue * volume;
        
        // Prevent clipping
        value = Math.max(-0.9, Math.min(0.9, value));
        
        // Convert to 16-bit
        const sample = Math.floor(value * 32767);
        
        // Write to buffer (stereo)
        buffer.writeInt16LE(sample, i * 4);
        buffer.writeInt16LE(sample, i * 4 + 2);
    }
    
    // Write to file
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
}

// Function to generate a simple background music loop
function generateBackgroundMusic(filename, duration = 8, volume = 0.4, sampleRate = 44100) {
    console.log(`Generating ${filename} with duration ${duration}s`);
    
    // Calculate total samples
    const totalSamples = Math.floor(duration * sampleRate);
    
    // Create buffer for stereo 16-bit PCM
    const buffer = Buffer.alloc(totalSamples * 4); // 2 bytes per sample, 2 channels
    
    // Tetris theme inspired melody (simplified)
    const melody = [
        { note: 'E5', duration: 0.25 },
        { note: 'B4', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'D5', duration: 0.25 },
        { note: 'C5', duration: 0.125 },
        { note: 'B4', duration: 0.125 },
        { note: 'A4', duration: 0.25 },
        { note: 'A4', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'E5', duration: 0.25 },
        { note: 'D5', duration: 0.125 },
        { note: 'C5', duration: 0.125 },
        { note: 'B4', duration: 0.375 },
        { note: 'C5', duration: 0.125 },
        { note: 'D5', duration: 0.25 },
        { note: 'E5', duration: 0.25 },
        { note: 'C5', duration: 0.25 },
        { note: 'A4', duration: 0.25 },
        { note: 'A4', duration: 0.375 },
        { note: 'rest', duration: 0.125 }
    ];
    
    // Convert note names to frequencies
    const noteToFreq = {
        'A4': 440.00,
        'B4': 493.88,
        'C5': 523.25,
        'D5': 587.33,
        'E5': 659.25,
        'F5': 698.46,
        'G5': 783.99,
        'rest': 0
    };
    
    // Generate the melody with simple polyphony
    let currentTime = 0;
    for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        
        // Find current note in the melody
        let noteValue = 0;
        let melodyIndex = 0;
        let noteTime = 0;
        
        while (melodyIndex < melody.length) {
            const noteDuration = melody[melodyIndex].duration;
            if (t >= noteTime && t < noteTime + noteDuration) {
                // We're in this note's time window
                const note = melody[melodyIndex].note;
                if (note !== 'rest') {
                    const freq = noteToFreq[note];
                    const notePosition = (t - noteTime) / noteDuration;
                    
                    // Note envelope
                    let envelope = 1.0;
                    if (notePosition < 0.05) {
                        envelope = notePosition / 0.05; // Attack
                    } else if (notePosition > 0.8) {
                        envelope = (1.0 - notePosition) / 0.2; // Release
                    }
                    
                    // Add the note with slight vibrato
                    const vibrato = 4 * Math.sin(2 * Math.PI * 5 * t);
                    noteValue += envelope * 0.5 * Math.sin(2 * Math.PI * (freq + vibrato) * t);
                    
                    // Add harmonics
                    noteValue += envelope * 0.25 * Math.sin(2 * Math.PI * freq * 2 * t);
                    noteValue += envelope * 0.15 * Math.sin(2 * Math.PI * freq * 3 * t);
                }
                break;
            }
            noteTime += noteDuration;
            melodyIndex++;
            
            // Loop the melody
            if (melodyIndex >= melody.length) {
                melodyIndex = 0;
                noteTime = 0;
            }
        }
        
        // Add a simple bass line
        const bassLine = [
            { note: 'E3', duration: 0.5 },
            { note: 'E3', duration: 0.5 },
            { note: 'A3', duration: 0.5 },
            { note: 'A3', duration: 0.5 },
        ];
        
        // Bass frequencies (one octave lower)
        const bassToFreq = {
            'E3': 164.81,
            'A3': 220.00
        };
        
        // Add bass note
        let bassTime = 0;
        let bassIndex = 0;
        while (bassIndex < bassLine.length) {
            const bassDuration = bassLine[bassIndex].duration;
            if (t >= bassTime && t < bassTime + bassDuration) {
                const bassNote = bassLine[bassIndex].note;
                const bassFreq = bassToFreq[bassNote];
                const bassPosition = (t - bassTime) / bassDuration;
                
                // Bass envelope
                let envelope = 0.8;
                if (bassPosition < 0.1) {
                    envelope = bassPosition / 0.1; // Attack
                } else if (bassPosition > 0.7) {
                    envelope = (1.0 - bassPosition) / 0.3; // Release
                }
                
                noteValue += envelope * 0.3 * Math.sin(2 * Math.PI * bassFreq * t);
                break;
            }
            bassTime += bassDuration;
            bassIndex++;
            
            // Loop the bass line
            if (bassIndex >= bassLine.length) {
                bassIndex = 0;
                bassTime = 0;
            }
        }
        
        // Apply volume
        noteValue *= volume;
        
        // Prevent clipping
        noteValue = Math.max(-0.9, Math.min(0.9, noteValue));
        
        // Convert to 16-bit
        const sample = Math.floor(noteValue * 32767);
        
        // Write to buffer (stereo)
        buffer.writeInt16LE(sample, i * 4);
        buffer.writeInt16LE(sample, i * 4 + 2);
    }
    
    // Write to file
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
}

// Generate sound effects
console.log("Generating Tetris sound effects with arcade-style tones...");

// Movement sounds - classic arcade style
generateTone('move.mp3', 330, 0.06, 0.4); // Higher frequency for left/right movements
generateTone('rotate.mp3', 440, 0.08, 0.45); // Distinct rotation sound

// Action sounds - impactful
generateTone('drop.mp3', 180, 0.25, 0.5); // Deeper, more satisfying drop
generateTone('lock.mp3', 140, 0.2, 0.4); // Solid, defined thud
generateTone('hold.mp3', 440, 0.15, 0.4); // Brighter, more distinct

// Line clear sounds - different for each type of clear
generateTone('single_clear.mp3', 440, 0.3, 0.5); // Base clear sound
generateTone('double_clear.mp3', 523, 0.4, 0.6); // Higher, longer for double
generateTone('triple_clear.mp3', 659, 0.5, 0.7); // Even more impressive
generateTone('tetris.mp3', 880, 0.8, 0.8); // Longest and most exciting

// Game event sounds
generateTone('level_up.mp3', 440, 1.0, 0.6); // Multi-note fanfare
generateTone('game_over.mp3', 311, 1.2, 0.5); // More melodic sad ending

// Legacy sound for compatibility
generateTone('line_clear.mp3', 440, 0.3, 0.5); // Same as single clear for backward compatibility

// Generate background music
generateBackgroundMusic('background_music.mp3', 8, 0.5);

console.log("All sound effects and background music generated!");
