import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export function createLandingNode(scene, name = "Your Name", x = 0, z = 0) {
    const group = new THREE.Group();
    // Position it slightly in front of the starting point (0,0,0)
    group.position.set(x, 0, z); 

    // Create a subtle glowing pedestal for the text to hover over
    // const mesh = new THREE.Mesh(
    //     new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16),
    //     new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.3 })
    // );
    //group.add(mesh);

    // Create the HTML container
    const div = document.createElement('div');
    div.className = 'landing-label'; 
    
    div.innerHTML = `
        
        <div class="controls-instruction" id="controls-box">
            <p class="welcome-text">Welcome to my interactive portfolio.</p>
            <p>Move around and explore:</p>
            <div class="keys-container">
                <div class="key-badge" id="key-w">W</div>
                <div class="key-row">
                    <div class="key-badge" id="key-a">A</div>
                    <div class="key-badge" id="key-s">S</div>
                    <div class="key-badge" id="key-d">D</div>
                </div>
            </div>
        </div>
    `;
    
    const label = new CSS2DObject(div);
    label.position.set(0, 2, 0); 
    group.add(label);
    scene.add(group);

    // --- INTERACTIVE WASD LOGIC ---
    const pressedKeys = new Set();
    const controlsBox = div.querySelector('#controls-box');

    // Listen for key presses to fade out individual letters
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        // Only trigger if it's W, A, S, or D and hasn't been pressed yet
        if (['w', 'a', 's', 'd'].includes(key) && !pressedKeys.has(key)) {
            pressedKeys.add(key);
            
            // Find the specific key element and fade it out
            const keyElement = div.querySelector(`#key-${key}`);
            if (keyElement) {
                keyElement.classList.add('pressed');
            }

            // Gamification: If they pressed all 4, fade out the whole instruction box
            if (pressedKeys.size === 4) {
                setTimeout(() => {
                    controlsBox.style.opacity = '0';
                    controlsBox.style.transform = 'translateY(10px)';
                    // After fade out, remove it from DOM to save space
                    setTimeout(() => controlsBox.remove(), 500);
                }, 400); // Wait a split second after the last key before fading
            }
        }
    });

    // Optional: Make the landing pad spin slowly
    return group; 
}

// Call this in your animation loop if you want the base to spin
export function updateLandingNode(landingGroup) {
    if (landingGroup && landingGroup.children[0]) {
        landingGroup.children[0].rotation.y += 0.005;
    }
}