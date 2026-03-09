import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export const interactiveExperiences = [];
const activationDistance = 3.5;

export function createExperienceNode(scene, role, company, description, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 
    
    // Use an Octahedron (Diamond) for variety
    const mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.8),
        new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true })
    );
    group.add(mesh);

    const div = document.createElement('div');
    div.className = 'experience-label'; 
    
    // The text we want to type out
    const fullText = `> ROLE: ${role}\n> COMP: ${company}\n> DESC: ${description}`;

    div.innerHTML = `
        <div class="terminal-header">root@system:~/experience$ ./view.sh</div>
        <div class="terminal-body"></div><span class="cursor-blink">_</span>
    `;
    
    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); 
    group.add(label);
    
    // Add to the passed-in scene
    scene.add(group);

    interactiveExperiences.push({ 
        group, 
        htmlElement: div,
        textBody: div.querySelector('.terminal-body'),
        fullText: fullText,
        wasActive: false,
        typeTimer: null
    });
}

// --- TYPING ANIMATION ENGINE ---
export function startTyping(expData) {
    expData.textBody.innerHTML = '';
    let i = 0;
    const text = expData.fullText;

    function typeChar() {
        if (i < text.length) {
            if (text.charAt(i) === '\n') {
                expData.textBody.innerHTML += '<br/>';
            } else {
                expData.textBody.innerHTML += text.charAt(i);
            }
            i++;
            // Speed is randomized slightly to feel like human typing
            const speed = Math.random() * 30 + 10; 
            expData.typeTimer = setTimeout(typeChar, speed);
        }
    }
    typeChar();
}

export function stopTyping(expData) {
    clearTimeout(expData.typeTimer);
    expData.textBody.innerHTML = ''; // Clear text when walking away
}

// --- PROXIMITY CHECK (Call this in your animation loop) ---
export function checkExperienceProximity(player) {
    interactiveExperiences.forEach(exp => {
        const distance = player.position.distanceTo(exp.group.position);
        
        if (distance < activationDistance) {
            // Fast, chaotic spin when active
            exp.group.children[0].rotation.y += 0.05; 
            exp.group.children[0].rotation.x += 0.02;

            // Trigger typing only ONCE when entering radius
            if (!exp.wasActive) {
                exp.wasActive = true;
                exp.htmlElement.classList.add('visible');
                startTyping(exp);
            }
        } else {
            // Slow idle spin
            exp.group.children[0].rotation.y += 0.01;

            // Stop typing and clear when exiting radius
            if (exp.wasActive) {
                exp.wasActive = false;
                exp.htmlElement.classList.remove('visible');
                stopTyping(exp);
            }
        }
    });
}