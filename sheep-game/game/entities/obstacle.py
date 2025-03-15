import pygame
import random
from ..utils.constants import GROUND_Y, BLACK, WHITE

class Obstacle:
    def __init__(self, x):
        self.width = 20
        self.height = random.randint(30, 50)
        self.x = x
        self.y = GROUND_Y - self.height
        self.points = 10  # Base points for jumping over a hurdle
        self.rect = pygame.Rect(x, self.y, self.width, self.height)
        
        # Determine hurdle type and adjust points
        if self.height <= 35:  # Low hurdle
            self.points = 5
        elif self.height >= 45:  # High hurdle
            self.points = 20
            
        # Sometimes create a double hurdle
        self.is_double = random.random() < 0.3
        if self.is_double:
            self.width = 40
            self.points = 15
            self.rect.width = self.width

    def update(self, game_speed):
        self.x -= game_speed
        self.rect.x = int(self.x)

    def draw(self, screen):
        # Draw poles
        pole_width = 4
        if self.is_double:
            # First pole
            pygame.draw.rect(screen, BLACK,
                           (self.x, self.y,
                            pole_width, self.height))
            # Second pole
            pygame.draw.rect(screen, BLACK,
                           (self.x + self.width - pole_width, self.y,
                            pole_width, self.height))
            # Crossbar
            pygame.draw.rect(screen, BLACK,
                           (self.x, self.y,
                            self.width, pole_width))
        else:
            # Single hurdle
            pygame.draw.rect(screen, BLACK,
                           (self.x, self.y,
                            pole_width, self.height))
            pygame.draw.rect(screen, BLACK,
                           (self.x + self.width - pole_width, self.y,
                            pole_width, self.height))
            pygame.draw.rect(screen, BLACK,
                           (self.x, self.y,
                            self.width, pole_width))
