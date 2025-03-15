import pygame
import random
import math
from ..utils.constants import SCREEN_HEIGHT

class Cloud:
    def __init__(self, x):
        self.x = x
        self.y = random.randint(50, SCREEN_HEIGHT // 3 - 20)  # Keep clouds in upper part of screen
        
        # Just 3 circles in a line
        self.radius = random.randint(15, 25)
        
        # Simple vertical drift
        self.drift_counter = random.uniform(0, 6.28)
        self.drift_speed = random.uniform(0.01, 0.02)
        self.drift_amount = random.uniform(0.5, 1.0)
        self.y_offset = 0

    def update(self, game_speed):
        self.x -= game_speed * 0.5  # Clouds move slower than obstacles
        
        # Subtle vertical movement
        self.drift_counter += self.drift_speed
        self.y_offset = math.sin(self.drift_counter) * self.drift_amount

    def draw(self, screen):
        # Draw exactly 3 white circles in a line to represent a cloud
        pygame.draw.circle(screen, (255, 255, 255), (int(self.x), int(self.y + self.y_offset)), self.radius)
        pygame.draw.circle(screen, (255, 255, 255), (int(self.x + self.radius*1.2), int(self.y + self.y_offset)), int(self.radius*0.8))
        pygame.draw.circle(screen, (255, 255, 255), (int(self.x - self.radius*0.8), int(self.y + self.y_offset)), int(self.radius*0.9))
