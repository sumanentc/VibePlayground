/**
 * Tetromino definitions and management for 2D Tetris
 */
class Tetromino {
    constructor(type) {
        this.type = type;
        this.color = CONFIG.COLORS[type];
        this.rotation = 0; // 0, 1, 2, 3 (0, 90, 180, 270 degrees)
        
        // Set the shape based on type
        this.shapes = SHAPES[type];
        
        // Get the current rotation of the shape
        this.blocks = this.shapes[this.rotation];
        
        // Position the tetromino in the center horizontally
        const width = this.blocks[0].length;
        this.x = Math.floor((CONFIG.GRID.WIDTH - width) / 2);
        
        // Start position adjusted to show full tetromino
        // Some shapes (like I and T) need blocks to be above the visible grid initially
        // Start at row 0 but adjust shapes that would be truncated
        this.y = -this.getTopEmptyRows(); // This will be negative or 0
    }
    
    /**
     * Count empty rows at the top of the tetromino shape
     * This helps position the tetromino so no blocks are truncated
     */
    getTopEmptyRows() {
        let emptyRows = 0;
        
        // Check each row from the top
        for (let row = 0; row < this.blocks.length; row++) {
            let rowEmpty = true;
            
            // Check if this row has any blocks
            for (let col = 0; col < this.blocks[row].length; col++) {
                if (this.blocks[row][col]) {
                    rowEmpty = false;
                    break;
                }
            }
            
            // If row is empty, increment counter, otherwise stop counting
            if (rowEmpty) {
                emptyRows++;
            } else {
                break;
            }
        }
        
        return emptyRows;
    }
    
    // Get the current shape based on rotation
    getBlocks() {
        return this.shapes[this.rotation];
    }
    
    // Rotate the tetromino (clockwise or counter-clockwise)
    rotate(direction = 1) {
        // Calculate new rotation (0-3)
        const newRotation = (this.rotation + direction + 4) % 4;
        
        // Update rotation
        this.rotation = newRotation;
        
        // Update blocks with new rotation
        this.blocks = this.shapes[this.rotation];
        
        return this.blocks;
    }
    
    // Get wall kick data for rotation
    getKicks(fromRotation, toRotation) {
        // Simple SRS wall kick system
        // Try the standard wall kicks in this order
        return [
            [0, 0],   // Original position (no kick)
            [1, 0],   // Right
            [-1, 0],  // Left
            [0, -1],  // Up
            [1, -1],  // Up-Right
            [-1, -1], // Up-Left
            [0, 2],   // Down 2
            [1, 2],   // Down 2-Right
            [-1, 2]   // Down 2-Left
        ];
    }
    
    // Create a copy of this tetromino (for ghost piece)
    clone() {
        const clone = new Tetromino(this.type);
        clone.rotation = this.rotation;
        clone.x = this.x;
        clone.y = this.y;
        clone.blocks = [...this.blocks];
        return clone;
    }
}

// Tetromino shapes for all rotations (0°, 90°, 180°, 270°)
const SHAPES = {
    // I Tetromino (Cyan) - Long piece
    I: [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],
    
    // O Tetromino (Yellow) - Square piece
    O: [
        [
            [1, 1],
            [1, 1]
        ],
        [
            [1, 1],
            [1, 1]
        ],
        [
            [1, 1],
            [1, 1]
        ],
        [
            [1, 1],
            [1, 1]
        ]
    ],
    
    // T Tetromino (Purple) - T-shaped piece
    T: [
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0]
        ]
    ],
    
    // S Tetromino (Green) - S-shaped piece
    S: [
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1]
        ],
        [
            [0, 0, 0],
            [0, 1, 1],
            [1, 1, 0]
        ],
        [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 0]
        ]
    ],
    
    // Z Tetromino (Red) - Z-shaped piece
    Z: [
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [1, 0, 0]
        ]
    ],
    
    // J Tetromino (Blue) - J-shaped piece
    J: [
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 1]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ]
    ],
    
    // L Tetromino (Orange) - L-shaped piece
    L: [
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0]
        ],
        [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    ]
};

/**
 * Factory function to create a random tetromino
 */
function createRandomTetromino() {
    const types = Object.keys(SHAPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Tetromino(randomType);
}
