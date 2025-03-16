/**
 * Particle system for visual effects
 * Creates particle explosions for line clears and other events
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.getElementById('game-container');
    }
    
    /**
     * Create an explosion of particles at the specified position
     * @param {Number} x - X position in pixels
     * @param {Number} y - Y position in pixels
     * @param {String} color - Color of particles
     * @param {Number} count - Number of particles to create
     */
    createExplosion(x, y, color, count = 30) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, color);
        }
    }
    
    /**
     * Create a row explosion (for line clear)
     * @param {Number} rowY - Y position of the row in grid coordinates
     * @param {Array} rowColors - Array of colors in the row
     */
    createRowExplosion(rowY, rowColors) {
        const y = rowY * CONFIG.GRID.BLOCK_SIZE;
        
        // Create 3 particles for each cell in the row
        for (let x = 0; x < CONFIG.GRID.WIDTH; x++) {
            const pixelX = x * CONFIG.GRID.BLOCK_SIZE + CONFIG.GRID.BLOCK_SIZE / 2;
            const color = rowColors[x] || '#ffffff';
            this.createExplosion(pixelX, y, color, 5);
        }
    }
    
    /**
     * Create a single particle
     */
    createParticle(x, y, color) {
        // Create particle element
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 3 and 8 pixels
        const size = Math.random() * 5 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Set position
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Set color
        particle.style.backgroundColor = color;
        
        // Add to container
        this.container.appendChild(particle);
        
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        // Store particle data
        this.particles.push({
            element: particle,
            x, y,
            vx, vy,
            age: 0,
            lifetime: Math.random() * 1000 + 500 // 0.5 to 1.5 seconds
        });
    }
    
    /**
     * Update all particles
     * @param {Number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update each particle
        this.particles.forEach((particle, index) => {
            // Update position based on velocity
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            
            // Apply gravity
            particle.vy += 500 * deltaTime / 1000;
            
            // Apply fade out
            particle.age += deltaTime;
            const opacity = 1 - (particle.age / particle.lifetime);
            
            // Update element
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.opacity = opacity;
        });
        
        // Remove dead particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].age >= this.particles[i].lifetime) {
                this.particles[i].element.remove();
                this.particles.splice(i, 1);
            }
        }
    }
}
