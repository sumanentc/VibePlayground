/**
 * UI manager for 2D Tetris
 * Handles user interface elements and interactions
 */
class UIManager {
    constructor(gameManagerRef) {
        // Store reference to game manager
        this.gameManager = gameManagerRef;
        
        // UI elements - add null checks
        this.startButton = document.getElementById('start-button');
        this.pauseButton = document.getElementById('pause-button');
        this.muteButton = document.getElementById('mute-button');
        this.restartButton = document.getElementById('restart-sidebar-btn'); 
        this.scoreValue = document.getElementById('score-value');
        this.levelValue = document.getElementById('level-value');
        this.linesValue = document.getElementById('lines-value');
        this.finalScoreValue = document.getElementById('final-score-value');
        this.gameOver = document.getElementById('game-over');
        
        console.log('UIManager: elements found:', {
            startButton: !!this.startButton,
            pauseButton: !!this.pauseButton,
            muteButton: !!this.muteButton,
            restartButton: !!this.restartButton,
            scoreValue: !!this.scoreValue,
            levelValue: !!this.levelValue,
            linesValue: !!this.linesValue,
            finalScoreValue: !!this.finalScoreValue,
            gameOver: !!this.gameOver
        });
        
        // Touch controls (mobile)
        this.touchControls = document.querySelectorAll('.touch-control');
        
        this.isMobile = window.innerWidth <= 768;
        
        this.initialize();
    }

    initialize() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Hide game over screen if it exists
        if (this.gameOver) {
            this.gameOver.classList.add('hidden');
        }
        
        // Check if mobile and show touch controls if needed
        this.checkMobile();
        
        // Listen for window resize
        window.addEventListener('resize', () => this.checkMobile());
    }

    setupEventListeners() {
        // Start button
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        // Pause button
        if (this.pauseButton) {
            this.pauseButton.addEventListener('click', () => {
                this.togglePause();
            });
        }
        
        // Mute button
        if (this.muteButton) {
            this.muteButton.addEventListener('click', () => {
                this.toggleMute();
            });
        }
        
        // Restart button
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        // Start screen button
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                const startScreen = document.getElementById('start-screen');
                const gameCanvas = document.getElementById('game-canvas');
                
                if (startScreen) startScreen.classList.add('hidden');
                if (gameCanvas) gameCanvas.classList.remove('hidden');
                
                this.startGame();
            });
        }
        
        // Game over restart button
        const restartGameBtn = document.getElementById('restart-game-btn');
        if (restartGameBtn) {
            restartGameBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        // Sidebar restart button
        const restartSidebarBtn = document.getElementById('restart-sidebar-btn');
        if (restartSidebarBtn) {
            restartSidebarBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            // Ignore keyboard controls when game is over
            if (this.gameManager.isGameOver) return;
            
            switch (event.key) {
                case 'ArrowLeft':
                    this.gameManager.moveTetromino(-1, 0);
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    this.gameManager.moveTetromino(1, 0);
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    this.gameManager.moveTetromino(0, 1);
                    event.preventDefault();
                    break;
                case 'ArrowUp':
                    this.gameManager.rotateTetromino(1);
                    event.preventDefault();
                    break;
                case 'z':
                case 'Z':
                    this.gameManager.rotateTetromino(-1);
                    event.preventDefault();
                    break;
                case ' ':
                    this.gameManager.hardDrop();
                    event.preventDefault();
                    break;
                case 'c':
                case 'C':
                    this.gameManager.holdPiece();
                    event.preventDefault();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    event.preventDefault();
                    break;
                case 'm':
                case 'M':
                    this.toggleMute();
                    event.preventDefault();
                    break;
            }
        });
    }

    checkMobile() {
        const touchControls = document.querySelector('.touch-controls');
        this.isMobile = window.innerWidth <= 768;
        if (touchControls) {
            if (this.isMobile) {
                touchControls.style.display = 'flex';
            } else {
                touchControls.style.display = 'none';
            }
        }
    }

    startGame() {
        console.log('UIManager.startGame() called');
        // Start or reset game
        if (this.gameManager) {
            this.gameManager.startGame();
            
            // Update UI
            if (this.startButton) {
                this.startButton.textContent = 'Reset';
                
                // Add class for animation
                this.startButton.classList.add('fade-in');
                setTimeout(() => {
                    this.startButton.classList.remove('fade-in');
                }, 500);
            }
            
            if (this.gameOver) {
                this.gameOver.classList.add('hidden');
            }
            
            // Make sure game loop is running
            if (typeof startGameLoop === 'function' && !window.isRunning) {
                console.log('Starting game loop from UI Manager');
                startGameLoop();
            }
        } else {
            console.error('Game manager not available in UIManager');
        }
    }

    restartGame() {
        console.log('UIManager.restartGame() called');
        // Reset game
        if (this.gameManager) {
            this.gameManager.resetGameState();
            this.gameManager.startGame();
            
            // Update UI
            if (this.gameOver) {
                this.gameOver.classList.add('hidden');
            }
            
            // Add class for animation
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                gameArea.classList.add('fade-in');
                setTimeout(() => {
                    gameArea.classList.remove('fade-in');
                }, 500);
            }
        } else {
            console.error('Game manager not available in UIManager');
        }
    }

    togglePause() {
        if (this.gameManager) {
            this.gameManager.togglePause();
            
            // Update button text
            if (this.pauseButton) {
                if (this.gameManager.isPaused) {
                    this.pauseButton.textContent = 'Resume';
                } else {
                    this.pauseButton.textContent = 'Pause';
                }
                
                // Add class for animation
                this.pauseButton.classList.add('pulse');
                setTimeout(() => {
                    this.pauseButton.classList.remove('pulse');
                }, 300);
            }
        }
    }

    toggleMute() {
        if (this.gameManager) {
            this.gameManager.toggleMute();
            
            // Update button text
            if (this.muteButton) {
                if (this.gameManager.isMuted) {
                    this.muteButton.textContent = 'Unmute';
                } else {
                    this.muteButton.textContent = 'Mute';
                }
                
                // Add class for animation
                this.muteButton.classList.add('pulse');
                setTimeout(() => {
                    this.muteButton.classList.remove('pulse');
                }, 300);
            }
        }
    }

    updateScoreDisplay(score) {
        if (this.scoreValue) {
            this.scoreValue.textContent = score;
            // Apply animation for score change
            this.scoreValue.parentElement.classList.add('shake');
            setTimeout(() => {
                this.scoreValue.parentElement.classList.remove('shake');
            }, 500);
        }
    }

    updateLevelDisplay(level) {
        if (this.levelValue) {
            this.levelValue.textContent = level;
            // Apply animation for level up
            this.levelValue.parentElement.classList.add('shake');
            setTimeout(() => {
                this.levelValue.parentElement.classList.remove('shake');
            }, 500);
        }
    }

    updateLinesDisplay(lines) {
        if (this.linesValue) {
            this.linesValue.textContent = lines;
        }
    }

    showGameOver(score) {
        // Show game over screen with animation
        if (this.gameOver) {
            this.gameOver.classList.remove('hidden');
            this.gameOver.classList.add('fade-in');
            this.finalScoreValue.textContent = score;
            
            // Play game over sound
            this.gameManager.playSound('gameOver');
        }
    }
}
