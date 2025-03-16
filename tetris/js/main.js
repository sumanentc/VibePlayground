/**
 * Main entry point for 2D Tetris
 * Initializes game components and starts the game loop
 */
(function() {
    console.log('Main.js loaded and executed');
    
    // Game components - need to be accessible across functions
    window.renderer = null;
    window.audioManager = null;
    window.particleManager = null;
    window.gameManager = null;
    
    // Animation frame ID for cancellation
    let animationFrameId = null;
    let isRunning = false;
    
    // Initialize game
    function initialize() {
        console.log('Game initialization started');
        
        try {
            // Create components in the correct order
            window.renderer = new Renderer();
            console.log('Renderer created');
            
            window.audioManager = new AudioManager();
            console.log('Audio Manager created');
            
            // Check if ParticleManager or ParticleSystem is the correct class name
            if (typeof ParticleSystem === 'function') {
                window.particleManager = new ParticleSystem();
                console.log('Particle System created');
            } else {
                console.warn('No particle system class found');
                window.particleManager = { update: function() {}, particles: [] }; // Dummy object
            }
            
            window.gameManager = new GameManager();
            console.log('Game Manager created');
            
            console.log('All game components initialized successfully');
        } catch (error) {
            console.error('Error initializing game components:', error);
            // Show details of the error for debugging
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
        }
    }
    
    // Start the game
    function startGame() {
        console.log('Start game function called');
        
        if (!window.gameManager) {
            console.error('Game manager not initialized');
            // Try to re-initialize
            initialize();
            
            // Check again
            if (!window.gameManager) {
                console.error('Game components could not be loaded - critical error');
                alert('Game failed to initialize. Please refresh the page.');
                return;
            }
        }
        
        // Start game in the game manager
        window.gameManager.startGame();
        
        // Start the game loop if not already running
        if (!isRunning) {
            startGameLoop();
        }
    }
    
    // Game loop
    function gameLoop() {
        try {
            // Check for critical game state
            if (!window.gameManager) {
                console.error('Game manager not available in game loop');
                isRunning = false;
                return;
            }
            
            // Check if game over
            if (window.gameManager.isGameOver) {
                console.log('Game loop stopping - game over');
                isRunning = false;
                return;
            }
            
            // Check if game is paused - if so, skip updates but continue the loop
            if (window.gameManager.isPaused) {
                // Request next frame while paused - keep loop alive
                animationFrameId = requestAnimationFrame(gameLoop);
                return;
            }
            
            // Update game state with safe checks
            if (typeof window.gameManager.update === 'function') {
                window.gameManager.update(performance.now());
            } else {
                console.error('Game manager update method is not a function');
                isRunning = false;
                return;
            }
            
            // Render with safe checks for all properties
            if (window.renderer && typeof window.renderer.render === 'function') {
                // Check all properties before passing them
                const grid = window.gameManager.grid || [];
                const currentTetromino = window.gameManager.currentTetromino || null;
                const ghostY = window.gameManager.ghostY || 0;
                const particles = window.particleManager && 
                                  window.particleManager.particles ? 
                                  window.particleManager.particles : [];
                
                window.renderer.render(grid, currentTetromino, ghostY, particles);
            } else {
                console.error('Renderer or render method not available');
            }
            
            // Update particles with safe checks
            if (window.particleManager && typeof window.particleManager.update === 'function') {
                window.particleManager.update();
            }
            
            // Request next frame if still running
            if (isRunning) {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        } catch (error) {
            console.error('Error in game loop:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            
            // Try to recover
            isRunning = false;
            
            // Attempt to restart the game loop after a short delay
            setTimeout(() => {
                if (window.gameManager && !window.gameManager.isGameOver) {
                    console.log('Attempting to recover from game loop error...');
                    isRunning = true;
                    animationFrameId = requestAnimationFrame(gameLoop);
                }
            }, 1000);
        }
    }
    
    // Start the game loop
    function startGameLoop() {
        console.log('Starting game loop');
        
        // Stop existing loop if running
        if (isRunning && animationFrameId) {
            console.log('Cancelling existing animation frame');
            cancelAnimationFrame(animationFrameId);
        }
        
        // Reset
        isRunning = true;
        
        // Start new loop
        animationFrameId = requestAnimationFrame(gameLoop);
        
        // Make startGameLoop globally accessible
        window.startGameLoop = startGameLoop;
        window.animationFrameId = animationFrameId;
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM content loaded, initializing game');
        
        // Initialize the game on a slight delay to ensure all scripts are loaded
        setTimeout(function() {
            initialize();
            
            // Set up start button event listener
            const startButton = document.getElementById('start-button');
            if (startButton) {
                startButton.addEventListener('click', startGame);
            }
            
            // Set up start game button event listener
            const startGameButton = document.getElementById('start-game-btn');
            if (startGameButton) {
                startGameButton.addEventListener('click', startGame);
            }
            
            // Set up pause button event listener
            const pauseButton = document.getElementById('pause-button');
            if (pauseButton) {
                console.log('Found pause button, adding event listener');
                pauseButton.addEventListener('click', function() {
                    console.log('Pause button clicked');
                    if (window.gameManager) {
                        window.gameManager.togglePause();
                        
                        // Update button text based on pause state
                        this.textContent = window.gameManager.isPaused ? 'Resume' : 'Pause';
                    } else {
                        console.error('Game manager not available for pause');
                    }
                });
            } else {
                console.warn('Pause button not found');
            }
            
            // Set up mute button event listener
            const muteButton = document.getElementById('mute-button');
            if (muteButton) {
                console.log('Found mute button, adding event listener');
                muteButton.addEventListener('click', function() {
                    console.log('Mute button clicked');
                    if (window.audioManager) {
                        const isMuted = window.audioManager.toggleMute();
                        this.textContent = isMuted ? 'Unmute' : 'Mute';
                    }
                });
            }
            
            // Make start game function globally accessible
            window.startGame = startGame;
        }, 500); // Small delay to ensure all components are loaded
    });
    
    // Add direct event listeners for the restart button
    document.addEventListener('DOMContentLoaded', function() {
        // Set up the restart button with a delay to ensure initialization
        setTimeout(function() {
            // Get the restart button
            const restartButton = document.getElementById('restart-sidebar-btn');
            
            if (restartButton) {
                console.log('Found restart button in main.js, adding event listener');
                
                // Add click event listener
                restartButton.addEventListener('click', function() {
                    console.log('Restart button clicked from main.js');
                    
                    // Access the game manager and restart the game
                    if (window.gameManager) {
                        // Cancel any existing animation frame
                        if (window.animationFrameId) {
                            cancelAnimationFrame(window.animationFrameId);
                        }
                        
                        // Reset game state
                        window.gameManager.resetGameState();
                        
                        // Make sure game is not paused
                        window.gameManager.isPaused = false;
                        
                        // Start a fresh game
                        window.gameManager.startGame();
                        
                        // Start a new game loop
                        isRunning = false;
                        startGameLoop();
                    } else {
                        console.error('Game manager not available');
                    }
                });
            } else {
                console.warn('Restart button not found in main.js');
            }
        }, 800); // Longer delay for restart button to ensure initialization
    });
})();
