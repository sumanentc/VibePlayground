import pygame
import random
import math
import sys
from .entities.sheep import Sheep
from .entities.obstacle import Obstacle
from .entities.cloud import Cloud
from .entities.eagle import Eagle
from .utils.particle import ParticleSystem
from .utils.sound_manager import SoundManager
from .utils.constants import (
    WHITE, BLACK, SKY_BLUE, GROUND_BROWN, GROUND_BROWN_DARK, GROUND_Y,
    INITIAL_GAME_SPEED, MAX_GAME_SPEED, SPEED_INCREMENT, MIN_OBSTACLE_DISTANCE,
    GROUND_THICKNESS, CLOUD_FREQUENCY, SCREEN_WIDTH, SCREEN_HEIGHT,
    GRADIENT_TOP, GRADIENT_MIDDLE, GRADIENT_BOTTOM, SHADOW_COLOR, SHADOW_OFFSET,
    GRASS_GREEN, GRASS_GREEN_DARK, GRASS_GREEN_LIGHT
)

class GameManager:
    def __init__(self, screen):
        self.screen = screen
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)
        self.game_started = False
        self.is_game_over = False
        self.is_paused = False
        self.score = 0
        self.jump_score = 0  # Points from successful jumps
        self.time_score = 0  # Points from survival time
        self.start_time = 0  # To track survival time
        self.game_speed = INITIAL_GAME_SPEED
        self.sheep = Sheep(80, GROUND_Y - 40)
        self.obstacles = []
        self.eagles = []  # New list for eagles
        self.clouds = []
        self.ground_pattern = []
        self.grass_tufts = []
        self.last_obstacle_x = self.screen.get_width()
        self.last_cloud_x = self.screen.get_width()
        self.time_since_last_point = 0
        
        # Initialize sound manager
        self.sound_manager = SoundManager()
        
        # Initialize ground pattern
        self.initialize_ground_pattern()
        
        # Add initial clouds
        for _ in range(3):
            x = random.randint(0, self.screen.get_width())
            self.clouds.append(Cloud(x))
        
        # Visual effects
        self.particle_system = ParticleSystem()
        self.score_popup_text = ""
        self.score_popup_timer = 0
        self.score_popup_pos = (0, 0)
        self.score_milestone = 100
        self.rainbow_color_index = 0
        self.rainbow_colors = [
            (255, 0, 0),    # Red
            (255, 127, 0),  # Orange
            (255, 255, 0),  # Yellow
            (0, 255, 0),    # Green
            (0, 0, 255),    # Blue
            (75, 0, 130),   # Indigo
            (148, 0, 211)   # Violet
        ]
        
        # Draw initial screen
        self.draw()
        pygame.display.flip()

    def start_game(self):
        """Start a new game"""
        self.game_started = True
        self.start_time = pygame.time.get_ticks()
        # Play click sound
        self.sound_manager.play('click')
        # Add first obstacle at a comfortable distance
        self.add_new_obstacle()

    def add_new_obstacle(self):
        """Add a new obstacle at the right edge of the screen"""
        if len(self.obstacles) == 0:
            x = self.screen.get_width()
        else:
            last_obstacle = self.obstacles[-1]
            x = last_obstacle.x + last_obstacle.width + MIN_OBSTACLE_DISTANCE
        
        new_obstacle = Obstacle(x)
        self.obstacles.append(new_obstacle)

    def add_new_eagle(self):
        """Add a new eagle obstacle"""
        # Generate a random height for the eagle
        # Eagles fly at different heights to be more challenging
        new_eagle = Eagle(self.screen.get_width())
        
        # Make the eagle's y position random between top of ground and half the screen height
        # This makes eagles more challenging as they can fly at different heights
        new_eagle.y = random.randint(GROUND_Y - 150, GROUND_Y - 70)
        new_eagle.rect.y = new_eagle.y
        
        self.eagles.append(new_eagle)

    def initialize_ground_pattern(self):
        """Initialize the pattern for ground decoration"""
        self.ground_pattern = []
        for x in range(0, self.screen.get_width() + 200, 20):
            if random.random() < 0.4:  # 40% chance for a pattern piece
                height = random.randint(3, 8)
                width = random.randint(5, 15)
                self.ground_pattern.append({
                    'x': x,
                    'height': height,
                    'width': width
                })
        
        # Add some grass tufts
        self.grass_tufts = []
        for x in range(0, self.screen.get_width() + 200, 15):
            if random.random() < 0.6:  # 60% chance for grass
                height = random.randint(5, 15)
                width = random.randint(2, 6)
                self.grass_tufts.append({
                    'x': x,
                    'height': height,
                    'width': width,
                    'color': random.choice([GRASS_GREEN, GRASS_GREEN_LIGHT, GRASS_GREEN_DARK])
                })

    def update_ground_pattern(self):
        """Update ground pattern positions and add new patterns as needed"""
        # Move patterns left
        for pattern in self.ground_pattern[:]:
            pattern['x'] -= self.game_speed
        
        # Remove patterns that are off screen
        self.ground_pattern = [p for p in self.ground_pattern if p['x'] + p['width'] > 0]
        
        # Add new patterns if needed
        while len(self.ground_pattern) < (self.screen.get_width() // 20) + 2:
            pattern = {
                'x': self.ground_pattern[-1]['x'] + 20,
                'width': 20,
                'height': random.randint(2, 5)
            }
            self.ground_pattern.append(pattern)

    def handle_event(self, event):
        """Handle pygame events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                if not self.game_started:
                    self.start_game()
                elif self.is_game_over:
                    self.reset_game()
                else:
                    if self.sheep.jump():
                        # Add points for jumping (5 points)
                        self.update_score(5)
                        
                        # Add different jump particles depending on if it's a double jump
                        jump_x = self.sheep.x + self.sheep.width//2
                        jump_y = self.sheep.y + self.sheep.height
                        
                        if self.sheep.jumps_left == 0:  # This was the second jump
                            # Play double jump sound
                            self.sound_manager.play('double_jump')
                            # Special particles for double jump
                            self.particle_system.add_jump_particles(
                                jump_x, jump_y, color=(255, 215, 0), count=15
                            )
                            # Show double jump score popup
                            self.show_score_popup("+5 DOUBLE!", jump_x, self.sheep.y - 30)
                        else:
                            # Play regular jump sound
                            self.sound_manager.play('jump')
                            # Regular jump particles
                            self.particle_system.add_jump_particles(
                                jump_x, jump_y
                            )
                            # Show score popup
                            self.show_score_popup("+5", jump_x, self.sheep.y - 20)
            elif event.key == pygame.K_p and self.game_started and not self.is_game_over:
                self.is_paused = not self.is_paused
                # Play click sound
                self.sound_manager.play('click')
            elif event.key == pygame.K_q:
                if not self.game_started:
                    # Quit the game when Q is pressed from the start menu
                    sys.exit()
                elif self.is_game_over or self.is_paused:
                    self.reset_game()
                    self.game_started = False
                    # Play click sound
                    self.sound_manager.play('click')
                else:
                    # Return to start menu
                    self.game_started = False
                    self.is_game_over = False
                    self.is_paused = False
                    self.score = 0
                    self.jump_score = 0
                    self.time_score = 0
                    self.game_speed = INITIAL_GAME_SPEED
                    self.sheep.reset()
                    self.obstacles = []
                    self.eagles = []
                    self.clouds = []
                    self.ground_pattern = []
                    self.grass_tufts = []
                    self.initialize_ground_pattern()
                    # Play click sound
                    self.sound_manager.play('click')
        
    def update(self):
        if not self.is_paused and self.game_started and not self.is_game_over:
            # Update game speed (maintain user's preferred pace)
            self.game_speed = min(self.game_speed + SPEED_INCREMENT, MAX_GAME_SPEED)
            
            # Update sheep and particles
            prev_is_jumping = self.sheep.is_jumping
            self.sheep.update()
            
            # Check if sheep just landed
            if prev_is_jumping and not self.sheep.is_jumping:
                # Play landing sound
                self.sound_manager.play('land')
                
            if not self.sheep.is_jumping:
                self.particle_system.add_run_particles(
                    self.sheep.x + self.sheep.width//2,
                    GROUND_Y - 5
                )
            self.particle_system.update()
            
            # Update ground pattern
            for rect in self.ground_pattern[:]:
                rect['x'] -= self.game_speed
                if rect['x'] + rect['width'] < 0:
                    self.ground_pattern.remove(rect)
            
            # Update grass tufts
            for tuft in self.grass_tufts[:]:
                tuft['x'] -= self.game_speed
                if tuft['x'] + tuft['width'] < 0:
                    self.grass_tufts.remove(tuft)
            
            # Generate new grass tufts if needed
            if len(self.grass_tufts) < 20:
                new_x = max([t['x'] + t['width'] for t in self.grass_tufts] + [0])
                for x in range(int(new_x), int(new_x) + 200, 15):
                    if random.random() < 0.6:  # 60% chance for grass
                        height = random.randint(5, 15)
                        width = random.randint(2, 6)
                        self.grass_tufts.append({
                            'x': x,
                            'height': height,
                            'width': width,
                            'color': random.choice([GRASS_GREEN, GRASS_GREEN_LIGHT, GRASS_GREEN_DARK])
                        })
            
            # Generate new ground pattern if needed
            if len(self.ground_pattern) < 5:
                new_x = max([r['x'] + r['width'] for r in self.ground_pattern] + [0])
                self.ground_pattern.append({
                    'x': new_x,
                    'width': 20,
                    'height': random.randint(2, 5)
                })
            
            # Update clouds
            self.update_clouds()
            
            # Update obstacles and check collisions
            if self.update_obstacles():
                return  # Collision occurred
            
            # Update eagles if score > 100
            self.update_eagles()
            
            # Check eagle collisions
            for eagle in self.eagles:
                if self.check_eagle_collision(eagle):
                    self.game_over()
                    return
            
            # Update time score (1 point per second)
            current_time = pygame.time.get_ticks()
            self.time_score = (current_time - self.start_time) // 1000
            self.score = self.jump_score + self.time_score
        
        # Update display
        pygame.display.flip()

    def update_eagles(self):
        """Update positions of eagles and generate new ones"""
        # Only spawn eagles if score is 100 or more
        if self.score >= 100:
            # Move existing eagles
            for eagle in self.eagles[:]:
                eagle.update(self.game_speed)
                if eagle.x + eagle.width < 0:
                    self.eagles.remove(eagle)
                    # Award points for successfully avoiding an eagle
                    self.update_score(10)
                    self.show_score_popup("+10", 
                                      self.screen.get_width()//2,
                                      GROUND_Y - 100)
            
            # Spawn new eagles based on score (higher score = more eagles)
            # Keep the spawn rate moderate to maintain the user's preference for indefinite play
            eagle_spawn_chance = min(0.005 + (self.score - 100) / 3000, 0.02)  # Caps at 2% per frame
            if random.random() < eagle_spawn_chance and len(self.eagles) < 2:  # Limit to 2 eagles at once
                self.add_new_eagle()

    def draw(self):
        # Fill background with smooth gradient
        self.draw_background_gradient()
        
        # Draw clouds with shadows
        for cloud in self.clouds:
            # Draw cloud
            cloud.draw(self.screen)
            
            # Skip shadows for clouds to avoid rectangular artifacts
            # Clouds look fine without shadows in the sky
        
        # Draw ground line with grass
        pygame.draw.rect(self.screen, GRASS_GREEN, 
                        (0, GROUND_Y, self.screen.get_width(), GROUND_THICKNESS))
        
        # Draw soil under grass
        pygame.draw.rect(self.screen, GROUND_BROWN, 
                        (0, GROUND_Y + 10, self.screen.get_width(), GROUND_THICKNESS - 10))
                        
        # Draw grass tufts
        for tuft in self.grass_tufts:
            # Draw shadow
            shadow_surface = pygame.Surface((tuft['width'], tuft['height']), pygame.SRCALPHA)
            shadow_surface.fill((0, 0, 0, 30))
            self.screen.blit(shadow_surface, 
                          (tuft['x'] + SHADOW_OFFSET, 
                           GROUND_Y - tuft['height'] + SHADOW_OFFSET))
            # Draw tuft
            pygame.draw.rect(self.screen, tuft['color'],
                          (tuft['x'], GROUND_Y - tuft['height'],
                           tuft['width'], tuft['height']))
        
        # Draw ground pattern with shadows (dirt/soil patches)
        for rect in self.ground_pattern:
            # Draw shadow (using semi-transparent surface)
            shadow_surface = pygame.Surface((rect['width'], rect['height']), pygame.SRCALPHA)
            shadow_surface.fill((0, 0, 0, 30))  # Semi-transparent black
            self.screen.blit(shadow_surface, 
                           (rect['x'] + SHADOW_OFFSET, 
                            GROUND_Y - rect['height'] + SHADOW_OFFSET))
            # Draw pattern as brown dirt patches in the grass
            pygame.draw.rect(self.screen, GROUND_BROWN_DARK,
                           (rect['x'], GROUND_Y - rect['height'],
                            rect['width'], rect['height']))
        
        # Draw obstacles with shadows
        for obstacle in self.obstacles:
            # Draw shadow (using semi-transparent surface)
            shadow_surface = pygame.Surface((obstacle.width, obstacle.height // 3), pygame.SRCALPHA)
            pygame.draw.ellipse(shadow_surface, (0, 0, 0, 30), 
                             (0, 0, obstacle.width, obstacle.height // 3))
            self.screen.blit(shadow_surface, 
                           (obstacle.x + SHADOW_OFFSET, GROUND_Y - SHADOW_OFFSET))
            # Draw obstacle
            obstacle.draw(self.screen)
        
        # Draw eagles with shadows
        for eagle in self.eagles:
            # Draw shadow (using semi-transparent surface)
            shadow_width = eagle.width * 0.8
            shadow_surface = pygame.Surface((int(shadow_width), 8), pygame.SRCALPHA)
            pygame.draw.ellipse(shadow_surface, (0, 0, 0, 30), 
                             (0, 0, int(shadow_width), 8))
            self.screen.blit(shadow_surface, 
                           (eagle.x + SHADOW_OFFSET, GROUND_Y - SHADOW_OFFSET))
            # Draw eagle
            eagle.draw(self.screen)
        
        # Draw particles
        self.particle_system.draw(self.screen)
        
        # Draw sheep
        self.sheep.draw(self.screen)
        
        # Draw game info
        self.draw_game_info()
        
        # Draw score with shadow effect
        score_x = 20
        score_y = 20
        score_text = f"Score: {self.score}"
        
        # Shadow text
        shadow_text = self.font.render(score_text, True, (50, 50, 50))  # Dark gray shadow
        self.screen.blit(shadow_text, (score_x + 2, score_y + 2))
        
        # Main text
        text = self.font.render(score_text, True, BLACK)
        self.screen.blit(text, (score_x, score_y))
        
        # Draw score popup if active
        if self.score_popup_timer > 0:
            self.score_popup_timer -= 1
            popup_color = self.rainbow_colors[self.rainbow_color_index]
            popup_text = self.font.render(self.score_popup_text, True, popup_color)
            # Move popup up as it fades
            popup_y_offset = int(30 * (1 - self.score_popup_timer / 60))
            self.screen.blit(popup_text, 
                            (self.score_popup_pos[0] - popup_text.get_width() // 2, 
                             self.score_popup_pos[1] - popup_y_offset))
        
        # Display warning about eagles when score is getting close to 100
        if 80 <= self.score < 100:
            warning_text = self.small_font.render("Eagles approaching at score 100!", True, (200, 0, 0))
            self.screen.blit(warning_text, (score_x, score_y + 30))
        
        # Draw game states
        if not self.game_started:
            self.draw_start_menu()
        elif self.is_game_over:
            self.draw_game_over()
        elif self.is_paused:
            self.draw_pause_menu()

    def draw_background_gradient(self):
        for i in range(self.screen.get_height()):
            progress = i / self.screen.get_height()
            if progress < 0.6:  # Sky gradient (top to middle)
                r = int(GRADIENT_TOP[0] + (GRADIENT_MIDDLE[0] - GRADIENT_TOP[0]) * (progress / 0.6))
                g = int(GRADIENT_TOP[1] + (GRADIENT_MIDDLE[1] - GRADIENT_TOP[1]) * (progress / 0.6))
                b = int(GRADIENT_TOP[2] + (GRADIENT_MIDDLE[2] - GRADIENT_TOP[2]) * (progress / 0.6))
                color = (r, g, b)
            else:  # Ground gradient (middle to bottom)
                ground_progress = (progress - 0.6) / 0.4
                r = int(GRADIENT_MIDDLE[0] + (GRADIENT_BOTTOM[0] - GRADIENT_MIDDLE[0]) * ground_progress)
                g = int(GRADIENT_MIDDLE[1] + (GRADIENT_BOTTOM[1] - GRADIENT_MIDDLE[1]) * ground_progress)
                b = int(GRADIENT_MIDDLE[2] + (GRADIENT_BOTTOM[2] - GRADIENT_MIDDLE[2]) * ground_progress)
                color = (r, g, b)
            pygame.draw.line(self.screen, color, (0, i), (self.screen.get_width(), i))

    def draw_start_menu(self):
        """Draw the start menu with pulsing title"""
        # Draw start menu with pulsing effect
        pulse = (math.sin(pygame.time.get_ticks() * 0.005) + 1) * 0.5
        title_size = 48 + int(pulse * 8)
        title_font = pygame.font.Font(None, title_size)
        
        title_text = title_font.render("Sheep Jump!", True, BLACK)
        start_text = self.font.render("SPACE: Start Game", True, BLACK)
        jump_text = self.font.render("SPACE: Double Jump!", True, BLACK)
        quit_text = self.font.render("Q: Quit Game", True, BLACK)
        
        title_rect = title_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 - 100))
        start_rect = start_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2))
        jump_rect = jump_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 + 40))
        quit_rect = quit_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 + 80))
        
        self.screen.blit(title_text, title_rect)
        self.screen.blit(start_text, start_rect)
        self.screen.blit(jump_text, jump_rect)
        self.screen.blit(quit_text, quit_rect)

    def draw_game_over(self):
        """Draw game over screen with fade effect"""
        overlay = pygame.Surface((self.screen.get_width(), self.screen.get_height()))
        overlay.fill((255, 255, 255))
        overlay.set_alpha(128)
        self.screen.blit(overlay, (0, 0))
        
        game_over_text = self.font.render("GAME OVER", True, BLACK)
        restart_text = self.font.render("Press SPACE to restart", True, BLACK)
        final_score_text = self.font.render(f"Final Score: {self.score}", True, BLACK)
        menu_text = self.font.render("Q: Return to Menu", True, BLACK)
        
        game_over_rect = game_over_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 - 50))
        restart_rect = restart_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2))
        final_score_rect = final_score_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 + 50))
        menu_rect = menu_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 + 100))
        
        self.screen.blit(game_over_text, game_over_rect)
        self.screen.blit(restart_text, restart_rect)
        self.screen.blit(final_score_text, final_score_rect)
        self.screen.blit(menu_text, menu_rect)

    def draw_pause_menu(self):
        """Draw pause screen with overlay"""
        overlay = pygame.Surface((self.screen.get_width(), self.screen.get_height()))
        overlay.fill((255, 255, 255))
        overlay.set_alpha(160)
        self.screen.blit(overlay, (0, 0))
        
        pause_text = self.font.render("PAUSED", True, BLACK)
        resume_text = self.font.render("P: Resume Game", True, BLACK)
        quit_text = self.font.render("Q: Return to Menu", True, BLACK)
        
        pause_rect = pause_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 - 50))
        resume_rect = resume_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2))
        quit_rect = quit_text.get_rect(center=(self.screen.get_width()//2, self.screen.get_height()//2 + 50))
        
        self.screen.blit(pause_text, pause_rect)
        self.screen.blit(resume_text, resume_rect)
        self.screen.blit(quit_text, quit_rect)

    def draw_game_info(self):
        # Game info background - make it smaller since we only have score now
        info_rect = pygame.Rect(10, 10, 200, 50)
        s = pygame.Surface((info_rect.width, info_rect.height), pygame.SRCALPHA)
        s.fill((0, 0, 0, 128))  # Semi-transparent black
        self.screen.blit(s, (info_rect.x, info_rect.y))
        
        # Draw score with shadow
        score_text = f"Score: {self.score}"
        score_shadow = self.font.render(score_text, True, BLACK)
        score_surface = self.font.render(score_text, True, WHITE)
        
        # Shadow first
        self.screen.blit(score_shadow, (info_rect.x + 12, info_rect.y + 12))
        # Then text
        self.screen.blit(score_surface, (info_rect.x + 10, info_rect.y + 10))

    def game_over(self):
        """Handle game over state"""
        self.is_game_over = True
        # Stop all movement
        self.game_speed = 0
        # Final score calculation
        current_time = pygame.time.get_ticks()
        self.time_score = (current_time - self.start_time) // 1000
        self.score = self.jump_score + self.time_score

    def reset_game(self):
        """Reset the game state for a new game"""
        self.game_speed = INITIAL_GAME_SPEED
        self.score = 0
        self.jump_score = 0
        self.time_score = 0
        self.start_time = pygame.time.get_ticks()
        self.is_game_over = False
        self.is_paused = False
        self.game_started = True  # Start the game immediately on reset
        
        # Reset game objects
        self.sheep.reset()
        self.obstacles = []
        self.eagles = []
        self.clouds = []
        
        # Reset ground pattern
        self.ground_pattern = []
        self.grass_tufts = []
        self.initialize_ground_pattern()

    def check_collision(self, obstacle):
        """Check if sheep collides with an obstacle"""
        if self.sheep.rect.colliderect(obstacle.rect):
            # Play game over sound
            self.sound_manager.play('game_over')
            self.game_over()
            return True
        return False

    def check_eagle_collision(self, eagle):
        """Check if sheep collides with an eagle"""
        # The collision is less forgiving with eagles (smaller hitbox benefit)
        if self.sheep.rect.colliderect(eagle.rect):
            # Play game over sound
            self.sound_manager.play('game_over')
            return True
        return False

    def update_score(self, points):
        """Update score and check for milestones"""
        self.jump_score += points
        old_score = self.score
        self.score = self.jump_score + self.time_score
        
        # Check if we've passed a milestone
        if old_score // 100 < self.score // 100:
            # Play milestone sound for each 100 points
            self.sound_manager.play('milestone')
            
            # Show milestone celebration text
            milestone_text = f"SCORE: {self.score}"
            self.show_score_popup(milestone_text, 
                               self.screen.get_width() // 2, 
                               self.screen.get_height() // 3)
        else:
            # Play regular score sound
            self.sound_manager.play('score')
    
    def show_score_popup(self, text, x, y):
        """Show a colorful score popup at the given position"""
        self.score_popup_text = text
        self.score_popup_pos = (x, y)
        self.score_popup_timer = 60  # Show for 60 frames (1 second at 60fps)
        self.rainbow_color_index = (self.rainbow_color_index + 1) % len(self.rainbow_colors)

    def update_clouds(self):
        """Update cloud positions and generate new ones"""
        # Update existing clouds
        for cloud in self.clouds[:]:
            cloud.update(self.game_speed)
            # Use radius * 3 as an approximation of the cloud's total width
            if cloud.x + cloud.radius * 3 < 0:
                self.clouds.remove(cloud)
        
        # Generate new clouds
        if random.random() < CLOUD_FREQUENCY:
            self.clouds.append(Cloud(self.screen.get_width()))

    def update_obstacles(self):
        """Update obstacles and check collisions"""
        for obstacle in self.obstacles[:]:
            obstacle.update(self.game_speed)
            if obstacle.x + obstacle.width < 0:
                self.obstacles.remove(obstacle)
                # Award points for successfully avoiding an obstacle
                self.update_score(10)
                self.show_score_popup("+10", 
                                   self.screen.get_width()//2,
                                   GROUND_Y - 100)
            elif self.check_collision(obstacle):
                return True
        
        # Generate new obstacles
        if (len(self.obstacles) == 0 or 
                self.obstacles[-1].x < self.screen.get_width() - MIN_OBSTACLE_DISTANCE):
            # Add new obstacle
            self.add_new_obstacle()
            
        return False
        
    def reset_game(self):
        """Reset the game to start a new round"""
        self.game_speed = INITIAL_GAME_SPEED
        self.is_game_over = False
        self.score = 0
        self.jump_score = 0
        self.time_score = 0
        self.start_time = pygame.time.get_ticks()
        self.sheep.reset()
        self.obstacles = []
        self.eagles = []
        
        # Play click sound
        self.sound_manager.play('click')
        
        # Add first obstacle
        self.add_new_obstacle()

    def show_rainbow_text(self, text, x, y):
        """Show rainbow text at the given position"""
        rainbow_text = self.font.render(text, True, (255, 0, 0))  # Red
        self.screen.blit(rainbow_text, (x - rainbow_text.get_width() // 2, y))
