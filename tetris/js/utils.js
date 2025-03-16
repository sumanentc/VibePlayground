/**
 * Utility functions for 2D Tetris
 */

// Check if a position is within the game grid
function isWithinGrid(x, y) {
    return x >= 0 && x < CONFIG.GRID.WIDTH &&
           y >= 0 && y < CONFIG.GRID.HEIGHT;
}

// Check if a position is valid (within grid and not occupied)
function isValidPosition(grid, positions) {
    for (const pos of positions) {
        // Check if out of bounds
        if (!isWithinGrid(pos.x, pos.y)) {
            return false;
        }
        
        // Check if position is already occupied
        if (grid[pos.y] && grid[pos.y][pos.x]) {
            return false;
        }
    }
    
    return true;
}

// Create a 2D grid
function createEmptyGrid() {
    const grid = [];
    
    for (let y = 0; y < CONFIG.GRID.HEIGHT; y++) {
        grid[y] = [];
        
        for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
            grid[y][x] = null;
        }
    }
    
    return grid;
}

// Find completed lines
function findCompletedLines(grid) {
    const completedLines = [];
    
    // Check for completed rows (y-axis)
    for (let y = 0; y < CONFIG.GRID.HEIGHT; y++) {
        let rowComplete = true;
        
        for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
            if (!grid[y][x]) {
                rowComplete = false;
                break;
            }
        }
        
        if (rowComplete) {
            completedLines.push(y);
        }
    }
    
    return completedLines;
}

// Clear completed lines from the grid
function clearLines(grid, completedLines) {
    if (completedLines.length === 0) {
        return 0;
    }
    
    // Sort lines in descending order to remove from bottom to top
    completedLines.sort((a, b) => b - a);
    
    // Remove completed lines
    for (const line of completedLines) {
        grid.splice(line, 1);
    }
    
    // Add new empty lines at the top
    for (let i = 0; i < completedLines.length; i++) {
        const newLine = [];
        for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
            newLine.push(null);
        }
        grid.unshift(newLine);
    }
    
    return completedLines.length;
}

// Calculate score based on lines cleared and level
function calculateScore(linesCleared, level, isTetris = false, isBackToBack = false) {
    if (linesCleared === 0) {
        return 0;
    }
    
    let score = linesCleared * CONFIG.GAME.POINTS_PER_LINE * level;
    
    // Bonus for clearing 4 lines at once (Tetris)
    if (isTetris) {
        score *= CONFIG.GAME.POINTS_MULTIPLIER_TETRIS;
    }
    
    // Bonus for back-to-back Tetris
    if (isBackToBack) {
        score *= CONFIG.GAME.POINTS_MULTIPLIER_BACK_TO_BACK;
    }
    
    return Math.floor(score);
}

// Check if grid is empty (perfect clear)
function isGridEmpty(grid) {
    for (let y = 0; y < CONFIG.GRID.HEIGHT; y++) {
        for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
            if (grid[y][x]) {
                return false;
            }
        }
    }
    return true;
}

// Calculate drop position for a tetromino
function calculateDropPosition(grid, tetromino) {
    let dropY = tetromino.y;
    
    while (!checkCollision(grid, tetromino.x, dropY + 1, tetromino.blocks)) {
        dropY++;
    }
    
    return dropY;
}

// Check if tetromino collides with the grid or boundaries
function checkCollision(grid, x, y, blocks) {
    for (let row = 0; row < blocks.length; row++) {
        for (let col = 0; col < blocks[row].length; col++) {
            if (blocks[row][col]) {
                const newX = x + col;
                const newY = y + row;
                
                // Check if out of bounds
                if (newX < 0 || newX >= CONFIG.GRID.WIDTH || newY >= CONFIG.GRID.HEIGHT) {
                    return true;
                }
                
                // Check if the position in the grid is already filled
                if (newY >= 0 && grid[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Get ghost tetromino (shadow showing where piece will land)
function getGhostTetromino(grid, tetromino) {
    const ghost = JSON.parse(JSON.stringify(tetromino));
    ghost.y = calculateDropPosition(grid, tetromino);
    return ghost;
}

// Random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Serialize state for saving
function serializeGameState(state) {
    return JSON.stringify({
        grid: state.grid,
        level: state.level,
        score: state.score,
        lines: state.lines,
        nextTetromino: state.nextTetromino,
        holdTetromino: state.holdTetromino
    });
}

// Deserialize saved state
function deserializeGameState(serialized) {
    if (!serialized) {
        return null;
    }
    
    try {
        return JSON.parse(serialized);
    } catch (e) {
        console.error('Error deserializing game state:', e);
        return null;
    }
}
