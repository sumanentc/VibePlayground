import pygame
import random
import math
from .constants import (
    DUST_COLORS, DUST_PARTICLE_LIFETIME, DUST_PARTICLE_SIZE,
    DUST_SPAWN_RATE, JUMP_PARTICLE_COUNT, GROUND_Y
)

class Particle:
    def __init__(self, x, y, dx, dy, color, lifetime=DUST_PARTICLE_LIFETIME):
        self.x = x
        self.y = y
        self.dx = dx * 0.5  # Slower particle movement to match game speed
        self.dy = dy * 0.5
        self.color = color
        self.lifetime = lifetime
        self.alpha = 255
        self.size = DUST_PARTICLE_SIZE
        self.alpha_decay = 255 / lifetime

    def update(self):
        self.x += self.dx
        self.y += self.dy
        self.dy += 0.1  # Gentle gravity effect
        self.lifetime -= 1
        self.alpha = max(0, self.alpha - self.alpha_decay)
        return self.lifetime > 0

    def draw(self, screen):
        if self.alpha > 0:
            surface = pygame.Surface((self.size * 2, self.size * 2), pygame.SRCALPHA)
            color = (*self.color[:3], int(self.alpha))
            pygame.draw.circle(surface, color, (self.size, self.size), self.size)
            screen.blit(surface, (int(self.x - self.size), int(self.y - self.size)))

class ParticleSystem:
    def __init__(self):
        self.particles = []

    def add_run_particles(self, x, y):
        """Add dust particles when running"""
        if random.random() < 0.3:  # Only spawn particles sometimes
            color = random.choice(DUST_COLORS)
            dx = random.uniform(-0.2, 0.2)  # Gentler movement
            dy = random.uniform(-0.3, 0)
            particle = Particle(x, y, dx, dy, color)
            self.particles.append(particle)

    def add_jump_particles(self, x, y, color=None, count=None):
        """Add particles when jumping
        
        Args:
            x (int): X position
            y (int): Y position
            color (tuple, optional): RGB color tuple. If None, random colors will be used
            count (int, optional): Number of particles to spawn. If None, default count is used
        """
        particle_count = count if count is not None else JUMP_PARTICLE_COUNT
        
        for _ in range(particle_count):
            # Use provided color or random choice from dust colors
            particle_color = color if color is not None else random.choice(DUST_COLORS)
            angle = random.uniform(-30, 30)  # Focused downward spread
            speed = random.uniform(1, 2)
            dx = speed * math.cos(math.radians(angle))
            dy = speed * math.sin(math.radians(angle))
            particle = Particle(x, y + 10, dx, dy, particle_color)
            self.particles.append(particle)

    def add_land_particles(self, x, y):
        """Add particles when landing"""
        for _ in range(JUMP_PARTICLE_COUNT * 2):
            color = random.choice(DUST_COLORS)
            angle = random.uniform(-150, -30)  # Upward spread
            speed = random.uniform(1, 3)
            dx = speed * math.cos(math.radians(angle))
            dy = speed * math.sin(math.radians(angle))
            particle = Particle(x, y, dx, dy, color, lifetime=20)
            self.particles.append(particle)

    def update(self):
        self.particles = [p for p in self.particles if p.update()]

    def draw(self, screen):
        for particle in self.particles:
            particle.draw(screen)
