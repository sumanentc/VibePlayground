import pygame

# Screen settings
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 400

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
CLOUD_WHITE = (240, 240, 240)
GROUND_BROWN = (160, 120, 40)
GROUND_BROWN_DARK = (120, 80, 30)
SKY_BLUE = (135, 206, 235)  # Sky blue background
SKY_BLUE_DARK = (115, 166, 175)
DINO_COLOR = (83, 83, 83)  # Gray color for dino
CACTUS_GREEN = (34, 139, 34)  # Cactus color
CACTUS_GREEN_DARK = (14, 119, 14)  # Pre-calculated darker shade
DUST_COLORS = [
    (210, 180, 140, 255),  # Tan
    (188, 152, 126, 255),  # Light brown
    (169, 169, 169, 255),  # Dark gray
]

# Grass colors
GRASS_GREEN = (67, 160, 71)  # Medium green
GRASS_GREEN_DARK = (46, 125, 50)  # Darker green for patterns
GRASS_GREEN_LIGHT = (129, 199, 132)  # Lighter green for highlights

# Gradient colors
GRADIENT_TOP = (135, 206, 235)      # Sky blue
GRADIENT_MIDDLE = (200, 240, 255)   # Light sky
GRADIENT_BOTTOM = (210, 180, 140)   # Tan/sand color

# Shadow
SHADOW_COLOR = (0, 0, 0, 30)  # Semi-transparent black
SHADOW_OFFSET = 2  # Shadow offset in pixels

# Game constants
GROUND_Y = SCREEN_HEIGHT - 50  # Ground position
GRAVITY = 0.7  # Increased gravity for faster falling
INITIAL_GAME_SPEED = 4.0  # Slower initial speed
MAX_GAME_SPEED = 8.0  # Keep max speed as per user preference
SPEED_INCREMENT = 0.0002  # Keep gradual increase as per user preference
SPEED_MILESTONE = 1000  # Keep milestone spacing as per user preference
MIN_OBSTACLE_DISTANCE = 300  # Minimum distance between obstacles

# Jump constants
JUMP_SPEED = -13  # Stronger initial jump to compensate for gravity
DOUBLE_JUMP_MULTIPLIER = 1.0  # Full power for second jump
MAX_OBSTACLE_HEIGHT = 45  # Reduced height for easier jumping
MAX_FALL_SPEED = 4  # Increased fall speed
FLOAT_THRESHOLD = 0.3  # Point at which to start floating effect

# Visual constants
GROUND_THICKNESS = 20
CLOUD_FREQUENCY = 0.01  # Chance to spawn a new cloud each frame

# Rainbow colors for score popups
RAINBOW_COLORS = [
    (255, 0, 0),    # Red
    (255, 127, 0),  # Orange
    (255, 255, 0),  # Yellow
    (0, 255, 0),    # Green
    (0, 0, 255),    # Blue
    (75, 0, 130),   # Indigo
    (148, 0, 211)   # Violet
]

# Particle settings
DUST_PARTICLE_LIFETIME = 30  # Frames
DUST_PARTICLE_SIZE = 3
DUST_SPAWN_RATE = 2  # Particles per frame when running
JUMP_PARTICLE_COUNT = 5  # Particles when jumping
