import os
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'  # Hide Pygame welcome message

import pygame
from game.game_manager import GameManager
from game.utils.constants import SCREEN_WIDTH, SCREEN_HEIGHT, WHITE

def main():
    # Initialize Pygame
    pygame.init()
    
    # Set up the display with white background
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    screen.fill(WHITE)  # Start with white background
    pygame.display.set_caption("Sheep Jump!")
    pygame.display.flip()  # Show white background immediately
    
    # Create game manager
    game = GameManager(screen)
    
    # Game loop
    clock = pygame.time.Clock()
    running = True
    
    while running:
        # Event handling
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            else:
                game.handle_event(event)
        
        # Update game state
        game.update()
        
        # Draw everything
        game.draw()
        pygame.display.flip()
        
        # Cap the frame rate at 60 FPS
        clock.tick(60)
    
    pygame.quit()

if __name__ == "__main__":
    main()
