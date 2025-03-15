import pygame
import os

class SoundManager:
    def __init__(self):
        # Ensure pygame mixer is initialized
        if not pygame.mixer.get_init():
            pygame.mixer.init()
        
        # Sound effects storage
        self.sounds = {}
        self.music = None
        self.sound_enabled = True
        self.music_enabled = True
        
        # Load sound effects
        self.load_sounds()
    
    def load_sounds(self):
        """Load all sound effects"""
        sounds_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'sounds')
        
        # Create directory if it doesn't exist
        if not os.path.exists(sounds_dir):
            os.makedirs(sounds_dir)
        
        # Dictionary mapping sound names to file paths (to be implemented)
        sound_files = {
            'jump': os.path.join(sounds_dir, 'jump.wav'),
            'double_jump': os.path.join(sounds_dir, 'double_jump.wav'),
            'land': os.path.join(sounds_dir, 'land.wav'),
            'game_over': os.path.join(sounds_dir, 'game_over.wav'),
            'score': os.path.join(sounds_dir, 'score.wav'),
            'milestone': os.path.join(sounds_dir, 'milestone.wav'),
            'click': os.path.join(sounds_dir, 'click.wav'),
        }
        
        # Load each sound that exists
        for sound_name, sound_path in sound_files.items():
            # Check if file exists before loading
            if os.path.exists(sound_path):
                try:
                    self.sounds[sound_name] = pygame.mixer.Sound(sound_path)
                except:
                    print(f"Failed to load sound: {sound_path}")
    
    def play(self, sound_name, volume=1.0):
        """Play a sound effect by name if sound is enabled"""
        if not self.sound_enabled:
            return
            
        if sound_name in self.sounds:
            self.sounds[sound_name].set_volume(volume)
            self.sounds[sound_name].play()
    
    def toggle_sound(self):
        """Toggle sound effects on/off"""
        self.sound_enabled = not self.sound_enabled
        return self.sound_enabled
    
    def toggle_music(self):
        """Toggle background music on/off"""
        self.music_enabled = not self.music_enabled
        
        if self.music_enabled:
            if self.music:
                pygame.mixer.music.unpause()
        else:
            pygame.mixer.music.pause()
        
        return self.music_enabled
    
    def play_music(self, music_file):
        """Play background music if it exists and music is enabled"""
        if os.path.exists(music_file) and self.music_enabled:
            try:
                pygame.mixer.music.load(music_file)
                pygame.mixer.music.set_volume(0.5)  # Lower volume for background music
                pygame.mixer.music.play(-1)  # Loop indefinitely
                self.music = music_file
            except:
                print(f"Failed to play music: {music_file}")
