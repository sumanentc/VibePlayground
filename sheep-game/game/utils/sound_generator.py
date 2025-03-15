import wave
import struct
import math
import os
import random

def generate_sound_effects():
    """Generate basic sound effects for the game"""
    sounds_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'sounds')
    
    # Create directory if it doesn't exist
    if not os.path.exists(sounds_dir):
        os.makedirs(sounds_dir)
    
    # Generate jump sound (ascending beep)
    create_jump_sound(os.path.join(sounds_dir, 'jump.wav'))
    
    # Generate double jump sound (higher-pitched ascending beep with echo)
    create_double_jump_sound(os.path.join(sounds_dir, 'double_jump.wav'))
    
    # Generate landing sound (soft thump)
    create_land_sound(os.path.join(sounds_dir, 'land.wav'))
    
    # Generate game over sound (descending sad tone)
    create_game_over_sound(os.path.join(sounds_dir, 'game_over.wav'))
    
    # Generate score milestone sound (happy jingle)
    create_milestone_sound(os.path.join(sounds_dir, 'milestone.wav'))
    
    # Generate click sound (UI interaction)
    create_click_sound(os.path.join(sounds_dir, 'click.wav'))
    
    # Generate score sound (simple beep)
    create_score_sound(os.path.join(sounds_dir, 'score.wav'))

def create_jump_sound(filename):
    """Create a simple jump sound effect"""
    # Audio parameters
    frequency = 600  # Hz
    duration = 0.2   # seconds
    sample_rate = 44100  # samples per second
    num_samples = int(duration * sample_rate)
    
    # Generate audio data
    samples = []
    for i in range(num_samples):
        t = i / sample_rate  # time in seconds
        freq = frequency + (1500 * t / duration)  # Increasing frequency
        sample = int(32767 * 0.5 * math.sin(2 * math.pi * freq * t))
        samples.append(sample)
    
    # Apply simple envelope (fade in/out)
    for i in range(num_samples):
        # Apply fade-in and fade-out
        fade_factor = min(i / (sample_rate * 0.05), (num_samples - i) / (sample_rate * 0.1), 1)
        samples[i] = int(samples[i] * fade_factor)
    
    # Save to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits) per sample
        wav_file.setframerate(sample_rate)
        
        # Convert samples to binary data
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

def create_double_jump_sound(filename):
    """Create a double jump sound effect (higher-pitched with echo)"""
    # Audio parameters
    frequency = 800  # Hz (higher than jump)
    duration = 0.25  # seconds
    sample_rate = 44100  # samples per second
    num_samples = int(duration * sample_rate)
    
    # Generate audio data
    samples = []
    for i in range(num_samples):
        t = i / sample_rate  # time in seconds
        freq = frequency + (2000 * t / duration)  # Steeper frequency increase
        sample = int(32767 * 0.6 * math.sin(2 * math.pi * freq * t))
        
        # Add harmonic for richer sound
        sample += int(16383 * 0.3 * math.sin(4 * math.pi * freq * t))
        
        samples.append(sample)
    
    # Add echo effect
    echo_delay = int(0.05 * sample_rate)  # 50ms delay
    echo_samples = samples.copy()
    
    # Extend the sample array to accommodate the echo
    samples.extend([0] * echo_delay)
    
    # Add echo with reduced volume
    for i in range(len(echo_samples)):
        if i + echo_delay < len(samples):
            samples[i + echo_delay] += int(echo_samples[i] * 0.4)  # Echo at 40% volume
    
    # Apply simple envelope (fade in/out)
    for i in range(len(samples)):
        # Limit to prevent clipping
        samples[i] = max(min(samples[i], 32767), -32767)
        
        # Apply fade-out at the end
        if i >= num_samples:
            fade_factor = 1.0 - ((i - num_samples) / echo_delay)
            samples[i] = int(samples[i] * max(0, fade_factor))
    
    # Save to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits) per sample
        wav_file.setframerate(sample_rate)
        
        # Convert samples to binary data
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

def create_land_sound(filename):
    """Create a landing sound effect (soft thump)"""
    # Audio parameters
    duration = 0.15  # seconds
    sample_rate = 44100  # samples per second
    num_samples = int(duration * sample_rate)
    
    # Generate noise audio data
    samples = []
    for i in range(num_samples):
        t = i / sample_rate  # time in seconds
        
        # Base frequency with quick decay
        freq = 150 * math.exp(-t * 20)
        sample = int(32767 * 0.8 * math.sin(2 * math.pi * freq * t))
        
        # Add some noise for the thump effect
        noise = random.randint(-8000, 8000) * math.exp(-t * 30)
        sample += int(noise)
        
        # Limit sample value
        sample = max(min(sample, 32767), -32767)
        samples.append(sample)
    
    # Apply volume envelope (quick attack, slow decay)
    for i in range(num_samples):
        t = i / sample_rate
        envelope = math.exp(-t * 15)  # Exponential decay
        samples[i] = int(samples[i] * envelope)
    
    # Save to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits) per sample
        wav_file.setframerate(sample_rate)
        
        # Convert samples to binary data
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

def create_game_over_sound(filename):
    """Create a game over sound effect (descending sad tone)"""
    # Audio parameters
    duration = 0.8  # seconds
    sample_rate = 44100  # samples per second
    num_samples = int(duration * sample_rate)
    
    # Generate audio data
    samples = []
    for i in range(num_samples):
        t = i / sample_rate  # time in seconds
        
        # Descending frequency
        freq = 600 - (400 * t / duration)
        
        # Main tone
        sample = int(32767 * 0.5 * math.sin(2 * math.pi * freq * t))
        
        # Add secondary lower tone for richness
        sample += int(16383 * 0.3 * math.sin(2 * math.pi * (freq/2) * t))
        
        # Add slight tremolo effect for sadness
        tremolo = 0.1 * math.sin(2 * math.pi * 8 * t)
        sample = int(sample * (1.0 + tremolo))
        
        # Limit sample value
        sample = max(min(sample, 32767), -32767)
        samples.append(sample)
    
    # Apply volume envelope
    for i in range(num_samples):
        t = i / sample_rate
        
        # Slow fade-in, longer fade-out
        if t < 0.1:
            envelope = t / 0.1  # Fade in
        else:
            envelope = 1.0 - ((t - 0.1) / (duration - 0.1))  # Fade out
            
        samples[i] = int(samples[i] * envelope)
    
    # Save to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits) per sample
        wav_file.setframerate(sample_rate)
        
        # Convert samples to binary data
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

def create_milestone_sound(filename):
    """Create a score milestone sound effect (happy jingle)"""
    # Audio parameters
    duration = 0.7  # seconds
    sample_rate = 44100  # samples per second
    num_samples = int(duration * sample_rate)
    
    # Notes in the jingle (frequencies in Hz)
    notes = [
        (0.0, 523.25),  # C5 - start immediately
        (0.15, 659.25),  # E5 - after 150ms
        (0.3, 783.99),   # G5 - after 300ms
        (0.45, 1046.50)  # C6 - after 450ms
    ]
    
    # Generate audio data
    samples = [0] * num_samples
    
    # Add each note to the samples
    for start_time, freq in notes:
        note_duration = 0.3  # Each note lasts 300ms
        note_start_sample = int(start_time * sample_rate)
        note_samples = int(note_duration * sample_rate)
        
        for i in range(note_samples):
            if note_start_sample + i < num_samples:
                t = i / sample_rate  # time in seconds
                
                # Note with slight decay
                amplitude = 0.5 * math.exp(-t * 2)
                note_sample = int(32767 * amplitude * math.sin(2 * math.pi * freq * t))
                
                # Add to existing samples
                samples[note_start_sample + i] += note_sample
    
    # Limit samples to prevent clipping
    for i in range(num_samples):
        samples[i] = max(min(samples[i], 32767), -32767)
    
    # Save to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits) per sample
        wav_file.setframerate(sample_rate)
        
        # Convert samples to binary data
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

def create_click_sound(filename):
    """Create a UI click sound effect"""
    # Audio parameters
    duration = 0.07  # seconds (very short)
    sample_rate = 44100  # samples per second
    num_samples = int(duration * sample_rate)
    
    # Generate audio data
    samples = []
    for i in range(num_samples):
        t = i / sample_rate  # time in seconds
        
        # Simple tone with fast decay
        freq = 1000
        amplitude = 0.7 * math.exp(-t * 60)  # Fast decay
        sample = int(32767 * amplitude * math.sin(2 * math.pi * freq * t))
        
        samples.append(sample)
    
    # Save to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits) per sample
        wav_file.setframerate(sample_rate)
        
        # Convert samples to binary data
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

def create_score_sound(filename):
    """Create a simple score increment sound"""
    # Audio parameters
    duration = 0.1  # seconds (very short)
    sample_rate = 44100  # samples per second
    num_samples = int(duration * sample_rate)
    
    # Generate audio data
    samples = []
    for i in range(num_samples):
        t = i / sample_rate  # time in seconds
        
        # Quick rising tone
        freq = 800 + (400 * t / duration)
        amplitude = 0.3 * (1 - t/duration)  # Fade out
        sample = int(32767 * amplitude * math.sin(2 * math.pi * freq * t))
        
        samples.append(sample)
    
    # Save to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits) per sample
        wav_file.setframerate(sample_rate)
        
        # Convert samples to binary data
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

if __name__ == "__main__":
    generate_sound_effects()
