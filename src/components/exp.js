import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const interactiveExperiences = [];
const interactiveProjects = []; 
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
        <div class="terminal-header">root@system:~/experiences$ ./view.sh</div>
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


export function createProjectNode(scene, title, description, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const div = document.createElement('div');
    div.className = 'experience-label'; 

    const fullText = `> Project: ${title}\n> Description: ${description}`;

    div.innerHTML = `
        <div class="terminal-header">root@system:~/projects$ ./view.sh</div>
        <div class="terminal-body"></div><span class="cursor-blink">_</span>
    `;
    //<button>View on GitHub</button>
    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); 
    group.add(label);

    scene.add(group);
    interactiveProjects.push({ 
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
        checkProximity(player, exp);
    });
    interactiveProjects.forEach(project => {
        checkProximity(player, project);
    });
}

function checkProximity(player, object) {
        const distance = player.position.distanceTo(object.group.position);
        if (distance < activationDistance) {
            // Fast, chaotic spin when active
            object.group.children[0].rotation.y += 0.05; 
            object.group.children[0].rotation.x += 0.02;

            // Trigger typing only ONCE when entering radius
            if (!object.wasActive) {
                object.wasActive = true;
                object.htmlElement.classList.add('visible');
                startTyping(object);
            }
        } else {
            // Slow idle spin
            object.group.children[0].rotation.y += 0.01;

            // Stop typing and clear when exiting radius
            if (object.wasActive) {
                object.wasActive = false;
                object.htmlElement.classList.remove('visible');
                stopTyping(object);
            }
        }

}