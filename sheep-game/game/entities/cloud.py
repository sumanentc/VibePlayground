import pygame
import random
from ..utils.constants import CLOUD_WHITE, SCREEN_HEIGHT

class Cloud:
    def __init__(self, x):
        self.width = random.randint(60, 100)
        self.height = random.randint(20, 30)
        self.x = x
        self.y = random.randint(50, SCREEN_HEIGHT // 3)  # Keep clouds in upper third of screen

    def update(self, game_speed):
        self.x -= game_speed * 0.5  # Clouds move slower than obstacles

    def draw(self, screen):
        # Draw main cloud body
        pygame.draw.ellipse(screen, CLOUD_WHITE, 
                          (self.x, self.y, self.width, self.height))
        
        # Draw additional puffs for more cloud-like appearance
        puff_radius = self.height // 2
        pygame.draw.circle(screen, CLOUD_WHITE, 
                         (int(self.x + self.width * 0.25), 
                          int(self.y + self.height * 0.5)), 
                         puff_radius)
        pygame.draw.circle(screen, CLOUD_WHITE, 
                         (int(self.x + self.width * 0.75), 
                          int(self.y + self.height * 0.5)), 
                         puff_radius)
