/**
 * Scene manager for 3D Tetris
 * Handles Three.js setup, rendering, and camera controls
 */
class SceneManager {
    constructor() {
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.grid = null;
        this.blockGroup = null;
        this.nextPieceScene = null;
        this.nextPieceCamera = null;
        this.nextPieceRenderer = null;
        this.blockMeshes = [];
        this.particleSystem = null;
        
        // Block materials by level
        this.materials = {
            basic: null,
            glass: null,
            neon: null
        };
        
        this.initialize();
    }

    initialize() {
        // Create main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x121212);
        
        // Set up camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );
        this.camera.position.set(
            CONFIG.CAMERA.POSITION.x,
            CONFIG.CAMERA.POSITION.y,
            CONFIG.CAMERA.POSITION.z
        );
        this.camera.lookAt(
            CONFIG.CAMERA.LOOK_AT.x,
            CONFIG.CAMERA.LOOK_AT.y,
            CONFIG.CAMERA.LOOK_AT.z
        );
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').prepend(this.renderer.domElement);
        
        // Create lighting
        this.setupLighting();
        
        // Create game grid
        this.createGrid();
        
        // Create block group to hold all tetromino blocks
        this.blockGroup = new THREE.Group();
        this.scene.add(this.blockGroup);
        
        // Initialize materials
        this.initMaterials();
        
        // Set up next piece preview
        this.setupNextPiecePreview();
        
        // Set up particle system for effects
        this.setupParticleSystem();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            CONFIG.LIGHTS.AMBIENT.color,
            CONFIG.LIGHTS.AMBIENT.intensity
        );
        this.scene.add(ambientLight);
        
        // Directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(
            CONFIG.LIGHTS.DIRECTIONAL.color,
            CONFIG.LIGHTS.DIRECTIONAL.intensity
        );
        directionalLight.position.set(
            CONFIG.LIGHTS.DIRECTIONAL.position.x,
            CONFIG.LIGHTS.DIRECTIONAL.position.y,
            CONFIG.LIGHTS.DIRECTIONAL.position.z
        );
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Point light (for dramatic effect)
        const pointLight = new THREE.PointLight(
            CONFIG.LIGHTS.POINT.color,
            CONFIG.LIGHTS.POINT.intensity,
            CONFIG.LIGHTS.POINT.distance
        );
        pointLight.position.set(
            CONFIG.LIGHTS.POINT.position.x,
            CONFIG.LIGHTS.POINT.position.y,
            CONFIG.LIGHTS.POINT.position.z
        );
        this.scene.add(pointLight);
    }

    createGrid() {
        // Create grid container
        this.grid = new THREE.Group();
        
        // Create grid lines
        const gridMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
        
        // Horizontal grid lines
        for (let y = 0; y <= CONFIG.GRID_HEIGHT; y++) {
            const geometry = new THREE.BufferGeometry();
            const points = [
                new THREE.Vector3(0, y, 0),
                new THREE.Vector3(CONFIG.GRID_WIDTH, y, 0),
                new THREE.Vector3(CONFIG.GRID_WIDTH, y, CONFIG.GRID_DEPTH),
                new THREE.Vector3(0, y, CONFIG.GRID_DEPTH),
                new THREE.Vector3(0, y, 0)
            ];
            geometry.setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            this.grid.add(line);
        }
        
        // Vertical grid lines (width)
        for (let x = 0; x <= CONFIG.GRID_WIDTH; x++) {
            const geometry = new THREE.BufferGeometry();
            const points = [
                new THREE.Vector3(x, 0, 0),
                new THREE.Vector3(x, CONFIG.GRID_HEIGHT, 0),
                new THREE.Vector3(x, CONFIG.GRID_HEIGHT, CONFIG.GRID_DEPTH),
                new THREE.Vector3(x, 0, CONFIG.GRID_DEPTH),
                new THREE.Vector3(x, 0, 0)
            ];
            geometry.setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            this.grid.add(line);
        }
        
        // Vertical grid lines (depth)
        for (let z = 0; z <= CONFIG.GRID_DEPTH; z++) {
            const geometry = new THREE.BufferGeometry();
            const points = [
                new THREE.Vector3(0, 0, z),
                new THREE.Vector3(0, CONFIG.GRID_HEIGHT, z),
                new THREE.Vector3(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT, z),
                new THREE.Vector3(CONFIG.GRID_WIDTH, 0, z),
                new THREE.Vector3(0, 0, z)
            ];
            geometry.setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            this.grid.add(line);
        }
        
        // Create base platform
        const baseGeometry = new THREE.BoxGeometry(CONFIG.GRID_WIDTH, 0.2, CONFIG.GRID_DEPTH);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(CONFIG.GRID_WIDTH / 2, -0.1, CONFIG.GRID_DEPTH / 2);
        base.receiveShadow = true;
        this.grid.add(base);
        
        // Position grid
        this.grid.position.set(0, 0, 0);
        this.scene.add(this.grid);
    }

    initMaterials() {
        // Basic material (levels 1-3)
        this.materials.basic = new THREE.MeshPhongMaterial({
            flatShading: true,
            shininess: 30
        });
        
        // Glass material (levels 4-6)
        this.materials.glass = new THREE.MeshPhysicalMaterial({
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5,
            clearcoat: 1.0
        });
        
        // Neon material (levels 7-10)
        this.materials.neon = new THREE.MeshStandardMaterial({
            emissive: 0xffffff,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
    }

    getMaterialForLevel(level, color) {
        let material;
        
        if (CONFIG.MATERIALS.BASIC.includes(level)) {
            material = this.materials.basic.clone();
        } else if (CONFIG.MATERIALS.GLASS.includes(level)) {
            material = this.materials.glass.clone();
        } else if (CONFIG.MATERIALS.NEON.includes(level)) {
            material = this.materials.neon.clone();
        } else {
            material = this.materials.basic.clone();
        }
        
        material.color = new THREE.Color(color);
        return material;
    }

    setupNextPiecePreview() {
        // Create a separate scene for the next piece preview
        this.nextPieceScene = new THREE.Scene();
        this.nextPieceScene.background = new THREE.Color(0x121212);
        
        // Camera for next piece preview
        this.nextPieceCamera = new THREE.PerspectiveCamera(
            50, 
            1, // Square aspect ratio
            0.1,
            10
        );
        this.nextPieceCamera.position.set(3, 3, 5);
        this.nextPieceCamera.lookAt(0, 0, 0);
        
        // Renderer for next piece preview
        this.nextPieceRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.nextPieceRenderer.setSize(120, 120);
        document.getElementById('next-piece-preview').appendChild(this.nextPieceRenderer.domElement);
        
        // Add lighting to next piece preview
        const previewAmbientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.nextPieceScene.add(previewAmbientLight);
        
        const previewDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        previewDirectionalLight.position.set(5, 5, 5);
        this.nextPieceScene.add(previewDirectionalLight);
    }

    setupParticleSystem() {
        // Create particle system for line clear effects
        const particleCount = CONFIG.PARTICLES.COUNT;
        const particleGeometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            
            // Random colors
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
            
            // Random sizes
            sizes[i] = Math.random() * 
                (CONFIG.PARTICLES.SIZE.max - CONFIG.PARTICLES.SIZE.min) + 
                CONFIG.PARTICLES.SIZE.min;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.particleSystem.visible = false;
        this.scene.add(this.particleSystem);
    }

    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Create a block mesh for a tetromino block
    createBlockMesh(position, color, level) {
        const geometry = new THREE.BoxGeometry(
            CONFIG.BLOCK_SIZE,
            CONFIG.BLOCK_SIZE,
            CONFIG.BLOCK_SIZE
        );
        
        const material = this.getMaterialForLevel(level, color);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
            position.x + CONFIG.BLOCK_SIZE / 2,
            position.y + CONFIG.BLOCK_SIZE / 2,
            position.z + CONFIG.BLOCK_SIZE / 2
        );
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }

    // Render a tetromino in the game
    renderTetromino(tetromino, level, isGhost = false) {
        const positions = tetromino.getAbsolutePositions();
        const meshes = [];
        
        positions.forEach(position => {
            // For ghost pieces, create semi-transparent blocks
            let color = tetromino.color;
            let material;
            
            if (isGhost) {
                material = new THREE.MeshBasicMaterial({
                    color: tetromino.color,
                    transparent: true,
                    opacity: 0.3,
                    wireframe: true
                });
            } else {
                material = this.getMaterialForLevel(level, color);
            }
            
            const geometry = new THREE.BoxGeometry(
                CONFIG.BLOCK_SIZE,
                CONFIG.BLOCK_SIZE,
                CONFIG.BLOCK_SIZE
            );
            
            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.set(
                position.x + CONFIG.BLOCK_SIZE / 2,
                position.y + CONFIG.BLOCK_SIZE / 2,
                position.z + CONFIG.BLOCK_SIZE / 2
            );
            
            mesh.castShadow = !isGhost;
            mesh.receiveShadow = !isGhost;
            
            this.blockGroup.add(mesh);
            meshes.push(mesh);
        });
        
        // Store reference to this tetromino's meshes
        return meshes;
    }

    // Render the next piece in the preview
    renderNextPiece(tetromino, level) {
        // Clear existing preview
        while (this.nextPieceScene.children.length > 2) { // Keep lights
            const object = this.nextPieceScene.children[2];
            this.nextPieceScene.remove(object);
        }
        
        // Create a group for the next piece
        const group = new THREE.Group();
        
        // Add blocks to the group
        tetromino.shape.forEach(block => {
            const geometry = new THREE.BoxGeometry(
                CONFIG.BLOCK_SIZE,
                CONFIG.BLOCK_SIZE,
                CONFIG.BLOCK_SIZE
            );
            
            const material = this.getMaterialForLevel(level, tetromino.color);
            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.set(
                block.x + CONFIG.BLOCK_SIZE / 2,
                block.y + CONFIG.BLOCK_SIZE / 2,
                block.z + CONFIG.BLOCK_SIZE / 2
            );
            
            group.add(mesh);
        });
        
        // Center the group
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        group.position.sub(center);
        
        // Add to preview scene
        this.nextPieceScene.add(group);
    }

    // Clear blocks from the scene
    clearBlocks(positions) {
        if (!positions || positions.length === 0) {
            return;
        }
        
        // Find meshes to remove
        const meshesToRemove = [];
        this.blockGroup.children.forEach(mesh => {
            for (const position of positions) {
                const meshX = Math.floor(mesh.position.x);
                const meshY = Math.floor(mesh.position.y);
                const meshZ = Math.floor(mesh.position.z);
                
                if (meshX === position.x && 
                    meshY === position.y && 
                    meshZ === position.z) {
                    meshesToRemove.push(mesh);
                    break;
                }
            }
        });
        
        // Remove meshes from scene
        meshesToRemove.forEach(mesh => {
            this.blockGroup.remove(mesh);
        });
        
        // Trigger particle effect at cleared positions
        this.createClearEffect(positions);
    }

    // Create particle effect for line clears
    createClearEffect(positions) {
        if (!positions || positions.length === 0) {
            return;
        }
        
        // Calculate center of cleared blocks
        let centerX = 0, centerY = 0, centerZ = 0;
        positions.forEach(pos => {
            centerX += pos.x;
            centerY += pos.y;
            centerZ += pos.z;
        });
        centerX /= positions.length;
        centerY /= positions.length;
        centerZ /= positions.length;
        
        // Update particle positions
        const particlePositions = this.particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
            // Set particle at center of cleared blocks
            particlePositions[i * 3] = centerX;
            particlePositions[i * 3 + 1] = centerY;
            particlePositions[i * 3 + 2] = centerZ;
            
            // Add random velocity (will be applied in animation loop)
            this.particleSystem.userData.velocities = this.particleSystem.userData.velocities || [];
            this.particleSystem.userData.velocities[i] = {
                x: (Math.random() - 0.5) * 0.3,
                y: (Math.random() - 0.5) * 0.3,
                z: (Math.random() - 0.5) * 0.3
            };
        }
        
        // Make particle system visible
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.visible = true;
        
        // Set timeout to hide particles
        setTimeout(() => {
            this.particleSystem.visible = false;
        }, 1000);
    }

    // Update particle positions based on velocities
    updateParticles() {
        if (!this.particleSystem.visible) {
            return;
        }
        
        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.userData.velocities || [];
        
        for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
            if (velocities[i]) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
            }
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Render both the main scene and next piece preview
    render() {
        this.updateParticles();
        this.renderer.render(this.scene, this.camera);
        this.nextPieceRenderer.render(this.nextPieceScene, this.nextPieceCamera);
    }

    // Animate camera rotation to show 3D effect
    animateCamera(time) {
        // Slightly rotate camera around the grid for 3D effect
        const radius = 30;
        const speed = 0.0001;
        
        const x = CONFIG.CAMERA.POSITION.x + Math.sin(time * speed) * 5;
        const z = CONFIG.CAMERA.POSITION.z + Math.cos(time * speed) * 5;
        
        this.camera.position.x = x;
        this.camera.position.z = z;
        this.camera.lookAt(
            CONFIG.GRID_WIDTH / 2,
            CONFIG.GRID_HEIGHT / 2,
            CONFIG.GRID_DEPTH / 2
        );
    }
}

// Create a global scene manager instance
const sceneManager = new SceneManager();
