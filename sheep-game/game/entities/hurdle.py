import pygame
import random
from ..utils.constants import (
    GROUND_Y, BLACK, SHADOW_COLOR, SHADOW_OFFSET
)

class Hurdle:
    TYPES = {
        'low': {'height': 30, 'width': 30, 'points': 5},
        'normal': {'height': 40, 'width': 30, 'points': 10},
        'high': {'height': 50, 'width': 30, 'points': 15},
        'double': {'height': 40, 'width': 50, 'points': 20}  # Two hurdles close together
    }

    def __init__(self, x):
        # Randomly choose hurdle type with weights
        self.type = random.choices(
            list(self.TYPES.keys()),
            weights=[0.3, 0.4, 0.2, 0.1],  # Low, Normal, High, Double probabilities
            k=1
        )[0]
        
        self.specs = self.TYPES[self.type]
        self.x = x
        self.width = self.specs['width']
        self.height = self.specs['height']
        self.points = self.specs['points']
        self.y = GROUND_Y - self.height
        
        # Adjust collision box based on type
        if self.type == 'double':
            self.rect = pygame.Rect(x + 5, self.y, self.width - 10, self.height)
        else:
            self.rect = pygame.Rect(x + 5, self.y, self.width - 10, self.height)

    def update(self, speed):
        self.x -= speed
        self.rect.x = self.x + 5

    def draw(self, screen):
        # Draw shadow
        shadow_points = [
            (int(self.x + SHADOW_OFFSET), GROUND_Y - 5),
            (int(self.x + self.width + SHADOW_OFFSET), GROUND_Y - 5),
            (int(self.x + self.width), GROUND_Y - 10),
            (int(self.x), GROUND_Y - 10)
        ]
        pygame.draw.polygon(screen, SHADOW_COLOR, shadow_points, 0)
        
        if self.type == 'double':
            self._draw_double_hurdle(screen)
        else:
            self._draw_single_hurdle(screen)

    def _draw_single_hurdle(self, screen):
        pole_thickness = 3
        crossbar_height = self.height - 10  # Height from ground
        
        # Left pole
        pygame.draw.rect(screen, BLACK, 
                        (self.x + 5, 
                         self.y + (self.height - crossbar_height), 
                         pole_thickness, 
                         crossbar_height))
        
        # Right pole
        pygame.draw.rect(screen, BLACK, 
                        (self.x + self.width - 8, 
                         self.y + (self.height - crossbar_height), 
                         pole_thickness, 
                         crossbar_height))
        
        # Top bar
        pygame.draw.rect(screen, BLACK, 
                        (self.x, 
                         self.y + (self.height - crossbar_height), 
                         self.width, 
                         pole_thickness))
        
        # Base supports
        base_width = 8
        # Left base
        pygame.draw.polygon(screen, BLACK, [
            (self.x + 5, GROUND_Y),  # Bottom left
            (self.x + 5 + base_width, GROUND_Y),  # Bottom right
            (self.x + 6.5, GROUND_Y - 10)  # Top
        ])
        # Right base
        pygame.draw.polygon(screen, BLACK, [
            (self.x + self.width - 8 - base_width, GROUND_Y),  # Bottom left
            (self.x + self.width - 8, GROUND_Y),  # Bottom right
            (self.x + self.width - 8, GROUND_Y - 10)  # Top
        ])

    def _draw_double_hurdle(self, screen):
        # Draw two hurdles close together
        original_width = self.width
        spacing = 20  # Space between hurdles
        
        # Temporarily adjust width for first hurdle
        self.width = (original_width - spacing) // 2
        self._draw_single_hurdle(screen)
        
        # Move x and draw second hurdle
        self.x += self.width + spacing
        self._draw_single_hurdle(screen)
        
        # Restore original position and width
        self.x -= self.width + spacing
        self.width = original_width
