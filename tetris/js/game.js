/**
 * Game manager for 2D Tetris
 * Handles core game logic, state management, and mechanics
 */
class GameManager {
    constructor() {
        // Game grid - 2D array
        this.grid = [];
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = CONFIG.GAME.INITIAL_FALL_SPEED;
        this.lastMoveTime = performance.now();
        this.isPaused = false;
        this.isGameOver = false;
        this.particleManager = null;
        
        // Key timing for properly handling repeats
        this.lastKeyPressTime = 0;
        this.lastKeyRepeatTime = 0;
        
        // Tetromino state
        this.currentTetromino = null;
        this.nextTetromino = null;
        this.holdTetromino = null;
        this.canHold = true;
        this.ghostY = 0;
        
        // Scoring tracking
        this.combo = 0;
        this.backToBackTetris = false;
        
        // Input state - track keys pressed
        this.keys = {
            left: false,
            right: false,
            down: false,
            rotateCW: false,
            rotateCCW: false,
            hardDrop: false,
            hold: false
        };
        
        // Track last time movements occurred
        this.keyboardState = {
            lastMoveTime: {
                left: 0,
                right: 0,
                down: 0
            },
            // Add a flag to track if the initial movement has been made
            initialMoveMade: {
                left: false,
                right: false,
                down: false
            }
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Initialize game
     */
    initialize() {
        // Create empty grid
        this.createEmptyGrid();
        
        // Reset game state
        this.resetGameState();
    }

    /**
     * Create an empty grid
     */
    createEmptyGrid() {
        this.grid = [];
        
        // Create an empty grid filled with nulls
        for (let y = 0; y < CONFIG.GRID.HEIGHT; y++) {
            this.grid[y] = [];
            for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
                this.grid[y][x] = null;
            }
        }
    }

    /**
     * Reset game state
     */
    resetGameState() {
        // Clear the grid
        this.createEmptyGrid();
        
        // Reset scores and game state
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.backToBackTetris = false;
        this.holdTetromino = null;
        this.canHold = true;
        
        // Update game speed based on level
        this.updateGameSpeed();
        
        // Generate completely new tetrominos
        this.nextTetromino = createRandomTetromino();
        this.currentTetromino = createRandomTetromino();
        
        // Ensure tetrominos are at the correct starting position
        if (this.currentTetromino) {
            const width = this.currentTetromino.blocks[0].length;
            this.currentTetromino.x = Math.floor((CONFIG.GRID.WIDTH - width) / 2);
            
            // Determine the appropriate starting y position that doesn't truncate the shape
            // Some shapes need to start with blocks above the visible grid (negative y)
            let topEmptyRows = 0;
            if (typeof this.currentTetromino.getTopEmptyRows === 'function') {
                topEmptyRows = this.currentTetromino.getTopEmptyRows();
            }
            this.currentTetromino.y = -topEmptyRows; // Will be negative or 0
            
            this.currentTetromino.rotation = 0;
        }
        
        // Reset timers to prevent hanging
        this.lastMoveTime = performance.now();
        this.keyboardState.lastMoveTime.left = 0;
        this.keyboardState.lastMoveTime.right = 0;
        this.keyboardState.lastMoveTime.down = 0;
        this.keyboardState.initialMoveMade.left = false;
        this.keyboardState.initialMoveMade.right = false;
        this.keyboardState.initialMoveMade.down = false;
        
        // Update ghost tetromino
        this.updateGhostPosition();
        
        // Update UI
        this.updateUI();
        
        // Ensure renderer is available and update views
        if (typeof renderer !== 'undefined') {
            renderer.drawNextPiece(this.nextTetromino);
            renderer.drawHoldPiece(this.holdTetromino);
            renderer.render(this.grid, this.currentTetromino, this.ghostY);
        }
        
        // Set music state without autoplay (to avoid browser restrictions)
        // User will control music with the dedicated UI buttons
        if (typeof audioManager !== 'undefined') {
            // We no longer auto-start music due to browser restrictions
            // Instead, we just ensure the audio manager is properly initialized
            console.log('Audio manager initialized, music can be controlled via UI');
        }
        
        console.log('Game state reset successfully');
    }

    /**
     * Setup keyboard and touch event listeners
     */
    setupEventListeners() {
        // Wait for DOM to be fully loaded before setting up event listeners
        const setupDOM = () => {
            // Keyboard controls
            document.addEventListener('keydown', (event) => this.handleKeyDown(event));
            document.addEventListener('keyup', (event) => this.handleKeyUp(event));
            
            // Game control buttons - add null checks to prevent errors
            const startButton = document.getElementById('start-button');
            if (startButton) {
                console.log('Found start button, adding event listener');
                startButton.addEventListener('click', () => this.startGame());
            } else {
                console.log('Start button not found in DOM');
            }
            
            const pauseButton = document.getElementById('pause-button');
            if (pauseButton) {
                pauseButton.addEventListener('click', () => this.togglePause());
            } else {
                console.log('Pause button not found in DOM');
            }
            
            const muteButton = document.getElementById('mute-button');
            if (muteButton) {
                muteButton.addEventListener('click', () => this.toggleMute());
            } else {
                console.log('Mute button not found in DOM');
            }
            
            const restartButton = document.getElementById('restart-sidebar-btn'); // Correct ID from HTML
            if (restartButton) {
                restartButton.addEventListener('click', () => this.restartGame());
            } else {
                console.log('Restart button not found in DOM');
            }
        };

        // If DOM is already loaded, set up event listeners immediately
        if (document.readyState === 'complete') {
            setupDOM();
        } else {
            // Otherwise, wait for it to be loaded
            window.addEventListener('load', setupDOM);
        }
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(event) {
        if (this.isPaused || this.isGameOver) {
            // Only handle pause toggle if game is paused
            if (event.key === 'p') {
                this.togglePause();
            }
            return;
        }
        
        // Update the last key press time
        this.lastKeyPressTime = performance.now();
        
        // Only process if this is a new keypress (not a repeat event)
        // This ensures we only move exactly once per key press
        if (event.repeat === false) {
            switch (event.key) {
                case 'ArrowLeft':
                    this.moveTetromino(-1, 0);
                    if (typeof audioManager !== 'undefined') {
                        audioManager.play('move');
                    }
                    break;
                case 'ArrowRight':
                    this.moveTetromino(1, 0);
                    if (typeof audioManager !== 'undefined') {
                        audioManager.play('move');
                    }
                    break;
                case 'ArrowDown':
                    this.moveTetromino(0, 1);
                    if (typeof audioManager !== 'undefined') {
                        audioManager.play('move');
                    }
                    // Add score for soft drop
                    if (CONFIG.SCORING && CONFIG.SCORING.SOFT_DROP) {
                        this.score += CONFIG.SCORING.SOFT_DROP;
                        this.updateUI();
                    }
                    break;
                case 'ArrowUp':
                    this.rotateTetromino(1);
                    break;
                case 'z':
                    this.rotateTetromino(-1);
                    break;
                case ' ':
                    this.hardDrop();
                    break;
                case 'c':
                    this.holdPiece();
                    break;
                case 'p':
                    this.togglePause();
                    break;
            }
        }
        
        // Set key state for repeating keys
        switch (event.key) {
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'ArrowDown':
                this.keys.down = true;
                break;
            case 'ArrowUp':
                this.keys.rotateCW = true;
                break;
            case 'z':
                this.keys.rotateCCW = true;
                break;
            case ' ':
                this.keys.hardDrop = true;
                break;
            case 'c':
                this.keys.hold = true;
                break;
        }
        
        // Prevent default for game keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'z', 'c', 'p'].includes(event.key)) {
            event.preventDefault();
        }
    }

    /**
     * Handle keyup events
     */
    handleKeyUp(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case 'ArrowUp':
                this.keys.rotateCW = false;
                break;
            case 'z':
                this.keys.rotateCCW = false;
                break;
            case ' ':
                this.keys.hardDrop = false;
                break;
            case 'c':
                this.keys.hold = false;
                break;
        }
    }

    /**
     * Start game loop
     */
    startGame() {
        // Reset game state if needed
        if (this.isGameOver) {
            this.resetGameState();
        }
        
        // Cancel any existing game loop
        if (window.animationFrameId) {
            cancelAnimationFrame(window.animationFrameId);
        }
        
        // Reset game loop state
        this.gameLoopRunning = true;
        this.lastMoveTime = performance.now();
        
        // Start a fresh game loop
        if (typeof window.startGameLoop === 'function') {
            window.startGameLoop();
        } else {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
        
        // Set game over to false
        this.isGameOver = false;
        
        // Make sure game canvas is visible
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.classList.remove('hidden');
        }
        
        // Make sure game over screen is hidden
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
        
        console.log('Game started successfully');
    }

    /**
     * Restart the game
     */
    restartGame() {
        console.log('Restarting game...');
        // Hide game over screen if visible
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) {
            gameOverElement.classList.add('hidden');
        }
        
        // Reset game state
        this.resetGameState();
        
        // Make sure game is not paused
        this.isPaused = false;
        
        // Start game
        this.startGame();
        
        // Make sure game canvas is visible
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.classList.remove('hidden');
        }
    }

    /**
     * Toggle game pause state
     */
    togglePause() {
        console.log('GameManager togglePause called, current state:', this.isPaused);
        this.isPaused = !this.isPaused;
        console.log('GameManager togglePause new state:', this.isPaused);
        
        // Visual feedback for pause state
        const pauseOverlay = document.createElement('div');
        
        if (this.isPaused) {
            // Create and show pause overlay
            pauseOverlay.id = 'pause-overlay';
            pauseOverlay.style.position = 'absolute';
            pauseOverlay.style.top = '0';
            pauseOverlay.style.left = '0';
            pauseOverlay.style.width = '100%';
            pauseOverlay.style.height = '100%';
            pauseOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            pauseOverlay.style.color = 'white';
            pauseOverlay.style.display = 'flex';
            pauseOverlay.style.justifyContent = 'center';
            pauseOverlay.style.alignItems = 'center';
            pauseOverlay.style.zIndex = '100';
            pauseOverlay.style.fontSize = '24px';
            pauseOverlay.textContent = 'GAME PAUSED';
            
            // Add to the game container
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.appendChild(pauseOverlay);
            }
            
            // Stop music
            if (typeof audioManager !== 'undefined') {
                audioManager.stopMusic();
            }
        } else {
            // Remove pause overlay if exists
            const existingOverlay = document.getElementById('pause-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Resume music
            if (typeof audioManager !== 'undefined') {
                audioManager.playMusic();
            }
        }
        
        // Update button text
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.textContent = this.isPaused ? 'Resume' : 'Pause';
        }
    }

    /**
     * Toggle sound mute
     */
    toggleMute() {
        if (typeof audioManager !== 'undefined') {
            const isMuted = audioManager.toggleMute();
            document.getElementById('mute-button').textContent = isMuted ? 'Unmute' : 'Mute';
        }
    }

    /**
     * Check if game features are unlocked at current level
     */
    isFeatureUnlocked(featureName) {
        for (const levelData of CONFIG.LEVELS) {
            if (levelData.level <= this.level && levelData.features.includes(featureName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Update game speed based on level
     */
    updateGameSpeed() {
        // Calculate drop interval based on level
        // More aggressive formula to make bricks fall faster at higher levels
        // Use an exponential decrease to make each level significantly faster than the previous
        
        // Option 1: Use a more aggressive exponential decay
        const baseSpeed = CONFIG.GAME.INITIAL_FALL_SPEED;
        const speedFactor = 0.7; // Lower value = faster drop (was 0.8)
        const levelAdjustment = 0.015; // Higher value = more speed increase per level (was 0.007)
        
        // Modified formula with stronger level impact
        this.dropInterval = baseSpeed * Math.pow(speedFactor - ((this.level - 1) * levelAdjustment), this.level - 1);
        
        // Set a minimum interval to prevent it from becoming too fast to play
        const minimumInterval = 100; // Milliseconds
        if (this.dropInterval < minimumInterval) {
            this.dropInterval = minimumInterval;
        }
        
        console.log(`Level ${this.level}: Drop interval set to ${this.dropInterval}ms`);
    }

    /**
     * Get the next tetromino and generate a new one for preview
     */
    getNextTetromino() {
        // Set current tetromino from next
        this.currentTetromino = this.nextTetromino || createRandomTetromino();
        
        // Position the tetromino in the center horizontally
        const width = this.currentTetromino.blocks[0].length;
        this.currentTetromino.x = Math.floor((CONFIG.GRID.WIDTH - width) / 2);
        
        // Determine the appropriate starting y position that doesn't truncate the shape
        // Some shapes need to start with blocks above the visible grid (negative y)
        let topEmptyRows = 0;
        if (typeof this.currentTetromino.getTopEmptyRows === 'function') {
            topEmptyRows = this.currentTetromino.getTopEmptyRows();
        }
        this.currentTetromino.y = -topEmptyRows; // Will be negative or 0
        
        // Set the rotation
        this.currentTetromino.rotation = this.nextTetromino ? this.nextTetromino.rotation : 0;
        
        // Generate new next tetromino
        this.nextTetromino = createRandomTetromino();
        
        // Reset hold ability
        this.canHold = true;
        
        // Update ghost position
        this.updateGhostPosition();
        
        // Check if game over
        if (this.isColliding(this.currentTetromino.x, this.currentTetromino.y, this.currentTetromino.blocks)) {
            this.gameOver();
        }
    }

    /**
     * Update the ghost tetromino position 
     * (shows where the tetromino will land)
     */
    updateGhostPosition() {
        if (!this.currentTetromino) {
            this.ghostY = null;
            return;
        }
        
        // Find the lowest valid position
        let ghostY = this.currentTetromino.y;
        
        // Move down until collision
        while (!this.isColliding(this.currentTetromino.x, ghostY + 1, this.currentTetromino.blocks)) {
            ghostY++;
        }
        
        // Store ghost position
        this.ghostY = ghostY;
    }

    /**
     * Check if tetromino collides with walls or other blocks
     */
    isColliding(x, y, blocks) {
        // If no blocks specified, use current tetromino
        const tetBlocks = blocks || (this.currentTetromino ? this.currentTetromino.blocks : null);
        
        if (!tetBlocks) {
            return false;
        }
        
        for (let row = 0; row < tetBlocks.length; row++) {
            for (let col = 0; col < tetBlocks[row].length; col++) {
                if (tetBlocks[row][col]) {
                    const newY = y + row;
                    const newX = x + col;
                    
                    // Check if outside grid horizontal boundaries
                    if (newX < 0 || newX >= CONFIG.GRID.WIDTH) {
                        return true;
                    }
                    
                    // Check if below grid bottom boundary
                    if (newY >= CONFIG.GRID.HEIGHT) {
                        return true;
                    }
                    
                    // Only check for collisions with blocks in the grid
                    // Skip collision detection for blocks above the grid (newY < 0)
                    if (newY >= 0 && this.grid[newY] && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Check collision (backcompat method that uses the newer isColliding)
     */
    checkCollision(offsetX = 0, offsetY = 0, blocks = null) {
        if (!this.currentTetromino) {
            return true;
        }
        
        const x = this.currentTetromino.x + offsetX;
        const y = this.currentTetromino.y + offsetY;
        const tetBlocks = blocks || this.currentTetromino.blocks;
        
        return this.isColliding(x, y, tetBlocks);
    }

    /**
     * Move the current tetromino
     */
    moveTetromino(dx, dy) {
        if (!this.currentTetromino || this.isPaused || this.isGameOver) return false;
        
        // Check if the move would cause a collision
        if (!this.isColliding(this.currentTetromino.x + dx, this.currentTetromino.y + dy, this.currentTetromino.blocks)) {
            // Update position
            this.currentTetromino.x += dx;
            this.currentTetromino.y += dy;
            
            // Update ghost piece position
            this.updateGhostPosition();
            
            return true;
        } else if (dy > 0) {
            // If moving down and collision occurred, lock the piece
            this.lockTetromino();
        }
        
        return false;
    }

    /**
     * Rotate the current tetromino
     */
    rotateTetromino(direction) {
        if (!this.currentTetromino) {
            return false;
        }
        
        // Play rotation sound
        if (typeof audioManager !== 'undefined') {
            audioManager.play('rotate');
        }
        
        const currentRotation = this.currentTetromino.rotation;
        let nextRotation = (currentRotation + direction + 4) % 4;
        
        // Check if rotation is valid
        if (this.isColliding(this.currentTetromino.x, this.currentTetromino.y, this.currentTetromino.shapes[nextRotation])) {
            // Try wall kicks
            const kicks = this.currentTetromino.getKicks(currentRotation, nextRotation);
            
            let kickSuccess = false;
            
            for (const [kickX, kickY] of kicks) {
                if (!this.isColliding(this.currentTetromino.x + kickX, this.currentTetromino.y + kickY, this.currentTetromino.shapes[nextRotation])) {
                    // Apply kick
                    this.currentTetromino.x += kickX;
                    this.currentTetromino.y += kickY;
                    this.currentTetromino.rotation = nextRotation;
                    this.currentTetromino.blocks = this.currentTetromino.shapes[nextRotation];
                    
                    // Update ghost position
                    this.updateGhostPosition();
                    
                    kickSuccess = true;
                    break;
                }
            }
            
            if (!kickSuccess) {
                return false;
            }
        } else {
            // Standard rotation
            this.currentTetromino.rotation = nextRotation;
            this.currentTetromino.blocks = this.currentTetromino.shapes[nextRotation];
            
            // Update ghost position
            this.updateGhostPosition();
        }
        
        return true;
    }

    /**
     * Hard drop the current tetromino
     */
    hardDrop() {
        console.log("Hard drop triggered"); // Add debugging
        
        if (!this.currentTetromino || this.isPaused || this.isGameOver) {
            console.log("Hard drop aborted - game paused, over, or no tetromino");
            return;
        }
        
        // Move down until collision
        let dropDistance = 0;
        while (!this.isColliding(this.currentTetromino.x, this.currentTetromino.y + 1, this.currentTetromino.blocks)) {
            this.currentTetromino.y += 1;
            dropDistance++;
        }
        
        // Lock the tetromino in place
        this.lockTetromino();
        
        // Play drop sound
        if (typeof audioManager !== 'undefined') {
            audioManager.play('drop');
        }
        
        // Add score for hard drop (2 points per cell dropped)
        if (dropDistance > 0) {
            this.addScore(dropDistance * 2);
        }
    }

    /**
     * Hold the current piece and swap with held piece
     */
    holdPiece() {
        console.log('Hold piece function called');
        
        if (!this.currentTetromino) {
            console.log('Cannot hold: no current tetromino');
            return;
        }
        
        if (!this.canHold) {
            console.log('Cannot hold: already used hold this turn');
            return;
        }
        
        // Play sound
        if (typeof audioManager !== 'undefined') {
            audioManager.play('hold');
        }
        
        console.log('Holding current piece...');
        
        // If no held piece, generate a new one
        if (!this.holdTetromino) {
            console.log('No piece currently in hold, getting next piece');
            // Create a proper new tetromino instead of trying to copy it
            this.holdTetromino = new Tetromino(this.currentTetromino.type);
            // Copy only the relevant properties
            this.holdTetromino.rotation = this.currentTetromino.rotation;
            this.holdTetromino.blocks = this.holdTetromino.shapes[this.holdTetromino.rotation];
            
            this.currentTetromino = this.nextTetromino;
            this.nextTetromino = createRandomTetromino();
        } else {
            console.log('Swapping with currently held piece');
            // Swap current and held pieces
            const temp = this.currentTetromino;
            this.currentTetromino = this.holdTetromino;
            this.holdTetromino = temp;
        }
        
        // Reset position of current tetromino
        this.currentTetromino.x = Math.floor(CONFIG.GRID.WIDTH / 2) - Math.floor(this.currentTetromino.blocks[0].length / 2);
        this.currentTetromino.y = 0; // Start higher to give player more reaction time
        this.currentTetromino.rotation = 0; // Reset rotation
        
        // Make sure blocks is set from shapes based on rotation
        this.currentTetromino.blocks = this.currentTetromino.shapes[this.currentTetromino.rotation];
        
        // Set canHold to false until next piece
        this.canHold = false;
        
        // Update ghost position
        this.updateGhostPosition();
        
        // Update the UI to show the held piece
        if (typeof renderer !== 'undefined') {
            console.log('Updating renderer with hold piece');
            renderer.drawHoldPiece(this.holdTetromino);
        }
        
        console.log('Hold operation completed');
    }

    /**
     * Lock the current tetromino in place
     */
    lockTetromino() {
        if (!this.currentTetromino) return;
        
        const blocks = this.currentTetromino.getBlocks();
        const { x, y, color } = this.currentTetromino;
        
        // Check if game over condition (piece locked above visible grid)
        let topRowOccupied = false;
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    const gridY = y + row;
                    if (gridY < 0) {
                        topRowOccupied = true;
                        break;
                    }
                }
            }
            if (topRowOccupied) break;
        }
        
        if (topRowOccupied) {
            this.gameOver();
            return;
        }
        
        // Add blocks to grid
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    const gridY = y + row;
                    const gridX = x + col;
                    
                    // Only place blocks that are within the grid
                    if (gridY >= 0 && gridY < CONFIG.GRID.HEIGHT && 
                        gridX >= 0 && gridX < CONFIG.GRID.WIDTH) {
                        this.grid[gridY][gridX] = color;
                    }
                }
            }
        }
        
        // Play lock sound
        if (typeof audioManager !== 'undefined') {
            audioManager.play('lock');
        }
        
        // Check for line clears
        this.checkLines();
        
        // Get next tetromino - create a deep copy to ensure it's exactly the same
        const nextType = this.nextTetromino.type;
        this.currentTetromino = new Tetromino(nextType);
        this.currentTetromino.rotation = this.nextTetromino.rotation;
        
        // Generate new next tetromino
        this.nextTetromino = createRandomTetromino();
        
        // Reset hold ability
        this.canHold = true;
        
        // Update ghost position for new tetromino
        this.updateGhostPosition();
        
        // Check if game over - if the newly spawned piece collides immediately
        if (this.isColliding(this.currentTetromino.x, this.currentTetromino.y, this.currentTetromino.blocks)) {
            console.log("Game over detected: new piece cannot be placed");
            this.gameOver();
            return;
        }
        
        // Update UI
        this.updateUI();
        
        // Draw next piece preview
        if (typeof renderer !== 'undefined') {
            renderer.drawNextPiece(this.nextTetromino);
        }
    }

    /**
     * Check for completed lines
     */
    checkLines() {
        let linesCleared = 0;
        let completedLines = [];
        
        // Check every row for completeness
        for (let y = 0; y < CONFIG.GRID.HEIGHT; y++) {
            let complete = true;
            
            // Check if this row is full
            for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
                if (this.grid[y][x] === null) {
                    complete = false;
                    break;
                }
            }
            
            // If row is complete, mark it for removal
            if (complete) {
                completedLines.push(y);
                linesCleared++;
            }
        }
        
        // If we have completed lines
        if (linesCleared > 0) {
            // Play appropriate sound effect based on number of lines cleared
            if (typeof audioManager !== 'undefined') {
                if (linesCleared === 1) {
                    audioManager.play('singleClear');
                } else if (linesCleared === 2) {
                    audioManager.play('doubleClear');
                } else if (linesCleared === 3) {
                    audioManager.play('tripleClear');
                } else if (linesCleared === 4) {
                    audioManager.play('tetris');
                }
            }
            
            // Calculate score for cleared lines
            const points = this.calculateLineClearPoints(linesCleared);
            this.score += points;
            
            // Remove the completed lines
            for (let i = 0; i < completedLines.length; i++) {
                const line = completedLines[i] + i; // Adjust for shift
                this.removeLine(line);
            }
            
            // Update lines cleared count
            this.lines += linesCleared;
            
            // Check level progression
            this.checkLevel();
            
            // Update stats display
            this.updateUI();
            
            return true;
        }
        
        return false;
    }

    /**
     * Calculate points for clearing lines
     */
    calculateLineClearPoints(lines) {
        let pointsPerLine = CONFIG.GAME.POINTS_PER_LINE * this.level;
        let multiplier = 1;
        
        // Tetris (4 lines) gets a special multiplier
        if (lines === 4) {
            multiplier = CONFIG.GAME.POINTS_MULTIPLIER_TETRIS;
            
            // Back-to-back Tetris bonus
            if (this.backToBackTetris) {
                multiplier *= CONFIG.GAME.POINTS_MULTIPLIER_BACK_TO_BACK;
            }
        }
        
        return Math.floor(lines * pointsPerLine * multiplier);
    }

    /**
     * Add points to the score
     */
    addScore(points) {
        this.score += points;
        this.updateUI();
    }

    /**
     * Level up the game
     */
    levelUp() {
        this.level++;
        
        // Update game speed
        this.updateGameSpeed();
        
        // Play level up sound
        if (typeof audioManager !== 'undefined') {
            audioManager.play('levelUp');
        }
        
        // Update UI
        this.updateUI();
    }

    /**
     * End the game
     */
    gameOver() {
        console.log("GAME OVER triggered!");
        
        if (this.isGameOver) {
            console.log("Game already over, ignoring duplicate call");
            return; // Prevent duplicate game over calls
        }
        
        this.isGameOver = true;
        this.gameLoopRunning = false;
        
        // Stop the music
        if (typeof audioManager !== 'undefined') {
            audioManager.stopMusic();
            audioManager.play('gameOver');
        }
        
        // Show game over screen
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');
            console.log("Game over screen displayed");
        } else {
            console.error("Game over screen element not found!");
        }
        
        // Update final score
        const finalScoreElement = document.getElementById('final-score-value');
        if (finalScoreElement) {
            finalScoreElement.textContent = this.score;
        }
        
        console.log(`Game over with final score: ${this.score}`);
    }

    /**
     * Update the UI with current game state
     */
    updateUI() {
        // Update score, level, and lines
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('level-value').textContent = this.level;
        document.getElementById('lines-value').textContent = this.lines;
        
        // Draw next piece
        if (typeof renderer !== 'undefined') {
            renderer.drawNextPiece(this.nextTetromino);
            renderer.drawHoldPiece(this.holdTetromino);
        }
    }

    /**
     * Game loop
     */
    gameLoop(time) {
        // Check if game is over first
        if (this.isGameOver) {
            this.gameLoopRunning = false;
            console.log("Game loop terminated - game over");
            return;
        }
        
        // Update game state
        this.update(time);
        
        // Render
        this.render();
        
        // Request next frame only if game is not over
        if (!this.isGameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    /**
     * Update game state
     */
    update(time) {
        if (this.isPaused || this.isGameOver) {
            return;
        }
        
        // Handle automatic falling
        if (time - this.lastMoveTime >= this.dropInterval) {
            // Try to move the tetromino down
            this.moveTetromino(0, 1);
            this.lastMoveTime = time;
        }
        
        // Handle key repeats only for movement keys with appropriate intervals
        const now = time;
        const KEY_REPEAT_START_DELAY = 300; // Longer initial delay before repeating
        const KEY_REPEAT_INTERVAL = 100;    // Interval between repeats
        
        // Don't repeat keys until after a longer initial delay
        // This helps prevent accidental double movements
        if (now - this.lastKeyPressTime < KEY_REPEAT_START_DELAY) {
            return;
        }
        
        // Only process key repeats at the proper interval
        if (now - this.lastKeyRepeatTime >= KEY_REPEAT_INTERVAL) {
            if (this.keys.left) {
                this.moveTetromino(-1, 0);
            }
            else if (this.keys.right) {
                this.moveTetromino(1, 0);
            }
            
            if (this.keys.down) {
                if (this.moveTetromino(0, 1)) {
                    // Add score for soft drop
                    if (CONFIG.SCORING && CONFIG.SCORING.SOFT_DROP) {
                        this.score += CONFIG.SCORING.SOFT_DROP;
                        this.updateUI();
                    }
                }
            }
            
            this.lastKeyRepeatTime = now;
        }
    }

    /**
     * Handle keyboard input with precise timing
     */
    handleKeyboard(time) {
        const now = time;
        const keyRepeatDelay = CONFIG.UI.KEY_REPEAT_DELAY;
        const keyRepeatInterval = CONFIG.UI.KEY_REPEAT_INTERVAL;
        
        // Hard drop (space bar) - only execute once when key is pressed
        if (this.keys.hardDrop) {
            this.keys.hardDrop = false; // Reset immediately to prevent repeated hard drops
            this.hardDrop();
        }
        
        // Left movement
        if (this.keys.left) {
            if (!this.keyboardState.initialMoveMade.left) {
                // First movement on initial key press
                if (this.moveTetromino(-1, 0)) {
                    if (typeof audioManager !== 'undefined') {
                        audioManager.play('move');
                    }
                }
                this.keyboardState.initialMoveMade.left = true;
                this.keyboardState.lastMoveTime.left = now;
            } else {
                // Handle key repeat with precision
                const timeSinceLastMove = now - this.keyboardState.lastMoveTime.left;
                
                if (timeSinceLastMove >= keyRepeatInterval) {
                    if (this.moveTetromino(-1, 0)) {
                        if (typeof audioManager !== 'undefined') {
                            audioManager.play('move');
                        }
                    }
                    this.keyboardState.lastMoveTime.left = now;
                }
            }
        }
        
        // Right movement
        if (this.keys.right) {
            if (!this.keyboardState.initialMoveMade.right) {
                // First movement on initial key press
                if (this.moveTetromino(1, 0)) {
                    if (typeof audioManager !== 'undefined') {
                        audioManager.play('move');
                    }
                }
                this.keyboardState.initialMoveMade.right = true;
                this.keyboardState.lastMoveTime.right = now;
            } else {
                // Handle key repeat with precision
                const timeSinceLastMove = now - this.keyboardState.lastMoveTime.right;
                
                if (timeSinceLastMove >= keyRepeatInterval) {
                    if (this.moveTetromino(1, 0)) {
                        if (typeof audioManager !== 'undefined') {
                            audioManager.play('move');
                        }
                    }
                    this.keyboardState.lastMoveTime.right = now;
                }
            }
        }
        
        // Down movement (soft drop)
        if (this.keys.down) {
            if (!this.keyboardState.initialMoveMade.down) {
                // First movement on initial key press
                if (this.moveTetromino(0, 1)) {
                    // Add score for soft drop
                    if (CONFIG.SCORING && CONFIG.SCORING.SOFT_DROP) {
                        this.score += CONFIG.SCORING.SOFT_DROP;
                        this.updateUI();
                    }
                    
                    if (typeof audioManager !== 'undefined') {
                        audioManager.play('move');
                    }
                }
                this.keyboardState.initialMoveMade.down = true;
                this.keyboardState.lastMoveTime.down = now;
            } else {
                // Handle key repeat with precision
                const timeSinceLastMove = now - this.keyboardState.lastMoveTime.down;
                
                if (timeSinceLastMove >= keyRepeatInterval) {
                    if (this.moveTetromino(0, 1)) {
                        // Add score for soft drop
                        if (CONFIG.SCORING && CONFIG.SCORING.SOFT_DROP) {
                            this.score += CONFIG.SCORING.SOFT_DROP;
                            this.updateUI();
                        }
                        
                        if (typeof audioManager !== 'undefined') {
                            audioManager.play('move');
                        }
                    }
                    this.keyboardState.lastMoveTime.down = now;
                }
            }
        }
    }

    /**
     * Render the game
     */
    render() {
        if (typeof renderer === 'undefined') {
            return;
        }
        
        // Use the improved renderer that includes shadow prevention
        renderer.render(this.grid, this.currentTetromino, this.ghostY, this.particles);
    }

    /**
     * Remove a completed line and shift all lines above it down
     */
    removeLine(y) {
        // Remove the completed line
        this.grid.splice(y, 1);
        
        // Add a new empty line at the top
        const newRow = new Array(CONFIG.GRID.WIDTH).fill(null);
        this.grid.unshift(newRow);
    }

    /**
     * Calculate points for clearing lines
     */
    calculateLineClearPoints(lines) {
        let pointsPerLine = CONFIG.GAME.POINTS_PER_LINE * this.level;
        let multiplier = 1;
        
        // Tetris (4 lines) gets a special multiplier
        if (lines === 4) {
            multiplier = CONFIG.GAME.POINTS_MULTIPLIER_TETRIS;
            
            // Back-to-back Tetris bonus
            if (this.backToBackTetris) {
                multiplier *= CONFIG.GAME.POINTS_MULTIPLIER_BACK_TO_BACK;
            }
        }
        
        return Math.floor(lines * pointsPerLine * multiplier);
    }

    /**
     * Check if player has reached a new level
     */
    checkLevel() {
        // Calculate new level based on lines cleared
        const newLevel = Math.floor(this.lines / CONFIG.GAME.LINES_PER_LEVEL) + 1;
        
        // If we've reached a new level
        if (newLevel > this.level) {
            const previousLevel = this.level;
            this.level = newLevel;
            
            // Update game speed based on new level
            this.updateGameSpeed();
            
            // Play level up sound
            if (typeof audioManager !== 'undefined') {
                audioManager.play('levelUp');
            }
            
            // Add visual feedback for level up
            this.showLevelUpMessage(previousLevel, newLevel);
        }
    }
    
    /**
     * Show a message when level increases
     */
    showLevelUpMessage(previousLevel, newLevel) {
        // Create level up notification
        const levelUpMsg = document.createElement('div');
        levelUpMsg.className = 'level-up-message';
        levelUpMsg.innerHTML = `<span>LEVEL UP!</span><br>${previousLevel} → ${newLevel}`;
        levelUpMsg.style.position = 'absolute';
        levelUpMsg.style.top = '50%';
        levelUpMsg.style.left = '50%';
        levelUpMsg.style.transform = 'translate(-50%, -50%)';
        levelUpMsg.style.backgroundColor = 'rgba(255, 215, 0, 0.8)';
        levelUpMsg.style.color = '#000';
        levelUpMsg.style.padding = '20px 30px';
        levelUpMsg.style.borderRadius = '10px';
        levelUpMsg.style.fontSize = '24px';
        levelUpMsg.style.fontWeight = 'bold';
        levelUpMsg.style.textAlign = 'center';
        levelUpMsg.style.zIndex = '1000';
        levelUpMsg.style.animation = 'levelUpAnimation 2s ease-out';
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes levelUpAnimation {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Add to the game container - using the correct ID selector
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(levelUpMsg);
            
            // Remove after animation completes
            setTimeout(() => {
                levelUpMsg.remove();
                style.remove();
            }, 2000);
        } else {
            console.error('Game container not found');
        }
        
        // Update level display with highlight effect
        const levelDisplay = document.getElementById('level-value');
        if (levelDisplay) {
            levelDisplay.textContent = newLevel;
            levelDisplay.style.color = '#FFD700'; // Gold color
            levelDisplay.style.transition = 'color 0.5s';
            
            // Reset color after a delay
            setTimeout(() => {
                levelDisplay.style.color = '';
            }, 1500);
        }
        
        // Add a temporary flash effect to the game area
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.style.transition = 'filter 0.3s';
            gameCanvas.style.filter = 'brightness(1.5)';
            
            setTimeout(() => {
                gameCanvas.style.filter = '';
            }, 300);
        }
    }
}
