/**
 * Configuration constants for 2D Tetris
 */
const CONFIG = {
    // Game dimensions
    GRID: {
        WIDTH: 10,      // Width of the grid in blocks
        HEIGHT: 20,     // Height of the grid in blocks
        BLOCK_SIZE: 30, // Size of each block in pixels
        BORDER_WIDTH: 2 // Border width for blocks in pixels
    },
    
    // Game mechanics
    GAME: {
        INITIAL_FALL_SPEED: 1000,       // Initial time between falls in ms
        SOFT_DROP_MULTIPLIER: 0.2,      // Speed multiplier when soft dropping
        POINTS_PER_LINE: 100,           // Base points for clearing a line
        POINTS_MULTIPLIER_TETRIS: 4,    // Multiplier for clearing 4 lines at once
        POINTS_MULTIPLIER_BACK_TO_BACK: 1.5, // Multiplier for back-to-back line clears
        LINES_PER_LEVEL: 10,            // Number of lines to clear to level up
        LEVEL_SPEED_MULTIPLIER: 0.75    // Speed multiplier per level (lower = faster)
    },
    
    // Scoring system
    SCORING: {
        SOFT_DROP: 1,           // Points for each cell of soft drop
        HARD_DROP: 2,           // Points for each cell of hard drop
        SINGLE: 100,            // Points for a single line clear
        DOUBLE: 300,            // Points for a double line clear
        TRIPLE: 500,            // Points for a triple line clear
        TETRIS: 800,            // Points for a tetris (4 lines)
        MINI_TSPIN: 100,        // Points for a mini t-spin
        TSPIN: 400,             // Points for a t-spin
        MINI_TSPIN_SINGLE: 200, // Points for a mini t-spin single
        TSPIN_SINGLE: 800,      // Points for a t-spin single
        TSPIN_DOUBLE: 1200,     // Points for a t-spin double
        TSPIN_TRIPLE: 1600,     // Points for a t-spin triple
        BACK_TO_BACK: 1.5,      // Multiplier for back-to-back line clears
        COMBO: 50               // Points per combo
    },
    
    // UI settings
    UI: {
        GHOST_OPACITY: 0.3,             // Opacity of the ghost piece
        KEY_REPEAT_DELAY: 150,          // Milliseconds before key repeat activates
        KEY_REPEAT_INTERVAL: 50,        // Milliseconds between repeated moves when key is held
        SHAKE_DURATION: 500,            // Duration of screen shake in ms
        ZOOM_DURATION: 300              // Duration of zoom animations in ms
    },
    
    // Tetromino colors (hex values)
    COLORS: {
        I: '#00f0f0', // Cyan
        O: '#f0f000', // Yellow
        T: '#a000f0', // Purple
        S: '#00f000', // Green
        Z: '#f00000', // Red
        J: '#0000f0', // Blue
        L: '#f0a000'  // Orange
    },
    
    // Audio settings
    AUDIO: {
        MASTER_VOLUME: 0.7,
        SOUND_EFFECTS_VOLUME: 0.8,
        MUSIC_VOLUME: 0.5,
        SOUNDS: {
            MOVE: 'move.mp3',
            ROTATE: 'rotate.mp3',
            DROP: 'drop.mp3',
            LINE_CLEAR: 'line_clear.mp3',
            SINGLE_CLEAR: 'single_clear.mp3',
            DOUBLE_CLEAR: 'double_clear.mp3',
            TRIPLE_CLEAR: 'triple_clear.mp3',
            TETRIS: 'tetris.mp3',
            LEVEL_UP: 'level_up.mp3',
            GAME_OVER: 'game_over.mp3',
            LOCK: 'lock.mp3',
            HOLD: 'hold.mp3'
        },
        MUSIC: 'background_music.mp3'
    },
    
    // Level requirements and features
    LEVELS: [
        { level: 1, speed: 1.0, features: ['Basic shapes'] },
        { level: 5, speed: 1.5, features: ['Ghost preview'] },
        { level: 10, speed: 2.0, features: ['Hold piece'] },
        { level: 15, speed: 3.0, features: ['Screen shake'] }
    ]
};

// Export for ES modules
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
