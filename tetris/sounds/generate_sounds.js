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
        
        // Apply simple ADSR envelope for a more natural sound
        let envelopeValue = 1.0;
        const attackTime = 0.01; // 10ms
        const decayTime = 0.05; // 50ms
        const sustainLevel = 0.7;
        const releaseTime = 0.2; // 200ms
        
        if (t < attackTime) {
            envelopeValue = t / attackTime; // Linear attack
        } else if (t < attackTime + decayTime) {
            envelopeValue = 1.0 - (1.0 - sustainLevel) * (t - attackTime) / decayTime; // Linear decay
        } else if (t < duration - releaseTime) {
            envelopeValue = sustainLevel; // Sustain
        } else {
            envelopeValue = sustainLevel * (1.0 - (t - (duration - releaseTime)) / releaseTime); // Linear release
        }
        
        // Apply tremolo for some sounds (subtle variation in amplitude)
        if (filename.includes('tetris') || filename.includes('level_up')) {
            envelopeValue *= 1.0 + 0.2 * Math.sin(2 * Math.PI * 8 * t);
        }
        
        // Calculate the basic tone value
        let value = Math.sin(2 * Math.PI * frequency * t);
        
        // Add harmonics for richness (different for each sound type)
        if (filename.includes('move')) {
            // Add a bit of higher harmonic
            value += 0.3 * Math.sin(2 * Math.PI * frequency * 2 * t);
        } else if (filename.includes('rotate')) {
            // Add a bit of higher harmonic with slight detuning
            value += 0.2 * Math.sin(2 * Math.PI * frequency * 1.5 * t);
            value += 0.1 * Math.sin(2 * Math.PI * frequency * 2.01 * t);
        } else if (filename.includes('drop') || filename.includes('lock')) {
            // Add sub-bass and slight distortion
            value += 0.4 * Math.sin(2 * Math.PI * frequency * 0.5 * t);
            value = Math.tanh(value * 1.2) * 0.8; // Soft clipping for subtle distortion
        } else if (filename.includes('line_clear')) {
            // Add chord-like harmonics
            value += 0.3 * Math.sin(2 * Math.PI * frequency * 1.25 * t); // Major third
            value += 0.2 * Math.sin(2 * Math.PI * frequency * 1.5 * t);  // Perfect fifth
        } else if (filename.includes('single_clear')) {
            // Single line clear - simple rising tone
            value = Math.sin(2 * Math.PI * (frequency + t * 200) * t);
        } else if (filename.includes('double_clear')) {
            // Double line clear - two-note rising tone
            value = Math.sin(2 * Math.PI * (frequency + t * 300) * t) * 0.7;
            value += Math.sin(2 * Math.PI * (frequency * 1.5 + t * 300) * t) * 0.5;
        } else if (filename.includes('triple_clear')) {
            // Triple line clear - three-note arpeggio
            const arpFreq = t < duration/3 ? frequency : 
                          (t < 2*duration/3 ? frequency * 1.25 : frequency * 1.5);
            value = Math.sin(2 * Math.PI * arpFreq * t);
            // Add some chorus
            value += 0.2 * Math.sin(2 * Math.PI * arpFreq * 1.01 * t);
        } else if (filename.includes('tetris')) {
            // Tetris sound - chord with vibrato
            value = Math.sin(2 * Math.PI * frequency * t);
            value += 0.5 * Math.sin(2 * Math.PI * frequency * 1.25 * t);
            value += 0.3 * Math.sin(2 * Math.PI * frequency * 1.5 * t);
            
            // Add vibrato (frequency modulation)
            const vibratoDepth = 15; // Hz
            const vibratoRate = 8;  // Hz
            const vibrato = vibratoDepth * Math.sin(2 * Math.PI * vibratoRate * t);
            value += 0.5 * Math.sin(2 * Math.PI * (frequency + vibrato) * t);
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
    
    // Create WAV header
    const header = Buffer.alloc(44);
    
    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + buffer.length, 4);
    header.write('WAVE', 8);
    
    // FMT sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Sub-chunk size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(2, 22); // Stereo
    header.writeUInt32LE(sampleRate, 24); // Sample rate
    header.writeUInt32LE(sampleRate * 4, 28); // Byte rate
    header.writeUInt16LE(4, 32); // Block align
    header.writeUInt16LE(16, 34); // Bits per sample
    
    // Data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(buffer.length, 40);
    
    // Combine header and data
    const wavBuffer = Buffer.concat([header, buffer]);
    
    // Write to file
    fs.writeFileSync(filename, wavBuffer);
    console.log(`Created ${filename}`);
}

// Generate sound effects
console.log("Generating Tetris sound effects with more catchy tones...");

// Movement sounds - more electronic and responsive
generateTone('move.mp3', 220, 0.08, 0.3); // Quick, precise tick sound
generateTone('rotate.mp3', 330, 0.1, 0.35); // Higher, slightly longer

// Action sounds - more impactful
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

console.log("All catchy sound effects generated!");
