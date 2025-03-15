import pygame
import random
import math
from ..utils.constants import GROUND_Y

class Eagle:
    def __init__(self, x):
        self.width = 32  # Smaller width
        self.height = 25  # Smaller height
        self.x = x
        self.y = GROUND_Y - 100  # Eagles fly higher than hurdles
        self.points = 10  # Points for avoiding eagles
        self.rect = pygame.Rect(x, self.y, self.width - 10, self.height - 8)  # Smaller hitbox for fairness
        
        # Animation parameters
        self.wing_angle = 0
        self.wing_speed = random.uniform(0.15, 0.25)  # Random wing speed for variety
        self.bob_offset = 0
        self.bob_speed = random.uniform(0.05, 0.1)
        self.bob_amount = random.uniform(1.0, 3.0)
        
        # Random colors for variety - more natural browns for eagle body
        self.body_color = (random.randint(110, 140), random.randint(70, 100), random.randint(20, 50))
        self.wing_color = (random.randint(90, 120), random.randint(60, 80), random.randint(10, 40))
        self.beak_color = (random.randint(220, 255), random.randint(150, 190), random.randint(0, 30))  # Orange/yellow
        
        # Make some eagles white-headed (like bald eagles) - 30% chance
        self.has_white_head = random.random() < 0.3
        self.head_color = (random.randint(220, 255), random.randint(220, 255), random.randint(220, 255)) if self.has_white_head else self.body_color
        
        # Direction eagle is looking (can randomly face left sometimes)
        self.facing_right = random.random() < 0.8  # 80% face right

    def update(self, game_speed):
        self.x -= game_speed * 1.2  # Eagles move faster than normal obstacles
        
        # Update animation
        self.wing_angle = (self.wing_angle + self.wing_speed) % (2 * math.pi)
        self.bob_offset = math.sin(self.bob_speed * pygame.time.get_ticks() / 100) * self.bob_amount
        
        # Update hitbox
        self.rect.x = int(self.x) + 5  # Offset hitbox for better collision detection
        self.rect.y = int(self.y + self.bob_offset) + 3

    def draw(self, screen):
        # Apply bobbing motion for more natural flight
        y_pos = self.y + self.bob_offset
        
        # Draw the tail
        tail_width = 15
        tail_height = 10
        tail_points = [
            (int(self.x), int(y_pos + self.height//2)),
            (int(self.x - tail_width) if self.facing_right else int(self.x + self.width + tail_width), int(y_pos + self.height//2 - tail_height//2)),
            (int(self.x - tail_width + 4) if self.facing_right else int(self.x + self.width + tail_width - 4), int(y_pos + self.height//2)),
            (int(self.x - tail_width) if self.facing_right else int(self.x + self.width + tail_width), int(y_pos + self.height//2 + tail_height//2)),
        ]
        pygame.draw.polygon(screen, self.wing_color, tail_points)
        
        # Draw body - more elliptical/slim shape
        body_width = self.width
        body_height = self.height - 3  # Slightly reduced height
        x_draw = self.x if self.facing_right else self.x
        pygame.draw.ellipse(screen, self.body_color, 
                          (x_draw, y_pos + 2, body_width, body_height))
        
        # Draw head - smaller
        head_size = 12
        head_x = int(self.x + self.width - head_size//2) if self.facing_right else int(self.x - head_size//2)
        pygame.draw.circle(screen, self.head_color,
                         (head_x, int(y_pos + head_size//2)),
                         head_size//2)
        
        # Draw beak - smaller
        beak_length = 6
        beak_height = 3
        beak_x = head_x + head_size//2 if self.facing_right else head_x - head_size//2
        beak_points = [
            (beak_x, int(y_pos + head_size//2)),
            (beak_x + beak_length if self.facing_right else beak_x - beak_length, int(y_pos + head_size//2)),
            (beak_x, int(y_pos + head_size//2 + beak_height))
        ]
        pygame.draw.polygon(screen, self.beak_color, beak_points)
        
        # Draw wings with flapping animation - proportionally smaller
        wing_span = 35  # Smaller wingspan
        wing_height = 18
        wing_y_offset = int(12 * abs(math.sin(self.wing_angle)))
        
        # Calculate wing positions based on direction facing
        wing_x = self.x + 7 if self.facing_right else self.x + self.width - 7
        wing_x_tip = self.x - wing_span//2 if self.facing_right else self.x + self.width + wing_span//2
        
        # Left/rear wing (drawn first so it appears behind)
        rear_wing_points = [
            (int(wing_x), int(y_pos + self.height//2 + 4)),
            (int(wing_x_tip), int(y_pos + wing_y_offset + 8)),
            (int(wing_x + 4 if self.facing_right else wing_x - 4), int(y_pos + wing_height + 4))
        ]
        pygame.draw.polygon(screen, self.wing_color, rear_wing_points)
        
        # Right/front wing (drawn second so it appears in front)
        front_wing_points = [
            (int(wing_x), int(y_pos + self.height//2)),
            (int(wing_x_tip), int(y_pos + wing_y_offset)),
            (int(wing_x + 4 if self.facing_right else wing_x - 4), int(y_pos + wing_height))
        ]
        pygame.draw.polygon(screen, self.wing_color, front_wing_points)
        
        # Draw eyes
        eye_size = 2
        eye_x = head_x + 3 if self.facing_right else head_x - 3
        
        # White of eye
        pygame.draw.circle(screen, (255, 255, 255),
                         (eye_x, int(y_pos + head_size//2 - 1)),
                         eye_size)
        
        # Pupil (black)
        pupil_x = eye_x + 1 if self.facing_right else eye_x - 1
        pygame.draw.circle(screen, (0, 0, 0),
                         (pupil_x, int(y_pos + head_size//2 - 1)),
                         eye_size//2)
        
        # Sometimes add a cute blinking animation
        if random.random() < 0.02:  # 2% chance to blink each frame
            pygame.draw.line(screen, (0, 0, 0),
                           (eye_x - eye_size, int(y_pos + head_size//2 - 1)),
                           (eye_x + eye_size, int(y_pos + head_size//2 - 1)),
                           1)
        
        # Debug: Draw hitbox (uncomment for debugging collision)
        # pygame.draw.rect(screen, (255, 0, 0), self.rect, 1)
