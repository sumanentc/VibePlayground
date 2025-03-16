/**
 * 2D Canvas Renderer for Tetris
 * Handles all drawing operations for the game
 */
class Renderer {
    constructor() {
        // Main game canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Next piece preview canvas
        this.nextCanvas = document.getElementById('next-piece-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Hold piece canvas
        this.holdCanvas = document.getElementById('hold-piece-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        
        // Set up canvas sizes
        this.resizeCanvases();
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resizeCanvases());
    }
    
    /**
     * Resize canvases based on container size
     */
    resizeCanvases() {
        // Main canvas
        const container = this.canvas.parentElement;
        
        // Calculate proper width based on the grid size
        const gridWidth = CONFIG.GRID.WIDTH * CONFIG.GRID.BLOCK_SIZE;
        const gridHeight = CONFIG.GRID.HEIGHT * CONFIG.GRID.BLOCK_SIZE;
        
        // Set minimum width to accommodate full grid width
        this.canvas.width = Math.max(gridWidth, container.clientWidth);
        this.canvas.height = Math.max(gridHeight, container.clientHeight);
        
        // Block size based on canvas height
        this.blockSize = CONFIG.GRID.BLOCK_SIZE;
        
        // Next piece canvas
        this.nextCanvas.width = 100;
        this.nextCanvas.height = 100;
        
        // Hold piece canvas
        this.holdCanvas.width = 100;
        this.holdCanvas.height = 100;
    }
    
    /**
     * Clear the main canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Draw the game grid
     */
    drawGrid(grid) {
        const { WIDTH, HEIGHT, BLOCK_SIZE, BORDER_WIDTH } = CONFIG.GRID;
        
        // Draw grid background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, WIDTH * BLOCK_SIZE, HEIGHT * BLOCK_SIZE);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, HEIGHT * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // Draw filled blocks
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const cell = grid[y][x];
                if (cell) {
                    this.drawBlock(x, y, cell, 1);
                }
            }
        }
    }
    
    /**
     * Draw a single block at the specified position
     */
    drawBlock(x, y, color, opacity = 1) {
        const { BLOCK_SIZE, BORDER_WIDTH } = CONFIG.GRID;
        
        // Block coordinates
        const blockX = x * BLOCK_SIZE;
        const blockY = y * BLOCK_SIZE;
        
        // Save context state
        this.ctx.save();
        
        // Set opacity
        this.ctx.globalAlpha = opacity;
        
        // Draw block background
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            blockX + BORDER_WIDTH,
            blockY + BORDER_WIDTH,
            BLOCK_SIZE - BORDER_WIDTH * 2,
            BLOCK_SIZE - BORDER_WIDTH * 2
        );
        
        // Only add 3D effects for blocks below row 2
        if (y > 2) {
            // Draw block highlight (top and left edges)
            this.ctx.fillStyle = this.lightenColor(color, 40);
            this.ctx.beginPath();
            this.ctx.moveTo(blockX + BORDER_WIDTH, blockY + BORDER_WIDTH);
            this.ctx.lineTo(blockX + BLOCK_SIZE - BORDER_WIDTH, blockY + BORDER_WIDTH);
            this.ctx.lineTo(blockX + BLOCK_SIZE - BORDER_WIDTH, blockY + BORDER_WIDTH * 2);
            this.ctx.lineTo(blockX + BORDER_WIDTH * 2, blockY + BORDER_WIDTH * 2);
            this.ctx.lineTo(blockX + BORDER_WIDTH * 2, blockY + BLOCK_SIZE - BORDER_WIDTH);
            this.ctx.lineTo(blockX + BORDER_WIDTH, blockY + BLOCK_SIZE - BORDER_WIDTH);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw block shadow (bottom and right edges)
            this.ctx.fillStyle = this.darkenColor(color, 40);
            this.ctx.beginPath();
            this.ctx.moveTo(blockX + BLOCK_SIZE - BORDER_WIDTH, blockY + BORDER_WIDTH);
            this.ctx.lineTo(blockX + BLOCK_SIZE - BORDER_WIDTH, blockY + BLOCK_SIZE - BORDER_WIDTH);
            this.ctx.lineTo(blockX + BORDER_WIDTH, blockY + BLOCK_SIZE - BORDER_WIDTH);
            this.ctx.lineTo(blockX + BORDER_WIDTH, blockY + BLOCK_SIZE - BORDER_WIDTH * 2);
            this.ctx.lineTo(blockX + BLOCK_SIZE - BORDER_WIDTH * 2, blockY + BLOCK_SIZE - BORDER_WIDTH * 2);
            this.ctx.lineTo(blockX + BLOCK_SIZE - BORDER_WIDTH * 2, blockY + BORDER_WIDTH * 2);
            this.ctx.closePath();
            this.ctx.fill();
        } else {
            // For blocks in top 3 rows, just add a simple border
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                blockX + BORDER_WIDTH,
                blockY + BORDER_WIDTH,
                BLOCK_SIZE - BORDER_WIDTH * 2,
                BLOCK_SIZE - BORDER_WIDTH * 2
            );
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Draw the active tetromino
     */
    drawTetromino(tetromino, ghostY = null) {
        const blocks = tetromino.getBlocks();
        const { x, y, color } = tetromino;
        
        // Draw ghost piece first (if applicable)
        if (ghostY !== null) {
            for (let row = 0; row < blocks.length; row++) {
                for (let col = 0; col < blocks[row].length; col++) {
                    if (blocks[row][col]) {
                        this.drawBlock(x + col, ghostY + row, color, CONFIG.UI.GHOST_OPACITY);
                    }
                }
            }
        }
        
        // Draw active tetromino pieces
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    this.drawBlock(x + col, y + row, color);
                }
            }
        }
    }
    
    /**
     * Draw the next piece preview
     */
    drawNextPiece(tetromino) {
        if (!tetromino) return;
        
        // Clear the canvas
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // Scale for preview
        const scale = this.nextCanvas.width / 5;
        
        // Get tetromino blocks
        const blocks = tetromino.getBlocks();
        
        // Calculate bounds to center the tetromino
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    minX = Math.min(minX, col);
                    maxX = Math.max(maxX, col);
                    minY = Math.min(minY, row);
                    maxY = Math.max(maxY, row);
                }
            }
        }
        
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        
        // Center offset
        const offsetX = (5 - width) / 2 - minX;
        const offsetY = (5 - height) / 2 - minY;
        
        // Draw blocks
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    const posX = (col + offsetX) * scale;
                    const posY = (row + offsetY) * scale;
                    
                    // Draw block
                    this.nextCtx.fillStyle = tetromino.color;
                    this.nextCtx.fillRect(posX + 1, posY + 1, scale - 2, scale - 2);
                    
                    // Draw highlight
                    this.nextCtx.fillStyle = this.lightenColor(tetromino.color, 40);
                    this.nextCtx.beginPath();
                    this.nextCtx.moveTo(posX + 1, posY + 1);
                    this.nextCtx.lineTo(posX + scale - 1, posY + 1);
                    this.nextCtx.lineTo(posX + scale - 3, posY + 3);
                    this.nextCtx.lineTo(posX + 3, posY + 3);
                    this.nextCtx.lineTo(posX + 3, posY + scale - 3);
                    this.nextCtx.lineTo(posX + 1, posY + scale - 1);
                    this.nextCtx.closePath();
                    this.nextCtx.fill();
                    
                    // Draw shadow
                    this.nextCtx.fillStyle = this.darkenColor(tetromino.color, 40);
                    this.nextCtx.beginPath();
                    this.nextCtx.moveTo(posX + scale - 1, posY + 1);
                    this.nextCtx.lineTo(posX + scale - 1, posY + scale - 1);
                    this.nextCtx.lineTo(posX + 1, posY + scale - 1);
                    this.nextCtx.lineTo(posX + 3, posY + scale - 3);
                    this.nextCtx.lineTo(posX + scale - 3, posY + scale - 3);
                    this.nextCtx.lineTo(posX + scale - 3, posY + 3);
                    this.nextCtx.closePath();
                    this.nextCtx.fill();
                }
            }
        }
    }
    
    /**
     * Draw the hold piece
     */
    drawHoldPiece(tetromino) {
        if (!tetromino) {
            // Clear the canvas
            this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
            return;
        }
        
        // Use the same drawing logic as next piece
        // Clear the canvas
        this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        // Scale for preview
        const scale = this.holdCanvas.width / 5;
        
        // Get tetromino blocks
        const blocks = tetromino.getBlocks();
        
        // Calculate bounds to center the tetromino
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    minX = Math.min(minX, col);
                    maxX = Math.max(maxX, col);
                    minY = Math.min(minY, row);
                    maxY = Math.max(maxY, row);
                }
            }
        }
        
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        
        // Center offset
        const offsetX = (5 - width) / 2 - minX;
        const offsetY = (5 - height) / 2 - minY;
        
        // Draw blocks
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    const posX = (col + offsetX) * scale;
                    const posY = (row + offsetY) * scale;
                    
                    // Draw block
                    this.holdCtx.fillStyle = tetromino.color;
                    this.holdCtx.fillRect(posX + 1, posY + 1, scale - 2, scale - 2);
                    
                    // Draw highlight
                    this.holdCtx.fillStyle = this.lightenColor(tetromino.color, 40);
                    this.holdCtx.beginPath();
                    this.holdCtx.moveTo(posX + 1, posY + 1);
                    this.holdCtx.lineTo(posX + scale - 1, posY + 1);
                    this.holdCtx.lineTo(posX + scale - 3, posY + 3);
                    this.holdCtx.lineTo(posX + 3, posY + 3);
                    this.holdCtx.lineTo(posX + 3, posY + scale - 3);
                    this.holdCtx.lineTo(posX + 1, posY + scale - 1);
                    this.holdCtx.closePath();
                    this.holdCtx.fill();
                    
                    // Draw shadow
                    this.holdCtx.fillStyle = this.darkenColor(tetromino.color, 40);
                    this.holdCtx.beginPath();
                    this.holdCtx.moveTo(posX + scale - 1, posY + 1);
                    this.holdCtx.lineTo(posX + scale - 1, posY + scale - 1);
                    this.holdCtx.lineTo(posX + 1, posY + scale - 1);
                    this.holdCtx.lineTo(posX + 3, posY + scale - 3);
                    this.holdCtx.lineTo(posX + scale - 3, posY + scale - 3);
                    this.holdCtx.lineTo(posX + scale - 3, posY + 3);
                    this.holdCtx.closePath();
                    this.holdCtx.fill();
                }
            }
        }
    }
    
    /**
     * Apply screen shake effect
     */
    shakeScreen() {
        document.getElementById('game-container').classList.add('shake');
        setTimeout(() => {
            document.getElementById('game-container').classList.remove('shake');
        }, CONFIG.UI.SHAKE_DURATION);
    }
    
    /**
     * Utility function to lighten a color
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
    
    /**
     * Utility function to darken a color
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
    
    /**
     * Draw particles
     */
    drawParticles(particles) {
        // Set up clipping to prevent rendering outside the grid
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, CONFIG.GRID.WIDTH * CONFIG.GRID.BLOCK_SIZE, CONFIG.GRID.HEIGHT * CONFIG.GRID.BLOCK_SIZE);
        this.ctx.clip();
        
        // Draw all particles
        particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Restore the context
        this.ctx.restore();
        
        // Reset alpha
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Draw the active tetromino with row limiting
     */
    drawActiveTetromino(tetromino, ghostY, minRow, maxRow = Number.MAX_SAFE_INTEGER) {
        const blocks = tetromino.getBlocks();
        const { x, y, color } = tetromino;
        
        // Draw ghost piece first (if applicable)
        if (ghostY !== null && ghostY >= 3) {
            for (let row = 0; row < blocks.length; row++) {
                for (let col = 0; col < blocks[row].length; col++) {
                    if (blocks[row][col]) {
                        const posX = x + col;
                        const posY = ghostY + row;
                        if (posY >= minRow && posY <= maxRow && posY < CONFIG.GRID.HEIGHT) {
                            this.drawBlock(posX, posY, color, CONFIG.UI.GHOST_OPACITY);
                        }
                    }
                }
            }
        }
        
        // Draw active tetromino pieces
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    const posX = x + col;
                    const posY = y + row;
                    if (posY >= minRow && posY <= maxRow && posY < CONFIG.GRID.HEIGHT) {
                        this.drawBlock(posX, posY, color);
                    }
                }
            }
        }
    }
    
    /**
     * Draw only the top rows of a tetromino with absolutely no shadow effects
     */
    drawTopRows(tetromino, ghostY) {
        if (!tetromino) return;
        
        const blocks = tetromino.getBlocks();
        const { x, y, color } = tetromino;
        const { BLOCK_SIZE, BORDER_WIDTH } = CONFIG.GRID;
        
        // Only proceed if the tetromino is in the top rows
        if (y > 2) return;
        
        // Draw active tetromino pieces in top rows using completely flat style
        for (let row = 0; row < blocks.length; row++) {
            for (let col = 0; col < blocks[row].length; col++) {
                if (blocks[row][col]) {
                    const posX = x + col;
                    const posY = y + row;
                    
                    // Only draw blocks in rows 0-2
                    if (posY <= 2 && posY >= 0 && posY < CONFIG.GRID.HEIGHT) {
                        const blockX = posX * BLOCK_SIZE;
                        const blockY = posY * BLOCK_SIZE;
                        
                        // Draw a completely flat block, no 3D effects at all
                        this.ctx.fillStyle = color;
                        this.ctx.fillRect(
                            blockX + BORDER_WIDTH,
                            blockY + BORDER_WIDTH,
                            BLOCK_SIZE - BORDER_WIDTH * 2,
                            BLOCK_SIZE - BORDER_WIDTH * 2
                        );
                    }
                }
            }
        }
        
        // Draw ghost piece in top rows with flat style if needed
        if (ghostY !== null && ghostY <= 2) {
            for (let row = 0; row < blocks.length; row++) {
                for (let col = 0; col < blocks[row].length; col++) {
                    if (blocks[row][col]) {
                        const posX = x + col;
                        const posY = ghostY + row;
                        
                        // Only draw ghost blocks in rows 0-2
                        if (posY <= 2 && posY >= 0 && posY < CONFIG.GRID.HEIGHT) {
                            const blockX = posX * BLOCK_SIZE;
                            const blockY = posY * BLOCK_SIZE;
                            
                            // Draw with opacity but no 3D effects
                            this.ctx.globalAlpha = CONFIG.UI.GHOST_OPACITY;
                            this.ctx.fillStyle = color;
                            this.ctx.fillRect(
                                blockX + BORDER_WIDTH,
                                blockY + BORDER_WIDTH,
                                BLOCK_SIZE - BORDER_WIDTH * 2,
                                BLOCK_SIZE - BORDER_WIDTH * 2
                            );
                            this.ctx.globalAlpha = 1;
                        }
                    }
                }
            }
        }
    }

    /**
     * Render a full game frame
     */
    render(grid, activeTetromino, ghostY, particles) {
        // Clear the canvas
        this.clear();
        
        // Fill with black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw a solid black bar above the grid to hide any shadows
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(
            0,
            -CONFIG.GRID.BLOCK_SIZE * 4,
            CONFIG.GRID.WIDTH * CONFIG.GRID.BLOCK_SIZE,
            CONFIG.GRID.BLOCK_SIZE * 4
        );
        
        // Draw grid background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(
            0,
            0,
            CONFIG.GRID.WIDTH * CONFIG.GRID.BLOCK_SIZE,
            CONFIG.GRID.HEIGHT * CONFIG.GRID.BLOCK_SIZE
        );
        
        // Draw grid lines
        this.drawGridLines();
        
        // Draw the grid blocks
        if (grid) {
            for (let y = 0; y < CONFIG.GRID.HEIGHT; y++) {
                for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
                    const cell = grid[y][x];
                    if (cell) {
                        this.drawBlock(x, y, cell);
                    }
                }
            }
        }
        
        // Draw ghost piece
        if (activeTetromino && ghostY !== null) {
            const blocks = activeTetromino.getBlocks();
            for (let row = 0; row < blocks.length; row++) {
                for (let col = 0; col < blocks[row].length; col++) {
                    if (blocks[row][col]) {
                        this.drawBlock(
                            activeTetromino.x + col,
                            ghostY + row,
                            activeTetromino.color,
                            CONFIG.UI.GHOST_OPACITY
                        );
                    }
                }
            }
        }
        
        // Draw active tetromino
        if (activeTetromino) {
            const blocks = activeTetromino.getBlocks();
            for (let row = 0; row < blocks.length; row++) {
                for (let col = 0; col < blocks[row].length; col++) {
                    if (blocks[row][col]) {
                        this.drawBlock(
                            activeTetromino.x + col,
                            activeTetromino.y + row,
                            activeTetromino.color
                        );
                    }
                }
            }
        }
        
        // Draw particles
        if (particles) {
            this.drawParticles(particles);
        }
    }

    /**
     * Draw grid lines
     */
    drawGridLines() {
        this.ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= CONFIG.GRID.WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CONFIG.GRID.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * CONFIG.GRID.BLOCK_SIZE, CONFIG.GRID.HEIGHT * CONFIG.GRID.BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= CONFIG.GRID.HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CONFIG.GRID.BLOCK_SIZE);
            this.ctx.lineTo(CONFIG.GRID.WIDTH * CONFIG.GRID.BLOCK_SIZE, y * CONFIG.GRID.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }
}
