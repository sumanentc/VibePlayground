import pygame
import math
from ..utils.constants import (
    GROUND_Y, BLACK, WHITE, GRAVITY, JUMP_SPEED,
    SHADOW_COLOR, SHADOW_OFFSET, GROUND_THICKNESS
)

class Sheep:
    def __init__(self, x=80, y=None):  # Default x position at 80
        self.x = x
        self.width = 44  # Good width for sheep
        self.height = 40  # Shorter for sheep proportions
        self.y = GROUND_Y - self.height if y is None else y
        self.velocity_y = 0
        self.is_jumping = False
        self.jumps_left = 2
        self.rect = pygame.Rect(x, self.y, self.width - 14, self.height)  # Smaller hitbox
        
        # Animation settings
        self.leg_frame = 0
        self.leg_animation_speed = 0.25  # Bouncier for sheep-like movement
        self.leg_positions = [
            # Each position is [left_leg_y, right_leg_y]
            [0, 4],     # Right leg forward
            [1, 2],     # Transition
            [2, 0],     # Even
            [4, 0],     # Left leg forward
            [2, 1],     # Transition
            [0, 2],     # Even
        ]

    def jump(self):
        if self.jumps_left > 0:
            # If this is the second jump (mid-air), make it a bit weaker
            if self.is_jumping:
                self.velocity_y = JUMP_SPEED * 0.8  # Slightly weaker for double jump
            else:
                self.velocity_y = JUMP_SPEED
                self.is_jumping = True
            
            self.jumps_left -= 1
            return True
        return False

    def update(self):
        # Apply gravity
        self.velocity_y += GRAVITY
        self.y += self.velocity_y
        
        # Ground collision
        if self.y >= GROUND_Y - self.height:
            self.y = GROUND_Y - self.height
            self.velocity_y = 0
            self.is_jumping = False
            self.jumps_left = 2
            # Update leg animation when on ground
            self.leg_frame = (self.leg_frame + self.leg_animation_speed) % len(self.leg_positions)
        
        # Update collision rect
        self.rect.x = int(self.x + 5)  # Adjust hitbox to be slightly inset
        self.rect.y = int(self.y)

    def draw(self, screen):
        # Fluffy body
        body_width = self.width - 8
        body_height = self.height - 12
        body_rect = pygame.Rect(self.x + 4, self.y + 8, body_width, body_height)
        pygame.draw.rect(screen, BLACK, body_rect, border_radius=15)
        
        # Wool texture (small circles around the body)
        for i in range(4):
            for j in range(2):
                wool_x = self.x + 8 + (i * 10)
                wool_y = self.y + 12 + (j * 10)
                pygame.draw.circle(screen, WHITE, (wool_x, wool_y), 4)
        
        # Cute head
        head_width = 20
        head_height = 18
        head_x = self.x + self.width - 16
        head_y = self.y + 4
        pygame.draw.rect(screen, BLACK, (head_x, head_y, head_width, head_height), border_radius=8)
        
        # Ears
        ear_width = 8
        ear_height = 12
        # Left ear
        pygame.draw.ellipse(screen, BLACK, (head_x + 2, head_y - 6, ear_width, ear_height))
        # Right ear
        pygame.draw.ellipse(screen, BLACK, (head_x + 10, head_y - 6, ear_width, ear_height))
        
        # Face details
        # Eyes
        eye_y = head_y + 6
        # Left eye
        pygame.draw.circle(screen, WHITE, (head_x + 6, eye_y), 3)
        pygame.draw.circle(screen, BLACK, (head_x + 6, eye_y), 2)
        # Right eye
        pygame.draw.circle(screen, WHITE, (head_x + 14, eye_y), 3)
        pygame.draw.circle(screen, BLACK, (head_x + 14, eye_y), 2)
        
        # Nose
        nose_x = head_x + head_width - 4
        nose_y = head_y + 10
        pygame.draw.circle(screen, BLACK, (nose_x, nose_y), 3)
        
        # Get current leg positions
        frame_index = int(self.leg_frame) % len(self.leg_positions)
        left_leg_y, right_leg_y = self.leg_positions[frame_index]
        
        # Cute stubby legs
        leg_thickness = 4
        
        # Left legs (front and back)
        left_leg_start1 = (self.x + 10, self.y + self.height - 8)
        left_leg_end1 = (self.x + 8, self.y + self.height + left_leg_y)
        pygame.draw.line(screen, BLACK, left_leg_start1, left_leg_end1, leg_thickness)
        
        left_leg_start2 = (self.x + 20, self.y + self.height - 8)
        left_leg_end2 = (self.x + 18, self.y + self.height + left_leg_y)
        pygame.draw.line(screen, BLACK, left_leg_start2, left_leg_end2, leg_thickness)
        
        # Right legs (front and back)
        right_leg_start1 = (self.x + self.width - 20, self.y + self.height - 8)
        right_leg_end1 = (self.x + self.width - 22, self.y + self.height + right_leg_y)
        pygame.draw.line(screen, BLACK, right_leg_start1, right_leg_end1, leg_thickness)
        
        right_leg_start2 = (self.x + self.width - 10, self.y + self.height - 8)
        right_leg_end2 = (self.x + self.width - 12, self.y + self.height + right_leg_y)
        pygame.draw.line(screen, BLACK, right_leg_start2, right_leg_end2, leg_thickness)
        
        # Shadow
        shadow_y = GROUND_Y - SHADOW_OFFSET
        shadow_width = self.width * 0.7
        shadow_height = 10
        shadow_x = self.x + (self.width - shadow_width)/2
        pygame.draw.ellipse(screen, SHADOW_COLOR, 
                          (shadow_x, shadow_y, shadow_width, shadow_height))

    def reset(self):
        """Reset sheep to initial position"""
        self.y = GROUND_Y - self.height
        self.velocity_y = 0
        self.jumps_left = 2
        self.is_jumping = False
        self.rect.y = int(self.y)  # Update collision box
        self.leg_frame = 0
